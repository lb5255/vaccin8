-- Mike Haboian
-- Queries needed for front desk staff tasks.

--Query to get all information about appointments that are at the selected location from a given date range. 

SELECT appointment.appointmentID, location.locationName, campaignVaccines.vaccineType, campaignVaccines.vaccineDose, campaignVaccines.manufacturer, patient.firstName, patient.lastName, patient.dateOfBirth, patient.insuranceNum, patient.address,patient.phone,patient.city,patient.state,patient.zip,patient.email, apptDate, apptTime FROM appointment 
INNER JOIN patient on appointment.patientID = patient.patientID
INNER JOIN campaignVaccines on appointment.campaignVaccID = campaignVaccines.campaignVaccID
INNER JOIN campaignLocation on appointment.locationID = campaignLocation.locationID
INNER JOIN location on campaignLocation.locationID = location.locationID
WHERE appointment.locationID = 1 AND appointment.campaignID IN (
    SELECT campaignID FROM campaign WHERE campaignStatus = "a")
    AND apptDate BETWEEN '2022-02-01' AND '2022-03-01' AND apptStatus = "F";
    

--Query to check in patient when they show up for their appointment.

UPDATE appointment SET apptStatus = "A", WHERE appointmentID = ?;

--Query to cancel an appointment.

UPDATE appointment SET apptStatus = "X" WHERE appointmentID = ?;