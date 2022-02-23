
const path = require("path");
const express = require("express");
const bodyParser = require("body-parser");
const crypto = require("crypto");
const bcrypt = require("bcrypt");
const cookieParser = require('cookie-parser')


const admin = "Admin";
const nurse = "Nurse";
const staff = "Staff";
const sitemgr = "Site Manager";

// load the database
const connProm = require("./load-db.js");
const { query } = require("express");

const app = express();
const encodedParser = bodyParser.urlencoded({ extended: false});


// statically serve the client on /
app.use("/", express.static(path.join(__dirname, "..", "client")));
app.use(express.json());
app.use(cookieParser());

//Authentication code
const authMiddleware = function(role){ return async (req, res, next) => {
    const conn = await connProm;
    try {
        if (!req.cookies.token) {
            return res.status(401).send("Unauthorized.");
        }
        else {
            //Query to get userID and their role
            const [result, _fields] = await conn.execute(
                "SELECT session.accountID, account.position FROM session JOIN account ON session.accountID = account.accountID WHERE sessionInfo = ?", [req.cookies.token]
            );

            req.userID = result[0].accountID;
            req.position = result[0].position;
            //console.log(result);
        }
        if(!req.userID) {
            return res.status(401).send("Unauthorized");
        }
        //Checks the position (Admin/Staff/Nurse/Site Manager) against the one sent in
        else if(req.position != role) {
            return res.status(401).send("Unauthorized");
        }
        
        
        next(); //forwards to the api that was called

    }   
    catch (e) {
        return res.status(500).send("Internal server error");
    }

    }  
}


app.get("/api/campaignName", async (req, res) => {
    const conn = await connProm;
    const [result, _fields] = await conn.execute(
        "SELECT campaignName from campaign WHERE campaignStatus = 'a';"
    );
    // only one result is expected
    res.json(result[0]);
});

app.get("/api/vaccineList", async (req, res) => {
    //respond with GET request for all available vaccines.
    const conn = await connProm;
    const [result, _fields] = await conn.execute(
        "SELECT DISTINCT campaignVaccID, vaccineType, manufacturer, vaccineDose FROM campaignvaccines WHERE campaignID IN (SELECT campaignID FROM campaign WHERE campaignStatus = 'a');"
    );
    res.json(result);
});

// api call for available timeslots at an active campaign
app.get("/api/recipient/vaccineAppts", async (req, res) => {
    const conn = await connProm;
    const [result, _fields] = await conn.execute(
        "SELECT appointmentID, appointment.locationID, location.locationName ,apptDate, apptTime FROM appointment INNER JOIN campaignLocation ON appointment.locationID = campaignLocation.locationID INNER JOIN location ON campaignLocation.locationID = location.locationID WHERE apptStatus = 'O' AND apptDate > (NOW() + INTERVAL 1 DAY);"
    );
    res.json(result);
});

//api call to put user info into patient table and to update the timeslot they selected.
app.post("/api/recipient/vaccineAppts", encodedParser, async (req, res) => {
    const conn = await connProm;
    const connection = await conn.getConnection(); //Need to get a new connection in order for a transaction to work.
    //req.body.<input> gets info on each field.
    // console.log("recieved data!");
    // console.log(req.body);
    
    //query for entering user info into patient table based on what they entered, and also schedules them for their selected timeslot.
    //Patient info matches the information they filled in.
    //CampaignVaccID is from the selected vaccine type they chose,
    //appointmentID is from the appointment timeslot that they selected
    //Tested
    try {
        await connection.beginTransaction();
        //first query, insert patient data into patient table
        await connection.execute(
            "INSERT INTO patient(firstName,lastName,dateOfBirth,sex,race,email,phone,city,state,address,zip,insuranceProvider,insuranceNum) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);",
            [req.body.fName, req.body.lName, req.body.dob, req.body.sex, req.body.race, req.body.email, req.body.phone, req.body.city, req.body.state, req.body.address, req.body.zip, req.body.insuranceProvider, req.body.insuranceNum]
        );
        //2nd query, get the auto-incremented patientID to be used in 3rd query.
        await connection.execute(
            "SET @id = @@IDENTITY;"
        );
        //3rd query, update the chosen timeslot with patient info.
        await connection.execute(
            "UPDATE appointment SET campaignVaccID = ?, patientID = @id, apptStatus = 'F', perferredContact = 'Email' WHERE appointmentID = ?;",
            [req.body.campaignVaccID, req.body.appointmentID]
        );
        await connection.commit();//Commit the changes
    } 
    catch(e) {
        console.log("An error has occurred with this transaction.", e);
        await connection.rollback(); //roll back the changes
    }
    finally {
        if (connection) connection.release(); 
    }

    
}); //End of app.post


//Login
app.get("/api/login", encodedParser, async (req, res) => {
    const conn = await connProm;
    //console.log(req.body); //username and password come in from user.

    //get user info from db
    const [result, _fields] = await conn.execute(
        'SELECT username, password, accountID FROM account WHERE username = ? AND position = ?', [req.body.username, req.body.position]
        );
    //console.log(result[0].password); //gets the password
    //If the user does not exist i.e 0 rows returned
    if (!result.length) {
        return res.status(401).send("Invalid login.");
    }
    else {
        //Compare hashed user-entered password with the one in the db
        
        const flag = await new Promise((res, rej) => 
            bcrypt.compare(req.body.password, result[0].password, (err,
                flag) => err ? rej(err) : res(flag))
        );
        //If it matches
        if (flag) {
            console.log("The password is valid.");
            //create random string
            const token = await new Promise((res, rej) =>
                crypto.randomBytes(128, (err, bytes) =>
                    err ? rej(err) : res(bytes.toString("base64"))
                )
            );
            console.log("Token: ",token);
            //store string in db alongside the accountID
            const [result2, _fields2] = await conn.execute(
                'INSERT INTO session(sessionInfo, accountID) VALUES (?,?)', [token, result[0].accountID]
            );
            //create a cookie with the random string inside.
            res.cookie("token", token, {
                    secure: false,  //Will need to be set to true when deployed
                    httpOnly: true,
                });
            //return successful login                
            return res.status(200).send("Login successful.");
        }
        //If it doesn't match
        else {
            return res.status(401).send("Invalid login.");
        }


    }
}); //end of login api call



//api call to add a new vaccine to vaccine table.
app.post("/api/admin/vaccines", encodedParser, authMiddleware(admin), async (req,res) => {
    const conn = await connProm;
    // console.log(req.body);
    try {
        await conn.execute(
            "INSERT INTO vaccine(vaccineType, manufacturer) VALUES (?,?);", [req.body.vaccineType, req.body.manufacturer]
        );
        res.status(200).send("Inserted into vaccine table!");
    }
    catch (e) {
        return res.status(500).send("Internal server error");
    }
});



 


app.listen(8080, () => console.log("Listening on port 8080"));


