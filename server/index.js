const path = require("path");
const express = require("express");
const bodyParser = require("body-parser");

// load the database
const connProm = require("./load-db.js");

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

    //query for entering user info into patient table based on what they entered, 
    //and also schedules them for their selected timeslot.
    //Patient info matches the information they filled in.
    //CampaignVaccID is from the selected vaccine type they chose,
    //appointmentID is from the appointment timeslot that they selected

    //Not tested yet, 2 queries need to execute back to back, thinking of the best way to do this transaction in node
    // const [result, _fields] = await conn.execute(
    //     "BEGIN TRANSACTION; INSERT INTO patient(firstName,lastName,dateOfBirth,sex,race,email,phone,city,state,address,zip,careProvider,insuranceNum) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?); SET @id = @@IDENTITY; UPDATE appointment SET campaignVaccID = ?, patientID = @id, apptStatus = 'F', perferredContact = 'Email' WHERE appointmentID = ?; COMMIT;",
    //     [req.body.fName, req.body.lName, req.body.dob, req.body.sex, req.body.race. req.body.email, req.body.phone, req.body.city, req.body.state, req.body.address, req.body.zip, req.body.careProvider, req.body.insuranceNum, req.body.campaignVaccID, req.body.appointmentID]
    // );
    conn.beginTransaction(function(err) {
        let id = "";
        if (err) { throw err; }
        conn.execute("INSERT INTO patient(firstName,lastName,dateOfBirth,sex,race,email,phone,city,state,address,zip,careProvider,insuranceNum) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);", req.body.fName, req.body.lName, req.body.dob, req.body.sex, req.body.race, req.body.email, req.body.phone, req.body.city, req.body.state, req.body.address, req.body.zip, req.body.careProvider, req.body.insuranceNum, function(err, result) {
            if (err) {
                conn.rollback(function() {
                    throw err;
                });
                id = result.insertID; //set id to the auto-incremented ID, this will be used in the 2nd query
            } //end of first query for new patient data insert

            conn.execute("UPDATE appointment SET campaignVaccID = ?, patientID = ?, apptStatus = 'F', perferredContact = 'Email' WHERE appointmentID = ?;", req.body.campaignVaccID, id, req.body.appointmentID, function(err, result) {
                if (err) {
                    conn.rollback(function() {
                        throw err;
                    });
                }
                conn.commit(function(err) {
                    if (err) {
                        conn.rollback(function() {
                            throw err;
                        });
                    }
                    console.log('Transaction success!');
                });
            });
        });
    }); 
});


app.listen(8080, () => console.log("Listening on port 8080"));


