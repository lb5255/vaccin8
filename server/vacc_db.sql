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
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `account`
--

LOCK TABLES `account` WRITE;
/*!40000 ALTER TABLE `account` DISABLE KEYS */;
INSERT INTO `account` VALUES (2,'TestNurse','Test_Passwd02','Terry','Rohan','Nurse','terry32@outlook.com','5851532242'),(3,'TestNurse02','Test_Passwd03','Sarah','Yost','Nurse','sarah32@outlook.com','5853329878'),(4,'TestStaff','Test_Passwd04','Jake','Karo','Staff','jake32@outlook.com','5851338484'),(5,'TestStaff02','Test_Passwd05','Sandra','Read','Staff','sandra32@yahoo.com','5852344348'),(6,'TestAdmin03','Test_Passwd06','John','Testa','Admin','john124@gmail.com','3154557193'),(14,'Main01','$2b$12$9Pz.nt3tpzq/LqKRQ6SybumZ6niPvykPM5ezohae0hkm83US.Qsau','Paul','Bray','Admin','Bray12@gmail.com','5859980090'),(15,'MainStaff','$2b$12$NSeh2pBHtJn7U39t9s4rguZdk.8MO38uB2FiaHEhycXLhFzEDwSIC','Jack','Castello','Staff','jcastello@gmail.com','5854603443'),(16,'MainNurse','$2b$12$LQm76MEWjTMYTanRon5GiuRMmESYXdK4ELmpD/uxdu6lVOMIUUBDK','Nate','Wilcox','Nurse','nwilcox@gmail.com','5851225190'),(19,'Manager01','$2b$12$L1lN7poe7o88vBUWpnXp8uK/n.DCtOc3x15ZiYWsNqG6xmEFZh9dq','Todd','Waltman','Site Manager','Twalt558@frontier.com','5851253120');
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
INSERT INTO `acctlocation` VALUES (2,1,'Active','N'),(2,2,'Active','N'),(3,1,'Active','N'),(3,2,'Active','N'),(4,1,'Active','N'),(4,3,'Inactive','N'),(5,1,'Active','N'),(5,2,'Active','N'),(6,1,'Active','Y'),(15,1,'Active','N'),(15,2,'Active','N'),(16,1,'Active','N'),(16,2,'Active','N'),(16,3,'Active','N'),(19,1,'Active','Y'),(19,2,'Active','Y'),(19,3,'Active','Y');
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
  `batchNum` varchar(50) DEFAULT NULL,
  `patientID` int(11) DEFAULT NULL,
  `apptDate` date DEFAULT NULL,
  `apptTime` time DEFAULT NULL,
  `apptStatus` char(1) DEFAULT NULL,
  `perferredContact` varchar(5) DEFAULT NULL,
  `arrival` varchar(7) DEFAULT NULL,
  `preCheck` varchar(255) DEFAULT NULL,
  `staffMember` int(11) DEFAULT NULL,
  `advReaction` varchar(255) DEFAULT NULL,
  `vaccDatestamp` datetime DEFAULT NULL,
  `advReactionReporter` int(11) DEFAULT NULL,
  PRIMARY KEY (`appointmentID`),
  KEY `locationID` (`locationID`,`campaignID`),
  KEY `campaignVaccID` (`campaignVaccID`),
  KEY `patientID` (`patientID`),
  KEY `staffMember` (`staffMember`),
  KEY `appointment_ibfk_5` (`advReactionReporter`),
  CONSTRAINT `appointment_ibfk_1` FOREIGN KEY (`locationID`, `campaignID`) REFERENCES `campaignlocation` (`locationID`, `campaignID`),
  CONSTRAINT `appointment_ibfk_2` FOREIGN KEY (`campaignVaccID`) REFERENCES `campaignvaccines` (`campaignVaccID`),
  CONSTRAINT `appointment_ibfk_3` FOREIGN KEY (`patientID`) REFERENCES `patient` (`patientID`),
  CONSTRAINT `appointment_ibfk_4` FOREIGN KEY (`staffMember`) REFERENCES `acctlocation` (`accountID`),
  CONSTRAINT `appointment_ibfk_5` FOREIGN KEY (`advReactionReporter`) REFERENCES `acctlocation` (`accountID`)
) ENGINE=InnoDB AUTO_INCREMENT=45 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `appointment`
--

