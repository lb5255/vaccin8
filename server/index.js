const path = require("path");
const express = require("express");

// load the database
require("./load-db.js");

const app = express();

// statically serve the client on /
app.use("/", express.static(path.join(__dirname, "..", "client")));

app.listen(8080, () => console.log("Listening on port 8080"));
