CREATE PROCEDURE `addUserToSection`(
	IN $FirstName varchar(255),
    IN $LastName varchar(255),
    IN $Instructor int,
    IN $Admin int,
    IN $Role varchar(255),
    IN $Email varchar(255),
    IN $Phone varchar(255),
    IN $Password varchar(255),
    IN $Pending int,
    IN $SectionID int,
    IN $Active int,
    IN $Volunteer int,
    IN $SectionRole varchar(255)
    )
BEGIN
	DECLARE $userID int;
    DECLARE $newUser int;
    DECLARE $sectionUserID int;
    
	SET $newUser = 0;
	START TRANSACTION;
    SET FOREIGN_KEY_CHECKS = 0;
    SET $userID = (SELECT UserID FROM userlogin WHERE Email = $Email);
    
    IF $userID IS null THEN
		SET $newUser = 1;
        INSERT INTO user(FirstName, LastName, Instructor, Admin, Role)
		VALUES ($FirstName, $LastName, $Instructor, $Admin, $Role);
	
		SET $userID = LAST_INSERT_ID();
		
		INSERT INTO usercontact (UserID, FirstName, LastName, Email, Phone)
		VALUES ($userID, $FirstName, $LastName, $Email, $Phone);
		
		INSERT INTO userlogin (UserID, Email, Password, Pending)
		VALUES($userID, $Email, $Password, $Pending);
		
        
	END IF;
    
    
    SET $sectionUserID = (SELECT SectionUserID From sectionuser WHERE SectionID = $SectionID AND UserID = $userID);
    
    IF $sectionUserID IS NULL THEN
		INSERT INTO sectionuser (SectionID, UserID, Active, Volunteer, Role)
        VALUES ($SectionID, $userID, $Active, $Volunteer, $SectionRole);
	END IF;
    
    IF $SectionRole = 'Instructor' THEN
		BEGIN
		DECLARE $currentRole varchar(255);
        SET $currentRole = (SELECT  Role FROM user WHERE UserID = $userID);
        
        IF $currentRole IN ('Guest', 'Participant') THEN
			UPDATE user SET Role = 'Teacher', Instructor = 1 WHERE UserID = $userID;
        END IF;
        END;
    END IF;
		
    SET FOREIGN_KEY_CHECKS = 1;
    
    SELECT $userID as UserID, $newUser as SendEmail;
    COMMIT; 
    
    
    
END