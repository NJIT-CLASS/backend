DROP PROCEDURE addInitialUserToSystem;
DELIMITER $$
USE `class/pla`$$
CREATE DEFINER=`root`@`localhost` PROCEDURE `addInitialUserToSystem`(
	IN $FirstName varchar(255),
    IN $LastName varchar(255),
    IN $Instructor int,
    IN $Admin int,
    IN $Role varchar(255),
    IN $Email varchar(255),
    IN $Phone varchar(255),
    IN $Password varchar(255),
    IN $Pending int)
BEGIN
	DECLARE $userID int;
	START TRANSACTION;
    SET FOREIGN_KEY_CHECKS = 0;
    SET $userID = (SELECT UserID FROM userlogin WHERE Email = $Email);
    
    IF $userID is null THEN
		
        INSERT INTO user(FirstName, LastName, Instructor, Admin, Role)
		VALUES ($FirstName, $LastName, $Instructor, $Admin, $Role);
		
	
		SET $userID = LAST_INSERT_ID();
		
		INSERT INTO usercontact (UserID, FirstName, LastName, Email, Phone)
		VALUES ($userID, $FirstName, $LastName, $Email, $Phone);
		
		INSERT INTO userlogin (UserID, Email, Password, Pending)
		VALUES($userID, $Email, $Password, $Pending);
	
    
	END IF;
    
    
    
    
    SET FOREIGN_KEY_CHECKS = 1;
    COMMIT;
    SELECT $userID;
    
END$$

DELIMITER ;
