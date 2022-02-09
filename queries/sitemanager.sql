--Mike Haboian
--Queries to be used in site manager functions

--Query to get all locations that the account is a site manager at.
--get their account ID from when they log in.
SELECT location.locationID, location.locationName FROM acctlocation
INNER JOIN location on acctlocation.locationID = location.locationID
WHERE siteMngr = "Y" AND accountID = ?;

--Query to set appointment timeslots.




--Query to assign a staff member to one of the sites that the site manager is staffed at.
