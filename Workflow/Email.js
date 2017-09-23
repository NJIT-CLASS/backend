
import {MASTER_EMAIL, MASTER_PASSWORD, EMAIL_SERVER_STATUS} from '../Util/constant.js';
var models = require('../Model');
var Promise = require('bluebird');
var nodemailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');


var FileReference = models.FileReference;
var User = models.User;
var UserLogin = models.UserLogin;
var UserContact = models.UserContact;
var Course = models.Course;
var Section = models.Section;
var SectionUser = models.SectionUser;

var Semester = models.Semester;
var TaskInstance = models.TaskInstance;
var TaskGrade = models.TaskGrade;
var TaskSimpleGrade = models.TaskSimpleGrade;
var TaskActivity = models.TaskActivity;
var Assignment = models.Assignment;
var AssignmentGrade = models.AssignmentGrade;
var AssignmentInstance = models.AssignmentInstance;

var WorkflowInstance = models.WorkflowInstance;
var WorkflowGrade = models.WorkflowGrade;
var WorkflowActivity = models.WorkflowActivity;
var ResetPasswordRequest = models.ResetPasswordRequest;
var EmailNotification = models.EmailNotification;

const logger = require('./Logger.js');

var email = 'njitplamaster@gmail.com';
var password = MASTER_PASSWORD;
var active = EMAIL_SERVER_STATUS;

if(active){
    logger.log('info', '/Email: email server online');
} else {
    logger.log('info', '/Email: email server currently not activated');
}



/*
  Constructor
*/
class Email {

    /*
      Adding task instance to email notification list
    */
    add(taskInstanceID) {

        console.log('Adding TaskInstanceID', taskInstanceID, ' To Email Notification List...');

        EmailNotification.create({
            TaskInstanceID: taskInstanceID
        }).catch(function (err) {
            console.log(err);
        });

    }

    /*
      Removing task instance from email notification list
    */
    delete(taskInstanceID) {

        console.log('Removing TaskInstanceID', taskInstanceID, ' From Email Notification List...');

        EmailNotification.destroy({
            where: {
                TaskInstanceID: taskInstanceID
            }
        }).catch(function (err) {
            console.log(err);
        });
    }

