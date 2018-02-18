import {
    MASTER_EMAIL,
    MASTER_PASSWORD,
    EMAIL_SERVER_STATUS
} from '../Util/constant.js';
var models = require('../Model');
var Promise = require('bluebird');
var nodemailer = require('nodemailer');


import {
    Assignment,
    AssignmentGrade,
    AssignmentInstance,
    AssignmentInstance_Archive,
    Assignment_Archive,
    Badge,
    BadgeInstance,
    Category,
    CategoryInstance,
    Comments,
    CommentsArchive,
    CommentsViewed,
    Contact,
    Course,
    CourseBackUp,
    EmailNotification,
    ExtraCredit,
    FileReference,
    Goal,
    GoalInstance,
    Level,
    LevelInstance,
    Organization,
    PartialAssignments,
    ResetPasswordRequest,
    Section,
    SectionUser,
    SectionUserRecord,
    Semester,
    StudentRankSnapchot,
    SectionRankSnapchot,
    TaskActivity,
    TaskActivity_Archive,
    TaskGrade,
    TaskInstance,
    TaskInstance_Archive,
    TaskSimpleGrade,
    User,
    UserContact,
    UserLogin,
    UserBadgeInstances,
    UserPointInstances,
    VolunteerPool,
    WorkflowActivity,
    WorkflowActivity_Archive,
    WorkflowGrade,
    WorkflowInstance,
    WorkflowInstance_Archive
} from '../Util/models.js';

const logger = require('./Logger.js');

var email = 'njitplamaster@gmail.com';
// var email = 'participatory-learning@njit.edu';
//var email = 'qxl2@njit.edu';
var active = EMAIL_SERVER_STATUS;

if (active) {
    logger.log('info', '/Email: email server online');
} else {
    logger.log('info', '/Email: email server currently not activated');
}

console.log('/Email: Creating Transport');

var transporter = nodemailer.createTransport({
    /*host: 'smtp.gmail.com',
    secure: true,
    port: 465,*/
    service: 'gmail',
    secure: true,
    auth: {
        user: MASTER_EMAIL,
        pass: MASTER_PASSWORD
    },
    tls: { rejectUnauthorized: false }
});

// verify connection configuration
transporter.verify(function (error, success) {
    if (error) {
        console.log(error);
    } else {
        console.log('Server is ready to take our messages');
    }
});

console.log('/Email: Transport Created');

/*
  Constructor
*/
class Email {

    // /*
    //   Adding task instance to email notification list
    // */
    // add(taskInstanceID) {

    //     console.log('Adding TaskInstanceID', taskInstanceID, ' To Email Notification List...');

    //     EmailNotification.create({
    //         TaskInstanceID: taskInstanceID
    //     }).catch(function (err) {
    //         console.log(err);
    //     });

    // }

    // /*
    //   Removing task instance from email notification list
    // */
    // delete(taskInstanceID) {

    //     console.log('Removing TaskInstanceID', taskInstanceID, ' From Email Notification List...');

    //     EmailNotification.destroy({
    //         where: {
    //             TaskInstanceID: taskInstanceID
    //         }
    //     }).catch(function (err) {
    //         console.log(err);
    //     });
    // }

    /*
      Send an email, provide an opts will allow you to send any email to anyone.
    */
    send(opts) {
        var mailOpts;


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
        transporter.sendMail(mailOpts, function (error, response) {
            if (error) {
                console.log(error);
            } else {
                console.log('Message sent: ', response);
            }
            // console.log('Closing Transport');
            // transporter.close();
        });

    }

