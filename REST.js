var mysql = require("mysql");
var dateFormat = require('dateformat');

function REST_ROUTER(router,connection,md5) {
	var self = this;
    self.handleRoutes(router,connection,md5);
}

REST_ROUTER.prototype.handleRoutes= function(router,connection,md5) {
    router.get("/",function(req,res){
        res.json({"Message" : "Hello, World!"});
   });

	//Hira - Issue 1
	//Login Function
    router.post("/login",function(req,res){
		var query = "SELECT ?? FROM ?? WHERE ?? = ? AND ?? = ?";
		var table = ["UserID","UserLobin", "Email",req.body.emailaddress,"Password",md5(req.body.password)];
		query = mysql.format(query, table);
		connection.query(query,function(err,rows){
			if(err){
				res.status(401).end();
			}else{
				if(results.length > 0){
					res.json({"Error": false, "Message": "Success", 
						"UserID": rows});
				}else{
					res.status(401).end();
				}
			}
    	});
    });

	//Issue 2 - User Management
	//Updates Password
    router.put("/update/password",function(req,res){
		var query = "UPDATE ?? SET ?? = ? WHERE ?? = ? AND ?? = ?";
		var table = ["User","Password",md5(req.body.password),"UserID",req.body.userid,"Password",md5(req.body.oldpassword)];
		query = mysql.format(query, table);
		connection.query(query,function(err,rows){
			if(err){
				res.status(401).end();
			}else{
				res.status(200).end();
			}
    	});
    });
    
    //Updates Email
    router.put("/update/email",function(req,res){
		var query = "UPDATE ?? SET ?? = ? WHERE ?? = ? AND ?? = ?";
		var table = ["User","EmailAddress",req.body.email,"UserID",req.body.userid,"Password",md5(req.body.password)];
		query = mysql.format(query, table);
		connection.query(query,function(err,rows){
			if(err){
				res.status(401).end();
			}else{
				res.json({"Error": false, "Message": "Success", 
					"EmailAddress": req.body.email});
			}
    	});
    });

    //Updates Name
    router.put("/update/name",function(req,res){
		var query = "UPDATE ?? SET ?? = ?, ?? = ? WHERE ?? = ?";
		var table = ["User","FirstName",req.body.firstname,"LastName",req.body.lastname,"UserID",req.body.userid];
		query = mysql.format(query, table);
		connection.query(query,function(err,rows){
			if(err){
				res.status(401).end();
			}else{
				res.json({"Error": false, "Message": "Success", 
					"FirstName": req.body.firstname, "LastName": req.body.lastname});
			}
    	});
    });

	//Issue 3 - General User Endpoint
	router.get("/generalUser/:userid",function(req,res){
		//select u.FirstName, u.LastName, u.UserType, uc.Email from User as u inner join UserContact as uc on u.UserContactID = uc.UserContactID where UserID = 1;
		var query = "SELECT ??, ??, ??, ?? FROM ?? as ?? inner join ?? as on ??=?? ?? WHERE ?? = ?";
		var table = ["u.FirstName","u.LastName","u.UserType","uc.Email", "User","u","UserContact","uc","u.UserContactID","u.UserContactID","UserID", req.params.userid];
		query = mysql.format(query,table);
		connection.query(query,function(err,rows){
			if(err) {
				res.status(401).end();
			} else {
					res.json({"Error" : false, "Message" : "Success", "User" : rows});
			}
		});
	});
	
	//Issue 4
	/**
	 * Create Semester
	 * Issue #4.1
	 * Cesar Salazar
	 */
	router.post("/CreateSemester",function(req,res){
		var query = "insert into Semester (Name, StartDate,EndDate) values(?,?,?)";

		//Formating Dates
		var startDate =  dateFormat(req.body.startDate, "yyyy-mm-dd");
		var endDate =  dateFormat(req.body.endDate, "yyyy-mm-dd");
		var table = [req.body.Name,startDate,endDate];
		query = mysql.format(query, table);
		connection.query(query,function(err,response){
			if(err){
				res.status(401).end();
			}else{
				res.json({"SemesterID": response.insertId});
			}
		});
	});

	//Christian Alexander - Issue 4.2
	//Get Semester Information
	router.get("/semester/:semesterid", function(req, res){
		var query = "select ??, ??, ??, ?? from ?? where ??=?";
		var table = ["SemesterID", "Name","StartDate", "EndDate","Semester",
					"SemesterID", req.params.semesterid];
		connection.query(query,function(err,rows){
			if(err){
				res.status(400).end();	
			}else{
				res.json({"Error" : false, "Message" : "Success", "Course" : result});
			}
		});
	});
	
	//Christian Alexander - Issue 4.3
	//Get All Semester Information
	router.get("/semester", function(req, res){
		var query = "select *  from ??;
		var table = ["Semester"];
		connection.query(query,function(err,rows){
			if(err){
				res.status(400).end();	
			}else{
				res.json({"Error" : false, "Message" : "Success", "Semesters" : result});
			}
		});
	});
	
	//Issue 5
	/**
	 * Spring 3
	 * Issue # 5.1
	 * Create Course
	 * Cesar Salazar
	 */
	router.post("course/create",function(req,res){
		var query = "insert into ??(??,??,??,??) values(?,?,?,?)";
		var table = ["Course", "CreatorID", "Number","Title", 
					req.body.userid,req.body.number,req.body.title];
		query = mysql.format(query, table);
		connection.query(query,function(err,response){
			if(err){
				res.status(401).end();
			}else{
				getCreatedCourseID(function(result){
					res.json({"result":rows});
				});	
			}
		});
	});

	function getCreatedCourseID(callback){
		var query = "SELECT LAST_INSERT_ID()";
		var table = [];
		query = mysql.format(query,table);

		connection.query(query,function(err,rows){
			if(err) {
				res.status(401).end();
			} else {
				callback(rows);
			}
		});	
	}

	//Christian Alexander - Issue 5.2
	//Create Course Section
	router.post("course/createsection",function(req,res){
		var query = "insert into ??(??,??,??,??) values(?,?,?,?)";
		var table = ["section", "CourseID", "SemesterID","Name",
			"Description", req.body.courseid,req.body.semesterid,req.body.name,
			req.body.description];
		query = mysql.format(query, table);
		connection.query(query,function(err,response){
			if(err){
				res.status(401).end();
			}else{
				getCreatedCourseID(function(result){
					res.json({"result":rows});
				});	
			}
		});
	});
	
	//Christian Alexander - 5.3
	//Add Student to Section
	/*TO DO = GET CourseID, ADD IT TO TABLE */
	router.put("/course/adduser",function(req,res){
		var query = "select ?? from ?? where ??=?";
		var table = ["UserID", "UserLogin", "Email", req.body.email];
		query = mysql.format(query, table);
		connection.query(query,function(err,response){
			if(err){
				res.status(401).end();
			}else{
				if(rows > 0){
					addUserToSection(response.UserID,req.body.email,
						req.body.courseid, req.body.sectionid, function(result){
						res.json({"Error" : false, "Message" : "Success", "UserID": response.UserID});
					)};
				}else{
					res.json({"Error" : true, "Message" : "UserID Not Found"});
				}
			}
		});
	});

	function addUserToSection(UserID, Email, CourseID, SectionID, callback)
	{
		var query = "INSERT INTO ??(??,??,??,??) Values(?,?,?,?)";
		var table = ["SectionUser","UserID","Email","CourseID","SectionID",
			UserID, Email, CourseID, SectionID];
		query = mysql.format(query,table);

		connection.query(query,function(err,rows){
			if(err) {
				res.status(401).end();
			} else {
				callback();
			}
		});
	}
	/**
	 * getCourse
	 * Issue # 5.4
	 * Cesar Salazar
	 */
	router.get("/course/:courseId",function(req,res){
		var query = "SELECT ??, ?? FROM ??";
		var table = ["Number","Title","Course"];
		query = mysql.format(query,table);
		connection.query(query,function(err,result){
			if(err) {
				res.status(401).end();
			} else {
				res.json({"Error" : false, "Message" : "Success", "Course" : result});
			}
		});

	});


	/**
	 * getCourseSection
	 * Issue # 5.5
	 * Cesar Salazar
	 */
	router.get("/course/getsection/:sectionId",function(req,res){
		var query = "SELECT ??, ?? FROM ?? where ?? = ?";
		var table = ["Name","Description","Section","SectionID",req.params.sectionId];
		query = mysql.format(query,table);

		connection.query(query,function(err,rows){
			if(err) {
				res.status(401).end();
			} else {
				getSectionUsers(req.params.sectionId,function(result){
					res.json({"result":rows,"Section" : result});
				});
			}
		});

	});

	/**
	 * Get list of users for the given section.
	 * @param SectionID
	 * @param callback
     */
	function getSectionUsers(SectionID,callback)
	{
		var query = "SELECT ??, ?? FROM ?? where ?? = ?";
		var table = ["UserID","UserRole","SectionUser","SectionID",SectionID];
		query = mysql.format(query,table);

		connection.query(query,function(err,rows){
			if(err) {
				res.status(401).end();
			} else {
				callback(rows);
			}
		});
	}

	/**
	 * UpdateCourse
	 * Issue # 5.6
	 * Cesar Salazar

	 course ID
	 course name
	 course number
	 course creator id
	 */
	router.put("/course/update",function(req,res){
		var query = "update ?? set ??=?, ??=? where ?? = ?";
		var table = ["Course","Title",req.body.Title,"Number",req.body.Number,"CourseID",req.body.CourseID];
		query = mysql.format(query,table);
		connection.query(query,function(err,rows){
			if(err) {
				res.status(401).end()
			} else {
				res.status(200).end()
			}
		});

	});
	
	//Christian Alexander - Issue 5.7
	//Update a Course Section
	router.put("/course/updatesection",function(req,res){
		var query = "update ?? set ??=?, ??=? where ??=? and ?? = ?";
		var table = ["Section", "Name", req.body.name, "Description",
			req.body.description, "SectionID", req.body.sectionid,
			"SemesterID", req.body.semesterid];
		query = mysql.format(query, tabe);
		connection.query(query, function(err,rows){
			if(err){
				req.status(401).end();
			}else{
				req.status(200).end();
			}
		});
	});
	/**
	 * Delete User from Section
	 * Issue # 5.8
	 * Cesar Salazar

	 UserID
	 SectionID
	 */
	router.delete("/course/deleteuser",function(req,res){
		var query = "delete from ?? where ?? = ? and ?? = ?";
		var table = ["SectionUser","UserID",req.body.userID, "SectionID",req.body.SectionID];
		query = mysql.format(query,table);
		connection.query(query,function(err,rows){
			if(err) {
				res.status(400).end()
			} else {
				res.status(200).end()
			}
		});

	});

	//Christian Alexander - Issue 6
	//Get User's Courses
	router.get("/course/getCourses/:userid",function(req, res){
		var query = "select ??, ?? from ?? where ??=?";
		var table = ["CourseID", "SectionID", "SectionUser", "UserID", req.body.userid];
		query = mysql.format(query, table);
		connection.query(query, function(err,rows){
			if(err){ 
				res.status(401).end();
			}else{
				if(rows.length > 0){
					res.json({"Error" : false, "Message" : "Success", "Result" : rows});
				}else{
					res.json({"Error" : true, "Message" : "User Has No Courses"});
				}
			}
		});
	});
}

module.exports = REST_ROUTER;
