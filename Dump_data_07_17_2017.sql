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

/*Table structure for table `badgecategory` */

DROP TABLE IF EXISTS `badgecategory`;

CREATE TABLE `badgecategory` (
  `BadgeCategoryID` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `SemesterID` int(10) DEFAULT NULL,
  `SectionID` int(10) NOT NULL,
  `CourseID` int(10) DEFAULT NULL,
  `Name` varchar(100) NOT NULL,
  `Description` text NOT NULL,
  `Tier1Instances` int(10) NOT NULL,
  `Tier2Instances` int(10) NOT NULL,
  `Tier3Instances` int(10) NOT NULL,
  PRIMARY KEY (`BadgeCategoryID`)
) ENGINE=InnoDB AUTO_INCREMENT=25 DEFAULT CHARSET=latin1;

/*Data for the table `badgecategory` */

insert  into `badgecategory`(`BadgeCategoryID`,`SemesterID`,`SectionID`,`CourseID`,`Name`,`Description`,`Tier1Instances`,`Tier2Instances`,`Tier3Instances`) values 
(1,1,1,1,'Questions','Given to students who successfully submit a question through PLA',2,5,8),
(2,1,1,1,'High Grades','Given to students who get a grade of 90 or more for their solution provided',2,5,8),
(3,1,1,1,'Solutions','Given to students who successfully submit a solution to a question given',2,5,8),
(4,1,1,1,'Grader','Given to students who successfully submit a grade to a solution given by other',2,5,8),
(5,1,1,1,'Early Submission','Given to students who complete a task given (create question , solution, grades) ',2,5,8),
(6,1,1,1,'Participation Badge','Given to students who submitted at least one question, one solution and one grade\r\n',2,5,8),
(7,1,3,1,'Questions','Given to students who successfully submit a question through PLA',2,5,8),
(8,1,3,1,'High Grades','Given to students who get a grade of 90 or more for their solution provided',2,5,8),
(9,1,3,1,'Solutions','Given to students who successfully submit a solution to a question given',2,5,8),
(10,1,3,1,'Grader','Given to students who successfully submit a grade to a solution given by other',2,5,8),
(11,1,3,1,'Early Submission','Given to students who complete a task given (create question , solution, grades) ',2,5,8),
(12,1,3,1,'Participation Badge','Given to students who submitted at least one question, one solution and one grade\r\n',2,5,8),
(13,1,8,3,'Questions','Given to students who successfully submit a question through PLA',5,5,5),
(14,1,8,3,'Questions','Given to students who successfully submit a question through PLA',5,5,5),
(15,1,8,3,'Questions','Given to students who successfully submit a question through PLA',5,5,5),
(16,1,8,3,'Questions','Given to students who successfully submit a question through PLA',5,5,5),
(17,1,8,3,'Questions','Given to students who successfully submit a question through PLA',5,5,5),
(18,1,8,3,'Questions','Given to students who successfully submit a question through PLA',5,5,5),
(19,1,7,2,'Questions','Given to students who successfully submit a question through PLA',5,5,5),
(20,1,7,2,'Questions','Given to students who successfully submit a question through PLA',5,5,5),
(21,1,7,2,'Questions','Given to students who successfully submit a question through PLA',5,5,5),
(22,1,7,2,'Questions','Given to students who successfully submit a question through PLA',5,5,5),
(23,1,7,2,'Questions','Given to students who successfully submit a question through PLA',5,5,5),
(24,1,7,2,'Questions','Given to students who successfully submit a question through PLA',5,5,5);

/*Table structure for table `badges` */

DROP TABLE IF EXISTS `badges`;

CREATE TABLE `badges` (
  `BadgeID` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `BadgeCategoryID` int(10) unsigned NOT NULL,
  `SectionID` int(10) DEFAULT NULL,
  `Name` varchar(100) COLLATE latin1_spanish_ci NOT NULL,
  `Description` text COLLATE latin1_spanish_ci,
  `logo` varchar(200) COLLATE latin1_spanish_ci DEFAULT NULL,
  PRIMARY KEY (`BadgeID`)
) ENGINE=InnoDB AUTO_INCREMENT=73 DEFAULT CHARSET=latin1 COLLATE=latin1_spanish_ci;

/*Data for the table `badges` */

