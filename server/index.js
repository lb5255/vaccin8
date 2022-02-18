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
    //req.body.<input> gets info on each field.

    //query for entering user info into patient table based on what they entered, and also schedules them for their selected timeslot.
    //Patient info matches the information they filled in.
    //CampaignVaccID is from the selected vaccine type they chose,
    //appointmentID is from the appointment timeslot that they selected
    //Not tested yet, 3 statements need to execute back to back to back, thinking of the best way to do this transaction in node
    try {
        await conn.execute("START TRANSACTION;");
        //first query, insert patient data into patient table
        await conn.execute(
            "INSERT INTO patient(firstName,lastName,dateOfBirth,sex,race,email,phone,city,state,address,zip,careProvider,insuranceNum) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);",
            req.body.fName, req.body.lName, req.body.dob, req.body.sex, req.body.race, req.body.email, req.body.phone, req.body.city, req.body.state, req.body.address, req.body.zip, req.body.careProvider, req.body.insuranceNum
        );
        await conn.execute(
            "SET @id = @@IDENTITY;" //get the auto-incremented patientID to be used in 3rd query.
        );
        await conn.execute(
            "UPDATE appointment SET campaignVaccID = ?, patientID = @id, apptStatus = 'F', perferredContact = 'Email' WHERE appointmentID = ?;",
             req.body.campaignVaccID, req.body.appointmentID
        );
        await conn.commit(); //Commit the changes
    } catch(e) {
        console.log("An error has occurred with this transaction.");
        await conn.rollback();

    }
}); //End of app.post


app.listen(8080, () => console.log("Listening on port 8080"));


