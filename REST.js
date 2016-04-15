var mysql = require("mysql");

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
					"EmailAddress": rows[0].EmailAddress});
			}
    	});
    });

    //Updates Name
    router.put("/update/name",function(req,res){
		var query = "UPDATE ?? SET ?? = ? AND ?? = ? WHERE ?? = ?";
		var table = ["User","FirstName",req.body.firstname,"LastName",req.body.lastname,"UserID",req.body.userid];
		query = mysql.format(query, table);
		connection.query(query,function(err,rows){
			if(err){
				res.status(401).end();
			}else{
				res.json({"Error": false, "Message": "Success", 
					"Name": rows});
			}
    	});
    });

	/*
	 * Cesar Salazar 02-24-2016
	 * Issue #3
	 * General User Endpoint
	 **/
	router.get("/generalUser",function(req,res){
		var query = "SELECT `EmailAddress`,`FirstName`,`LastName`, `UserType` FROM ?? WHERE UserID = ?";
		var table = ["User",req.body.userid];
		query = mysql.format(query,table);
		connection.query(query,function(err,rows){
			if(err) {
				res.json({"Error" : true, "Message" : "Error executing MySQL query"});
			} else {
				if(rows.length > 0){
					res.json({"Error" : false, "Message" : "Success", "Users" : rows});
				}else{
					res.json({"Error" : false, "Message" : "Success", "Users" : "No Found"});
				}
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

}

module.exports = REST_ROUTER;
//Login
router.post("/login",function(req,res){
	var query = "SELECT ?? FROM ?? WHERE ?? = ? AND ?? = ?";
	var table = ["UserID", "User", "EmailAddress",req.body.emailaddress,"Password",md5(req.body.password)];
	query = mysql.format(query,table);
	connection.query(query,function(err,rows){
	if(err){
		res.status(401).end();
	}else{
		res.json({"Error":false, "Message": "Success",
			"UserID":rows});
		}
	});
});

//4.2
router.get("/getsemester/:semesterID", function(req,rest){
	var query = "SELECT ??, ??, ??, ?? FROM ?? WHERE ?? = ?";
	var table =  ["semesterID", "semestername", "start date", "end date","Semester","semesterID", req.params.semesterID];
	query=mysql.format(query,table);
	connection.query(query,function(err,rows){
		if(err) {
	res.status(401.end();
		} else {
	res.json({"Error" : false, "Message" : "Success", 
		}
	});
});
//5.2

router.post(“/CreateSection”.function(req.res){

var query = “insert into Section (CourseNumber, SemesterID, SectionName, SectionDescription) value(?, ?, ?)”;

var table = [req.body.CourseNumber,req.body.SemesterID,req.body.SectionName,req.body.SectionDescription];
query = mysql.format(query,table);
connection.query(query,function(err,response)
{
        if(err){
res.status(401).end();
}else{
res.json({"SectionID": response.insertId});
}
});
});

//5.3
router.post(“/addUser”.function(req.res){

var query = “insert into Section (Email, CourseID, SectionID)
 value(?, ?, ?)”;

var table = [req.body.Email,req.body.CourseID,req.body.SectionID];
query = mysql.format(query,table);
connection.query(query,function(err,response)
{
        if(err){
res.status(401).end();
}else{
res.json({"addUser": response.insertId});
}
});
});

/** Create a new Instructor 
*Issue #19
**/

router.put("/newInstructor/",function(req,res){
	Email.find({ where : { Email : req.body.Email, Password : md5(req.body.password) }}). then(function(Email){
	if(Email == null)
	{
		console.log("/newInstructor : Authentication Failed");
		res.status(400).end();
	}
	else{
		Email.find(req.body.Email).then(function(user){

			if(email == null)
			{
				console.log("/newInstructor/ User not found");
				res.status(400).end();
			}
			else
			{
				email.Admin = 0;
				email.save().then(function () {
					console.log("/newInstructor : Email Updated ");
				res.status(200).end();
				}).catch(function (error) {
					console.log("/newInstructor : Error! " + error.message);
				res.staus(400).end();
			});
		}
	});
}
});
} 

/** Return Section Member 
*Issue #20
**/

function getSectionUsers(SectionID, callback) {
	var query = "SELECT ??, ?? FROM ?? where ?? = ?";
	var table = ["UserID", "UserRole", "SectionUser", "SectionID", SectionID];
	query = mysql.format(query, table);

	connection.query(query, function (err, rows) {
		if (err) {
			console.log("Method getSectionUsers : " + err.message);
			
			res.status(401).end();
		} else {
			callback(rows);
		}
});
}

