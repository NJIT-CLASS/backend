/*
SQLyog Ultimate v12.4.1 (64 bit)
MySQL - 5.7.18-log : Database - class/pla
*********************************************************************
*/

/*!40101 SET NAMES utf8 */;

/*!40101 SET SQL_MODE=''*/;

/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;
CREATE DATABASE /*!32312 IF NOT EXISTS*/`class/pla` /*!40100 DEFAULT CHARACTER SET latin1 */;

USE `class/pla`;

/*Table structure for table `badge` */

DROP TABLE IF EXISTS `badge`;

CREATE TABLE `badge` (
  `BadgeID` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `CategoryID` int(10) unsigned DEFAULT NULL,
  `Name` varchar(100) COLLATE latin1_spanish_ci NOT NULL,
  `Description` text COLLATE latin1_spanish_ci,
  `Logo` varchar(200) COLLATE latin1_spanish_ci DEFAULT NULL,
  PRIMARY KEY (`BadgeID`),
  KEY `BadgeCategory` (`CategoryID`),
  CONSTRAINT `BadgeCategory` FOREIGN KEY (`CategoryID`) REFERENCES `category` (`CategoryID`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=latin1 COLLATE=latin1_spanish_ci;

/*Table structure for table `badgeinstance` */

DROP TABLE IF EXISTS `badgeinstance`;

CREATE TABLE `badgeinstance` (
  `BadgeInstanceID` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `BadgeID` int(10) unsigned NOT NULL,
  `CategoryInstanceID` int(10) unsigned NOT NULL,
  PRIMARY KEY (`BadgeInstanceID`),
  UNIQUE KEY `BadgeInstanceID` (`BadgeInstanceID`),
  UNIQUE KEY `BadgeInstance_BadgeInstanceID_unique` (`BadgeInstanceID`),
  KEY `BadgeParent` (`BadgeID`),
  KEY `CategoryInstanceID` (`CategoryInstanceID`),
  CONSTRAINT `BadgeParent` FOREIGN KEY (`BadgeID`) REFERENCES `badge` (`BadgeID`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `CategoryInstanceID` FOREIGN KEY (`CategoryInstanceID`) REFERENCES `categoryinstance` (`CategoryInstanceID`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=latin1;

/*Table structure for table `category` */

DROP TABLE IF EXISTS `category`;

CREATE TABLE `category` (
  `CategoryID` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `type` varchar(50) DEFAULT NULL,
  `Name` varchar(100) NOT NULL,
  `Description` text NOT NULL,
  `Tier1Instances` int(10) NOT NULL,
  `Tier2Instances` int(10) NOT NULL,
  `Tier3Instances` int(10) NOT NULL,
  `InstanceValue` int(10) NOT NULL DEFAULT '1',
  PRIMARY KEY (`CategoryID`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=latin1;

/*Table structure for table `categoryinstance` */

DROP TABLE IF EXISTS `categoryinstance`;

CREATE TABLE `categoryinstance` (
  `CategoryInstanceID` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `CategoryID` int(10) unsigned NOT NULL,
  `SemesterID` int(10) unsigned NOT NULL,
  `SectionID` int(10) unsigned NOT NULL,
  `CourseID` int(10) unsigned NOT NULL,
  `Tier1Instances` int(10) unsigned NOT NULL DEFAULT '0',
  `Tier2Instances` int(10) unsigned NOT NULL DEFAULT '0',
  `Tier3Instances` int(10) unsigned NOT NULL DEFAULT '0',
  `InstanceValue` int(10) unsigned NOT NULL DEFAULT '1',
  PRIMARY KEY (`CategoryInstanceID`),
  KEY `category` (`CategoryID`),
  KEY `semester` (`SemesterID`),
  KEY `course` (`CourseID`),
  KEY `section` (`SectionID`),
  CONSTRAINT `category` FOREIGN KEY (`CategoryID`) REFERENCES `category` (`CategoryID`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `course` FOREIGN KEY (`CourseID`) REFERENCES `course` (`CourseID`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `section` FOREIGN KEY (`SectionID`) REFERENCES `section` (`SectionID`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `semester` FOREIGN KEY (`SemesterID`) REFERENCES `semester` (`SemesterID`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=latin1;

/*Table structure for table `goal` */

DROP TABLE IF EXISTS `goal`;

CREATE TABLE `goal` (
  `GoalID` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `Name` varchar(100) DEFAULT NULL,
  `Description` varchar(255) DEFAULT NULL,
  `CategoryID` int(10) unsigned NOT NULL,
  `ThresholdInstances` int(10) DEFAULT NULL,
  `Logo` varchar(100) DEFAULT NULL,
  `LogoAchieved` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`GoalID`),
  KEY `GoalCategory` (`CategoryID`),
  CONSTRAINT `GoalCategory` FOREIGN KEY (`CategoryID`) REFERENCES `category` (`CategoryID`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=latin1;

/*Table structure for table `goalinstance` */

DROP TABLE IF EXISTS `goalinstance`;

CREATE TABLE `goalinstance` (
  `GoalInstanceID` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `goalID` int(10) unsigned NOT NULL,
  `CategoryInstanceID` int(10) unsigned NOT NULL,
  `SemesterID` int(10) unsigned NOT NULL,
  `CourseID` int(10) unsigned NOT NULL,
  `SectionID` int(10) unsigned NOT NULL,
  `ThresholdInstances` int(10) DEFAULT '0',
  PRIMARY KEY (`GoalInstanceID`),
  KEY `unique` (`goalID`,`CategoryInstanceID`,`SemesterID`,`CourseID`,`SectionID`),
  KEY `GoalSemester` (`SemesterID`),
  KEY `GoalCourse` (`CourseID`),
  KEY `GoalSection` (`SectionID`),
  KEY `CategoryInstance` (`CategoryInstanceID`),
  CONSTRAINT `CategoryInstance` FOREIGN KEY (`CategoryInstanceID`) REFERENCES `categoryinstance` (`CategoryInstanceID`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `GoalCourse` FOREIGN KEY (`CourseID`) REFERENCES `course` (`CourseID`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `GoalID` FOREIGN KEY (`goalID`) REFERENCES `goal` (`GoalID`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `GoalSection` FOREIGN KEY (`SectionID`) REFERENCES `section` (`SectionID`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `GoalSemester` FOREIGN KEY (`SemesterID`) REFERENCES `semester` (`SemesterID`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=latin1;

/*Table structure for table `level` */

DROP TABLE IF EXISTS `level`;

CREATE TABLE `level` (
  `LevelID` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `Name` varchar(100) DEFAULT NULL,
  `Description` varchar(255) DEFAULT NULL,
  `ThresholdPoints` int(10) DEFAULT NULL,
  PRIMARY KEY (`LevelID`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=latin1;

/*Table structure for table `levelinstance` */

DROP TABLE IF EXISTS `levelinstance`;

CREATE TABLE `levelinstance` (
  `LevelInstanceID` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `LevelID` int(10) unsigned NOT NULL,
  `SemesterID` int(10) unsigned NOT NULL,
  `CourseID` int(10) unsigned NOT NULL,
  `SectionID` int(10) unsigned NOT NULL,
  `ThresholdPoints` int(10) NOT NULL DEFAULT '0',
  PRIMARY KEY (`LevelInstanceID`),
  KEY `LevelParent` (`LevelID`),
  KEY `LevelSemester` (`SemesterID`),
  KEY `LevelCourse` (`CourseID`),
  KEY `LevelSection` (`SectionID`),
  CONSTRAINT `LevelCourse` FOREIGN KEY (`CourseID`) REFERENCES `semester` (`SemesterID`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `LevelParent` FOREIGN KEY (`LevelID`) REFERENCES `level` (`LevelID`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `LevelSection` FOREIGN KEY (`SectionID`) REFERENCES `section` (`SectionID`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `LevelSemester` FOREIGN KEY (`SemesterID`) REFERENCES `semester` (`SemesterID`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=latin1;

/*Table structure for table `sectionranksnapchot` */

DROP TABLE IF EXISTS `sectionranksnapchot`;

CREATE TABLE `sectionranksnapchot` (
  `SectionRankSnapchatID` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `SemesterID` int(10) unsigned NOT NULL,
  `SemesterName` varchar(50) NOT NULL,
  `CourseID` int(10) unsigned NOT NULL,
  `CourseName` varchar(50) NOT NULL,
  `CourseNumber` varchar(50) NOT NULL,
  `SectionID` int(10) unsigned NOT NULL,
  `SectionName` varchar(50) NOT NULL,
  `AveragePoints` int(10) unsigned NOT NULL,
  `Rank` int(10) unsigned NOT NULL,
  `UpdateDate` datetime NOT NULL,
  PRIMARY KEY (`SectionRankSnapchatID`),
  UNIQUE KEY `SectionRankSnapchatID` (`SectionRankSnapchatID`),
  UNIQUE KEY `sectionranksnapchot_StudentRankSnapchatID_unique` (`SectionRankSnapchatID`),
  KEY `snap_semester` (`SemesterID`),
  KEY `snap_course` (`CourseID`),
  KEY `snap_section` (`SectionID`),
  CONSTRAINT `snap_course` FOREIGN KEY (`CourseID`) REFERENCES `course` (`CourseID`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `snap_section` FOREIGN KEY (`SectionID`) REFERENCES `section` (`SectionID`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `snap_semester` FOREIGN KEY (`SemesterID`) REFERENCES `semester` (`SemesterID`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=31 DEFAULT CHARSET=latin1;

/*Table structure for table `studentranksnapchot` */

DROP TABLE IF EXISTS `studentranksnapchot`;

CREATE TABLE `studentranksnapchot` (
  `StudentRankSnapchotID` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `SemesterID` int(10) unsigned NOT NULL,
  `SemesterName` varchar(50) NOT NULL,
  `CourseID` int(10) unsigned NOT NULL,
  `CourseName` varchar(50) NOT NULL,
  `CourseNumber` varchar(20) NOT NULL,
  `SectionID` int(10) unsigned NOT NULL,
  `SectionName` varchar(50) NOT NULL,
  `UserID` int(10) unsigned NOT NULL,
  `FirstName` varchar(100) DEFAULT NULL,
  `LastName` varchar(100) DEFAULT NULL,
  `TotalPoints` int(10) unsigned NOT NULL,
  `PointsMovement` int(10) NOT NULL,
  `Rank` int(10) unsigned NOT NULL,
  `UpdateDate` datetime NOT NULL,
  PRIMARY KEY (`StudentRankSnapchotID`),
  KEY `SemesterID` (`SemesterID`),
  KEY `CourseID` (`CourseID`),
  KEY `SectionID` (`SectionID`),
  KEY `UserID` (`UserID`),
  CONSTRAINT `studentranksnapchot_ibfk_1` FOREIGN KEY (`SemesterID`) REFERENCES `semester` (`SemesterID`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `studentranksnapchot_ibfk_2` FOREIGN KEY (`CourseID`) REFERENCES `course` (`CourseID`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `studentranksnapchot_ibfk_3` FOREIGN KEY (`SectionID`) REFERENCES `section` (`SectionID`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `studentranksnapchot_ibfk_4` FOREIGN KEY (`UserID`) REFERENCES `user` (`UserID`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=91 DEFAULT CHARSET=latin1;

/*Table structure for table `userbadgeinstances` */

DROP TABLE IF EXISTS `userbadgeinstances`;

CREATE TABLE `userbadgeinstances` (
  `UserBadgeInstanceID` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `UserID` int(10) unsigned NOT NULL,
  `SemesterID` int(10) unsigned NOT NULL,
  `CourseID` int(10) unsigned NOT NULL,
  `SectionID` int(10) unsigned NOT NULL,
  `BadgeInstanceID` int(10) unsigned NOT NULL,
  `BadgeAwarded` enum('yes','no') DEFAULT 'no',
  PRIMARY KEY (`UserBadgeInstanceID`),
  KEY `BadgeUser` (`UserID`),
  KEY `BadgeSemester` (`SemesterID`),
  KEY `BadgeCourse` (`CourseID`),
  KEY `BadgeSection` (`SectionID`),
  KEY `BadgeInstance` (`BadgeInstanceID`),
  CONSTRAINT `BadgeCourse` FOREIGN KEY (`CourseID`) REFERENCES `course` (`CourseID`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `BadgeInstance` FOREIGN KEY (`BadgeInstanceID`) REFERENCES `badgeinstance` (`BadgeInstanceID`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `BadgeSection` FOREIGN KEY (`SectionID`) REFERENCES `section` (`SectionID`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `BadgeSemester` FOREIGN KEY (`SemesterID`) REFERENCES `semester` (`SemesterID`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `BadgeUser` FOREIGN KEY (`UserID`) REFERENCES `user` (`UserID`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

/*Table structure for table `userpointinstances` */

DROP TABLE IF EXISTS `userpointinstances`;

CREATE TABLE `userpointinstances` (
  `UserPointInstanceID` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `UserID` int(10) unsigned NOT NULL,
  `CategoryInstanceID` int(10) unsigned NOT NULL,
  `PointInstances` int(10) DEFAULT NULL,
  PRIMARY KEY (`UserID`,`CategoryInstanceID`,`UserPointInstanceID`),
  KEY `UserPointInstanceID` (`UserPointInstanceID`),
  KEY `CategoryInstance_fk` (`CategoryInstanceID`),
  CONSTRAINT `CategoryInstance_fk` FOREIGN KEY (`CategoryInstanceID`) REFERENCES `badgeinstance` (`BadgeInstanceID`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `UserID_fk` FOREIGN KEY (`UserID`) REFERENCES `user` (`UserID`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=30 DEFAULT CHARSET=latin1;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;
