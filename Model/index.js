const Sequelize = require("sequelize");
// const cls = require('continuation-local-storage'),
//     namespace = cls.createNamespace('my-very-own-namespace');
// const NAMESPACE = 'my-very-own-namespace';
// //Sequelize.useCLS(namespace);
// Sequelize.cls= namespace;
var settings = require("../backend_settings");


var sequelize = new Sequelize(settings.DATABASE, settings.DB_USER, settings.DB_PASS, {
    host: settings.DB_HOST,
    dialect: 'mysql',
    omitNull: true,
    pool: {
        max: 5,
        min: 0,
        idle: 10000
    },
    logging: false
});

var models = ['Assignment', 'AssignmentInstance', 'Course', 'EmailNotification', 'Group',
    'GroupUser', 'Organization', 'ResetPasswordRequest', 'Section',
    'SectionUser', 'Semester', 'TaskActivity', 'TaskInstance', 'User',
    'UserContact', 'UserLogin', 'WorkflowActivity', 'WorkflowInstance', 'VolunteerPool',
    'AssignmentGrade', 'WorkflowGrade', 'TaskGrade', 'TaskSimpleGrade', 'PartialAssignments',
    'FileReference',
];





models.forEach(function(model) {
    module.exports[model] = sequelize.import(__dirname + '/' + model);
});


