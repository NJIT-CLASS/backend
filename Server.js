var express = require("express");
var mysql = require("mysql");
var bodyParser = require("body-parser");
var md5 = require('MD5');
var rest = require("./REST.js");
var app = express();

process.env.dbHost = 'localhost';
process.env.dbUser = 'root';
process.env.dbPass = '123';
process.env.database = 'CLASS/PLA';
process.env.serverPort = '4000';

function REST() {
    var self = this;
    self.connectMysql();
};

REST.prototype.connectMysql = function() {
    var self = this;
    var pool = mysql.createPool({
        connectionLimit: 100,
        host: process.env.dbHost,
        user: process.env.dbUser,
        password: process.env.dbPass,
        database: process.env.database,
        debug: false
    });
    pool.getConnection(function(err, connection) {
        if (err) {
            self.stop(err);
        } else {
            self.configureExpress(connection);
        }
    });
}

REST.prototype.configureExpress = function(connection) {
    var self = this;
    app.use(function(req, res, next) {
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        next();
    });
    app.use(bodyParser.urlencoded({
        extended: true
    }));
    app.use(bodyParser.json());
    var router = express.Router();
    app.use('/api', router);
    var rest_router = new rest(router, connection, md5);
    self.startServer();
}

REST.prototype.startServer = function() {
    app.listen(process.env.serverPort, function() {
        console.log(md5("CesarP"));
        console.log("All right ! I am alive at Port ." + process.env.serverPort);
        console.log();
    });
}

REST.prototype.stop = function(err) {
    console.log("ISSUE WITH MYSQL n" + err);
    process.exit(1);
}

//-----------------------------------------------------------------------------------------------------------------------------------------
var schedule = require('node-schedule');
var Email = require('./WorkFlow/Email.js');

// var Sequelize = require("sequelize");
// var dateFormat = require('dateformat');
// var Guid = require('guid');
// var models = require('./Model');
// var Manager = require('./WorkFlow/Manager.js');
// var Allocator = require('./WorkFlow/Allocator.js');
// var sequelize = require("./Model/index.js").sequelize;

// var User = models.User;
// var UserLogin = models.UserLogin;
// var UserContact = models.UserContact;
// var Course = models.Course;
// var Section = models.Section;
// var SectionUser = models.SectionUser;
// var Semester = models.Semester;
// var TaskInstance = models.TaskInstance;
// var TaskActivity = models.TaskActivity;
// var Assignment = models.Assignment;
// var AssignmentInstance = models.AssignmentInstance;
// var WorkflowInstance = models.WorkflowInstance;
// var WorkflowActivity = models.WorkflowActivity;
// var ResetPasswordRequest = models.ResetPasswordRequest;
// var EmailNotification = models.EmailNotification;
//
//
// sequelize.query('SET FOREIGN_KEY_CHECKS = 0')
// .then(function(){
//     return sequelize.sync({
//       //force: true
//     });
// })
// .then(function(){
//     return sequelize.query('SET FOREIGN_KEY_CHECKS = 1')
// })
// .then(function(){
//     console.log('Database synchronised.');
// }, function(err){
//     console.log(err);
// });

var rule = new schedule.RecurrenceRule();
rule.minute = 00;
var email = new Email.Email();
//'1 * * * * *' 1 minute.
var job = schedule.scheduleJob('1 * * * * *', function(time) {
    // email.check();
    // email.send({
    //   from: "njitplamaster@gmail.com",
    //   replyTo: "njitplamaster@gmail.com",
    //   to: "ka267@njit.edu",
    //   subject: "Hey Krzysztof!- WE LOVE YOU!",
    //   text: "How are you??? How Rutgers??? How's girl friend? How's PLA?",
    //   html: ""
    // })
});


//-----------------------------------------------------------------------------------------------------------------------------------------








new REST();
