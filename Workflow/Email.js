import {
    MASTER_EMAIL,
    MASTER_PASSWORD,
    EMAIL_SERVER_STATUS
} from '../Util/constant.js';
import {RESET_PASS, LATE, NEW_TASK, INVITE_USER, CREATE_USER, INITIAL_USER, RESET_TASK, REVISE, INVITE_USER_NEW_TO_SYSTEM, REALLOCATE, REMOVE_REALLOCATE, CANCEL, BYPASS} from '../Util/emailTemplate.js';
import {SERVER_PORT} from '../backend_settings.js';
var models = require('../Model');
var Promise = require('bluebird');
var nodemailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');


import {
    UserContact,
    UserLogin,
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
    })
);

let email = MASTER_EMAIL;

// verify connection configuration
transporter.verify(function (error, success) {
    if (error) {
        console.log('transporter verify ',error);
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

        //console.log('Sending Mail...');

        // Send mail
        transporter.sendMail(mailOpts, function (error, response) {
            if (error) {
                //console.log(error);
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
            let template;
            await UserLogin.find({
                where: {
                    UserID: userid
                },
                include: [{
                    model: UserContact
                }]
            }).then(async function (result) {
                var send = result.Email;
                var send = 'qxl2@njit.edu';
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
                case 'invite user':
                    //console.log('inviting ' + send);
                    template = await INVITE_USER(data);
                    await x.send({
                        from: email,
                        replyTo: email,
                        to: send,
                        subject: template.subject,
                        text: template.text,
                        html: template.html
                    });
                    break;
                case 'invite_user_new_to_system':
                    //console.log('inviting ' + send);
                    template = await INVITE_USER_NEW_TO_SYSTEM(data);
                    await x.send({
                        from: email,
                        replyTo: email,
                        to: send,
                        subject: template.subject,
                        text: template.text,
                        html: template.html
                    });
                    break;
                case 'new_task':
                    template = await NEW_TASK(data);
                    await x.send({
                        from: email,
                        replyTo: email,
                        to: send,
                        subject: template.subject,
                        html: template.html,
                        text: template.text
                    });
                    break;
                case 'late':
                    template = await LATE(data);
                    await x.send({
                        from: email,
                        replyTo: email,
                        to: send,
                        subject: template.subject,
                        html: template.html,
                        text: template.text
                    });
                    break;
                case 'revise':
                    template = await REVISE(data);
                    await x.send({
                        from: email,
                        replyTo: email,
                        to: send,
                        subject: template.subject,
                        html: template.html,
                        text: template.text
                    });
                    break;
                case 'reset':
                    template = await RESET_TASK(data);
                    await x.send({
                        from: email,
                        replyTo: email,
                        to: send,
                        subject: template.subject,
                        html: template.html,
                        text: template.text
                    });
                    break;
                case 'remove_reallocated':
                    template = await REMOVE_REALLOCATE(data);
                    await x.send({
                        from: email,
                        replyTo: email,
                        to: send,
                        subject: template.subject,
                        html: template.html,
                        text: template.text
                    });
                    break;
                case 'new_reallocated':
                    template = await REALLOCATE(data);
                    await x.send({
                        from: email,
                        replyTo: email,
                        to: send,
                        subject: template.subject,
                        html: template.html,
                        text: template.text
                    });
                    break;
                case 'task_cancelled':
                    template = await CANCEL(data);
                    await x.send({
                        from: email,
                        replyTo: email,
                        to: send,
                        subject: template.subject,
                        html: template.html,
                        text: template.text
                    });
                    break;
                case 'task_bypassed':
                    template = await BYPASS(data);
                    await x.send({
                        from: email,
                        replyTo: email,
                        to: send,
                        subject: template.subject,
                        html: template.html,
                        text: template.text
                    });
                    break;
                case 'reset password':
                    console.log('resetting password');
                    template = await RESET_PASS(data);
                    await x.send({
                        from: email,
                        replyTo: email,
                        to: send,
                        subject: template.subject,
                        text: template.text,
                        html: template.html
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