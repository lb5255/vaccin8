conn.beginTransaction(function(err) {
    let id = "";
    if (err) { throw err; }
    conn.execute("INSERT INTO patient(firstName,lastName,dateOfBirth,sex,race,email,phone,city,state,address,zip,careProvider,insuranceNum) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);", req.body.fName, req.body.lName, req.body.dob, req.body.sex, req.body.race, req.body.email, req.body.phone, req.body.city, req.body.state, req.body.address, req.body.zip, req.body.careProvider, req.body.insuranceNum, function(err, result) {
        if (err) {
            conn.rollback(function() {
                throw err;
            });          
        } //end of first query for new patient data insert
        id = result.insertID; //set id to the auto-incremented ID, this will be used in the 2nd query

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
