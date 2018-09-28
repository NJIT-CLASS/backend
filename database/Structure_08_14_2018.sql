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
  UNIQUE KEY `Assignment_AssignmentID_unique` (`AssignmentID`),
  KEY `CourseID` (`CourseID`),
  CONSTRAINT `Assignment_ibfk_1` FOREIGN KEY (`CourseID`) REFERENCES `course` (`CourseID`) ON DELETE NO ACTION ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=latin1;

CREATE TABLE `assignmentgrade` (
  `AssignmentGradeID` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `AssignmentInstanceID` int(10) unsigned NOT NULL,
  `SectionUserID` int(10) unsigned NOT NULL,
  `Grade` float unsigned NOT NULL,
  `Comments` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`AssignmentGradeID`),
  UNIQUE KEY `AssignmentGradeID` (`AssignmentGradeID`),
  UNIQUE KEY `AssignmentGrade_AssignmentGradeID_unique` (`AssignmentGradeID`),
  UNIQUE KEY `ai_SectionUserId_unq_idx` (`AssignmentInstanceID`,`SectionUserID`),
  KEY `SectionUserID` (`SectionUserID`),
  CONSTRAINT `AssignmentGrade_ibfk_1` FOREIGN KEY (`AssignmentInstanceID`) REFERENCES `assignmentinstance` (`AssignmentInstanceID`) ON DELETE NO ACTION ON UPDATE CASCADE,
  CONSTRAINT `AssignmentGrade_ibfk_2` FOREIGN KEY (`SectionUserID`) REFERENCES `sectionuser` (`SectionUserID`) ON DELETE NO ACTION ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

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
  CONSTRAINT `AssignmentInstance_ibfk_1` FOREIGN KEY (`AssignmentID`) REFERENCES `assignment` (`AssignmentID`) ON DELETE NO ACTION ON UPDATE CASCADE,
  CONSTRAINT `AssignmentInstance_ibfk_2` FOREIGN KEY (`SectionID`) REFERENCES `section` (`SectionID`) ON DELETE NO ACTION ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=32 DEFAULT CHARSET=latin1;

