import {SERVER_PORT, FRONT_SERVER_PORT} from '../backend_settings.js';
import { TaskInstance, TaskActivity, Assignment, Course, Section, Semester, SectionUser, User, UserLogin, AssignmentInstance } from './models.js';
var Promise = require('bluebird');

let SUPPORT_HTML = (`
    <p>For technical support for the Participatory Learning system, contact:<br>
    <a mailto:bieber@njit.edu>bieber@njit.edu</a><br>
    Thanks,<br>
    The Participatory Learning Team</p>
`);

let INSTRUCTOR_STRING = ('If you have any questions, please contact your instructor.');

let SUPPORT_STRING = (`For technical support for the Participatory Learning system, contact: bieber@njit.edu\n
Thanks,\n\nThe Participatory Learning Team`);

const getInfoForTask = async function(ti_id){
    let data = {};
    let ti = await TaskInstance.find({
        where:{
            TaskInstanceID: ti_id
        },
        attributes:['UserID', 'TaskActivityID', 'EndDate'],
        include: [{
            model: TaskActivity,
            attributes: ['AssignmentID', 'DisplayName'],
            include: [{
                model: Assignment,
                attributes: ['CourseID', 'DisplayName']
            }]
        },{
            model: AssignmentInstance,
            attributes: ['SectionID']
        }]
    });

    let user_login = await UserLogin.find({
        where:{
            UserID: ti.UserID
        },
        attributes: ['Email']
    });

    let course = await Course.find({
        where:{
            CourseID: ti.TaskActivity.Assignment.CourseID
        },
        attributes: ['Number', 'Name']
    });

    let section = await Section.find({
        where:{
            SectionID: ti.AssignmentInstance.SectionID
        },
        attributes: ['Name']
    });

    let section_instructors = await SectionUser.findAll({
        where:{
            SectionID: ti.AssignmentInstance.SectionID,
            Role: 'Instructor'
        },
        attributes:['UserID']
    });

    data.instructors = [];

    await Promise.mapSeries(section_instructors, async (instructor) => {
        let user = await User.find({
            where:{
                UserID: instructor.UserID
            },
            attributes:['FirstName', 'LastName']
        });

        let login = await UserLogin.find({
            where:{
                UserID: instructor.UserID
            },
            attributes: ['Email']
        });

        data.instructors.push({'name': `${user.FirstName} ${user.LastName}`, 'email': login.Email});
    })
    


    data.number = course.Number;
    data.assignment_display_name = ti.TaskActivity.Assignment.DisplayName;
    data.task_display_name = ti.TaskActivity.DisplayName;
    data.due_date = ti.EndDate;
    data.section_number = section.Name;
    data.course_name = course.Name;
    data.course_number = course.Number;
    data.email = user_login.Email;

    return data;

}

const getInfoForSection = async function(sectionid){
    let data = {};
    
    
    let section = await Section.find({
        where:{
            SectionID: sectionid
        },
        attributes: ['Name', 'CourseID', 'SemesterID']
    });

    let course = await Course.find({
        where:{
            CourseID: section.CourseID
        },
        attributes: ['Number', 'Name']
    });

    let semester = await Semester.find({
        where:{
            SemesterID: section.SemesterID
        },
        attributes:['Name']
    })

    data.number = course.Number;
    data.section_number = section.Name;
    data.course_name = course.Name;
    data.course_number = course.Number;
    data.semester_name = semester.Name;

    return data;

}




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

exports.REVISE = async (data) => {
    if(data.ti_id === null || typeof data.ti_id === undefined){
        logger.log('error', '/emailTemplate/Revise: No TaskInstanceID provided.');
    }

    let info = await getInfoForTask(data.ti_id);

    return {
        subject: `${info.number}: A Revision is Ready for ${info.assignment_display_name}`,
        text: (`Hello,\n\nYou have a new revision avilable to review in the Participatory Learning System.
        ${info.task_display_name}\n\tDeadline: ${info.due_date}\n\tCourse: (${info.number}-${info.section_number}) ${info.course_name}\n\tPlease login using the following link: https://pla.njit.edu:${FRONT_SERVER_PORT}
        \nThank you for completing your tasks on time!
        \nTo contact instructor: 
        ${info.instructors.map(function (instructor) {
            return `${instructor.name}:  ${instructor.email}\n`          
        })}
        \n${SUPPORT_STRING}`)
    } 
};

exports.INVITE_USER = async (data) => {
    if(data.sectionid === null || typeof data.sectionid === undefined){
        logger.log('error', '/emailTemplate/Revise: No SectionID provided.');
    }

    if(data.pass === null || typeof data.pass === undefined){
        logger.log('error', '/emailTemplate/Revise: Empty password.');
    }

    let info = await getInfoForSection(data.sectionid);

    return {
        subject: `${info.number}: New course with Participatory Learning  – next steps`,
        text: (`Hello,\n\nWelcome to the Participatory Learning system for (${info.number}-${info.section_number}) ${info.course_name} (${info.semester_name})!
        \nYou have been added to this course as ${data.role}. 
        https://pla.njit.edu:${FRONT_SERVER_PORT}
        \n${SUPPORT_STRING}`)
    } 
};

