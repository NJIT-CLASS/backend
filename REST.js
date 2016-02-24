function REST_ROUTER(router,connection,md5) {
	var self = this;
    self.handleRoutes(router,connection,md5);
}

REST_ROUTER.prototype.handleRoutes= function(router,connection,md5) {
    router.get("/",function(req,res){
        res.json({"Message" : "Hello, World!"});
    });

    router.get("/user/:user_id/:password/:newpassword",function(req,res){
		var query = "UPDATE ?? SET ?? = ? WHERE ??=? AND ??=?";
		var table = ["User", "Password", "UserID", "Password", MD5(req.body.newpassword), req.body.UserId, MD5(req.body.password)];
		query = mysql.format(query, table);
		connect.query(query,function(err,rows){
			if(err){
				res.json({"Error": true, "Message": "401"});
			}else{
				res.json({"Error": false, "Message": "200"});
			}
    	});
    });
    
    router.get("/user/:user_id/:email/:password",function(req,res){
		var query = "UPDATE ?? SET ?? = ? WHERE ??=? AND ??=?";
		var table = ["User", "EmailAddress", "UserID", "Password", req.body.email, req.body.UserId, MD5(req.body.password)];
		query = mysql.format(query, table);
		connect.query(query,function(err,rows){
			if(err){
				res.json({"Error": true, "Message": "401"});
			}else{
				res.json({"Error": false, "Message": "Success", "Changed": rows});
			}
    	});
    });
    
    router.get("/user/:user_id/:first/:last",function(req,res){
		var query = "UPDATE ?? SET ?? = ? AND ?? = ? WHERE ??=?";
		var table = ["User", "FirstName", "LastName", req.body.first, req.body.last, req.body.UserId];
		query = mysql.format(query, table);
		connect.query(query,function(err,rows){
			if(err){
				res.json({"Error": true, "Message": "401"});
			}else{
				res.json({"Error": false, "Message": "Success", "Changed": rows});
			}
    	});
    });
}

module.exports = REST_ROUTER;
