const path = require("path");
const express = require("express");

// load the database
const connProm = require("./load-db.js");

const app = express();

// statically serve the client on /
app.use("/", express.static(path.join(__dirname, "..", "client")));
app.use(express.json());

app.get("/campaign", async (req, res) => {
    const conn = await connProm;
    const [result, _fields] = await conn.execute(
        "SELECT campaignName from campaign WHERE campaignStatus = 'a';"
    );
    res.json(result);
});
//graphQL for multiple queries

app.get("/api/index", async (req, res) => {
    //respond with GET request for all available vaccines.
    const conn = await connProm;
    const [result, _fields] = await conn.execute(
        "SELECT DISTINCT campaignVaccID, vaccineType, manufacturer, vaccineDose FROM campaignvaccines WHERE campaignID IN (SELECT campaignID FROM campaign WHERE campaignStatus = 'a');"
    );
    res.json(result);
});

app.listen(8080, () => console.log("Listening on port 8080"));


