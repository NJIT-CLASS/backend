import {
    MASTER_EMAIL,
    MASTER_PASSWORD,
    EMAIL_SERVER_STATUS
} from '../Util/constant.js';
import {RESET_PASS, LATE, NEW_TASK, INVITE_USER, CREATE_USER, INITIAL_USER} from '../Util/emailTemplate.js'
import {SERVER_PORT} from '../backend_settings.js'
var models = require('../Model');
var Promise = require('bluebird');
var nodemailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');


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

var active = EMAIL_SERVER_STATUS;

if (active) {
    logger.log('info', '/Email: email server online');
} else {
    logger.log('info', '/Email: email server currently not activated');
}

console.log('/Email: Creating Transport');

var transporter = nodemailer.createTransport(
smtpTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    auth: {
        user: MASTER_EMAIL,
        pass: MASTER_PASSWORD
    }
}));

let email = MASTER_EMAIL;

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
                send = 'qxl2@njit.edu';
                console.log('Sending Email To: ', send, '...');

                switch (type) {
                    case 'initial_user':
                    await x.send({
                        from: email,
                        replyTo: email,
                        to: send,
                        subject: INITIAL_USER.subject,
                        text: INITIAL_USER.text,
                        html: INITIAL_USER.html
                    });
                    break;
                    // case 'create user':
                    //     await x.send({
                    //         from: email,
                    //         replyTo: email,
                    //         to: send,
                    //         subject: CREATE_USER.subject,
                    //         text: CREATE_USER.text,
                    //         html: CREATE_USER.html
                    //     });
                    //     break;
                    case 'invite user':
                        console.log('inviting ' + send);
                        let template = await INVITE_USER(data);
                        await x.send({
                            from: email,
                            replyTo: email,
                            to: send,
                            subject: template.subject,
                            text: template.html,
                            html: template.html
                        });
                        break;
                    case 'new_task':
                        console.log('notifying ' + send);
                        // let task = await TaskInstance.find({
                        //     where:{
                        //         TaskInstanceID: data.ti_id
                        //     },
                        //     attributes: ['AssignmentInstanceID'],
                        //     include: [{
                        //         model: AssignmentInstance,
                        //         include: [{
                        //             model: Section,
                        //             include:[{
                        //                 model:Course
                        //             }]
                        //         }]
                        //     }]
                        // });
                        // let template = await NEW_TASK(data);
                        await x.send({
                            from: email,
                            replyTo: email,
                            to: send,
                            subject: NEW_TASK.subject,
                            text: NEW_TASK.text,
                            html: NEW_TASK.html
                        });
                        break;

                    case 'late':
                        await x.send({
                            from: email,
                            replyTo: email,
                            to: send,
                            subject: LATE.subject,
                            text: LATE.text,
                            html: LATE.html
                        });
                        break;
                    case 'late':
                        await x.send({
                            from: email,
                            replyTo: email,
                            to: send,
                            subject: REVISE.subject,
                            text: REVISE.text,
                            html: REVISE.html
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
                        console.log('resetting password')
                        let template2 = await RESET_PASS(data);
                        await x.send({
                            from: email,
                            replyTo: email,
                            to: send,
                            subject: template2.subject,
                            text: template2.text,
                            html: template2.html
                        });
                        break;
                    case 'new password':
                        await x.send({
                            from: email,
                            replyTo: email,
                            to: send,
                            subject: NEW_PASSWORD.subject,
                            text: NEW_PASSWORD.text,
                            html: NEW_PASSWORD.html

                        });
                        break; 
                    case 'new_reply':
                        await x.send({
                            from: email,
                            replyTo: email,
                            to: send,
                            subject: NEW_REPLY.subject,
                            text: NEW_REPLY.text,
                            html: NEW_REPLY.html

                        });
                        break;    
                    case 'new_volunteer':
                        await x.send({
                            from: email,
                            replyTo: email,
                            to: send,
                            subject: NEW_VOLUNTEER.subject,
                            text: NEW_VOLUNTEER.text,
                            html: NEW_VOLUNTEER.html

                        });
                        break;  
                    case 'new_flag':
                        await x.send({
                            from: email,
                            replyTo: email,
                            to: send,
                            subject: NEW_FLAG.subject,
                            text: NEW_FLAG.text,
                            html: NEW_FLAG.html

                        });
                        break;
                    case 'custom':
                    await x.send({
                        from: email,
                        replyTo: email,
                        to: send,
                        subject: data.subject,
                        text: data.text,
                        html: data.html

                    });
                    default:
                        logger.log('error', '/Workflow/Email/sendNow: email option not found!');
                        return null;
                    }
            });

        }
    }


}


module.exports = Email;