exports.ONBOARDING = async (data) => {
    return {
        subject: `Participatory Learning system setup`,
        text: (`Hello,\n\nWelcome to the Participatory Learning system! You have successfully set up a new instance of the PL system as an administrator and the first user.
        \nSystem login: https://pla.njit.edu:${FRONT_SERVER_PORT}\nLogin ID: ${data.email}
        \n${SUPPORT_STRING}`)
    } 
};

exports.INVITE_USER_NEW_TO_SYSTEM = async (data) => {
    if(data.sectionid === null || typeof data.sectionid === undefined){
        logger.log('error', '/emailTemplate/Revise: No SectionID provided.');
    }

    if(data.pass === null || typeof data.pass === undefined){
        logger.log('error', '/emailTemplate/Revise: Empty password.');
    }

    let info = await getInfoForSection(data.sectionid);

    return {
        subject: `${info.number} & Participatory Learning`,
        text: (`Next Steps for Participatory Learning... \n\nHello,\n\nWelcome to the Participatory Learning system for (${info.number}-${info.section_number}) ${info.course_name} (${info.semester_name})!
        \nPlease log into the system now to set up your connection. You will be asked to enter the following temporary password, and then to make a new password.
        \nSystem login: https://pla.njit.edu:${FRONT_SERVER_PORT} \nLogin ID: ${data.email} \nTemporary Password: ${data.pass}
        \nWhen your instructor has started an assignment, you will be notified that your first task is ready.
        \n${SUPPORT_STRING}`)
    } 
};

exports.NEW_TASK = async (data) => {
    if(data.ti_id === null || typeof data.ti_id === undefined){
        logger.log('error', '/emailTemplate/Revise: No TaskInstanceID provided.');
    }

    let info = await getInfoForTask(data.ti_id);

    return {
        subject: `${info.number}-New Task: ${info.task_display_name}`,
        text: (`Deadline: ${info.due_date}\nAssignment: ${info.assignment_display_name} (new task)\n${info.task_display_name}\nCourse: (${info.number}-${info.section_number}) ${info.course_name}
        \nHello,\n\nYou have a new task in the Participatory Learning system. Thank you for completing your tasks on time! Please login using the following link.
        \nSystem login: https://pla.njit.edu:${FRONT_SERVER_PORT}\nLogin ID: ${info.email}
        
        \nTo contact the instructor: ${info.instructors.map(function (instructor) {
            return `\n${instructor.name}:  ${instructor.email}`          
        })}
        \n${SUPPORT_STRING}`)
    } 
};

exports.REALLOCATE = async (data) => {
    if(data.ti_id === null || typeof data.ti_id === undefined){
        logger.log('error', '/emailTemplate/Revise: No TaskInstanceID provided.');
    }

    let info = await getInfoForTask(data.ti_id);


    if(data.extra_credit){
        return {
        subject: `${info.number}: Extra Credit - New Task for ${info.assignment_display_name}`,
        text: (`Hello,\n\nYou have a new extra credit task in the Participatory Learning system:
        ${info.task_display_name}\n\tDeadline: ${info.due_date}\n\tCourse: (${info.number}-${info.section_number}) ${info.course_name}\n\tPlease login using the following link: https://pla.njit.edu:${FRONT_SERVER_PORT}
        \nThank you for completing your tasks on time!
        \nTo contact instructor: 
        ${info.instructors.map(function (instructor) {
            return `${instructor.name}:  ${instructor.email}\n`          
        })}
        \n${SUPPORT_STRING}`)
        } 
    } else {
        return {
        subject: `${info.number}: Reallocated to a New Task for ${info.assignment_display_name}`,
        text: (`Hello,\n\nYou have been reallocated new task in the Particatory Learning system:
        ${info.task_display_name}\n\tDeadline: ${info.due_date}\n\tCourse: (${info.number}-${info.section_number}) ${info.course_name}\n\tPlease login using the following link: https://pla.njit.edu:${FRONT_SERVER_PORT}
        \nThank you for completing your tasks on time!
        \nTo contact instructor: 
        ${info.instructors.map(function (instructor) {
            return `${instructor.name}:  ${instructor.email}\n`          
        })}
        \n${SUPPORT_STRING}`)
        } 
    }
    
};


exports.REMOVE_REALLOCATE = async (data) => {
    if(data.ti_id === null || typeof data.ti_id === undefined){
        logger.log('error', '/emailTemplate/Remove Reallocate: No TaskInstanceID provided.');
    }

    let info = await getInfoForTask(data.ti_id);

    return {
        subject: `${info.number}: You have removed from ${info.assignment_display_name}`,
        text: (`Hello,\n\nYou have been removed from a task, a new user has been reallcated to replace your duty.
        ${info.task_display_name}\n\tDeadline: ${info.due_date}\n\tCourse: (${info.number}-${info.section_number}) ${info.course_name}
        \nTo contact instructor: 
        ${info.instructors.map(function (instructor) {
            return `${instructor.name}:  ${instructor.email}\n`          
        })}
        \n${SUPPORT_STRING}`)
    } 
};