LOCK TABLES `appointment` WRITE;
/*!40000 ALTER TABLE `appointment` DISABLE KEYS */;
INSERT INTO `appointment` VALUES (1,1,1,1,'104',1,'2022-03-04','12:00:00','C','Email','On Time','Had a cough and runny nose.',2,'Nausea and trouble breathing',NULL,15),(2,1,1,4,'236',2,'2022-03-04','12:00:00','C','Phone','Late',NULL,2,'Light headed and trouble breathing',NULL,15),(3,1,1,4,'236',3,'2022-03-04','12:00:00','A','Phone',NULL,NULL,16,'Light headed and trouble breathing',NULL,15),(4,1,1,2,'104',9,'2022-04-10','12:00:00','F','Email',NULL,NULL,2,'Light headed and trouble breathing',NULL,15),(5,1,1,NULL,NULL,NULL,'2022-04-10','12:15:00','O',NULL,NULL,NULL,NULL,NULL,NULL,NULL),(6,1,1,NULL,NULL,NULL,'2022-04-10','12:30:00','O',NULL,NULL,NULL,NULL,NULL,NULL,NULL),(7,1,1,NULL,NULL,NULL,'2022-04-10','12:15:00','O',NULL,NULL,NULL,NULL,NULL,NULL,NULL),(8,1,1,NULL,NULL,NULL,'2022-04-10','12:30:00','O',NULL,NULL,NULL,NULL,NULL,NULL,NULL),(9,1,1,NULL,NULL,NULL,'2022-04-10','12:45:00','O',NULL,NULL,NULL,NULL,NULL,NULL,NULL),(10,1,1,1,'104',4,'2022-04-10','12:15:00','F','Phone',NULL,NULL,16,'Nausea and coughing',NULL,3),(11,1,1,7,'104',7,'2022-04-10','12:30:00','F','Email',NULL,NULL,16,'Nausea and coughing',NULL,3),(12,1,1,4,'320',5,'2022-03-04','12:30:00','C','Email',NULL,NULL,3,'Nausea and coughing','2022-02-07 18:13:04',5),(13,1,1,NULL,NULL,NULL,'2022-04-10','12:30:00','O',NULL,NULL,NULL,NULL,NULL,NULL,NULL),(14,1,1,NULL,NULL,NULL,'2022-04-10','12:45:00','O',NULL,NULL,NULL,NULL,NULL,NULL,NULL),(15,1,1,NULL,NULL,NULL,'2022-04-10','13:00:00','O',NULL,NULL,NULL,NULL,NULL,NULL,NULL),(16,1,1,1,'13A',4,'2022-04-10','13:45:00','C',NULL,NULL,NULL,3,'Had a coughing fit 10 minutes after recieving the dose',NULL,5),(17,1,1,4,'1D3B',7,'2022-04-10','13:00:00','C',NULL,NULL,NULL,3,'Had a coughing fit 10 minutes after recieving the dose',NULL,5),(18,1,1,3,'190M',2,'2022-04-10','13:15:00','C',NULL,NULL,NULL,3,'Had a coughing fit 10 minutes after recieving the dose',NULL,15),(19,1,1,NULL,NULL,NULL,'2022-04-10','13:30:00','O',NULL,NULL,NULL,NULL,NULL,NULL,NULL),(20,1,1,NULL,NULL,NULL,'2022-04-10','14:00:00','O',NULL,NULL,NULL,NULL,NULL,NULL,NULL),(21,1,1,NULL,NULL,NULL,'2022-04-10','14:15:00','O',NULL,NULL,NULL,NULL,NULL,NULL,NULL),(22,1,1,NULL,NULL,NULL,'2022-04-10','14:30:00','O',NULL,NULL,NULL,NULL,NULL,NULL,NULL),(23,1,1,NULL,NULL,NULL,'2022-04-10','14:45:00','O',NULL,NULL,NULL,NULL,NULL,NULL,NULL),(24,1,1,NULL,NULL,NULL,'2022-04-10','15:00:00','O',NULL,NULL,NULL,NULL,NULL,NULL,NULL),(25,1,1,NULL,NULL,NULL,'2022-04-10','15:15:00','O',NULL,NULL,NULL,NULL,NULL,NULL,NULL),(26,1,1,NULL,NULL,NULL,'2022-04-10','15:30:00','O',NULL,NULL,NULL,NULL,NULL,NULL,NULL),(27,1,1,NULL,NULL,NULL,'2022-04-10','13:00:00','O',NULL,NULL,NULL,NULL,NULL,NULL,NULL),(28,1,1,NULL,NULL,NULL,'2022-04-10','13:15:00','O',NULL,NULL,NULL,NULL,NULL,NULL,NULL),(29,1,1,NULL,NULL,NULL,'2022-04-10','13:30:00','O',NULL,NULL,NULL,NULL,NULL,NULL,NULL),(30,1,1,NULL,NULL,NULL,'2022-04-10','13:45:00','O',NULL,NULL,NULL,NULL,NULL,NULL,NULL),(31,1,1,3,NULL,NULL,'2022-03-04','14:00:00','C',NULL,NULL,NULL,NULL,NULL,NULL,NULL),(32,1,1,3,NULL,NULL,'2022-03-04','13:15:00','C',NULL,NULL,NULL,NULL,NULL,NULL,NULL),(33,1,1,3,NULL,9,'2022-03-04','13:30:00','C',NULL,NULL,NULL,16,'Congestion and Cough 5 minutes after the shot.',NULL,15),(34,1,1,3,NULL,NULL,'2022-03-04','13:45:00','C',NULL,NULL,NULL,NULL,NULL,NULL,NULL),(35,1,1,NULL,NULL,NULL,'2022-04-10','14:00:00','O',NULL,NULL,NULL,NULL,NULL,NULL,NULL),(36,1,1,NULL,NULL,NULL,'2022-04-10','10:00:00','O',NULL,NULL,NULL,NULL,NULL,NULL,NULL),(37,1,1,NULL,NULL,NULL,'2022-04-10','10:15:00','O',NULL,NULL,NULL,NULL,NULL,NULL,NULL),(38,1,1,NULL,NULL,NULL,'2022-04-10','10:30:00','O',NULL,NULL,NULL,NULL,NULL,NULL,NULL),(39,1,1,NULL,NULL,NULL,'2022-04-10','10:45:00','O',NULL,NULL,NULL,NULL,NULL,NULL,NULL),(40,1,1,7,NULL,NULL,'2022-03-04','11:00:00','C',NULL,NULL,NULL,NULL,NULL,NULL,NULL),(41,2,1,7,NULL,NULL,'2022-03-21','11:15:00','C',NULL,NULL,NULL,NULL,NULL,NULL,NULL),(42,1,1,7,NULL,NULL,'2022-03-21','11:30:00','C',NULL,NULL,NULL,NULL,NULL,NULL,NULL),(43,1,1,7,NULL,NULL,'2022-03-21','11:45:00','C',NULL,NULL,NULL,NULL,NULL,NULL,NULL),(44,1,1,7,NULL,NULL,'2022-03-22','12:00:00','C',NULL,NULL,NULL,NULL,NULL,NULL,NULL);
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
  `ageGroup` varchar(20) DEFAULT NULL,
  `doseAmount` varchar(20) DEFAULT NULL,
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
INSERT INTO `campaignvaccines` VALUES (1,1,'COVID-19','Johnson & Johnson','1st',30,'Adult 12+','0.3 mL'),(2,1,'COVID-19','Johnson & Johnson','Booster',30,'Adult 12+','0.3 mL'),(3,1,'COVID-19','Moderna','1st',14,'Adult 12+','0.3 mL'),(4,1,'COVID-19','Moderna','2nd',30,'Adult 12+','0.3 mL'),(5,1,'COVID-19','Moderna','Booster',30,'Adult 12+','0.3 mL'),(6,1,'COVID-19','Pfizer','1st',14,'Adult 12+','0.3 mL'),(7,1,'COVID-19','Pfizer','2nd',30,'Adult 12+','0.3 mL'),(8,1,'COVID-19','Pfizer','Booster',30,'Adult 12+','0.3 mL');
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
-- Table structure for table `locationtimes`
--