CREATE TABLE `badge` (
  `BadgeID` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `CategoryID` int(10) unsigned NOT NULL,
  `Name` varchar(255) NOT NULL,
  `Description` text,
  `Logo` varchar(255) NOT NULL,
  PRIMARY KEY (`BadgeID`),
  UNIQUE KEY `BadgeID` (`BadgeID`),
  UNIQUE KEY `Badge_BadgeID_unique` (`BadgeID`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

CREATE TABLE `badgeinstance` (
  `BadgeInstanceID` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `BadgeID` int(10) unsigned NOT NULL,
  `CategoryInstanceID` int(10) unsigned NOT NULL,
  PRIMARY KEY (`BadgeInstanceID`),
  UNIQUE KEY `BadgeInstanceID` (`BadgeInstanceID`),
  UNIQUE KEY `BadgeInstance_BadgeInstanceID_unique` (`BadgeInstanceID`),
  KEY `BadgeID` (`BadgeID`),
  CONSTRAINT `BadgeInstance_ibfk_1` FOREIGN KEY (`BadgeID`) REFERENCES `badge` (`BadgeID`) ON DELETE NO ACTION ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

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
  UNIQUE KEY `CategoryID` (`CategoryID`),
  UNIQUE KEY `Category_CategoryID_unique` (`CategoryID`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=latin1;

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
  UNIQUE KEY `CategoryInstance_CategoryInstanceID_unique` (`CategoryInstanceID`),
  CONSTRAINT `CategoryInstance_ibfk_1` FOREIGN KEY (`CategoryInstanceID`) REFERENCES `category` (`CategoryID`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=latin1;

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
  PRIMARY KEY (`CommentsID`),
  UNIQUE KEY `CommentsID` (`CommentsID`),
  KEY `UserID` (`UserID`),
  KEY `AssignmentInstanceID` (`AssignmentInstanceID`),
  CONSTRAINT `comments_ibfk_1` FOREIGN KEY (`UserID`) REFERENCES `user` (`UserID`) ON DELETE NO ACTION ON UPDATE CASCADE,
  CONSTRAINT `comments_ibfk_2` FOREIGN KEY (`AssignmentInstanceID`) REFERENCES `assignmentinstance` (`AssignmentInstanceID`) ON DELETE NO ACTION ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=314 DEFAULT CHARSET=latin1;

CREATE TABLE `commentsarchive` (
  `CommentsArchiveID` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `CommentsID` int(10) unsigned DEFAULT NULL,
  `UserID` int(10) unsigned NOT NULL,
  `TargetID` int(10) unsigned NOT NULL,
  `CommentTarget` varchar(255) DEFAULT NULL,
  `AssignmentInstanceID` int(10) unsigned DEFAULT NULL,
  `TaskInstanceID` int(10) unsigned DEFAULT NULL,
  `Type` varchar(255) DEFAULT NULL,
  `CommentsText` varchar(255) DEFAULT NULL,
  `Rating` int(10) unsigned DEFAULT NULL,
  `Flag` int(10) unsigned DEFAULT NULL,
  `Status` varchar(255) DEFAULT NULL,
  `Label` varchar(255) DEFAULT NULL,
  `ReplyLevel` int(10) unsigned DEFAULT NULL,
  `Parents` int(10) unsigned DEFAULT NULL,
  `Delete` int(10) unsigned DEFAULT NULL,
  `Time` datetime DEFAULT NULL,
  `Complete` int(10) unsigned DEFAULT NULL,
  PRIMARY KEY (`CommentsArchiveID`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

CREATE TABLE `commentsviewed` (
  `CommentsViewedID` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `CommentsID` int(10) unsigned DEFAULT NULL,
  `UserID` int(10) unsigned DEFAULT NULL,
  `Time` datetime DEFAULT NULL,
  PRIMARY KEY (`CommentsViewedID`)
) ENGINE=InnoDB AUTO_INCREMENT=1071 DEFAULT CHARSET=latin1;

CREATE TABLE `contact` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `UserID` int(10) unsigned NOT NULL,
  `Email` varchar(70) DEFAULT NULL,
  `FirstName` varchar(40) DEFAULT NULL,
  `LastName` varchar(40) DEFAULT NULL,
  `Global` int(10) unsigned DEFAULT NULL,
  `OrganizationGroup` json DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `Email` (`Email`),
  UNIQUE KEY `Contact_Email_unique` (`Email`),
  KEY `UserID` (`UserID`),
  CONSTRAINT `Contact_ibfk_1` FOREIGN KEY (`UserID`) REFERENCES `user` (`UserID`) ON DELETE NO ACTION ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

CREATE TABLE `course` (
  `CourseID` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `Number` varchar(50) NOT NULL,
  `Name` varchar(150) NOT NULL,
  `OrganizationID` int(10) unsigned NOT NULL,
  `CreatorID` int(10) unsigned NOT NULL,
  `Description` text,
  PRIMARY KEY (`CourseID`),
  UNIQUE KEY `CourseID` (`CourseID`),
  UNIQUE KEY `Course_CourseID_unique` (`CourseID`),
  KEY `CreatorID` (`CreatorID`),
  CONSTRAINT `Course_ibfk_1` FOREIGN KEY (`CreatorID`) REFERENCES `user` (`UserID`) ON DELETE NO ACTION ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=latin1;

CREATE TABLE `emailnotification` (
  `EmailNotificationID` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `TaskInstanceID` int(10) unsigned DEFAULT NULL,
  PRIMARY KEY (`EmailNotificationID`),
  UNIQUE KEY `EmailNotificationID` (`EmailNotificationID`),
  UNIQUE KEY `EmailNotification_EmailNotificationID_unique` (`EmailNotificationID`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

CREATE TABLE `extracredit` (
  `SectionUserID` int(10) unsigned NOT NULL,
  `Points` int(10) unsigned NOT NULL DEFAULT '1',
  PRIMARY KEY (`SectionUserID`),
  UNIQUE KEY `SectionUserID` (`SectionUserID`),
  UNIQUE KEY `ExtraCredit_SectionUserID_unique` (`SectionUserID`),
  CONSTRAINT `ExtraCredit_ibfk_1` FOREIGN KEY (`SectionUserID`) REFERENCES `sectionuser` (`SectionUserID`) ON DELETE NO ACTION ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

CREATE TABLE `filereference` (
  `FileID` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `UserID` int(10) unsigned NOT NULL,
  `Info` json DEFAULT NULL,
  `LastUpdated` datetime DEFAULT NULL,
  PRIMARY KEY (`FileID`),
  UNIQUE KEY `FileID` (`FileID`),
  UNIQUE KEY `FileReference_FileID_unique` (`FileID`),
  KEY `UserID` (`UserID`),
  CONSTRAINT `FileReference_ibfk_1` FOREIGN KEY (`UserID`) REFERENCES `user` (`UserID`) ON DELETE NO ACTION ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=70 DEFAULT CHARSET=latin1;

CREATE TABLE `goal` (
  `GoalID` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `Name` varchar(255) DEFAULT NULL,
  `Description` text,
  `CategoryID` int(10) unsigned NOT NULL,
  `ThresholdInstances` int(10) unsigned NOT NULL,
  `Logo` varchar(255) DEFAULT NULL,
  `LogoAchieved` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`GoalID`),
  UNIQUE KEY `GoalID` (`GoalID`),
  UNIQUE KEY `Goal_GoalID_unique` (`GoalID`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

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
  UNIQUE KEY `GoalInstance_GoalInstanceID_unique` (`GoalInstanceID`),
  KEY `GoalID` (`GoalID`),
  CONSTRAINT `GoalInstance_ibfk_1` FOREIGN KEY (`GoalID`) REFERENCES `goal` (`GoalID`) ON DELETE NO ACTION ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

CREATE TABLE `groups` (
  `GroupID` int(10) unsigned NOT NULL,
  `SectionID` int(10) unsigned NOT NULL,
  `Name` varchar(30) DEFAULT NULL,
  `Leader` int(10) unsigned DEFAULT NULL,
  `List` blob,
  PRIMARY KEY (`GroupID`),
  UNIQUE KEY `GroupID` (`GroupID`),
  UNIQUE KEY `Groups_GroupID_unique` (`GroupID`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

CREATE TABLE `groupuser` (
  `GroupID` int(10) unsigned NOT NULL,
  `UserID` int(10) unsigned NOT NULL,
  `Role` int(11) NOT NULL,
  `Status` varchar(255) NOT NULL,
  PRIMARY KEY (`GroupID`),
  KEY `UserID` (`UserID`),
  CONSTRAINT `GroupUser_ibfk_1` FOREIGN KEY (`UserID`) REFERENCES `user` (`UserID`) ON DELETE NO ACTION ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

CREATE TABLE `level` (
  `LevelID` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `Name` varchar(255) NOT NULL,
  `Description` varchar(255) DEFAULT NULL,
  `ThresholdPoints` int(10) unsigned NOT NULL,
  PRIMARY KEY (`LevelID`),
  UNIQUE KEY `LevelID` (`LevelID`),
  UNIQUE KEY `Level_LevelID_unique` (`LevelID`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

CREATE TABLE `levelinstance` (
  `LevelInstanceID` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `LevelID` int(10) unsigned NOT NULL,
  `SemesterID` int(10) unsigned NOT NULL,
  `SectionID` int(10) unsigned NOT NULL,
  `CourseID` int(10) unsigned NOT NULL,
  `ThresholdPoints` int(10) unsigned NOT NULL,
  PRIMARY KEY (`LevelInstanceID`),
  UNIQUE KEY `LevelInstanceID` (`LevelInstanceID`),
  UNIQUE KEY `LevelInstance_LevelInstanceID_unique` (`LevelInstanceID`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

CREATE TABLE `notifications` (
  `NotificationsID` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `NotificationTarget` varchar(40) DEFAULT NULL,
  `UserID` varchar(40) DEFAULT NULL,
  `TargetID` varchar(40) DEFAULT NULL,
  `OriginTaskInstanceID` varchar(40) DEFAULT NULL,
  `Info` varchar(40) DEFAULT NULL,
  `Dismiss` tinyint(1) DEFAULT NULL,
  `Time` datetime DEFAULT NULL,
  `DismissType` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`NotificationsID`)
) ENGINE=InnoDB AUTO_INCREMENT=523 DEFAULT CHARSET=latin1;

CREATE TABLE `organization` (
  `OrganizationID` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `Name` varchar(40) DEFAULT NULL,
  `Logo` json DEFAULT NULL,
  PRIMARY KEY (`OrganizationID`),
  UNIQUE KEY `OrganizationID` (`OrganizationID`),
  UNIQUE KEY `Organization_OrganizationID_unique` (`OrganizationID`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=latin1;

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
  CONSTRAINT `PartialAssignments_ibfk_1` FOREIGN KEY (`UserID`) REFERENCES `user` (`UserID`) ON DELETE NO ACTION ON UPDATE CASCADE,
  CONSTRAINT `PartialAssignments_ibfk_2` FOREIGN KEY (`CourseID`) REFERENCES `course` (`CourseID`) ON DELETE NO ACTION ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=latin1;

CREATE TABLE `resetpasswordrequest` (
  `UserID` int(10) unsigned NOT NULL,
  `RequestHash` varchar(255) NOT NULL,
  PRIMARY KEY (`UserID`,`RequestHash`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

CREATE TABLE `section` (
  `SectionID` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `SemesterID` int(10) unsigned NOT NULL,
  `CourseID` int(10) unsigned NOT NULL,
  `Name` varchar(100) NOT NULL,
  `Description` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`SectionID`),
  UNIQUE KEY `SectionID` (`SectionID`),
  UNIQUE KEY `Section_SectionID_unique` (`SectionID`),
  KEY `SemesterID` (`SemesterID`),
  KEY `CourseID` (`CourseID`),
  CONSTRAINT `Section_ibfk_1` FOREIGN KEY (`SemesterID`) REFERENCES `semester` (`SemesterID`) ON DELETE NO ACTION ON UPDATE CASCADE,
  CONSTRAINT `Section_ibfk_2` FOREIGN KEY (`CourseID`) REFERENCES `course` (`CourseID`) ON DELETE NO ACTION ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=23 DEFAULT CHARSET=latin1;

CREATE TABLE `sectionranksnapchot` (
  `SectionRankSnapchatID` int(10) unsigned NOT NULL AUTO_INCREMENT,
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
  PRIMARY KEY (`SectionRankSnapchatID`),
  UNIQUE KEY `SectionRankSnapchatID` (`SectionRankSnapchatID`),
  UNIQUE KEY `SectionRankSnapchot_SectionRankSnapchatID_unique` (`SectionRankSnapchatID`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

CREATE TABLE `sectionuser` (
  `SectionUserID` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `SectionID` int(10) unsigned NOT NULL,
  `UserID` int(10) unsigned NOT NULL,
  `Role` varchar(30) NOT NULL DEFAULT 'Student',
  `Active` tinyint(1) NOT NULL DEFAULT '1',
  `Volunteer` varchar(20) DEFAULT '0',
  PRIMARY KEY (`SectionUserID`),
  UNIQUE KEY `SectionUserID` (`SectionUserID`),
  UNIQUE KEY `SectionUser_SectionUserID_unique` (`SectionUserID`),
  KEY `SectionID` (`SectionID`),
  KEY `UserID` (`UserID`),
  CONSTRAINT `SectionUser_ibfk_1` FOREIGN KEY (`SectionID`) REFERENCES `section` (`SectionID`) ON DELETE NO ACTION ON UPDATE CASCADE,
  CONSTRAINT `SectionUser_ibfk_2` FOREIGN KEY (`UserID`) REFERENCES `userlogin` (`UserID`) ON DELETE NO ACTION ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=119 DEFAULT CHARSET=latin1;

CREATE TABLE `sectionuserrecord` (
  `SectionUserID` int(10) unsigned NOT NULL,
  `LevelInstanceID` int(10) unsigned NOT NULL,
  `SectionID` int(10) unsigned NOT NULL,
  `Title` varchar(50) NOT NULL,
  `Level` int(10) unsigned DEFAULT '1',
  `Exp` int(10) unsigned DEFAULT '0',
  `ThresholdPoints` int(10) unsigned NOT NULL,
  `AvailablePoints` int(10) unsigned NOT NULL DEFAULT '0',
  `UsedPoints` int(10) unsigned DEFAULT '0',
  `PlusPoint` int(10) unsigned DEFAULT '0',
  `GoalInstances` json NOT NULL,
  PRIMARY KEY (`SectionUserID`),
  UNIQUE KEY `SectionUserID` (`SectionUserID`),
  UNIQUE KEY `SectionUserRecord_SectionUserID_unique` (`SectionUserID`),
  KEY `LevelInstanceID` (`LevelInstanceID`),
  CONSTRAINT `SectionUserRecord_ibfk_1` FOREIGN KEY (`SectionUserID`) REFERENCES `sectionuser` (`SectionUserID`) ON DELETE NO ACTION ON UPDATE CASCADE,
  CONSTRAINT `SectionUserRecord_ibfk_2` FOREIGN KEY (`LevelInstanceID`) REFERENCES `levelinstance` (`LevelInstanceID`) ON DELETE NO ACTION ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

CREATE TABLE `semester` (
  `SemesterID` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `OrganizationID` int(10) unsigned NOT NULL,
  `Name` varchar(25) DEFAULT NULL,
  `StartDate` date DEFAULT NULL,
  `EndDate` date DEFAULT NULL,
  PRIMARY KEY (`SemesterID`),
  UNIQUE KEY `SemesterID` (`SemesterID`),
  UNIQUE KEY `Semester_SemesterID_unique` (`SemesterID`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=latin1;

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
  UNIQUE KEY `StudentRankSnapchotID` (`StudentRankSnapchotID`),
  UNIQUE KEY `StudentRankSnapchot_StudentrRankSnapchotID_unique` (`StudentRankSnapchotID`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

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
  UNIQUE KEY `StudentrRankSnapchotID` (`StudentrRankSnapchotID`),
  UNIQUE KEY `StudentrRankSnapchot_StudentrRankSnapchotID_unique` (`StudentrRankSnapchotID`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

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
  UNIQUE KEY `TaskActivity_TaskActivityID_unique` (`TaskActivityID`),
  KEY `WorkflowActivityID` (`WorkflowActivityID`),
  KEY `AssignmentID` (`AssignmentID`),
  KEY `AssignmentInstanceID` (`AssignmentInstanceID`),
  CONSTRAINT `TaskActivity_ibfk_1` FOREIGN KEY (`WorkflowActivityID`) REFERENCES `workflowactivity` (`WorkflowActivityID`) ON DELETE NO ACTION ON UPDATE CASCADE,
  CONSTRAINT `TaskActivity_ibfk_2` FOREIGN KEY (`AssignmentID`) REFERENCES `assignment` (`AssignmentID`) ON DELETE NO ACTION ON UPDATE CASCADE,
  CONSTRAINT `TaskActivity_ibfk_3` FOREIGN KEY (`AssignmentInstanceID`) REFERENCES `assignmentinstance` (`AssignmentInstanceID`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=131 DEFAULT CHARSET=latin1;

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
  UNIQUE KEY `TaskGrade_TaskGradeID_unique` (`TaskGradeID`),
  UNIQUE KEY `ti_SectionUserId_unq_idx` (`TaskInstanceID`,`SectionUserID`),
  KEY `SectionUserID` (`SectionUserID`),
  KEY `WorkflowActivityID` (`WorkflowActivityID`),
  CONSTRAINT `TaskGrade_ibfk_1` FOREIGN KEY (`TaskInstanceID`) REFERENCES `taskinstance` (`TaskInstanceID`) ON DELETE NO ACTION ON UPDATE CASCADE,
  CONSTRAINT `TaskGrade_ibfk_2` FOREIGN KEY (`SectionUserID`) REFERENCES `sectionuser` (`SectionUserID`) ON DELETE NO ACTION ON UPDATE CASCADE,
  CONSTRAINT `TaskGrade_ibfk_3` FOREIGN KEY (`WorkflowActivityID`) REFERENCES `workflowactivity` (`WorkflowActivityID`) ON DELETE NO ACTION ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=24 DEFAULT CHARSET=latin1;

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
  UNIQUE KEY `TaskInstance_TaskInstanceID_unique` (`TaskInstanceID`),
  KEY `UserID` (`UserID`),
  KEY `TaskActivityID` (`TaskActivityID`),
  KEY `WorkflowInstanceID` (`WorkflowInstanceID`),
  KEY `AssignmentInstanceID` (`AssignmentInstanceID`),
  CONSTRAINT `TaskInstance_ibfk_1` FOREIGN KEY (`UserID`) REFERENCES `user` (`UserID`) ON DELETE NO ACTION ON UPDATE CASCADE,
  CONSTRAINT `TaskInstance_ibfk_2` FOREIGN KEY (`TaskActivityID`) REFERENCES `taskactivity` (`TaskActivityID`) ON DELETE NO ACTION ON UPDATE CASCADE,
  CONSTRAINT `TaskInstance_ibfk_3` FOREIGN KEY (`WorkflowInstanceID`) REFERENCES `workflowinstance` (`WorkflowInstanceID`) ON DELETE NO ACTION ON UPDATE CASCADE,
  CONSTRAINT `TaskInstance_ibfk_4` FOREIGN KEY (`AssignmentInstanceID`) REFERENCES `assignmentinstance` (`AssignmentInstanceID`) ON DELETE NO ACTION ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2559 DEFAULT CHARSET=latin1;

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
  UNIQUE KEY `TaskSimpleGrade_TaskSimpleGradeID_unique` (`TaskSimpleGradeID`),
  UNIQUE KEY `ti_SectionUserId_unq_idx` (`TaskInstanceID`,`SectionUserID`),
  KEY `SectionUserID` (`SectionUserID`),
  KEY `WorkflowActivityID` (`WorkflowActivityID`),
  CONSTRAINT `TaskSimpleGrade_ibfk_1` FOREIGN KEY (`TaskInstanceID`) REFERENCES `taskinstance` (`TaskInstanceID`) ON DELETE NO ACTION ON UPDATE CASCADE,
  CONSTRAINT `TaskSimpleGrade_ibfk_2` FOREIGN KEY (`SectionUserID`) REFERENCES `sectionuser` (`SectionUserID`) ON DELETE NO ACTION ON UPDATE CASCADE,
  CONSTRAINT `TaskSimpleGrade_ibfk_3` FOREIGN KEY (`WorkflowActivityID`) REFERENCES `workflowactivity` (`WorkflowActivityID`) ON DELETE NO ACTION ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=167 DEFAULT CHARSET=latin1;

CREATE TABLE `user` (
  `UserID` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `FirstName` varchar(40) DEFAULT NULL,
  `LastName` varchar(40) DEFAULT NULL,
  `Instructor` tinyint(1) NOT NULL DEFAULT '0',
  `Admin` tinyint(1) NOT NULL DEFAULT '0',
  `OrganizationGroup` json DEFAULT NULL,
  PRIMARY KEY (`UserID`),
  UNIQUE KEY `UserID` (`UserID`),
  UNIQUE KEY `User_UserID_unique` (`UserID`)
) ENGINE=InnoDB AUTO_INCREMENT=114 DEFAULT CHARSET=latin1;

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
  UNIQUE KEY `UserBadgeInstances_UserBadgeInstanceID_unique` (`UserBadgeInstanceID`),
  UNIQUE KEY `UserBadgeInstances_UserID_BadgeInstanceID_unique` (`UserID`,`BadgeInstanceID`),
  KEY `BadgeInstanceID` (`BadgeInstanceID`),
  CONSTRAINT `UserBadgeInstances_ibfk_1` FOREIGN KEY (`UserID`) REFERENCES `user` (`UserID`) ON DELETE NO ACTION ON UPDATE CASCADE,
  CONSTRAINT `UserBadgeInstances_ibfk_2` FOREIGN KEY (`BadgeInstanceID`) REFERENCES `badgeinstance` (`BadgeInstanceID`) ON DELETE NO ACTION ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

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
  UNIQUE KEY `UserContact_Email_unique` (`Email`),
  CONSTRAINT `UserContact_ibfk_1` FOREIGN KEY (`UserID`) REFERENCES `user` (`UserID`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

CREATE TABLE `userlogin` (
  `UserID` int(10) unsigned NOT NULL,
  `Email` varchar(70) NOT NULL,
  `Password` varchar(255) NOT NULL,
  `Pending` tinyint(1) NOT NULL DEFAULT '1',
  `Attempts` int(10) unsigned NOT NULL DEFAULT '0',
  `Timeout` datetime DEFAULT NULL,
  `Blocked` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`UserID`),
  UNIQUE KEY `Email` (`Email`),
  UNIQUE KEY `UserLogin_Email_unique` (`Email`),
  CONSTRAINT `UserLogin_ibfk_1` FOREIGN KEY (`UserID`) REFERENCES `user` (`UserID`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

CREATE TABLE `userpointinstances` (
  `UserPointInstanceID` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `UserID` int(10) unsigned NOT NULL,
  `CategoryInstanceID` int(10) unsigned NOT NULL,
  `PointInstances` int(10) unsigned NOT NULL,
  PRIMARY KEY (`UserPointInstanceID`),
  UNIQUE KEY `UserPointInstanceID` (`UserPointInstanceID`),
  UNIQUE KEY `UserPointInstances_UserPointInstanceID_unique` (`UserPointInstanceID`),
  KEY `UserID` (`UserID`),
  CONSTRAINT `UserPointInstances_ibfk_1` FOREIGN KEY (`UserID`) REFERENCES `user` (`UserID`) ON DELETE NO ACTION ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=latin1;

CREATE TABLE `volunteerpool` (
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
  CONSTRAINT `VolunteerPool_ibfk_1` FOREIGN KEY (`UserID`) REFERENCES `user` (`UserID`) ON DELETE NO ACTION ON UPDATE CASCADE,
  CONSTRAINT `VolunteerPool_ibfk_2` FOREIGN KEY (`SectionID`) REFERENCES `section` (`SectionID`) ON DELETE NO ACTION ON UPDATE CASCADE,
  CONSTRAINT `VolunteerPool_ibfk_3` FOREIGN KEY (`AssignmentInstanceID`) REFERENCES `assignmentinstance` (`AssignmentInstanceID`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=424 DEFAULT CHARSET=latin1;

CREATE TABLE `workflowactivity` (
  `WorkflowActivityID` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `AssignmentID` int(10) unsigned NOT NULL,
  `TaskActivityCollection` json DEFAULT NULL,
  `Name` varchar(30) DEFAULT NULL,
  `Type` varchar(40) DEFAULT NULL,
  `GradeDistribution` json DEFAULT NULL,
  `NumberOfSets` int(10) unsigned DEFAULT NULL,
  `Documentation` varchar(100) DEFAULT NULL,
  `Groupsize` int(10) unsigned DEFAULT '1',
  `StartTaskActivity` json DEFAULT NULL,
  `WorkflowStructure` json DEFAULT NULL,
  `VersionHistory` json DEFAULT NULL,
  PRIMARY KEY (`WorkflowActivityID`),
  UNIQUE KEY `WorkflowActivityID` (`WorkflowActivityID`),
  UNIQUE KEY `WorkflowActivity_WorkflowActivityID_unique` (`WorkflowActivityID`),
  KEY `AssignmentID` (`AssignmentID`),
  CONSTRAINT `WorkflowActivity_ibfk_1` FOREIGN KEY (`AssignmentID`) REFERENCES `assignment` (`AssignmentID`) ON DELETE NO ACTION ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=latin1;

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
  UNIQUE KEY `wf_SectionUserId_unq_idx` (`WorkflowActivityID`,`SectionUserID`),
  KEY `SectionUserID` (`SectionUserID`),
  KEY `AssignmentInstanceID` (`AssignmentInstanceID`),
  CONSTRAINT `WorkflowGrade_ibfk_1` FOREIGN KEY (`WorkflowActivityID`) REFERENCES `workflowactivity` (`WorkflowActivityID`) ON DELETE NO ACTION ON UPDATE CASCADE,
  CONSTRAINT `WorkflowGrade_ibfk_2` FOREIGN KEY (`SectionUserID`) REFERENCES `sectionuser` (`SectionUserID`) ON DELETE NO ACTION ON UPDATE CASCADE,
  CONSTRAINT `WorkflowGrade_ibfk_3` FOREIGN KEY (`AssignmentInstanceID`) REFERENCES `assignmentinstance` (`AssignmentInstanceID`) ON DELETE NO ACTION ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=latin1;

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
  CONSTRAINT `WorkflowInstance_ibfk_1` FOREIGN KEY (`WorkflowActivityID`) REFERENCES `workflowactivity` (`WorkflowActivityID`) ON DELETE NO ACTION ON UPDATE CASCADE,
  CONSTRAINT `WorkflowInstance_ibfk_2` FOREIGN KEY (`AssignmentInstanceID`) REFERENCES `assignmentinstance` (`AssignmentInstanceID`) ON DELETE NO ACTION ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=290 DEFAULT CHARSET=latin1;
