
USE `class/pla`;

-- MySQL dump 10.13  Distrib 5.7.9, for Win64 (x86_64)
--
-- Host: localhost    Database: class/pla
-- ------------------------------------------------------
-- Server version	5.7.11-log

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Dumping data for table `course`
--

LOCK TABLES `course` WRITE;
/*!40000 ALTER TABLE `course` DISABLE KEYS */;
INSERT INTO `course` (`CourseID`, `Number`, `Name`, `OrganizationID`, `CreatorID`, `Abbreviations`, `Description`) VALUES (1,'CS100','Intro to Computer Science',1,2,NULL,NULL),(2,'Math121','Calculus II',1,1,NULL,NULL),(3,'CS280','Programming Language Concept',1,2,NULL,NULL),(4,'CS288','Intensive programming in Linux',1,2,NULL,NULL),(5,'CS 332','Principles of Operating Systems',1,1,NULL,NULL),(8,'Math 337','Linear Algebra',1,1,NULL,NULL),(9,'Calculus 2','Math 112',1,1,NULL,NULL),(10,'Phys 111','Physics 1',1,1,NULL,NULL),(11,'Phys 111','Physics 1',1,1,NULL,NULL),(12,'Phys 121','Phys 2',1,1,NULL,NULL),(13,'Phys 131','Phys 3',1,1,NULL,NULL);
/*!40000 ALTER TABLE `course` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `emailnotification`
--

LOCK TABLES `emailnotification` WRITE;
/*!40000 ALTER TABLE `emailnotification` DISABLE KEYS */;
/*!40000 ALTER TABLE `emailnotification` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `file`
--

LOCK TABLES `file` WRITE;
/*!40000 ALTER TABLE `file` DISABLE KEYS */;
INSERT INTO `file` (`FileID`, `UserID`, `Info`, `LastUpdated`) VALUES (229,2,'{\"path\": \"files\\\\7ac9345a0e98a102d8332c87d4a84030\", \"size\": 519336, \"encoding\": \"7bit\", \"filename\": \"7ac9345a0e98a102d8332c87d4a84030\", \"mimetype\": \"image/png\", \"fieldname\": \"files\", \"destination\": \"./files/\", \"originalname\": \"Pita.png\"}','2017-04-08 18:47:23'),(230,2,'{\"path\": \"files\\\\187b26ebef9d024a9e5072a7ee1e36fd\", \"size\": 325798, \"encoding\": \"7bit\", \"filename\": \"187b26ebef9d024a9e5072a7ee1e36fd\", \"mimetype\": \"application/pdf\", \"fieldname\": \"files\", \"destination\": \"./files/\", \"originalname\": \"How One Stupid Tweet Blew Up Justine Sacco’s Life - The New York Times.pdf\"}','2017-04-08 18:47:23'),(231,2,'{\"path\": \"files\\\\a2af4ae9514a0c5cf1067b23cc33d1df\", \"size\": 325798, \"encoding\": \"7bit\", \"filename\": \"a2af4ae9514a0c5cf1067b23cc33d1df\", \"mimetype\": \"application/pdf\", \"fieldname\": \"files\", \"destination\": \"./files/\", \"originalname\": \"How One Stupid Tweet Blew Up Justine Sacco’s Life - The New York Times (1).pdf\"}','2017-04-08 18:47:23');
/*!40000 ALTER TABLE `file` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `filereference`
--

LOCK TABLES `filereference` WRITE;
/*!40000 ALTER TABLE `filereference` DISABLE KEYS */;
/*!40000 ALTER TABLE `filereference` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `groups`
--

LOCK TABLES `groups` WRITE;
/*!40000 ALTER TABLE `groups` DISABLE KEYS */;
/*!40000 ALTER TABLE `groups` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `groupuser`
--

LOCK TABLES `groupuser` WRITE;
/*!40000 ALTER TABLE `groupuser` DISABLE KEYS */;
/*!40000 ALTER TABLE `groupuser` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `organization`
--

LOCK TABLES `organization` WRITE;
/*!40000 ALTER TABLE `organization` DISABLE KEYS */;
INSERT INTO `organization` (`OrganizationID`, `Name`, `UserID`) VALUES (1,'NJIT',NULL);
/*!40000 ALTER TABLE `organization` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `partialassignments`
--

LOCK TABLES `partialassignments` WRITE;
/*!40000 ALTER TABLE `partialassignments` DISABLE KEYS */;
/*!40000 ALTER TABLE `partialassignments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `resetpasswordrequest`
--

LOCK TABLES `resetpasswordrequest` WRITE;
/*!40000 ALTER TABLE `resetpasswordrequest` DISABLE KEYS */;
/*!40000 ALTER TABLE `resetpasswordrequest` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `section`
--

LOCK TABLES `section` WRITE;
/*!40000 ALTER TABLE `section` DISABLE KEYS */;
INSERT INTO `section` (`SectionID`, `SemesterID`, `CourseID`, `OrganizationID`, `Name`, `StartDate`, `EndDate`, `Description`) VALUES (1,1,1,1,'001','2016-09-01 00:00:00','2016-12-11 00:00:00','Description for CS100-001'),(2,1,1,1,'013','2016-09-01 00:00:00','2016-12-11 00:00:00','Description for CS100-013'),(3,1,1,1,'h01','2016-09-01 00:00:00','2016-12-11 00:00:00','Description for CS100-h13 --Honor\'s Section'),(4,2,1,1,'002','2017-01-15 00:00:00','2017-05-15 00:00:00','Description for CS100-002'),(5,2,1,1,'h02','2017-01-15 00:00:00','2017-05-15 00:00:00','Description for CS100-h02 --Honor\'s Section'),(6,1,2,1,'001','2016-09-01 00:00:00','2016-12-11 00:00:00','Description for Math111-001'),(7,1,2,1,'004','2016-09-01 00:00:00','2016-12-11 00:00:00','Description for Math111-004'),(8,1,3,1,'001','2016-09-01 00:00:00','2016-12-11 00:00:00','Description for CS280-001'),(9,2,3,1,'002','2017-01-15 00:00:00','2017-05-15 00:00:00','Description for CS280-002'),(10,1,3,1,'\'007\'',NULL,NULL,'\'CS280-007\''),(11,1,3,1,'\'008\'',NULL,NULL,'\'CS280-008\''),(12,1,3,1,'\'009\'','2016-09-01 00:00:00','2016-12-11 00:00:00','\'CS280-009\''),(14,1,10,1,'002','2016-09-01 00:00:00','2016-12-11 00:00:00','Morning Section'),(15,1,11,1,'002','2016-09-01 00:00:00','2016-12-11 00:00:00','morning'),(16,1,12,1,'002','2016-09-01 00:00:00','2016-12-11 00:00:00','asdasdsds'),(17,1,13,1,'004','2016-09-01 00:00:00','2016-12-11 00:00:00','morn');
/*!40000 ALTER TABLE `section` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `sectionuser`
--

LOCK TABLES `sectionuser` WRITE;
/*!40000 ALTER TABLE `sectionuser` DISABLE KEYS */;
INSERT INTO `sectionuser` (`SectionUserID`, `SectionID`, `UserID`, `UserRole`, `UserStatus`) VALUES (1,1,1,'Student','Active'),(2,1,3,'Student','Active'),(3,1,4,'Student','Inactive'),(4,1,69,'Student','Active'),(5,1,5,'Student','Active'),(6,6,69,'Student','Active'),(7,9,69,'Student','Active'),(8,3,1,'Student','Active'),(9,8,1,'Student','Active'),(10,7,1,'Student','Active'),(11,7,3,'Student','Active'),(12,7,4,'Student','Inactive'),(13,9,4,'Student','Inactive'),(14,16,69,'Student','Active'),(15,17,69,'Student','Active'),(16,3,4,'Student','Active'),(17,3,69,'Student','Active'),(18,3,3,'Student','Active'),(19,5,1,'Student','Active'),(20,5,3,'Student','Active'),(21,1,6,'Student','Active'),(22,1,7,'Student','Active'),(23,1,8,'Student','Active'),(24,1,9,'Student','Active'),(25,1,10,'Student','Active'),(26,1,11,'Student','Active'),(27,1,12,'Student','Active'),(28,1,13,'Student','Active'),(29,1,14,'Student','Active'),(30,1,15,'Student','Active'),(31,1,16,'Student','Active'),(32,1,17,'Student','Active'),(33,1,18,'Student','Active'),(34,1,19,'Student','Active');
/*!40000 ALTER TABLE `sectionuser` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `semester`
--

LOCK TABLES `semester` WRITE;
/*!40000 ALTER TABLE `semester` DISABLE KEYS */;
INSERT INTO `semester` (`SemesterID`, `OrganizationID`, `Name`, `StartDate`, `EndDate`) VALUES (1,1,'Fall2016','2016-09-01 00:00:00','2016-12-11 00:00:00'),(2,1,'Spring2017','2017-01-15 00:00:00','2017-05-15 00:00:00'),(7,1,'Fall2019','2019-09-01 00:00:00','2019-12-09 00:00:00');
/*!40000 ALTER TABLE `semester` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `user`
--

LOCK TABLES `user` WRITE;
/*!40000 ALTER TABLE `user` DISABLE KEYS */;
INSERT INTO `user` (`UserID`, `UserContactID`, `UserName`, `FirstName`, `LastName`, `MiddleInitial`, `Suffix`, `OrganizationGroup`, `UserType`, `Admin`, `Country`, `City`, `ProfilePicture`) VALUES (1,1,'ajr42','Alan','Romano','J',NULL,NULL,'Instructor',1,NULL,NULL,NULL),(2,2,'qxl2','Jimmy','Lu','',NULL,NULL,'Instuctor',1,NULL,NULL,NULL),(3,3,'abc1','Emily','Smith','S',NULL,NULL,'Student',0,NULL,NULL,NULL),(4,4,'bcd1','Joe','Johnson','R',NULL,NULL,'Student',0,NULL,NULL,NULL),(5,5,'perna','Angelo','Perna','',NULL,NULL,'Instuctor',0,NULL,NULL,NULL),(6,6,'abc2','John','Smith',NULL,NULL,NULL,'Student',0,NULL,NULL,NULL),(7,7,'abc3','Sara','Thor','C',NULL,NULL,'Student',0,NULL,NULL,NULL),(8,8,'abc4','Ivan ','Merit','G',NULL,NULL,'Student',0,NULL,NULL,NULL),(9,9,'abc5','Sawyer','Murry','T',NULL,NULL,'Student',0,NULL,NULL,NULL),(10,10,'abc6','Kevin','Hart',NULL,NULL,NULL,'Student',0,NULL,NULL,NULL),(11,11,'abc7','Ryan','Johnson','M',NULL,NULL,'Student',0,NULL,NULL,NULL),(12,12,'abc8','Caitlyn','Cook','I',NULL,NULL,'Student',0,NULL,NULL,NULL),(13,13,'abc9','Carley','Cook',NULL,NULL,NULL,'Student',0,NULL,NULL,NULL),(14,14,'abc10','David','Davidson',NULL,NULL,NULL,'Student',0,NULL,NULL,NULL),(15,15,'abc11','Megan','Fox',NULL,NULL,NULL,'Student',0,NULL,NULL,NULL),(16,16,'abc12','Fred','Hudson',NULL,NULL,NULL,'Student',0,NULL,NULL,NULL),(17,17,'abc13','Olivia','Kwan',NULL,NULL,NULL,'Student',0,NULL,NULL,NULL),(18,18,'abc14','Peter','Pan',NULL,NULL,NULL,'Student',0,NULL,NULL,NULL),(19,19,'abc15','Spongebob',NULL,NULL,NULL,NULL,'Student',0,NULL,NULL,NULL),(69,69,'ka267','Krzysztof','Squarepant','',NULL,NULL,'Student',0,NULL,NULL,NULL);
/*!40000 ALTER TABLE `user` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `usercontact`
--

LOCK TABLES `usercontact` WRITE;
/*!40000 ALTER TABLE `usercontact` DISABLE KEYS */;
INSERT INTO `usercontact` (`UserContactID`, `Email`, `Phone`) VALUES (1,'ajr42','675-234-4853'),(2,'qxl2','534-134-3353'),(3,'abc1@njit.edu','535-124-1234'),(4,'bcd1@njit.edu','123-524-7653'),(5,'perna@njit.edu','123-524-2345'),(6,'abc2@njit.edu','123-524-2346'),(7,'abc3@njit.edu','123-524-2347'),(8,'abc4@njit.edu','123-524-2348'),(9,'abc5@njit.edu','123-524-2349'),(10,'abc6@njit.edu','123-524-2350'),(11,'abc7@njit.edu','123-524-2351'),(12,'abc8@njit.edu','123-524-2352'),(13,'abc9@njit.edu','123-524-2353'),(14,'abc10@njit.edu','123-524-2354'),(15,'abc11@njit.edu','123-524-2355'),(16,'abc12@njit.edu','123-524-2356'),(17,'abc13@njit.edu','123-524-2357'),(18,'abc14@njit.edu','123-524-2358'),(19,'abc15@njit.edu','123-524-2359'),(69,'ka267@njit.edu','069-069-6969'),(70,'\"ka267@njit.edu\"','XXX-XXX-XXXX'),(71,'aja38@njit.edu','XXX-XXX-XXXX');
/*!40000 ALTER TABLE `usercontact` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `userlogin`
--

LOCK TABLES `userlogin` WRITE;
/*!40000 ALTER TABLE `userlogin` DISABLE KEYS */;
INSERT INTO `userlogin` (`UserID`, `Email`, `Password`, `Status`) VALUES (1,'ajr42@njit.edu','202cb962ac59075b964b07152d234b70',NULL),(2,'qxl2@njit.edu','202cb962ac59075b964b07152d234b70',NULL),(3,'abc1@njit.edu','202cb962ac59075b964b07152d234b70',NULL),(4,'bcd1@njit.edu','202cb962ac59075b964b07152d234b70',NULL),(5,'perna@njit.edu','202cb962ac59075b964b07152d234b70',NULL),(6,'abc2@njit.edu','202cb962ac59075b964b07152d234b70',NULL),(7,'abc3@njit.edu','202cb962ac59075b964b07152d234b70',NULL),(8,'abc4@njit.edu','202cb962ac59075b964b07152d234b70',NULL),(9,'abc5@njit.edu','202cb962ac59075b964b07152d234b70',NULL),(10,'abc6@njit.edu','202cb962ac59075b964b07152d234b70',NULL),(11,'abc7@njit.edu','202cb962ac59075b964b07152d234b70',NULL),(12,'abc8@njit.edu','202cb962ac59075b964b07152d234b70',NULL),(13,'abc9@njit.edu','202cb962ac59075b964b07152d234b70',NULL),(14,'abc10@njit.edu','202cb962ac59075b964b07152d234b70',NULL),(15,'abc11@njit.edu','202cb962ac59075b964b07152d234b70',NULL),(16,'abc12@njit.edu','202cb962ac59075b964b07152d234b70',NULL),(17,'abc13@njit.edu','202cb962ac59075b964b07152d234b70',NULL),(18,'abc14@njit.edu','202cb962ac59075b964b07152d234b70',NULL),(19,'abc15@njit.edu','202cb962ac59075b964b07152d234b70',NULL),(69,'ka267@njit.edu','7813d1590d28a7dd372ad54b5d29d033',NULL);
/*!40000 ALTER TABLE `userlogin` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2017-04-16 18:50:32
