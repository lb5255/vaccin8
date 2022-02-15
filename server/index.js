const path = require("path");
const express = require("express");
const mysql = require("mysql2");

var con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "student",
    database: "vaccinationdb"
});


// load the database
require("./load-db.js");

const app = express();

// statically serve the client on /
app.use("/", express.static(path.join(__dirname, "..", "client")));
app.use(express.json());

app.get("/user",(req, res) => {
    //respond with GET request for all available vaccines.
    con.connect(function(err) {
        if (err) throw err;
        con.query("SELECT DISTINCT vaccineType, manufacturer FROM campaignvaccines WHERE campaignID IN (SELECT campaignID FROM campaign WHERE campaignStatus = 'a');",
        function (err, result, fields) {
            if (err) throw err;
            console.log(result);
        });

    });

});




app.listen(8080, () => console.log("Listening on port 8080"));