    /*
      Send an email now given userid and type of email needs to be sent.
    */
    async sendNow(userid, type, data) {
        //return; //for testting purposes


        if (active) {
            var x = this;
            await UserLogin.find({
                where: {
                    UserID: userid
                },
                include: [{
                    model: UserContact
                }]
            }).then(async function (result) {
                var send = result.Email;
                //send = 'qxl2@njit.edu';
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
                        text: 'You have been invited to create an account on PLA. Please log in with your temporary password to finish your account creation. \n http://pla.njit.edu:4001 \nTemporary Password: ' + data,
                        html: '<p>You have been invited to create an account on PLA. Please log in with your temporary password to finish your account creation.<div>http://pla.njit.edu:4001</div><br/>Temporary Password: ' + data + '</p>'
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
                    await x.send({
                        from: email,
                        replyTo: email,
                        to: send,
                        subject: 'Your password has been reset - PLA',
                        text: 'Your password has been reset. Please log in with your temporary password to finish resetting your password. \n http://pla.njit.edu:4001 \nTemporary Password: ' + data.pass,
                        html: '<p>Your password has been reset. Please log in with your temporary password to finish resetting your password.<div>http://pla.njit.edu:4001</div><br/>Temporary Password: ' + data.pass + '</p>'

                    });
                    break;
                case 'new_reply':
                    await x.send({
                        from: email,
                        replyTo: email,
                        to: send,
                        subject: '[PLA] New Reply',
                        text: 'Dear ' + data.Name + '\nSomeone has replied to your comment. You can view the reply here: ' + data.link + '\nThe PLA Team',
                        html: '<p>Dear ' + data.Name + '<br>Someone has replied to your comment. You can view the reply here: ' + data.link + '<br>The PLA Team</p>'

                    });
                    break;    
                case 'new_volunteer':
                    await x.send({
                        from: email,
                        replyTo: email,
                        to: send,
                        subject: '[PLA] New Volunteer',
                        text: 'Dear ' + data.Name + '\nA student has made a volunteer request. You can view the request here: ' + data.link + '\nThe PLA Team',
                        html: '<p>Dear ' + data.Name + '<br>A student has made a volunteer request. You can view the request here: ' + data.link + '<br>The PLA Team</p>'

                    });
                    break;  
                case 'new_fkag':
                    await x.send({
                        from: email,
                        replyTo: email,
                        to: send,
                        subject: '[PLA] New Volunteer',
                        text: 'Dear ' + data.Name + '\nSomeone has flagged a comment. You can view the flag here: ' + data.link + '\nThe PLA Team',
                        html: '<p>Dear ' + data.Name + '<br>Someone has flagged a comment. You can view the flag here: ' + data.link + '<br>The PLA Team</p>'

                    });
                    break;
                default:
                    logger.log('error', '/Workflow/Email/sendNow: email option not found!');
                    return null;
                }
            });

        }
    }

    // //Update Email Last Sent in Task Instance to Now.
    // updateEmailLastSent(taskInstanceId) {
    //     TaskInstance.update({
    //         EmailLastSent: new Date()
    //     }, {
    //         where: {
    //             TaskInstanceID: taskInstanceId
    //         }
    //     }).then(function (done) {
    //         console.log('Email Last Send Updated!');
    //     }).catch(function (err) {
    //         console.log(err);
    //         throw new Error(err);
    //     });
    // }

    // //Goes through entire EmailNotification table and check their time
    // //Asynchrounious, sending email does not need to wait for anything
    // check() {

    //     var x = this;

    //     var now = new Date();
    //     var oneDay = (24 * 60 * 60 * 1000);
    //     var sevenDays = (7 * 24 * 60 * 60 * 1000);

    //     console.log('Checking Email Notification List...');

    //     //Retrieve entire Email Notification table
    //     EmailNotification.findAll({
    //         attributes: ['TaskInstanceID'],
    //     }).then(function (list) {

    //         //Check through each item in the list
    //         list.forEach(function (result) {

    //             TaskInstance.find({
    //                 where: {
    //                     TaskInstanceID: result.TaskInstanceID
    //                 }
    //             }).then(function (taskInstance) {
    //                 //if task end date has past delete from Email Notification
    //                 if (taskInstance.EndDate < now) {

    //                     console.log('Assignment overdue! User: ', taskInstance.UserID, ' TaskInstanceID: ', taskInstance.TaskInstanceID);

    //                     x.delete(taskInstance.TaskInstanceID);
    //                 }
    //                 //if task has started and it's due less than 24 hours, send an email to user and delete from Email Notification
    //                 else if ((taskInstance.StartDate < now) && ((taskInstance.EndDate - now) < oneDay)) {

    //                     console.log('Assignment due less than one day! User: ', taskInstance.UserID, ' TaskInstanceID: ', taskInstance.TaskInstanceID);

    //                     x.sendNow(taskInstance.UserID, 'due less than one day');
    //                     updateEmailLastSent(taskInstance.TaskInstanceID);
    //                     x.delete(taskInstance.TaskInstanceID);

    //                 }
    //                 //if email last sent is more than 7 days and if task has started and it's due less than 7 days, send an email to user
    //                 else if ((((now - taskInstance.EmailLastSent) > sevenDays) && (taskInstance.StartDate < now)) && ((taskInstance.EndDate - now) < sevenDays)) {

    //                     console.log('Assignment due less than seven days! User: ', taskInstance.UserID, ' TaskInstanceID: ', taskInstance.TaskInstanceID);

    //                     x.sendNow(taskInstance.UserID, 'due less than seven days');
    //                     updateEmailLastSent(taskInstance.TaskInstanceID);

    //                 }

    //                 return null;
    //             });
    //         });
    //     }).catch(function (err) {
    //         console.log(err);
    //         throw new Error('EmailNotification - Something went wrong...');
    //     });

    // }
}


module.exports = Email;