insert  into `badges`(`BadgeID`,`BadgeCategoryID`,`SectionID`,`Name`,`Description`,`logo`) values 
(1,1,1,'Bronze','This is the bronze category.',NULL),
(2,1,1,'Silver','This is the silver category.',NULL),
(3,1,1,'Gold','This is the gold category.',NULL),
(4,2,1,'Bronze','This is the bronze category.',NULL),
(5,2,1,'Silver','This is the silver category.',NULL),
(6,2,1,'Gold','This is the gold category.',NULL),
(7,3,1,'Bronze','This is the bronze category.',NULL),
(8,3,1,'Silver','This is the silver category.',NULL),
(9,3,1,'Gold','This is the gold category.',NULL),
(10,4,1,'Bronze','This is the bronze category.',NULL),
(11,4,1,'Silver','This is the silver category.',NULL),
(12,4,1,'Gold','This is the gold category.',NULL),
(13,5,1,'Bronze','This is the bronze category.',NULL),
(14,5,1,'Silver','This is the silver category.',NULL),
(15,5,1,'Gold','This is the gold category.',NULL),
(16,6,1,'Bronze','This is the bronze category.',NULL),
(17,6,1,'Silver','This is the silver category.',NULL),
(18,6,1,'Gold','This is the gold category.',NULL),
(19,7,2,'Bronze','This is the bronze category.',NULL),
(20,7,2,'Silver','This is the silver category.',NULL),
(21,7,2,'Gold','This is the gold category.',NULL),
(22,8,2,'Bronze','This is the bronze category.',NULL),
(23,8,2,'Silver','This is the silver category.',NULL),
(24,8,2,'Gold','This is the gold category.',NULL),
(25,9,2,'Bronze','This is the bronze category.',NULL),
(26,9,2,'Silver','This is the silver category.',NULL),
(27,9,2,'Gold','This is the gold category.',NULL),
(28,10,2,'Bronze','This is the bronze category.',NULL),
(29,10,2,'Silver','This is the silver category.',NULL),
(30,10,2,'Gold','This is the gold category.',NULL),
(31,11,2,'Bronze','This is the bronze category.',NULL),
(32,11,2,'Silver','This is the silver category.',NULL),
(33,11,2,'Gold','This is the gold category.',NULL),
(34,12,2,'Bronze','This is the bronze category.',NULL),
(35,12,2,'Silver','This is the silver category.',NULL),
(36,12,2,'Gold','This is the gold category.',NULL),
(37,13,3,'Bronze','This is the bronze category.',NULL),
(38,13,3,'Silver','This is the silver category.',NULL),
(39,13,3,'Gold','This is the gold category.',NULL),
(40,14,3,'Bronze','This is the bronze category.',NULL),
(41,14,3,'Silver','This is the silver category.',NULL),
(42,14,3,'Gold','This is the gold category.',NULL),
(43,15,3,'Bronze','This is the bronze category.',NULL),
(44,15,3,'Silver','This is the silver category.',NULL),
(45,15,3,'Gold','This is the gold category.',NULL),
(46,16,3,'Bronze','This is the bronze category.',NULL),
(47,16,3,'Silver','This is the silver category.',NULL),
(48,16,3,'Gold','This is the gold category.',NULL),
(49,17,3,'Bronze','This is the bronze category.',NULL),
(50,17,3,'Silver','This is the silver category.',NULL),
(51,17,3,'Gold','This is the gold category.',NULL),
(52,18,3,'Bronze','This is the bronze category.',NULL),
(53,18,3,'Silver','This is the silver category.',NULL),
(54,18,3,'Gold','This is the gold category.',NULL),
(55,19,3,'Bronze','This is the bronze category.',NULL),
(56,19,3,'Silver','This is the silver category.',NULL),
(57,19,3,'Gold','This is the gold category.',NULL),
(58,20,3,'Bronze','This is the bronze category.',NULL),
(59,20,3,'Silver','This is the silver category.',NULL),
(60,20,3,'Gold','This is the gold category.',NULL),
(61,21,3,'Bronze','This is the bronze category.',NULL),
(62,21,3,'Gold','This is the silver category.',NULL),
(63,22,3,'Gold','This is the gold category.',NULL),
(64,21,3,'Silver','This is the silver category.',NULL),
(65,22,3,'Bronze','This is the silver category.',NULL),
(66,23,3,'Gold','This is the gold category.',NULL),
(67,22,3,'Silver','This is the silver category.',NULL),
(68,23,3,'Bronze','This is the gold category.',NULL),
(69,24,3,'Silver','This is the gold category.',NULL),
(70,23,3,'Silver','This is the gold category.',NULL),
(71,24,3,'Bronze','This is the gold category.',NULL),
(72,24,3,'Gold','This is the gold category.',NULL);

/*Table structure for table `categoryinstancepoints` */

DROP TABLE IF EXISTS `categoryinstancepoints`;

CREATE TABLE `categoryinstancepoints` (
  `CategoryInstancePointsID` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `SectionID` int(10) DEFAULT NULL,
  `CategoryID` int(10) DEFAULT NULL,
  `InstancePoints` int(10) DEFAULT NULL,
  PRIMARY KEY (`CategoryInstancePointsID`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

/*Data for the table `categoryinstancepoints` */

/*Table structure for table `userbadges` */

DROP TABLE IF EXISTS `userbadges`;

CREATE TABLE `userbadges` (
  `UserBadgeID` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `UserID` int(10) NOT NULL,
  `SemesterID` int(10) DEFAULT NULL,
  `CourseID` int(10) DEFAULT NULL,
  `SectionID` int(10) NOT NULL,
  `BadgeID` int(10) NOT NULL,
  `BadgeAwarded` enum('yes','no') DEFAULT NULL,
  PRIMARY KEY (`UserBadgeID`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=latin1;

/*Data for the table `userbadges` */

insert  into `userbadges`(`UserBadgeID`,`UserID`,`SemesterID`,`CourseID`,`SectionID`,`BadgeID`,`BadgeAwarded`) values 
(1,1,1,1,3,1,'yes'),
(2,1,1,1,3,2,'yes'),
(3,1,1,1,3,3,'yes'),
(4,1,1,3,8,4,'yes'),
(5,1,1,3,8,5,'yes'),
(6,1,1,3,8,6,'yes'),
(7,1,1,2,7,7,'yes'),
(8,1,1,2,7,8,'yes'),
(9,1,1,2,7,9,'yes'),
(10,1,1,1,1,10,'yes'),
(11,1,1,1,1,11,'yes'),
(12,1,1,1,1,12,'yes');

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;
