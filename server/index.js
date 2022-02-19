const path = require("path");
const express = require("express");
const bodyParser = require("body-parser");

// load the database
const connProm = require("./load-db.js");
const { query } = require("express");

const app = express();
const encodedParser = bodyParser.urlencoded({ extended: false});

// statically serve the client on /
app.use("/", express.static(path.join(__dirname, "..", "client")));
app.use(express.json());

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
    //Tested and working. 
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


app.post("/api/admin/vaccines", encodedParser, async (req,res) => {
    const conn = await connProm;
    console.log(req.body);
    try {
        await conn.execute(
            "INSERT INTO vaccine(vaccineType, manufacturer) VALUES (?,?);", [req.body.vaccineType, req.body.manufacturer]
        );
        res.send("Inserted into vaccine table!");
    } catch(e) {
        console.log("An error has occurred.");
        await conn.rollback();
    }
});
 


app.listen(8080, () => console.log("Listening on port 8080"));


