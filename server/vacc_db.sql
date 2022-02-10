-- MySQL dump 10.13  Distrib 8.0.19, for Win64 (x86_64)
--
-- Host: localhost    Database: vaccinationdb
-- ------------------------------------------------------
-- Server version	8.0.18

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `account`
--

DROP TABLE IF EXISTS `account`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `account` (
  `accountID` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(20) DEFAULT NULL,
  `password` varchar(150) DEFAULT NULL,
  `firstName` varchar(20) DEFAULT NULL,
  `lastName` varchar(20) DEFAULT NULL,
  `position` varchar(20) DEFAULT NULL,
  `email` varchar(50) DEFAULT NULL,
  `phone` varchar(15) DEFAULT NULL,
  PRIMARY KEY (`accountID`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `account`
--

LOCK TABLES `account` WRITE;
/*!40000 ALTER TABLE `account` DISABLE KEYS */;
INSERT INTO `account` VALUES (1,'mikeh350','Test_Passwd01','Michael','Haboian','Admin','mh4636@rit.edu','5853606646'),(2,'TestNurse','Test_Passwd02','Terry','Rohan','Nurse','terry32@outlook.com','5851532242'),(3,'TestNurse02','Test_Passwd03','Sarah','Yost','Nurse','sarah32@outlook.com','5853329878'),(4,'TestStaff','Test_Passwd04','Jake','Karo','Staff','jake32@outlook.com','5851338484'),(5,'TestStaff02','Test_Passwd05','Sandra','Read','Staff','sandra32@yahoo.com','5852344348'),(6,'TestAdmin','Test_Passwd06','John','Tester','Admin','john12@gmail.com','5852606567'),(8,'TestNurse03','$2b$12$SDksU5j7lOBeZKeLTpbPU.2MEE.Na.Bb7OrHTuYKCXOjboSGcADcu',NULL,NULL,NULL,NULL,NULL);
/*!40000 ALTER TABLE `account` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `acctlocation`
--

DROP TABLE IF EXISTS `acctlocation`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `acctlocation` (
  `accountID` int(11) NOT NULL,
  `locationID` int(11) NOT NULL,
  `acctStatus` varchar(10) DEFAULT NULL,
  `siteMngr` char(1) DEFAULT NULL,
  PRIMARY KEY (`accountID`,`locationID`),
  KEY `locationID` (`locationID`),
  CONSTRAINT `acctlocation_ibfk_1` FOREIGN KEY (`accountID`) REFERENCES `account` (`accountID`),
  CONSTRAINT `acctlocation_ibfk_2` FOREIGN KEY (`locationID`) REFERENCES `location` (`locationID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `acctlocation`
--

LOCK TABLES `acctlocation` WRITE;
/*!40000 ALTER TABLE `acctlocation` DISABLE KEYS */;
INSERT INTO `acctlocation` VALUES (1,1,'Active','N'),(1,2,'Active','N'),(1,3,'Active','N'),(2,1,'Active','N'),(2,2,'Active','N'),(3,1,'Active','N'),(3,2,'Active','N'),(4,1,'Active','N'),(4,3,'Inactive','N'),(5,1,'Active','N'),(5,2,'Active','N'),(6,1,'Active','Y');
/*!40000 ALTER TABLE `acctlocation` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `appointment`
--

DROP TABLE IF EXISTS `appointment`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `appointment` (
  `appointmentID` int(11) NOT NULL AUTO_INCREMENT,
  `locationID` int(11) DEFAULT NULL,
  `campaignID` int(11) DEFAULT NULL,
  `campaignVaccID` int(11) DEFAULT NULL,
  `batchNum` int(11) DEFAULT NULL,
  `patientID` int(11) DEFAULT NULL,
  `apptDate` date DEFAULT NULL,
  `apptTime` time DEFAULT NULL,
  `apptStatus` char(1) DEFAULT NULL,
  `perferredContact` varchar(5) DEFAULT NULL,
  `arrival` varchar(7) DEFAULT NULL,
  `preCheck` varchar(255) DEFAULT NULL,
  `staffMember` int(11) DEFAULT NULL,
  `advReaction` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`appointmentID`),
  KEY `locationID` (`locationID`,`campaignID`),
  KEY `campaignVaccID` (`campaignVaccID`),
  KEY `patientID` (`patientID`),
  KEY `staffMember` (`staffMember`),
  CONSTRAINT `appointment_ibfk_1` FOREIGN KEY (`locationID`, `campaignID`) REFERENCES `campaignlocation` (`locationID`, `campaignID`),
  CONSTRAINT `appointment_ibfk_2` FOREIGN KEY (`campaignVaccID`) REFERENCES `campaignvaccines` (`campaignVaccID`),
  CONSTRAINT `appointment_ibfk_3` FOREIGN KEY (`patientID`) REFERENCES `patient` (`patientID`),
  CONSTRAINT `appointment_ibfk_4` FOREIGN KEY (`staffMember`) REFERENCES `acctlocation` (`accountID`)
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `appointment`
--

LOCK TABLES `appointment` WRITE;
/*!40000 ALTER TABLE `appointment` DISABLE KEYS */;
INSERT INTO `appointment` VALUES (1,1,1,1,104,1,'2022-01-24','12:00:00','C','Email','On Time','Had a cough and runny nose.',2,NULL),(2,1,1,4,236,2,'2022-01-24','12:00:00','C','Phone','Late',NULL,2,NULL),(3,1,1,4,236,3,'2022-02-11','12:00:00','F','Phone',NULL,NULL,NULL,NULL),(4,1,1,NULL,NULL,NULL,'2022-02-12','12:00:00','O',NULL,NULL,NULL,NULL,NULL),(5,1,1,NULL,NULL,NULL,'2022-02-12','12:00:00','O',NULL,NULL,NULL,NULL,NULL),(6,1,1,NULL,NULL,NULL,'2022-02-12','12:00:00','O',NULL,NULL,NULL,NULL,NULL),(7,1,1,NULL,NULL,NULL,'2022-02-12','12:15:00','O',NULL,NULL,NULL,NULL,NULL),(8,1,1,NULL,NULL,NULL,'2022-02-12','12:15:00','O',NULL,NULL,NULL,NULL,NULL),(9,1,1,NULL,NULL,NULL,'2022-02-12','12:15:00','O',NULL,NULL,NULL,NULL,NULL),(10,1,1,1,NULL,4,'2022-02-12','12:15:00','F','Phone',NULL,NULL,NULL,NULL),(11,1,1,NULL,NULL,NULL,'2022-02-12','12:30:00','O',NULL,NULL,NULL,NULL,NULL),(12,1,1,NULL,NULL,NULL,'2022-02-12','12:30:00','O',NULL,NULL,NULL,NULL,NULL),(13,1,1,NULL,NULL,NULL,'2022-02-12','12:30:00','O',NULL,NULL,NULL,NULL,NULL),(14,1,1,NULL,NULL,NULL,'2022-02-12','12:45:00','O',NULL,NULL,NULL,NULL,NULL),(15,1,1,NULL,NULL,NULL,'2022-02-12','12:45:00','O',NULL,NULL,NULL,NULL,NULL),(16,1,1,NULL,NULL,NULL,'2022-02-12','12:45:00','O',NULL,NULL,NULL,NULL,NULL),(17,1,1,NULL,NULL,NULL,'2022-02-12','13:00:00','O',NULL,NULL,NULL,NULL,NULL),(18,1,1,NULL,NULL,NULL,'2022-02-12','13:00:00','O',NULL,NULL,NULL,NULL,NULL),(19,1,1,NULL,NULL,NULL,'2022-01-28','13:00:00','O',NULL,NULL,NULL,NULL,NULL);
/*!40000 ALTER TABLE `appointment` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `audit`
--

DROP TABLE IF EXISTS `audit`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `audit` (
  `auditNum` int(11) NOT NULL AUTO_INCREMENT,
  `accountID` int(11) NOT NULL,
  `action` varchar(10) DEFAULT NULL,
  `alteredTable` varchar(20) DEFAULT NULL,
  `beforeChange` varchar(255) DEFAULT NULL,
  `afterChange` varchar(255) DEFAULT NULL,
  `actionDate` date DEFAULT NULL,
  `actionTime` time DEFAULT NULL,
  PRIMARY KEY (`auditNum`),
  KEY `accountID` (`accountID`),
  CONSTRAINT `audit_ibfk_1` FOREIGN KEY (`accountID`) REFERENCES `account` (`accountID`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `audit`
--

LOCK TABLES `audit` WRITE;
/*!40000 ALTER TABLE `audit` DISABLE KEYS */;
INSERT INTO `audit` VALUES (1,1,'View','appointment','None','None','2022-01-24','20:59:29');
/*!40000 ALTER TABLE `audit` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `campaign`
--

DROP TABLE IF EXISTS `campaign`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `campaign` (
  `campaignID` int(11) NOT NULL AUTO_INCREMENT,
  `campaignName` varchar(50) DEFAULT NULL,
  `campaignDate` date DEFAULT NULL,
  `campaignStatus` char(1) DEFAULT NULL,
  PRIMARY KEY (`campaignID`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `campaign`
--

LOCK TABLES `campaign` WRITE;
/*!40000 ALTER TABLE `campaign` DISABLE KEYS */;
INSERT INTO `campaign` VALUES (1,'Monroe Covid-19 Vaccination Campaign','2022-01-21','a'),(2,'Test Campaign','2022-01-26','i');
/*!40000 ALTER TABLE `campaign` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `campaignlocation`
--

DROP TABLE IF EXISTS `campaignlocation`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `campaignlocation` (
  `locationID` int(11) NOT NULL,
  `campaignID` int(11) NOT NULL,
  `status` varchar(10) DEFAULT NULL,
  PRIMARY KEY (`locationID`,`campaignID`),
  KEY `campaignID` (`campaignID`),
  CONSTRAINT `campaignlocation_ibfk_1` FOREIGN KEY (`locationID`) REFERENCES `location` (`locationID`),
  CONSTRAINT `campaignlocation_ibfk_2` FOREIGN KEY (`campaignID`) REFERENCES `campaign` (`campaignID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `campaignlocation`
--

LOCK TABLES `campaignlocation` WRITE;
/*!40000 ALTER TABLE `campaignlocation` DISABLE KEYS */;
INSERT INTO `campaignlocation` VALUES (1,1,'Active'),(2,1,'Inactive'),(3,1,'Active');
/*!40000 ALTER TABLE `campaignlocation` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `campaignvaccines`
--

DROP TABLE IF EXISTS `campaignvaccines`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `campaignvaccines` (
  `campaignVaccID` int(11) NOT NULL AUTO_INCREMENT,
  `campaignID` int(11) DEFAULT NULL,
  `vaccineType` varchar(50) DEFAULT NULL,
  `manufacturer` varchar(50) DEFAULT NULL,
  `vaccineDose` varchar(20) DEFAULT NULL,
  `daysBetweenDoses` int(4) DEFAULT NULL,
  PRIMARY KEY (`campaignVaccID`),
  KEY `campaignID` (`campaignID`),
  KEY `vaccineType` (`vaccineType`,`manufacturer`),
  CONSTRAINT `campaignvaccines_ibfk_1` FOREIGN KEY (`campaignID`) REFERENCES `campaign` (`campaignID`),
  CONSTRAINT `campaignvaccines_ibfk_2` FOREIGN KEY (`vaccineType`, `manufacturer`) REFERENCES `vaccine` (`vaccineType`, `manufacturer`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `campaignvaccines`
--

LOCK TABLES `campaignvaccines` WRITE;
/*!40000 ALTER TABLE `campaignvaccines` DISABLE KEYS */;
INSERT INTO `campaignvaccines` VALUES (1,1,'COVID-19','Johnson & Johnson','1st',30),(2,1,'COVID-19','Johnson & Johnson','Booster',30),(3,1,'COVID-19','Moderna','1st',14),(4,1,'COVID-19','Moderna','2nd',30),(5,1,'COVID-19','Moderna','Booster',30),(6,1,'COVID-19','Pfizer','1st',14),(7,1,'COVID-19','Pfizer','2nd',30),(8,1,'COVID-19','Pfizer','Booster',30);
/*!40000 ALTER TABLE `campaignvaccines` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `location`
--

DROP TABLE IF EXISTS `location`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `location` (
  `locationID` int(11) NOT NULL AUTO_INCREMENT,
  `locationName` varchar(50) DEFAULT NULL,
  `locationCity` varchar(50) DEFAULT NULL,
  `locationState` char(2) DEFAULT NULL,
  `locationAddr` varchar(50) DEFAULT NULL,
  `locationZip` varchar(10) DEFAULT NULL,
  PRIMARY KEY (`locationID`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `location`
--

LOCK TABLES `location` WRITE;
/*!40000 ALTER TABLE `location` DISABLE KEYS */;
INSERT INTO `location` VALUES (1,'Dome Arena','Henrietta','NY','2695 East Henrietta Road','14467'),(2,'Rochester General Hospital','Rochester','NY','1425 Portland Avenue','14621'),(3,'Trillium Health Clinic','Rochester','NY','259 Monroe Avenue','14607');
/*!40000 ALTER TABLE `location` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `patient`
--

DROP TABLE IF EXISTS `patient`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `patient` (
  `patientID` int(11) NOT NULL AUTO_INCREMENT,
  `firstName` varchar(20) DEFAULT NULL,
  `lastName` varchar(20) DEFAULT NULL,
  `dateOfBirth` date DEFAULT NULL,
  `sex` char(1) DEFAULT NULL,
  `race` varchar(20) DEFAULT NULL,
  `email` varchar(50) DEFAULT NULL,
  `phone` varchar(15) DEFAULT NULL,
  `city` varchar(50) DEFAULT NULL,
  `state` char(2) DEFAULT NULL,
  `address` varchar(50) DEFAULT NULL,
  `zip` varchar(10) DEFAULT NULL,
  `careProvider` varchar(50) DEFAULT NULL,
  `insuranceNum` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`patientID`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `patient`
--

LOCK TABLES `patient` WRITE;
/*!40000 ALTER TABLE `patient` DISABLE KEYS */;
INSERT INTO `patient` VALUES (1,'Troy','Seeley','1999-12-22','M','White','tseeley32@gmail.com','5852343220','Rochester','NY','22 Fetzner Road','14616','MVP Healthcare','234D14A065'),(2,'Mark','Seeley','1994-10-04','M','White','mseeley32@outlook.com','5852453221','Rochester','NY','22 Fetzner Road','14616','MVP Healthcare','234D14A064'),(3,'John','Brown','1951-04-13','M','White','johnEBrown@outlook.com','5852453221','Henrietta','NY','2043 Concord Street','14627','Bluecross Blueshield','23E414A066'),(4,'Scott','Wilson','1970-03-19','M','White','swilson445@gmail.com','8604182843','Brockport','NY','183 Rockwell Lane','14610','Johnson & Johnson','21GF896A934');
/*!40000 ALTER TABLE `patient` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `vaccine`
--

DROP TABLE IF EXISTS `vaccine`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `vaccine` (
  `vaccineType` varchar(50) NOT NULL,
  `manufacturer` varchar(50) NOT NULL,
  `qualifyQuestions` json DEFAULT NULL,
  PRIMARY KEY (`vaccineType`,`manufacturer`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `vaccine`
--

LOCK TABLES `vaccine` WRITE;
/*!40000 ALTER TABLE `vaccine` DISABLE KEYS */;
INSERT INTO `vaccine` VALUES ('COVID-19','Johnson & Johnson','{\"q1\": {\"flag\": \"Yes\", \"answers\": [\"Yes\", \"No\"], \"question\": \"Are you immunocompromised, a healthcare worker, first responder, or over the age of 65?\"}, \"q2\": {\"flag\": \"No\", \"answers\": [\"Yes\", \"No\"], \"question\": \"Have you had a fever, cough, or sore throat in the past 48 hours?\"}, \"flagsToQualify\": 2}'),('COVID-19','Moderna','{\"q1\": {\"flag\": \"Yes\", \"answers\": [\"Yes\", \"No\"], \"question\": \"Are you immunocompromised, a healthcare worker, first responder, or over the age of 65?\"}, \"q2\": {\"flag\": \"No\", \"answers\": [\"Yes\", \"No\"], \"question\": \"Have you had a fever, cough, or sore throat in the past 48 hours?\"}, \"flagsToQualify\": 2}'),('COVID-19','Pfizer','{\"q1\": {\"flag\": \"Yes\", \"answers\": [\"Yes\", \"No\"], \"question\": \"Are you immunocompromised, a healthcare worker, first responder, or over the age of 65?\"}, \"q2\": {\"flag\": \"No\", \"answers\": [\"Yes\", \"No\"], \"question\": \"Have you had a fever, cough, or sore throat in the past 48 hours?\"}, \"flagsToQualify\": 2}');
/*!40000 ALTER TABLE `vaccine` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2022-01-31 18:16:41
