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



LOCK TABLES `Course` WRITE;
/*!40000 ALTER TABLE `Course` DISABLE KEYS */;
INSERT INTO `Course` (`CourseID`, `Number`, `Name`, `OrganizationID`, `CreatorID`, `Description`) VALUES (1,'CS100','Intro to Computer Science',1,2,NULL),(2,'Math121','Calculus II',1,1,NULL),(3,'CS280','Programming Language Concept',1,2,NULL),(4,'CS288','Intensive programming in Linux',1,2,NULL),(5,'CS 332','Principles of Operating Systems',1,1,NULL),(8,'Math 337','Linear Algebra',1,1,NULL),(9,'Calculus 2','Math 112',1,1,NULL),(10,'Phys 111','Physics 1',1,1,NULL),(11,'Phys 111','Physics 1',1,1,NULL),(12,'Phys 121','Phys 2',1,1,NULL),(13,'Phys 131','Phys 3',1,1,NULL);
/*!40000 ALTER TABLE `Course` ENABLE KEYS */;
UNLOCK TABLES;



LOCK TABLES `Organization` WRITE;
/*!40000 ALTER TABLE `Organization` DISABLE KEYS */;
INSERT INTO `Organization` (`OrganizationID`, `Name`, `UserID`) VALUES (1,'NJIT',NULL);
/*!40000 ALTER TABLE `Organization` ENABLE KEYS */;
UNLOCK TABLES;



LOCK TABLES `ResetPasswordRequest` WRITE;
/*!40000 ALTER TABLE `ResetPasswordRequest` DISABLE KEYS */;
/*!40000 ALTER TABLE `ResetPasswordRequest` ENABLE KEYS */;
UNLOCK TABLES;


LOCK TABLES `Section` WRITE;
/*!40000 ALTER TABLE `Section` DISABLE KEYS */;
INSERT INTO `Section` (`SectionID`, `SemesterID`, `CourseID`, `OrganizationID`, `Name`, `StartDate`, `EndDate`, `Description`) VALUES (1,1,1,1,'001','2016-09-01 00:00:00','2016-12-11 00:00:00','Description for CS100-001'),(2,1,1,1,'013','2016-09-01 00:00:00','2016-12-11 00:00:00','Description for CS100-013'),(3,1,1,1,'h01','2016-09-01 00:00:00','2016-12-11 00:00:00','Description for CS100-h13 --Honor\'s Section'),(4,2,1,1,'002','2017-01-15 00:00:00','2017-05-15 00:00:00','Description for CS100-002'),(5,2,1,1,'h02','2017-01-15 00:00:00','2017-05-15 00:00:00','Description for CS100-h02 --Honor\'s Section'),(6,1,2,1,'001','2016-09-01 00:00:00','2016-12-11 00:00:00','Description for Math111-001'),(7,1,2,1,'004','2016-09-01 00:00:00','2016-12-11 00:00:00','Description for Math111-004'),(8,1,3,1,'001','2016-09-01 00:00:00','2016-12-11 00:00:00','Description for CS280-001'),(9,2,3,1,'002','2017-01-15 00:00:00','2017-05-15 00:00:00','Description for CS280-002'),(10,1,3,1,'\'007\'',NULL,NULL,'\'CS280-007\''),(11,1,3,1,'\'008\'',NULL,NULL,'\'CS280-008\''),(12,1,3,1,'\'009\'','2016-09-01 00:00:00','2016-12-11 00:00:00','\'CS280-009\''),(14,1,10,1,'002','2016-09-01 00:00:00','2016-12-11 00:00:00','Morning Section'),(15,1,11,1,'002','2016-09-01 00:00:00','2016-12-11 00:00:00','morning'),(16,1,12,1,'002','2016-09-01 00:00:00','2016-12-11 00:00:00','asdasdsds'),(17,1,13,1,'004','2016-09-01 00:00:00','2016-12-11 00:00:00','morn');
/*!40000 ALTER TABLE `Section` ENABLE KEYS */;
UNLOCK TABLES;