    /*
      Send an email, provide an opts will allow you to send any email to anyone.
    */
    send(opts) {
        var mailOpts, smtpTransporter;

        console.log('Creating Transport');

        smtpTransporter = nodemailer.createTransport(smtpTransport({
            host: 'mail.njit.edu',
            secureConnection: true,
            port: 25
        }));

        // mailing options
        mailOpts = {
            from: opts.from,
            replyTo: opts.from,
            to: opts.to,
            subject: opts.subject,
            text: opts.text,
            html: opts.body
        };

        console.log('Sending Mail...');

        // Send mail
        smtpTransporter.sendMail(mailOpts, function (error, response) {
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
      Send an email now given userid and type of email needs to be sent.
    */
    async sendNow(userid, type, temp_pass = null) {
        //return; //for testting purposes

        if (active) {

            var x = this;
            console.log(models.UserLogin);
            await models.UserLogin.find({
                where: {
                    UserID: userid
                }
            }).then(async function (result) {
                var send = result.Email;
                send = 'qxl2@njit.edu';
                console.log('Sending Email To: ', send, '...');

                switch (type) {
                    case 'create user':
                        await x.send({
                            from: email,
                            replyTo: email,
                            to: send,
                            subject: 'Welcome to PLA!',
                            text: 'You have succesfully created an account on PLA \n http://pla.njit.edu:4001',
                            html: '<p> You have succesfully created an account on PLA! Here is the temporary password for your account: <div>http://pla.njit.edu:4001 <div></p> '
                        });
                        break;
                    case 'invite user':
                        console.log('inviting ' + send);
                        await x.send({
                            from: email,
                            replyTo: email,
                            to: send,
                            subject: 'Welcome to PLA!',
                            text: 'You have been invited to create an account on PLA. Please log in with your temporary password to finish your account creation. \n http://pla.njit.edu:4001 \nTemporary Password: ' + temp_pass,
                            html: '<p>You have been invited to create an account on PLA. Please log in with your temporary password to finish your account creation.<div>http://pla.njit.edu:4001</div><br/>Temporary Password: ' + temp_pass + '</p>'
                        });
                        break;
                    case 'new task':
                        console.log('notifying ' + send);
                        await x.send({
                            from: email,
                            replyTo: email,
                            to: send,
                            subject: 'New Task Awaiting! PLA Admin',
                            text: 'A new task has been assigned. Please login into \n http://pla.njit.edu:4001 to complete the task',
                            html: '<p>A new task has been assigned.<div>Please login into http://pla.njit.edu:4001</div></p>'
                        });
                        break;

                    case 'late':
                        await x.send({
                            from: email,
                            replyTo: email,
                            to: send,
                            subject: 'Your assignment is overdue - PLA',
                            text: 'You have an assignment that is due. Please check PLA',
                            html: ''
                        });
                        break;
                    case 'remove_reallocated':
                        await x.send({
                            from: email,
                            replyTo: email,
                            to: send,
                            subject: 'You have removed from a task - PLA',
                            text: 'You have been removed from a task, a new user has been reallcated to replace your duty',
                            html: ''
                        });
                        break;
                    case 'new_reallocated':
                        await x.send({
                            from: email,
                            replyTo: email,
                            to: send,
                            subject: 'Reallocated to a new task - PLA',
                            text: 'Hi, you have been reallocated to a new task, please complete as soon as possible',
                            html: ''
                        });
                        break;

                    case 'reset password':
                        await x.send({from: email,
                            replyTo: email,
                            to: send,
                            subject: 'Your password has been reset - PLA',
                            text: 'Your password has been reset. Please log in with your temporary password to finish resetting your password. \n http://pla.njit.edu:4001 \nTemporary Password: ' + temp_pass,
                            html: '<p>Your password has been reset. Please log in with your temporary password to finish resetting your password.<div>http://pla.njit.edu:4001</div><br/>Temporary Password: ' + temp_pass + '</p>'

                        });
                        break;
                    default:
                        logger.log('error', '/Workflow/Email/sendNow: email option not found!');
                        return null;
                }
            });

        } 
    }

    //Update Email Last Sent in Task Instance to Now.
    updateEmailLastSent(taskInstanceId) {
        TaskInstance.update({
            EmailLastSent: new Date()
        }, {
            where: {
                TaskInstanceID: taskInstanceId
            }
        }).then(function (done) {
            console.log('Email Last Send Updated!');
        }).catch(function (err) {
            console.log(err);
            throw new Error(err);
        });
    }

    //Goes through entire EmailNotification table and check their time
    //Asynchrounious, sending email does not need to wait for anything
    check() {

        var x = this;

        var now = new Date();
        var oneDay = (24 * 60 * 60 * 1000);
        var sevenDays = (7 * 24 * 60 * 60 * 1000);

        console.log('Checking Email Notification List...');

        //Retrieve entire Email Notification table
        EmailNotification.findAll({
            attributes: ['TaskInstanceID'],
        }).then(function (list) {

            //Check through each item in the list
            list.forEach(function (result) {

                TaskInstance.find({
                    where: {
                        TaskInstanceID: result.TaskInstanceID
                    }
                }).then(function (taskInstance) {
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
                    //if email last sent is more than 7 days and if task has started and it's due less than 7 days, send an email to user
                    else if ((((now - taskInstance.EmailLastSent) > sevenDays) && (taskInstance.StartDate < now)) && ((taskInstance.EndDate - now) < sevenDays)) {

                        console.log('Assignment due less than seven days! User: ', taskInstance.UserID, ' TaskInstanceID: ', taskInstance.TaskInstanceID);

                        x.sendNow(taskInstance.UserID, 'due less than seven days');
                        updateEmailLastSent(taskInstance.TaskInstanceID);

                    }

                    return null;
                });
            });
        }).catch(function (err) {
            console.log(err);
            throw new Error('EmailNotification - Something went wrong...');
        });

    }
}


module.exports = Email;