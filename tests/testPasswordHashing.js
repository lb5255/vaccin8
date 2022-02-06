//Mike Haboian
//Test to hash a password and insert it into the db.

var mysql = require('mysql2');
var bcrypt = require('bcrypt');
var saltRounds = 12;

var con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "student",
    database: "vaccinationdb"
});

var uname = 'TestNurse03';
var pword = 'HashThis';


//Hash a password and compare it. 
    bcrypt.hash(pword, saltRounds, function(err,hash) {
        if (err) throw err;
        console.log(hash); //Print out the hashed password

        con.connect(function(err) {
            if (err) throw err;
            con.query("INSERT INTO account (username, password) VALUES (?, ?);", [uname, hash],
                function (err, result, fields) {
                    if (err) throw err;
                        console.log(result);
                });
        });
    });




  
