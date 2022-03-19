conn.beginTransaction(function(err) {
    let id = "";
    if (err) { throw err; }
    conn.execute("INSERT INTO patient(firstName,lastName,dateOfBirth,sex,race,email,phone,city,state,address,zip,careProvider,insuranceNum) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);", 
                    [req.body.fName, req.body.lName, req.body.dob, req.body.sex, req.body.race, req.body.email, req.body.phone, req.body.city, req.body.state, req.body.address, req.body.zip, req.body.careProvider, req.body.insuranceNum], function(err, result) {
        if (err) {
            conn.rollback(function() {
                throw err;
            });          
        } //end of first query for new patient data insert
        id = result.insertID; //set id to the auto-incremented ID, this will be used in the 2nd query

        conn.execute("UPDATE appointment SET campaignVaccID = ?, patientID = ?, apptStatus = 'F', perferredContact = 'Email' WHERE appointmentID = ?;", [req.body.campaignVaccID, id, req.body.appointmentID], function(err, result) {
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

app.post("/api/recipient/vaccineAppts", encodedParser, async (req, res) => {
    const conn = await connProm;
    //req.body.<input> gets info on each field.
    console.log("recieved data!");
    console.log(req.body);
    //query for entering user info into patient table based on what they entered, and also schedules them for their selected timeslot.
    //Patient info matches the information they filled in.
    //CampaignVaccID is from the selected vaccine type they chose,
    //appointmentID is from the appointment timeslot that they selected
    //Not working yet, 3 statements need to execute back to back to back
    try {
        await conn.execute("START TRANSACTION;");
        //first query, insert patient data into patient table
        await conn.execute(
            "INSERT INTO patient(firstName,lastName,dateOfBirth,sex,race,email,phone,city,state,address,zip,careProvider,insuranceNum) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);",
            [req.body.fName, req.body.lName, req.body.dob, req.body.sex, req.body.race, req.body.email, req.body.phone, req.body.city, req.body.state, req.body.address, req.body.zip, req.body.careProvider, req.body.insuranceNum]
        );
        await conn.execute(
            "SET @id = @@IDENTITY;" //get the auto-incremented patientID to be used in 3rd query.
        );
        await conn.execute(
            "UPDATE appointment SET campaignVaccID = ?, patientID = @id, apptStatus = 'F', perferredContact = 'Email' WHERE appointmentID = ?;",
             [req.body.campaignVaccID, req.body.appointmentID]
        );
        await conn.commit(); //Commit the changes
    } catch(e) {
        console.log("An error has occurred with this transaction.");
        await conn.rollback();

    }
}); //End of app.post