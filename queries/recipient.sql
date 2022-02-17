-- Mike Haboian
-- Queries needed for recipients to sign up and recieve their vaccines, or to cancel an appointment

SELECT campaignName from campaignVaccines WHERE campaignStatus = "a";

--Recipient Screen, Vaccine Type
--selects the available vaccines at the currently active campaign
SELECT DISTINCT vaccineType FROM campaignvaccines WHERE campaignID IN (
    SELECT campaignID FROM campaign WHERE campaignStatus = "a");


-- Recipient Screen, Date & Time
--selects all active locations for the currently active campaign
SELECT campaignlocation.locationID, location.locationName FROM campaignlocation 
    INNER JOIN location ON campaignlocation.locationID = location.locationID
    WHERE campaignID IN (SELECT campaignID FROM campaign WHERE campaignStatus = "a") AND status = "Active";

-- Recipient Screen, Date & Time
--select all available appointments




-- Recipient Screen, Date & Time
--selects the available open timeslots at the chosen location and date
--Will need to store the appointmentID from the timeslot they choose for later use. 
SELECT appointmentID, appointment.locationID, location.locationName ,apptDate, apptTime FROM appointment
    INNER JOIN campaignLocation ON appointment.locationID = campaignLocation.locationID
    INNER JOIN location ON campaignLocation.locationID = location.locationID
    WHERE apptStatus = "O" AND apptDate > (NOW() + INTERVAL 1 DAY);

--Display info about the available vaccines they want. 
--Will need to store the campaignVaccID that they choose for later use.
SELECT campaignVaccID, vaccineType, Manufacturer, vaccineDose FROM campaignVaccines WHERE campaignID IN (
    SELECT campaignID FROM campaign WHERE campaignStatus = "a");


--Enters user info into patient table based on what they entered, and also schedules them for their selected timeslot.
--Patient info matches the information they filled in.
--CampaignVaccID is from the selected vaccine type they chose,
--appointmentID matches the appointment timeslot that they selected
BEGIN;
INSERT INTO patient(firstName,lastName,dateOfBirth,sex,race,email,phone,city,state,address,zip,careProvider,insuranceNum)
    VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?); 
    SET @id = @@IDENTITY;
    update appointment set campaignVaccID = ?, patientID = @id, apptStatus = "F", perferredContact = "Email" WHERE appointmentID = ?;
COMMIT;


--If a user wants to cancel their appointment. Will need their appointmentID
UPDATE appointment SET campaignVaccID = NULL, patientID = NULL, apptStatus = "O", perferredContact = NULL WHERE appointmentID = ?;