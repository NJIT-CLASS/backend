CREATE DATABASE  IF NOT EXISTS `CLASS/PLA` /*!40100 DEFAULT CHARACTER SET latin1 */;
USE `CLASS/PLA`;
-- MySQL dump 10.13  Distrib 5.6.19, for osx10.7 (i386)
--
-- Host: localhost    Database: CLASS/PLA
-- ------------------------------------------------------
-- Server version	5.7.17

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
-- Table structure for table `Assignment`
--

DROP TABLE IF EXISTS `Assignment`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Assignment` (
  `AssignmentID` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `OwnerID` int(10) unsigned NOT NULL,
  `WorkflowActivityIDs` json DEFAULT NULL,
  `Instructions` text,
  `Documentation` text,
  `GradeDistribution` json DEFAULT NULL,
  `Name` varchar(255) DEFAULT NULL,
  `Type` varchar(255) DEFAULT NULL,
  `DisplayName` varchar(255) DEFAULT NULL,
  `SectionID` blob,
  `CourseID` int(10) unsigned NOT NULL,
  `SemesterID` int(10) unsigned DEFAULT NULL,
  `VersionHistory` json DEFAULT NULL,
  PRIMARY KEY (`AssignmentID`),
  UNIQUE KEY `AssignmentID` (`AssignmentID`),
  UNIQUE KEY `Assignment_AssignmentID_unique` (`AssignmentID`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Assignment`
--

