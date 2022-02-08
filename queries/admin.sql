--Mike Haboian
--Queries for Admin users

--Get all staff info,
select * from account;

--Search by name
select * from account where firstName = ? OR LastName = ?;

--add a new user

INSERT INTO account(username, password, firstName, lastName, position, email, phone)
    VALUES (?,?,?,?,?,?,?);

--Get accountID by username entered
SELECT accountID FROM account where username = ?;

--get locationID and locationName from location to be displayed in assign locations screen
SELECT locationID, locationName FROM location;


--Assign the account to the locations entered.
INSERT INTO acctlocation(accountID, locationID, acctStatus, siteMngr)
    VALUES (?,?,?,"N");



 


--edit a user
UPDATE account set username = ?, password = ?, firstName = ?, lastName = ?, position = ?, email = ?, phone = ? WHERE accountID = ?;

--delete a user
DELETE FROM account where accountID = ?;




--Get all sites 

SELECT * FROM location;

--Delete a site
DELETE FROM location WHERE locationID = ?;

--Edit a site
UPDATE location set locationName = ?, locationCity = ?, locationState = ?, locationAddr = ?, locationZip = ? WHERE locationID = ?;

--Add a site

INSERT INTO location (locationName, locationCity, locationState, locationAddr, locationZip)
    VALUES (?,?,?,?,?);

--Insert the new site into campaignlocation
INSERT INTO campaignlocation ()
    VALUES ()

--Get user info for a site
SELECT  