// describe relationships
(function(m) {
    //Belongs To Relations
    //Sorted By Foreign Key

    m.Course.belongsTo(m.User, {
        foreignKey: 'CreatorID'
    });

    m.User.hasOne(m.UserLogin, {
        foreignKey: 'UserID'
    });
    m.User.hasOne(m.UserContact, {
        foreignKey: 'UserID'
    });
    m.UserLogin.belongsTo(m.User, {
        foreignKey: 'UserID'
    });
    m.UserContact.belongsTo(m.User, {
        foreignKey: 'UserID'
    });
    m.SectionUser.belongsTo(m.UserLogin, {
        foreignKey: 'UserID'
    });

    m.Section.belongsTo(m.Semester, {
        foreignKey: 'SemesterID'
    });
    m.Section.belongsTo(m.Course, {
        foreignKey: 'CourseID'
    });

    m.TaskInstance.belongsTo(m.TaskActivity, {
        foreignKey: 'TaskActivityID'
    });
    m.TaskInstance.belongsTo(m.WorkflowInstance, {
        foreignKey: 'WorkflowInstanceID'
    });
    m.TaskInstance.belongsTo(m.User, {
        foreignKey: 'UserID'
    });
    m.TaskInstance.belongsTo(m.AssignmentInstance, {
        foreignKey: 'AssignmentInstanceID'
    });

    m.PartialAssignments.belongsTo(m.User, {
        foreignKey: 'UserID'
    });
    m.PartialAssignments.belongsTo(m.Course, {
        foreignKey: 'CourseID'
    });

    m.VolunteerPool.belongsTo(m.User, {
        foreignKey: 'UserID'
    });
    m.VolunteerPool.belongsTo(m.AssignmentInstance, {
        foreignKey: 'AssignmentInstanceID'
    });
    m.VolunteerPool.belongsTo(m.Section, {
        foreignKey: 'SectionID'
    });

    m.AssignmentGrade.belongsTo(m.AssignmentInstance, {
        foreignKey: 'AssignmentInstanceID'
    })
    m.AssignmentGrade.belongsTo(m.SectionUser, {
        foreignKey: 'SectionUserID'
    })

    m.WorkflowGrade.belongsTo(m.WorkflowActivity, {
        foreignKey: 'WorkflowActivityID'
    })
    m.WorkflowGrade.belongsTo(m.AssignmentInstance, {
        foreignKey: 'AssignmentInstanceID'
    })
    m.WorkflowGrade.belongsTo(m.SectionUser, {
        foreignKey: 'SectionUserID'
    })

    m.TaskGrade.belongsTo(m.TaskInstance, {
        foreignKey: 'TaskInstanceID'
    })
    m.TaskGrade.belongsTo(m.WorkflowActivity, {
        foreignKey: 'WorkflowActivityID'
    })
    m.TaskGrade.belongsTo(m.SectionUser, {
        foreignKey: 'SectionUserID'
    })

    m.TaskSimpleGrade.belongsTo(m.TaskInstance, {
        foreignKey: 'TaskInstanceID'
    })
    m.TaskSimpleGrade.belongsTo(m.WorkflowActivity, {
        foreignKey: 'WorkflowActivityID'
    })
    m.TaskSimpleGrade.belongsTo(m.SectionUser, {
        foreignKey: 'SectionUserID'
    })

    m.FileReference.belongsTo(m.User, {
        foreignKey: 'UserID'
    })

    // m.AssignmentInstance.hasMany(m.AssignmentGrade, {as:'AssignmentGrades', foreignKey: 'AssignmentInstanceID'});
    // m.User.hasMany(m.AssignmentGrade, {as:'AssignmentGrades', foreignKey: 'UserID'});



    m.TaskActivity.belongsTo(m.WorkflowActivity, {
        foreignKey: 'WorkflowActivityID'
    });
    m.TaskActivity.belongsTo(m.AssignmentInstance, {
        foreignKey: 'AssignmentInstanceID'
    });
    m.TaskActivity.belongsTo(m.Assignment, {
        foreignKey: 'AssignmentID'
    });

    m.WorkflowInstance.belongsTo(m.WorkflowActivity, {
        foreignKey: 'WorkflowActivityID'
    });
    m.WorkflowInstance.belongsTo(m.AssignmentInstance, {
        foreignKey: 'AssignmentInstanceID'
    });

    m.WorkflowActivity.belongsTo(m.Assignment, {
        foreignKey: 'AssignmentID'
    });


    m.SectionUser.belongsTo(m.User, {
        foreignKey: 'UserID'
    });
    m.SectionUser.belongsTo(m.Section, {
        foreignKey: 'SectionID'
    });

    m.GroupUser.belongsTo(m.User, {
        foreignKey: 'UserID'
    });
    //m.GroupUser.belongsTo(m.Group,{foreignKey : 'GroupID'});

    m.AssignmentInstance.belongsTo(m.Section, {
        foreignKey: 'SectionID'
    });
    m.AssignmentInstance.belongsTo(m.Assignment, {
        foreignKey: 'AssignmentID'
    });



    //has Many Relations

    m.Assignment.hasMany(m.AssignmentInstance, {
        as: 'AssignmentInstances',
        foreignKey: 'AssignmentID'
    });
    m.Assignment.hasMany(m.WorkflowActivity, {
        as: 'WorkflowActivities',
        foreignKey: 'AssignmentID'
    });
    m.Assignment.hasMany(m.TaskActivity, {
        as: 'TaskActivities',
        foreignKey: 'AssignmentID'
    });

    m.AssignmentInstance.hasMany(m.TaskInstance, {
        as: 'TaskInstances',
        foreignKey: 'AssignmentInstanceID'
    });
    m.AssignmentInstance.hasMany(m.WorkflowInstance, {
        as: 'WorkflowInstances',
        foreignKey: 'AssignmentInstanceID'
    });

    m.Course.hasMany(m.Section, {
        as: 'Sections',
        foreignKey: 'CourseID'
    });

    m.Section.hasMany(m.AssignmentInstance, {
        as: 'AssignmentInstances',
        foreignKey: 'SectionID'
    });
    m.Semester.hasMany(m.Section, {
        as: 'Sections',
        foreignKey: 'SemesterID'
    });

    m.Section.hasMany(m.SectionUser, {
        as: 'SectionUsers',
        foreignKey: 'SectionID'
    });

    m.TaskActivity.hasMany(m.TaskInstance, {
        as: 'TaskInstances',
        foreignKey: 'TaskActivityID'
    });

    m.WorkflowInstance.hasMany(m.TaskInstance, {
        as: 'TaskInstances',
        foreignKey: 'WorkflowInstanceID'
    });

    m.WorkflowActivity.hasMany(m.WorkflowInstance, {
        as: 'WorkflowInstances',
        foreignKey: 'WorkflowActivityID'
    });

    m.User.hasMany(m.SectionUser, {
        as: 'Users',
        foreignKey: 'UserID'
    });
    m.User.hasMany(m.GroupUser, {
        as: 'GroupUsers',
        foreignKey: 'UserID'
    });
    m.User.hasMany(m.TaskInstance, {
        as: 'TaskInstances',
        foreignKey: 'UserID'
    });

    //m.User.hasOne(m.UserLogin,{foreignKey: 'UserID'});
    //m.User.hasOne(m.UserContact,{foreignKey: 'UserID'});
    //m.SectionUser.hasOne(m.UserLogin,{foreignKey: 'UserID'});


})(module.exports);


// const transaction = (task) => {
//     return cls.getNamespace(NAMESPACE).get('transaction') ? task() : sequelize.transaction(task);
// };



module.exports.sequelize = sequelize;