LOCK TABLES `SectionUser` WRITE;
/*!40000 ALTER TABLE `SectionUser` DISABLE KEYS */;
INSERT INTO `SectionUser` (`SectionUserID`, `SectionID`, `UserID`, `UserRole`, `UserStatus`) VALUES (1,1,1,'Student','Active'),(2,1,3,'Student','Active'),(3,1,4,'Student','Inactive'),(4,1,69,'Student','Active'),(5,1,5,'Student','Active'),(6,6,69,'Student','Active'),(7,9,69,'Student','Active'),(8,3,1,'Student','Active'),(9,8,1,'Student','Active'),(10,7,1,'Student','Active'),(11,7,3,'Student','Active'),(12,7,4,'Student','Inactive'),(13,9,4,'Student','Inactive'),(14,16,69,'Student','Active'),(15,17,69,'Student','Active'),(16,3,4,'Student','Active'),(17,3,69,'Student','Active'),(18,3,3,'Student','Active'),(19,5,1,'Student','Active'),(20,5,3,'Student','Active'),(21,1,6,'Student','Active'),(22,1,7,'Student','Active'),(23,1,8,'Student','Active'),(24,1,9,'Student','Active'),(25,1,10,'Student','Active'),(26,1,11,'Student','Active'),(27,1,12,'Student','Active'),(28,1,13,'Student','Active'),(29,1,14,'Student','Active'),(30,1,15,'Student','Active'),(31,1,16,'Student','Active'),(32,1,17,'Student','Active'),(33,1,18,'Student','Active'),(34,1,19,'Student','Active');
/*!40000 ALTER TABLE `SectionUser` ENABLE KEYS */;
UNLOCK TABLES;


LOCK TABLES `Semester` WRITE;
/*!40000 ALTER TABLE `Semester` DISABLE KEYS */;
INSERT INTO `Semester` (`SemesterID`, `OrganizationID`, `Name`, `StartDate`, `EndDate`) VALUES (1,1,'Fall2016','2016-09-01 00:00:00','2016-12-11 00:00:00'),(2,1,'Spring2017','2017-01-15 00:00:00','2017-05-15 00:00:00'),(7,1,'Fall2019','2019-09-01 00:00:00','2019-12-09 00:00:00');
/*!40000 ALTER TABLE `Semester` ENABLE KEYS */;
UNLOCK TABLES;



LOCK TABLES `User` WRITE;
/*!40000 ALTER TABLE `User` DISABLE KEYS */;
INSERT INTO `User` (`UserID`, `UserContactID`, `UserName`, `FirstName`, `LastName`, `MiddleInitial`, `Suffix`, `OrganizationGroup`, `UserType`, `Admin`, `Country`, `City`, `ProfilePicture`) VALUES (1,1,'ajr42','Alan','Romano','J',NULL,NULL,'Instructor',1,NULL,NULL,NULL),(2,2,'qxl2','Jimmy','Lu','',NULL,NULL,'Instuctor',1,NULL,NULL,NULL),(3,3,'abc1','Emily','Smith','S',NULL,NULL,'Student',0,NULL,NULL,NULL),(4,4,'bcd1','Joe','Johnson','R',NULL,NULL,'Student',0,NULL,NULL,NULL),(5,5,'perna','Angelo','Perna','',NULL,NULL,'Instuctor',0,NULL,NULL,NULL),(6,6,'abc2','John','Smith',NULL,NULL,NULL,'Student',0,NULL,NULL,NULL),(7,7,'abc3','Sara','Thor','C',NULL,NULL,'Student',0,NULL,NULL,NULL),(8,8,'abc4','Ivan ','Merit','G',NULL,NULL,'Student',0,NULL,NULL,NULL),(9,9,'abc5','Sawyer','Murry','T',NULL,NULL,'Student',0,NULL,NULL,NULL),(10,10,'abc6','Kevin','Hart',NULL,NULL,NULL,'Student',0,NULL,NULL,NULL),(11,11,'abc7','Ryan','Johnson','M',NULL,NULL,'Student',0,NULL,NULL,NULL),(12,12,'abc8','Caitlyn','Cook','I',NULL,NULL,'Student',0,NULL,NULL,NULL),(13,13,'abc9','Carley','Cook',NULL,NULL,NULL,'Student',0,NULL,NULL,NULL),(14,14,'abc10','David','Davidson',NULL,NULL,NULL,'Student',0,NULL,NULL,NULL),(15,15,'abc11','Megan','Fox',NULL,NULL,NULL,'Student',0,NULL,NULL,NULL),(16,16,'abc12','Fred','Hudson',NULL,NULL,NULL,'Student',0,NULL,NULL,NULL),(17,17,'abc13','Olivia','Kwan',NULL,NULL,NULL,'Student',0,NULL,NULL,NULL),(18,18,'abc14','Peter','Pan',NULL,NULL,NULL,'Student',0,NULL,NULL,NULL),(19,19,'abc15','Spongebob',NULL,NULL,NULL,NULL,'Student',0,NULL,NULL,NULL),(69,69,'ka267','Krzysztof','Squarepant','',NULL,NULL,'Student',0,NULL,NULL,NULL);
/*!40000 ALTER TABLE `User` ENABLE KEYS */;
UNLOCK TABLES;


