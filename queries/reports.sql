--Mike Haboian
--Queries that will be used in reports

-- View completed appointments.
SELECT appointment.appointmentID, location.locationName, campaignVaccines.vaccineType, campaignVaccines.vaccineDose, campaignVaccines.manufacturer, patient.firstName, patient.lastName, patient.dateOfBirth, patient.insuranceNum, patient.address,patient.phone,patient.city,patient.state,patient.zip,patient.email, apptDate, apptTime FROM appointment 
INNER JOIN patient on appointment.patientID = patient.patientID
INNER JOIN campaignVaccines on appointment.campaignVaccID = campaignVaccines.campaignVaccID
INNER JOIN campaignLocation on appointment.locationID = campaignLocation.locationID
INNER JOIN location on campaignLocation.locationID = location.locationID
WHERE appointment.locationID = 1 AND appointment.campaignID IN (
    SELECT campaignID FROM campaign WHERE campaignStatus = "a")
    AND apptDate BETWEEN ? AND ? AND apptStatus = "C";

-- View incomplete appointments

select appointment.appointmentID, location.locationName, campaignVaccines.vaccineType, campaignVaccines.vaccineDose, campaignVaccines.manufacturer, patient.firstName, patient.lastName, patient.dateOfBirth, patient.insuranceNum, patient.address,patient.phone,patient.city,patient.state,patient.zip,patient.email, apptDate, apptTime FROM appointment 
INNER JOIN patient on appointment.patientID = patient.patientID
INNER JOIN campaignVaccines on appointment.campaignVaccID = campaignVaccines.campaignVaccID
INNER JOIN campaignLocation on appointment.locationID = campaignLocation.locationID
INNER JOIN location on campaignLocation.locationID = location.locationID
WHERE apptDate <= DATE(NOW()) AND apptStatus = "F";

-- View missed appointments. 
select appointment.appointmentID, location.locationName, campaignVaccines.vaccineType, campaignVaccines.vaccineDose, campaignVaccines.manufacturer, patient.firstName, patient.lastName, patient.dateOfBirth, patient.insuranceNum, patient.address,patient.phone,patient.city,patient.state,patient.zip,patient.email, apptDate, apptTime FROM appointment 
INNER JOIN patient on appointment.patientID = patient.patientID
INNER JOIN campaignVaccines on appointment.campaignVaccID = campaignVaccines.campaignVaccID
INNER JOIN campaignLocation on appointment.locationID = campaignLocation.locationID
INNER JOIN location on campaignLocation.locationID = location.locationID
WHERE apptDate <= DATE(NOW()) AND apptStatus = "M";

-- View adverse reactions.
select appointment.appointmentID, location.locationName, campaignVaccines.vaccineType, campaignVaccines.vaccineDose, campaignVaccines.manufacturer, patient.firstName, patient.lastName, patient.dateOfBirth, patient.insuranceNum, patient.address,patient.phone,patient.city,patient.state,patient.zip,patient.email, apptDate, apptTime advReaction FROM appointment 
INNER JOIN patient on appointment.patientID = patient.patientID
INNER JOIN campaignVaccines on appointment.campaignVaccID = campaignVaccines.campaignVaccID
INNER JOIN campaignLocation on appointment.locationID = campaignLocation.locationID
INNER JOIN location on campaignLocation.locationID = location.locationID
WHERE advReaction IS NOT NULL;

-- View upcoming appointments.

select appointment.appointmentID, location.locationName, campaignVaccines.vaccineType, campaignVaccines.vaccineDose, campaignVaccines.manufacturer, patient.firstName, patient.lastName, patient.dateOfBirth, patient.insuranceNum, patient.address,patient.phone,patient.city,patient.state,patient.zip,patient.email, apptDate, apptTime FROM appointment 
INNER JOIN patient on appointment.patientID = patient.patientID
INNER JOIN campaignVaccines on appointment.campaignVaccID = campaignVaccines.campaignVaccID
INNER JOIN campaignLocation on appointment.locationID = campaignLocation.locationID
INNER JOIN location on campaignLocation.locationID = location.locationID
WHERE apptDate <= DATE(NOW()) AND apptStatus = "F";

--Or, select a date range

select appointment.appointmentID, location.locationName, campaignVaccines.vaccineType, campaignVaccines.vaccineDose, campaignVaccines.manufacturer, patient.firstName, patient.lastName, patient.dateOfBirth, patient.insuranceNum, patient.address,patient.phone,patient.city,patient.state,patient.zip,patient.email, apptDate, apptTime FROM appointment 
INNER JOIN patient on appointment.patientID = patient.patientID
INNER JOIN campaignVaccines on appointment.campaignVaccID = campaignVaccines.campaignVaccID
INNER JOIN campaignLocation on appointment.locationID = campaignLocation.locationID
INNER JOIN location on campaignLocation.locationID = location.locationID
WHERE apptDate BETWEEN ? AND ? AND apptStatus = "F";

-- View active vaccination locations.
select location.locationName, location.locationCity, location.locationState, location.locationAddr from campaignLocation
INNER JOIN location on campaignLocation.locationID = location.locationID 
WHERE status = "Active";

-- View a list of all accounts in the system

select accountID, username, firstName, lastName, position, email, phone from account; 