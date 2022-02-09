--Mike Haboian
--Queries for Admin users

--Get all employee info,
select * from account;

--Search by name
select * from account where firstName = ? OR LastName = ?;

--Search by id

select * from account where accountID = ?;

--add a new user

INSERT INTO account(username, password, firstName, lastName, position, email, phone)
    VALUES (?,?,?,?,?,?,?);

--add a new site manager
INSERT INTO account(username, password, firstName, lastName, position, email, phone)
    VALUES (?,?,?,?,?,?,?);
INSERT INTO acctlocation(accountID, locationID, acctStatus, siteMngr)
    VALUES (?,?,"Active","Y");


--Get accountID by username entered
SELECT accountID FROM account where username = ?;

--get locationID and locationName from location to be displayed in assign locations screen
SELECT locationID, locationName FROM location;


--Assign the account to the locations entered.
INSERT INTO acctlocation(accountID, locationID, acctStatus, siteMngr)
    VALUES (?,?,"Active","N");



 


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
BEGIN;
    INSERT INTO location(locationName, locationCity, locationState, locationAddr, locationZip)
    VALUES (?,?,?,?,?);
    set @id = @@IDENTITY;
    --Insert the new site to be used at the campaign
    INSERT INTO campaignlocation (locationID, campaignID, status);
    VALUES (@id,?,?);
COMMIT;



--Get user info for a site
SELECT * from campaignlocation;



