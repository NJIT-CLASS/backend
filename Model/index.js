/**
 * Created by cesarsalazar on 3/29/16.
 */

var Sequelize = require("sequelize");

var sequelize = new Sequelize("class", "class", "LC,m%HNpMsVqqNCHH7WAa6P7n", {
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

    //has Many Relations

    m.Semester.hasMany(m.Section,{as : 'Sections', foreignKey: 'SemesterID'});
    m.Course.hasMany(m.Section,{as : 'Sections', foreignKey: 'CourseID'});
    m.WorkflowActivity.hasMany(m.Workflow,{as : 'Workflows', foreignKey: 'WorkflowActivityID'});
    m.AssignmentSection.hasMany(m.Workflow,{as : 'Workflows', foreignKey: 'AssignmentSectionID'});
    m.Workflow.hasMany(m.Task,{as : 'Tasks', foreignKey: 'WorlkflowID'});
    m.User.hasMany(m.SectionUser,{as : 'Users',foreignKey: 'UserID'});
    m.Section.hasMany(m.SectionUser,{as : 'SectionUsers',foreignKey: 'SectionID'});
    m.User.hasMany(m.GroupUser, {as :'GroupUsers' ,foreignKey : 'UserID'});
    m.TaskActivity.hasMany(m.Task,{as :'Tasks' ,foreignKey: 'TaskActivityID'});
    m.User.hasMany(m.Task,{as :'Tasks' ,foreignKey: 'UserID'});
    // m.Group.hasMany(m.GroupUser,{as :' GroupUsers' ,foreignKey : 'GroupID'})


})(module.exports);


module.exports.sequelize = sequelize;
