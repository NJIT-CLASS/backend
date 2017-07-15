var dateFormat = require('dateformat');
var Guid = require('guid');
var models = require('./Model');
var Promise = require('bluebird');
var password = require('./password');
var moment = require('moment');

// const cls = require('continuation-local-storage');
// const Sequelize = require("sequelize");
// //const NAMESPACE = 'my-very-own-namespace';
// //Sequelize.useCLS(namespace);
// Sequelize.cls = cls.createNamespace('transactions');
const sequelize = require('./Model/index.js').sequelize;


var User = models.User;
var UserLogin = models.UserLogin;
var UserContact = models.UserContact;
var Course = models.Course;
var Section = models.Section;
var SectionUser = models.SectionUser;

var Semester = models.Semester;
var TaskInstance = models.TaskInstance;
var TaskActivity = models.TaskActivity;
var Assignment = models.Assignment;
var AssignmentGrade = models.AssignmentGrade;
var AssignmentInstance = models.AssignmentInstance;
var Organization = models.Organization;

var WorkflowInstance = models.WorkflowInstance;
var WorkflowGrade = models.WOrkflowGrade;
var WorkflowActivity = models.WorkflowActivity;
var ResetPasswordRequest = models.ResetPasswordRequest;
var EmailNotification = models.EmailNotification;

var AssignmentGrade = models.AssignmentGrade;
var WorkflowGrade = models.WorkflowGrade;
var TaskGrade = models.TaskGrade;
var TaskSimpleGrade = models.TaskSimpleGrade;
var PartialAssignments = models.PartialAssignments;
var contentDisposition = require('content-disposition');
var FileReference = models.FileReference;

var VolunteerPool = models.VolunteerPool;
var Assignment_Archive = models.Assignment_Archive;
var AssignmentInstance_Archive = models.AssignmentInstance_Archive;
var CourseBackUp = models.Course;
var TaskActivity_Archive = models.TaskActivity_Archive;
var TaskInstance_Archive = models.TaskInstance_Archive;
var WorkflowInstance_Archive = models.WorkflowInstance_Archive;
var WorkflowActivity_Archive = models.WorkflowActivity_Archive;

var Manager = require('./Workflow/Manager.js');
var Allocator = require('./Workflow/Allocator.js');
var TaskFactory = require('./Workflow/TaskFactory.js');
var TaskTrigger = require('./Workflow/TaskTrigger.js');

var Email = require('./Workflow/Email.js');
var Make = require('./Workflow/Make.js');
var Util = require('./Workflow/Util.js');
var Grade = require('./Workflow/Grade.js');
var FlatToNested = require('flat-to-nested');
var fs = require('fs');


const multer = require('multer'); //TODO: we may need to limit the file upload size
var storage = multer({
    dest: './files/'
});
const logger = require('winston');

logger.configure({
    transports: [
        new(logger.transports.Console)({
            level: 'debug',
            colorize: true,
            // json: true,
        }),
        new(logger.transports.File)({
            name: 'info-file',
            filename: 'logs/filelog-info.log',
            level: 'info',
        }),
        new(logger.transports.File)({
            name: 'error-file',
            filename: 'logs/filelog-error.log',
            level: 'error',
        })
    ]
});

// function transaction(task) {
//   return cls.getNamespace(NAMESPACE).get('transaction') ? task() : sequelize.transaction(task);
// };


//-----------------------------------------------------------------------------------------------------


function REST_ROUTER(router) {
    var self = this;
    self.handleRoutes(router);
}

//-----------------------------------------------------------------------------------------------------