LOCK TABLES `UserContact` WRITE;
/*!40000 ALTER TABLE `UserContact` DISABLE KEYS */;
INSERT INTO `UserContact` (`UserContactID`, `Email`, `Phone`) VALUES (1,'ajr42','675-234-4853'),(2,'qxl2','534-134-3353'),(3,'abc1@njit.edu','535-124-1234'),(4,'bcd1@njit.edu','123-524-7653'),(5,'perna@njit.edu','123-524-2345'),(6,'abc2@njit.edu','123-524-2346'),(7,'abc3@njit.edu','123-524-2347'),(8,'abc4@njit.edu','123-524-2348'),(9,'abc5@njit.edu','123-524-2349'),(10,'abc6@njit.edu','123-524-2350'),(11,'abc7@njit.edu','123-524-2351'),(12,'abc8@njit.edu','123-524-2352'),(13,'abc9@njit.edu','123-524-2353'),(14,'abc10@njit.edu','123-524-2354'),(15,'abc11@njit.edu','123-524-2355'),(16,'abc12@njit.edu','123-524-2356'),(17,'abc13@njit.edu','123-524-2357'),(18,'abc14@njit.edu','123-524-2358'),(19,'abc15@njit.edu','123-524-2359'),(69,'ka267@njit.edu','069-069-6969'),(70,'\"ka267@njit.edu\"','XXX-XXX-XXXX'),(71,'aja38@njit.edu','XXX-XXX-XXXX');
/*!40000 ALTER TABLE `UserContact` ENABLE KEYS */;
UNLOCK TABLES;


