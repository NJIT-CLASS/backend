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
    router.put("/update",function(req,res){
		var query = "UPDATE ?? SET ?? = ? WHERE ?? = ? AND ?? = ?";
		var table = ["User","Password",md5(req.body.password),"UserID",req.body.userid,"Password",md5(req.body.oldpassword)];
		query = mysql.format(query, table);
		connection.query(query,function(err,rows){
			if(err){
				res.json({"Error": true, "Message": "401"});
			}else{
				res.json({"Error": false, "Message": "200"});
			}
    	});
    });
    
    //Updates Email
    router.put("/update",function(req,res){
		var query = "UPDATE ?? SET ?? = ? WHERE ?? = ? AND ?? = ?";
		var table = ["User","EmailAddress",req.body.email,"UserID",req.body.userid,"Password",md5(req.body.password)];
		query = mysql.format(query, table);
		connection.query(query,function(err,rows){
			if(err){
				res.json({"Error": true, "Message": "401"});
			}else{
				res.json({"Error": false, "Message": "Success", "EmailAddress": rows[0].EmailAddress});
			}
    	});
    });

    //Updates Name
    router.put("/update",function(req,res){
		var query = "UPDATE ?? SET ?? = ? AND ?? = ? WHERE ?? = ?";
		var table = ["User","FirstName",req.body.firstname,"LastName",req.body.lastname,"UserID",req.body.userid];
		query = mysql.format(query, table);
		connection.query(query,function(err,rows){
			if(err){
				res.json({"Error": true, "Message": "401"});
			}else{
				res.json({"Error": false, "Message": "Success", "FirstName": rows[0].FirstName, "LastName": rows[0].LastName});
			}
    	});
    });
}

module.exports = REST_ROUTER;
