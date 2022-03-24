
const path = require("path");
const express = require("express");
const bodyParser = require("body-parser");
const crypto = require("crypto");
const bcrypt = require("bcrypt");
const cookieParser = require('cookie-parser');
const dateFormat = require("./dateFormat.js");
const saltRounds = 12;

const admin = "Admin";
const nurse = "Nurse";
const staff = "Staff";
const sitemgr = "Site Manager";

// const emailBuilder = require("./emailBuilder.js");
// const apptConfirm = "Vaccine Appointment Confirmation";





// load the database
const connProm = require("./load-db.js");

const app = express();
const encodedParser = bodyParser.urlencoded({ extended: false});
const convertDate = require("./dateFormat.js");
const email = require("./email.js");


// statically serve the client on /
app.use("/", express.static(path.join(__dirname, "..", "client")));
app.use(express.json());
app.use(cookieParser());




//Authentication code
const authMiddleware = function(role = []){
    if(!Array.isArray(role)) {
        role = [role];
    }
    
    return async (req, res, next) => {
        const conn = await connProm;
        try {
            if (!req.cookies.token) {
                return res.status(401).send("Unauthorized.");
            }
            else {
                //Query to get userID and their role
                const [result, _fields] = await conn.execute(
                    "SELECT session.accountID, account.position, account.username FROM session JOIN account ON session.accountID = account.accountID WHERE sessionInfo = ?", [req.cookies.token]
                );
                
                req.userID = result[0].accountID;
                req.position = result[0].position;
                req.username = result[0].username;
                //console.log(result);
            }
            if(!req.userID) {
                return res.status(401).send("Unauthorized");
            }
            //Checks the position (Admin/Staff/Nurse/Site Manager) against the one sent in
            else if(!role.includes(req.position)) {
                return res.status(401).send("Unauthorized");
            }
            
            
            next(); //forwards to the api that was called

        }   
        catch (e) {
            return res.status(500).send("Internal server error");
        }

    }
} // End of authMiddleware

/**
 * @param {(req: express.Request, res: express.Response) => void} func
 */
const handleErrors = func => async (req, res) => {
    try{
        const r = func(req, res);
        if(r && r.then instanceof Function) { // promise interface
            await r;
        }
    } catch(err) {
        console.warn("Error in request handling:", err);
        res.status(500).send("Internal server error");
    }
}

const params = p => p.map(n => n === undefined ? null : n)

