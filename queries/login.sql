-- Mike Haboian
-- Queries shared by Admins, Staff, and Nurses for logging on.

--Queries to log into accounts on the website, depending on the button they select on the login screen.
--Query for Staff login
SELECT accountID, username, password, firstName, lastName FROM account WHERE username = ? AND position = "Staff";
--Query for Admin login
SELECT accountID, username, password, firstName, lastName FROM account WHERE username = ? AND position = "Admin";
--Query for Nurse login
SELECT accountID, username, password, firstName, lastName FROM account WHERE username = ? AND position = "Nurse";

--After user is authenticated and logged in, store their accountID, and their firstName and LastName in their browser session.
--Password will need to be compared against the hashed password they entered.

--Query to reset password, the new entered password will need to be hashed before it's put in.
UPDATE account SET password = ? WHERE email = ?;


--Query to display the locations that the account is able to view.

