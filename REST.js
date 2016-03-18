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

	/*
	 * Cesar Salazar 02-24-2016
	 * Issue #3
	 * General User Endpoint
	 **/
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
	
	//Login 
    router.post("/login",function(req,res){
		var query = "SELECT ?? FROM ?? WHERE ?? = ? AND ?? = ?";
		var table = ["UserID","User", "EmailAddress",req.body.emailaddress,"Password",md5(req.body.password)];
		query = mysql.format(query, table);
		connection.query(query,function(err,rows){
			if(err){
				res.status(401).end();
			}else{
				res.json({"Error": false, "Message": "Success", 
					"UserID": rows});
			}
    	});
    });


	/**
	 * Create Semester
	 * Issue #4.1
	 * Cesar Salazar
	 */
	router.post("/CreateSemester",function(req,res){
		var query = "insert into Semester (Name, StartDate,EndDate,OrganizationID) values( ?,?,?,?)";
		//insert into Semester (semesterName, startDate,endDate) values ('Spring 2016','2016-01-10','2016-05-31')

		//Formating Dates
		var startDate =  dateFormat(req.body.startDate, "yyyy-mm-dd");
		var endDate =  dateFormat(req.body.endDate, "yyyy-mm-dd");
		var table = [req.body.Name,startDate,endDate,req.body.OrganizationID];
		query = mysql.format(query, table);
		connection.query(query,function(err,response){
			if(err){
				res.status(401).end();
			}else{
				res.json({"SemesterID": response.insertId});
			}
		});
	});


	router.post("/coursesection/create",function(req, res){
		//var query = "SELECT ?? FROM ?? WHERE ?? = ? AND ?? = ?";
		//var table = ["UserID","User", "EmailAddress",req.body.emailaddress,"Password",md5(req.body.password)];
		//query = mysql.format(query, table);
		//connection.query(query,function(err,rows){
		//	if(err){
		//		res.status(401).end();
		//	}else{
				res.json({"Error": false, "Message": "Success", 
					"CourseSectionID": "101"});
		//	}
    	//});
	});
	router.post("/coursesection/adduser",function(req, res){
		//var query = "SELECT ?? FROM ?? WHERE ?? = ? AND ?? = ?";
		//var table = ["UserID","User", "EmailAddress",req.body.emailaddress,"Password",md5(req.body.password)];
		//query = mysql.format(query, table);
		//connection.query(query,function(err,rows){
		//	if(err){
		//		res.status(401).end();
		//	}else{
				res.json({"Error": false, "Message": "Success", 
					"UserID": "1"});
		//	}
    	//});
	});
	router.get("/course/:courseid",function(req, res){
		//var query = "SELECT ?? FROM ?? WHERE ?? = ? AND ?? = ?";
		//var table = ["UserID","User", "EmailAddress",req.body.emailaddress,"Password",md5(req.body.password)];
		//query = mysql.format(query, table);
		//connection.query(query,function(err,rows){
		//	if(err){
		//		res.status(401).end();
		//	}else{
				res.json({"Error": false, "Message": "Success", 
					"CourseID": "101"});
		//	}
    	//});
	});
	router.get("/coursesection/:courseid",function(req, res){
		//var query = "SELECT ?? FROM ?? WHERE ?? = ? AND ?? = ?";
		//var table = ["UserID","User", "EmailAddress",req.body.emailaddress,"Password",md5(req.body.password)];
		//query = mysql.format(query, table);
		//connection.query(query,function(err,rows){
		//	if(err){
		//		res.status(401).end();
		//	}else{
				res.json({"Error": false, "Message": "Success", 
					"SectionName": "A Section", "SectionDescription": "",
					"Users": rows});
		//	}
    	//});
	});
	router.put("/course/update",function(req, res){
		//var query = "SELECT ?? FROM ?? WHERE ?? = ? AND ?? = ?";
		//var table = ["UserID","User", "EmailAddress",req.body.emailaddress,"Password",md5(req.body.password)];
		//query = mysql.format(query, table);
		//connection.query(query,function(err,rows){
		//	if(err){
		//		res.status(401).end();
		//	}else{
				res.status(200).end(); 
		//	}
    	//});
	});
	router.put("/coursesection/update",function(req, res){
		//var query = "SELECT ?? FROM ?? WHERE ?? = ? AND ?? = ?";
		//var table = ["UserID","User", "EmailAddress",req.body.emailaddress,"Password",md5(req.body.password)];
		//query = mysql.format(query, table);
		//connection.query(query,function(err,rows){
		//	if(err){
		//		res.status(401).end();
		//	}else{
				res.status(200).end();
		//	}
    	//});
	});
	router.delete("/coursesection/removeuser",function(req, res){
		//var query = "SELECT ?? FROM ?? WHERE ?? = ? AND ?? = ?";
		//var table = ["UserID","User", "EmailAddress",req.body.emailaddress,"Password",md5(req.body.password)];
		//query = mysql.format(query, table);
		//connection.query(query,function(err,rows){
		//	if(err){
		//		res.status(401).end();
		//	}else{
				res.status(200).end();
		//  }
    	//});
	});

	/**
	 * Create Semester
	 * Issue #4.1
	 * Cesar Salazar
	 */
	router.post("/CreateSemester",function(req,res){
		/*var query = "insert into Semester (semesterName, startDate,endDate) values( ?,?,?)";
		//insert into Semester (semesterName, startDate,endDate) values ('Spring 2016','2016-01-10','2016-05-31')

		//Formating Dates
		var startDate =  dateFormat(req.body.startDate, "yyyy-mm-dd");
		var endDate =  dateFormat(req.body.endDate, "yyyy-mm-dd");
		var table = [req.body.semesterName,startDate,endDate];
		query = mysql.format(query, table);
		connection.query(query,function(err,response){
			if(err){
				res.status(401).end();
			}else{
				res.json({"SemesterID": response.insertId});
			}
		});*/
		res.json({"Error": false, "Message": "Success",
			"Semester": "101"});

	});

