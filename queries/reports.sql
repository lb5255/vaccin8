--Mike Haboian
--Queries that will be used in reports

-- View completed appointments.
SELECT appointment.appointmentID, location.locationName, campaignVaccines.vaccineType, campaignVaccines.vaccineDose, campaignVaccines.manufacturer, patient.firstName, patient.lastName, patient.dateOfBirth, patient.insuranceNum, patient.address,patient.phone,patient.city,patient.state,patient.zip,patient.email, apptDate, apptTime FROM appointment 
INNER JOIN patient on appointment.patientID = patient.patientID
INNER JOIN campaignVaccines on appointment.campaignVaccID = campaignVaccines.campaignVaccID
INNER JOIN campaignlocation on appointment.locationID = campaignlocation.locationID
INNER JOIN location on campaignlocation.locationID = location.locationID
WHERE appointment.locationID = 1 AND appointment.campaignID IN (
    SELECT campaignID FROM campaign WHERE campaignStatus = "a")
    AND apptDate BETWEEN ? AND ? AND apptStatus = "C";

-- View incomplete appointments

select appointment.appointmentID, location.locationName, campaignVaccines.vaccineType, campaignVaccines.vaccineDose, campaignVaccines.manufacturer, patient.firstName, patient.lastName, patient.dateOfBirth, patient.insuranceNum, patient.address,patient.phone,patient.city,patient.state,patient.zip,patient.email, apptDate, apptTime FROM appointment 
INNER JOIN patient on appointment.patientID = patient.patientID
INNER JOIN campaignVaccines on appointment.campaignVaccID = campaignVaccines.campaignVaccID
INNER JOIN campaignlocation on appointment.locationID = campaignlocation.locationID
INNER JOIN location on campaignlocation.locationID = location.locationID
WHERE apptDate <= DATE(NOW()) AND apptStatus = "F";

-- View missed appointments. 
select appointment.appointmentID, location.locationName, campaignVaccines.vaccineType, campaignVaccines.vaccineDose, campaignVaccines.manufacturer, patient.firstName, patient.lastName, patient.dateOfBirth, patient.insuranceNum, patient.address,patient.phone,patient.city,patient.state,patient.zip,patient.email, apptDate, apptTime FROM appointment 
INNER JOIN patient on appointment.patientID = patient.patientID
INNER JOIN campaignVaccines on appointment.campaignVaccID = campaignVaccines.campaignVaccID
INNER JOIN campaignlocation on appointment.locationID = campaignlocation.locationID
INNER JOIN location on campaignlocation.locationID = location.locationID
WHERE apptDate <= DATE(NOW()) AND apptStatus = "M";

-- View adverse reactions.
select appointment.appointmentID, location.locationName, campaignVaccines.vaccineType, campaignVaccines.vaccineDose, campaignVaccines.manufacturer, patient.firstName, patient.lastName, patient.dateOfBirth, patient.insuranceNum, patient.address,patient.phone,patient.city,patient.state,patient.zip,patient.email, apptDate, apptTime advReaction FROM appointment 
INNER JOIN patient on appointment.patientID = patient.patientID
INNER JOIN campaignVaccines on appointment.campaignVaccID = campaignVaccines.campaignVaccID
INNER JOIN campaignlocation on appointment.locationID = campaignlocation.locationID
INNER JOIN location on campaignlocation.locationID = location.locationID
WHERE advReaction IS NOT NULL;

-- View upcoming appointments.

select appointment.appointmentID, location.locationName, campaignVaccines.vaccineType, campaignVaccines.vaccineDose, campaignVaccines.manufacturer, patient.firstName, patient.lastName, patient.dateOfBirth, patient.insuranceNum, patient.address,patient.phone,patient.city,patient.state,patient.zip,patient.email, apptDate, apptTime FROM appointment 
INNER JOIN patient on appointment.patientID = patient.patientID
INNER JOIN campaignVaccines on appointment.campaignVaccID = campaignVaccines.campaignVaccID
INNER JOIN campaignlocation on appointment.locationID = campaignlocation.locationID
INNER JOIN location on campaignlocation.locationID = location.locationID
WHERE apptDate <= DATE(NOW()) AND apptStatus = "F";