REST_ROUTER.prototype.handleRoutes = function (router) {


    // router.get("/Test", function(req, res) {
    //     return sequelize.transaction(function(t) {
    //         return SectionUser.create({
    //             //SectionUserID: 1,
    //             SectionID: 6,
    //             UserID: 5,
    //             Role: 'Student',
    //             Active: '1'
    //         }, {
    //             transaction: t
    //         }).then(function(){
    //           SectionUser.create({
    //               SectionUserID: 1,
    //               SectionID: 6,
    //               UserID: 7,
    //               Role: 'Student',
    //               Active: '1'
    //           }, {
    //               transaction: t
    //           })
    //         });
    //
    //     });
    //     //sequelize.transaction(function(t){
    //     // SectionUser.create({
    //     //     SectionID: 6,
    //     //     UserID: 4,
    //     //     Role: 'Student',
    //     //     Active: '1'
    //     // }).then(function(done) {
    //     //   SectionUser.create({
    //     //       SectionUserID: 1,
    //     //       SectionID: 6,
    //     //       UserID: 5,
    //     //       Role: 'Student',
    //     //       Active: '1'
    //     //   })
    //     // }).catch(function(err) {
    //     //     console.log(err);
    //     // })
    //     //});
    // });

    router.get('/test', async function (req, res) {

        // var tf = new TaskFactory();
        // var make = new Make();
        //var users = await make.allocateUsers(1, 3);


        var grade = new Grade();

        //grade.addSimpleGrade(1);
        grade.addTaskGrade(1, 99, 100);
        await grade.addWorkflowGrade(1, 3, 99);
        await grade.addAssignmentGrade(1, 3, 99);
        res.status(200).end();
    });

    //Endpoint to return VolunteerPool list of Volunteers
    router.get('/VolunteerPool/', function (req, res) {

        VolunteerPool.findAll({
            attributes: ['UserID', 'SectionID', 'AssignmentInstanceID']
        }).then(function (rows) {
            res.json({
                'Error': false,
                'Message': 'Success',
                'Volunteers': rows
            });
        }).catch(function (err) {
            console.log('/VolunteerPool/ ' + err.message);
            res.status(401).end();
        });


    });

    //Endpoint to return count total of Volunteers
    router.get('/VolunteerPool/countOfUsers', function (req, res) {
        console.log('VolunteerPool/count was called');
        VolunteerPool.findAll({}).then(function (rows) {
            res.json({
                'Error_': false,
                'Message': 'Success',
                'Number of Volunteers': rows.length
            });
        }).catch(function (err) {
            console.log('/VolunteerPool/ ' + err.message);
            res.status(401).end();
        });


    });

    //Endpoint to return list of volunteers in a section
    router.get('/VolunteerPool/VolunteersInSection/:SectionID', function (req, res) {
        console.log('/VolunteerPool/VolunteersInSection was called');
        VolunteerPool.findAll({
            where: {
                SectionID: req.params.SectionID
            },
            attributes: ['UserID', 'SectionID', 'AssignmentInstanceID']
        }).then(function (rows) {
            res.json({
                'Error': false,
                'Message': 'Success',
                'Volunteers': rows
            });
        }).catch(function (err) {
            console.log('/VolunteerPool/ ' + err.message);
            res.status(401).end();
        });


    });


    //Endpoint to return VolunteerPool Information for the student
    router.get('/VolunteerPool/UserInPool/:UserID', function (req, res) {
        console.log('/VolunteerPool/:UserID was called');
        VolunteerPool.findAll({
            where: {
                UserID: req.params.UserID
            },
            attributes: ['UserID', 'SectionID', 'AssignmentInstanceID']
        }).then(function (rows) {
            res.json({
                'Error': false,
                'Message': 'Success',
                'Volunteers': rows
            });
        }).catch(function (err) {
            console.log('/VolunteerPool/ ' + err.message);
            res.status(401).end();
        });


    });


    //Endpoint to remove from VolunteerPool
    router.post('/VolunteerPool/deleteVolunteer', function (req, res) {

        VolunteerPool.destroy({
            where: {
                UserID: req.body.UserID,
                SectionID: req.body.SectionID
                //AssignmentInstanceID: req.body.AssignmentInstanceID
            }
        }).then(function (rows) {
            console.log('Delete User Success');
            res.status(200).end();
        }).catch(function (err) {
            console.log('/course/deleteuser : ' + err.message);

            res.status(400).end();
        });


    });

    //Create another call saying "This student is volunteered for all assignments in section";
    //check approval required status

    //Endpoint to add a user to a course
    router.post('/VolunteerPool/add', function (req, res) {
        console.log('/VolunteerPool/add : was called');

        if (req.body.UserID === null || req.body.SectionID === null /*|| req.body.AssignmentInstanceID === null*/ ) {
            console.log('/VolunteerPool/add : Missing attributes');
            res.status(400).end();
        }

        console.log('got to create part');
        //console.log("UserID: " + req.params.UserID);
        VolunteerPool.create({
            UserID: req.body.UserID,
            SectionID: req.body.SectionID,
            // AssignmentInstanceID: req.body.AssignmentInstanceID
        }).then(function (rows) {
            console.log('add User Success');
            res.status(200).end();
        }).catch(function (err) {
            console.log(err);
            res.status(400).end();
        });
        //             });
        // });
    });


    //Endpoint to change status of volunteer individually
    router.post('/VolunteerPool/individualStatusUpdate/', function (req, res) {
        console.log('Volunteerpool id rec: ' + req.body.VolunteerPoolID);
        VolunteerPool.update({
            status: req.body.status
        }, {
            where: {
                VolunteerPoolID: req.body.VolunteerPoolID
            }
        }).then(function () {
            console.log('update success');
            res.status(201).end();
        }).catch(function (err) {
            console.log('/VolunteerPool/individualStatusUpdate ' + err.message);
            res.status(401).end();
        });


    });

    //Endpoint to change status of volunteer update all in section
    router.post('/VolunteerPool/sectionlStatusUpdate/', function (req, res) {

        VolunteerPool.update({
            status: req.body.status
        }, {
            where: {
                SectionID: req.body.SectionID
            }
        }).then(function () {
            console.log('update success');
            res.status(401).end();
        }).catch(function (err) {
            console.log('/VolunteerPool/sectionlStatusUpdate ' + err.message);
            res.status(401).end();
        });

    });

    //Endpoint to change status of volunteer update all in assignment instance
    router.post('/VolunteerPool/assignmentInstanceStatusUpdate/', function (req, res) {

        VolunteerPool.update({
            status: req.body.status
        }, {
            where: {
                AssignmentInstanceID: req.body.AssignmentInstanceID
            }
        }).then(function () {
            console.log('update success');
            res.status(401).end();
        }).catch(function (err) {
            console.log('/VolunteerPool/sectionlStatusUpdate ' + err.message);
            res.status(401).end();
        });


    });



    //-------------------------------------------------------------------------------------------------



    //Endpoint to archive assignment activity table entry by giving assignment id
    router.get('/AssignmentArchive/save/:AssignmentID', function (req, res) {
        var assignmentArray = new Array();
        Assignment.findAll({
            where: {
                AssignmentID: req.params.AssignmentID
            },
            attributes: ['AssignmentID', 'OwnerID', 'WorkflowActivityIDs', 'Instructions', 'Documentation', 'GradeDistribution', 'Name', 'Type', 'DisplayName', 'SectionID', 'CourseID', 'SemesterID', 'VersionHistory']
        }).then(function (rows) {
            //console.log(rows[0].OwnerID);

            Assignment_Archive.create({
                AssignmentID: rows[0].AssignmentID,
                OwnerID: rows[0].OwnerID,
                WorkflowActivityIDs: rows[0].WorkflowActivityIDs,
                Instructions: rows[0].Instructions,
                Documentation: rows[0].Documentation,
                GradeDistribution: rows[0].GradeDistribution,
                Name: rows[0].Name,
                Type: rows[0].Type,
                DisplayName: rows[0].DisplayName,
                SectionID: rows[0].SectionID,
                CourseID: rows[0].CourseID,
                SemesterID: rows[0].SemesterID,
                VersionHistory: rows[0].VersionHistory

            });
            res.status(401).end();
        }).catch(function (err) {
            console.log('/AssignmentArchive/save/:AssignmentInstanceID ' + err.message);
            res.status(401).end();
        });
        //         Assignment.destroy({
        //             where: {
        //                  AssignmentID: req.params.AssignmentID
        //             }
        //         }).then(function(rows) {
        //             console.log("Delete workflow instance Success and saved to other back up");
        //             res.status(201).end();
        //         });
    });

    //Endpoint to restore assignment activity table entry by giving assignment id
    router.get('/AssignmentRestore/save/:AssignmentID', function (req, res) {
        var assignmentArray = new Array();
        Assignment_Archive.findAll({
            where: {
                AssignmentID: req.params.AssignmentID
            },
            attributes: ['AssignmentID', 'OwnerID', 'WorkflowActivityIDs', 'Instructions', 'Documentation', 'GradeDistribution', 'Name', 'Type', 'DisplayName', 'SectionID', 'CourseID', 'SemesterID', 'VersionHistory']
        }).then(function (rows) {
            //console.log(rows[0].OwnerID);

            Assignment.create({
                AssignmentID: rows[0].AssignmentID,
                OwnerID: rows[0].OwnerID,
                WorkflowActivityIDs: rows[0].WorkflowActivityIDs,
                Instructions: rows[0].Instructions,
                Documentation: rows[0].Documentation,
                GradeDistribution: rows[0].GradeDistribution,
                Name: rows[0].Name,
                Type: rows[0].Type,
                DisplayName: rows[0].DisplayName,
                SectionID: rows[0].SectionID,
                CourseID: rows[0].CourseID,
                SemesterID: rows[0].SemesterID,
                VersionHistory: rows[0].VersionHistory

            });
            res.status(401).end();
        }).catch(function (err) {
            console.log('/AssignmentRestore/save/:AssignmentInstanceID ' + err.message);
            res.status(401).end();
        });
        //         Assignment.destroy({
        //             where: {
        //                  AssignmentID: req.params.AssignmentID
        //             }
        //         }).then(function(rows) {
        //             console.log("Delete workflow instance Success and saved to other back up");
        //             res.status(201).end();
        //         });
    });

    //Endpoint to archive assignment instance table entry by giving AssignmentInstanceID
    router.get('/AssignmentInstanceArchive/save/:AssignmentInstanceID', function (req, res) {
        var assignmentArray = new Array();
        console.log(' AssignmentInstanceArchive is called\n');
        AssignmentInstance.findAll({
            where: {
                AssignmentInstanceID: req.params.AssignmentInstanceID
            },
            attributes: ['AssignmentInstanceID', 'AssignmentID', 'SectionID', 'StartDate', 'EndDate', 'WorkflowCollection', 'WorkflowTiming']
        }).then(function (rows) {
            //console.log(rows[0].OwnerID);
            var arrayLength = rows.length;
            for (var x = 0; x < arrayLength; x++) {

                AssignmentInstance_Archive.create({
                    AssignmentInstanceID: rows[x].AssignmentInstanceID,
                    AssignmentID: rows[x].AssignmentID,
                    SectionID: rows[x].SectionID,
                    StartDate: rows[x].StartDate,
                    EndDate: rows[x].EndDate,
                    WorkflowCollection: rows[x].WorkflowCollection,
                    WorkflowTiming: rows[x].WorkflowTiming

                });
            }
            //200 for OK
            res.status(201).end();
        }).catch(function (err) {
            console.log(' /AssignmentInstanceArchive/save/:AssignmentInstanceID-------' + err.message);
            res.status(401).end();
        });
        //         TaskActivity.destroy({
        //             where: {
        //                 AssignmentInstanceID: req.params.AssignmentInstanceID
        //             }
        //         }).then(function(rows) {
        //             console.log("Delete TaskActivityArchive Success and saved to other back up");
        //             res.status(201).end();
        //         });
    });

    //Endpoint to restore assignment instance table entry by giving AssignmentInstanceID
    router.get('/AssignmentInstanceRestore/save/:AssignmentInstanceID', function (req, res) {
        var assignmentArray = new Array();
        console.log(' AssignmentInstanceRestore is called\n');
        AssignmentInstance_Archive.findAll({
            where: {
                AssignmentInstanceID: req.params.AssignmentInstanceID
            },
            attributes: ['AssignmentInstanceID', 'AssignmentID', 'SectionID', 'StartDate', 'EndDate', 'WorkflowCollection', 'WorkflowTiming']
        }).then(function (rows) {
            //console.log(rows[0].OwnerID);
            var arrayLength = rows.length;
            for (var x = 0; x < arrayLength; x++) {

                AssignmentInstance.create({
                    AssignmentInstanceID: rows[x].AssignmentInstanceID,
                    AssignmentID: rows[x].AssignmentID,
                    SectionID: rows[x].SectionID,
                    StartDate: rows[x].StartDate,
                    EndDate: rows[x].EndDate,
                    WorkflowCollection: rows[x].WorkflowCollection,
                    WorkflowTiming: rows[x].WorkflowTiming

                });
            }
            //200 for OK
            res.status(201).end();
        }).catch(function (err) {
            console.log(' /AssignmentInstanceRestore/save/:AssignmentInstanceID-------' + err.message);
            res.status(401).end();
        });
        //         TaskActivity.destroy({
        //             where: {
        //                 AssignmentInstanceID: req.params.AssignmentInstanceID
        //             }
        //         }).then(function(rows) {
        //             console.log("Delete TaskActivityArchive Success and saved to other back up");
        //             res.status(201).end();
        //         });
    });

    //Endpoint to archive task actvity table entry by giving assignment id
    router.get('/TaskActivityArchive/save/:AssignmentID', function (req, res) {
        var assignmentArray = new Array();
        console.log('TaskActivityArchive is called\n');
        TaskActivity.findAll({
            where: {
                AssignmentID: req.params.AssignmentID
            },
            attributes: ['TaskActivityID', 'WorkflowActivityID', 'AssignmentID', 'Name', 'Type', 'FileUpload', 'DueType', 'StartDelay', 'AtDUrationEnd', 'WhatIfLate', 'DisplayName', 'Documentation', 'OneOrSeparate', 'AssigneeConstraints', 'Difficulty', 'SimpleGrade', 'IsFinalGradingTask', 'Instructions', 'Rubric', 'Fields', 'AllowReflection', 'AllowAssessment', 'NumberParticipants', 'RefersToWhichTaskThreshold', 'FunctionType', 'Function', 'AllowDispute', 'LeadsToNewProblem', 'LeadsToNewSolution', 'VisualID', 'VersionHistory', 'RefersToWhichTask', 'TriggerCondition', 'PreviousTasks', 'NextTasks', 'MinimumDuration', 'AssignmentInstanceID']
        }).then(function (rows) {
            //console.log(rows[0].OwnerID);
            var arrayLength = rows.length;
            for (var x = 0; x < arrayLength; x++) {

                TaskActivity_Archive.create({
                    TaskActivityID: rows[x].TaskActivityID,
                    WorkflowActivityID: rows[x].WorkflowActivityID,
                    AssignmentID: rows[x].AssignmentID,
                    Name: rows[x].Name,
                    Type: rows[x].Type,
                    FileUpload: rows[x].FileUpload,
                    DueType: rows[x].DueType,
                    StartDelay: rows[x].StartDelay,
                    AtDUrationEnd: rows[x].AtDUrationEnd,
                    WhatIfLate: rows[x].WhatIfLate,
                    DisplayName: rows[x].DisplayName,
                    Documentation: rows[x].Documentation,
                    OneOrSeparate: rows[x].OneOrSeparate,
                    AssigneeConstraints: rows[x].AssigneeConstraints,
                    Difficulty: rows[x].Difficulty,
                    SimpleGrade: rows[x].SimpleGrade,
                    IsFinalGradingTask: rows[x].IsFinalGradingTask,
                    Instructions: rows[x].Instructions,
                    Rubric: rows[x].Rubric,
                    Fields: rows[x].Fields,
                    AllowReflection: rows[x].AllowReflection,
                    AllowAssessment: rows[x].AllowAssessment,
                    NumberParticipants: rows[x].NumberParticipants,
                    RefersToWhichTaskThreshold: rows[x].RefersToWhichTaskThreshold,
                    FunctionType: rows[x].FunctionType,
                    Function: rows[x].Function,
                    AllowDispute: rows[x].AllowDispute,
                    LeadsToNewProblem: rows[x].LeadsToNewProblem,
                    LeadsToNewSolution: rows[x].LeadsToNewSolution,
                    VisualID: rows[x].VisualID,
                    VersionHistory: rows[x].VersionHistory,
                    RefersToWhichTask: rows[x].RefersToWhichTask,
                    TriggerCondition: rows[x].TriggerCondition,
                    PreviousTasks: rows[x].PreviousTasks,
                    NextTasks: rows[x].NextTasks,
                    MinimumDuration: rows[x].MinimumDuration,
                    AssignmentInstanceID: rows[x].AssignmentInstanceID

                });
            }
            //200 for OK
            res.status(201).end();
        }).catch(function (err) {
            console.log('/TaskActivityArchive/save/:AssignmentID ' + err.message);
            res.status(401).end();
        });

        //         TaskActivity.destroy({
        //             where: {
        //                 AssignmentID: req.params.AssignmentID
        //             }
        //         }).then(function(rows) {
        //             console.log("Delete TaskActivityArchive Success and saved to other back up");
        //             res.status(201).end();
        //         });
    });

    //Endpoint to restore task actvity table entry by giving assignment id (Note: Could not test - should work)
    router.get('/TaskActivityRestore/save/:AssignmentID', function (req, res) {
        var assignmentArray = new Array();
        console.log('TaskActivityRestore is called\n');
        TaskActivity_Archive.findAll({
            where: {
                AssignmentID: req.params.AssignmentID
            },
            attributes: ['TaskActivityID', 'WorkflowActivityID', 'AssignmentID', 'Name', 'Type', 'FileUpload', 'DueType', 'StartDelay', 'AtDUrationEnd', 'WhatIfLate', 'DisplayName', 'Documentation', 'OneOrSeparate', 'AssigneeConstraints', 'Difficulty', 'SimpleGrade', 'IsFinalGradingTask', 'Instructions', 'Rubric', 'Fields', 'AllowReflection', 'AllowAssessment', 'NumberParticipants', 'RefersToWhichTaskThreshold', 'FunctionType', 'Function', 'AllowDispute', 'LeadsToNewProblem', 'LeadsToNewSolution', 'VisualID', 'VersionHistory', 'RefersToWhichTask', 'TriggerCondition', 'PreviousTasks', 'NextTasks', 'MinimumDuration', 'AssignmentInstanceID']
        }).then(function (rows) {
            //console.log(rows[0].OwnerID);
            var arrayLength = rows.length;
            for (var x = 0; x < arrayLength; x++) {

                TaskActivity.create({
                    TaskActivityID: rows[x].TaskActivityID,
                    WorkflowActivityID: rows[x].WorkflowActivityID,
                    AssignmentID: rows[x].AssignmentID,
                    Name: rows[x].Name,
                    Type: rows[x].Type,
                    FileUpload: rows[x].FileUpload,
                    DueType: rows[x].DueType,
                    StartDelay: rows[x].StartDelay,
                    AtDUrationEnd: rows[x].AtDUrationEnd,
                    WhatIfLate: rows[x].WhatIfLate,
                    DisplayName: rows[x].DisplayName,
                    Documentation: rows[x].Documentation,
                    OneOrSeparate: rows[x].OneOrSeparate,
                    AssigneeConstraints: rows[x].AssigneeConstraints,
                    Difficulty: rows[x].Difficulty,
                    SimpleGrade: rows[x].SimpleGrade,
                    IsFinalGradingTask: rows[x].IsFinalGradingTask,
                    Instructions: rows[x].Instructions,
                    Rubric: rows[x].Rubric,
                    Fields: rows[x].Fields,
                    AllowReflection: rows[x].AllowReflection,
                    AllowAssessment: rows[x].AllowAssessment,
                    NumberParticipants: rows[x].NumberParticipants,
                    RefersToWhichTaskThreshold: rows[x].RefersToWhichTaskThreshold,
                    FunctionType: rows[x].FunctionType,
                    Function: rows[x].Function,
                    AllowDispute: rows[x].AllowDispute,
                    LeadsToNewProblem: rows[x].LeadsToNewProblem,
                    LeadsToNewSolution: rows[x].LeadsToNewSolution,
                    VisualID: rows[x].VisualID,
                    VersionHistory: rows[x].VersionHistory,
                    RefersToWhichTask: rows[x].RefersToWhichTask,
                    TriggerCondition: rows[x].TriggerCondition,
                    PreviousTasks: rows[x].PreviousTasks,
                    NextTasks: rows[x].NextTasks,
                    MinimumDuration: rows[x].MinimumDuration,
                    AssignmentInstanceID: rows[x].AssignmentInstanceID

                });
            }
            //200 for OK
            res.status(201).end();
        }).catch(function (err) {
            console.log('/TaskActivityRestore/save/:AssignmentID ' + err.message);
            res.status(401).end();
        });

        //         TaskActivity.destroy({
        //             where: {
        //                 AssignmentID: req.params.AssignmentID
        //             }
        //         }).then(function(rows) {
        //             console.log("Delete TaskActivityArchive Success and saved to other back up");
        //             res.status(201).end();
        //         });
    });

    //Endpoint to archive task instance table entry by giving  AssignmentInstanceID
    router.get('/TaskInstanceArchive/save/:AssignmentInstanceID', function (req, res) {
        var assignmentArray = new Array();
        console.log('TaskInstanceArchive is called\n');
        TaskInstance.findAll({
            where: {
                AssignmentInstanceID: req.params.AssignmentInstanceID
            },
            attributes: ['TaskInstanceID', 'UserID', 'TaskActivityID', 'WorkflowInstanceID', 'AssignmentInstanceID', 'GroupID', 'Status', 'StartDate', 'EndDate', 'ActualEndDate', 'Data', 'UserHistory', 'FinalGrade', 'Files', 'ReferencedTask', 'NextTask', 'PreviousTask', 'EmailLastSent']
        }).then(function (rows) {
            //console.log(rows[0].OwnerID);
            var arrayLength = rows.length;
            for (var x = 0; x < arrayLength; x++) {

                TaskInstance_Archive.create({

                    TaskInstanceID: rows[x].TaskInstanceID,
                    UserID: rows[x].UserID,
                    TaskActivityID: rows[x].TaskActivityID,
                    WorkflowInstanceID: rows[x].WorkflowInstanceID,
                    AssignmentInstanceID: rows[x].AssignmentInstanceID,
                    GroupID: rows[x].GroupID,
                    Status: rows[x].Status,
                    StartDate: rows[x].StartDate,
                    EndDate: rows[x].EndDate,
                    ActualEndDate: rows[x].ActualEndDate,
                    Data: rows[x].Data,
                    UserHistory: rows[x].UserHistory,
                    FinalGrade: rows[x].FinalGrade,
                    Files: rows[x].Files,
                    ReferencedTask: rows[x].ReferencedTask,
                    NextTask: rows[x].NextTask,
                    PreviousTask: rows[x].PreviousTask,
                    EmailLastSent: rows[x].EmailLastSent

                });
            }
            //200 for OK
            res.status(201).end();
        }).catch(function (err) {
            console.log('/TaskInstanceArchive/save/:AssignmentInstanceID ' + err.message);
            res.status(401).end();
        });

        //         TaskInstance.destroy({
        //             where: {
        //                 AssignmentInstanceID: req.params.AssignmentInstanceID
        //             }
        //         }).then(function(rows) {
        //             console.log("Delete task instance Success and saved to other back up");
        //             res.status(201).end();
        //         });


    });

    //Endpoint to archive task instance table entry by giving  AssignmentInstanceID
    router.get('/TaskInstanceRestore/save/:AssignmentInstanceID', function (req, res) {
        var assignmentArray = new Array();
        console.log('TaskInstanceRestore is called\n');
        TaskInstance_Archive.findAll({
            where: {
                AssignmentInstanceID: req.params.AssignmentInstanceID
            },
            attributes: ['TaskInstanceID', 'UserID', 'TaskActivityID', 'WorkflowInstanceID', 'AssignmentInstanceID', 'GroupID', 'Status', 'StartDate', 'EndDate', 'ActualEndDate', 'Data', 'UserHistory', 'FinalGrade', 'Files', 'ReferencedTask', 'NextTask', 'PreviousTask', 'EmailLastSent']
        }).then(function (rows) {
            //console.log(rows[0].OwnerID);
            var arrayLength = rows.length;
            for (var x = 0; x < arrayLength; x++) {

                TaskInstance.create({

                    TaskInstanceID: rows[x].TaskInstanceID,
                    UserID: rows[x].UserID,
                    TaskActivityID: rows[x].TaskActivityID,
                    WorkflowInstanceID: rows[x].WorkflowInstanceID,
                    AssignmentInstanceID: rows[x].AssignmentInstanceID,
                    GroupID: rows[x].GroupID,
                    Status: rows[x].Status,
                    StartDate: rows[x].StartDate,
                    EndDate: rows[x].EndDate,
                    ActualEndDate: rows[x].ActualEndDate,
                    Data: rows[x].Data,
                    UserHistory: rows[x].UserHistory,
                    FinalGrade: rows[x].FinalGrade,
                    Files: rows[x].Files,
                    ReferencedTask: rows[x].ReferencedTask,
                    NextTask: rows[x].NextTask,
                    PreviousTask: rows[x].PreviousTask,
                    EmailLastSent: rows[x].EmailLastSent

                });
            }
            //200 for OK
            res.status(201).end();
        }).catch(function (err) {
            console.log('/TaskInstanceRestore/save/:AssignmentInstanceID ' + err.message);
            res.status(401).end();
        });

        //         TaskInstance.destroy({
        //             where: {
        //                 AssignmentInstanceID: req.params.AssignmentInstanceID
        //             }
        //         }).then(function(rows) {
        //             console.log("Delete task instance Success and saved to other back up");
        //             res.status(201).end();
        //         });


    });

    //Endpoint to archive workflow instance table entry by giving AssignmentInstanceID
    router.get('/WorkflowInstanceArchive/save/:AssignmentInstanceID', function (req, res) {


        var assignmentArray = new Array();
        console.log('WorkflowInstanceArchive is called\n');
        WorkflowInstance.findAll({
            where: {
                AssignmentInstanceID: req.params.AssignmentInstanceID
            },
            attributes: ['WorkflowInstanceID', 'WorkflowActivityID', 'AssignmentInstanceID', 'StartTime', 'EndTime', 'TaskCollection', 'Data']
        }).then(function (rows) {
            //console.log(rows[0].OwnerID);
            var arrayLength = rows.length;
            for (var x = 0; x < arrayLength; x++) {

                WorkflowInstance_Archive.create({
                    WorkflowInstanceID: rows[x].WorkflowInstanceID,
                    WorkflowActivityID: rows[x].WorkflowActivityID,
                    AssignmentInstanceID: rows[x].AssignmentInstanceID,
                    StartTime: rows[x].StartTime,
                    EndTime: rows[x].EndTime,
                    TaskCollection: rows[x].TaskCollection,
                    Data: rows[x].Data

                });
            }
            //200 for OK
            res.status(201).end();
        }).catch(function (err) {
            console.log('/WorkflowInstanceArchive/save/:AssignmentInstanceID' + err.message);
            res.status(401).end();
        });
        //         WorkflowInstance.destroy({
        //             where: {
        //                 AssignmentInstanceID: req.params.AssignmentInstanceID
        //             }
        //         }).then(function(rows) {
        //             console.log("Delete workflow instance Success and saved to other back up");
        //             res.status(201).end();
        //         });

    });

    //Endpoint to restore workflow instance table entry by giving AssignmentInstanceID
    router.get('/WorkflowInstanceRestore/save/:AssignmentInstanceID', function (req, res) {


        var assignmentArray = new Array();
        console.log('WorkflowInstanceRestore is called\n');
        WorkflowInstance_Archive.findAll({
            where: {
                AssignmentInstanceID: req.params.AssignmentInstanceID
            },
            attributes: ['WorkflowInstanceID', 'WorkflowActivityID', 'AssignmentInstanceID', 'StartTime', 'EndTime', 'TaskCollection', 'Data']
        }).then(function (rows) {
            //console.log(rows[0].OwnerID);
            var arrayLength = rows.length;
            for (var x = 0; x < arrayLength; x++) {

                WorkflowInstance.create({
                    WorkflowInstanceID: rows[x].WorkflowInstanceID,
                    WorkflowActivityID: rows[x].WorkflowActivityID,
                    AssignmentInstanceID: rows[x].AssignmentInstanceID,
                    StartTime: rows[x].StartTime,
                    EndTime: rows[x].EndTime,
                    TaskCollection: rows[x].TaskCollection,
                    Data: rows[x].Data

                });
            }
            //200 for OK
            res.status(201).end();
        }).catch(function (err) {
            console.log('/WorkflowInstanceRestore/save/:AssignmentInstanceID' + err.message);
            res.status(401).end();
        });
        //         WorkflowInstance.destroy({
        //             where: {
        //                 AssignmentInstanceID: req.params.AssignmentInstanceID
        //             }
        //         }).then(function(rows) {
        //             console.log("Delete workflow instance Success and saved to other back up");
        //             res.status(201).end();
        //         });

    });

    //Endpoint to archive workflow actvity table entry by giving AssignmentID
    router.get('/WorkflowActivityArchive/save/:AssignmentID', function (req, res) {
        var assignmentArray = new Array();
        console.log(' WorkflowActivityArchive is called\n');
        WorkflowActivity.findAll({
            where: {
                AssignmentID: req.params.AssignmentID
            },
            attributes: ['WorkflowActivityID', 'AssignmentID', 'TaskActivityCollection', 'Name', 'Type', 'GradeDistribution', 'NumberOfSets', 'Documentation', 'GroupSize', 'StartTaskActivity', 'WorkflowStructure', 'VersionHistory']
        }).then(function (rows) {
            //console.log(rows[0].OwnerID);
            var arrayLength = rows.length;
            for (var x = 0; x < arrayLength; x++) {

                WorkflowActivity_Archive.create({
                    WorkflowActivityID: rows[x].WorkflowActivityID,
                    AssignmentID: rows[x].AssignmentID,
                    TaskActivityCollection: rows[x].TaskActivityCollection,
                    Name: rows[x].Name,
                    Type: rows[x].Type,
                    GradeDistribution: rows[x].GradeDistribution,
                    NumberOfSets: rows[x].NumberOfSets,
                    Documentation: rows[x].Documentation,
                    GroupSize: rows[x].GroupSize,
                    StartTaskActivity: rows[x].StartTaskActivity,
                    WorkflowStructure: rows[x].WorkflowStructure,
                    VersionHistory: rows[x].VersionHistory

                });
            }
            //200 for OK
            res.status(201).end();
        }).catch(function (err) {
            console.log(' /WorkflowActivityArchive/save/:AssignmentID-------' + err.message);
            res.status(401).end();
        });
        //
        //         WorkflowActivity.destroy({
        //             where: {
        //                  AssignmentID: req.params.AssignmentID
        //             }
        //         }).then(function(rows) {
        //             console.log("Delete WorkflowActivityArchive Success and saved to other back up");
        //             res.status(201).end();
        //         });

    });

    //Endpoint to restore workflow actvity table entry by giving AssignmentID
    router.get('/WorkflowActivityRestore/save/:AssignmentID', function (req, res) {
        var assignmentArray = new Array();
        console.log(' WorkflowActivityRestore is called\n');
        WorkflowActivity_Archive.findAll({
            where: {
                AssignmentID: req.params.AssignmentID
            },
            attributes: ['WorkflowActivityID', 'AssignmentID', 'TaskActivityCollection', 'Name', 'Type', 'GradeDistribution', 'NumberOfSets', 'Documentation', 'GroupSize', 'StartTaskActivity', 'WorkflowStructure', 'VersionHistory']
        }).then(function (rows) {
            //console.log(rows[0].OwnerID);
            var arrayLength = rows.length;
            for (var x = 0; x < arrayLength; x++) {

                WorkflowActivity.create({
                    WorkflowActivityID: rows[x].WorkflowActivityID,
                    AssignmentID: rows[x].AssignmentID,
                    TaskActivityCollection: rows[x].TaskActivityCollection,
                    Name: rows[x].Name,
                    Type: rows[x].Type,
                    GradeDistribution: rows[x].GradeDistribution,
                    NumberOfSets: rows[x].NumberOfSets,
                    Documentation: rows[x].Documentation,
                    GroupSize: rows[x].GroupSize,
                    StartTaskActivity: rows[x].StartTaskActivity,
                    WorkflowStructure: rows[x].WorkflowStructure,
                    VersionHistory: rows[x].VersionHistory

                });
            }
            //200 for OK
            res.status(201).end();
        }).catch(function (err) {
            console.log(' /WorkflowActivityRestore/save/:AssignmentID-------' + err.message);
            res.status(401).end();
        });
        //
        //         WorkflowActivity.destroy({
        //             where: {
        //                  AssignmentID: req.params.AssignmentID
        //             }
        //         }).then(function(rows) {
        //             console.log("Delete WorkflowActivityArchive Success and saved to other back up");
        //             res.status(201).end();
        //         });

    });

    //-------------------------------------------------------------------------------------------------

    //Endpoint to Create an Assignment
    router.post('/assignment/create', function (req, res) {

        //
        // console.log('assignment: ', req.body.assignment);
        // allocator.createAssignment(req.body.assignment).then(function(done) {
        //     if (done === false) {
        //         res.status(400).end();
        //     } else {
        //         res.status(200).end();
        //     }
        // });

        // if (req.body.partialAssignmentId !== null) {
        //     PartialAssignments.find({
        //         where: {
        //             PartialAssignmentID: req.body.partialAssignmentId,
        //             UserID: req.body.userId,
        //             CourseID: req.body.courseId
        //         }
        //     }).then((result) => {
        //         result.destroy();
        //     }).catch((err) => {
        //         console.error(err);
        //     });
        // }

        if (req.body.partialAssignmentId == null) {
            PartialAssignments.create({
                PartialAssignmentName: req.body.assignment.AA_name,
                UserID: req.body.userId,
                CourseID: req.body.courseId,
                Data: req.body.assignment
            }).then((result) => {
                var taskFactory = new TaskFactory();
                console.log('assignment: ', req.body.assignment);
                taskFactory.createAssignment(req.body.assignment).then(function (done) {
                    if (done) {
                        res.json({
                            'Error': false,
                            'PartialAssignmentID': result.PartialAssignmentID
                        });
                    } else {
                        res.status(400).end();
                    }
                });
            }).catch((err) => {
                console.error(err);
                res.status(400).end();
            });
        } else {
            PartialAssignments.update({
                PartialAssignmentName: req.body.assignment.AA_name,
                Data: req.body.assignment
            }, {
                where: {
                    PartialAssignmentID: req.body.partialAssignmentId
                }
            }).then((result) => {
                console.log('assignment: ', req.body.assignment);
                taskFactory.createAssignment(req.body.assignment).then(function (done) {
                    if (done) {
                        res.json({
                            'Error': false,
                            'PartialAssignmentID': req.body.partialAssignmentId
                        });
                    } else {
                        res.status(400).end();
                    }
                });
            }).catch((result) => {
                console.error(result);
                res.status(400).end();
            });
        }
        //save all assignments submitted
        

    });

    //Endpoint to save partially made assignments from ASA to database
    router.post('/assignment/save/', function (req, res) {
        if (req.body.partialAssignmentId == null) {
            PartialAssignments.create({
                PartialAssignmentName: req.body.assignment.AA_name,
                UserID: req.body.userId,
                CourseID: req.body.courseId,
                Data: req.body.assignment
            }).then((result) => {
                res.json({
                    'Error': false,
                    'PartialAssignmentID': result.PartialAssignmentID
                });
            }).catch((err) => {
                console.error(err);
                res.status(400).end();
            });
        } else {
            PartialAssignments.update({
                PartialAssignmentName: req.body.assignment.AA_name,
                Data: req.body.assignment
            }, {
                where: {
                    PartialAssignmentID: req.body.partialAssignmentId
                }
            }).then((result) => {
                console.log(result);
                console.log('PartialAssignmentID:', result.PartialAssignmentID);
                res.json({
                    'Error': false,
                    'PartialAssignmentID': req.body.partialAssignmentId
                });
            }).catch((result) => {
                console.error(result);
                res.status(400).end();
            });
        }
    });

    //Endpoint to load the names and IDs partial assignments by User and/or CourseID
    router.get('/partialAssignments/all/:userId', function (req, res) {
        var whereConditions = {
            UserID: req.params.userId
        };

        if (req.query.courseId !== undefined) {
            whereConditions.CourseID = req.query.courseId;
        }

        PartialAssignments.findAll({
            where: whereConditions,
            attributes: ['PartialAssignmentID', 'PartialAssignmentName']
        }).then((result) => {
            res.json({
                'Error': false,
                'PartialAssignments': result
            });
        }).catch((result) => {
            console.error(result);
            res.status(400).end();
        });

    });

    //Endpoint to get the data from a partial assignment for the assignment editor
    router.get('/partialAssignments/byId/:partialAssignmentId', function (req, res) {
        console.log(req.query.courseId, req.query.userId);
        if (req.query.courseId === undefined || req.query.userId === undefined) {
            console.log('/partialAssignments/byId/:partialAssignmentId: UserID and CourseId cann be empty');
            res.status(400).end();
            return;
        }
        PartialAssignments.find({
            where: {
                PartialAssignmentID: req.params.partialAssignmentId,
                UserID: req.query.userId,
                CourseID: req.query.courseId
            }
        }).then(result => {
            console.log(result);
            res.json({
                'Error': false,
                'PartialAssignment': result
            });
        }).catch(result => {
            console.log(result);
            res.status(400).end();
        });
    });

    //Endpoint to get an assignment associate with courseId
    router.get('/getAssignments/:courseId', function (req, res) {

        console.log('Finding assignments...');

        Assignment.findAll({

            where: {
                CourseID: req.params.courseId
            },
            attributes: ['AssignmentID', 'Name', 'DisplayName', 'Type', 'Documentation', 'CourseID']

        }).then(function (result) {

            console.log('Assignments have been found!');

            res.json({
                'Error': false,
                'Assignments': result
            });

        }).catch(function (err) {

            console.log('/getCompletedTaskInstances: ' + err);
            res.status(404).end();

        });
    });


    //Endpoint to get a user's active assignment instances by the section
    router.get('/getActiveAssignmentsForSection/:sectionId', function (req, res) {
        console.log(`Finding Assignments for Section ${req.params.sectionId}`);
        AssignmentInstance.findAll({
            where: {
                SectionID: req.params.sectionId
            },
            attributes: ['AssignmentInstanceID', 'StartDate', 'EndDate'],
            include: [{
                model: Assignment,
                attributes: ['DisplayName']
            }]
        }).then(function (result) {
            console.log('Assignments have been found!');
            res.json({
                'Error': false,
                'Assignments': result
            });
        }).catch(function (err) {
            console.log('/getActiveAssignmentsForSection/' + req.params.sectionId + ': ' + err);
            res.status(404).end();
        });
    });

    //Endpoint to get a user's active assignment instances by the course
    router.get('/getActiveAssignments/:courseId', function (req, res) {
        console.log('Finding assignments...');
        Assignment.findAll({
            where: {
                CourseID: req.params.courseId
            },
            attributes: ['AssignmentID', 'DisplayName', 'Type'],
            include: [{
                model: AssignmentInstance,
                as: 'AssignmentInstances',
                attributes: ['AssignmentInstanceID', 'StartDate', 'EndDate', 'SectionID']

            }]
        }).then(function (result) {
            console.log('Assignments have been found!');
            res.json({
                'Error': false,
                'Assignments': result
            });
        }).catch(function (err) {
            console.log('/getActiveAssignments/' + req.params.courseId + ': ' + err);
            res.status(404).end();
        });
    });


    //-----------------------------------------------------------------------------------------------------

    //Endpoint to allocate students
    router.get('/allocate', function (req, res) {

        // var taskFactory = new TaskFactory();
        // //allocator.createInstances(1, 16);
        // taskFactory.createInstances(3, 13).then(function(done) {
        //     console.log('/getAssignToSection/allocate   All Done!');
        //     res.status(200).end();
        // }).catch(function(err) {
        //     console.log(err);
        //     res.status(404).end();
        // });
        //allocator.createInstances(3, 14);
        //allocator.updatePreviousAndNextTasks(13);
        var allocat

        = new Allocator([1, 3, 4, 69, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19], 0);
        Promise.all([allocator.getUser(1)]).then(function (done) {
            console.log(done[0]);
        }).then(function () {
            Promise.all([allocator.getUser(2)]).then(function (done) {
                console.log(done[0]);
            }).then(function () {
                Promise.all([allocator.getUser(3)]).then(function (done) {
                    console.log(done[0]);
                }).then(function () {
                    Promise.all([allocator.getUser(4)]).then(function (done) {
                        console.log(done[0]);
                    }).then(function () {
                        Promise.all([allocator.getUser(5)]).then(function (done) {
                            console.log(done[0]);
                        }).then(function () {
                            Promise.all([allocator.getUser(6)]).then(function (done) {
                                console.log(done[0]);
                            }).then(function () {
                                Promise.all([allocator.getUser(7)]).then(function (done) {
                                    console.log(done[0]);
                                }).then(function () {
                                    Promise.all([allocator.getUser(8)]).then(function (done) {
                                        console.log(done[0]);
                                    }).then(function () {
                                        Promise.all([allocator.getUser(5)]).then(function (done) {
                                            console.log(done[0]);
                                        });
                                    });
                                });
                            });
                        });
                    });
                });
            });
        });
    });

    router.get('/findPreviousTasks/:taskInstanceId', function (req, res) {
        var allocator = new TaskFactory();

        allocator.findPreviousTasks(req.params.taskInstanceId, new Array()).then(function (done) {
            console.log('done!', done);
            previousTasks = done.sort();

            res.json({
                'previousTasks': previousTasks
            });

        }).catch(function (err) {
            console.log(err);
            res.status(401).end();
        });
    });

    router.get('/sendEmailNotification/:taskInstanceId', function (req, res) {
        var email = new Email();


        //email.sendNow(req.body.opts);
        var opts = {
            from: 'njitplamaster@gmail.com',
            replyTo: 'njitplamaster@gmail.com',
            to: 'qxl2@njit.edu',
            subject: 'Test',
            html: 'Test'
        };

        email.send(opts);


    });



    //-----------------------------------------------------------------------------------------------------

    //Endpoint debug

    router.get('/debug', function (req, res) {
        // winston.level = 'debug'
        logger.log('error', 'both', {
            someKey: 'some-value'
        });
        logger.log('warn', 'only info');
        logger.log('warn', 'only info', ([1, 2, {
            k: 'v'
        },
            ['hi'],
            function (test) {
                console.log(test);
            }
        ]).toString());

        // var manager = new Manager()
        // manager.debug()
        var a = new Allocator();
        // a.reallocate_ais_of_users([1, 5], [3, 5, 8, 11, 1])
        res.status(200).end();
    });

    // Inactivate section user

    router.post('/sectionUser/inactivate/:section_user_id', function (req, res) {

        logger.log('info', 'post: /sectionUser/inactivate/, inactivate section user', {
            req_body: req.body,
            req_params: req.params
        });
        var section_user_id = req.body.section_user_id || req.params.section_user_id;

        if (section_user_id == null) {
            logger.log('info', 'section_user_id is required but not specified');
            return res.status(400).end();
        }
        return SectionUser.find({
            where: {
                SectionUserID: section_user_id
            }
        }).then(function (section_user) {
            if (!section_user) {
                logger.log('error', 'section user not found');
                return res.status(400).end();
            }
            logger.log('info', 'updating section user', {
                section_user: section_user.toJSON()
            });
            section_user.UserStatus = 'Inactive';

            return section_user.save().then(function (section_user) {
                logger.log('info', 'section user updated', {
                    section_user: section_user.toJSON()
                });
                return res.status(200).end();
            });
        });
    });


    // Upload files for a task
    // router.post('/upload/files/:userId', storage.array('files'), function (req, res) {
    router.post('/upload/files', storage.array('files'), function (req, res) {
        logger.log('info', 'post: /upload/files, files uploaded to file system', {
            req_body: req.body,
            req_params: req.params,
            // req_files: req.files,
        });
        if (req.body.userId == null) {
            logger.log('error', 'userId is required but not specified');
            return res.status(400).end();
        }
        if (req.body.taskInstanceId == null) {
            logger.log('error', 'taskInstanceId is required but not specified');
            return res.status(400).end();
        }
        // Add file references (info)
        return new Util().addFileRefs(req.files, req.body.userId).then(function (file_refs) {

            return Promise.all(file_refs.map(function (it) {
                return it.FileID;
            })).then(function (file_ids) {
                logger.log('info', 'new task file ids', file_ids);

                TaskInstance.find({
                    where: {
                        TaskInstanceID: req.body.taskInstanceId
                    }
                }).then(ti => {
                    let newFilesArray = JSON.parse(ti.Files) || [];
                    newFilesArray = newFilesArray.concat(file_ids);

                    // Update task instance with the new file references
                    return TaskInstance.update({
                        Files: newFilesArray
                    }, {
                        where: {
                            TaskInstanceID: req.body.taskInstanceId
                        }
                    }).then(done => {
                        logger.log('info', 'task updated with new files', {
                            res: done
                        });
                        // Respond wtih file info
                        res.json(file_refs).end();
                        return done;
                    });
                });

            });

        });
    });

    // Upload a user profile pictures //TODO: we may want to limit this to just one profile picture upload and also allow only (PNG, JPG, etc) picture formatted files
    // router.post('/upload/profile-picture/:userId', multer({dest: './uploads/'}).single('profilePicture'), function(req, res) {
    router.post('/upload/profile-picture', storage.array('files'), function (req, res) {
        // router.post('/upload/profile-picture/:userId', storage.array('files'), function (req, res) {
        logger.log('info', 'post: /upload/profile-picture, profile pictures uploaded to file system', {
            req_body: req.body,
            req_params: req.params,
            // req_files: req.files,
        });
        if (req.body.userId == null) {
            logger.log('info', 'userId is required but not specified');
            return res.status(400).end();
            // req.body.userId = 2
        }
        // Add file reference (info)
        return new Util().addFileRefs(req.files, req.body.userId).then(function (file_refs) {
            return Promise.all(file_refs.map(function (it) {
                return it.FileID;
            })).then(function (file_ids) {
                logger.log('info', 'new profile picture file ids', file_ids);

                // update user profile picture field with file reference
                return UserContact.update({
                    ProfilePicture: file_ids
                }, {
                    where: {
                        UserID: req.body.userId
                    }
                }).then(function (done) {
                    logger.log('info', 'user updated with new profile pictures info', {
                        res: done
                    });
                    // respond with file info
                    res.json(file_refs).end();
                    return done;
                });
            });
        });
    });


    // download a file using file reference //TODO: we may want to add a parameter that controls the response type (direct download or show up (display) on the browser)
    router.get('/download/file/:fileId', function (req, res) {
        // router.post('/download/file/:fileId', function (req, res) {
        // router.get('/download/file', function (req, res) {
        logger.log('info', 'post: /download/file', {
            req_body: req.body,
            req_params: req.params
        });
        var file_id = req.body.fileId || req.params.fileId;

        if (file_id == null) {
            logger.log('info', 'file_id is required but not specified');
            return res.status(400).end();
        }
        return FileReference.find({
            where: {
                FileID: file_id
            }
        }).then(function (file_ref) {
            if (!file_ref) {
                logger.log('error', 'file reference not found', {
                    file_id: file_id
                });
                return res.status(400).end();
            }
            logger.log('info', 'file reference', file_ref.toJSON());
            file_ref.Info = JSON.parse(file_ref.Info);
            let contDisp = file_ref.Info.mimetype.match('image') ? 'inline' : contentDisposition(file_ref.Info.originalname);
            var content_headers = {
                'Content-Type': file_ref.Info.mimetype,
                'Content-Length': file_ref.Info.size,
                'Content-Disposition': contDisp,
            };
            logger.log('debug', 'response content file headers', content_headers);
            res.writeHead(200, content_headers);
            logger.log('info', 'Sending file to client');
            const readStream = fs.createReadStream(file_ref.Info.path);
            readStream.on('open', () => {
                readStream.pipe(res);
            });
            readStream.on('error', (err) => {
                logger.log('error', 'valid reference but file not found', {
                    file_id: file_id
                });
                res.status(400).end();
            });
        });
    });


    //Endpoint for Assignment Manager
    router.post('/getAssignmentGrades/:ai_id', function (req, res) {

        if (req.params.ai_id == null) {
            console.log('/getAssignmentGrades/:ai_id : assignmentInstanceID cannot be null');
            res.status(400).end();
            return;
        }

        return AssignmentInstance.find({
            where: {
                AssignmentInstanceID: req.params.ai_id
            },
            // attributes: ['CourseID']
            include: [{
                model: Assignment,
                    // attributes: ["AssignmentInstanceID", "AssignmentID"],
                    /*include: [{
                     model: Section,
                     }],*/
            },
            {
                model: Section,
                include: [{
                    model: Course,
                        // attributes: ["AssignmentInstanceID", "AssignmentID"],
                        /*include: [{
                         model: Section,
                         attributes: ["SectionID"],
                         }],*/
                }, ],
            },
                /*{
                 model: AssignmentGrade,
                 }*/
            ],
        }).then(function (response) {
            // console.log('res: ', response)
            if (response == null) {
                return res.json({
                    Error: true
                });
            }
            var json = {
                Error: false,
                AssignmentInstance: response,
                SectionUsers: [],
            };
            return response.Section.getSectionUsers().then(function (sectionUsers) {
                if (!sectionUsers) return;

                // json.SectionUsers = sectionUsers
                return Promise.map(sectionUsers, function (sectionUser) {
                    console.log('ww');
                    var su = sectionUser.toJSON();
                    json.SectionUsers.push(su);

                    User.find({
                        where: {
                            UserID: sectionUser.UserID
                        },
                        include: [{
                            model: UserContact
                        }]
                    }).then(function (user) {
                        if (!user) return;

                        console.log('ww22');
                        var u = user.toJSON();
                        su.User = u;
                    });
                    return AssignmentGrade.find({
                        where: {
                            SectionUserID: sectionUser.SectionUserID,
                            AssignmentInstanceID: req.params.ai_id,
                        },
                        /*include: [
                         {
                         model: AssignmentInstance,
                         // attributes: ["AssignmentInstanceID", "AssignmentID"],
                         /!*include: [{
                         model: Section,
                         }],*!/
                         },
                         ],*/
                    }).then(function (assignmentGrade) {
                        if (!assignmentGrade) return;

                        console.log('ww11');
                        var ag = assignmentGrade.toJSON();
                        su.assignmentGrade = ag;
                        // console.log(assignmentGrade)

                        return WorkflowGrade.findAll({
                            where: {
                                SectionUserID: sectionUser.SectionUserID,
                                AssignmentInstanceID: req.params.ai_id,
                            },
                            include: [{
                                model: WorkflowActivity,
                                // attributes: ["AssignmentInstanceID", "AssignmentID"],
                                /*include: [{
                                 model: TaskActivity,
                                 }],*/
                            }, ],
                        }).then(function (workflowGrades) {
                            if (!workflowGrades) return;

                            console.log('ww1.5');
                            ag.WorkflowActivityGrades = [];

                            return Promise.map(workflowGrades, function (workflowGrade) {
                                if (!workflowGrade) return;

                                console.log('ww11.5', workflowGrade);
                                var wg = workflowGrade.toJSON();
                                ag.WorkflowActivityGrades.push(wg);
                                if (!wg.WorkflowActivity) return;

                                return TaskGrade.findAll({
                                    where: {
                                        SectionUserID: sectionUser.SectionUserID,
                                        WorkflowActivityID: workflowGrade.WorkflowActivityID,
                                    },
                                    include: [{
                                        model: TaskInstance,
                                        include: [{
                                            model: TaskActivity,
                                        }, ],
                                    }, ],
                                }).then(function (taskGrades) {
                                    if (!taskGrades) return;

                                    console.log('ww1.75');
                                    wg.WorkflowActivity.users_WA_Tasks = [];

                                    return Promise.map(taskGrades, function (taskGrade) {
                                        if (!taskGrade) return;

                                        var tg = taskGrade.toJSON();
                                        tg.taskGrade = taskGrade;
                                        tg.taskActivity = taskGrade.TaskInstance.TaskActivity;
                                        wg.WorkflowActivity.users_WA_Tasks.push(tg);

                                        return TaskSimpleGrade.find({
                                            where: {
                                                SectionUserID: sectionUser.SectionUserID,
                                                TaskInstanceID: taskGrade.TaskInstanceID
                                            },
                                        }).then(function (taskSimpleGrade) {
                                            if (!taskSimpleGrade) return;

                                            tg.taskSimpleGrade = taskSimpleGrade;
                                        });
                                    });
                                });
                            });
                        });
                    });
                }).then(function () {
                    console.log('then', 'json');
                    res.json(json);
                });
            });
        });
    });

    //Endpoint for Assignment Manager
    router.get('/manager', function (req, res) {

        var manager = new Manager();

        //Manager.Manager.checkTimeoutTasks();
        // AssignmentInstance.findById(1).then(
        //     function(asection) {
        //         Manager.Manager.trigger(asection);
        //
        //     }
        // );

        //manager.checkAssignments();
        manager.check();
        //Manager.Manager.check();
    });

    router.get('/manager/checkAssignments', function (req, res) {

        var manager = new Manager();

        //Manager.Manager.checkTimeoutTasks();
        // AssignmentInstance.findById(1).then(
        //     function(asection) {
        //         Manager.Manager.trigger(asection);
        //
        //     }
        // );

        manager.checkAssignments();
        //manager.check();
        //Manager.Manager.check();
    });

    //-----------------------------------------------------------------------------------------------------

    //Endpoint to Test All Models for a UserID
    router.get('/ModelTest/:userID', function (req, res) {


        WorkflowInstance.findById(req.params.userID).then(function (WorkflowInstance) {
            console.log('WorkflowInstance Found');

            WorkflowInstance.getWorkflowActivity().then(function (workflowActivity) {
                console.log('WorkflowActivity Found ' + workflowActivity.Name);
            });

            WorkflowInstance.getAssignment().then(function (assignment) {
                console.log('Assignment Found : ' + assignment.Name);
            });
        });

        WorkflowActivity.findById(req.params.userID).then(function (workflowActivity) {
            console.log('WorkflowActivity Found ' + workflowActivity.Name);

            workflowActivity.getWorkflowInstances().then(function (workflows) {
                console.log('workflows Found ');
            });

        });

        Assignment.findById(req.params.userID).then(function (assignment) {
            console.log('Assignment Found : ' + assignment.Name);

            assignment.getWorkflowInstances().then(function (workflows) {
                console.log('workflows Found ');
            });

        });

        TaskInstance.findById(req.params.userID).then(function (taskInstance) {
            console.log('Semester name : ' + taskInstance.TaskInstanceID);

            taskInstance.getUser().then(function (User) {
                console.log('TaskInstance User Name ' + User.FirstName);
            });
            taskInstance.getTaskActivity().then(function (TaskActivity) {
                console.log('TaskActivity Name ' + TaskActivity.Name);
            });

        });

        TaskActivity.findById(2).then(function (TaskActivity) {
            console.log('TaskActivity name : ' + TaskActivity.Name);

            TaskActivity.getTaskInstances().then(function (TaskInstances) {
                console.log('Found');
            });

        });

        Semester.findById(req.params.userID).then(function (Semester) {
            console.log('Semester name : ' + Semester.Name);

            Semester.getSections().then(function (Sections) {
                console.log('Found');
            });

        });

        Section.findById(req.params.userID).then(function (Section) {
            console.log('Section name : ' + Section.Name);

            Section.getSemester().then(function (Semester) {
                console.log('Semester Name : ' + Semester.Name);
                //res.status(200).end();
            });

            Section.getCourse().then(function (Course) {
                console.log('Course Name : ' + Course.Name);
                //res.status(200).end();
            });
            Section.getSectionUsers().then(function (Users) {
                console.log('Found');
                //res.status(200).end();
            });

        });

        UserLogin.findById(req.params.userID).then(function (user) {
            console.log('User Email : ' + user.Email);

        });

        Course.findById(req.params.userID).then(function (course) {
            console.log('User Course : ' + course.Name);

            course.getUser().then(function (Creator) {
                console.log('Creator Name : ' + Creator.FirstName);
                //res.status(200).end();
            });

            course.getSections().then(function (sections) {
                console.log('Sections Found');
            });
        });
        //Course.find
        User.findById(req.params.userID).then(function (user) {
            console.log('User name : ' + user.FirstName);
            var UserLog = user.getUserLogin().then(function (USerLogin) {
                console.log('User Email : ' + USerLogin.Email);

            });
            user.getUserContact().then(function (USerLogin) {
                console.log('User Email : ' + USerLogin.Email);
                res.status(200).end();
            });
            //console.Log("Email " + UserLog.Email);
        });
    });


    //Endpoint to check if initial user in system
    router.get('/initial', function (req, res) {
        return User.findOne()
            .then(result => {
                if (result === null) {
                    return res.status(400).end();
                } else {
                    return res.status(200).end();
                }
            })
            .catch((err) => {
                console.error(err);
                logger.log('error', '/initial', 'couldn\'t fetch user from DB', {
                    error: err
                });

                res.status(500).end();
            });
    });
    //---------------------------------------------------------------------------------------------------


    //-----------------------------------------------------------------------------------------------------

    // endpoint for login function
    router.post('/login', function (req, res) {
        if (req.body.emailaddress == null || req.body.password == null) {
            console.log('/login : invalid credentials');
            res.status(401).end();
        }
        UserLogin.find({
            where: {
                Email: req.body.emailaddress
            },
            attributes: ['UserID', 'Email', 'Password', 'Pending', 'Attempts', 'Timeout', 'Blocked']
        }).then(async function (user) {
            let current_timestamp = new Date(); // get current time of login
            if (user == null) { // deny if user doesn't exist
                console.log('/login: invalid credentials');
                return res.status(401).end();
            } else if (user.Blocked) { // deny if user is manually blocked
                console.log('/login: blocked login of ' + user.Email);
                return res.status(401).json({
                    'Error': true,
                    'Message': 'Timeout',
                    'Timeout': 60
                });
            } else if (user.Timeout != null && user.Timeout > current_timestamp) { // deny if there is a timeout in the future
                console.log('/login: prevented login due to timeout for ' + user.Email);
                let timeOut = new Date(user.Timeout) - new Date();
                timeOut = Math.ceil(timeOut / 1000 / 60);
                console.log(timeOut);
                return res.status(401).json({
                    'Error': true,
                    'Message': 'Timeout',
                    'Timeout': timeOut
                });
            } else {
                // if the password is correct
                if (user != null && await password.verify(user.Password, req.body.password)) {
                    // unset past timeout with correct password, login
                    // set attempts back to zero
                    if (user.Timeout != null) {
                        sequelize.options.omitNull = false;
                        UserLogin.update({
                            Attempts: 0,
                            Timeout: null
                        }, {
                            where: {
                                UserID: user.UserID
                            }
                        }).then(function (userLogin) {
                            sequelize.options.omitNull = true;

                            res.status(201).json({
                                'Error': false,
                                'Message': 'Success',
                                'UserID': user.UserID,
                                Pending: user.Pending
                            });
                        }).catch(function (err) {
                            sequelize.options.omitNull = true;
                            console.log('/login: ' + err);
                            res.status(401).end();
                        });
                    } else {
                        // normal login (ideal scenario)

                        res.status(201).json({
                            'Error': false,
                            'Message': 'Success',
                            'UserID': user.UserID,
                            Pending: user.Pending
                        });
                    }
                } else {
                    // incorrect password, increment attempt count
                    let attempts = user.Attempts + 1;
                    let minutes = 0;

                    console.log('/login: incorrect attempt #' + attempts + ' for ' + user.Email);
                    let update_data = {
                        Attempts: attempts
                    };
                    // calculate timeout if five or more attempts
                    // timeout is calculated relative to current time, not relative to previous timeout,
                    // this is done by design
                    if (attempts >= 5) {
                        console.log('/login: setting new timeout for ' + user.Email);
                        switch (attempts) {
                        case 5:
                            minutes = 1;
                            break;
                        case 6:
                            minutes = 2;
                            break;
                        case 7:
                            minutes = 5;
                            break;
                        case 8:
                            minutes = 10;
                            break;
                        case 9:
                            minutes = 15;
                            break;
                        case 10:
                            minutes = 30;
                            break;
                        default:
                            minutes = 60;
                        }
                        let timeout = current_timestamp;
                        timeout.setMinutes(timeout.getMinutes() + minutes);
                        update_data.Blocked = attempts > 10;
                        update_data.Timeout = timeout;
                    }
                    // update UserLogin with new attempts and timeout
                    UserLogin.update(update_data, {
                        where: {
                            UserID: user.UserID
                        }
                    }).then(function (userLogin) {
                        console.log('/login: invalid credentials');

                        console.log('minutes', minutes);
                        res.status(401).json({
                            'Error': true,
                            'Message': 'Timeout',
                            'Timeout': minutes,
                        });
                    }).catch(function (err) {
                        console.log('/login: ' + err);
                        res.status(401).end();
                    });
                }
            }
        }).catch(function (err) {
            console.log('/login: ' + err);
            res.status(401).end();
        });
    });

    //-----------------------------------------------------------------------------------------------------

    //Endpoint to update a User's Email
    router.put('/update/email', function (req, res) {
        if (req.body.password == null || req.body.email == null || req.body.userid == null) {
            console.log('/update/email : Bad Input');
            res.status(400).end();
        }

        UserLogin.find({
            where: {
                UserID: req.body.userid
            }
        }).then(async function (user) {
            if (user != null && await password.verify(user.Password, req.body.password)) {
                user.Email = req.body.email;
                user.save().then(function (used) {
                    res.status(200).end();
                }).catch(function (err) {
                    res.json({
                        'Email': used.Email
                    });
                });
            } else {
                console.log('/update/email : Bad Input');
                res.status(401).end();
            }
        });
    });

    //-----------------------------------------------------------------------------------------------------

    //Endpoint to update a User's Name
    router.put('/update/name', function (req, res) {
        User.find({
            where: {
                UserID: req.body.userid
            }
        }).then(function (user) {
            if (user == null) {
                console.log('/update/name : UserID not Found');
                res.status(401).end();
            } else {
                if (req.body.firstname != '') {
                    user.FirstName = req.body.firstname;
                }
                if (req.body.lastname != '') {
                    user.LastName = req.body.lastname;
                }
                user.save().then(function (used) {
                    res.json({
                        'FirstName': user.FirstName,
                        'LastName': user.LastName
                    });
                }).catch(function (err) {
                    console.log('/update/name : ' + err);
                    res.status(401).end();
                });
            }
        });
    });

    //-----------------------------------------------------------------------------------------------------

    //Endpoint to return general user data
    router.get('/generalUser/:userid', function (req, res) {
        User.find({
            where: {
                UserID: req.params.userid
            },
            attributes: ['UserID', 'FirstName', 'LastName', 'Instructor', 'Admin'],
            include: [{
                model: UserLogin,
                attributes: ['Email']
            },
            {
                model: UserContact,
                attributes: ['FirstName', 'LastName', 'Email', 'Phone', 'Alias', 'ProfilePicture', 'Avatar']
            }
            ]
        }).then(function (user) {
            res.json({
                'Error': false,
                'Message': 'Success',
                'User': user
            });
        }).catch(function (err) {
            console.log('/generalUser : ' + err.message);
            res.status(401).end();
        });

    });

    //-----------------------------------------------------------------------------------------------------

    //Endpoint to create a semester
    // JV - contructing the /createSemester where it allows user to create a non existance. return false when new semester already exist
    router.post('/createSemester', function (req, res) {
        var startDate = dateFormat(req.body.start_sem, 'yyyy-mm-dd');
        var endDate = dateFormat(req.body.end_sem, 'yyyy-mm-dd');
        console.log(req.body.start_sem + ' ' + req.body.end_sem);
        if (req.body.end_sem == null || req.body.start_sem == null) {
            console.log('/createSemester : Dates must be defined');
            res.status(400).end();
        } else if (startDate > endDate) {
            console.log('/createSemester : StartDate cannot be grater than EndDate');
            res.status(400).end();
        } else {
            Semester.find({
                where: {
                    OrganizationID: req.body.organizationID,
                    Name: req.body.semesterName //new
                },
                attributes: ['SemesterID']
            }).then(function (response) {
                if (response == null || response.SemesterID == null) {
                    Semester.create({
                        OrganizationID: req.body.organizationID, //organization ID
                        Name: req.body.semesterName,
                        StartDate: req.body.start_sem,
                        EndDate: req.body.end_sem
                    }).catch(function (err) {
                        console.log(err);
                    }).then(function (result) {
                        res.json({
                            'newsemester': result,
                            'sem_feedback': true
                        });
                    });

                } else {
                    console.log('Semester Name and Organization Exist');
                    res.json({
                        'newsemester': null,
                        'sem_feedback': false
                    });
                }
            });
        }
    });

    //-----------------------------------------------------------------------------------------------------

    //Endpoint to return Semester Information
    router.get('/semester/:semesterid', function (req, res) {

        Semester.find({
            where: {
                SemesterID: req.params.semesterid
            },
            attributes: ['SemesterID', 'Name', 'StartDate', 'EndDate', 'OrganizationID']
        }).then(function (rows) {
            res.json({
                'Error': false,
                'Message': 'Success',
                'Semester': rows
            });
        }).catch(function (err) {
            console.log('/semester/email : ' + err.message);
            res.status(401).end();
        });


    });

    //-----------------------------------------------------------------------------------------------------

    //Endpoint to get All Semester Information
    router.get('/semester', function (req, res) {

        Semester.findAll({}).then(function (rows) {
            res.json({
                'Error': false,
                'Message': 'Success',
                'Semesters': rows
            });
        }).catch(function (err) {
            console.log('/semester: ' + err.message);
            res.status(401).end();
        });
    });

    //-----------------------------------------------------------------------------------------------------

    //Endpoint to create course
    router.post('/course/create', function (req, res) {
        console.log('/course/create: called');
        if (req.body.userid == null) {
            console.log('/course/create : UserID cannot be null');
            res.status(400).end();
            return;
        }
        if (req.body.Name == null) {
            console.log('/course/create : Name cannot be null');
            res.status(400).end();
            return;
        }
        if (req.body.number == null) {
            console.log('/course/create : Number cannot be null');
            res.status(400).end();
            return;
        }
        if (req.body.organizationid == null) {
            console.log('/course/create : OrganizationID cannot be null');
            res.status(400).end();
            return;
        }

        Course.find({
            where: {
                CreatorID: req.body.userid,
                Number: req.body.number,
                Name: req.body.Name,
                OrganizationID: req.body.organizationid //new
            },
            attributes: ['CourseID']
        }).then(function (response) {
            if (response == null || response.CourseID == null) {
                Course.create({
                    CreatorID: req.body.userid,
                    Number: req.body.number,
                    Name: req.body.Name,
                    OrganizationID: req.body.organizationid
                }).catch(function (err) {
                    console.log(err);
                }).then(function (result) {
                    res.json({
                        'NewCourse': result,
                        'Message': true
                    });

                });
            } else {
                res.json({
                    'Message': false
                });
            }
        });
    });

    //-----------------------------------------------------------------------------------------------------

    //End point to create section for course
    router.post('/course/createsection', function (req, res) {


        if (req.body.semesterid == null) {
            console.log('course/createsection : SemesterID cannot be null');
            res.status(400).end();
            return;
        }
        if (req.body.courseid == null) {
            console.log('course/createsection : CourseID cannot be null');
            res.status(400).end();
            return;
        }
        if (req.body.name == null) {
            console.log('course/createsection : Name cannot be null');
            res.status(400).end();
            return;
        }
        // if (req.body.description == null) {
        //     console.log("course/createsection : Description cannot be null");
        //     res.status(400).end();
        //     return;
        // }
        // if (req.body.organizationid == null) {
        //     console.log("course/createsection : OrganizationID cannot be null");
        //     res.status(400).end();
        //     return;
        // }

        //-----------------------------------------------------------------------------------------------------
        Semester.find({
            where: {
                SemesterID: req.body.semesterid
            }
        }).then(function (results) {
            var section = Section.build({
                SemesterID: req.body.semesterid,
                CourseID: req.body.courseid,
                StartDate: results.StartDate,
                EndDate: results.EndDate,
                Name: req.body.name,

            }).save().then(function (response) {
                res.json({
                    'result': response
                });
            }).catch(function (err) {
                console.log('/course/createsection : ' + err.message);

                res.status(401).end();
            });
        });

    });

    //-----------------------------------------------------------------------------------------------------

    //Endpoint to add a user to a course
    router.post('/user/create', function (req, res) {
        var email = new Email();

        if (req.body.email === null || req.body.phone === null || req.body.passwd === null || req.body.phone === null || req.body.firstName === null || req.body.lastName === null) {
            console.log('/user/create : Missing attributes');
            res.status(400).end();
        }

        UserContact.create({
            Email: req.body.email,
            Phone: req.body.phone
        }).then(function (userContact) {
            sequelize.query('SET FOREIGN_KEY_CHECKS = 0');
            User.create({
                UserContactID: userContact.UserContactID,
                FirstName: req.body.firstName,
                LastName: req.body.lastName,
                OrganizationGroup: req.body.organization,
                Instructor: false,
                Admin: false
            }).then(async function (user) {
                UserLogin.create({
                    UserID: user.UserID,
                    Email: req.body.email,
                    Password: await password.hash(req.body.passwd)
                }).then(function (userLogin) {
                    console.log('/user/create: New user added to the system');
                    sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
                    email.sendNow(user.UserID, 'create user');
                    res.status(200).end();
                }).catch(function (err) {
                    console.log(err);
                    res.status(400).end();
                });
            });
        });
    });

    router.post('/update/password', function (req, res) {
        let email = new Email();
        if (req.body.userId === null || req.body.oldPasswd === null || req.body.newPasswd === null) {
            console.log('/update/password : Missing attributes');
            res.status(400).end();
        } else if (req.body.oldPasswd == req.body.newPasswd) {
            console.log('/update/password : Same password');
            res.status(400).end();
        } else {
            UserLogin.find({
                where: {
                    UserID: req.body.userId
                }
            }).then(async function (userLogin) {
                if (await password.verify(userLogin.Password, req.body.oldPasswd)) {
                    console.log('/user/create : Password matched');
                    UserLogin.update({
                        Password: await password.hash(req.body.newPasswd),
                        Pending: false
                    }, {
                        where: {
                            UserID: req.body.userId
                        }
                    }).then(function (done) {
                        console.log('/update/password: Password updated successfully');
                        email.sendNow(user.UserID, 'new password');
                        res.status(200).end();
                    }).catch(function (err) {
                        console.log(err);
                        res.status(400).end();
                    });

                } else {
                    console.log('/update/password: Password not match');
                    res.status(401).end();
                }
            });
        }

    });

    // adding the user, called on add user page
    router.post('/adduser', function (req, res) {
        console.log('/adduser:called');
        var email = new Email();
        if (req.body.email === null) {
            console.log('/adduser : Email cannot be null');
            res.status(400).end();
        }

        UserLogin.find({
            where: {
                Email: req.body.email
            },
            attributes: ['UserID']
        }).then(function (response) {
            if (response == null || response.UserID == null) {
                sequelize.query('SET FOREIGN_KEY_CHECKS = 0')

                    .then(function () {
                        User.create({
                            FirstName: req.body.firstname,
                            LastName: req.body.lastname,
                            Instructor: req.body.instructor,
                            Admin: req.body.admin
                        }).catch(function (err) {
                            console.log(err);
                            sequelize.query('SET FOREIGN_KEY_CHECKS = 1')
                                .then(function () {
                                    res.status(500).end();
                                });
                        }).then(async function (user) {
                            UserContact.create({
                                UserID: user.UserID,
                                FirstName: req.body.firstname,
                                LastName: req.body.lastname,
                                Email: req.body.email,
                                Phone: '(XXX) XXX-XXXX'
                            }).catch(function (err) {
                                console.log(err);
                                sequelize.query('SET FOREIGN_KEY_CHECKS = 1')
                                    .then(function () {
                                        res.status(500).end();
                                    });
                            }).then(async function (userCon) {
                                console.log('trustpass', req.body.trustpassword);
                                UserLogin.create({
                                    UserID: user.UserID,
                                    Email: req.body.email,
                                    Password: await password.hash(req.body.password),
                                    Pending: req.body.trustpassword ? false : true
                                }).catch(function (err) {
                                    console.log(err);
                                    sequelize.query('SET FOREIGN_KEY_CHECKS = 1')
                                        .then(function () {
                                            res.status(500).end();
                                        });
                                }).then(function (userLogin) {
                                    let email = new Email();
                                    email.sendNow(user.UserID, 'invite user', '[user defined]');
                                    sequelize.query('SET FOREIGN_KEY_CHECKS = 1')
                                        .then(function () {
                                            res.json({
                                                'Message': 'User has succesfully added'
                                            });
                                        });

                                });
                            });
                        });
                    });
            } else {
                res.json({
                    'Message': 'User is currently exist'
                });
            }
        });
    });

    router.post('/course/adduser', function (req, res) {
        //console.log("role "+req.body.role);
        var email = new Email();
        if (req.body.email === null) {
            console.log('course/adduser : Email cannot be null');
            res.status(400).end();
        }
        if (req.body.courseid === null) {
            console.log('course/adduser : CourseID cannot be null');
            res.status(400).end();
        }
        if (req.body.sectionid === null) {
            console.log('course/adduser : SectionID cannot be null');
            res.status(400).end();
        }

        UserLogin.find({
            where: {
                Email: req.body.email
            },
            attributes: ['UserID']
        }).then(function (userLogin) {
            if (userLogin == null || userLogin.UserID == null) {
                UserContact.create({
                    Email: req.body.email,
                    Phone: 'XXX-XXX-XXXX'
                }).catch(function (err) {
                    console.log(err);
                }).then(function (userCon) {
                    sequelize.query('SET FOREIGN_KEY_CHECKS = 0')
                        .then(function () {
                            sequelize.sync({});
                            console.log(userCon.UserContactID);
                            User.create({
                                FirstName: 'Temp',
                                LastName: 'Temp',
                                OrganizationGroup: {
                                    'OrganizationID': []
                                },
                                UserContactID: userCon.UserContactID,
                                Instructor: req.body.role == 'Instructor' ? true : false,
                                Admin: false,
                            }).catch(function (err) {
                                console.log(err);
                            }).then(async function (user) {
                                UserLogin.create({
                                    UserID: user.UserID,
                                    Email: req.body.email,
                                    Password: await password.hash('pass123')
                                }).catch(function (err) {
                                    console.log(err);
                                }).then(function (userLogin) {
                                    //Email User With Password
                                    email.sendNow(userLogin.UserID, 'create user', req.body.password);
                                    SectionUser.create({
                                        SectionID: req.body.sectionid,
                                        UserID: userLogin.UserID,
                                        Role: req.body.role,
                                        Active: true
                                    }).catch(function (err) {
                                        console.log(err);
                                    }).then(function (sectionUser) {
                                        res.status(200).end();
                                        return sequelize.query('SET FOREIGN_KEY_CHECKS = 1');

                                    });
                                });
                            });
                        });
                });
            } else {
                SectionUser.create({
                    SectionID: req.body.sectionid,
                    UserID: userLogin.UserID,
                    Role: req.body.role,
                    Active: true
                }).catch(function (err) {
                    console.log(err);
                }).then(function (sectionUser) {
                    res.json({
                        'UserID': sectionUser.UserID,
                        'Message': 'Success'
                    });
                });
            }
        });
    });




    // router.post("/course/adduser", function(req, res) {
    //
    //     var email = new Email.Email();
    //
    //     if (req.body.email === null) {
    //         console.log("course/adduser : Email cannot be null");
    //         res.status(400).end();
    //     }
    //     if (req.body.courseid === null) {
    //         console.log("course/adduser : CourseID cannot be null");
    //         res.status(400).end();
    //     }
    //     if (req.body.sectionid === null) {
    //         console.log("course/adduser : SectionID cannot be null");
    //         res.status(400).end();
    //     }
    //
    //     UserLogin.find({
    //         where: {
    //             Email: req.body.email
    //         },
    //         attributes: ['UserID']
    //     }).then(function(userLogin) {
    //         if (userLogin == null || userLogin.UserID == null) {
    //             UserContact.create({
    //                 Email: req.body.email,
    //                 Phone: 'XXX-XXX-XXXX'
    //             }).catch(function(err) {
    //                 console.log(err);
    //             }).then(function(userCon) {
    //                 sequelize.query('SET FOREIGN_KEY_CHECKS = 0')
    //                     .then(function() {
    //                         sequelize.sync({});
    //                         User.create({
    //                             FirstName: 'Temp',
    //                             LastName: 'Temp',
    //                             OrganizationGroup: {
    //                                 "OrganizationID": []
    //                             },
    //                             UserContactID: userCon.UserContactID,
    //                             UserType: 'Student',
    //                             Admin: 0
    //                         }).catch(function(err) {
    //                             console.log(err);
    //                         }).then(async function(user) {
    //                             UserLogin.create({
    //                                 UserID: user.UserID,
    //                                 Email: req.body.email,
    //                                 Password: await password.hash('pass123')
    //                             }).catch(function(err) {
    //                                 console.log(err);
    //                             }).then(function(userLogin) {
    //                                 //Email User With Password
    //                                 email.sendNow(userLogin.UserID, 'create user');
    //
    //                                 SectionUser.create({
    //                                     SectionID: req.body.sectionid,
    //                                     UserID: userLogin.UserID,
    //                                     Role: 'Student',
    //                                      Active: true
    //                                 }).catch(function(err) {
    //                                     console.log(err);
    //                                 }).then(function(sectionUser) {
    //                                     res.status(200).end();
    //                                     return sequelize.query('SET FOREIGN_KEY_CHECKS = 1')
    //
    //                                 });
    //                             });
    //                         });
    //                     });
    //             });
    //         } else {
    //             SectionUser.create({
    //                 SectionID: req.body.sectionid,
    //                 UserID: userLogin.UserID,
    //                 Role: 'Student',
    //                  Active: true
    //             }).catch(function(err) {
    //                 console.log(err);
    //             }).then(function(sectionUser) {
    //                 res.json({
    //                     "UserID": sectionUser.UserID
    //                 });
    //             })
    //         }
    //     })
    // });

    //-----------------------------------------------------------------------------------------------------

    //Endpoint to find course
    router.get('/course/:courseId', function (req, res) {
        Course.find({
            where: {
                CourseID: req.params.courseId
            },
            attributes: ['CourseID', 'Number', 'Name', 'Description']
        }).then(function (result) {
            Section.findAll({
                where: {
                    CourseID: req.params.courseId
                },
                include: [{
                    model: Semester,
                    attributes: ['Name']
                }]
            }).then(function (sections) {
                res.json({
                    'Error': false,
                    'Message': 'Success',
                    'Course': result,
                    'Sections': sections
                });
            });

        }).catch(function (err) {
            console.log('/course ERROR_WJE : ' + err.message);
            res.status(400).end();
        });

    });

    //-----------------------------------------------------------------------------------------------------

    //Need to translate getsectionUsers function
    router.get('/course/getsection/:sectionId', function (req, res) {

        Section.find({
            where: {
                SectionID: req.params.sectionId
            },
            attributes: ['Name']
        }).then(function (rows) {
            SectionUser.findAll({
                where: {
                    SectionID: req.params.sectionId
                },
                attributes: ['UserID', 'Role', 'Active'],
                include: {
                    model: User,
                    attributes: ['FirstName', 'LastName']
                }
            }).then(function (users) {
                res.json({
                    'result': rows,
                    'UserSection': users
                });
            });
        }).catch(function (err) {
            console.log('/course : ' + err.message);
            res.status(400).end();
        });
    });

    //-----------------------------------------------------------------------------------------------------
    router.get('/getCourseSections/:courseID', function (req, res) {

        Section.findAll({
            where: {
                CourseID: req.params.courseID,
                SemesterID: req.query.semesterID
            },
            order: [
                ['Name']
            ],
            attributes: ['SectionID', 'Name']
        }).then(function (sections) {
            res.json({
                'Sections': sections
            });
        });
    });

    //-----------------------------------------------------------------------------------------------------

    //Endpoint to update a course
    router.put('/course/update', function (req, res) {

        if (req.body.Name == null) {
            console.log('course/create : Name cannot be null');
            res.status(400).end();
            return;
        }
        if (req.body.courseid == null) {
            console.log('course/create : CourseID cannot be null');
            res.status(400).end();
            return;
        }

        Course.update({
            Name: req.body.Name,
            Number: req.body.Number
        }, {
            where: {
                CourseID: req.body.courseid
            }
        }).then(function (result) {
            Course.find({
                where: {
                    CourseID: req.body.courseid
                }
            }).then(function (courseUpdated) {
                res.json({
                    'Error': false,
                    'Message': 'Success',
                    'result': result,
                    'CourseUpdated': courseUpdated
                });
            });
        }).catch(function (err) {
            console.log('/course/update : ' + err);
            res.status(401).end();
        });


    });

    //-----------------------------------------------------------------------------------------------------

    //Endpoint to update a section
    router.post('/course/updatesection', function (req, res) {

        if (req.body.sectionid == null) {
            console.log('course/updatesection : sectionid cannot be null');
            res.status(400).end();
            return;
        }

        if (req.body.name == null) {
            console.log('course/updatesection : name cannot be null');
            res.status(400).end();
            return;
        }

        Section.update({
            Name: req.body.name,
        }, {
            where: {
                SectionID: req.body.sectionid
            }
        }).then(function (result) {
            Section.find({
                where: {
                    SectionID: req.body.sectionid
                }
            }).then(function (sectionUpdated) {
                res.json({
                    'Error': false,
                    'Message': 'Success',
                    'result': result,
                    'CourseUpdated': sectionUpdated
                });
            }).catch(function (err) {
                console.log('/course/update : ' + err);
                res.status(401).end();
            });
        });

    });

    //-----------------------------------------------------------------------------------------------------

    //Endpoint to delete user
    router.delete('/course/deleteuser', function (req, res) {

        SectionUser.destroy({
            where: {
                UserID: req.body.userID,
                SectionID: req.body.SectionID
            }
        }).then(function (rows) {
            console.log('Delete User Success');
            res.status(200).end();
        }).catch(function (err) {
            console.log('/course/deleteuser : ' + err.message);

            res.status(400).end();
        });


    });

    //-----------------------------------------------------------------------------------------------------

    //Endpoint to get a user's courses
    router.get('/course/getCourses/:userid', async function (req, res) {
        var courses = [];
        let addedCourseIDs = [];

        var sections = await SectionUser.findAll({
            where: {
                UserID: req.params.userid
            },
            attributes: ['SectionUserID', 'SectionID', 'Role', 'Active'],
            include: [{
                model: Section,
                attributes: ['CourseID'],
                include: [{
                    model: Course,
                    attributes: ['CourseID', 'Number', 'Name']
                }]
            }]
        }).catch(function (err) {
            logger.log('error', 'failed getting section information', {
                error: err
            });
            res.status(401).end();
        });

        await sections.forEach(function (section) {
            //console.log(section.Section);
            if (section.Section !== null) {
                courses.push({
                    'CourseID': section.Section.Course.CourseID,
                    'Number': section.Section.Course.Number,
                    'Name': section.Section.Course.Name
                });

                addedCourseIDs.push(section.Section.Course.CourseID);
            }
        });

        let createdCourses = await Course.findAll({
            where: {
                CreatorID: req.params.userid
            }
        }).catch(function (err) {
            logger.log('error', 'failed getting courses created information', {
                error: err
            });
            res.status(401).end();
        });

        await createdCourses.forEach(function (course) {

            if (!addedCourseIDs.includes(course.CourseID)) {
                courses.push({
                    'CourseID': course.CourseID,
                    'Number': course.Number,
                    'Name': course.Name
                });
            }
        });


        res.json({
            'Error': false,
            'Message': 'Success',
            'Courses': courses
        });
    });
    //-----------------------------------------------------------------------------------------------------

    //-----------------------------------------------------------------------------------------------------



    //-----------------------------------------------------------------------------------------------------

    router.post('/password/reset', function (req, res) {
        if (req.body.email === null || req.body.email === '') {
            return res.status(401).end();
        }

        return UserLogin.findOne({
            where: {
                Email: req.body.email
            }
        })
            .then(async(user) => {
                console.log('found user', user);
                if (user == null) {
                    return res.status(401).end();
                }
                let temp_pass = await password.generate();
                user.Password = await password.hash(temp_pass);
                user.Pending = true;
                user.Attempts = 0;
                user.save().then((result) => {
                    let email = new Email();
                    email.sendNow(result.UserID, 'reset password', temp_pass);
                    res.status(200).end();

                });
            })
            .catch((err) => {
                console.log(err);
                res.status(500).end();
            });
    });

    //-----------------------------------------------------------------------------------------------------

    //Endpoint to Get Courses Created by an Instructor
    router.get('/getCourseCreated/:instructorID', function (req, res) {
        Course.findAll({
            where: {
                CreatorID: req.params.instructorID
            }
        }).then(function (Courses) {
            console.log('/getCourseCreated/ Courses found');
            res.json({
                'Error': false,
                'Courses': Courses
            });
        });
    });

    //Get all courses that the student has been enrolled in by their ID
    router.get('/getAllEnrolledCourses/:studentID', function (req, res) {
        SectionUser.findAll({
            where: {
                UserID: req.params.studentID
            },
            attributes: ['Role', ' Active'],
            include: [{
                model: Section,
                attributes: ['Name'],
                include: [{
                    model: Course,
                    attributes: ['Number', 'Name', 'Abbreviations']
                }]
            }]
        }).then(function (Courses) {
            console.log(`/getEnrolledCourses/ Courses for ${req.params.studentID} found `);
            res.json({
                'Error': false,
                'Courses': Courses
            });
        });
    });

    //Get the courses that are currently active(eg. in current semester) for a student
    router.get('/getActiveEnrolledCourses/:studentID', function (req, res) {
        SectionUser.findAll({
            where: {
                UserID: req.params.studentID,
                Active: true
            },
            attributes: ['Role'],
            include: [{
                model: Section,
                attributes: ['Name'],
                include: [{
                    model: Course,
                    attributes: ['Number', 'Name', 'Abbreviations']
                }]
            }]
        }).then(function (Courses) {
            console.log(`/getEnrolledCourses/ Courses for ${req.params.studentID} found `);
            res.json({
                'Error': false,
                'Courses': Courses
            });
        });
    });

    //------------------------------------------------------------
    //------------------------------------------------------------

    //Get the active sections for a student in a particular course
    router.get('/getActiveEnrolledSections/:courseID', function (req, res) {
        SectionUser.findAll({
            where: {
                UserID: req.query.studentID,
                Active: true
            },
            attributes: ['Role'],
            include: [{
                model: Section,
                attributes: ['SectionID', 'Name'],
                include: [{
                    model: Course,
                    attributes: ['CourseID', 'Number', 'Name']
                }, {
                    model: Semester,
                    attributes: ['SemesterID', 'Name']
                }]
            }]
        }).then(function (sections) {
            let returnSections = sections.filter((section) => {
                return section.Section.Course.CourseID == req.params.courseID;
            }).map(section => section.Section);
            Course.find({
                where: {
                    CourseID: req.params.courseID
                },
                attributes: ['CourseID', 'Number', 'Name', 'Description']
            }).then(function (result) {
                console.log(`/getActiveEnrolledSections/ Courses for ${req.query.studentID} found `);
                res.json({
                    'Error': false,
                    'Message': 'Success',
                    'Sections': returnSections,
                    'Course': result
                });
            });

        });
    });

    //-----------------------------------------------------------------------------------------------------

    //Endpoint to Get Courses Created by an Instructor
    router.get('/getOrganizationCourses/:organizationID', function (req, res) {
        Course.findAll({
            where: {
                OrganizationID: req.params.organizationID
            },
            order: [
                ['Number'],
                ['Name']
            ]
        }).then(function (Courses) {
            console.log('/getOrganizationCourses/ Courses found');
            res.json({
                'Error': false,
                'Courses': Courses
            });
        });
    });

    //-----------------------------------------------------------------------------------------------------

    //Endpoint to make a user an admin
    router.put('/makeUserAdmin/', function (req, res) {

        User.findById(req.body.UserID).then(function (user) {
            if (user == null) {
                console.log('/makeUserAdmin/ User not found');
                res.status(401).end();
            } else {
                user.Admin = 1;
                user.save().then(function () {
                    console.log('/makeUserAdmin : User Updated ');
                    res.status(200).end();
                }).catch(function (error) {
                    // Ooops, do some error-handling
                    console.log('/makeUserAdmin : Error while inserting ' + error.message);
                    res.status(401).end();
                });
            }
        });
    });

    //-----------------------------------------------------------------------------------------------------

    //Endpoint to make a user not an admin
    router.put('/makeUserNotAdmin/', function (req, res) {
        UserLogin.find({
            where: {
                UserID: req.body.UserID
            }
        }).then(async function (userLogin) {
            if (userLogin != null && await password.verify(userLogin.Password, req.body.password)) {
                User.findById(req.body.UserID).then(function (user) {
                    if (user == null) {
                        console.log('/makeUserNotAdmin/ User not found');
                        res.status(401).end();
                    } else {
                        user.Admin = 0;
                        user.save().then(function () {
                            console.log('/makeUserNotAdmin : User Updated ');
                            res.status(200).end();
                        }).catch(function (error) {
                            // Ooops, do some error-handling
                            console.log('/makeUserNoAdmin : Error while inserting ' + error.message);
                            res.status(401).end();
                        });
                    }
                });
            } else {
                console.log('/makeUserNoAdmin : Authentication Failed');
                res.status(401).end();
            }
        });
    });

    //-----------------------------------------------------------------------------------------------------

    //Assign a New Instructor
    router.put('/instructor/new', function (req, res) {
        var email = req.body.email;
        UserLogin.find({
            where: {
                Email: email
            },
            attributes: ['UserID']
        }).then(function (userID) {
            if (userID == null) {
                console.log('Email Not Found - Making Instructor ' + email);
                UserContact.create({
                    Email: email,
                    Phone: 'XXX-XXX-XXXX',
                    FirstName: 'Temp',
                    LastName: 'Temp',
                }).catch(function (err) {
                    console.log(err);
                }).then(function (userCon) {
                    User.create({
                        FirstName: 'Temp',
                        LastName: 'Temp',
                        OrganizationGroup: {
                            'OrganizationID': []
                        },
                        UserContactID: userCon.UserContactID,
                        Instructor: true,
                        Admin: 0
                    }).catch(function (err) {
                        console.log(err);
                    }).then(async function (user) {
                        UserLogin.create({
                            UserID: user.UserID,
                            Email: email,
                            Password: await password.hash('pass123')
                        }).catch(function (err) {
                            console.log(err);
                        }).then(function (userLogin) {
                            //Email User With Password
                            console.log('/instructor/new made');
                            res.status(200).end();
                        });
                    });
                });
            } else {
                User.find({
                    where: {
                        UserID: userID.UserID
                    },
                    attributes: ['Instructor', 'UserID']
                }).then(function (makerID) {
                    if (!makerID.Instructor) {
                        makerID.updateAttributes({
                            UserID: makerID.UserID,
                            Instructor: true
                        }).success(function () {
                            console.log('/instructor/new : success');
                            res.status(200).end();
                        });
                    } else {
                        console.log('/instructor/new : already instructor');
                        res.status(400).end();
                    }
                });
            }
        });
    });

    //-----------------------------------------------------------------------------------------------------


    //Get All Instructors
    router.get('/instructor/all', function (req, res) {
        User.findAll({
            where: {
                Instructor: true
            },
            attributes: ['UserID', 'FirstName', 'LastName', 'Admin']
        }).then(function (instructors) {
            console.log('/instructors called');
            res.json({
                'Instructors': instructors
            });
        });
    });

    router.get('/organization', function (req, res) {
        console.log('/organization: called');
        Organization.findAll({
            order: [
                ['Name']
            ]
        }).then(function (rows) {
            res.json({
                'Error': false,
                'Message': 'Success',
                'Organization': rows
            });
        }).catch(function (err) {
            console.log('/organization: ' + err.message);
            res.status(401).end();
        });
    });


    //creates organization
    router.post('/createorganization', function (req, res) {
        console.log('/createorganization');
        Organization.find({
            where: {
                Name: req.body.organizationname //new
            },
            attributes: ['OrganizationID']
        }).then(function (response) {
            if (response == null || response.OrganizationID == null) {
                Organization.create({
                    Name: req.body.organizationname
                }).catch(function (err) {
                    console.log(err);
                }).then(function (result) {
                    res.json({
                        'neworganization': result,
                        'org_feedback': true
                    });
                });

            } else {
                console.log('User and Organization Exist');
                res.json({
                    'neworganization': null,
                    'org_feedback': false
                });
            }
        });
    });

    //-----------------------------------------------------------------------------------------------------

    //Get UserID from Email
    router.get('/getUserID/:email', function (req, res) {
        UserLogin.find({
            where: {
                Email: req.params.email
            }
        }).then(function (user) {
            res.json({
                'UserID': user.UserID
            });
        }).catch(function (e) {
            console.log('getUserID ' + e);
            res.json({
                'UserID': -1
            });
        });
    });

    //-----------------------------------------------------------------------------------------------------

    //Endpoint to Get Pending Tasks
    router.get('/taskInstance/:userid', function (req, res) {
        TaskInstance.findAll({
            where: {
                UserID: req.params.userid
            }
        }).then(function (taskInstance) {
            res.json({
                'TaskInstances': taskInstance
            });
        }).catch(function (e) {
            console.log('/taskInstanceInstance/:userid ' + e);
            res.json({
                'TaskInstances': -1
            });
        });
    });

    //-----------------------------------------------------------------------------------------------------
    //Endpoint to create an assignment instance based on assignment and section
    router.post('assignment/section', function (req, res) {

        AssignmentInstance.create({
            AssignmentID: req.body.assignmentid,
            SectionID: req.body.sectionid

        }).save().then(function () {

            console.log('/assignment/section success');
            res.status(200).end();

        }).catch(function (e) {
            console.log('/assignment/section ' + e);
            res.status(400).end();
        });
    });

    //---------------------------------------------------------------------------------------------------------------------------------------------

    //Endpoint to get task instance header data for front end
    router.get('/taskInstanceTemplate/main/:taskInstanceID', function (req, res) {

        logger.log('info', 'get: /taskInstanceTemplate/main/:taskInstanceID', {
            req_query: req.query
        });
        TaskInstance.find({
            where: {
                TaskInstanceID: req.params.taskInstanceID
            },
            include: [{
                model: TaskActivity,
                include: [{
                    model: Assignment,
                    attributes: ['AssignmentID', 'Instructions', 'Documentation', 'Name', 'Type', 'DisplayName']
                }],
                attributes: ['Type']
            }, {
                model: AssignmentInstance,
                include: [{
                    model: Section,
                    attributes: ['Name', 'SectionID'],
                    include: [{
                        model: Course,
                        attributes: ['Name', 'Number']
                    },
                    {
                        model: Semester,
                        attributes: ['SemesterID', 'Name']
                    }
                    ]
                }]

            }]
        })
            .catch(function (err) {
                //Catch error and print into console.
                console.log(err);
                logger.log('error', '/taskInstanceTemplate/main/', {
                    error: err
                });
                res.status(400).end();
            })
            .then(function (taskInstanceResult) {
                return res.json({
                    'Error': false,
                    'Message': 'Success',
                    'taskActivityID': taskInstanceResult.TaskActivityID,
                    'taskActivityType': taskInstanceResult.TaskActivity.Type,
                    'courseName': taskInstanceResult.AssignmentInstance.Section.Course.Name,
                    'courseNumber': taskInstanceResult.AssignmentInstance.Section.Course.Number,
                    'assignment': taskInstanceResult.TaskActivity.Assignment,
                    'semesterID': taskInstanceResult.AssignmentInstance.Section.Semester.SemesterID,
                    'semesterName': taskInstanceResult.AssignmentInstance.Section.Semester.Name,
                    'sectionName': taskInstanceResult.AssignmentInstance.Section.Name,
                    'sectionID': taskInstanceResult.AssignmentInstance.Section.Name
                });
            });

    });

    // Endpoint to submit the taskInstance input and sync into database
    router.post('/taskInstanceTemplate/create/submit', async function (req, res) {

        var grade = new Grade();
        var trigger = new TaskTrigger();

        logger.log('info', 'post: /taskInstanceTemplate/create/submit', {
            req_body: req.body
        });

        if (req.body.taskInstanceid == null) {
            logger.log('info', 'TaskInstanceID cannot be null');
            return res.status(400).end();
        }
        if (req.body.userid == null) {
            logger.log('info', 'UserID cannot be null');
            return res.status(400).end();
        }
        if (req.body.taskInstanceData == null) {
            logger.log('info', 'Data cannot be null');
            return res.status(400).end();
        }

        var ti = await TaskInstance.find({
            where: {
                TaskInstanceID: req.body.taskInstanceid,
            },
            include: [{
                model: TaskActivity,
                attributes: ['Type', 'AllowRevision', 'AllowReflection'],
            }, ],
        });

        if (JSON.parse(ti.Status)[0] === 'complete') {
            logger.log('error', 'The task has been complted already');
            return res.status(403).end();
        }

        logger.log('info', 'task instance found', ti.toJSON());
        //Ensure userid input matches TaskInstance.UserID
        if (req.body.userid != ti.UserID) {
            logger.log('error', 'UserID Not Matched');
            return res.status(400).end();
        }
        if (ti.TaskActivity.Type === 'edit') {
            await trigger.approved(req.body.taskInstanceid, req.body.taskInstanceData);
        } else {

            var ti_data = await JSON.parse(ti.Data);

            if (!ti_data) {
                ti_data = [];
            }

            await ti_data.push(req.body.taskInstanceData);

            logger.log('info', 'updating task instance', {
                ti_data: ti_data
            });

            var newStatus = JSON.parse(ti.Status);
            newStatus[0] = 'complete';

            var final_grade = await trigger.finalGrade(ti, req.body.taskInstanceData);

            var done = await TaskInstance.update({
                Data: ti_data,
                ActualEndDate: new Date(),
                Status: JSON.stringify(newStatus),
                FinalGrade: final_grade
            }, {
                where: {
                    TaskInstanceID: req.body.taskInstanceid,
                    UserID: req.body.userid,
                }
            });

            var new_ti = await TaskInstance.find({
                where: {
                    TaskInstanceID: req.body.taskInstanceid,
                },
                include: [{
                    model: TaskActivity,
                    attributes: ['Type'],
                }, ],
            });

            console.log(JSON.parse(new_ti.Data), new_ti.TaskInstanceID);

            logger.log('info', 'task instance updated');
            logger.log('info', 'triggering next task');

            await trigger.next(req.body.taskInstanceid);
        }

        // if (-1 != ['edit', 'comment'].indexOf(ti.TaskActivity.Type)) {
        //     var pre_ti_id = JSON.parse(ti.PreviousTask)[0].id;
        //     logger.log('info', 'this is a revision task, finding previous task instance id', pre_ti_id);

        //     TaskInstance.find({
        //         where: {
        //             TaskInstanceID: pre_ti_id
        //         }
        //     }).then(function (pre_ti) {
        //         logger.log('info', 'task instance found', pre_ti.toJSON());
        //         ti_data = JSON.parse(pre_ti.Data);

        //         if (!ti_data) {
        //             ti_data = [];
        //         }
        //         ti_data.push(req.body.taskInstanceData);

        //         logger.log('info', 'updating task instance', {
        //             ti_data: ti_data
        //         });

        //         return TaskInstance.update({
        //             Data: ti_data,
        //         }, {
        //             where: {
        //                 TaskInstanceID: pre_ti.TaskInstanceID,
        //             },
        //         }).then(function (done) {
        //             logger.log('info', 'task instance updated', {
        //                 done: done
        //             });
        //         }).catch(function (err) {
        //             logger.log('error', 'task instance update failed', {
        //                 err: err
        //             });
        //         });
        //     });
        // }

        return res.status(200).end();




        // return TaskInstance.find({
        //     where: {
        //         TaskInstanceID: req.body.taskInstanceid,
        //     },
        //     include: [{
        //         model: TaskActivity,
        //         attributes: ['Type'],
        //     }, ],
        // }).then(async function(ti) {
        //     logger.log('info', 'task instance found', ti.toJSON())
        //     //Ensure userid input matches TaskInstance.UserID
        //     if (req.body.userid != ti.UserID) {
        //         logger.log('error', 'UserID Not Matched')
        //         return res.status(400).end()
        //     }
        //     var ti_data = JSON.parse(ti.Data)
        //
        //     if (!ti_data) {
        //         ti_data = []
        //     }
        //     ti_data.push(req.body.taskInstanceData)
        //
        //     logger.log('info', 'updating task instance', {
        //         ti_data: ti_data
        //     })
        //
        //     // return TaskInstance.find({
        //     //     where: {
        //     //         TaskInstanceID: req.body.taskInstanceid,
        //     //         UserID: req.body.userid,
        //     //     },
        //     //     include:[
        //     //       {
        //     //         model: TaskActivity
        //     //       }
        //     //     ]
        //     // }).then(function(ti) {
        //     var newStatus = JSON.parse(ti.Status);
        //     newStatus[0] = 'complete';
        //     await TaskInstance.update({
        //         Data: ti_data,
        //         ActualEndDate: new Date(),
        //         Status: JSON.stringify(newStatus),
        //     }, {
        //         where: {
        //             TaskInstanceID: req.body.taskInstanceid,
        //             UserID: req.body.userid,
        //         }
        //     }).then(async function(done) {
        //         logger.log('info', 'task instance updated', {
        //             done: done
        //         })
        //         logger.log('info', 'triggering next task')
        //         //Trigger next task to start
        //         await ti.triggerNext()
        //
        //         console.log('trigger completed');
        //
        //         if (-1 != ['edit', 'comment'].indexOf(ti.TaskActivity.Type)) {
        //             var pre_ti_id = JSON.parse(ti.PreviousTask)[0].id
        //             logger.log('info', 'this is a revision task, finding previous task instance id', pre_ti_id)
        //
        //             TaskInstance.find({
        //                 where: {
        //                     TaskInstanceID: pre_ti_id
        //                 }
        //             }).then(function(pre_ti) {
        //                 logger.log('info', 'task instance found', pre_ti.toJSON())
        //                 ti_data = JSON.parse(pre_ti.Data)
        //
        //                 if (!ti_data) {
        //                     ti_data = []
        //                 }
        //                 ti_data.push(req.body.taskInstanceData)
        //
        //                 logger.log('info', 'updating task instance', {
        //                     ti_data: ti_data
        //                 })
        //
        //                 return TaskInstance.update({
        //                     Data: ti_data,
        //                 }, {
        //                     where: {
        //                         TaskInstanceID: pre_ti.TaskInstanceID,
        //                     },
        //                 }).then(function(done) {
        //                     logger.log('info', 'task instance updated', {
        //                         done: done
        //                     })
        //                 }).catch(function(err) {
        //                     logger.log('error', 'task instance update failed', {
        //                         err: err
        //                     })
        //                 })
        //             })
        //         }
        //         return res.status(200).end()
        //     }).catch(function(err) {
        //         console.log('err', err);
        //         logger.log('error', 'task instance update failed', {
        //             err: err
        //         })
        //         return res.status(400).end();
        //     })
        //     //})
        // })
    });

    //Endpoint to save the task instance input
    router.post('/taskInstanceTemplate/create/save', async function (req, res) {
        if (req.body.taskInstanceid == null) {
            console.log('/taskInstanceTemplate/create/save : TaskInstanceID cannot be null');
            res.status(400).end();
            return;
        }
        if (req.body.userid == null) {
            console.log('/taskInstanceTemplate/create/save : UserID cannot be null');
            res.status(400).end();
            return;
        }
        if (req.body.taskInstanceData == null) {
            console.log('/taskInstanceTemplate/create/save : Data cannot be null');
            res.status(400).end();
            return;
        }

        var ti = await TaskInstance.find({
            where: {
                TaskInstanceID: req.body.taskInstanceid,
                UserID: req.body.userid
            }
        });
        //Ensure userid input matches TaskInstance.UserID
        if (req.body.userid != ti.UserID) {
            console.log('/taskInstanceTemplate/create/save : UserID Incorrect Match');
            res.status(400).end();
            return;
        }

        var status = JSON.parse(ti.Status);
        status[4] = 'saved';

        var ti_data = await JSON.parse(ti.Data);
        if (!ti_data) {
            ti_data = [];
        }
        await ti_data.push(req.body.taskInstanceData);



        //Task_Status remains incomplete and store userCreatedProblem
        await ti.update({
            Data: ti_data,
            Status: status
        });

        res.json({
            'Error': false,
            'Message': 'Success',
            'Result': response
        });

    });


    //---------------------------------------------------------------------------------------------------------------------------------------------


    //Endpoint to get the PendingTasks of users
    /* Need to only pick relevant data. Too big, could cause scaling slowdown issues
    Most likely: TaskInstanceID,UserID,WorlkflowID, StartDate,EndDate,Status from TaskInstance; Name,Visual_ID from TaskActivity; Name from WorkflowActivity
    */
    router.get('/getPendingTaskInstances/:userID', function (req, res) {
        TaskInstance.findAll({
            where: {
                UserID: req.params.userID,
                $or: [{
                    Status: {
                        $like: '%"incomplete"%'
                    }
                }, {
                    Status: {
                        $like: '%"started"%'
                    }
                }]
            },

            attributes: ['TaskInstanceID', 'UserID', 'WorkflowInstanceID', 'StartDate', 'EndDate', 'Status'],
            include: [ ///// Need new mappings in index.js AssignmentInstance -> Assignment, Assignment ::=> AssignmentInstance
                {
                    model: AssignmentInstance,
                    attributes: ['AssignmentInstanceID', 'AssignmentID'],
                    include: [{
                        model: Section,
                        attributes: ['SectionID'],
                        include: [{
                            model: Course,
                            attributes: ['Name', 'CourseID']
                        }]

                    }, {
                        model: Assignment,
                        attributes: ['Name']
                    }]
                },
                /*TaskInstance - > AssignmentInstance - > Section - > Course */
                {
                    model: TaskActivity,
                    attributes: ['Name', 'DisplayName', 'Type', 'VisualID'],
                    include: [{
                        model: WorkflowActivity,
                        attributes: ['Name']
                    }]
                }
            ]
        }).then(function (taskInstances) {

            console.log('/getPendingTaskInstances/ TaskInstances found');
            res.json({
                'Error': false,
                'PendingTaskInstances': taskInstances
            });

        }).catch(function (err) {

            console.log('/getPendingTaskInstances: ' + err);
            res.status(404).end();

        });


    });

    //Endpoint to get completed task instances for user
    router.get('/getCompletedTaskInstances/:userID', function (req, res) {

        TaskInstance.findAll({
            where: {
                UserID: req.params.userID,
                Status: {
                    $like: '%"complete"%'
                }
            },
            attributes: ['TaskInstanceID', 'UserID', 'WorkflowInstanceID', 'StartDate', 'EndDate', 'Status'],
            include: [ ///// Need new mappings in index.js AssignmentInstance -> Assignment, Assignment ::=> AssignmentInstance
                {
                    model: AssignmentInstance,
                    attributes: ['AssignmentInstanceID', 'AssignmentID'],
                    include: [{
                        model: Section,
                        attributes: ['SectionID'],
                        include: [{
                            model: Course,
                            attributes: ['Name', 'CourseID']
                        }]

                    }, {
                        model: Assignment,
                        attributes: ['Name']
                    }]
                }, {
                    model: TaskActivity,
                    attributes: ['Name', 'DisplayName', 'Type', 'VisualID'],
                    include: [{
                        model: WorkflowActivity,
                        attributes: ['Name']
                    }]
                }
            ]
        }).then(function (taskInstances) {

            console.log('/getCompletedTaskInstances/ TaskInstances found');

            res.json({
                'Error': false,
                'CompletedTaskInstances': taskInstances
            });
        }).catch(function (err) {

            console.log('/getCompletedTaskInstances: ' + err);
            res.status(404).end();

        });
    });

    //Endpoint to retrieve all the assignment and its current state
    router.get('/getAssignmentRecord/:assignmentInstanceid', function (req, res) {
        var taskFactory = new TaskFactory();

        console.log('/getAssignmentRecord/:assignmentInstanceid: Initiating...');

        var tasks = [];
        var info = {};

        return AssignmentInstance.find({
            where: {
                AssignmentInstanceID: req.params.assignmentInstanceid
            }
        }).then(function (AI_Result) {

            return WorkflowInstance.findAll({
                where: {
                    AssignmentInstanceID: req.params.assignmentInstanceid
                }
            }).then(function (WI_Result) {

                if (WI_Result === null || typeof WI_Result === undefined) {
                    console.log('/getAssignmentRecord/:assignmentInstanceid: No WI_Result');
                } else {
                    //Iterate through all workflow instances found
                    return Promise.mapSeries(WI_Result, function (workflowInstance) {

                        console.log('/getAssignmentRecord/:assignmentInstanceid: WorkflowInstance', workflowInstance.WorkflowInstanceID);
                        var tempTasks = [];

                        return Promise.mapSeries(JSON.parse(workflowInstance.TaskCollection), function (task) {

                            console.log('/getAssignmentRecord/:assignmentInstanceid: TaskCollection', task);
                            //each task is TaskInstanceID
                            return TaskInstance.find({
                                where: {
                                    TaskInstanceID: task
                                },
                                attributes: ['TaskInstanceID', 'WorkflowInstanceID', 'Status', 'NextTask', 'IsSubWorkflow', 'UserHistory'],
                                include: [{
                                    model: User,
                                    attributes: ['UserID', 'FirstName', 'Instructor']
                                }, {
                                    model: TaskActivity,

                                    attributes: ['Name', 'Type']
                                }]
                            }).then(function (taskInstanceResult) {

                                //Array of all the task instances found within taskcollection
                                if (taskInstanceResult.IsSubWorkflow === 0) {

                                    taskFactory.getSubWorkflow(taskInstanceResult.TaskInstanceID, new Array()).then(function (subworkflow) {
                                        if (!taskInstanceResult.hasOwnProperty('SubWorkflow')) {
                                            taskInstanceResult.setDataValue('SubWorkflow', subworkflow);
                                        } else {
                                            taskInstanceResult.SubWorkflow.push(sw);
                                        }
                                    });

                                    tempTasks.push(taskInstanceResult);
                                }
                            });
                        }).then(function (result) {

                            //Array of arrays of all task instance collection
                            tasks.push(tempTasks);

                            return AssignmentInstance.find({
                                where: {
                                    AssignmentInstanceID: req.params.assignmentInstanceid
                                }
                            }).then(function (AI_Result) {
                                info.SectionID = AI_Result;
                                return Assignment.find({
                                    where: {
                                        AssignmentID: AI_Result.AssignmentID
                                    },
                                    attributes: ['OwnerID', 'SemesterID', 'CourseID', 'DisplayName', 'SectionID']
                                }).then(function (A_Result) {
                                    info.Assignment = A_Result;
                                    //console.log("A_Result", A_Result);
                                    return User.find({
                                        where: {
                                            UserID: A_Result.OwnerID
                                        },
                                        attributes: ['FirstName', 'LastName']
                                    }).then(function (user) {
                                        info.User = user;

                                        return Course.find({
                                            where: {
                                                CourseID: A_Result.CourseID
                                            },
                                            attributes: ['Name']
                                        }).then(function (course) {
                                            info.Course = course;
                                        });
                                    });
                                });
                            });
                        });
                    });
                }

            }).then(function (done) {

                console.log('/getAssignmentRecord/:assignmentInstanceid: Done!');

                res.json({
                    'Error': false,
                    'Info': info,
                    'Workflows': JSON.parse(AI_Result.WorkflowCollection),
                    'AssignmentRecords': tasks
                });

            }).catch(function (err) {

                console.log('/getAssignmentRecord: ' + err);
                res.status(404).end();
            });
        });
    });

    //Endpoint for all current task data and previous task data and put it in an array
    router.get('/superCall/:taskInstanceId', async function (req, res) {
        logger.log('info', 'get: /superCall/:taskInstanceId', {
            req_query: req.query,
            req_params: req.params
        });
        var allocator = new TaskFactory();

        let taskActivityAttributes = ['TaskActivityID', 'Type', 'Rubric', 'Instructions', 'Fields', 'NumberParticipants', 'FileUpload', 'DisplayName', 'AllowRevision'];

        await allocator.findPreviousTasks(req.params.taskInstanceId, new Array()).then(async function (done) {

            //console.log('done!', done);
            var ar = new Array();
            if (done == null) {

                await TaskInstance.find({
                    where: {
                        TaskInstanceID: req.params.taskInstanceId
                    },
                    attributes: ['TaskInstanceID', 'Data', 'Status', 'Files'],
                    include: [{
                        model: TaskActivity,
                        attributes: taskActivityAttributes
                    }]
                })
                    .then((result) => {
                        //console.log(result);
                        ar.push(result);
                        res.json({
                            'previousTasksList': done,
                            'superTask': ar
                        });
                    });
            } else {


                await Promise.mapSeries(done, async function (task) {
                    await TaskInstance.find({
                        where: {
                            TaskInstanceID: task
                        },
                        attributes: ['TaskInstanceID', 'Data', 'Status', 'Files', 'UserID', 'PreviousTask'],
                        include: [{
                            model: TaskActivity,
                            attributes: taskActivityAttributes

                        }]
                    }).then((result) => {
                        //console.log(result);
                        // check to see if the user has view access to this task in the history (workflow) and if not: immediately respond with error
                        ar.push(result);

                        //return allocator.applyViewContstraints(res, req.query.userID, result)
                    });
                }).then(async function () {
                    await TaskInstance.find({
                        where: {
                            TaskInstanceID: req.params.taskInstanceId
                        },
                        attributes: ['TaskInstanceID', 'Data', 'Status', 'Files', 'UserID', 'PreviousTask'],
                        include: [{
                            model: TaskActivity,
                            attributes: taskActivityAttributes

                        }]
                    })
                        .then((result) => {
                            //console.log(result);

                            ar.push(result);
                            res.json({
                                error: false,
                                previousTasksList: done,
                                superTask: ar,
                            });
                            logger.log('debug', 'done collecting previous tasks');
                            // check to see if the user has view access to the current task (requested task) and if not: immediately respond with error
                            // return Promise.all([allocator.applyViewContstraints(res, req.query.userID, result)]).then(function(done1) {
                            //     if (res._headerSent) { // if already responded (response sent)
                            //         return
                            //     }
                            //     // update data field of all tasks with the appropriate allowed version
                            //     allocator.applyVersionContstraints(ar, result, req.query.userID)
                            //     ar.push(result);
                            //     res.json({
                            //         error: false,
                            //         previousTasksList: done,
                            //         superTask: ar,
                            //     });
                            // })
                        });
                });
            }

        }).catch(function (err) {
            console.log(err);
            res.status(401).end();
        });


        await TaskInstance.find({
            where: {
                TaskInstanceID: req.params.taskInstanceId
            }
        }).then(async function (ti) {
            var newStatus = JSON.parse(ti.Status);
            if (newStatus[4] === 'not_opened') {
                newStatus[4] = 'viewed';
                logger.log('info', 'task opened for the first time, updating status...');
                await TaskInstance.update({
                    Status: JSON.stringify(newStatus)
                }, {
                    where: {
                        TaskInstanceID: req.params.taskInstanceId
                    }
                });
            }
        });




    });

    //Endpoint to get all the sections assoicate with course and all the task activities within the workflow activities
    router.get('/getAssignToSection/', function (req, res) {

        console.log('/getAssignToSection: Initiating... ');

        var sectionIDs = [];
        var taskCollection = {};
        var isDone = false;
        var DisplayName;
        var workflowNames = {};

        Assignment.find({
            where: {
                AssignmentID: req.query.assignmentid
            },
            attributes: ['DisplayName']
        }).then(function (AI_Result) {
            DisplayName = AI_Result;
        });

        //Find all WorkflowActivities associate with assignmentid
        var workflowActivity = WorkflowActivity.findAll({
            where: {

                AssignmentID: req.query.assignmentid
            }
        });

        //Find all Sections associate with courseid
        var sections = Section.findAll({
            where: {
                CourseID: req.query.courseid
            }
        });

        //Promise sections has all the data returned
        Promise.all(sections).then(function (result) {
            console.log('Finding all sections associate with course... ');

            //Create an array of all the sections associate with courseid
            result.forEach(function (section) {
                sectionIDs.push({
                    value: section.SectionID,
                    label: section.Name
                });
            });

            isDone = true;

            console.log('sectionIDs', sectionIDs);
        }).catch(function (err) {
            console.log('/getAssignToSection: ', err);
            res.status(404).end();
        });

        //Promise workflowActivity has all the data returned
        Promise.all(workflowActivity).then(function (result) {

            //Check if result is empty
            if (result !== null || typeof result !== undefined) {
                //WorkflowActivityID -- key
                result.forEach(function (workflow) {
                    taskCollection[workflow.WorkflowActivityID] = [];
                    workflowNames[workflow.WorkflowActivityID] = workflow.Name;
                });
            }

            return [taskCollection, result];

        }).then(function (resultArray) {
            console.log('Finding all workflows and its task collection...');
            //promise all instances in resultArray have returned
            return Promise.map(resultArray[1], function (workflow) {

                console.log('WorkflowActivityID: ', workflow.WorkflowActivityID);

                //Loop through TaskActivityCollection in each workflowActivity
                return Promise.map(JSON.parse(workflow.TaskActivityCollection), function (taskActivityID) {

                    console.log('TaskActivityID:', taskActivityID);

                    //Find TaskActivity object and return
                    return TaskActivity.find({
                        where: {
                            TaskActivityID: taskActivityID
                        }
                    }).then(function (taskActivity) {

                        //Push the resulting name and TaskActivityID on to javascript object
                        taskCollection[workflow.WorkflowActivityID].push({
                            'taskActivityID': taskActivity.TaskActivityID,
                            'name': taskActivity.Name,
                            'type': taskActivity.Type,
                            'defaults': taskActivity.DueType
                        });
                        taskCollection[workflow.WorkflowActivityID].sort(function (a, b) {
                            var x = a.taskActivityID < b.taskActivityID ? -1 : 1;
                            return x;
                        });

                    }).catch(function (err) {
                        console.log('/getAssignToSection: ', err);
                        res.status(404).end();
                    });;
                });
            });

        }).then(function (done) {
            //if sectionIDs are set then return

            if (isDone === true) {
                res.json({
                    'assignment': DisplayName,
                    'workflowNames': workflowNames,
                    'sectionIDs': sectionIDs,
                    'taskActivityCollection': taskCollection //returns workflow id follows by task act
                });
            }
        }).catch(function (err) {
            console.log('/getAssignToSection: ', err);
            res.status(404).end();
        });


    });

    //Endopint to assign an assignment to a section
    router.post('/getAssignToSection/submit/', async function (req, res) {
        //creates new allocator object
        var taskFactory = new TaskFactory();
        var manager = new Manager();
        var make = new Make();

        console.log('/getAssignToSection/submit/  Creating Assignment Instance...');


        //create assignment instance
        await taskFactory.createAssignmentInstances(req.body.assignmentid, req.body.sectionIDs, req.body.startDate, req.body.wf_timing).then(async function (done) {
            console.log('/getAssignToSection/submit/   All Done!');
            console.log(typeof req.body.wf_timing.startDate, req.body.wf_timing.startDate);
            if (moment(req.body.wf_timing.startDate) <= new Date()) {
                await Promise.mapSeries(req.body.sectionIDs, async function (secId) {
                    await make.allocateUsers(secId, req.body.assignmentid);
                });
            };
            res.status(200).end();
        }).catch(function (err) {
            console.log(err);
            res.status(404).end();
        });

    });

    router.get('/getTree', function (req, res) {
        var taskFactory = new TaskFactory();
        var node1;
        var node2;

        Promise.all([taskFactory.getTree(1, function (tree) {
            let ar = [];
            tree.walk(function (node) {
                console.log(node.model.id);
                ar.push(node.model.id);
            });
            node1 = tree.first(function (node) {
                //console.log("first :", node);
                return node.model.id === 1;
            });
            node2 = tree.all(function (node) {
                //console.log("all :", node);
                return node.model.parent === 1;
            });

            //console.log('nodes',node1, node2);
            // res.json({
            //     Arra: ar,
            //     Node1: node1,
            //     Node2: node2
            // });
            //res.status(200).end();
        })]).then(function (done) {
            console.log('nodes', node1, node2);
        });
    });

    router.get('/openRevision/:taskInstanceID', function (res, req) {

        if (req.params.taskInstanceID == null) {
            console.log('/openRevision/:taskInstanceID TaskInstanceID cannot be empty!');
            res.stats(404).end();
        }

        TaskInstance.find({
            where: {
                TaskInstanceID: req.params.taskInstanceID
            }
        }).then(function (ti_result) {
            TaskActivity.find({
                where: {
                    TaskActivityID: ti_result.TaskActivityID
                }
            }).then(function (ta_result) {
                if (ta_result.AllowRevision === 0) {
                    console.log('Allow revision is false');
                    res.stats(404).end();
                } else {
                    ti_result.Status = 'pending';
                }
            }).catch(function (err) {
                console.log(err);
                res.status(404).end();
            });
        });
    });

    router.get('/openRevision/save', function (res, req) {
        if (req.body.data == null) {
            console.log('/openRevision/save: data is missing');
            res.status(404).end();
        }
        if (req.body.taskInstanceID == null) {
            console.log('/openRevision/save TaskInstanceID cannot be empty!');
            res.stats(404).end();
        }

        //append second status
        TaskInstance.update({
            Data: req.body.data
        }, {
            where: {
                TaskInstanceID: req.body.taskInstanceID
            }
        }).catch(function (err) {
            console.log(err);
            res.stats(400).end();
        });

    });

    router.get('/openRevision/submit', function (res, req) {
        if (req.body.data == null) {
            console.log('/openRevision/save: data is missing');
            res.status(404).end();
        }
        if (req.body.taskInstanceID == null) {
            console.log('/openRevision/save TaskInstanceID cannot be empty!');
            res.stats(404).end();
        }

        //append second status
        TaskInstance.find({
            where: {
                TaskInstanceID: req.body.taskInstanceID
            }
        }).then(function (ti) {
            var newStatus = JSON.parse(ti.Status);
            newStatus[0] = 'complete';
            TaskInstance.update({
                Data: req.body.data,
                Status: JSON.stringify(newStatus)
            }, {
                where: {
                    TaskInstanceID: req.body.taskInstanceID
                }
            }).catch(function (err) {
                console.log(err);
                res.stats(400).end();
            });
        });

    });

    //Backend router to reallocate students
    router.post('/reallocate', function (req, res) {

        if (req.body.taskid == null || req.body.users == null) {
            console.log('/reallocate: missing required fields.');
            res.status(401).end();
            return;
        }

        var realloc = new Allocator([], 0);

        realloc.reallocate(req.body.taskid, req.body.users);
    });

    router.get('/getActiveAssignmentsForSection/:sectionId', function (req, res) {
        console.log(`Finding Assignments for Section ${req.params.sectionId}`);
        AssignmentInstance.findAll({
            where: {
                SectionID: req.params.sectionId
            },
            attributes: ['AssignmentInstanceID', 'StartDate', 'EndDate'],
            include: [{
                model: Assignment,
                attributes: ['DisplayName']
            }]
        }).then(function (result) {
            console.log('Assignments have been found!');
            res.json({
                'Error': false,
                'Assignments': result
            });
        }).catch(function (err) {
            console.log('/getActiveAssignmentsForSection/' + req.params.sectionId + ': ' + err);
            res.status(404).end();
        });
    });

    router.get('/getActiveAssignments/:courseId', function (req, res) {
        console.log('Finding assignments...');
        Assignment.findAll({
            where: {
                CourseID: req.params.courseId
            },
            attributes: ['AssignmentID', 'DisplayName', 'Type'],
            include: [{
                model: AssignmentInstance,
                as: 'AssignmentInstances',
                attributes: ['AssignmentInstanceID', 'StartDate', 'EndDate', 'SectionID']

            }]
        }).then(function (result) {
            console.log('Assignments have been found!');
            res.json({
                'Error': false,
                'Assignments': result
            });
        }).catch(function (err) {
            console.log('/getActiveAssignments/' + req.params.courseId + ': ' + err);
            res.status(404).end();
        });
    });

    router.get('/getAllEnrolledCourses/:studentID', function (req, res) {
        SectionUser.findAll({
            where: {
                UserID: req.params.studentID
            },
            attributes: ['Role', ' Active'],
            include: [{
                model: Section,
                attributes: ['Name'],
                include: [{
                    model: Course,
                    attributes: ['Number', 'Name', 'Abbreviations']
                }]
            }]
        }).then(function (Courses) {
            console.log(`/getEnrolledCourses/ Courses for ${req.params.studentID} found `);
            res.json({
                'Error': false,
                'Courses': Courses
            });
        });
    });

    router.get('/getActiveEnrolledCourses/:studentID', function (req, res) {
        SectionUser.findAll({
            where: {
                UserID: req.params.studentID,
                Active: true
            },
            raw: true,
            attributes: ['Role'],
            include: [{
                model: Section,
                attributes: ['Name'],
                include: [{
                    model: Course,
                    attributes: ['Number', 'Name', 'Abbreviations']
                }]
            }]
        }).then(function (Courses) {
            console.log(`/getEnrolledCourses/ Courses for ${req.params.studentID} found `);
            res.json({
                'Error': false,
                'Courses': Courses
            });
        });
    });

    router.get('/getSubWorkFlow/:taskInstanceID', function (req, res) {
        var taskFactory = new TaskFactory();
        taskFactory.getSubWorkflow(req.params.taskInstanceID, new Array()).then(function (subworkflow) {
            res.json({
                'Error': false,
                'SubWorkflow': subworkflow
            });
        });
    });

    router.get('/getNextTask/:taskInstanceID', function (req, res) {
        var taskFactory = new TaskFactory();
        taskFactory.getNextTask(req.params.taskInstanceID, new Array()).then(function (NextTask) {
            res.json({
                'Error': false,
                'NextTask': NextTask
            });
        });
    });

    router.get('/skipDispute/:taskInstanceID', function (req, res) {
        var trigger = new TaskTrigger();
        trigger.skipDispute(req.params.taskInstanceID);
    });
    //-----------------------------------------------------------------------------------------------------

    //Endpoint to return Semester Information
    router.get('/getOrganizationSemesters/:organizationID', function (req, res) {

        Semester.findAll({
            where: {
                OrganizationID: req.params.organizationID
            },
            order: [
                ['StartDate', 'DESC']
            ],
            attributes: ['SemesterID', 'Name', 'StartDate', 'EndDate', 'OrganizationID']
        }).then(function (rows) {
            res.json({
                'Error': false,
                'Message': 'Success',
                'Semesters': rows
            });
        }).catch(function (err) {
            console.log('/semester/email : ' + err.message);
            res.status(401).end();
        });


    });

    //-----------------------------------------------------------------------------------------------------

    // endpoint to return organization
    router.get('/organization/:organizationid', function (req, res) {

        Organization.find({
            where: {
                OrganizationID: req.params.organizationid
            },
            attributes: ['OrganizationID', 'Name']
        }).then(function (rows) {
            res.json({
                'Error': false,
                'Message': 'Success',
                'Organization': rows
            });
        }).catch(function (err) {
            console.log('/organization: ' + err.message);
            res.status(401).end();
        });


    });

    // endpoint to return section
    router.get('/section/:sectionid', function (req, res) {

        Section.find({
            where: {
                SectionID: req.params.sectionid
            },
            attributes: ['SectionID', 'Name', 'CourseID', 'SemesterID']
        }).then(function (rows) {
            res.json({
                'Error': false,
                'Message': 'Success',
                'Section': rows
            });
        }).catch(function (err) {
            console.log('/section: ' + err.message);
            res.status(401).end();
        });
    });

    router.get('/SectionsByUser/:userId', function (req, res) {

        SectionUser.findAll({
            where: {
                UserID: req.params.userId
            },
            attributes: ['SectionID'],
            include: [{
                model: Section,
                attributes: ['Name'],
                include: [{
                    model: Course,
                    attributes: ['CourseID', 'Name', 'Number']
                }, ]

            }]
        }).then(function (rows) {
            res.json({
                'Error': false,
                'Message': 'Success',
                'Sections': rows
            });
        }).catch(function (err) {
            console.log('/section: ' + err.message);
            res.status(401).end();
        });
    });


    //Endpoint assignments in Section
    router.get('/AssignmentsBySection/:SectionID', function (req, res) {
        AssignmentInstance.findAll({
            where: {
                SectionID: req.params.SectionID
            },
            attributes: ['AssignmentInstanceID'],
            include: [{
                model: Assignment,
                attributes: ['AssignmentID', 'Name', 'Type', 'DisplayName'],
                include: [{
                    model: Course,
                    attributes: ['CourseID', 'Name', 'Number']
                }]
            }]
        }).then(function (assignments) {
            res.json({
                'Error': false,
                'Message': 'Success',
                'Assignments': assignments

            });
        }

        );
    });
    //-----------------------------------------------------------------------------------------------------

    // endpoint to delete organization
    router.get('/organization/delete/:organizationid', function (req, res) {
        Organization.destroy({
            where: {
                OrganizationID: req.params.organizationid
            }
        }).then(function (rows) {
            console.log('Delete Organization Success');
            res.status(200).end();
        }).catch(function (err) {
            console.log('/organization/delete : ' + err.message);
            res.status(400).end();
        });
    });

    // endpoint to delete course
    router.get('/course/delete/:courseid', function (req, res) {
        Course.destroy({
            where: {
                CourseID: req.params.courseid
            }
        }).then(function (rows) {
            console.log('Delete Course Success');
            res.status(200).end();
        }).catch(function (err) {
            console.log('/course/delete : ' + err.message);
            res.status(400).end();
        });
    });

    // endpoint to delete semester
    router.get('/semester/delete/:semesterid', function (req, res) {
        Semester.destroy({
            where: {
                SemesterID: req.params.semesterid
            }
        }).then(function (rows) {
            console.log('Delete Semester Success');
            res.status(200).end();
        }).catch(function (err) {
            console.log('/semester/delete : ' + err.message);
            res.status(400).end();
        });
    });

    // endpoint to delete secction
    router.get('/section/delete/:sectionid', function (req, res) {
        Section.destroy({
            where: {
                SectionID: req.params.sectionid
            }
        }).then(function (rows) {
            console.log('Delete Section Success');
            res.status(200).end();
        }).catch(function (err) {
            console.log('/section/delete : ' + err.message);
            res.status(400).end();
        });
    });

    //-----------------------------------------------------------------------------------------------------

    //Endpoint to update an organization
    router.post('/organization/update/:organizationid', function (req, res) {
        if (req.body.Name == null) {
            console.log('organization/update : Name cannot be null');
            res.status(400).end();
            return;
        }

        Organization.update({
            Name: req.body.Name
        }, {
            where: {
                OrganizationID: req.params.organizationid
            }
        }).then(function (result) {
            Organization.find({
                where: {
                    OrganizationID: req.body.organizationid
                }
            }).then(function (organizationUpdated) {
                res.json({
                    'Error': false,
                    'Message': 'Success',
                    'result': result,
                    'OrganizationUpdated': organizationUpdated
                });
            });
        }).catch(function (err) {
            console.log('/organization/update : ' + err);
            res.status(401).end();
        });


    });


    //Endpoint to update a course
    router.post('/course/update/:courseid', function (req, res) {
        if (req.body.Number == null) {
            console.log('course/update : Number cannot be null');
            res.status(400).end();
            return;
        }
        if (req.body.Name == null) {
            console.log('course/update : Name cannot be null');
            res.status(400).end();
            return;
        }

        Course.update({
            Name: req.body.Name,
            Number: req.body.Number
        }, {
            where: {
                CourseID: req.params.courseid
            }
        }).then(function (result) {
            Course.find({
                where: {
                    CourseID: req.body.courseid
                }
            }).then(function (courseUpdated) {
                res.json({
                    'Error': false,
                    'Message': 'Success',
                    'result': result,
                    'CourseUpdated': courseUpdated
                });
            });
        }).catch(function (err) {
            console.log('/course/update : ' + err);
            res.status(401).end();
        });


    });

    //Endpoint to update a semester
    router.post('/semester/update/:semesterid', function (req, res) {
        if (req.body.Name == null) {
            console.log('semester/update : Name cannot be null');
            res.status(400).end();
            return;
        }
        if (req.body.Start == null) {
            console.log('semester/update : Start cannot be null');
            res.status(400).end();
            return;
        }
        if (req.body.End == null) {
            console.log('semester/update : End cannot be null');
            res.status(400).end();
            return;
        }

        Semester.update({
            Name: req.body.Name,
            StartDate: req.body.Start,
            EndDate: req.body.End
        }, {
            where: {
                SemesterID: req.params.semesterid
            }
        }).then(function (result) {
            Semester.find({
                where: {
                    SemesterID: req.body.semesterid
                }
            }).then(function (courseUpdated) {
                res.json({
                    'Error': false,
                    'Message': 'Success',
                    'result': result,
                    'CourseUpdated': courseUpdated
                });
            });
        }).catch(function (err) {
            console.log('/semester/update : ' + err);
            res.status(401).end();
        });
    });


    // get users in section by role
    router.get('/sectionUsers/:sectionid/:role', function (req, res) {
        SectionUser.findAll({
            where: {
                SectionID: req.params.sectionid,
                Role: req.params.role
            },
            include: [{
                model: User,
                attributes: ['FirstName', 'LastName'],
                include: [{
                    model: VolunteerPool
                }]
            },
            {
                model: UserLogin,
                attributes: ['Email']
            }
            ],
            order: [
                [User, 'LastName'],
                [User, 'FirstName'],
                [UserLogin, 'Email']
            ],
            attributes: ['UserID', 'Active', 'Volunteer', 'Role']
        }).then(function (SectionUsers) {
            console.log('/sectionUsers called');
            SectionUsers = SectionUsers.map(user => {
                let newUser = user;
                newUser.Volunteer = user.User.VolunteerPools.length != 0;
                return newUser;
            });
            return res.json({
                'Error': false,
                'SectionUsers': SectionUsers
            });
        });
    });

    //End point to add mutliple users to a section and invite any new ones
    router.post('/sectionUsers/addMany/:sectionid', function (req, res) {
        //expects - users
        return sequelize.query('SET FOREIGN_KEY_CHECKS = 0')
            .then(function () {
                Promise.mapSeries(req.body.users, (userDetails) => {
                    return UserLogin.find({
                        where: {
                            Email: userDetails.email
                        },
                        attributes: ['UserID']
                    }).then(function (response) {
                        if (response == null || response.UserID == null) {
                            return sequelize.transaction(function (t) {
                                return User.create({
                                    FirstName: userDetails.firstName,
                                    LastName: userDetails.lastName,
                                    Instructor: userDetails.role === 'Instructor'
                                }, {
                                    transaction: t
                                }).then(async function (user) {
                                    let temp_pass = await password.generate();
                                    return UserContact.create({
                                        UserID: user.UserID,
                                        FirstName: userDetails.firstName,
                                        LastName: userDetails.lastName,
                                        Email: userDetails.email,
                                        Phone: '(XXX) XXX-XXXX'
                                    }, {
                                        transaction: t
                                    }).then(async function (userCon) {
                                        return UserLogin.create({
                                            UserID: user.UserID,
                                            Email: userDetails.email,
                                            Password: await password.hash(temp_pass)
                                        }, {
                                            transaction: t
                                        }).then(function (userLogin) {

                                            return SectionUser.create({
                                                SectionID: req.params.sectionid,
                                                UserID: userLogin.UserID,
                                                Active: userDetails.active,
                                                Volunteer: userDetails.volunteer,
                                                Role: userDetails.role
                                            }, {
                                                transaction: t
                                            }).then(function (sectionUser) {
                                                console.log('Creating user, inviting, and adding to section');
                                                logger.log('info', 'post: sectionUsers/:sectionid, user invited to system', {
                                                    req_body: userDetails
                                                });

                                                let email = new Email();
                                                email.sendNow(user.UserID, 'invite user', temp_pass);

                                                return sectionUser;

                                            });
                                        });
                                    });
                                });
                            })
                                    .catch((err) => {
                                        console.log(err);
                                        logger.log('err', '/sectionUsers/:Sectionid', 'user invitation failed', {
                                            body: userDetails,
                                            err: err

                                        });
                                    });

                        } else {
                            SectionUser.find({
                                where: {
                                    SectionID: req.params.sectionid,
                                    UserID: response.UserID
                                },
                                attributes: ['UserID']
                            }).then(function (sectionUser) {
                                if (sectionUser == null || sectionUser.UserID == null) {
                                    SectionUser.create({
                                        SectionID: req.params.sectionid,
                                        UserID: response.UserID,
                                        Active: userDetails.active,
                                        Volunteer: userDetails.volunteer,
                                        Role: userDetails.role

                                    }).then(function (result) {
                                        console.log('User exists, adding to section');
                                        logger.log('info', '/sectionUsers/addMany', 'added existing user successfully', {
                                            result: result
                                        });
                                        return result;
                                    });
                                } else {
                                    console.log('User already in section');
                                    logger.log('info', '/sectionUsers/addMany', 'user already in system', {
                                        result: sectionUser
                                    });
                                    return sectionUser;
                                }
                            });
                        }
                    });
                })
                    .then((results) => {
                        console.log(results);
                        return sequelize.query('SET FOREIGN_KEY_CHECKS = 1')
                            .then(() => {
                                return res.status(200).end();
                            });
                    }).catch(function (err) {
                        console.error(err);
                        logger.log('error', 'post: sectionUsers/:sectionid, user invited to system', {
                            req_body: req.body,
                            error: err
                        });
                        return sequelize.query('SET FOREIGN_KEY_CHECKS = 1')
                            .then(() => {
                                res.status(500).end();
                            });
                    });
            });
    });

    // endpoint to add sectionusers, invite users not yet in system
    router.post('/sectionUsers/:sectionid', async function (req, res) {

        //expects -email
        //        -firstName
        //        -lastName
        //        -email
        //        -sectionid
        //        -email
        //        -active
        //        -body
        //        -role

        UserLogin.find({
            where: {
                Email: req.body.email
            },
            attributes: ['UserID']
        }).then(function (response) {
            if (response == null || response.UserID == null) {
                sequelize.query('SET FOREIGN_KEY_CHECKS = 0')
                    .then(function () {
                        return sequelize.transaction(function (t) {
                            return User.create({
                                FirstName: req.body.firstName,
                                LastName: req.body.lastName,
                                Instructor: req.body.role === 'Instructor'
                            }, {
                                transaction: t
                            })
                                .catch(function (err) {
                                    console.error(err);
                                    logger.log('error', 'post: sectionUsers/:sectionid, user invited to system', {
                                        req_body: req.body,
                                        error: err
                                    });
                                    sequelize.query('SET FOREIGN_KEY_CHECKS = 1')
                                        .then(function () {
                                            res.status(500).end();
                                        });
                                })
                                .then(async function (user) {
                                    console.log(user.UserID);
                                    let temp_pass = await password.generate();
                                    return UserContact.create({
                                        UserID: user.UserID,
                                        FirstName: req.body.firstName,
                                        LastName: req.body.lastName,
                                        Email: req.body.email,
                                        Phone: '(XXX) XXX-XXXX'
                                    }, {
                                        transaction: t
                                    }).catch(function (err) {
                                        console.error(err);
                                        logger.log('error', 'post: sectionUsers/:sectionid, user invited to system', {
                                            req_body: req.body,
                                            error: err
                                        });
                                        sequelize.query('SET FOREIGN_KEY_CHECKS = 1')
                                                .then(function () {
                                                    res.status(500).end();
                                                });
                                    })
                                        .then(async function (userCon) {
                                            return UserLogin.create({
                                                UserID: user.UserID,
                                                Email: req.body.email,
                                                Password: await password.hash(temp_pass)
                                            }, {
                                                transaction: t
                                            }).catch(function (err) {
                                                console.error(err);
                                                logger.log('error', 'post: sectionUsers/:sectionid, user invited to system', {
                                                    req_body: req.body,
                                                    error: err
                                                });
                                                sequelize.query('SET FOREIGN_KEY_CHECKS = 1')
                                                    .then(function () {
                                                        res.status(500).end();
                                                    });
                                            }).then(function (userLogin) {
                                                let email = new Email();
                                                email.sendNow(user.UserID, 'invite user', temp_pass);
                                                return SectionUser.create({
                                                    SectionID: req.params.sectionid,
                                                    UserID: userLogin.UserID,
                                                    Active: req.body.active,
                                                    Volunteer: req.body.volunteer,
                                                    Role: req.body.role
                                                }, {
                                                    transaction: t
                                                }).catch(function (err) {
                                                    console.error(err);
                                                    logger.log('error', 'post: sectionUsers/:sectionid, user invited to system', {
                                                        req_body: req.body,
                                                        error: err
                                                    });
                                                    sequelize.query('SET FOREIGN_KEY_CHECKS = 1')
                                                        .then(function () {
                                                            res.status(500).end();
                                                        });
                                                }).then(function (sectionUser) {
                                                    console.log('Creating user, inviting, and adding to section');
                                                    logger.log('info', 'post: sectionUsers/:sectionid, user invited to system', {
                                                        req_body: req.body
                                                    });
                                                    return sequelize.query('SET FOREIGN_KEY_CHECKS = 1', {
                                                        transaction: t
                                                    })
                                                        .then(function () {
                                                            res.json({
                                                                success: true,
                                                                message: 'new user'
                                                            });

                                                        });
                                                });
                                            });
                                        });
                                });
                        });
                    });

            } else {
                SectionUser.find({
                    where: {
                        SectionID: req.params.sectionid,
                        UserID: response.UserID
                    },
                    attributes: ['UserID']
                }).then(function (sectionUser) {
                    if (sectionUser == null || sectionUser.UserID == null) {
                        SectionUser.create({
                            SectionID: req.params.sectionid,
                            UserID: response.UserID,
                            Active: req.body.active,
                            Volunteer: req.body.volunteer,
                            Role: req.body.role
                        }).catch(function (err) {
                            console.log(err);
                            res.status(500).end();
                        }).then(function (result) {
                            console.log('User exists, adding to section');
                            res.json({
                                success: true,
                                message: 'existing user'
                            });
                        });
                    } else {
                        console.log('User already in section');
                        res.json({
                            success: false,
                            error: 'already in section'
                        });
                    }
                });
            }
        });
    });


    router.delete('/delete/user/:userID', (req, res) => {
        console.log('deleting user', req.params.userID);

        return sequelize.transaction(function (t) {
            return UserLogin.destroy({
                where: {
                    UserID: req.params.userID
                }
            }, {
                transaction: t
            })
                    .then((loginRowsDeleted) => {
                        return UserContact.destroy({
                            where: {
                                UserID: req.params.userID
                            }
                        }, {
                            transaction: t
                        })
                            .then((contactRowsDeleted) => {
                                return SectionUser.destroy({
                                    where: {
                                        UserID: req.params.userID
                                    }
                                }, {
                                    transaction: t
                                })
                                    .then((sectionUsersDeleted) => {
                                        return User.destroy({
                                            where: {
                                                UserID: req.params.userID
                                            }
                                        }, {
                                            transaction: t
                                        });
                                    });
                            });

                    });
        })
            .then((result) => {
                logger.log('info', 'post: /delete/user, user deleted from system', {
                    req_params: req.params,
                });
                res.status(200).end();
            })
            .catch((err) => {
                logger.log('error', 'post: /delete/user, user deleted from system', {
                    error: err,
                    req_params: req.params,
                });
                console.error(err);
                res.status(500).end();
            });



    });



    // endpoint to insert or update a user's contact information

    router.post('/userContact', function (req, res) {
        if (req.body.UserID == null) {
            console.log('userContact: UserID cannot be null');
            res.status(400).end();
            return;
        }
        sequelize.options.omitNull = false;
        let whitespace = /^\s*$/;
        for (let key in req.body) {
            if (req.body.hasOwnProperty(key)) {
                if (whitespace.test(req.body[key])) {
                    req.body[key] = null;
                }
            }
        }
        UserContact.upsert(
            req.body, {
                where: {
                    UserID: req.body.UserID
                }
            }
        ).then(function (result) {
            sequelize.options.omitNull = true;
            res.json({
                success: true
            });
        }).catch(function (err) {
            sequelize.options.omitNull = true;
            console.log('/userContact: ' + err);
            res.status(401).end();
        });
    });

    router.get('/EveryonesWork/:assignmentInstanceID', async function (req, res) {
        var everyones_work = {};
        var ai = await AssignmentInstance.find({
            where: {
                AssignmentInstanceID: req.params.assignmentInstanceID
            }
        });
        await Promise.map(JSON.parse(ai.WorkflowCollection), async function (wi) {
            var wi = await WorkflowInstance.find({
                where: {
                    assignmentInstanceID: req.params.assignmentInstanceID
                }
            });
            await Promise.map(JSON.parse(wi.TaskCollection), async function (ti) {
                var ti = await TaskInstance.findAll({
                    where: {
                        Status: {
                            $like: '%"complete"%'
                        }
                    }
                });
                for (var i = 0; i < ti.length; i++) {
                    if (!everyones_work.hasOwnProperty(ti[i].UserID)) {
                        everyones_work[ti[i].UserID] = [ti[i].TaskInstanceID];
                    } else {
                        everyones_work[ti[i].UserID].push(ti[i].TaskInstanceID);
                        everyones_work[ti[i].UserID] = everyones_work[ti[i].UserID].filter(function (item, index, inputArray) {
                            return inputArray.indexOf(item) == index;

                        });
                    }
                }
            });
        });
        res.json({
            'Error': false,
            'Message': 'Success',
            'EveryonesWork': everyones_work
        });
    });


    router.post('/revise', async function (req, res) {
        var trigger = new TaskTrigger();
        console.log('revise');
        await trigger.revise(req.body.ti_id, req.body.data);
        res.status(200).end();

    });

    router.post('/approved', async function (req, res) {
        var trigger = new TaskTrigger();

        await trigger.approved(req.body.ti_id, req.body.data);
        res.status(200).end();
    });

    router.get('/getWorkflow/:ti_id', async function (req, res) {
        var ti = await TaskInstance.find({
            where: {
                TaskInstanceID: req.params.ti_id
            },
            include: [{
                model: WorkflowInstance,
                attributes: ['TaskCollection'],
                include: [{
                    model: WorkflowActivity,
                    attributes: ['WorkflowStructure']
                }]
            }]
        });

        var json = {};

        await Promise.mapSeries(JSON.parse(ti.WorkflowInstance.TaskCollection), async function (ti_id) {
            var new_ti = await TaskInstance.find({
                where: {
                    TaskInstanceID: ti_id
                },
                include: [TaskActivity]
            });
            json[ti_id] = new_ti;
        });


        res.json({
            'Error': false,
            'Message': 'Success',
            'Workflow': json,
            'WorkflowTree': ti.WorkflowInstance.WorkflowActivity.WorkflowStructure
        });
    });
    //-----------------------------------------------------------------------------------------------------


    //Endpoint for workflow reports

    router.get('/getWorkflowReport/:workflowInstanceID', (req, res) => {
        let fetchTask = (taskInstanceID) => {
            return new Promise(function (resolve, reject) {
                TaskInstance.findOne({
                    where: {
                        TaskInstanceID: taskInstanceID
                    },
                    attributes: ['TaskInstanceID', 'WorkflowInstanceID', 'Status', 'NextTask', 'IsSubWorkflow', 'UserHistory'],
                    include: [{
                        model: TaskActivity,
                        attributes: ['Name', 'Type', 'TaskActivityID', 'NumberParticipants']
                    },
                    {
                        model: WorkflowInstance,
                        attributes: ['WorkflowInstanceID', 'WorkflowActivityID'],
                        include: {
                            model: WorkflowActivity,
                            attributes: ['WorkflowStructure']
                        }
                    },
                    {
                        model: User,
                        attributes: ['UserID', 'FirstName', 'LastName'],
                        include: [{
                            model: UserContact,
                            attributes: ['Email', 'Alias']
                        }]
                    }
                    ]
                })
                    .catch(err => reject(err))
                    .then(task => resolve(task));
            });
        };

        let fetchTasks = (tasksArray) => {
            return tasksArray.map((individualTask) => {
                return fetchTask(individualTask);
            });
        };

        WorkflowInstance.find({
            where: {
                WorkflowInstanceID: req.params.workflowInstanceID
            }
        })
            .then(async(result) => {
                let mappedTasks = JSON.parse(result.TaskCollection);

                let finalResults = mappedTasks.map(fetchTasks);

                Promise.all(finalResults.map(Promise.all)).then(arrArr => {
                    return res.json({
                        'Result': arrArr
                    });
                });

            });
    });


    //------------------------------------
    router.get('/getWorkflowReport/alternate/:workflowInstanceID', async(req, res) => {
        let workflowInstanceObject = {};

        let fetchTask = (taskInstanceID) => {
            return new Promise(function (resolve, reject) {
                TaskInstance.findOne({
                    where: {
                        TaskInstanceID: taskInstanceID
                    },
                    attributes: ['TaskInstanceID', 'WorkflowInstanceID', 'Status', 'NextTask', 'IsSubWorkflow', 'UserHistory'],
                    include: [{
                        model: TaskActivity,
                        attributes: ['Name', 'Type', 'TaskActivityID', 'NumberParticipants']
                    },
                    {
                        model: WorkflowInstance,
                        attributes: ['WorkflowInstanceID', 'WorkflowActivityID'],
                        include: {
                            model: WorkflowActivity,
                            attributes: ['WorkflowStructure']
                        }
                    },
                    {
                        model: User,
                        attributes: ['UserID', 'FirstName', 'LastName'],
                        include: [{
                            model: UserContact,
                            attributes: ['Email', 'Alias']
                        }]
                    }
                    ]
                })
                    .catch(err => reject(err))
                    .then(tiData => {
                        if (workflowInstanceObject[tiData.TaskActivity.TaskActivityID]) {
                            workflowInstanceObject[tiData.TaskActivity.TaskActivityID].push(tiData);
                        } else {
                            workflowInstanceObject[tiData.TaskActivity.TaskActivityID] = [tiData];
                        }
                        resolve(tiData);
                    });
            });
        };


        let fetchTasks = (tasksArray) => {
            return tasksArray.map((individualTask) => {
                return fetchTask(individualTask);
            });
        };

        //key: taskActivityID
        //value: array of resolved tasks
        WorkflowInstance.find({
            where: {
                WorkflowInstanceID: req.params.workflowInstanceID
            }
        })
            .then(async(result) => {
                let mappedTasks = JSON.parse(result.TaskCollection);

                let finalResults = mappedTasks.map(fetchTasks);

                Promise.all(finalResults.map(Promise.all)).then(arrArr => {
                    return res.json({
                        'Result': workflowInstanceObject
                    });
                });

            });
    });


    //---------------------------------------------------------------------------
    //---------------------------------------------------------------------------

    // Endpoint to get assignment instance report
    router.get('/getAssignmentReport/:assignmentInstanceID', function (req, res) {
        let fetchTask = (taskInstanceID) => {
            return new Promise(function (resolve, reject) {
                TaskInstance.findOne({
                    where: {
                        TaskInstanceID: taskInstanceID
                    },
                    attributes: ['TaskInstanceID', 'WorkflowInstanceID', 'Status', 'NextTask', 'IsSubWorkflow', 'UserHistory'],
                    include: [{
                        model: TaskActivity,
                        attributes: ['Name', 'Type', 'TaskActivityID', 'NumberParticipants']
                    },
                    {
                        model: WorkflowInstance,
                        attributes: ['WorkflowInstanceID', 'WorkflowActivityID'],
                        include: {
                            model: WorkflowActivity,
                            attributes: ['WorkflowStructure']
                        }
                    },
                    {
                        model: User,
                        attributes: ['UserID', 'FirstName', 'LastName'],
                        include: [{
                            model: UserContact,
                            attributes: ['Email', 'Alias']
                        }]
                    }
                    ]
                })
                    .catch(err => reject(err))
                    .then(task => resolve(task));
            });
        };

        let fetchTasks = (tasksArray) => {
            return tasksArray.map((individualTask) => {
                return fetchTask(individualTask);
            });
        };

        let fetchWorkflow = (workflowArray) => {
            return workflowArray.map((workflow) => {
                return WorkflowInstance.find({
                    where: {
                        WorkflowInstanceID: workflow
                    }
                })
                    .then((result) => {
                        let mappedTasks = JSON.parse(result.TaskCollection);
                        return mappedTasks.map(fetchTask);
                    });
            });
        };


        AssignmentInstance.findOne({
            where: {
                AssignmentInstanceID: req.params.assignmentInstanceID
            }
        }).then((aiResult) => {
            let workflowsList = JSON.parse(aiResult.WorkflowCollection);
            let finalResults = fetchWorkflow(workflowsList);

            Promise.all(finalResults.map(Promise.all, Promise)).then(arrArr => {
                return res.json({
                    'Result': arrArr
                });
            });
        });



    });
    //-------------------------------------------------------------------------

    router.get('/getAssignmentReport/alternate/:assignmentInstanceID', (req, res) => {
        let assignmentObject = {};

        let fetchTask = (taskInstanceID) => {
            return new Promise(function (resolve, reject) {
                TaskInstance.findOne({
                    where: {
                        TaskInstanceID: taskInstanceID
                    },
                    attributes: ['TaskInstanceID', 'WorkflowInstanceID', 'Status', 'NextTask', 'IsSubWorkflow', 'UserHistory'],
                    include: [{
                        model: TaskActivity,
                        attributes: ['Name', 'DisplayName', 'Type', 'TaskActivityID', 'NumberParticipants']
                    },
                    {
                        model: WorkflowInstance,
                        attributes: ['WorkflowInstanceID', 'WorkflowActivityID']
                    },
                    {
                        model: User,
                        attributes: ['UserID', 'FirstName', 'LastName'],
                        include: [{
                            model: UserContact,
                            attributes: ['Email', 'Alias']
                        }]
                    }
                    ]
                })
                    .catch(err => reject(err))
                    .then(tiData => {
                        const waID = tiData.WorkflowInstance.WorkflowActivityID;
                        const wiID = tiData.WorkflowInstance.WorkflowInstanceID;
                        const taID = tiData.TaskActivity.TaskActivityID;

                        if (!assignmentObject[waID].WorkflowInstances[wiID]) {
                            assignmentObject[waID].WorkflowInstances[wiID] = {};
                        }

                        if (assignmentObject[waID].WorkflowInstances[wiID][taID]) {
                            assignmentObject[waID].WorkflowInstances[wiID][taID].push(tiData);
                        } else {
                            assignmentObject[waID].WorkflowInstances[wiID][taID] = [tiData];
                        }
                        resolve(tiData);
                    });
            });
        };

        // let fetchTasks = (tasksArray) => {
        //     return tasksArray.map((individualTask) => {
        //         return fetchTask(individualTask);
        //     });
        // };

        let fetchWorkflow = (workflowArray) => {
            return workflowArray.map((workflow) => {
                return WorkflowInstance.find({
                    where: {
                        WorkflowInstanceID: workflow
                    },
                    include: [WorkflowActivity]
                })
                    .then((result) => {
                        assignmentObject[result.WorkflowActivity.WorkflowActivityID] = {
                            WorkflowInstances: {},
                            Structure: result.WorkflowActivity.WorkflowStructure
                        };

                        let mappedTasks = JSON.parse(result.TaskCollection);
                        return mappedTasks.map(fetchTask);
                    })
                    .catch(err => {
                        console.log(err);
                    });
            });
        };


        AssignmentInstance.findOne({
            where: {
                AssignmentInstanceID: req.params.assignmentInstanceID
            }
        }).then(async(aiResult) => {
            let workflowsList = JSON.parse(aiResult.WorkflowCollection);
            let finalResults = fetchWorkflow(workflowsList);
            Promise.all(finalResults.map(Promise.all, Promise)).then(arrArr => {
                return res.json({
                    'Result': assignmentObject
                });
            }).catch(err => {
                console.log(err);
            });
        });


    });

};

module.exports = REST_ROUTER;