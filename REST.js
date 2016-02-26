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
					"EmailAddress": req.body.email});
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
		var query = "SELECT ??, ??, ??, ?? FROM ?? WHERE ?? = ?";
		var table = ["EmailAddress","FirstName","LastName","UserType", "User","UserID", req.params.userid];
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

}

module.exports = REST_ROUTER;