//4.2
	router.get("/getsemester/:semesterID", function(req,res){
		/*var query = "SELECT ??, ??, ??, ?? FROM ?? WHERE ?? = ?";
		var table =  ["semesterID", "semesterName", "startDate", "endDate","Semester","semesterID", req.params.semesterID];
		query=mysql.format(query,table);
		connection.query(query,function(err,rows){
			if(err) {
				res.status(401).end();
			} else {
				res.json({"Error" : false, "Message" : "Success", "Semester" : rows});
			}
		});*/
		res.json({"Error": false, "Message": "Success",
			"Semesters": "101"});
	});

	/**
	 * SemesterList
	 * Issue #4.3
	 * Cesar Salazar
	 */
	router.get("/SemesterList",function(req,res){
		var query = "SELECT * FROM ??";
		var table = ["Semester"];
		query = mysql.format(query,table);
		connection.query(query,function(err,rows){
			if(err) {
				res.status(401).end();
			} else {
				res.json({"Error" : false, "Message" : "Success", "Semesters" : rows});
			}
		});


	});

	/**
	 * Spring 3
	 * Issue # 5.1
	 * Create Course
	 * Cesar Salazar
	 */
	router.post("/CreateCourse",function(req,res){
		var query = "insert into Course (Number, Tittle,OrganizationID) values(?,?,?)";
		//insert into Semester (semesterName, startDate,endDate) values ('Spring 2016','2016-01-10','2016-05-31')

		//Formating Dates

		var table = [req.body.Number,req.body.Tittle,rq.body.OrganizationID];
		query = mysql.format(query, table);
		connection.query(query,function(err,response){
			if(err){
				res.status(401).end();
			}else{
				res.json({"CourseID": response.insertId});
			}
		});
		/*res.json({"Error": false, "Message": "Success",
			"Course": "101"});*/
	});

	/**
	 * getCourse
	 * Issue # 5.4
	 * Cesar Salazar
	 */
	router.get("/getCourse/:courseId",function(req,res){
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
	router.get("/getCourseSection/:sectionId",function(req,res){
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
	router.put("/UpdateCourse",function(req,res){
		var query = "update ?? set ??=?, ??=? where ?? = ?";
		var table = ["Course","Title",req.body.Title,"Number",req.body.Number,"CourseID",req.body.CourseID];
		query = mysql.format(query,table);
		connection.query(query,function(err,rows){
			if(err) {
				res.status(400).end()
			} else {
				res.status(200).end()
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
	router.delete("/DeleteUserSection/",function(req,res){
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
}

module.exports = REST_ROUTER;
