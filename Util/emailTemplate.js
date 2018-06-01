import {SERVER_PORT, FRONT_SERVER_PORT} from '../backend_settings.js';

let SUPPORT_HTML = (`
    <p>For technical support for the Participatory Learning system, contact:<br>
    <a mailto:bieber@njit.edu>bieber@njit.edu</a><br>
    Thanks,<br>
    The Participatory Learning Team</p>
`);

let INSTRUCTOR_STRING = ('If you have any questions, please contact your instructor.');

let SUPPORT_STRING = (`For technical support for the Participatory Learning system, contact: bieber@njit.edu\n
Thanks,\n\nThe Participatory Learning Team`);


exports.INITIAL_USER = {
    subject: 'Welcome to Participatory Learning System',
    text: (`Hi,\n\nYou have created the initial account in the PL website. To login, please visit the following link: https://pla.njit.edu:${FRONT_SERVER_PORT} 
    \n${SUPPORT_STRING}`),
    html:(`
        <div>
        <p>Hi,<br>
        You have created the initial account in the PL website. To login, please visit the following link:
        <br>
        https://pla.njit.edu:${FRONT_SERVER_PORT}</p>
        <br>
        ${SUPPORT_HTML}</div>
        `)
};

exports.REVISE = {
    subject: 'A Revision is Ready to Review - Participatory Learning',
    text: (`Hi,\n\nYou have a new revision avilable to review. Please login using the following link: https://pla.njit.edu:${FRONT_SERVER_PORT} 
    \n${SUPPORT_STRING}`),
    html:(`
        <div>
        <p>Hi,<br>
        You have a new revision avilable for review. Please login using the following link: https://pla.njit.edu:${FRONT_SERVER_PORT}</p>
        <br>
        ${SUPPORT_HTML}</div>
        `)
};

exports.INVITE_USER = function(data) {
    return {
        subject: 'Invited to Participatory Learning System – Next Step',
        text: (`Hi,\nYou are invited to create a new account on PL. Please visit the following link with your temporary password to finish creating your account.https://pla.njit.edu:${FRONT_SERVER_PORT}\n\nTemporary Password: ${data.pass}\n\n${SUPPORT_STRING}`),
        html:(`
            <p>Hi,</p><br>
            <p>You are invited to create an account on PLA. Please log in with your temporary password to finish creating your account.</p><br/>
            <div>https://pla.njit.edu:${FRONT_SERVER_PORT} <div>
            <br>
            <p>Temporary Password: ${data.pass} </p>
            <br><br>${SUPPORT_HTML}
            `)
    };
};

exports.INVITE_USER_NEW_TO_SYSTEM = function(data) {
    return {
        subject: 'Welcome to PLA',
        text: (`
            Hi,\n
            You are invited to create a new account on PL. Please visit the following link with your temporary password to finish creating your account.
            https://pla.njit.edu:${FRONT_SERVER_PORT} \n
            Temporary Password: ${data.pass} \n\n${SUPPORT_STRING}`),
        html:(`
            <p>Hi,</p><br>
            <p>You are invited to create an account on PLA. Please log in with your temporary password to finish creating your account.</p><br/>
            <div>https://pla.njit.edu:${FRONT_SERVER_PORT} <div>
            <br>
            <p>Temporary Password: ${data.pass} </p>
            <br><br>${SUPPORT_HTML}
            `)
    };
};

exports.NEW_TASK = {
    subject: 'New Task - Participatory Learning',
    text:(`Hi,\nA new task has started. Please visit https://pla.njit.edu:${FRONT_SERVER_PORT} to complete the task.\n\n
        ${SUPPORT_STRING}
    `),
    html:(`
        <p>Hi,</p><br>
        <p>A new task has started.<div>Please visit https://pla.njit.edu:${FRONT_SERVER_PORT} to complete the task</div></p>
        <br><br>${SUPPORT_HTML}
    `)
};

exports.RESET_TASK = {
    subject: 'Reset Task - Participatory Learning',
    text:(`Hi,\nA task has been reset. Please visit https://pla.njit.edu:${FRONT_SERVER_PORT} to complete the task.\n\n
        ${SUPPORT_STRING}
    `),
    html:(`
        <p>Hi,</p><br>
        <p>A new task has been reset.<div>Please visit https://pla.njit.edu:${FRONT_SERVER_PORT} to complete the task</div></p>
        <br><br>${SUPPORT_HTML}
    `)
};

exports.NEW_PASSWORD = {
    subject: 'Password Updated - Participatory Learning',
    text:(`Hi,\nYour password has been updated.\n\n${SUPPORT_STRING}
    `),
    html:(`
        <p>Hi,</p><br>
        <p>Your password has been updated.</div></p>
        <br><br>${SUPPORT_HTML}
    `)
};

exports.LATE = {
    subject: 'Task Late - Participatory Learning',
    text:(`Hi,\nYou have a task due. Please visit https://pla.njit.edu:${FRONT_SERVER_PORT} to complete the task.\n\n${SUPPORT_STRING}
    `),
    html:(`
        <p>Hi,</p><br>
        <p>You have a task due.<div>Please visit https://pla.njit.edu:${FRONT_SERVER_PORT} to complete the task</div></p>
        <br><br>${SUPPORT_HTML}
    `)
};

exports.RESET_PASS = function(data){
    return {
        subject: 'Password Reset - Participatory Learning',
        text:(`Hi,\nYour password has been reset. Please visit the following link and use the temporary password to complete the reset\nhttps://pla.njit.edu:${FRONT_SERVER_PORT}\n 
            Temporary Password: ${data.pass} \n
            `),
        html:(`
            <p>You have requested a password reset. Please visit the following link and use the temporary password to complete the reset </p><br>
            <p>https://pla.njit.edu:${FRONT_SERVER_PORT}</p><br>
            <p>Temporary Password: ${data.pass}</p>
            <br><br>${SUPPORT_HTML}
        `)
    };
};

exports.NEW_REPLY = function(data){
    return {
        subject: '[PLA] New Reply',
        text:(`Dear ${data.name},\nSomeone has replied to your comment. You can view the reply here: ${data.link}\n${SUPPORT_STRING}
        `),
        html:(`
            <p>Dear ${data.name},<p><br>
            <p>Someone has replied to your comment. You can view the reply here: ${data.link} </p><br>
            <br><br>${SUPPORT_HTML}
        `)
    };
};

exports.NEW_VOLUNTEER = function(data){
    return {
        subject: '[PLA] New Vlounteer',
        text:(`Dear ${data.name},\nA student has made a volunteer request. You can view the request here: ${data.link}\n${SUPPORT_STRING}
        `),
        html:(`
            <p>Dear ${data.name},<p><br>
            <p>A student has made a volunteer request. You can view the request here: ${data.link} </p><br>
            <br><br>${SUPPORT_HTML}
        `)
    };
};

exports.NEW_FLAG = function(data){
    return {
        subject: '[PLA] New Flag',
        text:(`Dear ${data.name},\nSomeone has flagged a comment. You can view the flag here: ${data.link}\n${SUPPORT_STRING}
        `),
        html:(`
            <p>Dear ${data.name},<p><br>
            <p>Someone has flagged a comment. You can view the flag here: ${data.link} </p><br>
            <br><br>${SUPPORT_HTML}
        `)
    };
};

