// exports a promise that resolves to a connection pool

const fs = require("fs");
const path = require("path");
const mysql = require("mysql2");

// configuration for connecting to mysql
// configuration through environment variables:
/** @type {mysql.ConnectionOptions|mysql.PoolOptions} */
const config = {
	database: process.env.DBDATABASE || "db",
	user: process.env.DBUSER || "user",
	password: process.env.DBPASS || "password",
	host: process.env.DBHOST || "localhost",
};

// a promise that waits a specified amount of milliseconds
const wait = ms => new Promise(r => setTimeout(r, ms));

// waits for the database to be ready, and loadas the table definitions if necessary
// this is a self-executing async function
// async functions return promises, and you can use `await` inside them
// so module.exports is a promise you can `await`
module.exports = (async () => {
	let conn;
	
	const tempConfig = {
		...config,
		multipleStatements: true, // we may need to load an sql file that contains a bunch of statements
	}
	
	console.info("Waiting for database connection...");
	// wait until a connection can be made
	while(true) {
		conn = mysql.createConnection(tempConfig).promise();
		try {
			await conn.connect();
			// if the connection succeeded
			break;
		} catch(err) {
			// clean up
			conn.destroy();
			// wait half a second before trying again
			await wait(1000);
		}
	}
	console.info("Connected to database successfully!");
	
	// check if the "vaccine" table exists, and load the ddl if necessary
	const [rows, _fields] = await conn.execute("SHOW TABLES LIKE 'vaccine'");
	
	if(!rows.length) {
		// the table doesn't exist, ddl needs to be loaded
		console.info("Creating database tables...");
		// fetch it from the file
		const ddl = await fs.promises.readFile(path.join(__dirname, "vacc_db.sql"));
		// run the ddl
		await conn.query(ddl.toString());
		
		console.info("Database tables created!");
	} else {
		console.info("Database already contains tables!");
	}
	await conn.end();
	
	return mysql.createPool(config).promise();
})()