LOCK TABLES `Assignment` WRITE;
/*!40000 ALTER TABLE `Assignment` DISABLE KEYS */;
INSERT INTO `Assignment` VALUES (1,2,'[1, 2]','','','{}','Assignment123','homework','Assignment123',NULL,1,NULL,NULL);
/*!40000 ALTER TABLE `Assignment` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `AssignmentInstance`
--

DROP TABLE IF EXISTS `AssignmentInstance`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `AssignmentInstance` (
  `AssignmentInstanceID` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `AssignmentID` int(10) unsigned NOT NULL,
  `SectionID` int(10) unsigned NOT NULL,
  `StartDate` datetime DEFAULT NULL,
  `EndDate` datetime DEFAULT NULL,
  `WorkflowCollection` json DEFAULT NULL,
  `WorkflowTiming` json DEFAULT NULL,
  `Volunteers` json DEFAULT NULL,
  PRIMARY KEY (`AssignmentInstanceID`),
  UNIQUE KEY `AssignmentInstanceID` (`AssignmentInstanceID`),
  UNIQUE KEY `AssignmentInstance_AssignmentInstanceID_unique` (`AssignmentInstanceID`),
  KEY `AssignmentID` (`AssignmentID`),
  KEY `SectionID` (`SectionID`),
  CONSTRAINT `assignmentinstance_ibfk_1` FOREIGN KEY (`AssignmentID`) REFERENCES `Assignment` (`AssignmentID`) ON DELETE NO ACTION ON UPDATE CASCADE,
  CONSTRAINT `assignmentinstance_ibfk_2` FOREIGN KEY (`SectionID`) REFERENCES `Section` (`SectionID`) ON DELETE NO ACTION ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `AssignmentInstance`
--

LOCK TABLES `AssignmentInstance` WRITE;
/*!40000 ALTER TABLE `AssignmentInstance` DISABLE KEYS */;
INSERT INTO `AssignmentInstance` (`AssignmentInstanceID`, `AssignmentID`, `SectionID`, `StartDate`, `EndDate`, `WorkflowCollection`, `WorkflowTiming`) VALUES (3,1,1,'1970-01-01 00:00:00',NULL,'[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38]','{\"workflows\": [{\"id\": \"1\", \"tasks\": [{\"id\": 1, \"DueType\": [\"duration\", 2880]}, {\"id\": 2, \"DueType\": [\"duration\", 2880]}, {\"id\": 3, \"DueType\": [\"duration\", 2880]}, {\"id\": 4, \"DueType\": [\"duration\", 2880]}, {\"id\": 5, \"DueType\": []}, {\"id\": 6, \"DueType\": [\"duration\", 2880]}, {\"id\": 7, \"DueType\": [\"duration\", 2880]}, {\"id\": 8, \"DueType\": [\"duration\", 2880]}, {\"id\": 9, \"DueType\": []}], \"startDate\": 0}, {\"id\": \"2\", \"tasks\": [{\"id\": 10, \"DueType\": [\"duration\", 2880]}, {\"id\": 11, \"DueType\": []}], \"startDate\": 0}]}'),(4,1,2,'1970-01-01 00:00:00',NULL,'[]','{\"workflows\": [{\"id\": \"1\", \"tasks\": [{\"id\": 1, \"DueType\": [\"duration\", 2880]}, {\"id\": 2, \"DueType\": [\"duration\", 2880]}, {\"id\": 3, \"DueType\": [\"duration\", 2880]}, {\"id\": 4, \"DueType\": [\"duration\", 2880]}, {\"id\": 5, \"DueType\": []}, {\"id\": 6, \"DueType\": [\"duration\", 2880]}, {\"id\": 7, \"DueType\": [\"duration\", 2880]}, {\"id\": 8, \"DueType\": [\"duration\", 2880]}, {\"id\": 9, \"DueType\": []}], \"startDate\": 0}, {\"id\": \"2\", \"tasks\": [{\"id\": 10, \"DueType\": [\"duration\", 2880]}, {\"id\": 11, \"DueType\": []}], \"startDate\": 0}]}');
/*!40000 ALTER TABLE `AssignmentInstance` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Course`
--

DROP TABLE IF EXISTS `Course`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Course` (
  `CourseID` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `Number` varchar(50) DEFAULT NULL,
  `Name` varchar(150) DEFAULT NULL,
  `OrganizationID` int(10) unsigned NOT NULL,
  `CreatorID` int(10) unsigned DEFAULT NULL,
  `Abbreviations` varchar(255) DEFAULT NULL,
  `Description` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`CourseID`),
  UNIQUE KEY `CourseID` (`CourseID`),
  UNIQUE KEY `Course_CourseID_unique` (`CourseID`),
  KEY `CreatorID` (`CreatorID`),
  CONSTRAINT `course_ibfk_1` FOREIGN KEY (`CreatorID`) REFERENCES `User` (`UserID`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Course`
--

LOCK TABLES `Course` WRITE;
/*!40000 ALTER TABLE `Course` DISABLE KEYS */;
INSERT INTO `Course` VALUES (1,'CS100','Intro to Computer Science',1,2,NULL,NULL),(2,'Math121','Calculus II',1,1,NULL,NULL),(3,'CS280','Programming Language Concept',1,2,NULL,NULL),(4,'CS288','Intensive programming in Linux',1,2,NULL,NULL),(5,'CS 332','Principles of Operating Systems',1,1,NULL,NULL),(8,'Math 337','Linear Algebra',1,1,NULL,NULL),(9,'Calculus 2','Math 112',1,1,NULL,NULL),(10,'Phys 111','Physics 1',1,1,NULL,NULL),(11,'Phys 111','Physics 1',1,1,NULL,NULL),(12,'Phys 121','Phys 2',1,1,NULL,NULL),(13,'Phys 131','Phys 3',1,1,NULL,NULL);
/*!40000 ALTER TABLE `Course` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `EmailNotification`
--

DROP TABLE IF EXISTS `EmailNotification`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `EmailNotification` (
  `EmailNotificationID` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `TaskInstanceID` int(10) unsigned DEFAULT NULL,
  PRIMARY KEY (`EmailNotificationID`),
  UNIQUE KEY `EmailNotificationID` (`EmailNotificationID`),
  UNIQUE KEY `EmailNotification_EmailNotificationID_unique` (`EmailNotificationID`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `EmailNotification`
--

LOCK TABLES `EmailNotification` WRITE;
/*!40000 ALTER TABLE `EmailNotification` DISABLE KEYS */;
/*!40000 ALTER TABLE `EmailNotification` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `GroupUser`
--

DROP TABLE IF EXISTS `GroupUser`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `GroupUser` (
  `GroupID` int(10) unsigned NOT NULL,
  `UserID` int(10) unsigned NOT NULL,
  `Role` int(11) NOT NULL,
  `Status` varchar(255) NOT NULL,
  PRIMARY KEY (`GroupID`),
  KEY `UserID` (`UserID`),
  CONSTRAINT `groupuser_ibfk_1` FOREIGN KEY (`UserID`) REFERENCES `User` (`UserID`) ON DELETE NO ACTION ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `GroupUser`
--

LOCK TABLES `GroupUser` WRITE;
/*!40000 ALTER TABLE `GroupUser` DISABLE KEYS */;
/*!40000 ALTER TABLE `GroupUser` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Groups`
--

DROP TABLE IF EXISTS `Groups`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Groups` (
  `GroupID` int(10) unsigned NOT NULL,
  `SectionID` int(10) unsigned NOT NULL,
  `Name` varchar(30) DEFAULT NULL,
  `Leader` int(10) unsigned DEFAULT NULL,
  `List` blob,
  PRIMARY KEY (`GroupID`),
  UNIQUE KEY `GroupID` (`GroupID`),
  UNIQUE KEY `Groups_GroupID_unique` (`GroupID`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Groups`
--

LOCK TABLES `Groups` WRITE;
/*!40000 ALTER TABLE `Groups` DISABLE KEYS */;
/*!40000 ALTER TABLE `Groups` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Organization`
--

DROP TABLE IF EXISTS `Organization`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Organization` (
  `OrganizationID` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `Name` varchar(40) DEFAULT NULL,
  `UserID` int(11) DEFAULT NULL,
  PRIMARY KEY (`OrganizationID`),
  UNIQUE KEY `OrganizationID` (`OrganizationID`),
  UNIQUE KEY `Organization_OrganizationID_unique` (`OrganizationID`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Organization`
--

LOCK TABLES `Organization` WRITE;
/*!40000 ALTER TABLE `Organization` DISABLE KEYS */;
INSERT INTO `Organization` VALUES (1,'NJIT',NULL);
/*!40000 ALTER TABLE `Organization` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ResetPasswordRequest`
--

DROP TABLE IF EXISTS `ResetPasswordRequest`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `ResetPasswordRequest` (
  `UserID` int(10) unsigned NOT NULL,
  `RequestHash` varchar(255) NOT NULL,
  PRIMARY KEY (`UserID`,`RequestHash`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ResetPasswordRequest`
--

LOCK TABLES `ResetPasswordRequest` WRITE;
/*!40000 ALTER TABLE `ResetPasswordRequest` DISABLE KEYS */;
/*!40000 ALTER TABLE `ResetPasswordRequest` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Section`
--

DROP TABLE IF EXISTS `Section`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Section` (
  `SectionID` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `SemesterID` int(10) unsigned NOT NULL,
  `CourseID` int(10) unsigned NOT NULL,
  `OrganizationID` int(10) unsigned NOT NULL,
  `Name` varchar(100) DEFAULT NULL,
  `StartDate` datetime DEFAULT NULL,
  `EndDate` datetime DEFAULT NULL,
  `Description` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`SectionID`),
  UNIQUE KEY `SectionID` (`SectionID`),
  UNIQUE KEY `Section_SectionID_unique` (`SectionID`),
  KEY `SemesterID` (`SemesterID`),
  KEY `CourseID` (`CourseID`),
  CONSTRAINT `section_ibfk_1` FOREIGN KEY (`SemesterID`) REFERENCES `Semester` (`SemesterID`) ON DELETE NO ACTION ON UPDATE CASCADE,
  CONSTRAINT `section_ibfk_2` FOREIGN KEY (`CourseID`) REFERENCES `Course` (`CourseID`) ON DELETE NO ACTION ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Section`
--

LOCK TABLES `Section` WRITE;
/*!40000 ALTER TABLE `Section` DISABLE KEYS */;
INSERT INTO `Section` VALUES (1,1,1,1,'001','2016-09-01 00:00:00','2016-12-11 00:00:00','Description for CS100-001'),(2,1,1,1,'013','2016-09-01 00:00:00','2016-12-11 00:00:00','Description for CS100-013'),(3,1,1,1,'h01','2016-09-01 00:00:00','2016-12-11 00:00:00','Description for CS100-h13 --Honor\'s Section'),(4,2,1,1,'002','2017-01-15 00:00:00','2017-05-15 00:00:00','Description for CS100-002'),(5,2,1,1,'h02','2017-01-15 00:00:00','2017-05-15 00:00:00','Description for CS100-h02 --Honor\'s Section'),(6,1,2,1,'001','2016-09-01 00:00:00','2016-12-11 00:00:00','Description for Math111-001'),(7,1,2,1,'004','2016-09-01 00:00:00','2016-12-11 00:00:00','Description for Math111-004'),(8,1,3,1,'001','2016-09-01 00:00:00','2016-12-11 00:00:00','Description for CS280-001'),(9,2,3,1,'002','2017-01-15 00:00:00','2017-05-15 00:00:00','Description for CS280-002'),(10,1,3,1,'\'007\'',NULL,NULL,'\'CS280-007\''),(11,1,3,1,'\'008\'',NULL,NULL,'\'CS280-008\''),(12,1,3,1,'\'009\'','2016-09-01 00:00:00','2016-12-11 00:00:00','\'CS280-009\''),(14,1,10,1,'002','2016-09-01 00:00:00','2016-12-11 00:00:00','Morning Section'),(15,1,11,1,'002','2016-09-01 00:00:00','2016-12-11 00:00:00','morning'),(16,1,12,1,'002','2016-09-01 00:00:00','2016-12-11 00:00:00','asdasdsds'),(17,1,13,1,'004','2016-09-01 00:00:00','2016-12-11 00:00:00','morn');
/*!40000 ALTER TABLE `Section` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `SectionUser`
--

DROP TABLE IF EXISTS `SectionUser`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `SectionUser` (
  `SectionUserID` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `SectionID` int(10) unsigned NOT NULL,
  `UserID` int(10) unsigned NOT NULL,
  `UserRole` varchar(30) DEFAULT NULL,
  `UserStatus` varchar(30) DEFAULT 'Active',
  PRIMARY KEY (`SectionUserID`),
  UNIQUE KEY `SectionUserID` (`SectionUserID`),
  UNIQUE KEY `SectionUser_SectionUserID_unique` (`SectionUserID`),
  KEY `SectionID` (`SectionID`),
  KEY `UserID` (`UserID`),
  CONSTRAINT `sectionuser_ibfk_1` FOREIGN KEY (`SectionID`) REFERENCES `Section` (`SectionID`) ON DELETE NO ACTION ON UPDATE CASCADE,
  CONSTRAINT `sectionuser_ibfk_2` FOREIGN KEY (`UserID`) REFERENCES `User` (`UserID`) ON DELETE NO ACTION ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=35 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `SectionUser`
--

LOCK TABLES `SectionUser` WRITE;
/*!40000 ALTER TABLE `SectionUser` DISABLE KEYS */;
INSERT INTO `SectionUser` VALUES (1,1,1,'Student','Active'),(2,1,3,'Student','Active'),(3,1,4,'Student','Inactive'),(4,1,69,'Student','Active'),(5,1,5,'Student','Active'),(6,6,69,'Student','Active'),(7,9,69,'Student','Active'),(8,3,1,'Student','Active'),(9,8,1,'Student','Active'),(10,7,1,'Student','Active'),(11,7,3,'Student','Active'),(12,7,4,'Student','Inactive'),(13,9,4,'Student','Inactive'),(14,16,69,'Student','Active'),(15,17,69,'Student','Active'),(16,3,4,'Student','Active'),(17,3,69,'Student','Active'),(18,3,3,'Student','Active'),(19,5,1,'Student','Active'),(20,5,3,'Student','Active'),(21,1,6,'Student','Active'),(22,1,7,'Student','Active'),(23,1,8,'Student','Active'),(24,1,9,'Student','Active'),(25,1,10,'Student','Active'),(26,1,11,'Student','Active'),(27,1,12,'Student','Active'),(28,1,13,'Student','Active'),(29,1,14,'Student','Active'),(30,1,15,'Student','Active'),(31,1,16,'Student','Active'),(32,1,17,'Student','Active'),(33,1,18,'Student','Active'),(34,1,19,'Student','Active');
/*!40000 ALTER TABLE `SectionUser` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Semester`
--

DROP TABLE IF EXISTS `Semester`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Semester` (
  `SemesterID` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `OrganizationID` int(10) unsigned NOT NULL,
  `Name` varchar(25) DEFAULT NULL,
  `StartDate` datetime DEFAULT NULL,
  `EndDate` datetime DEFAULT NULL,
  PRIMARY KEY (`SemesterID`),
  UNIQUE KEY `SemesterID` (`SemesterID`),
  UNIQUE KEY `Semester_SemesterID_unique` (`SemesterID`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Semester`
--

LOCK TABLES `Semester` WRITE;
/*!40000 ALTER TABLE `Semester` DISABLE KEYS */;
INSERT INTO `Semester` VALUES (1,1,'Fall2016','2016-09-01 00:00:00','2016-12-11 00:00:00'),(2,1,'Spring2017','2017-01-15 00:00:00','2017-05-15 00:00:00'),(7,1,'Fall2019','2019-09-01 00:00:00','2019-12-09 00:00:00');
/*!40000 ALTER TABLE `Semester` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `TaskActivity`
--

DROP TABLE IF EXISTS `TaskActivity`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `TaskActivity` (
  `TaskActivityID` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `WorkflowActivityID` int(10) unsigned NOT NULL,
  `AssignmentID` int(10) unsigned NOT NULL,
  `Name` varchar(255) DEFAULT NULL,
  `Type` varchar(40) DEFAULT NULL,
  `FileUpload` blob,
  `DueType` json DEFAULT NULL,
  `StartDelay` int(10) unsigned DEFAULT NULL,
  `AtDUrationEnd` json DEFAULT NULL,
  `WhatIfLate` json DEFAULT NULL,
  `DisplayName` varchar(255) DEFAULT NULL,
  `Documentation` varchar(255) DEFAULT NULL,
  `OneOrSeparate` varchar(5) DEFAULT NULL,
  `AssigneeConstraints` json DEFAULT NULL,
  `Difficulty` blob,
  `SimpleGrade` varchar(20) DEFAULT NULL,
  `IsFinalGradingTask` tinyint(1) DEFAULT NULL,
  `Instructions` text,
  `Rubric` text,
  `Fields` json DEFAULT NULL,
  `AllowReflection` json DEFAULT NULL,
  `AllowRevision` tinyint(1) DEFAULT NULL,
  `AllowAssessment` varchar(255) DEFAULT NULL,
  `NumberParticipants` int(10) unsigned DEFAULT '1',
  `RefersToWhichTaskThreshold` json DEFAULT NULL,
  `FunctionType` varchar(255) DEFAULT NULL,
  `Function` text,
  `AllowDispute` tinyint(1) DEFAULT NULL,
  `LeadsToNewProblem` tinyint(1) DEFAULT NULL,
  `LeadsToNewSolution` tinyint(1) DEFAULT NULL,
  `VisualID` varchar(255) DEFAULT NULL,
  `VersionHistory` json DEFAULT NULL,
  `RefersToWhichTask` int(10) unsigned DEFAULT NULL,
  `TriggerCondition` json DEFAULT NULL,
  `PreviousTasks` json DEFAULT NULL,
  `NextTasks` json DEFAULT NULL,
  `MinimumDuration` int(10) unsigned DEFAULT NULL,
  `AssignmentInstanceID` int(10) unsigned DEFAULT NULL,
  PRIMARY KEY (`TaskActivityID`),
  UNIQUE KEY `TaskActivityID` (`TaskActivityID`),
  UNIQUE KEY `TaskActivity_TaskActivityID_unique` (`TaskActivityID`),
  KEY `WorkflowActivityID` (`WorkflowActivityID`),
  KEY `AssignmentID` (`AssignmentID`),
  KEY `AssignmentInstanceID` (`AssignmentInstanceID`),
  CONSTRAINT `taskactivity_ibfk_1` FOREIGN KEY (`WorkflowActivityID`) REFERENCES `WorkflowActivity` (`WorkflowActivityID`) ON DELETE NO ACTION ON UPDATE CASCADE,
  CONSTRAINT `taskactivity_ibfk_2` FOREIGN KEY (`AssignmentID`) REFERENCES `Assignment` (`AssignmentID`) ON DELETE NO ACTION ON UPDATE CASCADE,
  CONSTRAINT `taskactivity_ibfk_3` FOREIGN KEY (`AssignmentInstanceID`) REFERENCES `AssignmentInstance` (`AssignmentInstanceID`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `TaskActivity`
--

LOCK TABLES `TaskActivity` WRITE;
/*!40000 ALTER TABLE `TaskActivity` DISABLE KEYS */;
INSERT INTO `TaskActivity` VALUES (1,1,1,'Create Problem','create_problem','\0\0','[\"duration\", 2880]',0,'\"late\"','\"allocate_new_person_from_contingency_pool\"','Create Problem',NULL,'0','[\"student\", \"individual\", {}]',NULL,'none',0,'',NULL,'{\"0\": {\"title\": \"Field\", \"rubric\": \"\", \"field_type\": \"text\", \"rating_max\": \"5\", \"show_title\": false, \"numeric_max\": \"40\", \"numeric_min\": \"0\", \"instructions\": \"\", \"list_of_labels\": \"Easy, Medium, Difficult\", \"assessment_type\": null, \"default_content\": [\"\", \"\"], \"default_refers_to\": [null, null], \"requires_justification\": false, \"justification_instructions\": \"\"}, \"field_titles\": [\"Field\"], \"number_of_fields\": 1}','[\"edit\", \"don\'t wait\"]',0,'none',1,'[]','max',NULL,0,0,1,'',NULL,NULL,NULL,NULL,NULL,NULL,NULL),(2,1,1,'Edit Create Problem','edit','\0\0','[\"duration\", 2880]',0,'\"late\"','\"keep_same_participant\"','Edit Create Problem',NULL,'0','[\"instructor\", \"group\", {\"not\": [1]}]',NULL,'none',0,'',NULL,'{\"0\": {\"title\": \"Field\", \"rubric\": \"\", \"field_type\": \"text\", \"rating_max\": \"5\", \"show_title\": false, \"numeric_max\": \"40\", \"numeric_min\": \"0\", \"instructions\": \"\", \"list_of_labels\": \"Easy, Medium, Difficult\", \"assessment_type\": null, \"default_content\": [\"\", \"\"], \"default_refers_to\": [null, null], \"requires_justification\": false, \"justification_instructions\": \"\"}, \"field_titles\": [\"Field\"], \"number_of_fields\": 1}','[\"none\", \"don\'t wait\"]',0,'none',1,'[]','max',NULL,0,0,0,'',NULL,NULL,NULL,NULL,NULL,NULL,NULL),(3,1,1,'Solve Create Problem','solve_problem','\0\0','[\"duration\", 2880]',0,'\"late\"','\"allocate_new_person_from_contingency_pool\"','Solve Create Problem',NULL,'0','[\"student\", \"individual\", {\"not\": [1, 2]}]',NULL,'none',0,'',NULL,'{\"0\": {\"title\": \"Field\", \"rubric\": \"\", \"field_type\": \"text\", \"rating_max\": \"5\", \"show_title\": false, \"numeric_max\": \"40\", \"numeric_min\": \"0\", \"instructions\": \"\", \"list_of_labels\": \"Easy, Medium, Difficult\", \"assessment_type\": null, \"default_content\": [\"\", \"\"], \"default_refers_to\": [null, null], \"requires_justification\": false, \"justification_instructions\": \"\"}, \"field_titles\": [\"Field\"], \"number_of_fields\": 1}','[\"none\", \"don\'t wait\"]',0,'grade',1,'[]','max',NULL,0,0,0,'',NULL,NULL,NULL,NULL,NULL,NULL,NULL),(4,1,1,'Grade Solve Create Problem','grade_problem','\0\0','[\"duration\", 2880]',0,'\"late\"','\"keep_same_participant\"','Grade Solve Create Problem',NULL,'0','[\"student\", \"individual\", {\"not\": [1], \"same_as\": [1]}]',NULL,'none',1,'',NULL,'{\"0\": {\"title\": \"Field\", \"rubric\": \"\", \"field_type\": \"text\", \"rating_max\": \"5\", \"show_title\": false, \"numeric_max\": \"40\", \"numeric_min\": \"0\", \"instructions\": \"\", \"list_of_labels\": \"Easy, Medium, Difficult\", \"assessment_type\": null, \"default_content\": [\"\", \"\"], \"default_refers_to\": [null, null], \"requires_justification\": false, \"justification_instructions\": \"\"}, \"field_titles\": [\"Field\"], \"number_of_fields\": 1}','[\"none\", \"don\'t wait\"]',0,'none',2,'[]','max',NULL,1,0,0,'',NULL,NULL,NULL,NULL,NULL,NULL,NULL),(5,1,1,'Needs Consolidation of Grade Solve Create Problem','needs_consolidation','\0\0','[]',0,NULL,NULL,'Needs Consolidation of Grade Solve Create Problem',NULL,'0','[\"student\", \"individual\", {\"same_as\": [3]}]',NULL,'none',1,'',NULL,'{\"0\": {\"title\": \"Field\", \"rubric\": \"\", \"field_type\": \"text\", \"rating_max\": \"5\", \"show_title\": false, \"numeric_max\": \"40\", \"numeric_min\": \"0\", \"instructions\": \"\", \"list_of_labels\": \"Easy, Medium, Difficult\", \"assessment_type\": null, \"default_content\": [\"\", \"\"], \"default_refers_to\": [null, null], \"requires_justification\": false, \"justification_instructions\": \"\"}, \"field_titles\": [\"Field\"], \"number_of_fields\": 1}','[\"none\", \"don\'t wait\"]',0,'none',1,'[]','max',NULL,0,0,0,'',NULL,NULL,NULL,NULL,NULL,NULL,NULL),(6,1,1,'Consolidate Grade Solve Create Problem','consolidation','\0\0','[\"duration\", 2880]',0,'\"late\"','\"keep_same_participant\"','Consolidate Grade Solve Create Problem',NULL,'0','[\"student\", \"individual\", {\"not\": [3, 1, 4]}]',NULL,'none',1,'',NULL,'{\"0\": {\"title\": \"Field\", \"rubric\": \"\", \"field_type\": \"text\", \"rating_max\": \"5\", \"show_title\": false, \"numeric_max\": \"40\", \"numeric_min\": \"0\", \"instructions\": \"\", \"list_of_labels\": \"Easy, Medium, Difficult\", \"assessment_type\": null, \"default_content\": [\"\", \"\"], \"default_refers_to\": [null, null], \"requires_justification\": false, \"justification_instructions\": \"\"}, \"field_titles\": [\"Field\"], \"number_of_fields\": 1}','[\"none\", \"don\'t wait\"]',0,'none',1,'[]','max',NULL,0,0,0,'',NULL,NULL,NULL,NULL,NULL,NULL,NULL),(7,1,1,'Dispute of  Grade Solve Create Problem','dispute','\0\0','[\"duration\", 2880]',0,'\"resolved\"',NULL,'Dispute of  Grade Solve Create Problem',NULL,'0','[\"student\", \"individual\", {\"same_as\": [3]}]',NULL,'none',0,'',NULL,'{\"0\": {\"title\": \"Field\", \"rubric\": \"\", \"field_type\": \"text\", \"rating_max\": \"5\", \"show_title\": false, \"numeric_max\": \"40\", \"numeric_min\": \"0\", \"instructions\": \"\", \"list_of_labels\": \"Easy, Medium, Difficult\", \"assessment_type\": null, \"default_content\": [\"\", \"\"], \"default_refers_to\": [null, null], \"requires_justification\": false, \"justification_instructions\": \"\"}, \"field_titles\": [\"Field\"], \"number_of_fields\": 1}','[\"none\", \"don\'t wait\"]',0,'none',1,'[]','max',NULL,0,0,0,'',NULL,NULL,NULL,NULL,NULL,NULL,NULL),(8,1,1,'Resolve Dispute of Grade Solve Create Problem','resolve_dispute','\0\0','[\"duration\", 2880]',0,'\"late\"','\"keep_same_participant\"','Resolve Dispute of Grade Solve Create Problem',NULL,'0','[\"student\", \"individual\", {\"not\": [3]}]',NULL,'none',1,'',NULL,'{\"0\": {\"title\": \"Field\", \"rubric\": \"\", \"field_type\": \"text\", \"rating_max\": \"5\", \"show_title\": false, \"numeric_max\": \"40\", \"numeric_min\": \"0\", \"instructions\": \"\", \"list_of_labels\": \"Easy, Medium, Difficult\", \"assessment_type\": null, \"default_content\": [\"\", \"\"], \"default_refers_to\": [null, null], \"requires_justification\": false, \"justification_instructions\": \"\"}, \"field_titles\": [\"Field\"], \"number_of_fields\": 1}','[\"none\", \"don\'t wait\"]',0,'none',1,'[]','max',NULL,0,0,0,'',NULL,NULL,NULL,NULL,NULL,NULL,NULL),(9,1,1,'Workflow 1 Complete','completed','\0\0','[]',0,NULL,NULL,'Workflow 1 Complete',NULL,'0','[\"student\", \"individual\", {\"same_as\": [3]}]',NULL,'none',0,'',NULL,'{\"0\": {\"title\": \"Field\", \"rubric\": \"\", \"field_type\": \"text\", \"rating_max\": \"5\", \"show_title\": false, \"numeric_max\": \"40\", \"numeric_min\": \"0\", \"instructions\": \"\", \"list_of_labels\": \"Easy, Medium, Difficult\", \"assessment_type\": null, \"default_content\": [\"\", \"\"], \"default_refers_to\": [null, null], \"requires_justification\": false, \"justification_instructions\": \"\"}, \"field_titles\": [\"Field\"], \"number_of_fields\": 1}','[\"none\", \"don\'t wait\"]',0,'none',1,'[]','max',NULL,0,0,0,'',NULL,NULL,NULL,NULL,NULL,NULL,NULL),(10,2,1,'Create Problem','create_problem','\0\0','[\"duration\", 2880]',0,'\"late\"','\"keep_same_participant\"','Create Problem',NULL,'0','[\"student\", \"individual\", {}]',NULL,'none',0,'',NULL,'{\"0\": {\"title\": \"Field\", \"rubric\": \"\", \"field_type\": \"text\", \"rating_max\": \"5\", \"show_title\": false, \"numeric_max\": \"40\", \"numeric_min\": \"0\", \"instructions\": \"\", \"list_of_labels\": \"Easy, Medium, Difficult\", \"assessment_type\": null, \"default_content\": [\"\", \"\"], \"default_refers_to\": [null, null], \"requires_justification\": false, \"justification_instructions\": \"\"}, \"field_titles\": [\"Field\"], \"number_of_fields\": 1}','[\"none\", \"don\'t wait\"]',0,'none',1,'[]','max',NULL,0,0,0,'',NULL,NULL,NULL,NULL,NULL,NULL,NULL),(11,2,1,'Workflow 2 Complete','completed','\0\0','[]',0,NULL,NULL,'Workflow 2 Complete',NULL,'0','[\"student\", \"individual\", {\"same_as\": [10]}]',NULL,'none',0,'',NULL,'{\"0\": {\"title\": \"Field\", \"rubric\": \"\", \"field_type\": \"text\", \"rating_max\": \"5\", \"show_title\": false, \"numeric_max\": \"40\", \"numeric_min\": \"0\", \"instructions\": \"\", \"list_of_labels\": \"Easy, Medium, Difficult\", \"assessment_type\": null, \"default_content\": [\"\", \"\"], \"default_refers_to\": [null, null], \"requires_justification\": false, \"justification_instructions\": \"\"}, \"field_titles\": [\"Field\"], \"number_of_fields\": 1}','[\"none\", \"don\'t wait\"]',0,'none',1,'[]','max',NULL,0,0,0,'',NULL,NULL,NULL,NULL,NULL,NULL,NULL);
/*!40000 ALTER TABLE `TaskActivity` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `TaskInstance`
--

DROP TABLE IF EXISTS `TaskInstance`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `TaskInstance` (
  `TaskInstanceID` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `UserID` int(10) unsigned NOT NULL,
  `TaskActivityID` int(10) unsigned NOT NULL,
  `WorkflowInstanceID` int(10) unsigned NOT NULL,
  `AssignmentInstanceID` int(10) unsigned NOT NULL,
  `GroupID` int(10) unsigned DEFAULT NULL,
  `Status` varchar(20) DEFAULT NULL,
  `StartDate` datetime DEFAULT NULL,
  `EndDate` datetime DEFAULT NULL,
  `ActualEndDate` datetime DEFAULT NULL,
  `Data` json DEFAULT NULL,
  `UserHistory` json DEFAULT NULL,
  `FinalGrade` float unsigned DEFAULT NULL,
  `Files` json DEFAULT NULL,
  `ReferencedTask` int(10) unsigned DEFAULT NULL,
  `NextTask` json DEFAULT NULL,
  `PreviousTask` json DEFAULT NULL,
  `EmailLastSent` datetime NOT NULL DEFAULT '1999-01-01 00:00:00',
  PRIMARY KEY (`TaskInstanceID`),
  UNIQUE KEY `TaskInstanceID` (`TaskInstanceID`),
  UNIQUE KEY `TaskInstance_TaskInstanceID_unique` (`TaskInstanceID`),
  KEY `UserID` (`UserID`),
  KEY `TaskActivityID` (`TaskActivityID`),
  KEY `WorkflowInstanceID` (`WorkflowInstanceID`),
  KEY `AssignmentInstanceID` (`AssignmentInstanceID`),
  CONSTRAINT `taskinstance_ibfk_1` FOREIGN KEY (`UserID`) REFERENCES `User` (`UserID`) ON DELETE NO ACTION ON UPDATE CASCADE,
  CONSTRAINT `taskinstance_ibfk_2` FOREIGN KEY (`TaskActivityID`) REFERENCES `TaskActivity` (`TaskActivityID`) ON DELETE NO ACTION ON UPDATE CASCADE,
  CONSTRAINT `taskinstance_ibfk_3` FOREIGN KEY (`WorkflowInstanceID`) REFERENCES `WorkflowInstance` (`WorkflowInstanceID`) ON DELETE NO ACTION ON UPDATE CASCADE,
  CONSTRAINT `taskinstance_ibfk_4` FOREIGN KEY (`AssignmentInstanceID`) REFERENCES `AssignmentInstance` (`AssignmentInstanceID`) ON DELETE NO ACTION ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=229 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `TaskInstance`
--

LOCK TABLES `TaskInstance` WRITE;
/*!40000 ALTER TABLE `TaskInstance` DISABLE KEYS */;
INSERT INTO `TaskInstance` VALUES (1,1,1,1,3,NULL,'started','1970-01-01 00:00:00','1970-01-03 00:00:00',NULL,NULL,NULL,NULL,NULL,NULL,'[2]',NULL,'1999-01-01 05:00:00'),(2,2,2,1,3,NULL,'not_yet_started',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[3]','[1]','1999-01-01 05:00:00'),(3,3,3,1,3,NULL,'not_yet_started',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[4, 5]','[2]','1999-01-01 05:00:00'),(4,4,4,1,3,NULL,'not_yet_started',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[6]','[3]','1999-01-01 05:00:00'),(5,1,4,1,3,NULL,'not_yet_started',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[6]','[3]','1999-01-01 05:00:00'),(6,3,5,1,3,NULL,'automatic',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[7]','[4, 5]','1999-01-01 05:00:00'),(7,69,6,1,3,NULL,'not_yet_started',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[8]','[6]','1999-01-01 05:00:00'),(8,3,7,1,3,NULL,'not_yet_started',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[9]','[7]','1999-01-01 05:00:00'),(9,5,8,1,3,NULL,'not_yet_started',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[10]','[8]','1999-01-01 05:00:00'),(10,3,9,1,3,NULL,'automatic',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[9]','1999-01-01 05:00:00'),(11,1,10,2,3,NULL,'started','1970-01-01 00:00:00','1970-01-03 00:00:00',NULL,NULL,NULL,NULL,NULL,NULL,'[12]',NULL,'1999-01-01 05:00:00'),(12,1,11,2,3,NULL,'automatic',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[11]','1999-01-01 05:00:00'),(13,3,1,3,3,NULL,'started','1970-01-01 00:00:00','1970-01-03 00:00:00',NULL,NULL,NULL,NULL,NULL,NULL,'[14]',NULL,'1999-01-01 05:00:00'),(14,2,2,3,3,NULL,'not_yet_started',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[15]','[13]','1999-01-01 05:00:00'),(15,4,3,3,3,NULL,'not_yet_started',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[16, 17]','[14]','1999-01-01 05:00:00'),(16,69,4,3,3,NULL,'not_yet_started',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[18]','[15]','1999-01-01 05:00:00'),(17,3,4,3,3,NULL,'not_yet_started',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[18]','[15]','1999-01-01 05:00:00'),(18,4,5,3,3,NULL,'automatic',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[19]','[16, 17]','1999-01-01 05:00:00'),(19,5,6,3,3,NULL,'not_yet_started',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[20]','[18]','1999-01-01 05:00:00'),(20,4,7,3,3,NULL,'not_yet_started',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[21]','[19]','1999-01-01 05:00:00'),(21,6,8,3,3,NULL,'not_yet_started',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[22]','[20]','1999-01-01 05:00:00'),(22,4,9,3,3,NULL,'automatic',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[21]','1999-01-01 05:00:00'),(23,3,10,4,3,NULL,'started','1970-01-01 00:00:00','1970-01-03 00:00:00',NULL,NULL,NULL,NULL,NULL,NULL,'[24]',NULL,'1999-01-01 05:00:00'),(24,3,11,4,3,NULL,'automatic',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[23]','1999-01-01 05:00:00'),(25,4,1,5,3,NULL,'started','1970-01-01 00:00:00','1970-01-03 00:00:00',NULL,NULL,NULL,NULL,NULL,NULL,'[26]',NULL,'1999-01-01 05:00:00'),(26,2,2,5,3,NULL,'not_yet_started',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[27]','[25]','1999-01-01 05:00:00'),(27,69,3,5,3,NULL,'not_yet_started',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[28, 29]','[26]','1999-01-01 05:00:00'),(28,5,4,5,3,NULL,'not_yet_started',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[30]','[27]','1999-01-01 05:00:00'),(29,4,4,5,3,NULL,'not_yet_started',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[30]','[27]','1999-01-01 05:00:00'),(30,69,5,5,3,NULL,'automatic',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[31]','[28, 29]','1999-01-01 05:00:00'),(31,6,6,5,3,NULL,'not_yet_started',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[32]','[30]','1999-01-01 05:00:00'),(32,69,7,5,3,NULL,'not_yet_started',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[33]','[31]','1999-01-01 05:00:00'),(33,7,8,5,3,NULL,'not_yet_started',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[34]','[32]','1999-01-01 05:00:00'),(34,69,9,5,3,NULL,'automatic',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[33]','1999-01-01 05:00:00'),(35,4,10,6,3,NULL,'started','1970-01-01 00:00:00','1970-01-03 00:00:00',NULL,NULL,NULL,NULL,NULL,NULL,'[36]',NULL,'1999-01-01 05:00:00'),(36,4,11,6,3,NULL,'automatic',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[35]','1999-01-01 05:00:00'),(37,69,1,7,3,NULL,'started','1970-01-01 00:00:00','1970-01-03 00:00:00',NULL,NULL,NULL,NULL,NULL,NULL,'[38]',NULL,'1999-01-01 05:00:00'),(38,2,2,7,3,NULL,'not_yet_started',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[39]','[37]','1999-01-01 05:00:00'),(39,5,3,7,3,NULL,'not_yet_started',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[40, 41]','[38]','1999-01-01 05:00:00'),(40,6,4,7,3,NULL,'not_yet_started',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[42]','[39]','1999-01-01 05:00:00'),(41,69,4,7,3,NULL,'not_yet_started',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[42]','[39]','1999-01-01 05:00:00'),(42,5,5,7,3,NULL,'automatic',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[43]','[40, 41]','1999-01-01 05:00:00'),(43,7,6,7,3,NULL,'not_yet_started',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[44]','[42]','1999-01-01 05:00:00'),(44,5,7,7,3,NULL,'not_yet_started',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[45]','[43]','1999-01-01 05:00:00'),(45,8,8,7,3,NULL,'not_yet_started',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[46]','[44]','1999-01-01 05:00:00'),(46,5,9,7,3,NULL,'automatic',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[45]','1999-01-01 05:00:00'),(47,69,10,8,3,NULL,'started','1970-01-01 00:00:00','1970-01-03 00:00:00',NULL,NULL,NULL,NULL,NULL,NULL,'[48]',NULL,'1999-01-01 05:00:00'),(48,69,11,8,3,NULL,'automatic',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[47]','1999-01-01 05:00:00'),(49,5,1,9,3,NULL,'started','1970-01-01 00:00:00','1970-01-03 00:00:00',NULL,NULL,NULL,NULL,NULL,NULL,'[50]',NULL,'1999-01-01 05:00:00'),(50,2,2,9,3,NULL,'not_yet_started',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[51]','[49]','1999-01-01 05:00:00'),(51,6,3,9,3,NULL,'not_yet_started',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[52, 53]','[50]','1999-01-01 05:00:00'),(52,7,4,9,3,NULL,'not_yet_started',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[54]','[51]','1999-01-01 05:00:00'),(53,5,4,9,3,NULL,'not_yet_started',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[54]','[51]','1999-01-01 05:00:00'),(54,6,5,9,3,NULL,'automatic',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[55]','[52, 53]','1999-01-01 05:00:00'),(55,8,6,9,3,NULL,'not_yet_started',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[56]','[54]','1999-01-01 05:00:00'),(56,6,7,9,3,NULL,'not_yet_started',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[57]','[55]','1999-01-01 05:00:00'),(57,9,8,9,3,NULL,'not_yet_started',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[58]','[56]','1999-01-01 05:00:00'),(58,6,9,9,3,NULL,'automatic',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[57]','1999-01-01 05:00:00'),(59,5,10,10,3,NULL,'started','1970-01-01 00:00:00','1970-01-03 00:00:00',NULL,NULL,NULL,NULL,NULL,NULL,'[60]',NULL,'1999-01-01 05:00:00'),(60,5,11,10,3,NULL,'automatic',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[59]','1999-01-01 05:00:00'),(61,6,1,11,3,NULL,'started','1970-01-01 00:00:00','1970-01-03 00:00:00',NULL,NULL,NULL,NULL,NULL,NULL,'[62]',NULL,'1999-01-01 05:00:00'),(62,2,2,11,3,NULL,'not_yet_started',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[63]','[61]','1999-01-01 05:00:00'),(63,7,3,11,3,NULL,'not_yet_started',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[64, 65]','[62]','1999-01-01 05:00:00'),(64,8,4,11,3,NULL,'not_yet_started',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[66]','[63]','1999-01-01 05:00:00'),(65,6,4,11,3,NULL,'not_yet_started',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[66]','[63]','1999-01-01 05:00:00'),(66,7,5,11,3,NULL,'automatic',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[67]','[64, 65]','1999-01-01 05:00:00'),(67,9,6,11,3,NULL,'not_yet_started',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[68]','[66]','1999-01-01 05:00:00'),(68,7,7,11,3,NULL,'not_yet_started',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[69]','[67]','1999-01-01 05:00:00'),(69,10,8,11,3,NULL,'not_yet_started',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[70]','[68]','1999-01-01 05:00:00'),(70,7,9,11,3,NULL,'automatic',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[69]','1999-01-01 05:00:00'),(71,6,10,12,3,NULL,'started','1970-01-01 00:00:00','1970-01-03 00:00:00',NULL,NULL,NULL,NULL,NULL,NULL,'[72]',NULL,'1999-01-01 05:00:00'),(72,6,11,12,3,NULL,'automatic',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[71]','1999-01-01 05:00:00'),(73,7,1,13,3,NULL,'started','1970-01-01 00:00:00','1970-01-03 00:00:00',NULL,NULL,NULL,NULL,NULL,NULL,'[74]',NULL,'1999-01-01 05:00:00'),(74,2,2,13,3,NULL,'not_yet_started',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[75]','[73]','1999-01-01 05:00:00'),(75,8,3,13,3,NULL,'not_yet_started',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[76, 77]','[74]','1999-01-01 05:00:00'),(76,9,4,13,3,NULL,'not_yet_started',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[78]','[75]','1999-01-01 05:00:00'),(77,7,4,13,3,NULL,'not_yet_started',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[78]','[75]','1999-01-01 05:00:00'),(78,8,5,13,3,NULL,'automatic',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[79]','[76, 77]','1999-01-01 05:00:00'),(79,10,6,13,3,NULL,'not_yet_started',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[80]','[78]','1999-01-01 05:00:00'),(80,8,7,13,3,NULL,'not_yet_started',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[81]','[79]','1999-01-01 05:00:00'),(81,11,8,13,3,NULL,'not_yet_started',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[82]','[80]','1999-01-01 05:00:00'),(82,8,9,13,3,NULL,'automatic',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[81]','1999-01-01 05:00:00'),(83,7,10,14,3,NULL,'started','1970-01-01 00:00:00','1970-01-03 00:00:00',NULL,NULL,NULL,NULL,NULL,NULL,'[84]',NULL,'1999-01-01 05:00:00'),(84,7,11,14,3,NULL,'automatic',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[83]','1999-01-01 05:00:00'),(85,8,1,15,3,NULL,'started','1970-01-01 00:00:00','1970-01-03 00:00:00',NULL,NULL,NULL,NULL,NULL,NULL,'[86]',NULL,'1999-01-01 05:00:00'),(86,2,2,15,3,NULL,'not_yet_started',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[87]','[85]','1999-01-01 05:00:00'),(87,9,3,15,3,NULL,'not_yet_started',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[88, 89]','[86]','1999-01-01 05:00:00'),(88,10,4,15,3,NULL,'not_yet_started',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[90]','[87]','1999-01-01 05:00:00'),(89,8,4,15,3,NULL,'not_yet_started',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[90]','[87]','1999-01-01 05:00:00'),(90,9,5,15,3,NULL,'automatic',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[91]','[88, 89]','1999-01-01 05:00:00'),(91,11,6,15,3,NULL,'not_yet_started',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[92]','[90]','1999-01-01 05:00:00'),(92,9,7,15,3,NULL,'not_yet_started',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[93]','[91]','1999-01-01 05:00:00'),(93,12,8,15,3,NULL,'not_yet_started',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[94]','[92]','1999-01-01 05:00:00'),(94,9,9,15,3,NULL,'automatic',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[93]','1999-01-01 05:00:00'),(95,8,10,16,3,NULL,'started','1970-01-01 00:00:00','1970-01-03 00:00:00',NULL,NULL,NULL,NULL,NULL,NULL,'[96]',NULL,'1999-01-01 05:00:00'),(96,8,11,16,3,NULL,'automatic',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[95]','1999-01-01 05:00:00'),(97,9,1,17,3,NULL,'started','1970-01-01 00:00:00','1970-01-03 00:00:00',NULL,NULL,NULL,NULL,NULL,NULL,'[98]',NULL,'1999-01-01 05:00:00'),(98,2,2,17,3,NULL,'not_yet_started',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[99]','[97]','1999-01-01 05:00:00'),(99,10,3,17,3,NULL,'not_yet_started',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[100, 101]','[98]','1999-01-01 05:00:00'),(100,11,4,17,3,NULL,'not_yet_started',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[102]','[99]','1999-01-01 05:00:00'),(101,9,4,17,3,NULL,'not_yet_started',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[102]','[99]','1999-01-01 05:00:00'),(102,10,5,17,3,NULL,'automatic',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[103]','[100, 101]','1999-01-01 05:00:00'),(103,12,6,17,3,NULL,'not_yet_started',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[104]','[102]','1999-01-01 05:00:00'),(104,10,7,17,3,NULL,'not_yet_started',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[105]','[103]','1999-01-01 05:00:00'),(105,13,8,17,3,NULL,'not_yet_started',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[106]','[104]','1999-01-01 05:00:00'),(106,10,9,17,3,NULL,'automatic',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[105]','1999-01-01 05:00:00'),(107,9,10,18,3,NULL,'started','1970-01-01 00:00:00','1970-01-03 00:00:00',NULL,NULL,NULL,NULL,NULL,NULL,'[108]',NULL,'1999-01-01 05:00:00'),(108,9,11,18,3,NULL,'automatic',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[107]','1999-01-01 05:00:00'),(109,10,1,19,3,NULL,'started','1970-01-01 00:00:00','1970-01-03 00:00:00',NULL,NULL,NULL,NULL,NULL,NULL,'[110]',NULL,'1999-01-01 05:00:00'),(110,2,2,19,3,NULL,'not_yet_started',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[111]','[109]','1999-01-01 05:00:00'),(111,11,3,19,3,NULL,'not_yet_started',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[112, 113]','[110]','1999-01-01 05:00:00'),(112,12,4,19,3,NULL,'not_yet_started',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[114]','[111]','1999-01-01 05:00:00'),(113,10,4,19,3,NULL,'not_yet_started',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[114]','[111]','1999-01-01 05:00:00'),(114,11,5,19,3,NULL,'automatic',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[115]','[112, 113]','1999-01-01 05:00:00'),(115,13,6,19,3,NULL,'not_yet_started',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[116]','[114]','1999-01-01 05:00:00'),(116,11,7,19,3,NULL,'not_yet_started',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[117]','[115]','1999-01-01 05:00:00'),(117,14,8,19,3,NULL,'not_yet_started',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[118]','[116]','1999-01-01 05:00:00'),(118,11,9,19,3,NULL,'automatic',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[117]','1999-01-01 05:00:00'),(119,10,10,20,3,NULL,'started','1970-01-01 00:00:00','1970-01-03 00:00:00',NULL,NULL,NULL,NULL,NULL,NULL,'[120]',NULL,'1999-01-01 05:00:00'),(120,10,11,20,3,NULL,'automatic',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[119]','1999-01-01 05:00:00'),(121,11,1,21,3,NULL,'started','1970-01-01 00:00:00','1970-01-03 00:00:00',NULL,NULL,NULL,NULL,NULL,NULL,'[122]',NULL,'1999-01-01 05:00:00'),(122,2,2,21,3,NULL,'not_yet_started',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[123]','[121]','1999-01-01 05:00:00'),(123,12,3,21,3,NULL,'not_yet_started',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[124, 125]','[122]','1999-01-01 05:00:00'),(124,13,4,21,3,NULL,'not_yet_started',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[126]','[123]','1999-01-01 05:00:00'),(125,11,4,21,3,NULL,'not_yet_started',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[126]','[123]','1999-01-01 05:00:00'),(126,12,5,21,3,NULL,'automatic',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[127]','[124, 125]','1999-01-01 05:00:00'),(127,14,6,21,3,NULL,'not_yet_started',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[128]','[126]','1999-01-01 05:00:00'),(128,12,7,21,3,NULL,'not_yet_started',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[129]','[127]','1999-01-01 05:00:00'),(129,15,8,21,3,NULL,'not_yet_started',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[130]','[128]','1999-01-01 05:00:00'),(130,12,9,21,3,NULL,'automatic',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[129]','1999-01-01 05:00:00'),(131,11,10,22,3,NULL,'started','1970-01-01 00:00:00','1970-01-03 00:00:00',NULL,NULL,NULL,NULL,NULL,NULL,'[132]',NULL,'1999-01-01 05:00:00'),(132,11,11,22,3,NULL,'automatic',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[131]','1999-01-01 05:00:00'),(133,12,1,23,3,NULL,'started','1970-01-01 00:00:00','1970-01-03 00:00:00',NULL,NULL,NULL,NULL,NULL,NULL,'[134]',NULL,'1999-01-01 05:00:00'),(134,2,2,23,3,NULL,'not_yet_started',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[135]','[133]','1999-01-01 05:00:00'),(135,13,3,23,3,NULL,'not_yet_started',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[136, 137]','[134]','1999-01-01 05:00:00'),(136,14,4,23,3,NULL,'not_yet_started',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[138]','[135]','1999-01-01 05:00:00'),(137,12,4,23,3,NULL,'not_yet_started',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[138]','[135]','1999-01-01 05:00:00'),(138,13,5,23,3,NULL,'automatic',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[139]','[136, 137]','1999-01-01 05:00:00'),(139,15,6,23,3,NULL,'not_yet_started',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[140]','[138]','1999-01-01 05:00:00'),(140,13,7,23,3,NULL,'not_yet_started',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[141]','[139]','1999-01-01 05:00:00'),(141,16,8,23,3,NULL,'not_yet_started',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[142]','[140]','1999-01-01 05:00:00'),(142,13,9,23,3,NULL,'automatic',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[141]','1999-01-01 05:00:00'),(143,12,10,24,3,NULL,'started','1970-01-01 00:00:00','1970-01-03 00:00:00',NULL,NULL,NULL,NULL,NULL,NULL,'[144]',NULL,'1999-01-01 05:00:00'),(144,12,11,24,3,NULL,'automatic',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[143]','1999-01-01 05:00:00'),(145,13,1,25,3,NULL,'started','1970-01-01 00:00:00','1970-01-03 00:00:00',NULL,NULL,NULL,NULL,NULL,NULL,'[146]',NULL,'1999-01-01 05:00:00'),(146,2,2,25,3,NULL,'not_yet_started',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[147]','[145]','1999-01-01 05:00:00'),(147,14,3,25,3,NULL,'not_yet_started',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[148, 149]','[146]','1999-01-01 05:00:00'),(148,15,4,25,3,NULL,'not_yet_started',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[150]','[147]','1999-01-01 05:00:00'),(149,13,4,25,3,NULL,'not_yet_started',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[150]','[147]','1999-01-01 05:00:00'),(150,14,5,25,3,NULL,'automatic',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[151]','[148, 149]','1999-01-01 05:00:00'),(151,16,6,25,3,NULL,'not_yet_started',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[152]','[150]','1999-01-01 05:00:00'),(152,14,7,25,3,NULL,'not_yet_started',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[153]','[151]','1999-01-01 05:00:00'),(153,17,8,25,3,NULL,'not_yet_started',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[154]','[152]','1999-01-01 05:00:00'),(154,14,9,25,3,NULL,'automatic',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[153]','1999-01-01 05:00:00'),(155,13,10,26,3,NULL,'started','1970-01-01 00:00:00','1970-01-03 00:00:00',NULL,NULL,NULL,NULL,NULL,NULL,'[156]',NULL,'1999-01-01 05:00:00'),(156,13,11,26,3,NULL,'automatic',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[155]','1999-01-01 05:00:00'),(157,14,1,27,3,NULL,'started','1970-01-01 00:00:00','1970-01-03 00:00:00',NULL,NULL,NULL,NULL,NULL,NULL,'[158]',NULL,'1999-01-01 05:00:00'),(158,2,2,27,3,NULL,'not_yet_started',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[159]','[157]','1999-01-01 05:00:00'),(159,15,3,27,3,NULL,'not_yet_started',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[160, 161]','[158]','1999-01-01 05:00:00'),(160,16,4,27,3,NULL,'not_yet_started',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[162]','[159]','1999-01-01 05:00:00'),(161,14,4,27,3,NULL,'not_yet_started',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[162]','[159]','1999-01-01 05:00:00'),(162,15,5,27,3,NULL,'automatic',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[163]','[160, 161]','1999-01-01 05:00:00'),(163,17,6,27,3,NULL,'not_yet_started',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[164]','[162]','1999-01-01 05:00:00'),(164,15,7,27,3,NULL,'not_yet_started',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[165]','[163]','1999-01-01 05:00:00'),(165,18,8,27,3,NULL,'not_yet_started',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[166]','[164]','1999-01-01 05:00:00'),(166,15,9,27,3,NULL,'automatic',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[165]','1999-01-01 05:00:00'),(167,14,10,28,3,NULL,'started','1970-01-01 00:00:00','1970-01-03 00:00:00',NULL,NULL,NULL,NULL,NULL,NULL,'[168]',NULL,'1999-01-01 05:00:00'),(168,14,11,28,3,NULL,'automatic',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[167]','1999-01-01 05:00:00'),(169,15,1,29,3,NULL,'started','1970-01-01 00:00:00','1970-01-03 00:00:00',NULL,NULL,NULL,NULL,NULL,NULL,'[170]',NULL,'1999-01-01 05:00:00'),(170,2,2,29,3,NULL,'not_yet_started',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[171]','[169]','1999-01-01 05:00:00'),(171,16,3,29,3,NULL,'not_yet_started',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[172, 173]','[170]','1999-01-01 05:00:00'),(172,17,4,29,3,NULL,'not_yet_started',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[174]','[171]','1999-01-01 05:00:00'),(173,15,4,29,3,NULL,'not_yet_started',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[174]','[171]','1999-01-01 05:00:00'),(174,16,5,29,3,NULL,'automatic',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[175]','[172, 173]','1999-01-01 05:00:00'),(175,18,6,29,3,NULL,'not_yet_started',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[176]','[174]','1999-01-01 05:00:00'),(176,16,7,29,3,NULL,'not_yet_started',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[177]','[175]','1999-01-01 05:00:00'),(177,19,8,29,3,NULL,'not_yet_started',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[178]','[176]','1999-01-01 05:00:00'),(178,16,9,29,3,NULL,'automatic',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[177]','1999-01-01 05:00:00'),(179,15,10,30,3,NULL,'started','1970-01-01 00:00:00','1970-01-03 00:00:00',NULL,NULL,NULL,NULL,NULL,NULL,'[180]',NULL,'1999-01-01 05:00:00'),(180,15,11,30,3,NULL,'automatic',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[179]','1999-01-01 05:00:00'),(181,16,1,31,3,NULL,'started','1970-01-01 00:00:00','1970-01-03 00:00:00',NULL,NULL,NULL,NULL,NULL,NULL,'[182]',NULL,'1999-01-01 05:00:00'),(182,2,2,31,3,NULL,'not_yet_started',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[183]','[181]','1999-01-01 05:00:00'),(183,17,3,31,3,NULL,'not_yet_started',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[184, 185]','[182]','1999-01-01 05:00:00'),(184,18,4,31,3,NULL,'not_yet_started',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[186]','[183]','1999-01-01 05:00:00'),(185,16,4,31,3,NULL,'not_yet_started',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[186]','[183]','1999-01-01 05:00:00'),(186,17,5,31,3,NULL,'automatic',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[187]','[184, 185]','1999-01-01 05:00:00'),(187,19,6,31,3,NULL,'not_yet_started',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[188]','[186]','1999-01-01 05:00:00'),(188,17,7,31,3,NULL,'not_yet_started',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[189]','[187]','1999-01-01 05:00:00'),(189,1,8,31,3,NULL,'not_yet_started',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[190]','[188]','1999-01-01 05:00:00'),(190,17,9,31,3,NULL,'automatic',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[189]','1999-01-01 05:00:00'),(191,16,10,32,3,NULL,'started','1970-01-01 00:00:00','1970-01-03 00:00:00',NULL,NULL,NULL,NULL,NULL,NULL,'[192]',NULL,'1999-01-01 05:00:00'),(192,16,11,32,3,NULL,'automatic',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[191]','1999-01-01 05:00:00'),(193,17,1,33,3,NULL,'started','1970-01-01 00:00:00','1970-01-03 00:00:00',NULL,NULL,NULL,NULL,NULL,NULL,'[194]',NULL,'1999-01-01 05:00:00'),(194,2,2,33,3,NULL,'not_yet_started',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[195]','[193]','1999-01-01 05:00:00'),(195,18,3,33,3,NULL,'not_yet_started',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[196, 197]','[194]','1999-01-01 05:00:00'),(196,19,4,33,3,NULL,'not_yet_started',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[198]','[195]','1999-01-01 05:00:00'),(197,17,4,33,3,NULL,'not_yet_started',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[198]','[195]','1999-01-01 05:00:00'),(198,18,5,33,3,NULL,'automatic',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[199]','[196, 197]','1999-01-01 05:00:00'),(199,1,6,33,3,NULL,'not_yet_started',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[200]','[198]','1999-01-01 05:00:00'),(200,18,7,33,3,NULL,'not_yet_started',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[201]','[199]','1999-01-01 05:00:00'),(201,3,8,33,3,NULL,'not_yet_started',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[202]','[200]','1999-01-01 05:00:00'),(202,18,9,33,3,NULL,'automatic',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[201]','1999-01-01 05:00:00'),(203,17,10,34,3,NULL,'started','1970-01-01 00:00:00','1970-01-03 00:00:00',NULL,NULL,NULL,NULL,NULL,NULL,'[204]',NULL,'1999-01-01 05:00:00'),(204,17,11,34,3,NULL,'automatic',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[203]','1999-01-01 05:00:00'),(205,18,1,35,3,NULL,'started','1970-01-01 00:00:00','1970-01-03 00:00:00',NULL,NULL,NULL,NULL,NULL,NULL,'[206]',NULL,'1999-01-01 05:00:00'),(206,2,2,35,3,NULL,'not_yet_started',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[207]','[205]','1999-01-01 05:00:00'),(207,19,3,35,3,NULL,'not_yet_started',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[208, 209]','[206]','1999-01-01 05:00:00'),(208,1,4,35,3,NULL,'not_yet_started',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[210]','[207]','1999-01-01 05:00:00'),(209,18,4,35,3,NULL,'not_yet_started',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[210]','[207]','1999-01-01 05:00:00'),(210,19,5,35,3,NULL,'automatic',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[211]','[208, 209]','1999-01-01 05:00:00'),(211,3,6,35,3,NULL,'not_yet_started',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[212]','[210]','1999-01-01 05:00:00'),(212,19,7,35,3,NULL,'not_yet_started',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[213]','[211]','1999-01-01 05:00:00'),(213,4,8,35,3,NULL,'not_yet_started',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[214]','[212]','1999-01-01 05:00:00'),(214,19,9,35,3,NULL,'automatic',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[213]','1999-01-01 05:00:00'),(215,18,10,36,3,NULL,'started','1970-01-01 00:00:00','1970-01-03 00:00:00',NULL,NULL,NULL,NULL,NULL,NULL,'[216]',NULL,'1999-01-01 05:00:00'),(216,18,11,36,3,NULL,'automatic',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[215]','1999-01-01 05:00:00'),(217,19,1,37,3,NULL,'started','1970-01-01 00:00:00','1970-01-03 00:00:00',NULL,NULL,NULL,NULL,NULL,NULL,'[218]',NULL,'1999-01-01 05:00:00'),(218,2,2,37,3,NULL,'not_yet_started',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[219]','[217]','1999-01-01 05:00:00'),(219,1,3,37,3,NULL,'not_yet_started',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[220, 221]','[218]','1999-01-01 05:00:00'),(220,3,4,37,3,NULL,'not_yet_started',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[222]','[219]','1999-01-01 05:00:00'),(221,19,4,37,3,NULL,'not_yet_started',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[222]','[219]','1999-01-01 05:00:00'),(222,1,5,37,3,NULL,'automatic',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[223]','[220, 221]','1999-01-01 05:00:00'),(223,4,6,37,3,NULL,'not_yet_started',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[224]','[222]','1999-01-01 05:00:00'),(224,1,7,37,3,NULL,'not_yet_started',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[225]','[223]','1999-01-01 05:00:00'),(225,69,8,37,3,NULL,'not_yet_started',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[226]','[224]','1999-01-01 05:00:00'),(226,1,9,37,3,NULL,'automatic',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[225]','1999-01-01 05:00:00'),(227,19,10,38,3,NULL,'started','1970-01-01 00:00:00','1970-01-03 00:00:00',NULL,NULL,NULL,NULL,NULL,NULL,'[228]',NULL,'1999-01-01 05:00:00'),(228,19,11,38,3,NULL,'automatic',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[227]','1999-01-01 05:00:00');
/*!40000 ALTER TABLE `TaskInstance` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `User`
--

DROP TABLE IF EXISTS `User`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `User` (
  `UserID` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `UserContactID` int(10) unsigned NOT NULL,
  `UserName` varchar(30) DEFAULT NULL,
  `FirstName` varchar(40) DEFAULT NULL,
  `LastName` varchar(40) DEFAULT NULL,
  `MiddleInitial` varchar(1) DEFAULT NULL,
  `Suffix` varchar(10) DEFAULT NULL,
  `OrganizationGroup` json DEFAULT NULL,
  `UserType` varchar(255) DEFAULT NULL,
  `Admin` tinyint(1) DEFAULT NULL,
  `Country` varchar(255) DEFAULT NULL,
  `City` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`UserID`),
  UNIQUE KEY `UserID` (`UserID`),
  UNIQUE KEY `User_UserID_unique` (`UserID`),
  KEY `UserContactID` (`UserContactID`),
  CONSTRAINT `user_ibfk_1` FOREIGN KEY (`UserID`) REFERENCES `UserLogin` (`UserID`) ON DELETE NO ACTION ON UPDATE CASCADE,
  CONSTRAINT `user_ibfk_2` FOREIGN KEY (`UserContactID`) REFERENCES `UserContact` (`UserContactID`) ON DELETE NO ACTION ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=70 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `User`
--

LOCK TABLES `User` WRITE;
/*!40000 ALTER TABLE `User` DISABLE KEYS */;
INSERT INTO `User` VALUES (1,1,'ajr42','Alan','Romano','J',NULL,NULL,'Instructor',1,NULL,NULL),(2,2,'qxl2','Jimmy','Lu','',NULL,NULL,'Instuctor',1,NULL,NULL),(3,3,'abc1','Emily','Smith','S',NULL,NULL,'Student',0,NULL,NULL),(4,4,'bcd1','Joe','Johnson','R',NULL,NULL,'Student',0,NULL,NULL),(5,5,'perna','Angelo','Perna','',NULL,NULL,'Instuctor',0,NULL,NULL),(6,6,'abc2','John','Smith',NULL,NULL,NULL,'Student',0,NULL,NULL),(7,7,'abc3','Sara','Thor','C',NULL,NULL,'Student',0,NULL,NULL),(8,8,'abc4','Ivan ','Merit','G',NULL,NULL,'Student',0,NULL,NULL),(9,9,'abc5','Sawyer','Murry','T',NULL,NULL,'Student',0,NULL,NULL),(10,10,'abc6','Kevin','Hart',NULL,NULL,NULL,'Student',0,NULL,NULL),(11,11,'abc7','Ryan','Johnson','M',NULL,NULL,'Student',0,NULL,NULL),(12,12,'abc8','Caitlyn','Cook','I',NULL,NULL,'Student',0,NULL,NULL),(13,13,'abc9','Carley','Cook',NULL,NULL,NULL,'Student',0,NULL,NULL),(14,14,'abc10','David','Davidson',NULL,NULL,NULL,'Student',0,NULL,NULL),(15,15,'abc11','Megan','Fox',NULL,NULL,NULL,'Student',0,NULL,NULL),(16,16,'abc12','Fred','Hudson',NULL,NULL,NULL,'Student',0,NULL,NULL),(17,17,'abc13','Olivia','Kwan',NULL,NULL,NULL,'Student',0,NULL,NULL),(18,18,'abc14','Peter','Pan',NULL,NULL,NULL,'Student',0,NULL,NULL),(19,19,'abc15','Spongebob',NULL,NULL,NULL,NULL,'Student',0,NULL,NULL),(69,69,'ka267','Krzysztof','Squarepant','',NULL,NULL,'Student',0,NULL,NULL);
/*!40000 ALTER TABLE `User` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `UserContact`
--

DROP TABLE IF EXISTS `UserContact`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `UserContact` (
  `UserContactID` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `Email` varchar(70) NOT NULL,
  `Phone` varchar(15) NOT NULL,
  PRIMARY KEY (`UserContactID`)
) ENGINE=InnoDB AUTO_INCREMENT=72 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `UserContact`
--

LOCK TABLES `UserContact` WRITE;
/*!40000 ALTER TABLE `UserContact` DISABLE KEYS */;
INSERT INTO `UserContact` VALUES (1,'ajr42','675-234-4853'),(2,'qxl2','534-134-3353'),(3,'abc1@njit.edu','535-124-1234'),(4,'bcd1@njit.edu','123-524-7653'),(5,'perna@njit.edu','123-524-2345'),(6,'abc2@njit.edu','123-524-2346'),(7,'abc3@njit.edu','123-524-2347'),(8,'abc4@njit.edu','123-524-2348'),(9,'abc5@njit.edu','123-524-2349'),(10,'abc6@njit.edu','123-524-2350'),(11,'abc7@njit.edu','123-524-2351'),(12,'abc8@njit.edu','123-524-2352'),(13,'abc9@njit.edu','123-524-2353'),(14,'abc10@njit.edu','123-524-2354'),(15,'abc11@njit.edu','123-524-2355'),(16,'abc12@njit.edu','123-524-2356'),(17,'abc13@njit.edu','123-524-2357'),(18,'abc14@njit.edu','123-524-2358'),(19,'abc15@njit.edu','123-524-2359'),(69,'ka267@njit.edu','069-069-6969'),(70,'\"ka267@njit.edu\"','XXX-XXX-XXXX'),(71,'aja38@njit.edu','XXX-XXX-XXXX');
/*!40000 ALTER TABLE `UserContact` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `UserLogin`
--

DROP TABLE IF EXISTS `UserLogin`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `UserLogin` (
  `UserID` int(10) unsigned NOT NULL,
  `Email` varchar(70) NOT NULL,
  `Password` varchar(255) NOT NULL,
  `Status` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`UserID`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `UserLogin`
--

LOCK TABLES `UserLogin` WRITE;
/*!40000 ALTER TABLE `UserLogin` DISABLE KEYS */;
INSERT INTO `UserLogin` VALUES (1,'ajr42@njit.edu','202cb962ac59075b964b07152d234b70',NULL),(2,'qxl2@njit.edu','202cb962ac59075b964b07152d234b70',NULL),(3,'abc1@njit.edu','202cb962ac59075b964b07152d234b70',NULL),(4,'bcd1@njit.edu','202cb962ac59075b964b07152d234b70',NULL),(5,'perna@njit.edu','202cb962ac59075b964b07152d234b70',NULL),(6,'abc2@njit.edu','202cb962ac59075b964b07152d234b70',NULL),(7,'abc3@njit.edu','202cb962ac59075b964b07152d234b70',NULL),(8,'abc4@njit.edu','202cb962ac59075b964b07152d234b70',NULL),(9,'abc5@njit.edu','202cb962ac59075b964b07152d234b70',NULL),(10,'abc6@njit.edu','202cb962ac59075b964b07152d234b70',NULL),(11,'abc7@njit.edu','202cb962ac59075b964b07152d234b70',NULL),(12,'abc8@njit.edu','202cb962ac59075b964b07152d234b70',NULL),(13,'abc9@njit.edu','202cb962ac59075b964b07152d234b70',NULL),(14,'abc10@njit.edu','202cb962ac59075b964b07152d234b70',NULL),(15,'abc11@njit.edu','202cb962ac59075b964b07152d234b70',NULL),(16,'abc12@njit.edu','202cb962ac59075b964b07152d234b70',NULL),(17,'abc13@njit.edu','202cb962ac59075b964b07152d234b70',NULL),(18,'abc14@njit.edu','202cb962ac59075b964b07152d234b70',NULL),(19,'abc15@njit.edu','202cb962ac59075b964b07152d234b70',NULL),(69,'ka267@njit.edu','7813d1590d28a7dd372ad54b5d29d033',NULL);
/*!40000 ALTER TABLE `UserLogin` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `WorkflowActivity`
--

DROP TABLE IF EXISTS `WorkflowActivity`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `WorkflowActivity` (
  `WorkflowActivityID` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `AssignmentID` int(10) unsigned NOT NULL,
  `TaskActivityCollection` json DEFAULT NULL,
  `Name` varchar(30) DEFAULT NULL,
  `Type` varchar(40) DEFAULT NULL,
  `GradeDistribution` json DEFAULT NULL,
  `NumberOfSets` int(10) unsigned DEFAULT NULL,
  `Documentation` varchar(100) DEFAULT NULL,
  `GroupSize` int(10) unsigned DEFAULT '1',
  `StartTaskActivity` json DEFAULT NULL,
  `WorkflowStructure` json DEFAULT NULL,
  `VersionHistory` json DEFAULT NULL,
  PRIMARY KEY (`WorkflowActivityID`),
  UNIQUE KEY `WorkflowActivityID` (`WorkflowActivityID`),
  UNIQUE KEY `WorkflowActivity_WorkflowActivityID_unique` (`WorkflowActivityID`),
  KEY `AssignmentID` (`AssignmentID`),
  CONSTRAINT `workflowactivity_ibfk_1` FOREIGN KEY (`AssignmentID`) REFERENCES `Assignment` (`AssignmentID`) ON DELETE NO ACTION ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `WorkflowActivity`
--

LOCK TABLES `WorkflowActivity` WRITE;
/*!40000 ALTER TABLE `WorkflowActivity` DISABLE KEYS */;
INSERT INTO `WorkflowActivity` VALUES (1,1,'[1, 2, 3, 4, 5, 6, 7, 8, 9]','12Problem','essay','{\"1\": 100}',1,'',1,NULL,'[{\"id\": 0, \"isSubWorkflow\": 0}, {\"id\": 1, \"parent\": 0, \"isSubWorkflow\": 0}, {\"id\": -1, \"parent\": 0}, {\"id\": -1, \"parent\": 0}, {\"id\": -1, \"parent\": 0}, {\"id\": 2, \"parent\": 0, \"isSubWorkflow\": 0}, {\"id\": -1, \"parent\": 2}, {\"id\": 3, \"parent\": 2, \"isSubWorkflow\": 0}, {\"id\": -1, \"parent\": 3}, {\"id\": -1, \"parent\": 3}, {\"id\": 4, \"parent\": 3, \"isSubWorkflow\": 0}, {\"id\": -1, \"parent\": 4}, {\"id\": -1, \"parent\": 4}, {\"id\": 5, \"parent\": 4, \"isSubWorkflow\": 0}, {\"id\": -1, \"parent\": 5}, {\"id\": -1, \"parent\": 5}, {\"id\": 6, \"parent\": 5, \"isSubWorkflow\": 0}, {\"id\": -1, \"parent\": 6}, {\"id\": -1, \"parent\": 6}, {\"id\": 7, \"parent\": 6, \"isSubWorkflow\": 0}]',NULL),(2,1,'[10, 11]','Problem','essay','{}',1,'',1,NULL,'[{\"id\": 0, \"isSubWorkflow\": 0}]',NULL);
/*!40000 ALTER TABLE `WorkflowActivity` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `WorkflowInstance`
--

DROP TABLE IF EXISTS `WorkflowInstance`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `WorkflowInstance` (
  `WorkflowInstanceID` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `WorkflowActivityID` int(10) unsigned NOT NULL,
  `AssignmentInstanceID` int(10) unsigned NOT NULL,
  `StartTime` datetime DEFAULT NULL,
  `EndTime` datetime DEFAULT NULL,
  `TaskCollection` json DEFAULT NULL,
  `Data` json DEFAULT NULL,
  PRIMARY KEY (`WorkflowInstanceID`),
  UNIQUE KEY `WorkflowInstanceID` (`WorkflowInstanceID`),
  UNIQUE KEY `WorkflowInstance_WorkflowInstanceID_unique` (`WorkflowInstanceID`),
  KEY `WorkflowActivityID` (`WorkflowActivityID`),
  KEY `AssignmentInstanceID` (`AssignmentInstanceID`),
  CONSTRAINT `workflowinstance_ibfk_1` FOREIGN KEY (`WorkflowActivityID`) REFERENCES `WorkflowActivity` (`WorkflowActivityID`) ON DELETE NO ACTION ON UPDATE CASCADE,
  CONSTRAINT `workflowinstance_ibfk_2` FOREIGN KEY (`AssignmentInstanceID`) REFERENCES `AssignmentInstance` (`AssignmentInstanceID`) ON DELETE NO ACTION ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=39 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `WorkflowInstance`
--

LOCK TABLES `WorkflowInstance` WRITE;
/*!40000 ALTER TABLE `WorkflowInstance` DISABLE KEYS */;
INSERT INTO `WorkflowInstance` VALUES (1,1,3,'1970-01-01 00:00:00',NULL,'[[1], [2], [3], [4, 5], [6], [7], [8], [9], [10]]',NULL),(2,2,3,'1970-01-01 00:00:00',NULL,'[[11], [12]]',NULL),(3,1,3,'1970-01-01 00:00:00',NULL,'[[13], [14], [15], [16, 17], [18], [19], [20], [21], [22]]',NULL),(4,2,3,'1970-01-01 00:00:00',NULL,'[[23], [24]]',NULL),(5,1,3,'1970-01-01 00:00:00',NULL,'[[25], [26], [27], [28, 29], [30], [31], [32], [33], [34]]',NULL),(6,2,3,'1970-01-01 00:00:00',NULL,'[[35], [36]]',NULL),(7,1,3,'1970-01-01 00:00:00',NULL,'[[37], [38], [39], [40, 41], [42], [43], [44], [45], [46]]',NULL),(8,2,3,'1970-01-01 00:00:00',NULL,'[[47], [48]]',NULL),(9,1,3,'1970-01-01 00:00:00',NULL,'[[49], [50], [51], [52, 53], [54], [55], [56], [57], [58]]',NULL),(10,2,3,'1970-01-01 00:00:00',NULL,'[[59], [60]]',NULL),(11,1,3,'1970-01-01 00:00:00',NULL,'[[61], [62], [63], [64, 65], [66], [67], [68], [69], [70]]',NULL),(12,2,3,'1970-01-01 00:00:00',NULL,'[[71], [72]]',NULL),(13,1,3,'1970-01-01 00:00:00',NULL,'[[73], [74], [75], [76, 77], [78], [79], [80], [81], [82]]',NULL),(14,2,3,'1970-01-01 00:00:00',NULL,'[[83], [84]]',NULL),(15,1,3,'1970-01-01 00:00:00',NULL,'[[85], [86], [87], [88, 89], [90], [91], [92], [93], [94]]',NULL),(16,2,3,'1970-01-01 00:00:00',NULL,'[[95], [96]]',NULL),(17,1,3,'1970-01-01 00:00:00',NULL,'[[97], [98], [99], [100, 101], [102], [103], [104], [105], [106]]',NULL),(18,2,3,'1970-01-01 00:00:00',NULL,'[[107], [108]]',NULL),(19,1,3,'1970-01-01 00:00:00',NULL,'[[109], [110], [111], [112, 113], [114], [115], [116], [117], [118]]',NULL),(20,2,3,'1970-01-01 00:00:00',NULL,'[[119], [120]]',NULL),(21,1,3,'1970-01-01 00:00:00',NULL,'[[121], [122], [123], [124, 125], [126], [127], [128], [129], [130]]',NULL),(22,2,3,'1970-01-01 00:00:00',NULL,'[[131], [132]]',NULL),(23,1,3,'1970-01-01 00:00:00',NULL,'[[133], [134], [135], [136, 137], [138], [139], [140], [141], [142]]',NULL),(24,2,3,'1970-01-01 00:00:00',NULL,'[[143], [144]]',NULL),(25,1,3,'1970-01-01 00:00:00',NULL,'[[145], [146], [147], [148, 149], [150], [151], [152], [153], [154]]',NULL),(26,2,3,'1970-01-01 00:00:00',NULL,'[[155], [156]]',NULL),(27,1,3,'1970-01-01 00:00:00',NULL,'[[157], [158], [159], [160, 161], [162], [163], [164], [165], [166]]',NULL),(28,2,3,'1970-01-01 00:00:00',NULL,'[[167], [168]]',NULL),(29,1,3,'1970-01-01 00:00:00',NULL,'[[169], [170], [171], [172, 173], [174], [175], [176], [177], [178]]',NULL),(30,2,3,'1970-01-01 00:00:00',NULL,'[[179], [180]]',NULL),(31,1,3,'1970-01-01 00:00:00',NULL,'[[181], [182], [183], [184, 185], [186], [187], [188], [189], [190]]',NULL),(32,2,3,'1970-01-01 00:00:00',NULL,'[[191], [192]]',NULL),(33,1,3,'1970-01-01 00:00:00',NULL,'[[193], [194], [195], [196, 197], [198], [199], [200], [201], [202]]',NULL),(34,2,3,'1970-01-01 00:00:00',NULL,'[[203], [204]]',NULL),(35,1,3,'1970-01-01 00:00:00',NULL,'[[205], [206], [207], [208, 209], [210], [211], [212], [213], [214]]',NULL),(36,2,3,'1970-01-01 00:00:00',NULL,'[[215], [216]]',NULL),(37,1,3,'1970-01-01 00:00:00',NULL,'[[217], [218], [219], [220, 221], [222], [223], [224], [225], [226]]',NULL),(38,2,3,'1970-01-01 00:00:00',NULL,'[[227], [228]]',NULL);
/*!40000 ALTER TABLE `WorkflowInstance` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2017-01-25 11:08:45