DROP TABLE IF EXISTS `locationtimes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `locationtimes` (
  `locationID` int(11) NOT NULL,
  `locationDay` char(3) NOT NULL,
  `locationOpen` time DEFAULT NULL,
  `locationClose` time DEFAULT NULL,
  PRIMARY KEY (`locationID`,`locationDay`),
  CONSTRAINT `locationtimes_ibfk_1` FOREIGN KEY (`locationID`) REFERENCES `location` (`locationID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `locationtimes`
--

LOCK TABLES `locationtimes` WRITE;
/*!40000 ALTER TABLE `locationtimes` DISABLE KEYS */;
INSERT INTO `locationtimes` VALUES (1,'Fri','09:00:00','18:00:00'),(1,'Mon','10:00:00','22:00:00'),(1,'Thu','09:00:00','18:00:00'),(1,'Tue','09:00:00','18:00:00'),(1,'Wed','09:00:00','18:00:00'),(2,'Fri','11:00:00','15:00:00'),(2,'Thu','11:00:00','15:00:00'),(3,'Sat','11:00:00','18:00:00'),(3,'Sun','11:00:00','18:00:00');
/*!40000 ALTER TABLE `locationtimes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `patient`
--

DROP TABLE IF EXISTS `patient`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `patient` (
  `patientID` int(11) NOT NULL AUTO_INCREMENT,
  `firstName` varchar(50) DEFAULT NULL,
  `middleName` varchar(50) DEFAULT NULL,
  `lastName` varchar(50) DEFAULT NULL,
  `dateOfBirth` date DEFAULT NULL,
  `sex` char(1) DEFAULT NULL,
  `race` varchar(20) DEFAULT NULL,
  `email` varchar(50) DEFAULT NULL,
  `phone` varchar(15) DEFAULT NULL,
  `address` varchar(50) DEFAULT NULL,
  `addressTwo` varchar(50) DEFAULT NULL,
  `city` varchar(50) DEFAULT NULL,
  `state` char(2) DEFAULT NULL,
  `zip` varchar(10) DEFAULT NULL,
  `idType` varchar(50) DEFAULT NULL,
  `idNum` varchar(9) DEFAULT NULL,
  `insuranceProvider` varchar(50) DEFAULT NULL,
  `ownerName` varchar(50) DEFAULT NULL,
  `insuranceNum` varchar(20) DEFAULT NULL,
  `insuranceGroup` varchar(50) DEFAULT NULL,
  `insurancePlan` varchar(50) DEFAULT NULL,
  `insuranceOther` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`patientID`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `patient`
--

LOCK TABLES `patient` WRITE;
/*!40000 ALTER TABLE `patient` DISABLE KEYS */;
INSERT INTO `patient` VALUES (1,'Troy',NULL,'Seeley','1999-12-22','M','White','tseeley32@gmail.com','5852343220','22 Fetzner Road',NULL,'Rochester','NY','14616',NULL,NULL,'MVP Healthcare',NULL,'234D14A065',NULL,NULL,NULL),(2,'Mark',NULL,'Seeley','1994-10-04','M','White','mseeley32@outlook.com','5852453221','22 Fetzner Road',NULL,'Rochester','NY','14616',NULL,NULL,'MVP Healthcare',NULL,'234D14A064',NULL,NULL,NULL),(3,'John',NULL,'Brown','1951-04-13','M','White','johnEBrown@outlook.com','5852453221','2043 Concord Street',NULL,'Henrietta','NY','14627',NULL,NULL,'Bluecross Blueshield',NULL,'23E414A066',NULL,NULL,NULL),(4,'Scott',NULL,'Wilson','1970-03-19','M','White','swilson445@gmail.com','8604182843','183 Rockwell Lane',NULL,'Brockport','NY','14610',NULL,NULL,'Johnson & Johnson',NULL,'21GF896A934',NULL,NULL,NULL),(5,'Mark',NULL,'Haboian','1978-10-21','M','White','mhaboian@frontiernet.net','5855459112','29 Stonehill Drive',NULL,'Rochester','NY','14615',NULL,NULL,'MVP',NULL,'4FSD23545V',NULL,NULL,NULL),(6,'Maria',NULL,'Haboian','1978-10-21','F','White','mariahaboian@frontiernet.net','5855459112','29 Stonehill Drive',NULL,'Rochester','NY','14615',NULL,NULL,'MVP',NULL,'4FSD23545V',NULL,NULL,NULL),(7,'Marco',NULL,'Cooper','1998-01-20','M','White','rcooper@yahoo.com','5853452202','22 Fetzner Lane',NULL,'Rochester','NY','14623',NULL,NULL,'MVP Healthcare',NULL,'E44507F32D',NULL,NULL,NULL),(8,'Michael',NULL,'Haboian','1998-12-04',NULL,NULL,'mikeh350@outlook.com','5853606646','29 Stonehill Drive',NULL,'Rochester','NY','14615',NULL,NULL,'MVP Healthcare',NULL,NULL,NULL,NULL,NULL),(9,'Randy',NULL,'Tora','1998-12-04',NULL,NULL,'mikeh350@outlook.com','5853606646','29 Stonehill Drive',NULL,'Rochester','NY','14615',NULL,NULL,'MVP Healthcare',NULL,NULL,NULL,NULL,NULL);
/*!40000 ALTER TABLE `patient` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `session`
--

DROP TABLE IF EXISTS `session`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `session` (
  `sessionInfo` varchar(255) NOT NULL,
  `accountID` int(11) NOT NULL,
  PRIMARY KEY (`sessionInfo`),
  KEY `accountID` (`accountID`),
  CONSTRAINT `session_ibfk_1` FOREIGN KEY (`accountID`) REFERENCES `account` (`accountID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `session`
--

LOCK TABLES `session` WRITE;
/*!40000 ALTER TABLE `session` DISABLE KEYS */;
INSERT INTO `session` VALUES ('0CozKHLunqqm+w39S36z02wA+CNwyqkMd/a3oznEubgaKW8i4zopTrmVTqlIsEbljVu3Yb5ukV5ESJr7gh/8TZduqBbk8+mgy/lqOs5IARRGfKKEbOkuNjN/vTyXacXQ2jqpDLJzg3RECbNDMR5A47DAxDGp2EkxoB6ua/kNT8s=',14),('0X+ox7LWGG3XIKRE9YsRLI6xz9hcCQKLVDinZkoeZNtZgIPBKkr8g1yUErMiJAZIfXwLM7kFfwTRpIQ9cgSa5t3AT9z8RD5bxprrUy6Jxp+PzDMkiiKKepLftGOGbpo+DV0aYT8k9Y/Vd1XMSZWKhpraTSbD/y37kXG3Vetz9AA=',14),('9vQi+GYNfuk05AfEgVzps1g6rO1tUYtmjhqWIO/uRLjAs/MgXaXahJq9Z8CdiaUqA1LKKbyvoCtMMj9+1aOIVhRbDDK4jbebGWmYeaPxsdOH2o6s97d0ufh7cWBXk8EWwP83/iFkZo3cYZMOdefqrZsGMNf/J7dl4o85lO7rSXY=',14),('EbFZTccOQOTUWbQx8TC0wwsNztB7v6Ev4yHQkQlxpj1QvrAwho9tJobUSEdQRd7wzWNtQqCwvyyVulf4+JBgmW1cwfseRCbu2hx3cGkKRR0WB7+DG+OtBAEgNlog6Z/4ww6cJA7VLjA3UWqLkFp2u7S1pGpnhemYQM2gOZEjQvc=',14),('fVSiji+ElaFfcEXtpdSg05mZryGDgKBXUlWnCzsH59s6fxUKKxAX7EAticRFmhajE2w6SRWYtLAH0KOe1TsV/BwBQNEf0nqr1OAgPPWwLWZQz7zJKAoGR61iUpBOt6xLDHa4ZYAIkCK7ObadLeZUlieSm69e5PgvV2Yu1h3hs6I=',14),('h1GDlt7sIUYuxqJfop+6OY4Dk+E8YWOUMrD0i2tf9PuK5dZxGjj85HLIa0Gq95PkfIF0SgKtf95zn6TBi4MyfZgHwqvU9F/OdhCByT33qWjvF9PZMqZucezg3TD8jwZqHqNxE+VO8Y3FhEKmuTm1pLKApV8rKDzyCIO5mFOLwN4=',14),('jDKVXcFYCqhzYKGRyeGp73RrZzIKwRKmdvjVg8xxm7IWEAi6SNdatRR/93eMQiKkbTrzFhHGr4bu7kpKW14AFTyXkespRK/AgqH3yhfJe3UmjgfG21ZXkXsYts0Fs1/iCazv61MPvdkMOXa0STCLOu6LK67Zu5YE1qclFca5+i8=',14),('mJCezX1NXoYsIsX1SEPolBMpT42E9l7PhnIqCAeHbtdoMgL4dbvIOfPemugnbUNFOfN9C78XI2RaO3o3BEj5iV+ievijoo0cNlMFtaR1pNYHU1S7Ye59DiApC23JFJd+Udho0nl17ti60fV7rW0zIaqAk0i7appDIIC2Hs4GrbE=',14),('OgK96BRL3IQSEpR19/qhiINws/CbNywtwkVEN+XE61tbHMRvABooINEzVLvUNL1aBkvlfGTssQpqSlARKa8DgR7yhZsAdyho6r/aVnFECQNWh3aIN9itiqRnO6mXqn64aJ3fQiQTH85w2zarnVXsB5Bz7pTVLmaxCCzS5KyuYds=',14),('oxCvQ5NIYMZFDquy+uBOobFpJ/Gt4Fo4CU5QXCTPcNyHSkwIZwsU2VsTx2vdvweEyH+9BiaSXtCKeMJDVRLzrd1sdXqOwp5DaRyBETIJdh+zjDsEQMye7ED3+1EEfmA+SAcxJ2Ztez+ag7zbsRrdDRLFXjp96+oGdYLDR1X4hhE=',14),('qSnefJcuWxptFJiWoH2O7c3vgKmo/BWmWwUA09o9SHi/wrbolz1nrCmMC6baxQBwcC0D6pZl5/Zu3hGNcM946FXmHzMmWEO5QQI02DLa8gQ4A66h+QuQJBRIyKPOnjOxG9KdHKlSgKCsBr/In/n1S33eQEHQFCqATRakKSJFTZ8=',14),('RHR13gKBLSTrQaMR3Sk6GhDxDZP6W7fj8WF3l50ah7xWMTnGFnB2Q4ayfSDzxR28MD25okZNXNjTzsHEMhK6Dn//T1WkEfjyqy8chzy/MEE2x15RpwcxRbXUP8Vj1ehBYVodNHGJT8NemFASFlEGmoZePvQoeB4P6ZqjxyaZBOI=',14),('RpS76MK+7EMQz2JsSMje2BoABHX3z6rty35vEOJHrzvoCCgRz8WFkQp+W1MJstv19Ma8L1HAiQzjtPv86ibPFX13Y1dV1Mcz8DesXhNb1HgjFZWPp92Qd8cBwOJgwNqPF8aIAjz3tHmCZa233KTBQcWPHEQFerAaads5F9DEaRk=',14),('sS5lQj2BgvH68OaqAR+URayUcHQ0EWXrmPcxGvxETiYpbHXPq/6O6tWIAIvXNyYFcexvDQ3x19Q8LBS0bLCoxBC6Otkbb9HeJo8/u2A/T9HzB/QiaidkGJPBq8aZc4y0LouUYkG8kv3lJ7S6Rgy5dUhdjV20g0MGEGlSiVSrK4A=',14),('vPukkc0C+sCB1P8w+YQcDnpMq1zjECbRmdF3uke6GWeFlr/mI9lBcdGei9QUYt/tWffSAWdf+Q4BlkzkNl+hHBMSNkAdQ1yRNY91Cks/+rBQU5QnSLxcK9lQsv7Or3Z886vq+clirw/8ygHEb1D3WjqlwmQhsmgutu86/QxqIRE=',14),('w0so3bD/ufyDqZu4G84aDR0rbkfGOW2KRFHEyrTEo+pnJakPGpnXOxvIMR9yZ8Cwx/MIU2jI56tzPNNQyxK5OCqsPKWJsGi1N4hsNaLblCGTsI4ZPk1RnTrjfoG/CcWV5kzdzOFgDSkym05d2pyR8xdJqN7Owwp1Oe0cmL0QRms=',14),('W1fhJlvk+fY5lXplQOOg2qh62ePWVcoxxIA+xbyLZrBdwYTya6YocVU6obbJGz4FpmR7/rOnHrZsUOF+9QfJEW2hZMt0NS2+c2kGHNDah2YfOE33AbWvuyiSYXIC+bSf13IfEib1aZTW+qVwkxF9hb7fmSMw7yWNuPN1/PaMMR4=',14),('KV89o/o5Amub4YdAh2ou/TYQJ6inndp3ner6ihE2ozBoCt/EP7XhUQsOIH0k4RVrO8rUXXrYO8+fRTR/gJWJIIYSaWIxZHE8RmechOzWpDrLq0IlZrOckiOVkLWfxFm3ZDU5b/sQyIo+320n9Y9uuxOlF81GQLNNS8JYlrv3AEo=',15),('Tik/ak+8d405h6dNvXI//xUpnzgCN1jdjko0ZY7T3iGIJ2RJtvgqraci0+ptHTJtb7R6f6h1WVaY0n4KAZ5rqVLvvW+n2MARe7xLUPRASsmqRrejyWBU9ILkm7s2vsNLukwF0OXEuxs2yZmsNSWeljSRViF8QoFaDK4eeiNYq5Y=',15),('+BL2cq45UwByBEmxsQS6fSQS3yg3vpxQG0Z7sRrfuvB2K3SV0vft2x9f8OmUeXWcj8oysCwjMg/XqKp4xqm/lgDGlZp/7mLYdR8wmRioFnzi0X1FEGKhWraHqYOGEnLCzAJAw3lKHnIWcZHV4PhdfCHJgKd9XjAJhv8EVs3gAqE=',16);
/*!40000 ALTER TABLE `session` ENABLE KEYS */;
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
INSERT INTO `vaccine` VALUES ('COVID-19','Johnson & Johnson','{\"q1\": {\"flag\": \"Yes\", \"answers\": [\"Yes\", \"No\"], \"question\": \"Are you immunocompromised, a healthcare worker, first responder, or over the age of 65?\"}, \"q2\": {\"flag\": \"No\", \"answers\": [\"Yes\", \"No\"], \"question\": \"Have you had a fever, cough, or sore throat in the past 48 hours?\"}, \"flagsToQualify\": 2}'),('COVID-19','Moderna','{\"q1\": {\"flag\": \"Yes\", \"answers\": [\"Yes\", \"No\"], \"question\": \"Are you immunocompromised, a healthcare worker, first responder, or over the age of 65?\"}, \"q2\": {\"flag\": \"No\", \"answers\": [\"Yes\", \"No\"], \"question\": \"Have you had a fever, cough, or sore throat in the past 48 hours?\"}, \"flagsToQualify\": 2}'),('COVID-19','Pfizer','{\"q1\": {\"flag\": \"Yes\", \"answers\": [\"Yes\", \"No\"], \"question\": \"Are you immunocompromised, a healthcare worker, first responder, or over the age of 65?\"}, \"q2\": {\"flag\": \"No\", \"answers\": [\"Yes\", \"No\"], \"question\": \"Have you had a fever, cough, or sore throat in the past 48 hours?\"}, \"flagsToQualify\": 2}'),('Flu','Afluria Quadrivalent',NULL),('Flu','Fluarix Quadrivalent',NULL);
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

-- Dump completed on 2022-03-29  1:04:43
