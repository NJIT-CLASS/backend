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
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Assignment`
--

LOCK TABLES `Assignment` WRITE;
/*!40000 ALTER TABLE `Assignment` DISABLE KEYS */;
INSERT INTO `Assignment` VALUES (1,2,'[1, 2]','','','{}','Assignment123','homework','Assignment123',NULL,1,NULL,NULL),(2,2,'[3]','','','{}','Assignment12345','essay','Assignment12345',NULL,1,NULL,NULL);
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
INSERT INTO `AssignmentInstance` VALUES (3,2,2,'1970-01-01 00:00:00',NULL,'[]','{\"workflows\": [{\"id\": \"3\", \"tasks\": [{\"id\": 12, \"DueType\": [\"duration\", 2880]}, {\"id\": 13, \"DueType\": [\"duration\", 2880]}, {\"id\": 14, \"DueType\": [\"duration\", 2880]}, {\"id\": 15, \"DueType\": [\"duration\", 2880]}, {\"id\": 16, \"DueType\": []}, {\"id\": 17, \"DueType\": [\"duration\", 2880]}, {\"id\": 18, \"DueType\": [\"duration\", 2880]}, {\"id\": 19, \"DueType\": [\"duration\", 2880]}, {\"id\": 20, \"DueType\": []}], \"startDate\": 0}]}'),(4,2,1,'1970-01-01 00:00:00',NULL,'[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19]','{\"workflows\": [{\"id\": \"3\", \"tasks\": [{\"id\": 12, \"DueType\": [\"duration\", 2880]}, {\"id\": 13, \"DueType\": [\"duration\", 2880]}, {\"id\": 14, \"DueType\": [\"duration\", 2880]}, {\"id\": 15, \"DueType\": [\"duration\", 2880]}, {\"id\": 16, \"DueType\": []}, {\"id\": 17, \"DueType\": [\"duration\", 2880]}, {\"id\": 18, \"DueType\": [\"duration\", 2880]}, {\"id\": 19, \"DueType\": [\"duration\", 2880]}, {\"id\": 20, \"DueType\": []}], \"startDate\": 0}]}');
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
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `TaskActivity`
--

LOCK TABLES `TaskActivity` WRITE;
/*!40000 ALTER TABLE `TaskActivity` DISABLE KEYS */;
INSERT INTO `TaskActivity` VALUES (1,1,1,'Create Problem','create_problem','\0\0','[\"duration\", 1440]',0,'\"late\"','\"allocate_to_instructor\"','Create Problem',NULL,'0','[\"student\", \"individual\", {}]',NULL,'none',0,'',NULL,'{\"0\": {\"title\": \"Field\", \"rubric\": \"\", \"field_type\": \"text\", \"rating_max\": \"5\", \"show_title\": false, \"numeric_max\": \"40\", \"numeric_min\": \"0\", \"instructions\": \"\", \"list_of_labels\": \"Easy, Medium, Difficult\", \"assessment_type\": null, \"default_content\": [\"\", \"\"], \"default_refers_to\": [null, null], \"requires_justification\": false, \"justification_instructions\": \"\"}, \"field_titles\": [\"Field\"], \"number_of_fields\": 1}','[\"edit\", \"don\'t wait\"]',0,'none',1,'[]','max',NULL,0,0,1,'',NULL,NULL,NULL,NULL,NULL,NULL,NULL),(2,1,1,'Edit Create Problem','edit','\0\0','[\"duration\", 1440]',0,'\"late\"','\"keep_same_participant\"','Edit Create Problem',NULL,'0','[\"instructor\", \"group\", {\"not\": [1]}]',NULL,'none',0,'',NULL,'{\"0\": {\"title\": \"Field\", \"rubric\": \"\", \"field_type\": \"text\", \"rating_max\": \"5\", \"show_title\": false, \"numeric_max\": \"40\", \"numeric_min\": \"0\", \"instructions\": \"\", \"list_of_labels\": \"Easy, Medium, Difficult\", \"assessment_type\": null, \"default_content\": [\"\", \"\"], \"default_refers_to\": [null, null], \"requires_justification\": false, \"justification_instructions\": \"\"}, \"field_titles\": [\"Field\"], \"number_of_fields\": 1}','[\"none\", \"don\'t wait\"]',0,'none',1,'[]','max',NULL,0,0,0,'',NULL,NULL,NULL,NULL,NULL,NULL,NULL),(3,1,1,'Solve Create Problem','solve_problem','\0\0','[\"duration\", 1440]',0,'\"late\"','\"allocate_new_person_from_contingency_pool\"','Solve Create Problem',NULL,'0','[\"student\", \"individual\", {\"not\": [1, 2]}]',NULL,'none',0,'',NULL,'{\"0\": {\"title\": \"Field\", \"rubric\": \"\", \"field_type\": \"text\", \"rating_max\": \"5\", \"show_title\": false, \"numeric_max\": \"40\", \"numeric_min\": \"0\", \"instructions\": \"\", \"list_of_labels\": \"Easy, Medium, Difficult\", \"assessment_type\": null, \"default_content\": [\"\", \"\"], \"default_refers_to\": [null, null], \"requires_justification\": false, \"justification_instructions\": \"\"}, \"field_titles\": [\"Field\"], \"number_of_fields\": 1}','[\"none\", \"don\'t wait\"]',0,'grade',1,'[]','max',NULL,0,0,0,'',NULL,NULL,NULL,NULL,NULL,NULL,NULL),(4,1,1,'Grade Solve Create Problem','grade_problem','\0\0','[\"duration\", 1440]',0,'\"late\"','\"keep_same_participant\"','Grade Solve Create Problem',NULL,'0','[\"student\", \"individual\", {\"not\": [1], \"same_as\": [1]}]',NULL,'none',1,'',NULL,'{\"0\": {\"title\": \"Field\", \"rubric\": \"\", \"field_type\": \"text\", \"rating_max\": \"5\", \"show_title\": false, \"numeric_max\": \"40\", \"numeric_min\": \"0\", \"instructions\": \"\", \"list_of_labels\": \"Easy, Medium, Difficult\", \"assessment_type\": null, \"default_content\": [\"\", \"\"], \"default_refers_to\": [null, null], \"requires_justification\": false, \"justification_instructions\": \"\"}, \"field_titles\": [\"Field\"], \"number_of_fields\": 1}','[\"none\", \"don\'t wait\"]',0,'none',2,'[]','max',NULL,1,0,0,'',NULL,NULL,NULL,NULL,NULL,NULL,NULL),(5,1,1,'Needs Consolidation of Grade Solve Create Problem','needs_consolidation','\0\0','[]',0,NULL,NULL,'Needs Consolidation of Grade Solve Create Problem',NULL,'0','[\"student\", \"individual\", {\"same_as\": [3]}]',NULL,'none',1,'',NULL,'{\"0\": {\"title\": \"Field\", \"rubric\": \"\", \"field_type\": \"text\", \"rating_max\": \"5\", \"show_title\": false, \"numeric_max\": \"40\", \"numeric_min\": \"0\", \"instructions\": \"\", \"list_of_labels\": \"Easy, Medium, Difficult\", \"assessment_type\": null, \"default_content\": [\"\", \"\"], \"default_refers_to\": [null, null], \"requires_justification\": false, \"justification_instructions\": \"\"}, \"field_titles\": [\"Field\"], \"number_of_fields\": 1}','[\"none\", \"don\'t wait\"]',0,'none',1,'[]','max',NULL,0,0,0,'',NULL,NULL,NULL,NULL,NULL,NULL,NULL),(6,1,1,'Consolidate Grade Solve Create Problem','consolidation','\0\0','[\"duration\", 1440]',0,'\"late\"','\"keep_same_participant\"','Consolidate Grade Solve Create Problem',NULL,'0','[\"student\", \"individual\", {\"not\": [3, 1, 4]}]',NULL,'none',1,'',NULL,'{\"0\": {\"title\": \"Field\", \"rubric\": \"\", \"field_type\": \"text\", \"rating_max\": \"5\", \"show_title\": false, \"numeric_max\": \"40\", \"numeric_min\": \"0\", \"instructions\": \"\", \"list_of_labels\": \"Easy, Medium, Difficult\", \"assessment_type\": null, \"default_content\": [\"\", \"\"], \"default_refers_to\": [null, null], \"requires_justification\": false, \"justification_instructions\": \"\"}, \"field_titles\": [\"Field\"], \"number_of_fields\": 1}','[\"none\", \"don\'t wait\"]',0,'none',1,'[]','max',NULL,0,0,0,'',NULL,NULL,NULL,NULL,NULL,NULL,NULL),(7,1,1,'Dispute of  Grade Solve Create Problem','dispute','\0\0','[]',0,'\"resolved\"',NULL,'Dispute of  Grade Solve Create Problem',NULL,'0','[\"student\", \"individual\", {\"same_as\": [3]}]',NULL,'none',0,'',NULL,'{\"0\": {\"title\": \"Field\", \"rubric\": \"\", \"field_type\": \"text\", \"rating_max\": \"5\", \"show_title\": false, \"numeric_max\": \"40\", \"numeric_min\": \"0\", \"instructions\": \"\", \"list_of_labels\": \"Easy, Medium, Difficult\", \"assessment_type\": null, \"default_content\": [\"\", \"\"], \"default_refers_to\": [null, null], \"requires_justification\": false, \"justification_instructions\": \"\"}, \"field_titles\": [\"Field\"], \"number_of_fields\": 1}','[\"none\", \"don\'t wait\"]',0,'none',1,'[]','max',NULL,0,0,0,'',NULL,NULL,NULL,NULL,NULL,NULL,NULL),(8,1,1,'Resolve Dispute of Grade Solve Create Problem','resolve_dispute','\0\0','[\"duration\", 1440]',0,'\"late\"','\"keep_same_participant\"','Resolve Dispute of Grade Solve Create Problem',NULL,'0','[\"student\", \"individual\", {\"not\": [3]}]',NULL,'none',1,'',NULL,'{\"0\": {\"title\": \"Field\", \"rubric\": \"\", \"field_type\": \"text\", \"rating_max\": \"5\", \"show_title\": false, \"numeric_max\": \"40\", \"numeric_min\": \"0\", \"instructions\": \"\", \"list_of_labels\": \"Easy, Medium, Difficult\", \"assessment_type\": null, \"default_content\": [\"\", \"\"], \"default_refers_to\": [null, null], \"requires_justification\": false, \"justification_instructions\": \"\"}, \"field_titles\": [\"Field\"], \"number_of_fields\": 1}','[\"none\", \"don\'t wait\"]',0,'none',1,'[]','max',NULL,0,0,0,'',NULL,NULL,NULL,NULL,NULL,NULL,NULL),(9,1,1,'Workflow 1 Complete','completed','\0\0','[]',0,NULL,NULL,'Workflow 1 Complete',NULL,'0','[\"student\", \"individual\", {\"same_as\": [3]}]',NULL,'none',0,'',NULL,'{\"0\": {\"title\": \"Field\", \"rubric\": \"\", \"field_type\": \"text\", \"rating_max\": \"5\", \"show_title\": false, \"numeric_max\": \"40\", \"numeric_min\": \"0\", \"instructions\": \"\", \"list_of_labels\": \"Easy, Medium, Difficult\", \"assessment_type\": null, \"default_content\": [\"\", \"\"], \"default_refers_to\": [null, null], \"requires_justification\": false, \"justification_instructions\": \"\"}, \"field_titles\": [\"Field\"], \"number_of_fields\": 1}','[\"none\", \"don\'t wait\"]',0,'none',1,'[]','max',NULL,0,0,0,'',NULL,NULL,NULL,NULL,NULL,NULL,NULL),(10,2,1,'Create Problem','create_problem','\0\0','[\"duration\", 1440]',0,'\"late\"','\"keep_same_participant\"','Create Problem',NULL,'0','[\"student\", \"individual\", {}]',NULL,'none',0,'',NULL,'{\"0\": {\"title\": \"Field\", \"rubric\": \"\", \"field_type\": \"text\", \"rating_max\": \"5\", \"show_title\": false, \"numeric_max\": \"40\", \"numeric_min\": \"0\", \"instructions\": \"\", \"list_of_labels\": \"Easy, Medium, Difficult\", \"assessment_type\": null, \"default_content\": [\"\", \"\"], \"default_refers_to\": [null, null], \"requires_justification\": false, \"justification_instructions\": \"\"}, \"field_titles\": [\"Field\"], \"number_of_fields\": 1}','[\"none\", \"don\'t wait\"]',0,'none',1,'[]','max',NULL,0,0,0,'',NULL,NULL,NULL,NULL,NULL,NULL,NULL),(11,2,1,'Workflow 2 Complete','completed','\0\0','[]',0,NULL,NULL,'Workflow 2 Complete',NULL,'0','[\"student\", \"individual\", {\"same_as\": [10]}]',NULL,'none',0,'',NULL,'{\"0\": {\"title\": \"Field\", \"rubric\": \"\", \"field_type\": \"text\", \"rating_max\": \"5\", \"show_title\": false, \"numeric_max\": \"40\", \"numeric_min\": \"0\", \"instructions\": \"\", \"list_of_labels\": \"Easy, Medium, Difficult\", \"assessment_type\": null, \"default_content\": [\"\", \"\"], \"default_refers_to\": [null, null], \"requires_justification\": false, \"justification_instructions\": \"\"}, \"field_titles\": [\"Field\"], \"number_of_fields\": 1}','[\"none\", \"don\'t wait\"]',0,'none',1,'[]','max',NULL,0,0,0,'',NULL,NULL,NULL,NULL,NULL,NULL,NULL),(12,3,2,'Create Problem','create_problem','\0\0','[\"duration\", 2880]',0,'\"late\"','\"keep_same_participant\"','Create Problem','','0','[\"student\", \"individual\", {}]',NULL,'none',0,'',NULL,'{\"0\": {\"title\": \"Field\", \"rubric\": \"\", \"field_type\": \"text\", \"rating_max\": 5, \"show_title\": false, \"numeric_max\": 40, \"numeric_min\": 0, \"instructions\": \"Create a new problem for another student to solve.\", \"list_of_labels\": \"Easy, Medium, Difficult\", \"assessment_type\": null, \"default_content\": [\"\", \"\"], \"default_refers_to\": [null, null], \"requires_justification\": false, \"justification_instructions\": \"\"}, \"field_titles\": [\"Field\"], \"number_of_fields\": 1}','[\"edit\", \"don\'t wait\"]',0,'none',1,'[]','max',NULL,0,0,1,'',NULL,NULL,NULL,NULL,NULL,NULL,NULL),(13,3,2,'Edit Create Problem','edit','\0\0','[\"duration\", 2880]',0,'\"late\"','\"keep_same_participant\"','Edit Create Problem','','0','[\"instructor\", \"group\", {\"not\": [12]}]',NULL,'none',0,'',NULL,'{\"0\": {\"title\": \"Field\", \"rubric\": \"\", \"field_type\": \"text\", \"rating_max\": 5, \"show_title\": false, \"numeric_max\": 40, \"numeric_min\": 0, \"instructions\": \"Edit the problem to ensure that it makes sense.\", \"list_of_labels\": \"Easy, Medium, Difficult\", \"assessment_type\": null, \"default_content\": [\"\", \"\"], \"default_refers_to\": [null, null], \"requires_justification\": false, \"justification_instructions\": \"\"}, \"field_titles\": [\"Field\"], \"number_of_fields\": 1}','[\"none\", \"don\'t wait\"]',0,'none',1,'[]','max',NULL,0,0,0,'',NULL,NULL,NULL,NULL,NULL,NULL,NULL),(14,3,2,'Solve Create Problem','solve_problem','\0\0','[\"duration\", 2880]',0,'\"late\"','\"keep_same_participant\"','Solve Create Problem','','0','[\"student\", \"individual\", {\"not\": [12, 13]}]',NULL,'none',0,'',NULL,'{\"0\": {\"title\": \"Field\", \"rubric\": \"\", \"field_type\": \"text\", \"rating_max\": 5, \"show_title\": false, \"numeric_max\": 40, \"numeric_min\": 0, \"instructions\": \"\", \"list_of_labels\": \"Easy, Medium, Difficult\", \"assessment_type\": null, \"default_content\": [\"\", \"\"], \"default_refers_to\": [null, null], \"requires_justification\": false, \"justification_instructions\": \"\"}, \"field_titles\": [\"Field\"], \"number_of_fields\": 1}','[\"none\", \"don\'t wait\"]',0,'grade',1,'[]','max',NULL,0,0,0,'',NULL,NULL,NULL,NULL,NULL,NULL,NULL),(15,3,2,'Grade Solve Create Problem','grade_problem','\0\0','[\"duration\", 2880]',0,'\"late\"','\"keep_same_participant\"','Grade Solve Create Problem','','0','[\"student\", \"individual\", {\"not\": [12], \"same_as\": [12]}]',NULL,'none',1,'',NULL,'{\"0\": {\"title\": \"Field\", \"rubric\": \"\", \"field_type\": \"numeric\", \"rating_max\": 5, \"show_title\": false, \"numeric_max\": 40, \"numeric_min\": 0, \"instructions\": \"\", \"list_of_labels\": \"Easy, Medium, Difficult\", \"assessment_type\": null, \"default_content\": [\"\", \"\"], \"default_refers_to\": [null, null], \"requires_justification\": false, \"justification_instructions\": \"\"}, \"field_titles\": [\"Field\"], \"number_of_fields\": 1}','[\"none\", \"don\'t wait\"]',0,'none',2,'[]','max',NULL,1,0,0,'',NULL,NULL,NULL,NULL,NULL,NULL,NULL),(16,3,2,'Needs Consolidation of Grade Solve Create Problem','needs_consolidation','\0\0','[]',0,NULL,NULL,'Needs Consolidation of Grade Solve Create Problem','','0','[\"student\", \"individual\", {\"same_as\": [14]}]',NULL,'none',1,'',NULL,'{\"0\": {\"title\": \"Field\", \"rubric\": \"\", \"field_type\": \"text\", \"rating_max\": 5, \"show_title\": false, \"numeric_max\": 40, \"numeric_min\": 0, \"instructions\": \"\", \"list_of_labels\": \"Easy, Medium, Difficult\", \"assessment_type\": null, \"default_content\": [\"\", \"\"], \"default_refers_to\": [null, null], \"requires_justification\": false, \"justification_instructions\": \"\"}, \"field_titles\": [\"Field\"], \"number_of_fields\": 1}','[\"none\", \"don\'t wait\"]',0,'none',1,'[10, \"percent\"]','max',NULL,0,0,0,'',NULL,NULL,NULL,NULL,NULL,NULL,NULL),(17,3,2,'Consolidate Grade Solve Create Problem','consolidation','\0\0','[\"duration\", 2880]',0,'\"late\"','\"keep_same_participant\"','Consolidate Grade Solve Create Problem','','0','[\"student\", \"individual\", {\"not\": [14, 12, 15]}]',NULL,'none',1,'',NULL,'{\"0\": {\"title\": \"Field\", \"rubric\": \"\", \"field_type\": \"text\", \"rating_max\": 5, \"show_title\": false, \"numeric_max\": 40, \"numeric_min\": 0, \"instructions\": \"\", \"list_of_labels\": \"Easy, Medium, Difficult\", \"assessment_type\": null, \"default_content\": [\"\", \"\"], \"default_refers_to\": [null, null], \"requires_justification\": false, \"justification_instructions\": \"\"}, \"field_titles\": [\"Field\"], \"number_of_fields\": 1}','[\"none\", \"don\'t wait\"]',0,'none',1,'[]','max',NULL,0,0,0,'',NULL,NULL,NULL,NULL,NULL,NULL,NULL),(18,3,2,'Dispute of  Grade Solve Create Problem','dispute','\0\0','[\"duration\", 2880]',0,'\"resolved\"',NULL,'Dispute of  Grade Solve Create Problem','','0','[\"student\", \"individual\", {\"same_as\": [14]}]',NULL,'none',0,'',NULL,'{\"0\": {\"title\": \"Field\", \"rubric\": \"\", \"field_type\": \"text\", \"rating_max\": 5, \"show_title\": false, \"numeric_max\": 40, \"numeric_min\": 0, \"instructions\": \"\", \"list_of_labels\": \"Easy, Medium, Difficult\", \"assessment_type\": null, \"default_content\": [\"\", \"\"], \"default_refers_to\": [null, null], \"requires_justification\": false, \"justification_instructions\": \"\"}, \"field_titles\": [\"Field\"], \"number_of_fields\": 1}','[\"none\", \"don\'t wait\"]',0,'none',1,'[]','max',NULL,0,0,0,'',NULL,NULL,NULL,NULL,NULL,NULL,NULL),(19,3,2,'Resolve Dispute of Grade Solve Create Problem','resolve_dispute','\0\0','[\"duration\", 2880]',0,'\"late\"','\"keep_same_participant\"','Resolve Dispute of Grade Solve Create Problem','','0','[\"student\", \"individual\", {\"not\": [14]}]',NULL,'none',1,'',NULL,'{\"0\": {\"title\": \"Field\", \"rubric\": \"\", \"field_type\": \"text\", \"rating_max\": 5, \"show_title\": false, \"numeric_max\": 40, \"numeric_min\": 0, \"instructions\": \"\", \"list_of_labels\": \"Easy, Medium, Difficult\", \"assessment_type\": null, \"default_content\": [\"\", \"\"], \"default_refers_to\": [null, null], \"requires_justification\": false, \"justification_instructions\": \"\"}, \"field_titles\": [\"Field\"], \"number_of_fields\": 1}','[\"none\", \"don\'t wait\"]',0,'none',1,'[]','max',NULL,0,0,0,'',NULL,NULL,NULL,NULL,NULL,NULL,NULL),(20,3,2,'Workflow 1 Complete','completed','\0\0','[]',0,NULL,NULL,'Workflow 1 Complete','','0','[\"student\", \"individual\", {\"same_as\": [14]}]',NULL,'none',0,'',NULL,'{\"0\": {\"title\": \"Field\", \"rubric\": \"\", \"field_type\": \"text\", \"rating_max\": 5, \"show_title\": false, \"numeric_max\": 40, \"numeric_min\": 0, \"instructions\": \"\", \"list_of_labels\": \"Easy, Medium, Difficult\", \"assessment_type\": null, \"default_content\": [\"\", \"\"], \"default_refers_to\": [null, null], \"requires_justification\": false, \"justification_instructions\": \"\"}, \"field_titles\": [\"Field\"], \"number_of_fields\": 1}','[\"none\", \"don\'t wait\"]',0,'none',1,'[]','max',NULL,0,0,0,'',NULL,NULL,NULL,NULL,NULL,NULL,NULL);
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
) ENGINE=InnoDB AUTO_INCREMENT=191 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `TaskInstance`
--

LOCK TABLES `TaskInstance` WRITE;
/*!40000 ALTER TABLE `TaskInstance` DISABLE KEYS */;
INSERT INTO `TaskInstance` VALUES (1,1,12,1,4,NULL,'complete','1970-01-01 00:00:00','1970-01-03 00:00:00','2017-02-05 21:59:15','{\"0\": [\"1231321321\", \"\"], \"number_of_fields\": 1}',NULL,NULL,NULL,NULL,'[2]',NULL,'1999-01-01 05:00:00'),(2,2,13,1,4,NULL,'complete','2017-02-05 21:59:15','2017-02-07 21:59:15','2017-02-05 21:59:32','{\"0\": [\"1212\", \"\"], \"number_of_fields\": 1}',NULL,NULL,NULL,NULL,'[3]','[1]','1999-01-01 05:00:00'),(3,3,14,1,4,NULL,'complete','2017-02-05 21:59:32','2017-02-07 21:59:32','2017-02-05 21:59:47','{\"0\": [\"12312313123\", \"\"], \"number_of_fields\": 1}',NULL,NULL,NULL,NULL,'[4, 5]','[2]','1999-01-01 05:00:00'),(4,4,15,1,4,NULL,'complete','2017-02-05 21:59:47','2017-02-07 21:59:47','2017-02-05 22:00:16','{\"0\": [\"30\", \"\"], \"number_of_fields\": 1}',NULL,NULL,NULL,NULL,'[6]','[3]','1999-01-01 05:00:00'),(5,1,15,1,4,NULL,'complete','2017-02-05 21:59:47','2017-02-07 21:59:47','2017-02-07 22:23:55','{\"0\": [\"3\", \"\"], \"number_of_fields\": 1}',NULL,NULL,NULL,NULL,'[6]','[3]','1999-01-01 05:00:00'),(6,3,16,1,4,NULL,'automatic',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[7]','[4, 5]','1999-01-01 05:00:00'),(7,69,17,1,4,NULL,'started','2017-02-07 22:23:55','2017-02-09 22:23:55',NULL,NULL,NULL,NULL,NULL,NULL,'[8]','[6]','1999-01-01 05:00:00'),(8,3,18,1,4,NULL,'not_yet_started',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[9]','[7]','1999-01-01 05:00:00'),(9,5,19,1,4,NULL,'not_yet_started',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[10]','[8]','1999-01-01 05:00:00'),(10,3,20,1,4,NULL,'automatic',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[9]','1999-01-01 05:00:00'),(11,3,12,2,4,NULL,'started','1970-01-01 00:00:00','1970-01-03 00:00:00',NULL,NULL,NULL,NULL,NULL,NULL,'[12]',NULL,'1999-01-01 05:00:00'),(12,2,13,2,4,NULL,'not_yet_started',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[13]','[11]','1999-01-01 05:00:00'),(13,4,14,2,4,NULL,'not_yet_started',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[14, 15]','[12]','1999-01-01 05:00:00'),(14,69,15,2,4,NULL,'not_yet_started',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[16]','[13]','1999-01-01 05:00:00'),(15,3,15,2,4,NULL,'not_yet_started',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[16]','[13]','1999-01-01 05:00:00'),(16,4,16,2,4,NULL,'automatic',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[17]','[14, 15]','1999-01-01 05:00:00'),(17,5,17,2,4,NULL,'not_yet_started',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[18]','[16]','1999-01-01 05:00:00'),(18,4,18,2,4,NULL,'not_yet_started',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[19]','[17]','1999-01-01 05:00:00'),(19,6,19,2,4,NULL,'not_yet_started',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[20]','[18]','1999-01-01 05:00:00'),(20,4,20,2,4,NULL,'automatic',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[19]','1999-01-01 05:00:00'),(21,4,12,3,4,NULL,'started','1970-01-01 00:00:00','1970-01-03 00:00:00',NULL,NULL,NULL,NULL,NULL,NULL,'[22]',NULL,'1999-01-01 05:00:00'),(22,2,13,3,4,NULL,'not_yet_started',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[23]','[21]','1999-01-01 05:00:00'),(23,69,14,3,4,NULL,'not_yet_started',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[24, 25]','[22]','1999-01-01 05:00:00'),(24,5,15,3,4,NULL,'not_yet_started',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[26]','[23]','1999-01-01 05:00:00'),(25,4,15,3,4,NULL,'not_yet_started',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[26]','[23]','1999-01-01 05:00:00'),(26,69,16,3,4,NULL,'automatic',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[27]','[24, 25]','1999-01-01 05:00:00'),(27,6,17,3,4,NULL,'not_yet_started',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[28]','[26]','1999-01-01 05:00:00'),(28,69,18,3,4,NULL,'not_yet_started',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[29]','[27]','1999-01-01 05:00:00'),(29,7,19,3,4,NULL,'not_yet_started',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[30]','[28]','1999-01-01 05:00:00'),(30,69,20,3,4,NULL,'automatic',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[29]','1999-01-01 05:00:00'),(31,69,12,4,4,NULL,'started','1970-01-01 00:00:00','1970-01-03 00:00:00',NULL,NULL,NULL,NULL,NULL,NULL,'[32]',NULL,'1999-01-01 05:00:00'),(32,2,13,4,4,NULL,'not_yet_started',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[33]','[31]','1999-01-01 05:00:00'),(33,5,14,4,4,NULL,'not_yet_started',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[34, 35]','[32]','1999-01-01 05:00:00'),(34,6,15,4,4,NULL,'not_yet_started',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[36]','[33]','1999-01-01 05:00:00'),(35,69,15,4,4,NULL,'not_yet_started',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[36]','[33]','1999-01-01 05:00:00'),(36,5,16,4,4,NULL,'automatic',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[37]','[34, 35]','1999-01-01 05:00:00'),(37,7,17,4,4,NULL,'not_yet_started',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[38]','[36]','1999-01-01 05:00:00'),(38,5,18,4,4,NULL,'not_yet_started',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[39]','[37]','1999-01-01 05:00:00'),(39,8,19,4,4,NULL,'not_yet_started',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[40]','[38]','1999-01-01 05:00:00'),(40,5,20,4,4,NULL,'automatic',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[39]','1999-01-01 05:00:00'),(41,5,12,5,4,NULL,'started','1970-01-01 00:00:00','1970-01-03 00:00:00',NULL,NULL,NULL,NULL,NULL,NULL,'[42]',NULL,'1999-01-01 05:00:00'),(42,2,13,5,4,NULL,'not_yet_started',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[43]','[41]','1999-01-01 05:00:00'),(43,6,14,5,4,NULL,'not_yet_started',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[44, 45]','[42]','1999-01-01 05:00:00'),(44,7,15,5,4,NULL,'not_yet_started',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[46]','[43]','1999-01-01 05:00:00'),(45,5,15,5,4,NULL,'not_yet_started',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[46]','[43]','1999-01-01 05:00:00'),(46,6,16,5,4,NULL,'automatic',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[47]','[44, 45]','1999-01-01 05:00:00'),(47,8,17,5,4,NULL,'not_yet_started',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[48]','[46]','1999-01-01 05:00:00'),(48,6,18,5,4,NULL,'not_yet_started',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[49]','[47]','1999-01-01 05:00:00'),(49,9,19,5,4,NULL,'not_yet_started',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[50]','[48]','1999-01-01 05:00:00'),(50,6,20,5,4,NULL,'automatic',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[49]','1999-01-01 05:00:00'),(51,6,12,6,4,NULL,'started','1970-01-01 00:00:00','1970-01-03 00:00:00',NULL,NULL,NULL,NULL,NULL,NULL,'[52]',NULL,'1999-01-01 05:00:00'),(52,2,13,6,4,NULL,'not_yet_started',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[53]','[51]','1999-01-01 05:00:00'),(53,7,14,6,4,NULL,'not_yet_started',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[54, 55]','[52]','1999-01-01 05:00:00'),(54,8,15,6,4,NULL,'not_yet_started',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[56]','[53]','1999-01-01 05:00:00'),(55,6,15,6,4,NULL,'not_yet_started',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[56]','[53]','1999-01-01 05:00:00'),(56,7,16,6,4,NULL,'automatic',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[57]','[54, 55]','1999-01-01 05:00:00'),(57,9,17,6,4,NULL,'not_yet_started',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[58]','[56]','1999-01-01 05:00:00'),(58,7,18,6,4,NULL,'not_yet_started',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[59]','[57]','1999-01-01 05:00:00'),(59,10,19,6,4,NULL,'not_yet_started',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[60]','[58]','1999-01-01 05:00:00'),(60,7,20,6,4,NULL,'automatic',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[59]','1999-01-01 05:00:00'),(61,7,12,7,4,NULL,'started','1970-01-01 00:00:00','1970-01-03 00:00:00',NULL,NULL,NULL,NULL,NULL,NULL,'[62]',NULL,'1999-01-01 05:00:00'),(62,2,13,7,4,NULL,'not_yet_started',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[63]','[61]','1999-01-01 05:00:00'),(63,8,14,7,4,NULL,'not_yet_started',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[64, 65]','[62]','1999-01-01 05:00:00'),(64,9,15,7,4,NULL,'not_yet_started',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[66]','[63]','1999-01-01 05:00:00'),(65,7,15,7,4,NULL,'not_yet_started',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[66]','[63]','1999-01-01 05:00:00'),(66,8,16,7,4,NULL,'automatic',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[67]','[64, 65]','1999-01-01 05:00:00'),(67,10,17,7,4,NULL,'not_yet_started',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[68]','[66]','1999-01-01 05:00:00'),(68,8,18,7,4,NULL,'not_yet_started',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[69]','[67]','1999-01-01 05:00:00'),(69,11,19,7,4,NULL,'not_yet_started',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[70]','[68]','1999-01-01 05:00:00'),(70,8,20,7,4,NULL,'automatic',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[69]','1999-01-01 05:00:00'),(71,8,12,8,4,NULL,'started','1970-01-01 00:00:00','1970-01-03 00:00:00',NULL,NULL,NULL,NULL,NULL,NULL,'[72]',NULL,'1999-01-01 05:00:00'),(72,2,13,8,4,NULL,'not_yet_started',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[73]','[71]','1999-01-01 05:00:00'),(73,9,14,8,4,NULL,'not_yet_started',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[74, 75]','[72]','1999-01-01 05:00:00'),(74,10,15,8,4,NULL,'not_yet_started',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[76]','[73]','1999-01-01 05:00:00'),(75,8,15,8,4,NULL,'not_yet_started',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[76]','[73]','1999-01-01 05:00:00'),(76,9,16,8,4,NULL,'automatic',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[77]','[74, 75]','1999-01-01 05:00:00'),(77,11,17,8,4,NULL,'not_yet_started',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[78]','[76]','1999-01-01 05:00:00'),(78,9,18,8,4,NULL,'not_yet_started',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[79]','[77]','1999-01-01 05:00:00'),(79,12,19,8,4,NULL,'not_yet_started',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[80]','[78]','1999-01-01 05:00:00'),(80,9,20,8,4,NULL,'automatic',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[79]','1999-01-01 05:00:00'),(81,9,12,9,4,NULL,'started','1970-01-01 00:00:00','1970-01-03 00:00:00',NULL,NULL,NULL,NULL,NULL,NULL,'[82]',NULL,'1999-01-01 05:00:00'),(82,2,13,9,4,NULL,'not_yet_started',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[83]','[81]','1999-01-01 05:00:00'),(83,10,14,9,4,NULL,'not_yet_started',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[84, 85]','[82]','1999-01-01 05:00:00'),(84,11,15,9,4,NULL,'not_yet_started',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[86]','[83]','1999-01-01 05:00:00'),(85,9,15,9,4,NULL,'not_yet_started',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[86]','[83]','1999-01-01 05:00:00'),(86,10,16,9,4,NULL,'automatic',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[87]','[84, 85]','1999-01-01 05:00:00'),(87,12,17,9,4,NULL,'not_yet_started',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[88]','[86]','1999-01-01 05:00:00'),(88,10,18,9,4,NULL,'not_yet_started',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[89]','[87]','1999-01-01 05:00:00'),(89,13,19,9,4,NULL,'not_yet_started',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[90]','[88]','1999-01-01 05:00:00'),(90,10,20,9,4,NULL,'automatic',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[89]','1999-01-01 05:00:00'),(91,10,12,10,4,NULL,'started','1970-01-01 00:00:00','1970-01-03 00:00:00',NULL,NULL,NULL,NULL,NULL,NULL,'[92]',NULL,'1999-01-01 05:00:00'),(92,2,13,10,4,NULL,'not_yet_started',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[93]','[91]','1999-01-01 05:00:00'),(93,11,14,10,4,NULL,'not_yet_started',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[94, 95]','[92]','1999-01-01 05:00:00'),(94,12,15,10,4,NULL,'not_yet_started',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[96]','[93]','1999-01-01 05:00:00'),(95,10,15,10,4,NULL,'not_yet_started',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[96]','[93]','1999-01-01 05:00:00'),(96,11,16,10,4,NULL,'automatic',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[97]','[94, 95]','1999-01-01 05:00:00'),(97,13,17,10,4,NULL,'not_yet_started',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[98]','[96]','1999-01-01 05:00:00'),(98,11,18,10,4,NULL,'not_yet_started',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[99]','[97]','1999-01-01 05:00:00'),(99,14,19,10,4,NULL,'not_yet_started',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[100]','[98]','1999-01-01 05:00:00'),(100,11,20,10,4,NULL,'automatic',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[99]','1999-01-01 05:00:00'),(101,11,12,11,4,NULL,'started','1970-01-01 00:00:00','1970-01-03 00:00:00',NULL,NULL,NULL,NULL,NULL,NULL,'[102]',NULL,'1999-01-01 05:00:00'),(102,2,13,11,4,NULL,'not_yet_started',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[103]','[101]','1999-01-01 05:00:00'),(103,12,14,11,4,NULL,'not_yet_started',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[104, 105]','[102]','1999-01-01 05:00:00'),(104,13,15,11,4,NULL,'not_yet_started',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[106]','[103]','1999-01-01 05:00:00'),(105,11,15,11,4,NULL,'not_yet_started',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[106]','[103]','1999-01-01 05:00:00'),(106,12,16,11,4,NULL,'automatic',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[107]','[104, 105]','1999-01-01 05:00:00'),(107,14,17,11,4,NULL,'not_yet_started',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[108]','[106]','1999-01-01 05:00:00'),(108,12,18,11,4,NULL,'not_yet_started',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[109]','[107]','1999-01-01 05:00:00'),(109,15,19,11,4,NULL,'not_yet_started',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[110]','[108]','1999-01-01 05:00:00'),(110,12,20,11,4,NULL,'automatic',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[109]','1999-01-01 05:00:00'),(111,12,12,12,4,NULL,'started','1970-01-01 00:00:00','1970-01-03 00:00:00',NULL,NULL,NULL,NULL,NULL,NULL,'[112]',NULL,'1999-01-01 05:00:00'),(112,2,13,12,4,NULL,'not_yet_started',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[113]','[111]','1999-01-01 05:00:00'),(113,13,14,12,4,NULL,'not_yet_started',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[114, 115]','[112]','1999-01-01 05:00:00'),(114,14,15,12,4,NULL,'not_yet_started',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[116]','[113]','1999-01-01 05:00:00'),(115,12,15,12,4,NULL,'not_yet_started',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[116]','[113]','1999-01-01 05:00:00'),(116,13,16,12,4,NULL,'automatic',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[117]','[114, 115]','1999-01-01 05:00:00'),(117,15,17,12,4,NULL,'not_yet_started',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[118]','[116]','1999-01-01 05:00:00'),(118,13,18,12,4,NULL,'not_yet_started',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[119]','[117]','1999-01-01 05:00:00'),(119,16,19,12,4,NULL,'not_yet_started',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[120]','[118]','1999-01-01 05:00:00'),(120,13,20,12,4,NULL,'automatic',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[119]','1999-01-01 05:00:00'),(121,13,12,13,4,NULL,'started','1970-01-01 00:00:00','1970-01-03 00:00:00',NULL,NULL,NULL,NULL,NULL,NULL,'[122]',NULL,'1999-01-01 05:00:00'),(122,2,13,13,4,NULL,'not_yet_started',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[123]','[121]','1999-01-01 05:00:00'),(123,14,14,13,4,NULL,'not_yet_started',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[124, 125]','[122]','1999-01-01 05:00:00'),(124,15,15,13,4,NULL,'not_yet_started',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[126]','[123]','1999-01-01 05:00:00'),(125,13,15,13,4,NULL,'not_yet_started',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[126]','[123]','1999-01-01 05:00:00'),(126,14,16,13,4,NULL,'automatic',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[127]','[124, 125]','1999-01-01 05:00:00'),(127,16,17,13,4,NULL,'not_yet_started',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[128]','[126]','1999-01-01 05:00:00'),(128,14,18,13,4,NULL,'not_yet_started',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[129]','[127]','1999-01-01 05:00:00'),(129,17,19,13,4,NULL,'not_yet_started',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[130]','[128]','1999-01-01 05:00:00'),(130,14,20,13,4,NULL,'automatic',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[129]','1999-01-01 05:00:00'),(131,14,12,14,4,NULL,'started','1970-01-01 00:00:00','1970-01-03 00:00:00',NULL,NULL,NULL,NULL,NULL,NULL,'[132]',NULL,'1999-01-01 05:00:00'),(132,2,13,14,4,NULL,'not_yet_started',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[133]','[131]','1999-01-01 05:00:00'),(133,15,14,14,4,NULL,'not_yet_started',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[134, 135]','[132]','1999-01-01 05:00:00'),(134,16,15,14,4,NULL,'not_yet_started',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[136]','[133]','1999-01-01 05:00:00'),(135,14,15,14,4,NULL,'not_yet_started',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[136]','[133]','1999-01-01 05:00:00'),(136,15,16,14,4,NULL,'automatic',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[137]','[134, 135]','1999-01-01 05:00:00'),(137,17,17,14,4,NULL,'not_yet_started',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[138]','[136]','1999-01-01 05:00:00'),(138,15,18,14,4,NULL,'not_yet_started',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[139]','[137]','1999-01-01 05:00:00'),(139,18,19,14,4,NULL,'not_yet_started',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[140]','[138]','1999-01-01 05:00:00'),(140,15,20,14,4,NULL,'automatic',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[139]','1999-01-01 05:00:00'),(141,15,12,15,4,NULL,'started','1970-01-01 00:00:00','1970-01-03 00:00:00',NULL,NULL,NULL,NULL,NULL,NULL,'[142]',NULL,'1999-01-01 05:00:00'),(142,2,13,15,4,NULL,'not_yet_started',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[143]','[141]','1999-01-01 05:00:00'),(143,16,14,15,4,NULL,'not_yet_started',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[144, 145]','[142]','1999-01-01 05:00:00'),(144,17,15,15,4,NULL,'not_yet_started',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[146]','[143]','1999-01-01 05:00:00'),(145,15,15,15,4,NULL,'not_yet_started',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[146]','[143]','1999-01-01 05:00:00'),(146,16,16,15,4,NULL,'automatic',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[147]','[144, 145]','1999-01-01 05:00:00'),(147,18,17,15,4,NULL,'not_yet_started',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[148]','[146]','1999-01-01 05:00:00'),(148,16,18,15,4,NULL,'not_yet_started',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[149]','[147]','1999-01-01 05:00:00'),(149,19,19,15,4,NULL,'not_yet_started',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[150]','[148]','1999-01-01 05:00:00'),(150,16,20,15,4,NULL,'automatic',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[149]','1999-01-01 05:00:00'),(151,16,12,16,4,NULL,'started','1970-01-01 00:00:00','1970-01-03 00:00:00',NULL,NULL,NULL,NULL,NULL,NULL,'[152]',NULL,'1999-01-01 05:00:00'),(152,2,13,16,4,NULL,'not_yet_started',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[153]','[151]','1999-01-01 05:00:00'),(153,17,14,16,4,NULL,'not_yet_started',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[154, 155]','[152]','1999-01-01 05:00:00'),(154,18,15,16,4,NULL,'not_yet_started',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[156]','[153]','1999-01-01 05:00:00'),(155,16,15,16,4,NULL,'not_yet_started',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[156]','[153]','1999-01-01 05:00:00'),(156,17,16,16,4,NULL,'automatic',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[157]','[154, 155]','1999-01-01 05:00:00'),(157,19,17,16,4,NULL,'not_yet_started',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[158]','[156]','1999-01-01 05:00:00'),(158,17,18,16,4,NULL,'not_yet_started',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[159]','[157]','1999-01-01 05:00:00'),(159,1,19,16,4,NULL,'not_yet_started',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[160]','[158]','1999-01-01 05:00:00'),(160,17,20,16,4,NULL,'automatic',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[159]','1999-01-01 05:00:00'),(161,17,12,17,4,NULL,'started','1970-01-01 00:00:00','1970-01-03 00:00:00',NULL,NULL,NULL,NULL,NULL,NULL,'[162]',NULL,'1999-01-01 05:00:00'),(162,2,13,17,4,NULL,'not_yet_started',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[163]','[161]','1999-01-01 05:00:00'),(163,18,14,17,4,NULL,'not_yet_started',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[164, 165]','[162]','1999-01-01 05:00:00'),(164,19,15,17,4,NULL,'not_yet_started',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[166]','[163]','1999-01-01 05:00:00'),(165,17,15,17,4,NULL,'not_yet_started',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[166]','[163]','1999-01-01 05:00:00'),(166,18,16,17,4,NULL,'automatic',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[167]','[164, 165]','1999-01-01 05:00:00'),(167,1,17,17,4,NULL,'not_yet_started',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[168]','[166]','1999-01-01 05:00:00'),(168,18,18,17,4,NULL,'not_yet_started',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[169]','[167]','1999-01-01 05:00:00'),(169,3,19,17,4,NULL,'not_yet_started',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[170]','[168]','1999-01-01 05:00:00'),(170,18,20,17,4,NULL,'automatic',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[169]','1999-01-01 05:00:00'),(171,18,12,18,4,NULL,'started','1970-01-01 00:00:00','1970-01-03 00:00:00',NULL,NULL,NULL,NULL,NULL,NULL,'[172]',NULL,'1999-01-01 05:00:00'),(172,2,13,18,4,NULL,'not_yet_started',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[173]','[171]','1999-01-01 05:00:00'),(173,19,14,18,4,NULL,'not_yet_started',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[174, 175]','[172]','1999-01-01 05:00:00'),(174,1,15,18,4,NULL,'not_yet_started',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[176]','[173]','1999-01-01 05:00:00'),(175,18,15,18,4,NULL,'not_yet_started',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[176]','[173]','1999-01-01 05:00:00'),(176,19,16,18,4,NULL,'automatic',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[177]','[174, 175]','1999-01-01 05:00:00'),(177,3,17,18,4,NULL,'not_yet_started',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[178]','[176]','1999-01-01 05:00:00'),(178,19,18,18,4,NULL,'not_yet_started',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[179]','[177]','1999-01-01 05:00:00'),(179,4,19,18,4,NULL,'not_yet_started',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[180]','[178]','1999-01-01 05:00:00'),(180,19,20,18,4,NULL,'automatic',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[179]','1999-01-01 05:00:00'),(181,19,12,19,4,NULL,'started','1970-01-01 00:00:00','1970-01-03 00:00:00',NULL,NULL,NULL,NULL,NULL,NULL,'[182]',NULL,'1999-01-01 05:00:00'),(182,2,13,19,4,NULL,'not_yet_started',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[183]','[181]','1999-01-01 05:00:00'),(183,1,14,19,4,NULL,'not_yet_started',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[184, 185]','[182]','1999-01-01 05:00:00'),(184,3,15,19,4,NULL,'not_yet_started',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[186]','[183]','1999-01-01 05:00:00'),(185,19,15,19,4,NULL,'not_yet_started',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[186]','[183]','1999-01-01 05:00:00'),(186,1,16,19,4,NULL,'automatic',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[187]','[184, 185]','1999-01-01 05:00:00'),(187,4,17,19,4,NULL,'not_yet_started',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[188]','[186]','1999-01-01 05:00:00'),(188,1,18,19,4,NULL,'not_yet_started',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[189]','[187]','1999-01-01 05:00:00'),(189,69,19,19,4,NULL,'not_yet_started',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[190]','[188]','1999-01-01 05:00:00'),(190,1,20,19,4,NULL,'automatic',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[189]','1999-01-01 05:00:00');
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
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `WorkflowActivity`
--

LOCK TABLES `WorkflowActivity` WRITE;
/*!40000 ALTER TABLE `WorkflowActivity` DISABLE KEYS */;
INSERT INTO `WorkflowActivity` VALUES (1,1,'[1, 2, 3, 4, 5, 6, 7, 8, 9]','12Problem','essay','{\"1\": 100}',1,'',1,NULL,'[{\"id\": 0, \"isSubWorkflow\": 0}, {\"id\": 1, \"parent\": 0, \"isSubWorkflow\": 0}, {\"id\": -1, \"parent\": 0}, {\"id\": -1, \"parent\": 0}, {\"id\": -1, \"parent\": 0}, {\"id\": 2, \"parent\": 0, \"isSubWorkflow\": 0}, {\"id\": -1, \"parent\": 2}, {\"id\": 3, \"parent\": 2, \"isSubWorkflow\": 0}, {\"id\": -1, \"parent\": 3}, {\"id\": -1, \"parent\": 3}, {\"id\": 4, \"parent\": 3, \"isSubWorkflow\": 0}, {\"id\": -1, \"parent\": 4}, {\"id\": -1, \"parent\": 4}, {\"id\": 5, \"parent\": 4, \"isSubWorkflow\": 0}, {\"id\": -1, \"parent\": 5}, {\"id\": -1, \"parent\": 5}, {\"id\": 6, \"parent\": 5, \"isSubWorkflow\": 0}, {\"id\": -1, \"parent\": 6}, {\"id\": -1, \"parent\": 6}, {\"id\": 7, \"parent\": 6, \"isSubWorkflow\": 0}]',NULL),(2,1,'[10, 11]','Problem','essay','{}',1,'',1,NULL,'[{\"id\": 0, \"isSubWorkflow\": 0}]',NULL),(3,2,'[12, 13, 14, 15, 16, 17, 18, 19, 20]','Problem','','{\"12\": 100}',1,'',1,NULL,'[{\"id\": 0, \"isSubWorkflow\": 0}, {\"id\": 1, \"parent\": 0, \"isSubWorkflow\": 0}, {\"id\": -1, \"parent\": 0}, {\"id\": -1, \"parent\": 0}, {\"id\": -1, \"parent\": 0}, {\"id\": 2, \"parent\": 0, \"isSubWorkflow\": 0}, {\"id\": -1, \"parent\": 2}, {\"id\": 3, \"parent\": 2, \"isSubWorkflow\": 0}, {\"id\": -1, \"parent\": 3}, {\"id\": -1, \"parent\": 3}, {\"id\": 4, \"parent\": 3, \"isSubWorkflow\": 0}, {\"id\": -1, \"parent\": 4}, {\"id\": -1, \"parent\": 4}, {\"id\": 5, \"parent\": 4, \"isSubWorkflow\": 0}, {\"id\": -1, \"parent\": 5}, {\"id\": -1, \"parent\": 5}, {\"id\": 6, \"parent\": 5, \"isSubWorkflow\": 0}, {\"id\": -1, \"parent\": 6}, {\"id\": -1, \"parent\": 6}, {\"id\": 7, \"parent\": 6, \"isSubWorkflow\": 0}]',NULL);
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
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `WorkflowInstance`
--

LOCK TABLES `WorkflowInstance` WRITE;
/*!40000 ALTER TABLE `WorkflowInstance` DISABLE KEYS */;
INSERT INTO `WorkflowInstance` VALUES (1,3,4,'1970-01-01 00:00:00',NULL,'[[1], [2], [3], [4, 5], [6], [7], [8], [9], [10]]',NULL),(2,3,4,'1970-01-01 00:00:00',NULL,'[[11], [12], [13], [14, 15], [16], [17], [18], [19], [20]]',NULL),(3,3,4,'1970-01-01 00:00:00',NULL,'[[21], [22], [23], [24, 25], [26], [27], [28], [29], [30]]',NULL),(4,3,4,'1970-01-01 00:00:00',NULL,'[[31], [32], [33], [34, 35], [36], [37], [38], [39], [40]]',NULL),(5,3,4,'1970-01-01 00:00:00',NULL,'[[41], [42], [43], [44, 45], [46], [47], [48], [49], [50]]',NULL),(6,3,4,'1970-01-01 00:00:00',NULL,'[[51], [52], [53], [54, 55], [56], [57], [58], [59], [60]]',NULL),(7,3,4,'1970-01-01 00:00:00',NULL,'[[61], [62], [63], [64, 65], [66], [67], [68], [69], [70]]',NULL),(8,3,4,'1970-01-01 00:00:00',NULL,'[[71], [72], [73], [74, 75], [76], [77], [78], [79], [80]]',NULL),(9,3,4,'1970-01-01 00:00:00',NULL,'[[81], [82], [83], [84, 85], [86], [87], [88], [89], [90]]',NULL),(10,3,4,'1970-01-01 00:00:00',NULL,'[[91], [92], [93], [94, 95], [96], [97], [98], [99], [100]]',NULL),(11,3,4,'1970-01-01 00:00:00',NULL,'[[101], [102], [103], [104, 105], [106], [107], [108], [109], [110]]',NULL),(12,3,4,'1970-01-01 00:00:00',NULL,'[[111], [112], [113], [114, 115], [116], [117], [118], [119], [120]]',NULL),(13,3,4,'1970-01-01 00:00:00',NULL,'[[121], [122], [123], [124, 125], [126], [127], [128], [129], [130]]',NULL),(14,3,4,'1970-01-01 00:00:00',NULL,'[[131], [132], [133], [134, 135], [136], [137], [138], [139], [140]]',NULL),(15,3,4,'1970-01-01 00:00:00',NULL,'[[141], [142], [143], [144, 145], [146], [147], [148], [149], [150]]',NULL),(16,3,4,'1970-01-01 00:00:00',NULL,'[[151], [152], [153], [154, 155], [156], [157], [158], [159], [160]]',NULL),(17,3,4,'1970-01-01 00:00:00',NULL,'[[161], [162], [163], [164, 165], [166], [167], [168], [169], [170]]',NULL),(18,3,4,'1970-01-01 00:00:00',NULL,'[[171], [172], [173], [174, 175], [176], [177], [178], [179], [180]]',NULL),(19,3,4,'1970-01-01 00:00:00',NULL,'[[181], [182], [183], [184, 185], [186], [187], [188], [189], [190]]',NULL);
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

-- Dump completed on 2017-02-10 12:48:53