--Or, select a date range

select appointment.appointmentID, location.locationName, campaignVaccines.vaccineType, campaignVaccines.vaccineDose, campaignVaccines.manufacturer, patient.firstName, patient.lastName, patient.dateOfBirth, patient.insuranceNum, patient.address,patient.phone,patient.city,patient.state,patient.zip,patient.email, apptDate, apptTime FROM appointment 
INNER JOIN patient on appointment.patientID = patient.patientID
INNER JOIN campaignVaccines on appointment.campaignVaccID = campaignVaccines.campaignVaccID
INNER JOIN campaignlocation on appointment.locationID = campaignlocation.locationID
INNER JOIN location on campaignlocation.locationID = location.locationID
WHERE apptDate BETWEEN ? AND ? AND apptStatus = "F";

-- View active vaccination locations.
select location.locationName, location.locationCity, location.locationState, location.locationAddr from campaignlocation
INNER JOIN location on campaignlocation.locationID = location.locationID 
WHERE status = "Active";

-- View a list of all accounts in the system

select accountID, username, firstName, lastName, position, email, phone from account; 


-- Activity by Location (Subtotaled by date).
-- Get Total patient's processed, Total for each vaccine manufacturer, total for each shot type, 
-- and total adverse reactions.

--Get Total Completed Appointments given a date range and location. Subtotaled by date
SELECT DATE_FORMAT(apptDate,'%m/%d/%Y') AS 'Date', appointment.locationID, COUNT(*) AS 'Completed Appointments' 
        FROM appointment
        WHERE apptStatus = 'C' AND apptDate BETWEEN '2022-01-01' AND '2022-12-30'
        GROUP BY apptDate, appointment.locationID
        UNION
        SELECT 'Total:', '------', COUNT(*)
        FROM appointment
        WHERE apptStatus = 'C' AND apptDate BETWEEN '2022-01-01' AND '2022-12-30';



--Get Total patients processed for each shot type/manufacturer given a date range. Subtotaled by date
SELECT DATE_FORMAT(apptDate,'%m/%d/%Y') AS 'Date', location.locationName AS "Location", campaignvaccines.manufacturer AS "Manufacturer", campaignvaccines.vaccineDose AS "Vaccine Dose", COUNT(*) AS 'Completed Appointments' 
        FROM appointment
        INNER JOIN campaignvaccines ON appointment.campaignVaccID = campaignvaccines.campaignVaccID
        INNER JOIN campaignlocation ON appointment.locationID = campaignlocation.locationID
        INNER JOIN location ON campaignlocation.locationID = location.locationID
        WHERE apptStatus = 'C' AND apptDate BETWEEN '2022-01-01' AND '2022-12-30'
        GROUP BY apptDate, location.locationID, appointment.campaignVaccID
        ORDER BY apptDate, location.locationID, appointment.campaignVaccID;
        

-- Get grand total of above query.
SELECT 'Total:', '-------', '-------', '-------', COUNT(*)
        FROM appointment
        WHERE apptStatus = 'C' AND apptDate BETWEEN '2022-01-01' AND '2022-12-30';




-- Get Total patients who had adverse reactions for each shot
SELECT DATE_FORMAT(apptDate,'%m/%d/%Y') AS 'Date', location.locationName, campaignvaccines.manufacturer AS "Manufacturer", campaignvaccines.vaccineDose AS "Vaccine Dose", COUNT(*) AS 'Completed Appointments' 
        FROM appointment
        INNER JOIN campaignvaccines ON appointment.campaignVaccID = campaignvaccines.campaignVaccID
        INNER JOIN campaignlocation ON appointment.locationID = campaignlocation.locationID
        INNER JOIN location ON campaignlocation.locationID = location.locationID
        WHERE apptStatus = 'C' AND apptDate BETWEEN '2022-01-01' AND '2022-12-30'
        GROUP BY apptDate, location.locationID, appointment.campaignVaccID
        

