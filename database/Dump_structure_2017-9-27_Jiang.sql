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
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `AssignmentGrade`
--

DROP TABLE IF EXISTS `AssignmentGrade`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `AssignmentGrade` (
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
  CONSTRAINT `assignmentgrade_ibfk_1` FOREIGN KEY (`AssignmentInstanceID`) REFERENCES `AssignmentInstance` (`AssignmentInstanceID`) ON DELETE NO ACTION ON UPDATE CASCADE,
  CONSTRAINT `assignmentgrade_ibfk_2` FOREIGN KEY (`SectionUserID`) REFERENCES `SectionUser` (`SectionUserID`) ON DELETE NO ACTION ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

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
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

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
  `Description` text,
  PRIMARY KEY (`CourseID`),
  UNIQUE KEY `CourseID` (`CourseID`),
  UNIQUE KEY `Course_CourseID_unique` (`CourseID`),
  KEY `CreatorID` (`CreatorID`),
  CONSTRAINT `course_ibfk_1` FOREIGN KEY (`CreatorID`) REFERENCES `User` (`UserID`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

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
-- Table structure for table `FileReference`
--

DROP TABLE IF EXISTS `FileReference`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `FileReference` (
  `FileID` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `UserID` int(10) unsigned NOT NULL,
  `Info` json DEFAULT NULL,
  `LastUpdated` datetime DEFAULT NULL,
  PRIMARY KEY (`FileID`),
  UNIQUE KEY `FileID` (`FileID`),
  UNIQUE KEY `FileReference_FileID_unique` (`FileID`),
  KEY `UserID` (`UserID`),
  CONSTRAINT `filereference_ibfk_1` FOREIGN KEY (`UserID`) REFERENCES `User` (`UserID`) ON DELETE NO ACTION ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

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
-- Table structure for table `Organization`
--

DROP TABLE IF EXISTS `Organization`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Organization` (
  `OrganizationID` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `Name` varchar(40) DEFAULT NULL,
  `Logo` json DEFAULT NULL,
  PRIMARY KEY (`OrganizationID`),
  UNIQUE KEY `OrganizationID` (`OrganizationID`),
  UNIQUE KEY `Organization_OrganizationID_unique` (`OrganizationID`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `PartialAssignments`
--

DROP TABLE IF EXISTS `PartialAssignments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `PartialAssignments` (
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
  CONSTRAINT `partialassignments_ibfk_1` FOREIGN KEY (`UserID`) REFERENCES `User` (`UserID`) ON DELETE NO ACTION ON UPDATE CASCADE,
  CONSTRAINT `partialassignments_ibfk_2` FOREIGN KEY (`CourseID`) REFERENCES `Course` (`CourseID`) ON DELETE NO ACTION ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

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
-- Table structure for table `Section`
--

DROP TABLE IF EXISTS `Section`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Section` (
  `SectionID` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `SemesterID` int(10) unsigned NOT NULL,
  `CourseID` int(10) unsigned NOT NULL,
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
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

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
  `Role` varchar(30) DEFAULT NULL,
  `Active` tinyint(4) DEFAULT NULL,
  `Volunteer` tinyint(4) DEFAULT NULL,
  PRIMARY KEY (`SectionUserID`),
  UNIQUE KEY `SectionUserID` (`SectionUserID`),
  UNIQUE KEY `SectionUser_SectionUserID_unique` (`SectionUserID`),
  KEY `SectionID` (`SectionID`),
  KEY `UserID` (`UserID`),
  CONSTRAINT `sectionuser_ibfk_1` FOREIGN KEY (`SectionID`) REFERENCES `Section` (`SectionID`) ON DELETE NO ACTION ON UPDATE CASCADE,
  CONSTRAINT `sectionuser_ibfk_2` FOREIGN KEY (`UserID`) REFERENCES `User` (`UserID`) ON DELETE NO ACTION ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

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
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

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
  `FileUpload` json DEFAULT NULL,
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
  `ViewAccessContraints` json DEFAULT NULL,
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
  CONSTRAINT `taskactivity_ibfk_1` FOREIGN KEY (`WorkflowActivityID`) REFERENCES `WorkflowActivity` (`WorkflowActivityID`) ON DELETE NO ACTION ON UPDATE CASCADE,
  CONSTRAINT `taskactivity_ibfk_2` FOREIGN KEY (`AssignmentID`) REFERENCES `Assignment` (`AssignmentID`) ON DELETE NO ACTION ON UPDATE CASCADE,
  CONSTRAINT `taskactivity_ibfk_3` FOREIGN KEY (`AssignmentInstanceID`) REFERENCES `AssignmentInstance` (`AssignmentInstanceID`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `TaskGrade`
--

DROP TABLE IF EXISTS `TaskGrade`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `TaskGrade` (
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
  CONSTRAINT `taskgrade_ibfk_1` FOREIGN KEY (`TaskInstanceID`) REFERENCES `TaskInstance` (`TaskInstanceID`) ON DELETE NO ACTION ON UPDATE CASCADE,
  CONSTRAINT `taskgrade_ibfk_2` FOREIGN KEY (`SectionUserID`) REFERENCES `SectionUser` (`SectionUserID`) ON DELETE NO ACTION ON UPDATE CASCADE,
  CONSTRAINT `taskgrade_ibfk_3` FOREIGN KEY (`WorkflowActivityID`) REFERENCES `WorkflowActivity` (`WorkflowActivityID`) ON DELETE NO ACTION ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

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
  `Status` varchar(255) DEFAULT NULL,
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
  CONSTRAINT `taskinstance_ibfk_1` FOREIGN KEY (`UserID`) REFERENCES `User` (`UserID`) ON DELETE NO ACTION ON UPDATE CASCADE,
  CONSTRAINT `taskinstance_ibfk_2` FOREIGN KEY (`TaskActivityID`) REFERENCES `TaskActivity` (`TaskActivityID`) ON DELETE NO ACTION ON UPDATE CASCADE,
  CONSTRAINT `taskinstance_ibfk_3` FOREIGN KEY (`WorkflowInstanceID`) REFERENCES `WorkflowInstance` (`WorkflowInstanceID`) ON DELETE NO ACTION ON UPDATE CASCADE,
  CONSTRAINT `taskinstance_ibfk_4` FOREIGN KEY (`AssignmentInstanceID`) REFERENCES `AssignmentInstance` (`AssignmentInstanceID`) ON DELETE NO ACTION ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `TaskSimpleGrade`
--

DROP TABLE IF EXISTS `TaskSimpleGrade`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `TaskSimpleGrade` (
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
  CONSTRAINT `tasksimplegrade_ibfk_1` FOREIGN KEY (`TaskInstanceID`) REFERENCES `TaskInstance` (`TaskInstanceID`) ON DELETE NO ACTION ON UPDATE CASCADE,
  CONSTRAINT `tasksimplegrade_ibfk_2` FOREIGN KEY (`SectionUserID`) REFERENCES `SectionUser` (`SectionUserID`) ON DELETE NO ACTION ON UPDATE CASCADE,
  CONSTRAINT `tasksimplegrade_ibfk_3` FOREIGN KEY (`WorkflowActivityID`) REFERENCES `WorkflowActivity` (`WorkflowActivityID`) ON DELETE NO ACTION ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `User`
--

DROP TABLE IF EXISTS `User`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `User` (
  `UserID` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `FirstName` varchar(40) DEFAULT NULL,
  `LastName` varchar(40) DEFAULT NULL,
  `OrganizationGroup` json DEFAULT NULL,
  `Admin` tinyint(1) DEFAULT NULL,
  `Test` tinyint(1) DEFAULT NULL,
  `ProfilePicture` json DEFAULT NULL,
  `Instructor` tinyint(4) DEFAULT NULL,
  PRIMARY KEY (`UserID`),
  UNIQUE KEY `UserID` (`UserID`),
  UNIQUE KEY `User_UserID_unique` (`UserID`),
  CONSTRAINT `user_ibfk_1` FOREIGN KEY (`UserID`) REFERENCES `UserLogin` (`UserID`) ON DELETE NO ACTION ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `UserContact`
--

DROP TABLE IF EXISTS `UserContact`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `UserContact` (
  `UserID` int(10) unsigned NOT NULL,
  `Email` varchar(70) NOT NULL,
  `Phone` varchar(15) NOT NULL,
  `FirstName` varchar(40) DEFAULT NULL,
  `LastName` varchar(40) DEFAULT NULL,
  `Alias` varchar(40) DEFAULT NULL,
  `ProfilePicture` json DEFAULT NULL,
  `Avatar` json DEFAULT NULL,
  PRIMARY KEY (`UserID`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

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
  `Pending` tinyint(4) DEFAULT NULL,
  `Attempts` int(10) unsigned DEFAULT NULL,
  `Timeout` date DEFAULT NULL,
  `Blocked` tinyint(4) DEFAULT NULL,
  PRIMARY KEY (`UserID`),
  UNIQUE KEY `Email` (`Email`),
  UNIQUE KEY `UserLogin_Email_unique` (`Email`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `VolunteerPool`
--

DROP TABLE IF EXISTS `VolunteerPool`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `VolunteerPool` (
  `VolunteerPoolID` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `UserID` int(10) unsigned NOT NULL,
  `SectionID` int(10) unsigned NOT NULL,
  `AssignmentInstanceID` int(10) unsigned DEFAULT NULL,
  `status` varchar(25) DEFAULT NULL,
  PRIMARY KEY (`VolunteerPoolID`),
  UNIQUE KEY `VolunteerPoolID` (`VolunteerPoolID`),
  UNIQUE KEY `VolunteerPool_VolunteerPoolID_unique` (`VolunteerPoolID`),
  UNIQUE KEY `uniqueVolunteer` (`UserID`,`SectionID`,`AssignmentInstanceID`),
  KEY `SectionID` (`SectionID`),
  KEY `AssignmentInstanceID` (`AssignmentInstanceID`),
  CONSTRAINT `VolunteerPool_ibfk_1` FOREIGN KEY (`UserID`) REFERENCES `User` (`UserID`) ON DELETE NO ACTION ON UPDATE CASCADE,
  CONSTRAINT `VolunteerPool_ibfk_2` FOREIGN KEY (`SectionID`) REFERENCES `Section` (`SectionID`) ON DELETE NO ACTION ON UPDATE CASCADE,
  CONSTRAINT `VolunteerPool_ibfk_3` FOREIGN KEY (`AssignmentInstanceID`) REFERENCES `AssignmentInstance` (`AssignmentInstanceID`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

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
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `WorkflowGrade`
--

DROP TABLE IF EXISTS `WorkflowGrade`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `WorkflowGrade` (
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
  CONSTRAINT `workflowgrade_ibfk_1` FOREIGN KEY (`WorkflowActivityID`) REFERENCES `WorkflowActivity` (`WorkflowActivityID`) ON DELETE NO ACTION ON UPDATE CASCADE,
  CONSTRAINT `workflowgrade_ibfk_2` FOREIGN KEY (`SectionUserID`) REFERENCES `SectionUser` (`SectionUserID`) ON DELETE NO ACTION ON UPDATE CASCADE,
  CONSTRAINT `workflowgrade_ibfk_3` FOREIGN KEY (`AssignmentInstanceID`) REFERENCES `AssignmentInstance` (`AssignmentInstanceID`) ON DELETE NO ACTION ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

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
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;


--
-- Table structure for table `Comments`
--

DROP TABLE IF EXISTS `Comments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Comments` (
  `CommentsID` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `UserID` int(10) unsigned NOT NULL,
  `TargetID` int(10) unsigned NOT NULL,
  `AssignmentInstanceID` int(10) unsigned DEFAULT NULL,
  `TaskInstanceID` int(10) unsigned DEFAULT NULL,
  `Type` varchar(255) DEFAULT NULL,
  `CommentsText` varchar(255) DEFAULT NULL,
  `Rating` int(10) unsigned DEFAULT NULL,
  `Flag` int(10) unsigned DEFAULT NULL,
  `Status` varchar(255) DEFAULT NULL,
  `Label` varchar(255) DEFAULT NULL,r
  `ReplyLevel` int(10) unsigned DEFAULT NULL,
  `Parents` int(10) unsigned DEFAULT NULL,
  `Delete` int(10) unsigned DEFAULT NULL,
  `Time` datetime DEFAULT NULL,
  `Complete` int(10) unsigned DEFAULT NULL,
  `Hide` int(10) unsigned DEFAULT NULL,
  `CommentTarget` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`CommentsID`),
  UNIQUE KEY `CommentsID` (`CommentsID`),
  UNIQUE KEY `Comments_CommentsID_unique` (`CommentsID`),
  KEY `UserID` (`UserID`),
  KEY `AssignmentInstanceID` (`AssignmentInstanceID`),
  CONSTRAINT `comments_ibfk_1` FOREIGN KEY (`UserID`) REFERENCES `User` (`UserID`) ON DELETE NO ACTION ON UPDATE CASCADE,
  CONSTRAINT `comments_ibfk_2` FOREIGN KEY (`AssignmentInstanceID`) REFERENCES `AssignmentInstance` (`AssignmentInstanceID`) ON DELETE NO ACTION ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;


--
-- Table structure for table `CommentsArchive`
--

DROP TABLE IF EXISTS `CommentsArchive`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `CommentsArchive` (
  `CommentsArchiveID` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `CommentsID` int(10) unsigned NOT NULL,
  `UserID` int(10) unsigned NOT NULL,  
  `TaskInstanceID` int(10) unsigned NOT NULL,
  `AssignmentInstanceID` int(10) unsigned NOT NULL,
  `Type` varchar(40) DEFAULT NULL,
  `CommentsText` varchar(255) DEFAULT NULL,  
  `Rating` int(10) DEFAULT NULL,
  `Flag` int(10) DEFAULT NULL,
  `Status` varchar(40) DEFAULT NULL,
  `Label` varchar(40) DEFAULT NULL,
  `ReplyLevel` int(10) DEFAULT NULL,
  `Parents` int(10) DEFAULT NULL,
  `Delete` int(10) DEFAULT NULL,
  `Hide` int(10) DEFAULT NULL,
  `Viewed` int(10) DEFAULT NULL,
  `Time` datetime DEFAULT NULL,
  `Complete` tinyint(1) DEFAULT NULL,
  
  PRIMARY KEY (`CommentsArchiveID`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;


--
-- Table structure for table `CommentsViewed`
--

DROP TABLE IF EXISTS `CommentsViewed`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `CommentsViewed` (
  `CommentsViewedID` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `CommentsID` int(10) unsigned NOT NULL,
  `UserID` int(10) unsigned NOT NULL,  
  `Time` datetime DEFAULT NULL,
  
  PRIMARY KEY (`CommentsViewedID`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;




--
-- Table structure for table `Contact`
--

DROP TABLE IF EXISTS `Contact`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Contact` (
  `UserID` int(10) unsigned NOT NULL,
  `Email` varchar(70) DEFAULT NULL,
  `FirstName` varchar(40) DEFAULT NULL,
  `LastName` varchar(40) DEFAULT NULL,
  `Global` tinyint(1) DEFAULT NULL,
  `OrganizationGroup` json DEFAULT NULL,
  PRIMARY KEY (`UserID`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;



--
-- Table structure for table `Notifications`
--

DROP TABLE IF EXISTS `Notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Notifications` (
  `NotificationsID` int(10) unsigned NOT NULL,
  `Flag` varchar(70) DEFAULT NULL,
  `UserID` varchar(40) DEFAULT NULL,
  `CommentsID` varchar(40) DEFAULT NULL,
  `VolunteerpoolID` varchar(40) DEFAULT NULL,
  `Dismiss` tinyint(1) DEFAULT NULL,
  PRIMARY KEY (`NotificationsID`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;


/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */
 

-- Dump completed on 2017-07-010 09:20:10
