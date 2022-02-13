--Mike Haboian
--Queries to be used in site manager functions

--Query to get all locations that the account is a site manager at.
--get their account ID from when they log in.
SELECT location.locationID, location.locationName FROM acctlocation
INNER JOIN location on acctlocation.locationID = location.locationID
WHERE siteMngr = "Y" AND accountID = ?;

--Query to set appointment timeslots.

INSERT INTO appointment(locationID,campaignID,apptDate,apptTime,apptStatus)
    VALUES(?,?,?,?,?);


--Query to assign a staff member to one of the sites that the site manager is staffed at.

INSERT INTO acctlocation(accountID,locationID,acctStatus,siteMngr)
    VALUES(?,?,"Active","N");

--Query to unassign a staff member from one of the sites the staff manager is staffed at
UPDATE acctLocation SET acctStatus = "Inactive" WHERE accountID = ? AND locationID = ?;




--Query to set or remove a location's hour of operations
insert into locationTimes(locationID, locationDay, locationOpen, locationClose) VALUES
    (?,?,?,?);

DELETE FROM locationTimes WHERE locationID = ? AND locationDay = ?;

UPDATE locationTimes set locationOpen = ?, locationDay = ? WHERE locationID = ? And locationDay = ?

--Query to get hours of operation from a locaiton

SELECT location.locationName, locationDay, locationOpen, locationClose FROM locationTimes
INNER JOIN location on locationTimes.locationID = location.locationID
WHERE locationTimes.locationID;

--Query to get all available hours of operations for all locations
SELECT location.locationName, locationDay, locationOpen, locationClose FROM locationTimes
INNER JOIN location on locationTimes.locationID = location.locationID;