exports.RESET_TASK = async (data) => {
    if(data.ti_id === null || typeof data.ti_id === undefined){
        logger.log('error', '/emailTemplate/Reset Task: No TaskInstanceID provided.');
    }

    let info = await getInfoForTask(data.ti_id);

    return {
        subject: `${info.number}: Task Reset for ${info.assignment_display_name}`,
        text: (`Hello,\n\nYou have a task being reset in the Particatory Learning system:
        ${info.task_display_name}\n\tDeadline: ${info.due_date}\n\tCourse: (${info.number}-${info.section_number}) ${info.course_name}\n\tPlease login using the following link: https://pla.njit.edu:${FRONT_SERVER_PORT}
        \nThank you for completing your tasks on time!
        \nTo contact instructor: 
        ${info.instructors.map(function (instructor) {
            return `${instructor.name}:  ${instructor.email}\n`          
        })}
        \n${SUPPORT_STRING}`)
    } 
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

exports.LATE = async (data) => {
    if(data.ti_id === null || typeof data.ti_id === undefined){
        logger.log('error', '/emailTemplate/Revise: No TaskInstanceID provided.');
    }

    let info = await getInfoForTask(data.ti_id);

    return {
        subject: `${info.number}: Late for a task with ${info.assignment_display_name}`,
        text: (`Hello,\n\nCompleting tasks late holds up your peers who need your input for their work. Please finish the following task in the Participatory Learning system:
        ${info.task_display_name}\n\tDeadline: ${info.due_date}\n\tCourse: (${info.number}-${info.section_number}) ${info.course_name}\n\tPlease login using the following link: https://pla.njit.edu:${FRONT_SERVER_PORT}
        \nTo contact instructor: 
        ${info.instructors.map(function (instructor) {
            return `${instructor.name}:  ${instructor.email}\n`          
        })}
        \n${SUPPORT_STRING}`)
    } 
};

exports.RESET_PASS = function(data){
    return {
        subject: 'Password Reset: Participatory Learning',
        text:(`Next Steps for PL Password Reset...\n\nHello,
        \nYour password has been reset for the Participatory Learning system. Please log into the system now to complete the password change. You will be asked to enter the following temporary password, and then to make a new password.
        \nSystem login: https://pla.njit.edu:${FRONT_SERVER_PORT} \nLogin ID: ${data.email}\nTemporary Password: ${data.pass}
        \n${SUPPORT_STRING}
        `),
        html:(`
            <div>
            <p>Hello,<br>
            Your password has been reset for the Participatory Learning system.<br><br>
            Please log into the system now to complete the password change. You will be asked to enter the following temporary password, and then to make a new password.<br>
            https://pla.njit.edu:${FRONT_SERVER_PORT}
            Temporary Password: ${data.pass}
            <br>
            ${SUPPORT_HTML}</div>
        `)
    };
};

exports.CANCEL = async (data) => {
    if(data.ti_id === null || typeof data.ti_id === undefined){
        logger.log('error', '/emailTemplate/Revise: No TaskInstanceID provided.');
    }

    let info = await getInfoForTask(data.ti_id);

    return {
        subject: `${info.number}: Task Cancelled for ${info.assignment_display_name}`,
        text: (`Hello,\n\nOne of your tasks has been cancelled, you will no longer be able to complete it.
        ${info.task_display_name}\n\tDeadline: ${info.due_date}\n\tCourse: (${info.number}-${info.section_number}) ${info.course_name}\n\tPlease login using the following link: https://pla.njit.edu:${FRONT_SERVER_PORT}
        \nTo contact instructor: 
        ${info.instructors.map(function (instructor) {
            return `${instructor.name}:  ${instructor.email}\n`          
        })}
        \n${SUPPORT_STRING}`)
    } 
};

exports.BYPASS = async (data) => {
    if(data.ti_id === null || typeof data.ti_id === undefined){
        logger.log('error', '/emailTemplate/Revise: No TaskInstanceID provided.');
    }

    let info = await getInfoForTask(data.ti_id);

    return {
        subject: `${info.number}: Task Bypassed for ${info.assignment_display_name}`,
        text: (`Hello,\n\nOne of your tasks has been bypassed.
        ${info.task_display_name}\n\tDeadline: ${info.due_date}\n\tCourse: (${info.number}-${info.section_number}) ${info.course_name}\n\tPlease login using the following link: https://pla.njit.edu:${FRONT_SERVER_PORT}
        \nTo contact instructor: 
        ${info.instructors.map(function (instructor) {
            return `${instructor.name}:  ${instructor.email}\n`          
        })}
        \n${SUPPORT_STRING}`)
    } 
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

