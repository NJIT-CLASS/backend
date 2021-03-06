var express = require('express');
var mysql = require('mysql');
var bodyParser = require('body-parser');
var rest = require('./REST.js');
var app = express();
var settings = require('./backend_settings');
const logger = require('./Workflow/Logger.js');
import "babel-core/register";
import "babel-polyfill";
var schedule = require('node-schedule');
var Email = require('./Workflow/Email.js');
var Sequelize = require('sequelize');
var dateFormat = require('dateformat');
var Guid = require('guid');
var models = require('./models');
var Manager = require('./Workflow/Manager.js');
const sequelize = require('./models/index.js').sequelize;
var TaskFactory = require('./Workflow/TaskFactory.js');

var manager = new Manager();
var taskFactory = new TaskFactory();


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
    app.use(bodyParser.json({limit: '50mb'}));
    app.use(bodyParser.urlencoded({limit: '50mb', extended: true,parameterLimit:50000}));
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
            //force: true,
            // logging: console.log
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
var job = schedule.scheduleJob('1 * * * * *', function(time) {
    manager.check();
    //Just for testing 
    //taskFactory.rankingSnapshot(true);
});

// //Everyday at midnight
// schedule.scheduleJob({ hour: 0, minute: 0 }, function() {
//     taskFactory.rankingSnapshot(true);
// });


// //Every sunday at midnight
// schedule.scheduleJob({ hour: 0, minute: 0, dayOfWeek: 0 }, function() {
//     taskFactory.rankingSnapshot(false, true);
// });



//-----------------------------------------------------------------------------------------------------------------------------------------


new REST();