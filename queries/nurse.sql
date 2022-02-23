--Mike Haboian
--TODO: Finish queries for nurse tasks and TEST them



--Query to look up a patient info
SELECT patientID, firstName, lastName, dateOfBirth, address, city, state, zip, phone, email FROM patient WHERE firstName = ? AND lastName = ? and dateOfBirth = ?;
--Query to look up if a patient has an appointment on the current date
@id = SELECT patientID FROM patient WHERE firstName = ? AND lastName = ? and dateOfBirth = ?;
SELECT * FROM appointment WHERE patientID = @id AND apptDate = CURDATE();

--Query to look up previous vaccinations for the patient
SELECT campaignVaccines.vaccineType, campaignVaccines.manufacturer, batchNum, apptDate FROM appointment
WHERE patientID = ? AND apptStatus = "";


SELECT location.locationName, campaignVaccines.vaccineType, campaignVaccines.vaccineDose, campaignVaccines.manufacturer, patient.firstName, patient.lastName, patient.dateOfBirth, patient.insuranceNum, patient.address,patient.phone,patient.city,patient.state,patient.zip,patient.email, apptDate, apptTime FROM appointment 
INNER JOIN patient on appointment.patientID = patient.patientID
INNER JOIN campaignVaccines on appointment.campaignVaccID = campaignVaccines.campaignVaccID
INNER JOIN campaignLocation on appointment.locationID = campaignLocation.locationID
INNER JOIN location on campaignLocation.locationID = location.locationID
WHERE patient.patientID = ? AND apptStatus = "F";



--Query to assign type and batch of vaccine to the patient. 
-- staffMember will take the ID of the nurse that is currently logged in. 
-- batchNum is entered by nurse.
UPDATE appointment SET batchNum = ?, vaccDatestamp = NOW(), apptStatus = "C", staffMember = ? WHERE appointmentID = ?;


--For scheduling next appointment, re-use queries from recipient.

