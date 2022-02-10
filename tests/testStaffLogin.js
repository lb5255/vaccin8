// Mike Haboian
//Test to verify credentials for staff to login

var mysql = require('mysql2');
var bcrypt = require('bcrypt');

var saltRounds = 12;

var con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "student",
    database: "vaccinationdb"
});

//variables for testing
var uname = 'TestNurse03';
var pword = 'HashThis';


con.execute('SELECT username, password FROM account WHERE username = ?', [uname],
    function(err, results, fields) {
        if (err) throw err;
        var passwordFromDB = results[0].password;
        console.log("Password from Database: " + passwordFromDB);
        //Checks the user entered password against the one from the db. Returns true or false
        bcrypt.compare(pword, passwordFromDB, function(err,result) { 
            if (err) throw err;
            if (result) {
                console.log("The password is valid.");
            }
            else {
                console.log("Invalid password.");
            }
        }); //End of bcrypt.hash callback
}); //End of con.execute callback





