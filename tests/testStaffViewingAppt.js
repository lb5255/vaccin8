//Code to connect to a database in Node.js


var mysql = require('mysql');

var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "student",
  database: "vaccinationdb"
});

  // con.query("Select * FROM account", function(err, rows, fields) {
  //   if (err) throw err;
  //   console.log(rows[0].example); //Show 1
  // });



//connect statement that selects a Filled appointment for the current date.
//Allows a staff member to view data so they can check in employees.
con.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");
  con.query("Select * FROM appointment WHERE apptStatus = 'O' AND apptDate = CURDATE() ", function (err, result, fields) {
  if (err) throw err;
    console.log(result);
  });
});

