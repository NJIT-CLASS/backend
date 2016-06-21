/**
 * Created by cesarsalazar on 3/29/16.
 */

var Sequelize = require("sequelize");

process.env.dbHost = 'localhost';
process.env.dbUser = 'root';
process.env.dbPass = '123456';
process.env.database = 'CLASS/PLA';
process.env.serverPort = '4000';

var sequelize = new Sequelize(process.env.database, process.env.dbUser, process.env.dbPass, {
    host: process.env.dbHost,
    dialect: 'mysql',
    omitNull: true,

    pool: {
        max: 5,
        min: 0,
        idle: 10000
    },
});

var models = ['User','UserLogin','UserContact',
    'Course','Section','Semester',
    'Task','TaskActivity','Workflow',
    'WorkflowActivity','Assignment','AssignmentSection',
    'GroupUser','Organization','SectionUser',
    'ResetPasswordRequest','Groups'];



models.forEach(function(model) {
    module.exports[model] = sequelize.import(__dirname + '/' + model);
});


// describe relationships
(function(m) {
    //Belongs To Relations
    m.User.belongsTo(m.ResetPasswordRequest, {foreignKey: 'UserID'});
    m.User.belongsTo(m.UserLogin, {foreignKey: 'UserID'});
    m.User.belongsTo(m.UserContact, {foreignKey: 'UserContactID'});

    m.Course.belongsTo(m.User,{foreignKey: 'CreatorID'});

    m.Section.belongsTo(m.Semester,{foreignKey: 'SemesterID'});
    m.Section.belongsTo(m.Course,{foreignKey: 'CourseID'});

    m.Task.belongsTo(m.TaskActivity,{foreignKey: 'TaskActivityID'});
    m.Task.belongsTo(m.Workflow,{foreignKey: 'WorlkflowID'});
    m.Task.belongsTo(m.User,{foreignKey: 'UserID'});
    m.Task.belongsTo(m.AssignmentSection,{foreignKey: 'AssignmentSectionID'});



    m.TaskActivity.belongsTo(m.WorkflowActivity,{foreignKey: 'TA_WA_id'});
    m.TaskActivity.belongsTo(m.Assignment,{foreignKey: 'TA_AA_id'});

    m.Workflow.belongsTo(m.WorkflowActivity,{foreignKey: 'WorkflowActivityID'});
    m.Workflow.belongsTo(m.AssignmentSection,{foreignKey: 'AssignmentSectionID'});

    m.WorkflowActivity.belongsTo(m.Assignment,{foreignKey: 'WA_A_id'});


    m.SectionUser.belongsTo(m.User,{foreignKey: 'UserID'});
    m.SectionUser.belongsTo(m.Section,{foreignKey: 'SectionID'});

    m.GroupUser.belongsTo(m.User, {foreignKey : 'UserID'});
    //m.GroupUser.belongsTo(m.Group,{foreignKey : 'GroupID'});

    m.AssignmentSection.belongsTo(m.Section, {foreignKey: 'SectionID'});
    m.AssignmentSection.belongsTo(m.Assignment,{foreignKey: 'AssignmentID'});

    //m.TaskTemplate.belongsTo(m.User, {foreignKey : 'UserID'});
    //m.TaskTemplate.belongsTo(m.Section,{foreignKey: 'SectionID'});
    //m.TaskTemplate.belongsTo(m.Course,{foreignKey: 'CourseID'});
    //m.TaskTemplate.belongsTo(m.Task,{foreignKey: 'TaskID'});



    //has Many Relations

    m.Assignment.hasMany(m.AssignmentSection,{as:'AssignmentSections', foreignKey: 'AssignmentID'});
    m.Assignment.hasMany(m.WorkflowActivity, {as: 'WorkflowActivities', foreignKey: 'WA_A_id'});

    m.AssignmentSection.hasMany(m.Task,{as:'Tasks', foreignKey: 'AssignmentSectionID'});
    m.AssignmentSection.hasMany(m.Workflow,{as : 'Workflows', foreignKey: 'AssignmentSectionID'});

    m.Course.hasMany(m.Section,{as : 'Sections', foreignKey: 'CourseID'});

    m.Section.hasMany(m.AssignmentSection,{as : 'AssignmentSections',foreignKey: 'SectionID'});
    m.Semester.hasMany(m.Section,{as : 'Sections', foreignKey: 'SemesterID'});

    m.Section.hasMany(m.SectionUser,{as : 'SectionUsers',foreignKey: 'SectionID'});

    m.TaskActivity.hasMany(m.Task,{as :'Tasks' ,foreignKey: 'TaskActivityID'});

    m.Workflow.hasMany(m.Task,{as : 'Tasks', foreignKey: 'WorlkflowID'});

    m.WorkflowActivity.hasMany(m.Workflow,{as : 'Workflows', foreignKey: 'WorkflowActivityID'});

    m.User.hasMany(m.SectionUser,{as : 'Users',foreignKey: 'UserID'});
    m.User.hasMany(m.GroupUser, {as :'GroupUsers' ,foreignKey : 'UserID'});
    m.User.hasMany(m.Task,{as :'Tasks' ,foreignKey: 'UserID'});

    // m.Group.hasMany(m.GroupUser,{as :' GroupUsers' ,foreignKey : 'GroupID'})


})(module.exports);


module.exports.sequelize = sequelize;
