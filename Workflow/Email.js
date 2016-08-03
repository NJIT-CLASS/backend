var models = require('../Model');
var Promise = require('bluebird');
var nodemailer = require('nodemailer');
var smtpTransport = require("nodemailer-smtp-transport")


var User = models.User;
var UserLogin = models.UserLogin;
var UserContact = models.UserContact;
var Course = models.Course;
var Section = models.Section;
var SectionUser = models.SectionUser;

var Semester = models.Semester;
var TaskInstance = models.TaskInstance;
var TaskActivity = models.TaskActivity;
var Assignment = models.Assignment;
var AssignmentInstance = models.AssignmentInstance;

var WorkflowInstance = models.WorkflowInstance;
var WorkflowActivity = models.WorkflowActivity;
var ResetPasswordRequest = models.ResetPasswordRequest;
var EmailNotification = models.EmailNotification;

var email = "njitplamaster@gmail.com";
var password = "plamaster123";

/*
  Constructor
*/
function Email() {

}

/*
  Adding task instance to email notification list
*/
Email.prototype.add = function(taskInstanceID) {

    console.log("Adding TaskInstanceID", taskInstanceID, " To Eail Notification List...");

    EmailNotification.create({
        TaskInstanceID: taskInstanceID
    }).catch(function(err) {
        console.log(err);
    });

}

/*
  Removing task instance from email notification list
*/
Email.prototype.delete = function(taskInstanceID) {

    console.log("Removing TaskInstanceID", taskInstanceID, " From Email Notification List...");

    EmailNotification.destroy({
        where: {
            TaskInstanceID: taskInstanceID
        }
    }).catch(function(err) {
        console.log(err);
    });
}

/*
  Send an email
*/
Email.prototype.send = function(opts) {
    var mailOpts, smtpTransporter;

    console.log('Creating Transport');

    smtpTransporter = nodemailer.createTransport(smtpTransport({
        host: "smtp.gmail.com",
        secureConnection: false,
        port: 587,
        auth: {
            user: email,
            pass: password
        }
    }));

    // mailing options
    mailOpts = {
        from: opts.from,
        replyTo: opts.from,
        to: opts.to,
        subject: opts.subject,
        html: opts.body
    };

    //console.log('mailOpts: ', mailOpts);

    console.log('Sending Mail...');

    // Send mail
    smtpTransporter.sendMail(mailOpts, function(error, response) {
        if (error) {
            console.log(error);
        } else {
            console.log('Message sent: ' + response.message);
        }
        console.log('Closing Transport');
        smtpTransporter.close();
    });

}

/*
  Send an email now
*/
Email.prototype.sendNow = function(userid, type) {

    var x = this;

    User.find({
        where: {
            UserID: userid
        }
    }).then(function(result) {

        UserContact.find({
            where: {
                UserContactID: result.UserContactID
            }
        }).then(function(contact) {

            console.log("Sending Email To: ", contact.Email, "...");

            switch (type) {
                case 'create user':
                    x.send({
                        from: email,
                        replyTo: email,
                        to: contact.Email,
                        subject: "Welcome to PLA!",
                        html: "You have succesfully created an account at PLA"
                    });
                    break;
                case 'due less than one day':
                    x.send({
                        from: email,
                        replyTo: email,
                        to: contact.Email,
                        subject: "Participatory Learning Approach- Assignment Due In 1 Day!",
                        html: "You have an assignment due within one day. Please check the website and complete immediately!"
                    });
                    break;
                case 'due less than seven days':
                    x.send({
                        from: email,
                        replyTo: email,
                        to: contact.Email,
                        subject: "Participatory Learning Approach- Assignment Due In A Week!",
                        html: "You have an assignment due within a week. Please careful check the due time!"
                    });
                    break;
                default:
                    return null;
            }
        });
    });
}

var updateEmailLastSent = function(taskInstanceId) {
    TaskInstance.update({
        EmailLastSent: new Date()
    }, {
        where: {
            TaskInstanceID: taskInstanceId
        }
    }).then(function(done) {
        console.log('Email Last Send Updated!');
    }).catch(function(err) {
        console.log(err);
        throw new Error(err);
    })
}


//Goes through entire EmailNotification table and check their time
Email.prototype.check = function() {

    var x = this;

    var now = new Date();
    var oneDay = (24 * 60 * 60 * 1000);
    var sevenDays = (7 * 24 * 60 * 60 * 1000);

    console.log("Checking Email Notification List...");

    EmailNotification.findAll({
        attributes: ['TaskInstanceID'],
    }).then(function(list) {

        list.forEach(function(result) {

            TaskInstance.find({
                where: {
                    TaskInstanceID: result.TaskInstanceID
                }
            }).then(function(taskInstance) {
                //if task end date has past delete from Email Notification
                if (taskInstance.EndDate < now) {

                    console.log('Assignment overdue! User: ', taskInstance.UserID, ' TaskInstanceID: ', taskInstance.TaskInstanceID);

                    x.delete(taskInstance.TaskInstanceID);
                }
                //if task has started and it's due less than 24 hours, send an email to user and delete from Email Notification
                else if ((taskInstance.StartDate < now) && ((taskInstance.EndDate - now) < oneDay)) {

                    console.log('Assignment due less than one day! User: ', taskInstance.UserID, ' TaskInstanceID: ', taskInstance.TaskInstanceID);

                    x.sendNow(taskInstance.UserID, 'due less than one day');
                    updateEmailLastSent(taskInstance.TaskInstanceID);
                    x.delete(taskInstance.TaskInstanceID);

                }
                //check if email last sent is more than 7 days and if task has started and it's due less than 7 days, send an email to user
                else if ((((now - taskInstance.EmailLastSent) > sevenDays) && (taskInstance.StartDate < now)) && ((taskInstance.EndDate - now) < sevenDays)) {

                    console.log('Assignment due less than seven days! User: ', taskInstance.UserID, ' TaskInstanceID: ', taskInstance.TaskInstanceID);

                    x.sendNow(taskInstance.UserID, 'due less than seven days');
                    updateEmailLastSent(taskInstance.TaskInstanceID);

                }

                return null;
            });
        });
    }).catch(function(err) {
        console.log(err);
        throw new Error('EmailNotification - Something went wrong...');
    });

}

module.exports.Email = Email;
