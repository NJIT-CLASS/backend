CREATE DATABASE  IF NOT EXISTS `class/pla` /*!40100 DEFAULT CHARACTER SET latin1 */;
USE `class/pla`;
-- MySQL dump 10.13  Distrib 5.7.21, for Linux (x86_64)
--
-- Host: localhost    Database: class/pla
-- ------------------------------------------------------
-- Server version	5.7.21

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
  KEY `CourseID` (`CourseID`),
  CONSTRAINT `assignment_ibfk_1` FOREIGN KEY (`CourseID`) REFERENCES `course` (`CourseID`) ON DELETE NO ACTION ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=latin1;
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
  UNIQUE KEY `ai_sectionUserId_unq_idx` (`AssignmentInstanceID`,`SectionUserID`),
  KEY `SectionUserID` (`SectionUserID`),
  CONSTRAINT `assignmentgrade_ibfk_1` FOREIGN KEY (`AssignmentInstanceID`) REFERENCES `assignmentinstance` (`AssignmentInstanceID`) ON DELETE NO ACTION ON UPDATE CASCADE,
  CONSTRAINT `assignmentgrade_ibfk_2` FOREIGN KEY (`SectionUserID`) REFERENCES `sectionuser` (`SectionUserID`) ON DELETE NO ACTION ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=27 DEFAULT CHARSET=latin1;
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
  KEY `AssignmentID` (`AssignmentID`),
  KEY `SectionID` (`SectionID`),
  CONSTRAINT `assignmentinstance_ibfk_1` FOREIGN KEY (`AssignmentID`) REFERENCES `assignment` (`AssignmentID`) ON DELETE NO ACTION ON UPDATE CASCADE,
  CONSTRAINT `assignmentinstance_ibfk_2` FOREIGN KEY (`SectionID`) REFERENCES `section` (`SectionID`) ON DELETE NO ACTION ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `badge`
--

