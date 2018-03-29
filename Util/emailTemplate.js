
let SUPPORT_HTML = (`
    <p>For technical support for the Participatory Learning system, contact: </p>
    <p>TECHNICAL_SUPPORT_EMAIL (for that organization)</p><br>
    <p>Thanks,</p><br><br>
    <p>The Participatory Learning Team</p>
`);

let SUPPORT_STRING = (`For technical support for the Participatory Learning system, contact: \nTECHNICAL_SUPPORT_EMAIL (for that organization)\n\n
Thanks, \n\nThe Participatory Learning Team`);

exports.CREATE_USER = {
    subject: 'Welcome to PLA',
    text: (`
    Hi,\n\n 
    You have created a new account on PL website. To login, please visit the following link:\n
    http://pla.njit.edu:4001 \n\n${SUPPORT_STRING}`),
    html:(`
        <p>Hi,</p><br>
        <p>You have created a new account on PL website. To login, please visit the following link: </p>
        <br><div>http://pla.njit.edu:4001 <div><br><br>${SUPPORT_HTML}
        `)
};

exports.INVITE_USER = function(data) {
    return {
        subject: 'Welcome to PLA',
        text: (`
            Hi,\n
            You are invited to create a new account on PL. Please visit the following link with your temporary password to finish creating your account. \n 
            http://pla.njit.edu:4001 \n
            Temporary Password: ${data.pass} \n\n${SUPPORT_STRING}`),
        html:(`
            <p>Hi,</p><br>
            <p>You are invited to create an account on PLA. Please log in with your temporary password to finish creating your account.</p><br/>
            <div>http://pla.njit.edu:4001 <div>
            <br>
            <p>Temporary Password: ${data.pass} </p>
            <br><br>${SUPPORT_HTML}
            `)
    }
};

exports.NEW_TASK = {
    subject: 'New Task - Participatory Learning',
    text:(`
        Hi,\n
        A new task has started. Please visit http://pla.njit.edu:4001 to complete the task.\n\n
        ${SUPPORT_STRING}
    `),
    html:(`
        <p>Hi,</p><br>
        <p>A new task has started.<div>Please visit http://pla.njit.edu:4001 to complete the task</div></p>
        <br><br>${SUPPORT_HTML}
    `)
}

exports.NEW_PASSWORD = {
    subject: 'Password Updated - Participatory Learning',
    text:(`
        Hi,\n
        Your password has been updated.\n\n
        ${SUPPORT_STRING}
    `),
    html:(`
        <p>Hi,</p><br>
        <p>Your password has been updated.</div></p>
        <br><br>${SUPPORT_HTML}
    `)
}

exports.LATE = {
    subject: 'Task Late - Participatory Learning',
    text:(`
        Hi,\n
        You have a task due. Please visit http://pla.njit.edu:4001 to complete the task.\n\n
        ${SUPPORT_STRING}
    `),
    html:(`
        <p>Hi,</p><br>
        <p>You have a task due.<div>Please visit http://pla.njit.edu:4001 to complete the task</div></p>
        <br><br>${SUPPORT_HTML}
    `)
}

exports.RESET_PASS = function(data){
    return {
        subject: 'Password Reset - Participatory Learning',
        text:(`
            Hi,\n
            You have requested a password reset. Please visit the following link and use the temporary password to complete the reset \n
            http://pla.njit.edu:4001 \n
            Temporary Password: ${data.pass} \n\n
            ${SUPPORT_STRING}
        `),
        html:(`
            <p>Hi,<p><br>
            <p>You have requested a password reset. Please visit the following link and use the temporary password to complete the reset </p><br>
            <p>http://pla.njit.edu:4001</p><br>
            <p>Temporary Password: ${data.pass}</p>
            <br><br>${SUPPORT_HTML}
        `)
    }
}

exports.NEW_REPLY = function(data){
    return {
        subject: '[PLA] New Reply',
        text:(`
            Dear ${data.name},\n
            Someone has replied to your comment. You can view the reply here: ${data.link}\n
            ${SUPPORT_STRING}
        `),
        html:(`
            <p>Dear ${data.name},<p><br>
            <p>Someone has replied to your comment. You can view the reply here: ${data.link} </p><br>
            <br><br>${SUPPORT_HTML}
        `)
    }
}

exports.NEW_VOLUNTEER = function(data){
    return {
        subject: '[PLA] New Vlounteer',
        text:(`
            Dear ${data.name},\n
            A student has made a volunteer request. You can view the request here: ${data.link}\n
            ${SUPPORT_STRING}
        `),
        html:(`
            <p>Dear ${data.name},<p><br>
            <p>A student has made a volunteer request. You can view the request here: ${data.link} </p><br>
            <br><br>${SUPPORT_HTML}
        `)
    }
}

exports.NEW_FLAG = function(data){
    return {
        subject: '[PLA] New Flag',
        text:(`
            Dear ${data.name},\n
            Someone has flagged a comment. You can view the flag here: ${data.link}\n
            ${SUPPORT_STRING}
        `),
        html:(`
            <p>Dear ${data.name},<p><br>
            <p>Someone has flagged a comment. You can view the flag here: ${data.link} </p><br>
            <br><br>${SUPPORT_HTML}
        `)
    }
}

