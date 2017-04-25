CREATE DATABASE  IF NOT EXISTS `class/pla` /*!40100 DEFAULT CHARACTER SET utf8 */;
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
-- Table structure for table `assignment`
--

DROP TABLE IF EXISTS `assignment`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `assignment` (
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `assignmentgrade`
--

DROP TABLE IF EXISTS `assignmentgrade`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `assignmentgrade` (
  `AssignmentGradeID` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `AssignmentInstanceID` int(10) unsigned NOT NULL,
  `SectionUserID` int(10) unsigned NOT NULL,
  `Grade` float unsigned NOT NULL,
  `Comments` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`AssignmentGradeID`),
  UNIQUE KEY `AssignmentGradeID` (`AssignmentGradeID`),
  UNIQUE KEY `AssignmentGrade_AssignmentGradeID_unique` (`AssignmentGradeID`),
  UNIQUE KEY `ai_sectionUserId_unq_idx` (`AssignmentInstanceID`,`SectionUserID`),
  KEY `SectionUserID` (`SectionUserID`),
  CONSTRAINT `assignmentgrade_ibfk_1` FOREIGN KEY (`AssignmentInstanceID`) REFERENCES `assignmentinstance` (`AssignmentInstanceID`) ON DELETE NO ACTION ON UPDATE CASCADE,
  CONSTRAINT `assignmentgrade_ibfk_2` FOREIGN KEY (`SectionUserID`) REFERENCES `sectionuser` (`SectionUserID`) ON DELETE NO ACTION ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `assignmentinstance`
--

DROP TABLE IF EXISTS `assignmentinstance`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `assignmentinstance` (
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
  CONSTRAINT `assignmentinstance_ibfk_1` FOREIGN KEY (`AssignmentID`) REFERENCES `assignment` (`AssignmentID`) ON DELETE NO ACTION ON UPDATE CASCADE,
  CONSTRAINT `assignmentinstance_ibfk_2` FOREIGN KEY (`SectionID`) REFERENCES `section` (`SectionID`) ON DELETE NO ACTION ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `course`
--

DROP TABLE IF EXISTS `course`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `course` (
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
  CONSTRAINT `course_ibfk_1` FOREIGN KEY (`CreatorID`) REFERENCES `user` (`UserID`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `emailnotification`
--

DROP TABLE IF EXISTS `emailnotification`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `emailnotification` (
  `EmailNotificationID` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `TaskInstanceID` int(10) unsigned DEFAULT NULL,
  PRIMARY KEY (`EmailNotificationID`),
  UNIQUE KEY `EmailNotificationID` (`EmailNotificationID`),
  UNIQUE KEY `EmailNotification_EmailNotificationID_unique` (`EmailNotificationID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `file`
--

DROP TABLE IF EXISTS `file`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `file` (
  `FileID` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `UserID` int(10) unsigned NOT NULL,
  `Info` json DEFAULT NULL,
  `LastUpdated` datetime DEFAULT NULL,
  PRIMARY KEY (`FileID`),
  KEY `UserID` (`UserID`),
  CONSTRAINT `file_ibfk_1` FOREIGN KEY (`UserID`) REFERENCES `user` (`UserID`) ON DELETE NO ACTION ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=232 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `filereference`
--

DROP TABLE IF EXISTS `filereference`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `filereference` (
  `FileID` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `UserID` int(10) unsigned NOT NULL,
  `Info` json DEFAULT NULL,
  `LastUpdated` datetime DEFAULT NULL,
  PRIMARY KEY (`FileID`),
  UNIQUE KEY `FileID` (`FileID`),
  UNIQUE KEY `FileReference_FileID_unique` (`FileID`),
  KEY `UserID` (`UserID`),
  CONSTRAINT `filereference_ibfk_1` FOREIGN KEY (`UserID`) REFERENCES `user` (`UserID`) ON DELETE NO ACTION ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `groups`
--

DROP TABLE IF EXISTS `groups`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `groups` (
  `GroupID` int(10) unsigned NOT NULL,
  `SectionID` int(10) unsigned NOT NULL,
  `Name` varchar(30) DEFAULT NULL,
  `Leader` int(10) unsigned DEFAULT NULL,
  `List` blob,
  PRIMARY KEY (`GroupID`),
  UNIQUE KEY `GroupID` (`GroupID`),
  UNIQUE KEY `Groups_GroupID_unique` (`GroupID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `groupuser`
--

DROP TABLE IF EXISTS `groupuser`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `groupuser` (
  `GroupID` int(10) unsigned NOT NULL,
  `UserID` int(10) unsigned NOT NULL,
  `Role` int(11) NOT NULL,
  `Status` varchar(255) NOT NULL,
  PRIMARY KEY (`GroupID`),
  KEY `UserID` (`UserID`),
  CONSTRAINT `groupuser_ibfk_1` FOREIGN KEY (`UserID`) REFERENCES `user` (`UserID`) ON DELETE NO ACTION ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `organization`
--

DROP TABLE IF EXISTS `organization`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `organization` (
  `OrganizationID` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `Name` varchar(40) DEFAULT NULL,
  `UserID` int(11) DEFAULT NULL,
  PRIMARY KEY (`OrganizationID`),
  UNIQUE KEY `OrganizationID` (`OrganizationID`),
  UNIQUE KEY `Organization_OrganizationID_unique` (`OrganizationID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `partialassignments`
--

DROP TABLE IF EXISTS `partialassignments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `partialassignments` (
  `PartialAssignmentID` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `UserID` int(10) unsigned NOT NULL,
  `CourseID` int(10) unsigned NOT NULL,
  `PartialAssignmentName` varchar(255) DEFAULT NULL,
  `Data` json NOT NULL,
  PRIMARY KEY (`PartialAssignmentID`),
  UNIQUE KEY `PartialAssignmentID` (`PartialAssignmentID`),
  UNIQUE KEY `PartialAssignments_PartialAssignmentID_unique` (`PartialAssignmentID`),
  KEY `UserID` (`UserID`),
  KEY `CourseID` (`CourseID`),
  CONSTRAINT `partialassignments_ibfk_1` FOREIGN KEY (`UserID`) REFERENCES `user` (`UserID`) ON DELETE NO ACTION ON UPDATE CASCADE,
  CONSTRAINT `partialassignments_ibfk_2` FOREIGN KEY (`CourseID`) REFERENCES `course` (`CourseID`) ON DELETE NO ACTION ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `resetpasswordrequest`
--

DROP TABLE IF EXISTS `resetpasswordrequest`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `resetpasswordrequest` (
  `UserID` int(10) unsigned NOT NULL,
  `RequestHash` varchar(255) NOT NULL,
  PRIMARY KEY (`UserID`,`RequestHash`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `section`
--

DROP TABLE IF EXISTS `section`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `section` (
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
  CONSTRAINT `section_ibfk_1` FOREIGN KEY (`SemesterID`) REFERENCES `semester` (`SemesterID`) ON DELETE NO ACTION ON UPDATE CASCADE,
  CONSTRAINT `section_ibfk_2` FOREIGN KEY (`CourseID`) REFERENCES `course` (`CourseID`) ON DELETE NO ACTION ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `sectionuser`
--

DROP TABLE IF EXISTS `sectionuser`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `sectionuser` (
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
  CONSTRAINT `sectionuser_ibfk_1` FOREIGN KEY (`SectionID`) REFERENCES `section` (`SectionID`) ON DELETE NO ACTION ON UPDATE CASCADE,
  CONSTRAINT `sectionuser_ibfk_2` FOREIGN KEY (`UserID`) REFERENCES `user` (`UserID`) ON DELETE NO ACTION ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `semester`
--

DROP TABLE IF EXISTS `semester`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `semester` (
  `SemesterID` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `OrganizationID` int(10) unsigned NOT NULL,
  `Name` varchar(25) DEFAULT NULL,
  `StartDate` datetime DEFAULT NULL,
  `EndDate` datetime DEFAULT NULL,
  PRIMARY KEY (`SemesterID`),
  UNIQUE KEY `SemesterID` (`SemesterID`),
  UNIQUE KEY `Semester_SemesterID_unique` (`SemesterID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `taskactivity`
--

DROP TABLE IF EXISTS `taskactivity`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `taskactivity` (
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
  `VersionEvaluation` varchar(255) DEFAULT NULL,
  `SeeSibblings` tinyint(1) DEFAULT NULL,
  `SeeSameActivity` tinyint(1) DEFAULT NULL,
  `AssignmentInstanceID` int(10) unsigned DEFAULT NULL,
  PRIMARY KEY (`TaskActivityID`),
  UNIQUE KEY `TaskActivityID` (`TaskActivityID`),
  UNIQUE KEY `TaskActivity_TaskActivityID_unique` (`TaskActivityID`),
  KEY `WorkflowActivityID` (`WorkflowActivityID`),
  KEY `AssignmentID` (`AssignmentID`),
  KEY `AssignmentInstanceID` (`AssignmentInstanceID`),
  CONSTRAINT `taskactivity_ibfk_1` FOREIGN KEY (`WorkflowActivityID`) REFERENCES `workflowactivity` (`WorkflowActivityID`) ON DELETE NO ACTION ON UPDATE CASCADE,
  CONSTRAINT `taskactivity_ibfk_2` FOREIGN KEY (`AssignmentID`) REFERENCES `assignment` (`AssignmentID`) ON DELETE NO ACTION ON UPDATE CASCADE,
  CONSTRAINT `taskactivity_ibfk_3` FOREIGN KEY (`AssignmentInstanceID`) REFERENCES `assignmentinstance` (`AssignmentInstanceID`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `taskgrade`
--

DROP TABLE IF EXISTS `taskgrade`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `taskgrade` (
  `TaskGradeID` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `TaskInstanceID` int(10) unsigned NOT NULL,
  `SectionUserID` int(10) unsigned NOT NULL,
  `WorkflowActivityID` int(10) unsigned NOT NULL,
  `Grade` float unsigned NOT NULL,
  `Comments` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`TaskGradeID`),
  UNIQUE KEY `TaskGradeID` (`TaskGradeID`),
  UNIQUE KEY `TaskGrade_TaskGradeID_unique` (`TaskGradeID`),
  UNIQUE KEY `ti_sectionUserId_unq_idx` (`TaskInstanceID`,`SectionUserID`),
  KEY `SectionUserID` (`SectionUserID`),
  KEY `WorkflowActivityID` (`WorkflowActivityID`),
  CONSTRAINT `taskgrade_ibfk_1` FOREIGN KEY (`TaskInstanceID`) REFERENCES `taskinstance` (`TaskInstanceID`) ON DELETE NO ACTION ON UPDATE CASCADE,
  CONSTRAINT `taskgrade_ibfk_2` FOREIGN KEY (`SectionUserID`) REFERENCES `sectionuser` (`SectionUserID`) ON DELETE NO ACTION ON UPDATE CASCADE,
  CONSTRAINT `taskgrade_ibfk_3` FOREIGN KEY (`WorkflowActivityID`) REFERENCES `workflowactivity` (`WorkflowActivityID`) ON DELETE NO ACTION ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `taskinstance`
--

DROP TABLE IF EXISTS `taskinstance`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `taskinstance` (
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
  `IsSubworkflow` int(11) DEFAULT NULL,
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
  CONSTRAINT `taskinstance_ibfk_1` FOREIGN KEY (`UserID`) REFERENCES `user` (`UserID`) ON DELETE NO ACTION ON UPDATE CASCADE,
  CONSTRAINT `taskinstance_ibfk_2` FOREIGN KEY (`TaskActivityID`) REFERENCES `taskactivity` (`TaskActivityID`) ON DELETE NO ACTION ON UPDATE CASCADE,
  CONSTRAINT `taskinstance_ibfk_3` FOREIGN KEY (`WorkflowInstanceID`) REFERENCES `workflowinstance` (`WorkflowInstanceID`) ON DELETE NO ACTION ON UPDATE CASCADE,
  CONSTRAINT `taskinstance_ibfk_4` FOREIGN KEY (`AssignmentInstanceID`) REFERENCES `assignmentinstance` (`AssignmentInstanceID`) ON DELETE NO ACTION ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `tasksimplegrade`
--

DROP TABLE IF EXISTS `tasksimplegrade`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tasksimplegrade` (
  `TaskSimpleGradeID` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `TaskInstanceID` int(10) unsigned NOT NULL,
  `SectionUserID` int(10) unsigned NOT NULL,
  `WorkflowActivityID` int(10) unsigned NOT NULL,
  `Grade` float unsigned NOT NULL,
  `Comments` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`TaskSimpleGradeID`),
  UNIQUE KEY `TaskSimpleGradeID` (`TaskSimpleGradeID`),
  UNIQUE KEY `TaskSimpleGrade_TaskSimpleGradeID_unique` (`TaskSimpleGradeID`),
  UNIQUE KEY `ti_sectionUserId_unq_idx` (`TaskInstanceID`,`SectionUserID`),
  KEY `SectionUserID` (`SectionUserID`),
  KEY `WorkflowActivityID` (`WorkflowActivityID`),
  CONSTRAINT `tasksimplegrade_ibfk_1` FOREIGN KEY (`TaskInstanceID`) REFERENCES `taskinstance` (`TaskInstanceID`) ON DELETE NO ACTION ON UPDATE CASCADE,
  CONSTRAINT `tasksimplegrade_ibfk_2` FOREIGN KEY (`SectionUserID`) REFERENCES `sectionuser` (`SectionUserID`) ON DELETE NO ACTION ON UPDATE CASCADE,
  CONSTRAINT `tasksimplegrade_ibfk_3` FOREIGN KEY (`WorkflowActivityID`) REFERENCES `workflowactivity` (`WorkflowActivityID`) ON DELETE NO ACTION ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `user`
--

DROP TABLE IF EXISTS `user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `user` (
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
  `ProfilePicture` json DEFAULT NULL,
  PRIMARY KEY (`UserID`),
  UNIQUE KEY `UserID` (`UserID`),
  UNIQUE KEY `User_UserID_unique` (`UserID`),
  KEY `UserContactID` (`UserContactID`),
  CONSTRAINT `user_ibfk_1` FOREIGN KEY (`UserID`) REFERENCES `userlogin` (`UserID`) ON DELETE NO ACTION ON UPDATE CASCADE,
  CONSTRAINT `user_ibfk_2` FOREIGN KEY (`UserContactID`) REFERENCES `usercontact` (`UserContactID`) ON DELETE NO ACTION ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `usercontact`
--

DROP TABLE IF EXISTS `usercontact`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `usercontact` (
  `UserContactID` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `Email` varchar(70) NOT NULL,
  `Phone` varchar(15) NOT NULL,
  PRIMARY KEY (`UserContactID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `userlogin`
--

DROP TABLE IF EXISTS `userlogin`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `userlogin` (
  `UserID` int(10) unsigned NOT NULL,
  `Email` varchar(70) NOT NULL,
  `Password` varchar(255) NOT NULL,
  `Status` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`UserID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `workflowactivity`
--

DROP TABLE IF EXISTS `workflowactivity`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `workflowactivity` (
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
  CONSTRAINT `workflowactivity_ibfk_1` FOREIGN KEY (`AssignmentID`) REFERENCES `assignment` (`AssignmentID`) ON DELETE NO ACTION ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `workflowgrade`
--

DROP TABLE IF EXISTS `workflowgrade`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `workflowgrade` (
  `WorkflowGradeID` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `WorkflowActivityID` int(10) unsigned NOT NULL,
  `SectionUserID` int(10) unsigned NOT NULL,
  `AssignmentInstanceID` int(10) unsigned NOT NULL,
  `Grade` float unsigned NOT NULL,
  `Comments` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`WorkflowGradeID`),
  UNIQUE KEY `WorkflowGradeID` (`WorkflowGradeID`),
  UNIQUE KEY `WorkflowGrade_WorkflowGradeID_unique` (`WorkflowGradeID`),
  UNIQUE KEY `wf_sectionUserId_unq_idx` (`WorkflowActivityID`,`SectionUserID`),
  KEY `SectionUserID` (`SectionUserID`),
  KEY `AssignmentInstanceID` (`AssignmentInstanceID`),
  CONSTRAINT `workflowgrade_ibfk_1` FOREIGN KEY (`WorkflowActivityID`) REFERENCES `workflowactivity` (`WorkflowActivityID`) ON DELETE NO ACTION ON UPDATE CASCADE,
  CONSTRAINT `workflowgrade_ibfk_2` FOREIGN KEY (`SectionUserID`) REFERENCES `sectionuser` (`SectionUserID`) ON DELETE NO ACTION ON UPDATE CASCADE,
  CONSTRAINT `workflowgrade_ibfk_3` FOREIGN KEY (`AssignmentInstanceID`) REFERENCES `assignmentinstance` (`AssignmentInstanceID`) ON DELETE NO ACTION ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `workflowinstance`
--

DROP TABLE IF EXISTS `workflowinstance`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `workflowinstance` (
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
  CONSTRAINT `workflowinstance_ibfk_1` FOREIGN KEY (`WorkflowActivityID`) REFERENCES `workflowactivity` (`WorkflowActivityID`) ON DELETE NO ACTION ON UPDATE CASCADE,
  CONSTRAINT `workflowinstance_ibfk_2` FOREIGN KEY (`AssignmentInstanceID`) REFERENCES `assignmentinstance` (`AssignmentInstanceID`) ON DELETE NO ACTION ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2017-04-16 18:37:01