DROP TABLE IF EXISTS `badge`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `badge` (
  `BadgeID` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `CategoryID` int(10) unsigned NOT NULL,
  `Name` varchar(255) NOT NULL,
  `Description` text,
  `Logo` varchar(255) NOT NULL,
  PRIMARY KEY (`BadgeID`),
  UNIQUE KEY `BadgeID` (`BadgeID`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `badgecategory`
--

DROP TABLE IF EXISTS `badgecategory`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `badgecategory` (
  `BadgeCategoryID` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `CourseID` int(10) DEFAULT NULL,
  `SectionID` int(10) DEFAULT NULL,
  `SemesterID` int(10) DEFAULT NULL,
  `Name` varchar(100) NOT NULL,
  `Description` text NOT NULL,
  `Tier1Instances` int(10) DEFAULT NULL,
  `Tier2Instances` int(10) DEFAULT NULL,
  `Tier3Instances` int(10) DEFAULT NULL,
  PRIMARY KEY (`BadgeCategoryID`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `badgeinstance`
--

DROP TABLE IF EXISTS `badgeinstance`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `badgeinstance` (
  `BadgeInstanceID` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `BadgeID` int(10) unsigned NOT NULL,
  `CategoryInstanceID` int(10) unsigned NOT NULL,
  PRIMARY KEY (`BadgeInstanceID`),
  UNIQUE KEY `BadgeInstanceID` (`BadgeInstanceID`),
  KEY `BadgeID` (`BadgeID`),
  CONSTRAINT `badgeinstance_ibfk_1` FOREIGN KEY (`BadgeID`) REFERENCES `badge` (`BadgeID`) ON DELETE NO ACTION ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `badges`
--

DROP TABLE IF EXISTS `badges`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `badges` (
  `BadgeID` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `BadgeCategoryID` int(10) unsigned NOT NULL,
  `Name` varchar(100) COLLATE latin1_spanish_ci NOT NULL,
  `Description` text COLLATE latin1_spanish_ci,
  `logo` varchar(200) COLLATE latin1_spanish_ci DEFAULT NULL,
  PRIMARY KEY (`BadgeID`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=latin1 COLLATE=latin1_spanish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `category`
--

DROP TABLE IF EXISTS `category`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `category` (
  `CategoryID` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `Type` varchar(255) DEFAULT NULL,
  `Name` varchar(255) DEFAULT NULL,
  `Description` text,
  `Tier1Instances` int(10) unsigned NOT NULL,
  `Tier2Instances` int(10) unsigned NOT NULL,
  `Tier3Instances` int(10) unsigned NOT NULL,
  `InstanceValue` int(10) unsigned NOT NULL,
  PRIMARY KEY (`CategoryID`),
  UNIQUE KEY `CategoryID` (`CategoryID`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `categoryinstance`
--

DROP TABLE IF EXISTS `categoryinstance`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `categoryinstance` (
  `CategoryInstanceID` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `CategoryID` int(10) unsigned NOT NULL,
  `SemesterID` int(10) unsigned NOT NULL,
  `SectionID` int(10) unsigned NOT NULL,
  `CourseID` int(10) unsigned NOT NULL,
  `Tier1Instances` int(10) unsigned NOT NULL,
  `Tier2Instances` int(10) unsigned NOT NULL,
  `Tier3Instances` int(10) unsigned NOT NULL,
  `InstanceValue` int(10) unsigned NOT NULL,
  PRIMARY KEY (`CategoryInstanceID`),
  UNIQUE KEY `CategoryInstanceID` (`CategoryInstanceID`),
  CONSTRAINT `categoryinstance_ibfk_1` FOREIGN KEY (`CategoryInstanceID`) REFERENCES `category` (`CategoryID`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `comments`
--

DROP TABLE IF EXISTS `comments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `comments` (
  `CommentsID` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `UserID` int(10) unsigned NOT NULL,
  `CommentTarget` varchar(40) DEFAULT NULL,
  `TargetID` int(10) unsigned NOT NULL,
  `AssignmentInstanceID` int(10) unsigned NOT NULL,
  `CommentsText` varchar(255) DEFAULT NULL,
  `Rating` int(10) DEFAULT NULL,
  `Flag` int(10) DEFAULT NULL,
  `Type` varchar(40) DEFAULT NULL,
  `Status` varchar(40) DEFAULT NULL,
  `Label` varchar(40) DEFAULT NULL,
  `ReplyLevel` int(10) DEFAULT NULL,
  `Parents` int(10) DEFAULT NULL,
  `Delete` int(10) DEFAULT NULL,
  `Hide` int(10) DEFAULT NULL,
  `HideReason` varchar(255) DEFAULT NULL,
  `HideType` varchar(40) DEFAULT NULL,
  `Time` datetime DEFAULT NULL,
  `Complete` tinyint(1) DEFAULT NULL,
  `Edited` int(10) DEFAULT NULL,
  `OriginTaskInstanceID` int(10) DEFAULT NULL,
  `Viewed` int(11) DEFAULT NULL,
  `TaskInstanceID` int(10) unsigned DEFAULT NULL,
  PRIMARY KEY (`CommentsID`),
  UNIQUE KEY `CommentsID` (`CommentsID`),
  KEY `UserID` (`UserID`),
  KEY `AssignmentInstanceID` (`AssignmentInstanceID`),
  CONSTRAINT `comments_ibfk_1` FOREIGN KEY (`UserID`) REFERENCES `user` (`UserID`) ON DELETE NO ACTION ON UPDATE CASCADE,
  CONSTRAINT `comments_ibfk_2` FOREIGN KEY (`AssignmentInstanceID`) REFERENCES `assignmentinstance` (`AssignmentInstanceID`) ON DELETE NO ACTION ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `commentsarchive`
--

DROP TABLE IF EXISTS `commentsarchive`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `commentsarchive` (
  `CommentsArchiveID` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `CommentsID` int(10) unsigned NOT NULL,
  `UserID` int(10) unsigned NOT NULL,
  `CommentTarget` varchar(40) DEFAULT NULL,
  `TargetID` int(10) unsigned NOT NULL,
  `AssignmentInstanceID` int(10) unsigned NOT NULL,
  `CommentsText` varchar(255) DEFAULT NULL,
  `Rating` int(10) DEFAULT NULL,
  `Flag` int(10) DEFAULT NULL,
  `Type` varchar(40) DEFAULT NULL,
  `Status` varchar(40) DEFAULT NULL,
  `Label` varchar(40) DEFAULT NULL,
  `ReplyLevel` int(10) DEFAULT NULL,
  `Parents` int(10) DEFAULT NULL,
  `Delete` int(10) DEFAULT NULL,
  `Hide` int(10) DEFAULT NULL,
  `HideReason` varchar(255) DEFAULT NULL,
  `HideType` varchar(40) DEFAULT NULL,
  `Time` datetime DEFAULT NULL,
  `Complete` tinyint(1) DEFAULT NULL,
  `Edited` int(10) DEFAULT NULL,
  `OriginTaskInstanceID` int(10) DEFAULT NULL,
  PRIMARY KEY (`CommentsArchiveID`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `commentsviewed`
--

DROP TABLE IF EXISTS `commentsviewed`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `commentsviewed` (
  `CommentsViewedID` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `CommentsID` int(10) unsigned NOT NULL,
  `UserID` int(10) unsigned NOT NULL,
  `Time` datetime DEFAULT NULL,
  PRIMARY KEY (`CommentsViewedID`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `contact`
--

DROP TABLE IF EXISTS `contact`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `contact` (
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
-- Table structure for table `course`
--

DROP TABLE IF EXISTS `course`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `course` (
  `CourseID` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `Number` varchar(50) NOT NULL,
  `Name` varchar(150) NOT NULL,
  `OrganizationID` int(10) unsigned NOT NULL,
  `CreatorID` int(10) unsigned NOT NULL,
  `Description` text,
  PRIMARY KEY (`CourseID`),
  UNIQUE KEY `CourseID` (`CourseID`),
  KEY `CreatorID` (`CreatorID`),
  CONSTRAINT `course_ibfk_1` FOREIGN KEY (`CreatorID`) REFERENCES `user` (`UserID`) ON DELETE NO ACTION ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=latin1;
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
  UNIQUE KEY `EmailNotificationID` (`EmailNotificationID`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `extracredit`
--

DROP TABLE IF EXISTS `extracredit`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `extracredit` (
  `SectionUserID` int(10) unsigned NOT NULL,
  `Points` int(10) unsigned NOT NULL DEFAULT '1',
  PRIMARY KEY (`SectionUserID`),
  UNIQUE KEY `SectionUserID` (`SectionUserID`),
  CONSTRAINT `extracredit_ibfk_1` FOREIGN KEY (`SectionUserID`) REFERENCES `sectionuser` (`SectionUserID`) ON DELETE NO ACTION ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
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
  KEY `UserID` (`UserID`),
  CONSTRAINT `filereference_ibfk_1` FOREIGN KEY (`UserID`) REFERENCES `user` (`UserID`) ON DELETE NO ACTION ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=69 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `goal`
--

DROP TABLE IF EXISTS `goal`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `goal` (
  `GoalID` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `Name` varchar(255) DEFAULT NULL,
  `Description` text,
  `CategoryID` int(10) unsigned NOT NULL,
  `ThresholdInstances` int(10) unsigned NOT NULL,
  `Logo` varchar(255) DEFAULT NULL,
  `LogoAchieved` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`GoalID`),
  UNIQUE KEY `GoalID` (`GoalID`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `goalinstance`
--

DROP TABLE IF EXISTS `goalinstance`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `goalinstance` (
  `GoalInstanceID` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `GoalID` int(10) unsigned NOT NULL,
  `CategoryInstanceID` int(10) unsigned NOT NULL,
  `SemesterID` int(10) unsigned NOT NULL,
  `SectionID` int(10) unsigned NOT NULL,
  `CourseID` int(10) unsigned NOT NULL,
  `ThresholdInstances` int(10) unsigned NOT NULL,
  PRIMARY KEY (`GoalInstanceID`),
  UNIQUE KEY `GoalInstanceID` (`GoalInstanceID`),
  KEY `GoalID` (`GoalID`),
  CONSTRAINT `goalinstance_ibfk_1` FOREIGN KEY (`GoalID`) REFERENCES `goal` (`GoalID`) ON DELETE NO ACTION ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
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
  UNIQUE KEY `GroupID` (`GroupID`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
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
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `level`
--

DROP TABLE IF EXISTS `level`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `level` (
  `LevelID` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `Name` varchar(255) NOT NULL,
  `Description` varchar(255) DEFAULT NULL,
  `ThresholdPoints` int(10) unsigned NOT NULL,
  PRIMARY KEY (`LevelID`),
  UNIQUE KEY `LevelID` (`LevelID`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `levelinstance`
--

DROP TABLE IF EXISTS `levelinstance`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `levelinstance` (
  `LevelInstanceID` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `LevelID` int(10) unsigned NOT NULL,
  `SemesterID` int(10) unsigned NOT NULL,
  `SectionID` int(10) unsigned NOT NULL,
  `CourseID` int(10) unsigned NOT NULL,
  `ThresholdPoints` int(10) unsigned NOT NULL,
  PRIMARY KEY (`LevelInstanceID`),
  UNIQUE KEY `LevelInstanceID` (`LevelInstanceID`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `notifications`
--

DROP TABLE IF EXISTS `notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `notifications` (
  `NotificationsID` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `Flag` varchar(70) DEFAULT NULL,
  `UserID` varchar(40) DEFAULT NULL,
  `CommentsID` varchar(40) DEFAULT NULL,
  `VolunteerpoolID` varchar(40) DEFAULT NULL,
  `OriginTaskInstanceID` varchar(40) DEFAULT NULL,
  `Dismiss` tinyint(1) DEFAULT NULL,
  `Time` datetime DEFAULT NULL,
  PRIMARY KEY (`NotificationsID`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
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
  `Logo` json DEFAULT NULL,
  PRIMARY KEY (`OrganizationID`),
  UNIQUE KEY `OrganizationID` (`OrganizationID`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=latin1;
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
  KEY `UserID` (`UserID`),
  KEY `CourseID` (`CourseID`),
  CONSTRAINT `partialassignments_ibfk_1` FOREIGN KEY (`UserID`) REFERENCES `user` (`UserID`) ON DELETE NO ACTION ON UPDATE CASCADE,
  CONSTRAINT `partialassignments_ibfk_2` FOREIGN KEY (`CourseID`) REFERENCES `course` (`CourseID`) ON DELETE NO ACTION ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `pointcategory`
--

DROP TABLE IF EXISTS `pointcategory`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `pointcategory` (
  `CategoryID` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `Name` varchar(100) NOT NULL,
  `Description` text NOT NULL,
  `Tier1Points` int(10) DEFAULT NULL,
  `Tier2Points` int(10) DEFAULT NULL,
  `Tier3Points` int(11) DEFAULT NULL,
  PRIMARY KEY (`CategoryID`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=latin1;
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
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
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
  `Name` varchar(100) NOT NULL,
  `Description` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`SectionID`),
  UNIQUE KEY `SectionID` (`SectionID`),
  KEY `SemesterID` (`SemesterID`),
  KEY `CourseID` (`CourseID`),
  CONSTRAINT `section_ibfk_1` FOREIGN KEY (`SemesterID`) REFERENCES `semester` (`SemesterID`) ON DELETE NO ACTION ON UPDATE CASCADE,
  CONSTRAINT `section_ibfk_2` FOREIGN KEY (`CourseID`) REFERENCES `course` (`CourseID`) ON DELETE NO ACTION ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=29 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `sectionranksnapchot`
--

DROP TABLE IF EXISTS `sectionranksnapchot`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `sectionranksnapchot` (
  `SectionRankSnapchotID` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `SemesterID` int(10) unsigned DEFAULT NULL,
  `SemesterName` varchar(50) DEFAULT NULL,
  `CourseID` int(10) unsigned DEFAULT NULL,
  `CourseName` varchar(50) DEFAULT NULL,
  `CourseNumber` varchar(50) DEFAULT NULL,
  `SectionID` int(10) unsigned DEFAULT NULL,
  `SectionName` varchar(50) DEFAULT NULL,
  `AveragePoints` int(10) unsigned DEFAULT NULL,
  `Rank` int(11) DEFAULT NULL,
  `UpdateDate` date NOT NULL,
  PRIMARY KEY (`SectionRankSnapchotID`),
  UNIQUE KEY `SectionRankSnapchotID` (`SectionRankSnapchotID`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
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
  `Role` varchar(30) NOT NULL DEFAULT 'Student',
  `Active` tinyint(1) NOT NULL DEFAULT '1',
  `Volunteer` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`SectionUserID`),
  UNIQUE KEY `SectionUserID` (`SectionUserID`),
  KEY `SectionID` (`SectionID`),
  KEY `UserID` (`UserID`),
  CONSTRAINT `sectionuser_ibfk_1` FOREIGN KEY (`SectionID`) REFERENCES `section` (`SectionID`) ON DELETE NO ACTION ON UPDATE CASCADE,
  CONSTRAINT `sectionuser_ibfk_2` FOREIGN KEY (`UserID`) REFERENCES `userlogin` (`UserID`) ON DELETE NO ACTION ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=201 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `sectionuserrecord`
--

DROP TABLE IF EXISTS `sectionuserrecord`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `sectionuserrecord` (
  `SectionUserID` int(10) unsigned NOT NULL,
  `LevelInstanceID` int(10) unsigned NOT NULL,
  `SectionID` int(10) unsigned NOT NULL,
  `Title` varchar(255) NOT NULL,
  `Level` int(10) unsigned DEFAULT '1',
  `Exp` int(10) unsigned DEFAULT '0',
  `ThresholdPoints` int(10) unsigned NOT NULL,
  `AvailablePoints` int(10) unsigned NOT NULL DEFAULT '0',
  `UsedPoints` int(10) unsigned DEFAULT '0',
  `PlusPoint` int(10) unsigned DEFAULT '0',
  `GoalInstances` json NOT NULL,
  PRIMARY KEY (`SectionUserID`),
  UNIQUE KEY `SectionUserID` (`SectionUserID`),
  KEY `LevelInstanceID` (`LevelInstanceID`),
  CONSTRAINT `sectionuserrecord_ibfk_1` FOREIGN KEY (`SectionUserID`) REFERENCES `sectionuser` (`SectionUserID`) ON DELETE NO ACTION ON UPDATE CASCADE,
  CONSTRAINT `sectionuserrecord_ibfk_2` FOREIGN KEY (`LevelInstanceID`) REFERENCES `levelinstance` (`LevelInstanceID`) ON DELETE NO ACTION ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
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
  `StartDate` date DEFAULT NULL,
  `EndDate` date DEFAULT NULL,
  PRIMARY KEY (`SemesterID`),
  UNIQUE KEY `SemesterID` (`SemesterID`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `studentranksnapchot`
--

DROP TABLE IF EXISTS `studentranksnapchot`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `studentranksnapchot` (
  `StudentRankSnapchotID` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `SemesterID` int(10) unsigned DEFAULT NULL,
  `SemesterName` varchar(50) DEFAULT NULL,
  `CourseID` int(10) unsigned DEFAULT NULL,
  `CourseName` varchar(50) DEFAULT NULL,
  `CourseNumber` varchar(50) DEFAULT NULL,
  `SectionID` int(10) unsigned DEFAULT NULL,
  `SectionName` varchar(50) DEFAULT NULL,
  `UserID` int(10) unsigned DEFAULT NULL,
  `FirstName` varchar(50) DEFAULT NULL,
  `LastName` varchar(50) DEFAULT NULL,
  `TotalPoints` int(10) unsigned DEFAULT NULL,
  `PointsMovement` varchar(50) DEFAULT NULL,
  `Rank` int(11) DEFAULT NULL,
  `UpdateDate` date NOT NULL,
  PRIMARY KEY (`StudentRankSnapchotID`),
  UNIQUE KEY `StudentRankSnapchotID` (`StudentRankSnapchotID`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `studentrranksnapchot`
--

DROP TABLE IF EXISTS `studentrranksnapchot`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `studentrranksnapchot` (
  `StudentrRankSnapchotID` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `SemesterID` int(10) unsigned DEFAULT NULL,
  `SemesterName` varchar(50) DEFAULT NULL,
  `CourseID` int(10) unsigned DEFAULT NULL,
  `CourseName` varchar(50) DEFAULT NULL,
  `CourseNumber` varchar(50) DEFAULT NULL,
  `SectionID` int(10) unsigned DEFAULT NULL,
  `SectionName` varchar(50) DEFAULT NULL,
  `UserID` int(10) unsigned DEFAULT NULL,
  `FirstName` varchar(50) DEFAULT NULL,
  `LastName` varchar(50) DEFAULT NULL,
  `TotalPoints` int(10) unsigned DEFAULT NULL,
  `PointsMovement` varchar(50) DEFAULT NULL,
  `Rank` int(11) DEFAULT NULL,
  `UpdateDate` date NOT NULL,
  PRIMARY KEY (`StudentrRankSnapchotID`),
  UNIQUE KEY `StudentrRankSnapchotID` (`StudentrRankSnapchotID`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
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
  `VersionEvaluation` varchar(255) DEFAULT NULL,
  `SeeSibblings` tinyint(1) DEFAULT NULL,
  `SeeSameActivity` tinyint(1) DEFAULT NULL,
  `AssignmentInstanceID` int(10) unsigned DEFAULT NULL,
  PRIMARY KEY (`TaskActivityID`),
  UNIQUE KEY `TaskActivityID` (`TaskActivityID`),
  KEY `WorkflowActivityID` (`WorkflowActivityID`),
  KEY `AssignmentID` (`AssignmentID`),
  KEY `AssignmentInstanceID` (`AssignmentInstanceID`),
  CONSTRAINT `taskactivity_ibfk_1` FOREIGN KEY (`WorkflowActivityID`) REFERENCES `workflowactivity` (`WorkflowActivityID`) ON DELETE NO ACTION ON UPDATE CASCADE,
  CONSTRAINT `taskactivity_ibfk_2` FOREIGN KEY (`AssignmentID`) REFERENCES `assignment` (`AssignmentID`) ON DELETE NO ACTION ON UPDATE CASCADE,
  CONSTRAINT `taskactivity_ibfk_3` FOREIGN KEY (`AssignmentInstanceID`) REFERENCES `assignmentinstance` (`AssignmentInstanceID`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=45 DEFAULT CHARSET=latin1;
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
  `WorkflowInstanceID` int(10) unsigned NOT NULL,
  `AssignmentInstanceID` int(10) unsigned NOT NULL,
  `WorkflowActivityID` int(10) unsigned NOT NULL,
  `Grade` float unsigned NOT NULL,
  `IsExtraCredit` int(10) unsigned NOT NULL,
  `MaxGrade` float unsigned NOT NULL,
  `Comments` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`TaskGradeID`),
  UNIQUE KEY `TaskGradeID` (`TaskGradeID`),
  UNIQUE KEY `ti_sectionUserId_unq_idx` (`TaskInstanceID`,`SectionUserID`),
  KEY `SectionUserID` (`SectionUserID`),
  KEY `WorkflowActivityID` (`WorkflowActivityID`),
  CONSTRAINT `taskgrade_ibfk_1` FOREIGN KEY (`TaskInstanceID`) REFERENCES `taskinstance` (`TaskInstanceID`) ON DELETE NO ACTION ON UPDATE CASCADE,
  CONSTRAINT `taskgrade_ibfk_2` FOREIGN KEY (`SectionUserID`) REFERENCES `sectionuser` (`SectionUserID`) ON DELETE NO ACTION ON UPDATE CASCADE,
  CONSTRAINT `taskgrade_ibfk_3` FOREIGN KEY (`WorkflowActivityID`) REFERENCES `workflowactivity` (`WorkflowActivityID`) ON DELETE NO ACTION ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=29 DEFAULT CHARSET=latin1;
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
  KEY `UserID` (`UserID`),
  KEY `TaskActivityID` (`TaskActivityID`),
  KEY `WorkflowInstanceID` (`WorkflowInstanceID`),
  KEY `AssignmentInstanceID` (`AssignmentInstanceID`),
  CONSTRAINT `taskinstance_ibfk_1` FOREIGN KEY (`UserID`) REFERENCES `user` (`UserID`) ON DELETE NO ACTION ON UPDATE CASCADE,
  CONSTRAINT `taskinstance_ibfk_2` FOREIGN KEY (`TaskActivityID`) REFERENCES `taskactivity` (`TaskActivityID`) ON DELETE NO ACTION ON UPDATE CASCADE,
  CONSTRAINT `taskinstance_ibfk_3` FOREIGN KEY (`WorkflowInstanceID`) REFERENCES `workflowinstance` (`WorkflowInstanceID`) ON DELETE NO ACTION ON UPDATE CASCADE,
  CONSTRAINT `taskinstance_ibfk_4` FOREIGN KEY (`AssignmentInstanceID`) REFERENCES `assignmentinstance` (`AssignmentInstanceID`) ON DELETE NO ACTION ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=660 DEFAULT CHARSET=latin1;
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
  `IsExtraCredit` int(10) unsigned NOT NULL,
  `Comments` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`TaskSimpleGradeID`),
  UNIQUE KEY `TaskSimpleGradeID` (`TaskSimpleGradeID`),
  UNIQUE KEY `ti_sectionUserId_unq_idx` (`TaskInstanceID`,`SectionUserID`),
  KEY `SectionUserID` (`SectionUserID`),
  KEY `WorkflowActivityID` (`WorkflowActivityID`),
  CONSTRAINT `tasksimplegrade_ibfk_1` FOREIGN KEY (`TaskInstanceID`) REFERENCES `taskinstance` (`TaskInstanceID`) ON DELETE NO ACTION ON UPDATE CASCADE,
  CONSTRAINT `tasksimplegrade_ibfk_2` FOREIGN KEY (`SectionUserID`) REFERENCES `sectionuser` (`SectionUserID`) ON DELETE NO ACTION ON UPDATE CASCADE,
  CONSTRAINT `tasksimplegrade_ibfk_3` FOREIGN KEY (`WorkflowActivityID`) REFERENCES `workflowactivity` (`WorkflowActivityID`) ON DELETE NO ACTION ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=129 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `testuser`
--

DROP TABLE IF EXISTS `testuser`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `testuser` (
  `X` int(10) unsigned NOT NULL,
  `FirstName` varchar(40) DEFAULT NULL,
  `LastName` varchar(40) DEFAULT NULL,
  `Email` varchar(60) DEFAULT NULL,
  `Test` tinyint(1) DEFAULT NULL,
  PRIMARY KEY (`X`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `user`
--

DROP TABLE IF EXISTS `user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `user` (
  `UserID` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `FirstName` varchar(40) DEFAULT NULL,
  `LastName` varchar(40) DEFAULT NULL,
  `Instructor` tinyint(1) NOT NULL DEFAULT '0',
  `Admin` tinyint(1) NOT NULL DEFAULT '0',
  `OrganizationGroup` json DEFAULT NULL,
  `Role` varchar(40) DEFAULT NULL,
  `Test` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`UserID`),
  UNIQUE KEY `UserID` (`UserID`)
) ENGINE=InnoDB AUTO_INCREMENT=124 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `userbadgeinstances`
--

DROP TABLE IF EXISTS `userbadgeinstances`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `userbadgeinstances` (
  `UserBadgeInstanceID` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `UserID` int(10) unsigned NOT NULL,
  `BadgeInstanceID` int(10) unsigned NOT NULL,
  `SemesterID` int(10) unsigned NOT NULL,
  `CourseID` int(10) unsigned NOT NULL,
  `SectionID` int(10) unsigned NOT NULL,
  `BadgeAwarded` enum('yes','no') DEFAULT NULL,
  PRIMARY KEY (`UserBadgeInstanceID`,`SemesterID`,`CourseID`,`SectionID`),
  UNIQUE KEY `UserBadgeInstanceID` (`UserBadgeInstanceID`),
  KEY `BadgeInstanceID` (`BadgeInstanceID`),
  KEY `userbadgeinstances_ibfk_1` (`UserID`),
  CONSTRAINT `userbadgeinstances_ibfk_1` FOREIGN KEY (`UserID`) REFERENCES `user` (`UserID`) ON DELETE NO ACTION ON UPDATE CASCADE,
  CONSTRAINT `userbadgeinstances_ibfk_2` FOREIGN KEY (`BadgeInstanceID`) REFERENCES `badgeinstance` (`BadgeInstanceID`) ON DELETE NO ACTION ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `userbadges`
--

DROP TABLE IF EXISTS `userbadges`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `userbadges` (
  `UserID` int(10) NOT NULL,
  `BadgeID` int(10) NOT NULL,
  `SemesterID` int(10) NOT NULL,
  `CourseID` int(10) NOT NULL,
  `SectionID` int(10) NOT NULL,
  `BadgeAwarded` enum('yes','no') DEFAULT NULL,
  PRIMARY KEY (`UserID`,`BadgeID`,`SemesterID`,`CourseID`,`SectionID`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `usercontact`
--

DROP TABLE IF EXISTS `usercontact`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `usercontact` (
  `UserID` int(10) unsigned NOT NULL,
  `Email` varchar(70) DEFAULT NULL,
  `Phone` varchar(15) DEFAULT NULL,
  `FirstName` varchar(40) DEFAULT NULL,
  `LastName` varchar(40) DEFAULT NULL,
  `Alias` varchar(40) DEFAULT NULL,
  `ProfilePicture` json DEFAULT NULL,
  `Avatar` json DEFAULT NULL,
  PRIMARY KEY (`UserID`),
  UNIQUE KEY `Email` (`Email`),
  CONSTRAINT `usercontact_ibfk_1` FOREIGN KEY (`UserID`) REFERENCES `user` (`UserID`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
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
  `Pending` tinyint(1) NOT NULL DEFAULT '1',
  `Attempts` int(10) unsigned NOT NULL DEFAULT '0',
  `Timeout` datetime DEFAULT NULL,
  `Blocked` tinyint(1) NOT NULL DEFAULT '0',
  `LastLogin` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`UserID`),
  UNIQUE KEY `Email` (`Email`),
  CONSTRAINT `userlogin_ibfk_1` FOREIGN KEY (`UserID`) REFERENCES `user` (`UserID`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `userpointinstances`
--

DROP TABLE IF EXISTS `userpointinstances`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `userpointinstances` (
  `UserPointInstanceID` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `UserID` int(10) unsigned NOT NULL,
  `CategoryInstanceID` int(10) unsigned NOT NULL,
  `PointInstances` int(10) unsigned NOT NULL,
  PRIMARY KEY (`UserPointInstanceID`),
  UNIQUE KEY `UserPointInstanceID` (`UserPointInstanceID`),
  KEY `UserID` (`UserID`),
  CONSTRAINT `userpointinstances_ibfk_1` FOREIGN KEY (`UserID`) REFERENCES `user` (`UserID`) ON DELETE NO ACTION ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `volunteerpool`
--

DROP TABLE IF EXISTS `volunteerpool`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `volunteerpool` (
  `VolunteerPoolID` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `UserID` int(10) unsigned NOT NULL,
  `SectionID` int(10) unsigned NOT NULL,
  `AssignmentInstanceID` int(10) unsigned DEFAULT NULL,
  `status` varchar(25) DEFAULT NULL,
  PRIMARY KEY (`VolunteerPoolID`),
  UNIQUE KEY `VolunteerPoolID` (`VolunteerPoolID`),
  UNIQUE KEY `uniqueVolunteer` (`UserID`,`SectionID`,`AssignmentInstanceID`),
  KEY `SectionID` (`SectionID`),
  CONSTRAINT `volunteerpool_ibfk_1` FOREIGN KEY (`UserID`) REFERENCES `user` (`UserID`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `volunteerpool_ibfk_2` FOREIGN KEY (`SectionID`) REFERENCES `section` (`SectionID`) ON DELETE NO ACTION ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=latin1;
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
  KEY `AssignmentID` (`AssignmentID`),
  CONSTRAINT `workflowactivity_ibfk_1` FOREIGN KEY (`AssignmentID`) REFERENCES `assignment` (`AssignmentID`) ON DELETE NO ACTION ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=latin1;
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
  UNIQUE KEY `wf_sectionUserId_unq_idx` (`WorkflowActivityID`,`SectionUserID`),
  KEY `SectionUserID` (`SectionUserID`),
  KEY `AssignmentInstanceID` (`AssignmentInstanceID`),
  CONSTRAINT `workflowgrade_ibfk_1` FOREIGN KEY (`WorkflowActivityID`) REFERENCES `workflowactivity` (`WorkflowActivityID`) ON DELETE NO ACTION ON UPDATE CASCADE,
  CONSTRAINT `workflowgrade_ibfk_2` FOREIGN KEY (`SectionUserID`) REFERENCES `sectionuser` (`SectionUserID`) ON DELETE NO ACTION ON UPDATE CASCADE,
  CONSTRAINT `workflowgrade_ibfk_3` FOREIGN KEY (`AssignmentInstanceID`) REFERENCES `assignmentinstance` (`AssignmentInstanceID`) ON DELETE NO ACTION ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=28 DEFAULT CHARSET=latin1;
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
  KEY `WorkflowActivityID` (`WorkflowActivityID`),
  KEY `AssignmentInstanceID` (`AssignmentInstanceID`),
  CONSTRAINT `workflowinstance_ibfk_1` FOREIGN KEY (`WorkflowActivityID`) REFERENCES `workflowactivity` (`WorkflowActivityID`) ON DELETE NO ACTION ON UPDATE CASCADE,
  CONSTRAINT `workflowinstance_ibfk_2` FOREIGN KEY (`AssignmentInstanceID`) REFERENCES `assignmentinstance` (`AssignmentInstanceID`) ON DELETE NO ACTION ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=99 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2018-03-23 10:05:33