LOCK TABLES `UserLogin` WRITE;
/*!40000 ALTER TABLE `UserLogin` DISABLE KEYS */;
INSERT INTO `UserLogin` (`UserID`, `Email`, `Password`, `Status`) VALUES (1,'ajr42@njit.edu','$argon2i$v=19$m=16384,t=4,p=2$GX1dBpKwn3C7Tjy0tmpwn9Bq1fiHMaqARHbk2LmoglPv/Q0eYvafG42k9LsftXzOrHP6QrAbHGb3gsfeiSuZqg$CWqBrqKU5LXToa5jEGcgJ2+w8jn8dGMIk2gEKgbKqvlHjpof842SOoz3Uq0jAuEz+957tyoQ6t463RR0YsGg3Q',NULL),(2,'qxl2@njit.edu','$argon2i$v=19$m=16384,t=4,p=2$W1WFKVNyaKFOQ/TogLGv+QTApAGZcXSIXCejB6RHE5dDm3lq/74W+RAPha+teGMOHaIWr2NL/nDvGYD5yaoWug$3z7s+XyksxD7Jwn3YciS5kqdHzXt+xth5ZtXfYR1E8sXz22JD/oJGu2p7AD2odtZ8n62xayn4arDwx7QQtYwmA',NULL),(3,'abc1@njit.edu','$argon2i$v=19$m=16384,t=4,p=2$6oCjo2zcGkhrXmZr1LDVGc5FWGT/bfkakEOp0S0bF3wAquOGgjn4lA/4cRxf3Zpoc7dIpvmC91uENVbtFEKIEw$DhLiDXcO7GPju8nKMv2CZ40OqQMVbMwsTAl5vyYmxSJfg+EzcglZft0pJFkEGorHy5HZ3OzLo/TJroyrYuKd8g',NULL),(4,'bcd1@njit.edu','$argon2i$v=19$m=16384,t=4,p=2$pbnL0Zwx8OD3oXDoR6bLb+iaBH6UHr17W+aTDt4H6yOvoOhyt1tmlMMnuNAuxHwxs6cYZbsyuiBXCMAHbc28oA$B89WmCNW2a748hkx6/KDMpPn4adSPannJOsUJstxQ456nO+fF5DV3RWluNxOZWiVst5Fhcb/3Dm/euGlRs0zSQ',NULL),(5,'perna@njit.edu','$argon2i$v=19$m=16384,t=4,p=2$mAwLPuvh5YYOdSj1mwzxitvyP7Vtyb/FJG2UGi7IQekFZQiIydI1Bzm8D/5mxmfI2EBUrTGkhYQ135SsLC6+Dg$cZ/i+qyvGkAixcAtrHO1CxvLl6j5MJ0FV3laH2VBOJASXDmgWKAdEi2vWUAwu3WmSQzb4E1W+K/BJI+szhAkvg',NULL),(6,'abc2@njit.edu','$argon2i$v=19$m=16384,t=4,p=2$KZJKZpWbjob7eqj2EuzS/WlEW3QaEoK50awT0TAUjFnaQN2vNb1Ud0wXwSrI5j5wL7d+nUCvm9Ve8Kbwa3fX8g$pDx8JpFqZNsTEL0UAe32CBKp5N05PdEjEontr3sVyFsGH2wb01fwwUosli77F1oHsNMw9mt7iSH2sKO7heiWeg',NULL),(7,'abc3@njit.edu','$argon2i$v=19$m=16384,t=4,p=2$pGPyqMGEbyElS9gRX7Rk6bpDgaTII6YOdTI2DXSsRDxmCMhPhsz+vyq46SgdAKDxGazuZvCWHUChIi4O/vAckg$OCUpGNSQ61Th527uRHN7hZfTlABvS2fPB9kAb3zF/KPObnjDearLchOOgWNZrEUrLMcAe90BzE/DuKiUe8wCgQ',NULL),(8,'abc4@njit.edu','$argon2i$v=19$m=16384,t=4,p=2$CD/xWWTvH5GMMqKEMFAD7CMgMs2HEA2G01HzbrgQyseWvWlGLPjFYojDAgpTOkqlTr0TiWTDE+k5YCCb8hvN+w$JRybkfjBj16HTN97UfNHYoS0aqHWmuxYPaTvSw3KJ+q9cu4lrgoqtf3m56pxbSYANLjxX6RaTh7HZnjjqt6PuA',NULL),(9,'abc5@njit.edu','$argon2i$v=19$m=16384,t=4,p=2$oXPqC6/24kfJkeoujdgB83jdKJrd9pHBbB4YA/QS8R/Dh8KQDrB4EoeQZNCGonfWevEkOoY7FlxxSzxZ+MtWyw$Ao7AxrUoeScW1o3+cNYmazwSsBu38jChy2I9Z0ZR+ltI9cTFYWYPSxee3cHvNy2ziGgf2O99KfiMBhAYC8iNpA',NULL),(10,'abc6@njit.edu','$argon2i$v=19$m=16384,t=4,p=2$hrXM0u69ZS3XOWY3rImXsrKpOLhD//HZAnH3X1rvAYK4XNjB9eS6vudN1kJMeFkija4PR9wRxtZ06XRzoLSm/A$q8lsOXRpA+Ze3FBFxzHQqKYG2i8GSkAh+C3gG+/ZUV8/XVymfDNbVm9pZizaU1NbmXI+tpMj/LFezl0o/xt5YQ',NULL),(11,'abc7@njit.edu','$argon2i$v=19$m=16384,t=4,p=2$6herGd/RqrW614aSDuyhsk5s3mynm1rOd6wUYHLd2YApIoHVGMsQQ204uY6IDjW5GrNcJnxs7UV/6jd3Qh/yMg$t/n0lRZWUIL0qogPn1OeKfg6PK+m+6yl4COa2uRynfg9QA1Yjkp+I3X4dvjuQmD1YdI8Qbiee5qk2znBaeMclg',NULL),(12,'abc8@njit.edu','$argon2i$v=19$m=16384,t=4,p=2$qxB1ZiJZ+WvtuJUCISYmO2DTD41XS5lsoOMT4E8z4bcKDsCic/74jfOMaysLzfmkdbpGpz7+XJBbycOvq6uweA$rom0Sem+HOMouEKfDZ3x7WXs06/B2dMV9e83VJmD80OwEc2Kb+ZqM0ZvXnDDpwEzakOdEQJT2rsKVQ8I/Nd/9w',NULL),(13,'abc9@njit.edu','$argon2i$v=19$m=16384,t=4,p=2$KKNxr8igpIZ4zVfEgWZv9bL2EltporHLE8hIUtNBYEx4/yO2KzoJKdYOvKXETnd+qx34Y/loVSmJYtSuYVKUIg$B42ymYPMzM4k9ycwEZ3bqnbceLnxdiyGvhldmhjdCIPxCycWfLIFesGJr7s1fGbXzKSX1LPShFaN6sVxAzOL2Q',NULL),(14,'abc10@njit.edu','$argon2i$v=19$m=16384,t=4,p=2$uxm8ECi1yXmI+fz9+9TfZPeG+Z2rt1GJexMWUopwZIjgNyChL4YigSg/OjoCIrkeI22E6x/0CyHycv5T2aF7UQ$Abe7GWC+ZHuCUpPIF38YpTAJgJH49C3u6QXH9Or2N2GPqzNNL19i+jNBt101bKtO7qpEBX4bbx2BZoqrm8SY4w',NULL),(15,'abc11@njit.edu','$argon2i$v=19$m=16384,t=4,p=2$3P4lP+gW5vk9hmQOjmNI1H0Wy5StYrRnCpuCcWonA3P7ot744FZnSWRlcqsHm1Vap72QbzYNuCGhmoikGryQuw$gYYqVkIl2mfSPm5YzmkQPipIKKOmNvTG+HVCV/yIcJfK7mUS6G2G0+6pVJ5GPgiOnZLdy39r39PEybqyMjmrcQ',NULL),(16,'abc12@njit.edu','$argon2i$v=19$m=16384,t=4,p=2$mw7qzaUtdNcm8glOzNnXcfCSl18Bu1h+Ygx/bJxhoG69BVZb6O1laphG/NyNsL1adJgey/VVVRZmwftiW/q5yg$CwGWRE7kvBF1Bnr/K/sccUTNyU6YzVl0BgVUVHcLAXCFA6IUE+g4dz5Lyp1vXx2Mwr+E2ahcztXlOUB7+nEwMQ',NULL),(17,'abc13@njit.edu','$argon2i$v=19$m=16384,t=4,p=2$4nQfnc0JFmytCV1J/Xd2Srr2tw6/VnlgMtHbiQrTI6qtshSIzc9fWuWe46y56dxu++T90V4TT2JJ2NpcDGFmXQ$H4wZ8Z+ABS2ptAhTv6wBdjAZC8zd8urJaP/qIXgDOh8dWNsoDZ9vz/wbsjDd2wEITq0qBeew9Dlpjf7+V/bK6w',NULL),(18,'abc14@njit.edu','$argon2i$v=19$m=16384,t=4,p=2$QJ0rCObMrIs4osCu+dTsk1/J3qSInaRRyZkwoXtgmAHiBIp64URW+EFgS0FNxvhetxst5QbL8j9jVg4m6uD6KA$7r5COECa/duCL0NkMkyuWM5vSnVfceNc1bD1nSfGn983Yx3dgknXbdm33dIItWlbVfQLITB42/DPLx+YAU2Swg',NULL),(19,'abc15@njit.edu','$argon2i$v=19$m=16384,t=4,p=2$fVdSAWLRLaNjCl5xYm1Rmjds8wnom7EYQh8nE0VXg0AKRvdFLdID9DVecTne7bo3urH2L+QumWzCLIrUoZysTA$UYm3hLNuZYmk5lpHkONaEmD6kCN9kxv8+oBN2Po2wDtXWuu/U9nKgLSDZid+PdWpUgHcrqP1FwOYc+Dmcmc7Cg',NULL),(20,'abc16@njit.edu','$argon2i$v=19$m=16384,t=4,p=2$Tj62RffkwTjPJcF4CfaMfVJMG+dZzn0HhS61kVGqUISDETt7OQmujQQHf5BJvPkwd/tszl1cB5eOMKWXp+l0nQ$sfHMd07iNX8HC8WYg5ukUqpjzhaKAr2MMxW+P1IjZzO1Mjcp5r4t2FpKaCii2X+QpLk66SdfpxLLPxO3gZs/bg',NULL),(69,'ka267@njit.edu','$argon2i$v=19$m=16384,t=4,p=2$Tj62RffkwTjPJcF4CfaMfVJMG+dZzn0HhS61kVGqUISDETt7OQmujQQHf5BJvPkwd/tszl1cB5eOMKWXp+l0nQ$sfHMd07iNX8HC8WYg5ukUqpjzhaKAr2MMxW+P1IjZzO1Mjcp5r4t2FpKaCii2X+QpLk66SdfpxLLPxO3gZs/bg',NULL);
/*!40000 ALTER TABLE `UserLogin` ENABLE KEYS */;
UNLOCK TABLES;


/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2017-04-19 18:22:39
