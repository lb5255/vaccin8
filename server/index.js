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

app.get("/api/recipient/vaccineAppts", async (req, res) => {
    const conn = await connProm;
    const [result, _fields] = await conn.execute(
        "SELECT appointmentID, appointment.locationID, location.locationName ,apptDate, apptTime FROM appointment INNER JOIN campaignLocation ON appointment.locationID = campaignLocation.locationID INNER JOIN location ON campaignLocation.locationID = location.locationID WHERE apptStatus = 'O' AND apptDate > (NOW() + INTERVAL 1 DAY);"
    );
    res.json(result);
});

app.listen(8080, () => console.log("Listening on port 8080"));


