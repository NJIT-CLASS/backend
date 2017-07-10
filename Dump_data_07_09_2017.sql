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
  `CategoryID` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `CourseID` int(10) DEFAULT NULL,
  `SectionID` int(10) DEFAULT NULL,
  `SemesterID` int(10) DEFAULT NULL,
  `Name` varchar(100) NOT NULL,
  `Description` text NOT NULL,
  `Tier1Instances` int(10) DEFAULT NULL,
  `Tier2Instances` int(10) DEFAULT NULL,
  `Tier3Instances` int(10) DEFAULT NULL,
  PRIMARY KEY (`CategoryID`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=latin1;

/*Data for the table `badgecategory` */

insert  into `badgecategory`(`CategoryID`,`CourseID`,`SectionID`,`SemesterID`,`Name`,`Description`,`Tier1Instances`,`Tier2Instances`,`Tier3Instances`) values 
(1,1,1,1,'Questions',' Given to students who successfully submit a question through PLA',2,5,8),
(2,1,1,1,'High Grades','Given to students who get a grade of 90 or more for their solution provided',2,5,8),
(3,1,1,1,'Solutions','Given to students who successfully submit a solution to a question given',2,5,8),
(4,1,1,1,'Grader','Given to students who successfully submit a grade to a solution given by other',2,5,8),
(5,1,1,1,'Early Submission','Given to students who complete a task given (create question , solution, grades) ',2,5,8),
(6,1,1,1,'Participation Badge','Given to students who submitted at least one question, one solution and one grade\r\n',2,5,8);

/*Table structure for table `pointcategory` */

DROP TABLE IF EXISTS `pointcategory`;

CREATE TABLE `pointcategory` (
  `CategoryID` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `Name` varchar(100) NOT NULL,
  `Description` text NOT NULL,
  `Tier1Points` int(10) DEFAULT NULL,
  `Tier2Points` int(10) DEFAULT NULL,
  `Tier3Points` int(11) DEFAULT NULL,
  PRIMARY KEY (`CategoryID`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=latin1;

/*Data for the table `pointcategory` */

insert  into `pointcategory`(`CategoryID`,`Name`,`Description`,`Tier1Points`,`Tier2Points`,`Tier3Points`) values 
(1,'Questions',' Given to students who successfully submit a question through PLA',100,200,300),
(2,'High Grades','Given to students who get a grade of 90 or more for their solution provided',100,200,300),
(3,'Solutions','Given to students who successfully submit a solution to a question given',100,200,300),
(4,'Grader','Given to students who successfully submit a grade to a solution given by other',100,200,300),
(5,'Early Submission','Given to students who complete a task given (create question , solution, grades) ',100,200,300),
(6,'Participation Badge','Given to students who submitted at least one question, one solution and one grade\r\n',100,100,100);

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;