//Login
//Takes a JSON string with username, password, and position.
app.post("/api/login", encodedParser, handleErrors(async (req, res) => {
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

// gives the user their username, if they're authenticated
app.get("/api/whoami", authMiddleware([admin, staff, nurse, sitemgr]), handleErrors(async (req, res) => {
    res.json({ username: req.username });
}))


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
app.post("/api/recipient/vaccineAppts", encodedParser, async (req, res) => {
    const conn = await connProm;
    

    const connection = await conn.getConnection(); //Need to get a new connection in order for a transaction to work.
    //req.body.<input> gets info on each field.
    //query for entering user info into patient table based on what they entered, and also schedules them for their selected timeslot.
    //Patient info matches the information they filled in.
    //CampaignVaccID is from the selected vaccine type they chose,
    //appointmentID is from the appointment timeslot that they selected
    try {
        await connection.beginTransaction();
        //first query, insert patient data into patient table
        var dob = convertDate.mysqlFormat(req.body.dob); //Convert date to mysql format

        const [result] = await connection.execute(
            "INSERT INTO patient(firstName,lastName,dateOfBirth,email,phone,city,state,address,zip,insuranceProvider,insuranceNum) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);",
            params([req.body.fName, req.body.lName, dob, req.body.email, req.body.phone, req.body.city, req.body.state, req.body.address, req.body.zip, req.body.insuranceProvider, req.body.insuranceNum])
        );
        //2nd query, update the chosen timeslot with patient info.
        await connection.execute(
            "UPDATE appointment SET campaignVaccID = ?, patientID = ?, apptStatus = 'F', perferredContact = 'Email' WHERE appointmentID = ?;",
            params([req.body.campaignVaccID, result.insertId, req.body.appointmentID])
        );
        //Probably gonna need another query here to get information to be used in email.


        await connection.commit();//Commit the changes

        //Send confirmation email
        // if (req.body.email != null) {
        //     //Build Email message
        //     var apptMessage = await emailBuilder.buildConfAppt("Test","Test","Test");
        //     //Send email
        //     const email = require("./email.js");
        //     email.main(req.body.email, apptConfirm, apptMessage);
        // }
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
}); //End of app.post


//Api call to cancel their appointment, and putting it back into the available list of vaccines.
//Takes in the appointmentID they selected
app.delete("/api/recipient/vaccineAppts", encodedParser, handleErrors(async (req, res) => {
    const conn = await connProm;
    const [result] = await conn.execute(
        "UPDATE appointment SET campaignVaccID = NULL, patientID = NULL, apptStatus = 'O', perferredContact = NULL WHERE appointmentID = ?",
        [req.body.appointmentID]
    );
    return res.send("Removed appointment.");
}));




//Front desk staff api calls

//api call to get Locations that the user is active at.
app.get("/api/staff/activeLocations", encodedParser, authMiddleware(staff), handleErrors(async (req, res) => {
    const conn = await connProm;
    const [result, _fields] = await conn.execute(
        "SELECT acctlocation.accountID, acctlocation.locationID, location.locationName FROM acctlocation JOIN location ON acctlocation.locationID = location.locationID WHERE accountID = ?;",
        params([req.userID])
    );
    res.json(result);
}));

//api call to get appointment info for a date range (Start date, end date) at the locationID they picked when they selected their location.
//Takes the locationID they selected, and their entered start and end date as query parameters.
app.get("/api/staff/appointments", encodedParser, authMiddleware(staff), handleErrors(async (req, res) => {
    const conn = await connProm;
    
    //Date range is in YYYY-MM-DD format when it's sent back
    //const startDate = dateFormat.mysqlFormat(req.body.startDate);
    //const endDate = dateFormat.mysqlFormat(req.body.endDate);

    const [result, _fields] = await conn.execute(
        `SELECT appointment.appointmentID, location.locationName, campaignvaccines.vaccineType, campaignvaccines.vaccineDose, campaignvaccines.manufacturer, patient.firstName, patient.lastName, patient.dateOfBirth, patient.insuranceNum, patient.address,patient.phone,patient.city,patient.state,patient.zip,patient.email, apptDate, apptTime
        FROM appointment
        INNER JOIN patient on appointment.patientID = patient.patientID
        INNER JOIN campaignvaccines on appointment.campaignVaccID = campaignvaccines.campaignVaccID
        INNER JOIN campaignlocation on appointment.locationID = campaignlocation.locationID
        INNER JOIN location on campaignlocation.locationID = location.locationID
        WHERE appointment.locationID = ?
        AND appointment.campaignID IN ( SELECT campaignID FROM campaign WHERE campaignStatus = 'a') AND apptDate BETWEEN ? AND ? AND apptStatus = 'F';`,
        params([req.query.locationID, req.query.startDate, req.query.endDate])
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


//API call to update the chosen timeslot with patient info. Takes in campaignVaccID, patientID, and appointmentID
app.put("/api/staff/appointment", encodedParser, authMiddleware(staff), handleErrors(async(req,res) => {
    const conn = await connProm;
    const [result, _fields] = await connection.execute(
        "UPDATE appointment SET campaignVaccID = ?, patientID = ?, apptStatus = 'F', perferredContact = 'Email' WHERE appointmentID = ?;",
        [req.body.campaignVaccID, req.body.patientID, req.body.appointmentID]
    );
}));



//Nurse api calls


//api call to search for a patient by firstName, lastName, and date of birth
//Takes the entered firstName, lastName, and date of birth as query parameters.
app.get("/api/nurse/searchPatient", encodedParser, authMiddleware(nurse), handleErrors(async (req,res) => {
    const conn = await connProm;

    //Format mm/dd/yyyy to yyyy-mm-dd for mysql
    //const dob = convertDate.mysqlFormat(req.body.dob);
    //console.log(dob);
    const [result, _fields] = await conn.execute(
        "SELECT patientID, firstName, lastName, dateOfBirth, address, city, state, zip, phone, email, insuranceProvider, insuranceNum FROM patient WHERE firstName = ? AND lastName = ? and dateOfBirth = ?;",
        params([req.query.firstName, req.query.lastName, req.query.dob])
    );
    return res.json(result);
}));

//api call to look up an appointment by patientID.
//Takes patientID as a query paramter.
app.get("/api/nurse/appointments", encodedParser, authMiddleware(nurse), handleErrors(async (req, res) => {
    const conn = await connProm;
    const [result, _fields] = await conn.execute(
        "SELECT appointment.appointmentID, appointment.campaignVaccID, campaignvaccines.vaccineType, campaignvaccines.vaccineDose, campaignvaccines.manufacturer, patient.firstName, patient.lastName, patient.dateOfBirth, patient.insuranceNum, patient.address,patient.phone,patient.city,patient.state,patient.zip,patient.email, apptDate, apptTime FROM appointment INNER JOIN patient on appointment.patientID = patient.patientID INNER JOIN campaignvaccines on appointment.campaignVaccID = campaignvaccines.campaignVaccID INNER JOIN campaignlocation on appointment.locationID = campaignlocation.locationID INNER JOIN location on campaignlocation.locationID = location.locationID WHERE patient.patientID = ? AND apptStatus = 'F';",
        params([req.query.patientID])
    );
    return res.json(result);
}));

//api call to record a recipient has recieved their vaccine dose
//Takes batch number entered by nurse and appointment ID selected in previous query. 
app.put("/api/nurse/appointments", encodedParser, authMiddleware(nurse), handleErrors(async(req, res) => {
    const conn = await connProm;
    await conn.execute(
        "UPDATE appointment SET batchNum = ?, vaccDatestamp = NOW(), apptStatus = 'C', staffMember = ?, campaignVaccID = ? WHERE appointmentID = ?;",
        [req.body.batchNum, req.userID, req.body.vaccineID, req.body.appointmentID]
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



//Admin API calls

//api call to get all accounts

app.get("/api/admin/accounts", encodedParser, authMiddleware(admin), handleErrors(async(req, res) => {
    const conn = await connProm;
    const [result, _fields] = await conn.execute(
        "select accountID, username, firstName, lastName, position, email, phone from account;"
    );
    return res.json(result);
}));

//api call to get all accounts by searching first/last name.
app.get("/api/admin/accounts/search", encodedParser, authMiddleware(admin), handleErrors(async(req, res) => {
    const conn = await connProm;
    const [result, _fields] = await conn.execute(
        "select accountID, username, firstName, lastName, position, email, phone from account where firstName = ? AND LastName = ?;",
        params([req.query.firstName, req.query.lastName])
    );
    return res.json(result);
}));


//api call to add an account
app.post("/api/admin/accounts", encodedParser, authMiddleware(admin), handleErrors(async(req, res) => {
    const conn = await connProm;
    //Hash the entered password.
    const hashedPassword = await new Promise((res, rej) => {
        bcrypt.hash(req.body.password, saltRounds, (err,
            result) => err ? rej(err) : res(result))
    });
    const [result, _fields] = await conn.execute(
        "INSERT INTO account(username, password, firstName, lastName, position, email, phone) VALUES (?,?,?,?,?,?,?);",
        [req.body.username, hashedPassword, req.body.firstName, req.body.lastName, req.body.position, req.body.email, req.body.phone]
    );
    res.json({
        accountID: result.insertId
    });

}));

//api call to remove an account
app.delete("/api/admin/accounts", encodedParser, authMiddleware(admin), handleErrors(async(req,res) => {
    const conn = await connProm;
    const [result, _fields] = await conn.execute(
        "DELETE FROM account WHERE accountID = ?", [req.body.accountID]
    );
    res.send("Deleted account.");
}));

//api call to edit an account (Except password)
app.put("/api/admin/accounts", encodedParser, authMiddleware(admin), handleErrors(async(req,res) => {
    const conn = await connProm;
    const [result, _fields] = await conn.execute(
        "UPDATE account SET username = ?, firstName = ?, lastName = ?, position = ?, email = ?, phone = ? WHERE accountID = ?",
        [req.body.username, req.body.firstName, req.body.lastName, req.body.position, req.body.email, req.body.phone, req.body.accountID]
    );
    res.send("Updated account information.");
})); 


//api call to get all vaccines in the system. 
app.get("/api/admin/vaccines", encodedParser, authMiddleware(admin), handleErrors(async (req,res) => {
    const conn = await connProm;
    const [result, _fields] = await conn.execute(
        "SELECT vaccineType, manufacturer FROM vaccine;"
    );
    return res.json(result);
}));


//api call to add a new vaccine to vaccine table.
app.post("/api/admin/vaccines", encodedParser, authMiddleware(admin), handleErrors(async (req,res) => {
    const conn = await connProm;
    const [result, _fields] = await conn.execute(
        "INSERT INTO vaccine(vaccineType, manufacturer) VALUES (?,?);", [req.body.vaccineType, req.body.manufacturer]
    );
    res.status(200).send("Inserted new vaccine.");
}));



//api call to delete a vaccine
app.delete("/api/admin/vaccines", encodedParser, authMiddleware(admin), handleErrors(async (req,res) => {
    const conn = await connProm;
    const [result, _fields] = await conn.execute(
        "DELETE FROM vaccine WHERE vaccineType = ? AND manufacturer = ?;", [req.body.vaccineType, req.body.manufacturer]
    );
    res.send("Deleted vaccine.");
}));

//api call to add a vaccine to a campaign
app.post("/api/admin/campaign/vaccines", encodedParser, authMiddleware(admin), handleErrors(async (req,res) => {
    const conn = await connProm;
    const [result, _fields] = await conn.execute(
        "INSERT INTO campaignvaccines (vaccineType, manufacturer, vaccineDose, daysBetweenDoses, ageGroup, doseAmount) VALUES (?,?,?,?,?,?);", 
        [req.body.vaccineType, req.body.manufacturer, req.body.vaccineDose, req.body.daysBetweenDoses, req.body.ageGroup, req.body.doseAmount]
    );
    res.send("Added vaccine to campaign.");
}));


//api call to remove a vaccine from a campaign
app.delete("/api/admin/campaign/vaccines", encodedParser, authMiddleware(admin), handleErrors(async (req,res) => {
    const conn = await connProm;
    const [result, _fields] = await conn.execute(
        "DELETE FROM campaignvaccines WHERE campaignVaccID = ?;", 
        [req.body.campaignVaccID]
    );
    res.send("Removed vaccine from campaign.");
}));


//api call to get all locations.
app.get("/api/admin/locations", encodedParser, authMiddleware(admin), handleErrors(async (req, res) => {
    const conn = await connProm;
    const [result, _fields] = await conn.execute(
        "SELECT * from location;"
    );
    res.json(result);
}));

//api call to add a location
app.post("/api/admin/locations", encodedParser, authMiddleware(admin), handleErrors(async (req, res) => {
    const conn = await connProm;
    const [result, _fields] = await conn.execute(
        "INSERT INTO location (locationName, locationCity, locationState, locationAddr, locationZip) VALUES (?,?,?,?,?);",
        [req.body.locationName, req.body.locationCity, req.body.locationState, req.body.locationAddr, req.body.locationZip]
    );
    res.send("Entered new location.");
}));

//api call to edit a location
app.put("/api/admin/locations", encodedParser, authMiddleware(admin), handleErrors(async (req, res) => {
    const conn = await connProm;
    const [result, _fields] = await conn.execute(
        "UPDATE location SET locationName = ?, locationCity = ?, locationState = ?, locationAddr = ?, locationZip = ? WHERE locationID = ?;",
        [req.body.locationName, req.body.locationCity, req.body.locationState, req.body.locationAddr, req.body.locationZip, req.body.locationID]
    );
    res.send("Updated location information.");
}));

//api call to remove a location
app.delete("/api/admin/locations", encodedParser, authMiddleware(admin), handleErrors(async (req, res) => {
    const conn = await connProm;
    const [result, _fields] = await conn.execute(
        "DELETE FROM location WHERE locationID = ?;",
        [req.body.locationID]
    );
    return res.send("Deleted location.");
}));

//api call to get all locations at the currently active campaign
app.get("/api/admin/campaign/locations", encodedParser, authMiddleware(admin), handleErrors(async (req, res) => {
    const conn = await connProm;
    const [result, _fields] = await conn.execute(
        "SELECT * from campaignlocation JOIN location ON location.locationID = campaignlocation.locationID INNER JOIN campaign ON campaignlocation.campaignID = campaign.campaignID WHERE campaignStatus = 'a';"
    );
    res.json(result);
}));

//api call to add a location to a campaign
app.post("/api/admin/campaign/locations", encodedParser, authMiddleware(admin), handleErrors(async (req, res) => {
    const conn = await connProm;
    const [result, _fields] = await conn.execute(
        "INSERT INTO campaignlocation (locationID, campaignID, status) VALUES (?,?,'Active');",
        [req.body.locationID,req.body.campaignID]
    );
    return res.send("Added location to a campaign.");
}));

//api call to remove a location from a campaign, takes the location and the campaign IDs.
app.delete("/api/admin/campaign/locations", encodedParser, authMiddleware(admin), handleErrors(async (req, res) => {
    const conn = await connProm;
    const [result, _fields] = await conn.execute(
        "DELETE FROM campaignlocation WHERE campaignID = ? AND locationID = ?",
        [req.body.locationID,req.body.campaignID]
    );
    return res.send("Deleted location from a campaign.");
}));





//Site Manager API calls


//api call to get all sites they are a site manager at, takes in the user's account ID
app.get("/api/sitemgr/activeLocations", encodedParser, authMiddleware(sitemgr), handleErrors(async (req, res) => {
    const conn = await connProm;
    const [result, _fields] = await conn.execute(
        "SELECT acctlocation.accountID, acctlocation.locationID, location.locationName FROM acctLocation JOIN location ON acctlocation.locationID = location.locationID WHERE accountID = ?;",
        [req.query.accountID]
    );
    return res.json(result);
}));


//api call to get open timeslots at the selected location, takes in locationID
app.get("/api/sitemgr/locations/timeslots", encodedParser, authMiddleware(sitemgr), handleErrors(async (req, res) => {
    const conn = await connProm;
    const [result, _fields] = await conn.execute(
        "appointment.appointmentID, location.locationName, appointment.apptTime, appointment.apptDate, appointment.apptStatus FROM appointment JOIN campaignlocation ON appointment.locationID = campaignlocation.locationID JOIN location ON campaignlocation.locationID = location.locationID WHERE appointment.locationID = ? AND apptDate >= CURDATE()",
        [req.query.locationID]
    );
    return res.json(result);
}));


//api call to add a timeslot(Or multiple of the same timeslot). Takes in the locationID, campaignID,
//apptDate, apptTime, apptStatus, and the count of appointments they want to add (count).

app.post("/api/sitemgr/locations/timeslots", encodedParser, authMiddleware(sitemgr), handleErrors(async (req, res) => {
    const conn = await connProm;
    const connection = await conn.getConnection();
    //Transaction to add one or more timeslots. 
    try {
        await connection.beginTransaction();

        //This query executes for as many times entered by the user.
        for (var i = 0; i < req.body.count; i++) {
            await conn.execute(
                "INSERT INTO appointment (locationID, campaignID, apptDate, apptTime, apptStatus) VALUES (?,?,?,?,'O');",
                [req.body.locationID,req.body.campaignID,req.body.apptDate,req.body.apptTime]
            );
        }
    }
    catch(e) {
        console.log("An error has occurred with this transaction.", e);
        await connection.rollback();
        res.status(500).send("Internal server error");
    }
    finally {
        if (connection) connection.release();
        return res.send("Added timeslot(s).");
    }

}));

//api call to remove a timeslot. Gets the appointmentID of the timeslot.
app.delete("/api/sitemgr/locations/timeslots", encodedParser, authMiddleware(sitemgr), handleErrors(async (req, res) => {
    const conn = await connProm;
    const [result, _fields] = await conn.execute(
        "DELETE FROM appointment WHERE appointmentID = ?;",
        [req.body.appointmentID]
    );
    return res.send("Deleted timeslot.");
}));


//TODO
//api call to search staff and nurse accounts by id 
app.get("/api/sitemgr/accounts", encodedParser, authMiddleware(sitemgr), handleErrors(async (req, res) => {
    const conn = await connProm;
    const [result, _fields] = await conn.execute(
        "SELECT accountID, username, firstName, lastName, position, email, phone FROM account WHERE position = 'Nurse' OR position = 'Staff';",
    );



}));

//api call to assign an account to be active at a location.
//Takes in the location ID, and campaign ID.
app.post("/api/sitemgr/locations/accounts", encodedParser, authMiddleware([admin, sitemgr]), handleErrors(async (req, res) => {
    const conn = await connProm; 
    const connection = await conn.getConnection();
    try {
        //Check if the selected account is in the acctlocation table.
        const [result, _fields] = await conn.execute(
            "SELECT * FROM acctlocation WHERE accountID = ? AND locationID = ?",
            [req.body.accountID, req.body.locationID]
        ); 
        //If the account doesn't exist, insert it into the account
        if (!result.length || !result[0].accountID) {
            await conn.execute(
                "INSERT INTO acctlocation (accountID, locationID, acctStatus, siteMngr) VALUES (?,?,'Active','N');",
                [req.body.accountID, req.body.locationID]
            );
        }
        //If the account exists, change the status of it  active.
        else {
            await conn.execute(
                "UPDATE acctlocation SET acctStatus = 'Active' WHERE accountID = ? AND locationID = ?;",
                [req.body.accountID, req.body.locationID]
            );  
        }
        res.send("Added user to location");
    }
    catch (e) {
        console.log("An error has occurred with this transaction.", e);
        await connection.rollback();
        res.status(500).send("Internal server error");
    }
    finally {
        if (connection) connection.release();
    }
}));



//api call to remove an account from being active at a location.
app.put("/api/sitemgr/locations/accounts", encodedParser, authMiddleware(sitemgr), handleErrors(async (req, res) => {
    const conn = await connProm;
    const [result, _fields] = await conn.execute(
        "UPDATE acctlocation SET acctStatus = 'Inactive' WHERE accountID = ? AND locationID = ?;",
        [req.body.accountID,req.body.locationID]
    );
   

}));

//Reports

//Activity by Location (Subtotaled by date).
//Get Total patient's processed, 
//Takes a start and end date.
app.get("/api/reports/activityByLocation/totalPatients", encodedParser, authMiddleware(admin, sitemgr, staff), handleErrors(async (req, res) => {
    const conn = await connProm;
    const [result, _fields] = await conn.execute(
        `SELECT 
        IF(GROUPING(apptDate), 
        'Grand Total',
        DATE_FORMAT(apptDate,'%m/%d/%Y')) AS "Date",
        IF(GROUPING(appointment.locationID),
        'All Locations', locationName) AS "Location", 
        COUNT(*) AS 'Completed Appointments'
            FROM appointment
            INNER JOIN campaignlocation ON appointment.locationID = campaignlocation.locationID
            INNER JOIN location ON campaignlocation.locationID = location.locationID
            WHERE apptStatus = 'C' AND apptDate BETWEEN ? AND ?
            GROUP BY apptDate, appointment.locationID
            WITH ROLLUP;`,
        [res.params.startDate, res.params.endDate]
    );
    return res.json(result);
}));


//Total for each vaccine manufacturer + shot type at all locations.
//Takes a start and end date.
//TODO: This query is kinda bad, rewrite it with grouping
app.get("/api/reports/activityByLocation/totalByManufacturer", encodedParser, authMiddleware(admin, sitemgr, staff), handleErrors(async (req, res) => {
    const conn = await connProm;
    const [result, _fields] = await conn.execute(
        `SELECT DATE_FORMAT(apptDate,'%m/%d/%Y') AS 'Date', location.locationName, campaignvaccines.manufacturer AS "Manufacturer", campaignvaccines.vaccineDose AS "Vaccine Dose", COUNT(*) AS 'Completed Appointments' 
        FROM appointment
        INNER JOIN campaignvaccines ON appointment.campaignVaccID = campaignvaccines.campaignVaccID
        INNER JOIN campaignlocation ON appointment.locationID = campaignlocation.locationID
        INNER JOIN location ON campaignlocation.locationID = location.locationID
        WHERE apptStatus = 'C' AND apptDate BETWEEN ? AND ?
        GROUP BY apptDate, location.locationID, appointment.campaignVaccID
        UNION
        SELECT 'Total:', '-------', '-------', '-------', COUNT(*)
        FROM appointment
        WHERE apptStatus = 'C' AND apptDate BETWEEN ? AND ?;
        `,
        [res.params.startDate, res.params.endDate, res.params.startDate, res.params.endDate]
    );
    return res.json(result);
}));



//Activity by location - total adverse reactions (Subtotaled by date)
//Takes a start and end date.
 app.get("/api/reports/activityByLocation/totalAdvReactions", encodedParser, authMiddleware(admin), handleErrors(async (req, res) => {
    const conn = await connProm;
    const [result, _fields] = await conn.execute(
        `SELECT 
        IF(GROUPING(apptDate), 
        'Grand Total',
        DATE_FORMAT(apptDate,'%m/%d/%Y')) AS "Date",
        IF(GROUPING(appointment.locationID),
        'All Locations', locationName) AS "Location", 
        COUNT(*) AS 'Adverse Reactions'
            FROM appointment
            INNER JOIN campaignlocation ON appointment.locationID = campaignlocation.locationID
            INNER JOIN location ON campaignlocation.locationID = location.locationID
            WHERE apptStatus = 'C' AND advReaction IS NOT NULL AND apptDate BETWEEN ? AND ?
            GROUP BY apptDate, appointment.locationID
            WITH ROLLUP;`,
        [res.params.startDate, res.params.endDate]
    );
    return res.json(result);
}));

app.get("/api/reports/adverseReactions", encodedParser, authMiddleware(admin), handleErrors(async (req, res) => {
    const conn = await connProm;
    const [result, _fields] = await conn.execute(
        `SELECT DISTINCT DATE_FORMAT(appointment.apptDate,'%m/%d/%Y') AS 'Appointment Date', appointment.appointmentID AS 'Appointment Number', CONCAT(patient.firstName,' ',patient.lastName) AS 'Patient Name', campaignvaccines.vaccineType AS 'Vaccine Name', campaignvaccines.manufacturer AS 'Manufacturer', campaignvaccines.vaccineDose AS 'Vaccine Dose', CONCAT(account.firstName,' ',account.lastName) AS 'Employee Name', appointment.batchNum AS 'Batch Number', appointment.advReaction AS 'Reaction Notes'
        FROM appointment
        JOIN patient ON appointment.patientID = patient.patientID
        JOIN acctlocation ON appointment.staffMember = acctlocation.accountID
        JOIN campaignvaccines ON appointment.campaignVaccID = campaignvaccines.campaignVaccID 
        JOIN account ON acctlocation.accountID = account.accountID
        WHERE appointment.apptDate BETWEEN ? AND ? AND appointment.advReaction IS NOT NULL;`,
        [req.query.startDate, req.query.endDate]
    );
    return res.json(result);
}));


//Batch Report to get all patients that recieved a shot from a particular batch number at a location across a date range.
//Takes in a date range, the locationID, and the batch number.
app.get("/api/reports/batchReport", encodedParser, authMiddleware(admin), handleErrors(async (req, res) => {
    const conn = await connProm;
    const [result, _fields] = await conn.execute(
        `SELECT appointment.appointmentID AS "Appointment Number", CONCAT(patient.firstName," ",patient.lastName) AS "Patient Name", DATE_FORMAT(appointment.apptDate, "%m/%d/%Y") AS "Appointment Date", location.locationName AS "Location", campaignvaccines.vaccineType AS "Vaccine", campaignvaccines.manufacturer AS "Manufacturer", appointment.batchNum AS "Batch Number"
        FROM appointment
        INNER JOIN patient ON appointment.patientID = patient.patientID
        INNER JOIN campaignLocation ON appointment.locationID = campaignLocation.locationID
        INNER JOIN location ON campaignLocation.locationID = location.locationID
        INNER JOIN campaignvaccines ON appointment.campaignVaccID = campaignvaccines.campaignVaccID
        WHERE appointment.apptDate BETWEEN ? AND ? AND appointment.locationID = ? AND batchNum = ?;`,
        params([req.query.startDate, req.query.endDate, req.query.locationID, req.query.batchNum])
    );
    return res.json(result);
}));


//TODO: Activity by Employee (Subtotaled by Date)
// Total Patients Processed: Employee Name, Location, Total Patients Processed, Total Adverse Reactions







const server = app.listen(8080, () => console.log("Listening on port 8080"));

process.on("SIGINT", () => {
    server.close(() => {
        process.exit(0);
    });
});
