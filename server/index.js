
const path = require("path");
const express = require("express");
const bodyParser = require("body-parser");
const crypto = require("crypto");
const bcrypt = require("bcrypt");
const cookieParser = require('cookie-parser');
const dateFormat = require("./dateFormat.js");


const admin = "Admin";
const nurse = "Nurse";
const staff = "Staff";
const sitemgr = "Site Manager";

// load the database
const connProm = require("./load-db.js");
const { query } = require("express");

const app = express();
const encodedParser = bodyParser.urlencoded({ extended: false});
const convertDate = require("./dateFormat.js");


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
} // End of authMiddleware

const handleErrors = func => async (req, res) => {
    try{
        const r = func(req, res);
        if(r?.then instanceof Function) { // promise interface
            await r;
        }
    } catch(err) {
        console.warn("Error in request handling:", err);
        res.status(500).send("Internal server error");
    }
}


//Login
//Takes a JSON string with username, password, and position.
app.get("/api/login", encodedParser, handleErrors(async (req, res) => {
    const conn = await connProm;
    //console.log(req.body); //username password, and position come in from user.

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
})); //end of login api call




//Recipient APIs 
//Gets the campaign name
app.get("/api/campaignName", handleErrors(async (req, res) => {
    const conn = await connProm;
    const [result, _fields] = await conn.execute(
        "SELECT campaignName from campaign WHERE campaignStatus = 'a';"
    );
    // only one result is expected
    res.json(result[0]);
}));

//respond with GET request for all available vaccines.
//This can also be used when nurse is scheduling a follow up appointment
app.get("/api/vaccineList", handleErrors(async (req, res) => {
    
    const conn = await connProm;
    const [result, _fields] = await conn.execute(
        "SELECT DISTINCT campaignVaccID, vaccineType, manufacturer, vaccineDose FROM campaignvaccines WHERE campaignID IN (SELECT campaignID FROM campaign WHERE campaignStatus = 'a');"
    );
    res.json(result);
}));

// api call for available timeslots at an active campaign
// This can also be used when nurse is scheduling a follow up appointment
app.get("/api/recipient/vaccineAppts", handleErrors(async (req, res) => {
    const conn = await connProm;
    const [result, _fields] = await conn.execute(
        "SELECT appointmentID, appointment.locationID, location.locationName, location.locationCity, location.locationState, location.locationZip, location.locationAddr, apptDate, apptTime FROM appointment INNER JOIN campaignlocation ON appointment.locationID = campaignlocation.locationID INNER JOIN location ON campaignlocation.locationID = location.locationID WHERE apptStatus = 'O' AND apptDate > (NOW() + INTERVAL 1 DAY);"
    );
    res.json(result);
}));

//api call to put user info into patient table and to update the timeslot they selected.
app.post("/api/recipient/vaccineAppts", encodedParser, handleErrors(async (req, res) => {
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
        const [result] = await connection.execute(
            "INSERT INTO patient(firstName,lastName,dateOfBirth,sex,race,email,phone,city,state,address,zip,insuranceProvider,insuranceNum) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);",
            [req.body.fName, req.body.lName, req.body.dob, req.body.sex, req.body.race, req.body.email, req.body.phone, req.body.city, req.body.state, req.body.address, req.body.zip, req.body.insuranceProvider, req.body.insuranceNum]
        );
        //2rd query, update the chosen timeslot with patient info.
        await connection.execute(
            "UPDATE appointment SET campaignVaccID = ?, patientID = ?, apptStatus = 'F', perferredContact = 'Email' WHERE appointmentID = ?;",
            [req.body.campaignVaccID, result.insertId, req.body.appointmentID]
        );
        await connection.commit();//Commit the changes
        res.send("");
    } 
    catch(e) {
        console.log("An error has occurred with this transaction.", e);
        await connection.rollback(); //roll back the changes
        res.status(500).send("Internal server error")
    }
    finally {
        if (connection) connection.release(); 
    }
})); //End of app.post




//Front desk staff api calls

//api call to get Locations that the user is active at. Takes accountID of user as a query parameter.
app.get("/api/staff/activeLocations", encodedParser, authMiddleware(staff), handleErrors(async (req, res) => {
    const conn = await connProm;
    const [result, _fields] = await conn.execute(
        "SELECT acctlocation.accountID, acctlocation.locationID, location.locationName FROM acctLocation JOIN location ON acctlocation.locationID = location.locationID WHERE accountID = ?;",
        [req.body.accountID]
    );
    res.json(result);
}));

//api call to get appointment info for a date range (Start date, end date) at the locationID they picked when they selected their location.
//Takes the locationID they selected, and their entered start and end date as query parameters.
app.get("/api/staff/appointments", encodedParser, authMiddleware(staff), handleErrors(async (req, res) => {
    const conn = await connProm;
    
    //Convert MM/DD/YYYY to YYYY-MM-DD for Mysql
    const startDate = dateFormat.mysqlFormat(req.body.startDate);
    const endDate = dateFormat.mysqlFormat(req.body.endDate);

    const [result, _fields] = await conn.execute(
        "SELECT appointment.appointmentID, location.locationName, campaignVaccines.vaccineType, campaignVaccines.vaccineDose, campaignVaccines.manufacturer, patient.firstName, patient.lastName, patient.dateOfBirth, patient.insuranceNum, patient.address,patient.phone,patient.city,patient.state,patient.zip,patient.email, apptDate, apptTime FROM appointment INNER JOIN patient on appointment.patientID = patient.patientID INNER JOIN campaignVaccines on appointment.campaignVaccID = campaignVaccines.campaignVaccID INNER JOIN campaignlocation on appointment.locationID = campaignlocation.locationID INNER JOIN location on campaignlocation.locationID = location.locationID WHERE appointment.locationID = ? AND appointment.campaignID IN ( SELECT campaignID FROM campaign WHERE campaignStatus = 'a') AND apptDate BETWEEN ? AND ? AND apptStatus = 'F';",
        [req.body.locationID, startDate, endDate]
    );
    res.json(result);
}));

