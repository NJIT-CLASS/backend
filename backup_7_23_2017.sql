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

/*Table structure for table `category` */

DROP TABLE IF EXISTS `category`;

CREATE TABLE `category` (
  `CategoryID` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `SemesterID` int(10) DEFAULT NULL,
  `SectionID` int(10) NOT NULL,
  `CourseID` int(10) DEFAULT NULL,
  `Name` varchar(100) NOT NULL,
  `Description` text NOT NULL,
  `Tier1Instances` int(10) NOT NULL,
  `Tier2Instances` int(10) NOT NULL,
  `Tier3Instances` int(10) NOT NULL,
  PRIMARY KEY (`CategoryID`)
) ENGINE=InnoDB AUTO_INCREMENT=25 DEFAULT CHARSET=latin1;

/*Data for the table `category` */

insert  into `category`(`CategoryID`,`SemesterID`,`SectionID`,`CourseID`,`Name`,`Description`,`Tier1Instances`,`Tier2Instances`,`Tier3Instances`) values 
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

/*Table structure for table `categoryinstancepoints` */

DROP TABLE IF EXISTS `categoryinstancepoints`;

CREATE TABLE `categoryinstancepoints` (
  `CategoryInstancePointsID` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `SemesterID` int(10) DEFAULT NULL,
  `CourseID` int(10) DEFAULT NULL,
  `SectionID` int(10) DEFAULT NULL,
  `CategoryID` int(10) DEFAULT NULL,
  `InstancePoints` int(10) DEFAULT NULL,
  PRIMARY KEY (`CategoryInstancePointsID`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=latin1;

/*Data for the table `categoryinstancepoints` */

insert  into `categoryinstancepoints`(`CategoryInstancePointsID`,`SemesterID`,`CourseID`,`SectionID`,`CategoryID`,`InstancePoints`) values 
(1,1,1,1,1,5),
(2,1,1,1,2,10),
(3,1,1,1,3,10),
(4,1,1,1,4,10),
(5,1,1,1,5,10),
(6,1,1,1,6,10);

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;
