var sendgrid = require('sendgrid')('njitplamaster', 'plamaster123');
var schedule = require('node-schedule');


var Sequelize = require("sequelize");
var dateFormat = require('dateformat');
var Guid = require('guid');
var models = require('./Model');
var Manager = require('./WorkFlow/Manager.js');
var Allocator = require('./WorkFlow/Allocator.js');
var sequelize = require("./Model/index.js").sequelize;

var User = models.User;
var UserLogin = models.UserLogin;
var UserContact = models.UserContact;
var Course = models.Course;
var Section = models.Section;
var SectionUser = models.SectionUser;
var Semester = models.Semester;
var Task = models.Task;
var TaskActivity = models.TaskActivity;
var Assignment = models.Assignment;
var AssignmentSection = models.AssignmentSection;
var Workflow = models.Workflow;
var WorkflowActivity = models.WorkflowActivity;
var ResetPasswordRequest = models.ResetPasswordRequest;

//var rule = new schedule.RecurrenceRule();
//rule.minute = 00;

var job = schedule.scheduleJob("1 * * * * *", function(time) {
    console.log('Automated Checking For Expiring Assignments');

    var now = new Date();
    //var testtime = new Date("June 10, 2016 00:00:00")

    Task.findAll({
        attributes: ['UserID', 'StartDate', 'EndDate']
    }).then(function(response) {
        response.forEach(function(result) {
            var endDate = result.EndDate;
            if (Math.abs(now.getTime() - endDate.getTime()) <= (86400 * 1000)) {
                sendgrid.send({
                        from: 'njit.plamaster@gmail.com',
                        to: 'njit.plamaster@gmail.com',
                        subject: '[Auto] PLA System Notification',
                        text: 'Your Assignment is about the expire. \n Name: ' + result.UserID + '\n EndDate: ' + result.EndDate
                    }),
                    function(err, info) {
                        if (err) {
                            console.log(err);
                        } else {
                            console.log('Message Sent');
                        }
                    }
            }
        });
    });
});