//api call to check in a patient, takes appointmentID as a query parameter
app.put("/api/staff/appointment/check", encodedParser, authMiddleware(staff), handleErrors(async (req, res) => {
    const conn = await connProm;
    const [result, _fields] = await conn.execute(
        "UPDATE appointment SET apptStatus = 'A' WHERE appointmentID = ?;",
        [req.body.appointmentID]
    );
    return res.send("Successfully checked in patient.");
}));

//api call to cancel a patient's appointment
//Takes the appointmentID as a query parameter
app.put("/api/staff/appointment/cancel", encodedParser, authMiddleware(staff), handleErrors(async (req, res) => {
    const conn = await connProm;
    const [result, _fields] = await conn.execute(
        "UPDATE appointment SET apptStatus = 'X' WHERE appointmentID = ?;",
        [req.body.appointmentID]
    );
    return res.send("Successfully cancelled appointment.");
}));

//Nurse api calls


//api call to search for a patient by firstName, lastName, and date of birth
//Takes the entered firstName, lastName, and date of birth as query parameters.
app.get("/api/nurse/searchPatient", encodedParser, authMiddleware(nurse), handleErrors(async (req,res) =>{
    const conn = await connProm;

    //Format mm/dd/yyyy to yyyy-mm-dd for mysql
    const dob = convertDate.mysqlFormat(req.body.dob);
    console.log(dob);
    const [result, _fields] = await conn.execute(
        "SELECT patientID, firstName, lastName, dateOfBirth, address, city, state, zip, phone, email FROM patient WHERE firstName = ? AND lastName = ? and dateOfBirth = ?;",
        [req.body.firstName, req.body.lastName, dob]
    );
    return res.json(result);
}));

//api call to look up an appointment by patientID.
//Takes patientID as a query paramter.
app.get("/api/nurse/appointments", encodedParser, authMiddleware(nurse), handleErrors(async (req, res) => {
    const conn = await connProm;
    const [result, _fields] = await conn.execute(
        "SELECT appointment.appointmentID, campaignVaccines.vaccineType, campaignVaccines.vaccineDose, campaignVaccines.manufacturer, patient.firstName, patient.lastName, patient.dateOfBirth, patient.insuranceNum, patient.address,patient.phone,patient.city,patient.state,patient.zip,patient.email, apptDate, apptTime FROM appointment INNER JOIN patient on appointment.patientID = patient.patientID INNER JOIN campaignVaccines on appointment.campaignVaccID = campaignVaccines.campaignVaccID INNER JOIN campaignlocation on appointment.locationID = campaignlocation.locationID INNER JOIN location on campaignlocation.locationID = location.locationID WHERE patient.patientID = ? AND apptStatus = 'F';",
        [req.body.appointmentID]
    );
    return res.json(result);
}));

//api call to record a recipient has recieved their vaccine dose
//Takes batch number entered by nurse, the currently logged in staff member's ID, and appointment ID selected in previous query. 
app.put("/api/nurse/appointments", encodedParser, authMiddleware(nurse), handleErrors(async(req, res) => {
    const conn = await connProm;
    const [result, _fields] = await conn.execute(
        "UPDATE appointment SET batchNum = ?, vaccDatestamp = NOW(), apptStatus = 'C', staffMember = ? WHERE appointmentID = ?;",
        [req.body.batchNum, req.body.accountID, req.body.appointmentID]
    )
    return res.send("");
}));

//Can re-use "/api/recipient/vaccineAppts" endpoint for available timeslots at an active campaign
//Can re-use "/api/vaccineList" endpoint for selecting a vaccine.

//api call for a nurse to schedule a follow up appointment
//Patient ID recieved from previous query.
app.put("/api/nurse/nextAppointment", encodedParser, authMiddleware(nurse), handleErrors(async(req, res) => {
    const conn = await connProm;
    const [result, _fields] = await conn.execute(
        "UPDATE appointment SET campaignVaccID = ?, patientID = ?, apptStatus = 'F', perferredContact = 'Email' WHERE appointmentID = ?;",
        [req.body.campaignVaccID,req.body.patientID, req.body.appointmentID]

    );
    res.send("");
}));

app.get("/api/admin/accounts", encodedParser, authMiddleware(admin), async(req, res) => {
    const conn = await connProm;
    try {
        const [result, _fields] = await conn.execute(
            "select * from account;"
        );
        return res.json(result);
    }
    catch (e) {
        return res.status(500).send("Internal server error");
    }

});

app.get("/api/admin/accounts/search", encodedParser, authMiddleware(admin), async(req, res) => {
    const conn = await connProm;
    try {
        const [result, _fields] = await conn.execute(
            "select * from account where firstName = ? AND LastName = ?;",
            [req.body.firstName, req.body.lastName]
        );
        return res.json(result);
    }
    catch (e) {
        return res.status(500).send("Internal server error");
    }
});


//Admin API calls


//api call to add a new vaccine to vaccine table.
app.post("/api/admin/vaccines", encodedParser, authMiddleware(admin), handleErrors(async (req,res) => {
    const conn = await connProm;
    // console.log(req.body);
    const [result, _fields] = await conn.execute(
        "INSERT INTO vaccine(vaccineType, manufacturer) VALUES (?,?);", [req.body.vaccineType, req.body.manufacturer]
    );
    res.status(200).send("Inserted into vaccine table!");
}));




//Site Manager API calls



app.listen(8080, () => console.log("Listening on port 8080"));