SELECT 'Total:', '-------', '-------', '-------', COUNT(*)
        FROM appointment
        WHERE apptStatus = 'C' AND apptDate BETWEEN '2022-01-01' AND '2022-12-30';












        



--Get Total patients processed that had adverse reactions. Subtotaled by date
--TODO:

--Activity By Employee - (subtotaled by date) Employee Name, location, total patients processed,
--count of adverse reactions for the time period (if any)
--TODO:
SELECT DATE_FORMAT(appointment.apptDate,'%m/%d/%Y') AS 'Date', CONCAT(account.firstName,' ',account.lastName) AS 'Employee Name', location.locationName AS 'Location Name', (SELECT COUNT(*) FROM appointment WHERE staffMember = )






--Adverse Reaction Report: List Date, patient Name, Shot sequence, employee that administered shot, 
--vaccine manufacturer, vaccine product/brand, batch number, reactionNotes
--Done
SELECT DISTINCT DATE_FORMAT(appointment.apptDate,'%m/%d/%Y') AS 'Appointment Date', appointment.appointmentID AS 'Appointment Number', CONCAT(patient.firstName,' ',patient.lastName) AS 'Patient Name', campaignvaccines.vaccineType AS 'Vaccine Name', campaignvaccines.manufacturer AS 'Manufacturer', campaignvaccines.vaccineDose AS 'Vaccine Dose', CONCAT(account.firstName,' ',account.lastName) AS 'Employee Name', appointment.batchNum AS 'Batch Number', appointment.advReaction AS 'Reaction Notes'
FROM appointment
JOIN patient ON appointment.patientID = patient.patientID
JOIN acctlocation ON appointment.staffMember = acctlocation.accountID
JOIN campaignvaccines ON appointment.campaignVaccID = campaignvaccines.campaignVaccID 
JOIN account ON acctlocation.accountID = account.accountID
WHERE appointment.apptDate BETWEEN '2022-01-01' AND '2022-12-30' AND appointment.advReaction IS NOT NULL;






-- Batch Report: List all patients by date and location 
-- who recieved shots from a particular batch of vaccine.
--Done
SELECT appointment.appointmentID AS "Appointment Number", CONCAT(patient.firstName," ",patient.lastName) AS "Patient Name", DATE_FORMAT(appointment.apptDate, "%m/%d/%Y") AS "Appointment Date", location.locationName AS "Location", campaignVaccines.vaccineType AS "Vaccine", campaignVaccines.manufacturer AS "Manufacturer", appointment.batchNum AS "Batch Number"
FROM appointment
INNER JOIN patient ON appointment.patientID = patient.patientID
INNER JOIN campaignLocation ON appointment.locationID = campaignLocation.locationID
INNER JOIN location ON campaignLocation.locationID = location.locationID
INNER JOIN campaignVaccines ON appointment.campaignVaccID = campaignVaccines.campaignVaccID
WHERE appointment.apptDate BETWEEN ? AND ? AND appointment.locationID = ? AND batchNum = ?;


--Testing this one w/ rollup to try and get subtotal working.
SELECT DATE_FORMAT(apptDate,'%m/%d/%Y') AS 'Date', location.locationName, campaignvaccines.manufacturer AS "Manufacturer", campaignvaccines.vaccineDose AS "Vaccine Dose", COUNT(*) AS 'Completed Appointments' 
        FROM appointment
        INNER JOIN campaignvaccines ON appointment.campaignVaccID = campaignvaccines.campaignVaccID
        INNER JOIN campaignlocation ON appointment.locationID = campaignlocation.locationID
        INNER JOIN location ON campaignlocation.locationID = location.locationID
        WHERE apptStatus = 'C' AND apptDate BETWEEN '2022-01-01' AND '2022-12-30'
        GROUP BY apptDate, location.locationID
        WITH ROLLUP
        ORDER BY apptDate;