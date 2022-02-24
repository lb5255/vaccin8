-- Mike Haboian
-- Queries needed for front desk staff tasks.

--Query to pick locations where they are active at.

SELECT acctlocation.accountID, acctlocation.locationID, location.locationName
FROM acctLocation WHERE accountID = ?;

--Query to get all information about appointments that are at the selected location from a given date range. 

SELECT appointment.appointmentID, location.locationName, campaignVaccines.vaccineType, campaignVaccines.vaccineDose, campaignVaccines.manufacturer, patient.firstName, patient.lastName, patient.dateOfBirth, patient.insuranceNum, patient.address,patient.phone,patient.city,patient.state,patient.zip,patient.email, apptDate, apptTime FROM appointment 
INNER JOIN patient on appointment.patientID = patient.patientID
INNER JOIN campaignVaccines on appointment.campaignVaccID = campaignVaccines.campaignVaccID
INNER JOIN campaignlocation on appointment.locationID = campaignlocation.locationID
INNER JOIN location on campaignlocation.locationID = location.locationID
WHERE appointment.locationID = 1 AND appointment.campaignID IN (
    SELECT campaignID FROM campaign WHERE campaignStatus = "a")
    AND apptDate BETWEEN ? AND ? AND apptStatus = "F";
    

--Query to check in patient when they show up for their appointment.

UPDATE appointment SET apptStatus = 'A' WHERE appointmentID = ?;


--Query to cancel an appointment.

UPDATE appointment SET apptStatus = 'X' WHERE appointmentID = ?;