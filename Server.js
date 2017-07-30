var express = require('express');
var mysql = require('mysql');
var bodyParser = require('body-parser');
var rest = require('./REST.js');
var app = express();
var settings = require("./backend_settings");
const logger = require('winston');


var schedule = require('node-schedule');
var Email = require('./Workflow/Email.js');
var Sequelize = require('sequelize');
var dateFormat = require('dateformat');
var Guid = require('guid');
var models = require('./Model');
var Manager = require('./Workflow/Manager.js');
var TaskFactory = require('./Workflow/TaskFactory.js');
const sequelize = require('./Model/index.js').sequelize;

var manager = new Manager();
var taskFactory = new TaskFactory;


function REST() {
    var self = this;
    self.configureExpress();
};

REST.prototype.configureExpress = function() {
    var self = this;
    app.use(function(req, res, next) {
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
        next();
    });
    app.use(bodyParser.urlencoded({
        extended: true
    }));
    app.use(bodyParser.json());
    var router = express.Router();
    app.use('/api', router);
    var rest_router = new rest(router);
    self.startServer();
};

REST.prototype.startServer = function() {
    app.listen(settings.SERVER_PORT, function() {
        console.log('All right ! I am alive at Port .' + settings.SERVER_PORT);
        console.log();
    });
};

REST.prototype.stop = function(err) {
    console.log('ISSUE WITH MYSQL n' + err);
    process.exit(1);
};

//-----------------------------------------------------------------------------------------------------------------------------------------

sequelize.query('SET FOREIGN_KEY_CHECKS = 0')
    .then(function() {
        return sequelize.sync({
            //force: true
        });
    })
    .then(function() {
        return sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
    })
    .then(function() {
        console.log('Database synchronised.');
    }, function(err) {
        console.log(err);
    });

var rule = new schedule.RecurrenceRule();
rule.minute = 1;

//'1 * * * * *' 1 minute.
var job = schedule.scheduleJob('*/10 * * * * *', function(time) {
    taskFactory.rankingSnapshot();
});


//-----------------------------------------------------------------------------------------------------------------------------------------








new REST();