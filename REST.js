var mysql = require("mysql");
var dateFormat = require('dateformat');
var Guid = require('guid');
var models = require('./Model');
var Promise = require('bluebird');
var password = require('./password');
var moment = require('moment');

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
var AssignmentInstance = models.AssignmentInstance;
var Organization = models.Organization;

var WorkflowInstance = models.WorkflowInstance;
var WorkflowActivity = models.WorkflowActivity;
var ResetPasswordRequest = models.ResetPasswordRequest;
var EmailNotification = models.EmailNotification;

var AssignmentGrade = models.AssignmentGrade
var WorkflowGrade = models.WorkflowGrade
var TaskGrade = models.TaskGrade
var TaskSimpleGrade = models.TaskSimpleGrade
var PartialAssignments = models.PartialAssignments;
var contentDisposition = require('content-disposition')
var FileReference = models.FileReference

var VolunteerPool = models.VolunteerPool

var Manager = require('./WorkFlow/Manager.js');
var Allocator = require('./WorkFlow/Allocator.js');
var TaskFactory = require('./WorkFlow/TaskFactory.js');
var sequelize = require("./Model/index.js").sequelize;
var Email = require('./WorkFlow/Email.js');
var Util = require('./WorkFlow/Util.js');
var FlatToNested = require('flat-to-nested');
var fs = require('fs')

const multer = require('multer')
var storage = multer({dest: './files/'})
const logger = require('winston')

logger.configure({
    transports: [
        new (logger.transports.Console)({
            level: 'debug',
            colorize: true,
            json: true,
        }),
        new (logger.transports.File)({
            name: 'info-file',
            filename: 'logs/filelog-info.log',
            level: 'info',
        }),
        new (logger.transports.File)({
            name: 'error-file',
            filename: 'logs/filelog-error.log',
            level: 'error',
        })
    ]
})

//-----------------------------------------------------------------------------------------------------


function REST_ROUTER(router) {
    var self = this;
    self.handleRoutes(router);
}

//-----------------------------------------------------------------------------------------------------

REST_ROUTER.prototype.handleRoutes = function(router) {

    //Endpoint to Create an Assignment
    router.post("/assignment/create", function(req, res) {

        //
        // console.log('assignment: ', req.body.assignment);
        // allocator.createAssignment(req.body.assignment).then(function(done) {
        //     if (done === false) {
        //         res.status(400).end();
        //     } else {
        //         res.status(200).end();
        //     }
        // });

        if (req.body.partialAssignmentId !== null) {
            PartialAssignments.find({
                where: {
                    PartialAssignmentID: req.body.partialAssignmentId,
                    UserID: req.body.userId,
                    CourseID: req.body.courseId
                }
            }).then((result) => {
                result.destroy();
            }).catch((err) => {
                console.error(err);
            });
        }

        var taskFactory = new TaskFactory();
        console.log('assignment: ', req.body.assignment);
        taskFactory.createAssignment(req.body.assignment).then(function(done) {
            if (done) {
                res.status(200).end();
            } else {
                res.status(400).end();
            }
        });

    });

    //Endpoint to save partially made assignments from ASA to database
    router.post('/assignment/save/', function(req, res) {
        if (req.body.partialAssignmentId == null) {
            PartialAssignments.create({
                PartialAssignmentName: req.body.assignment.AA_name,
                UserID: req.body.userId,
                CourseID: req.body.courseId,
                Data: req.body.assignment
            }).then((result) => {
                res.json({
                    "Error": false,
                    "PartialAssignmentID": result.PartialAssignmentID
                })
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
                console.log("PartialAssignmentID:", result.PartialAssignmentID)
                res.json({
                    "Error": false,
                    "PartialAssignmentID": req.body.partialAssignmentId
                })
            }).catch((result) => {
                console.error(result);
                res.status(400).end();
            });
        }
    });

    //Endpoint to load the names and IDs partial assignments by User and/or CourseID
    router.get('/partialAssignments/all/:userId', function(req, res) {
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
                "Error": false,
                "PartialAssignments": result
            });
        }).catch((result) => {
            console.error(result);
            res.status(400).end();
        });

    });

    //Endpoint to get the data from a partial assignment for the assignment editor
    router.get('/partialAssignments/byId/:partialAssignmentId', function(req, res) {
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
                "Error": false,
                "PartialAssignment": result
            });
        }).catch(result => {
            console.log(result);
            res.status(400).end();
        })
    });

    //Endpoint to get an assignment associate with courseId
    router.get('/getAssignments/:courseId', function(req, res) {

        console.log('Finding assignments...');

        Assignment.findAll({

            where: {
                CourseID: req.params.courseId
            },
            attributes: ['AssignmentID', 'Name', 'DisplayName', 'Type', 'Documentation', 'CourseID']

        }).then(function(result) {

            console.log('Assignments have been found!');

            res.json({
                "Error": false,
                "Assignments": result
            });

        }).catch(function(err) {

            console.log('/getCompletedTaskInstances: ' + err);
            res.status(404).end();

        });
    });


    //Endpoint to get a user's active assignment instances by the section
    router.get('/getActiveAssignmentsForSection/:sectionId', function(req, res) {
        console.log(`Finding Assignments for Section ${req.params.sectionId}`);
        AssignmentInstance.findAll({
            where: {
                SectionID: req.params.sectionId
            },
            attributes: ["AssignmentInstanceID", "StartDate", "EndDate"],
            include: [{
                model: Assignment,
                attributes: ['DisplayName']
            }]
        }).then(function(result) {
            console.log('Assignments have been found!');
            res.json({
                "Error": false,
                "Assignments": result
            });
        }).catch(function(err) {
            console.log('/getActiveAssignmentsForSection/' + req.params.sectionId + ": " + err);
            res.status(404).end();
        });
    });

    //Endpoint to get a user's active assignment instances by the course
    router.get('/getActiveAssignments/:courseId', function(req, res) {
        console.log('Finding assignments...');
        Assignment.findAll({
            where: {
                CourseID: req.params.courseId
            },
            attributes: ['AssignmentID', 'DisplayName', 'Type'],
            include: [{
                model: AssignmentInstance,
                as: 'AssignmentInstances',
                attributes: ["AssignmentInstanceID", "StartDate", "EndDate", "SectionID"]

            }]
        }).then(function(result) {
            console.log('Assignments have been found!');
            res.json({
                "Error": false,
                "Assignments": result
            });
        }).catch(function(err) {
            console.log('/getActiveAssignments/' + req.params.courseId + ": " + err);
            res.status(404).end();
        });
    });


    //-----------------------------------------------------------------------------------------------------

    //Endpoint to allocate students
    router.get("/allocate", function(req, res) {

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
        Promise.all([allocator.getUser(1)]).then(function(done) {
            console.log(done[0]);
        }).then(function() {
            Promise.all([allocator.getUser(2)]).then(function(done) {
                console.log(done[0]);
            }).then(function() {
                Promise.all([allocator.getUser(3)]).then(function(done) {
                    console.log(done[0]);
                }).then(function() {
                    Promise.all([allocator.getUser(4)]).then(function(done) {
                        console.log(done[0]);
                    }).then(function() {
                        Promise.all([allocator.getUser(5)]).then(function(done) {
                            console.log(done[0]);
                        }).then(function() {
                            Promise.all([allocator.getUser(6)]).then(function(done) {
                                console.log(done[0]);
                            }).then(function() {
                                Promise.all([allocator.getUser(7)]).then(function(done) {
                                    console.log(done[0]);
                                }).then(function() {
                                    Promise.all([allocator.getUser(8)]).then(function(done) {
                                        console.log(done[0]);
                                    }).then(function() {
                                        Promise.all([allocator.getUser(5)]).then(function(done) {
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

    router.get("/findPreviousTasks/:taskInstanceId", function(req, res) {
        var allocator = new TaskFactory();

        allocator.findPreviousTasks(req.params.taskInstanceId, new Array()).then(function(done) {
            console.log('done!', done);
            previousTasks = done.sort();

            res.json({
                "previousTasks": previousTasks
            })

        }).catch(function(err) {
            console.log(err);
            res.status(401).end();
        });
    });

    router.get("/sendEmailNotification/:taskInstanceId", function(req, res) {
        var email = new Email();


        //email.sendNow(req.body.opts);
        var opts = {
          from: "njitplamaster@gmail.com",
          replyTo: "njitplamaster@gmail.com",
          to: "qxl2@njit.edu",
          subject: "Test",
          html: "Test"
        };

        email.send(opts);


    });



    //-----------------------------------------------------------------------------------------------------

    //Endpoint for Assignment Manager
    router.get('/debug', function (req, res) {
        // winston.level = 'debug'
        logger.log('error', 'both', {someKey: 'some-value'})
        logger.log('warn', 'only info')
        logger.log('warn', 'only info', ([1, 2, {
            k: 'v'
        },
            ['hi'],
            function (test) {
                console.log(test)
            }
        ]).toString())

        // var manager = new Manager()
        // manager.debug()
        var a = new Allocator()
        /*TaskInstance.findAll({
         where: {
         $or: [{
         Status: "started"
         }, {
         Status: "late_reallocated"
         }]
         },
         }).then(function (tasks) {
         var users = []
         Promise.map(tasks, function (task, i) {
         users.push(i)
         }).then(function (done) {
         a.reallocAll(tasks, users)
         })
         })
        AssignmentGrade.create({
            AssignmentInstanceID: 3,
            SectionUserID: 2,
            Grade: 59,
        }).then(function () {
            console.log('1 done')
            AssignmentGrade.create({
                AssignmentInstanceID: 3,
                SectionUserID: 1,
                Grade: 65,
            }).then(function () {
                console.log('2 done')
            })
        })
        WorkflowGrade.create({
            WorkflowActivityID: 1,
            AssignmentInstanceID: 3,
            SectionUserID: 2,
            Grade: 95,
        }).then(function () {
            console.log('11 done')
            WorkflowGrade.create({
                WorkflowActivityID: 2,
                AssignmentInstanceID: 3,
                SectionUserID: 1,
                Grade: 55,
            }).then(function () {
                console.log('22 done')
            })
        })
        TaskGrade.create({
            WorkflowActivityID: 1,
            TaskInstanceID: 3,
            SectionUserID: 2,
            Grade: 100,
        }).then(function () {
            console.log('111 done')
            TaskGrade.create({
                WorkflowActivityID: 2,
                TaskInstanceID: 4,
                SectionUserID: 1,
                Grade: 75,
            }).then(function () {
                console.log('222 done')
            })
        })
        TaskSimpleGrade.create({
            WorkflowActivityID: 1,
            TaskInstanceID: 3,
            SectionUserID: 2,
            Grade: 10,
        }).then(function () {
            console.log('111 done')
            TaskSimpleGrade.create({
                WorkflowActivityID: 2,
                TaskInstanceID: 4,
                SectionUserID: 1,
                Grade: 100,
            }).then(function () {
                console.log('222 done')
            })
        })
        new Util().addFile(4, {Stats: 'stats....'}).then(function (done) {
            console.log('file done: ', done)
        })*/
        a.reallocate_ais(1, [3, 5, 8, 11, 1])
        res.status(200).end()
    })

    // router.post('/upload/files/:userId', storage.array('files'), function (req, res) {
    router.post('/upload/files', storage.array('files'), function (req, res) {
        logger.log('info', 'post: /upload/files, files uploaded to file system', {
            req_body: req.body,
            req_params: req.params,
            // req_files: req.files,
        })
        if (req.body.userId == null) {
            logger.log('info', 'userId is required but not specified')
            return res.status(400).end()
            // req.body.userId = 2
        }
        return new Util().addFileRefs(req.files, req.body.userId).then(function (file_refs) {

          return Promise.all(file_refs.map(function (it) {
              return it.FileID
          })).then(function (file_ids) {
              logger.log('info', 'new task file ids', file_ids)

              TaskInstance.find({where: {TaskInstanceID: req.body.taskInstanceId}}).then(ti => {
                let newFilesArray = JSON.parse(ti.Files) || [];
                newFilesArray = newFilesArray.concat(file_ids);

                return TaskInstance.update({Files: newFilesArray}, {where: {TaskInstanceID: req.body.taskInstanceId}}).then(done => {
                    logger.log('info', 'task updated with new files', {res: done})
                    res.json(file_refs).end()
                    return done
                })
              });

          })

        })
    })

    // router.post('/upload/profile-picture/:userId', multer({dest: './uploads/'}).single('profilePicture'), function(req, res) {
    router.post('/upload/profile-picture', storage.array('files'), function (req, res) {
        // router.post('/upload/profile-picture/:userId', storage.array('files'), function (req, res) {
        logger.log('info', 'post: /upload/profile-picture, profile pictures uploaded to file system', {
            req_body: req.body,
            req_params: req.params,
            // req_files: req.files,
        })
        if (req.body.userId == null) {
            logger.log('info', 'userId is required but not specified')
            return res.status(400).end()
            // req.body.userId = 2
        }
        return new Util().addFileRefs(req.files, req.body.userId).then(function (file_refs) {
            return Promise.all(file_refs.map(function (it) {
                return it.FileID
            })).then(function (file_ids) {
                logger.log('info', 'new profile picture file ids', file_ids)

                return User.update({ProfilePicture: file_ids}, {where: {UserID: req.body.userId}}).then(function (done) {
                    logger.log('info', 'user updated with new profile pictures info', {res: done})
                    res.json(file_refs).end()
                    return done
                })
            })
        })
    })

    router.get('/download/file/:fileId', function (req, res) {
        // router.post('/download/file/:fileId', function (req, res) {
        // router.get('/download/file', function (req, res) {
        logger.log('info', 'post: /download/file', {req_body: req.body, req_params: req.params})
        var file_id = req.body.fileId || req.params.fileId

        if (file_id == null) {
            logger.log('info', 'file_id is required but not specified')
            return res.status(400).end()
        }
        return FileReference.find({where: {FileID: file_id}}).then(function (file_ref) {
            if (!file_ref) {
                logger.log('error', 'file reference not found', {file_id: file_id})
                return res.status(400).end()
            }
            logger.log('info', 'file reference', file_ref.toJSON())
            file_ref.Info = JSON.parse(file_ref.Info)
            let contDisp = file_ref.Info.mimetype.match('image') ? 'inline' : contentDisposition(file_ref.Info.originalname);
            var content_headers = {
                'Content-Type': file_ref.Info.mimetype,
                'Content-Length': file_ref.Info.size,
                'Content-Disposition' : contDisp,
            }
            logger.log('debug', 'response content file headers', content_headers)
            res.writeHead(200, content_headers)
            logger.log('info', 'Sending file to client')
            fs.createReadStream(file_ref.Info.path).pipe(res)
        })
    })
    //--------------------Start Volunteer Pool APIs---------------------------------------------------------------------------------


       //Endpoint to return VolunteerPool list of Volunteers
      router.get("/VolunteerPool/", function(req, res) {

          VolunteerPool.findAll({
              attributes: ['UserID', 'SectionID', 'AssignmentInstanceID']
          }).then(function(rows) {
              res.json({
                  "Error": false,
                  "Message": "Success",
                  "Volunteers": rows
              });
          }).catch(function(err) {
              console.log("/VolunteerPool/ " + err.message);
              res.status(401).end();
          });


      });

      //Endpoint to return count total of Volunteers
          router.get("/VolunteerPool/countOfUsers", function(req, res) {
          console.log("VolunteerPool/count was called");
          VolunteerPool.findAll({
          }).then(function(rows) {
              res.json({
                  "Error_": false,
                  "Message": "Success",
                  "Number of Volunteers": rows.length
              });
          }).catch(function(err) {
              console.log("/VolunteerPool/ " + err.message);
              res.status(401).end();
          });


      });
      //Endpoint assignments in Section
  router.get("/AssignmentsBySection/:SectionID", function(req,res){
    AssignmentInstance.findAll({
      where:{
        SectionID: req.params.SectionID
      },
      attributes: ['AssignmentInstanceID'],
      include:[{
        model: Assignment,
        attributes: ['AssignmentID','Name','Type', 'DisplayName'],
        include: [{
          model:Course,
          attributes: ['CourseID','Name','Number']
          }]
      }]
    }).then(function(assignments){
      res.json({
        "Error": false,
        "Message": "Success",
        "Assignments": assignments

      })
    }

    );
  })


      //Endpoint sections by user
  router.get("/SectionsByUser/:UserID", function(req,res){
    SectionUser.findAll({
      where:{
        UserID: req.params.UserID,
      //  UserRole: "Instructor"
      },
      include:[{
        model: Section,
        include: [{model:Course}]
      }]
    }).then(function(section){
      res.json({
        "Error": false,
        "Message": "Success",
        "Sections": section

      })
    }

    );
  })


      //Endpoint to return list of volunteers in a section
     router.get("/VolunteerPool/VolunteersInSection/:SectionID", function(req, res) {
          console.log("/VolunteerPool/VolunteersInSection was called");

        var detailArray =[];

        VolunteerPool.findAll({
            where: {
                SectionID: req.params.SectionID
            },
            attributes:['UserID','AssignmentInstanceID', 'status']

          }).then(function(rows) {
              res.json({
                  "Error": false,
                  "Message": "Success",
                  "Volunteers": rows
              });

      }).catch(function(err) {
          console.log("/VolunteerPool/ " + err.message);
          res.status(401).end();
        });


      });


      //Endpoint to return VolunteerPool Information for the student

   	router.get("/VolunteerPool/UserInPool/:UserID", function(req, res) {
           console.log("/VolunteerPool/:UserID was called");
           VolunteerPool.findAll({
               where: {
                   UserID: req.params.UserID
               },
               attributes: ['UserID', 'SectionID', 'AssignmentInstanceID'],
               include: [{
                   model: User,
                   attributes: ['UserID', "UserType", 'UserName']
               }, {
                   model: AssignmentInstance,
                   attributes: ['AssignmentID']
               },
               {
                   model: Section
               }]
           }).then(function(rows) {
               res.json({
                   "Error": false,
                   "Message": "Success",
                   "Volunteers": rows
              });
           }).catch(function(err) {
               console.log("/VolunteerPool/ " + err.message);
               res.status(401).end();
           });


       });





      //Endpoint to remove from VolunteerPool
      router.delete("/VolunteerPool/deleteVolunteer", function(req, res) {

          VolunteerPool.destroy({
              where: {
                  UserID: 12, //req.body.userID,
                  AssignmentInstanceID: 12,//req.body.AssignmentInstanceID
              }
          }).then(function(rows) {
              console.log("Delete User Success");
              res.status(200).end();
          }).catch(function(err) {
              console.log("/course/deleteuser : " + err.message);

              res.status(400).end();
          });


      });


      //Endpoint to add a user to a course
      router.post("/VolunteerPool/add", function(req, res) {
          console.log("/VolunteerPool/add : was called");

          if (req.body.UserID === null || req.body.SectionID === null || req.body.AssignmentInstanceID === null) {
              console.log("/VolunteerPool/add : Missing attributes");
              res.status(400).end();
          }

          console.log("got to create part");
          //console.log("UserID: " + req.params.UserID);
          VolunteerPool.create({
              UserID: req.body.UserID,
              SectionID: req.body.SectionID,
              AssignmentInstanceID: req.body.AssignmentInstanceID
          }).then(function(result){
            res.status(200).end();
          }).catch(function(err) {
                      console.log(err);
                      res.status(400).end();
                  });
  //             });
         // });
      })

      //-----------------------------------End Volunteer Pool API's--------------------------------------------------------------


    //Endpoint for Assignment Manager
    router.post("/getAssignmentGrades/:ai_id", function (req, res) {

        if (req.params.ai_id == null) {
            console.log("/getAssignmentGrades/:ai_id : assignmentInstanceID cannot be null")
            res.status(400).end()
            return
        }

        return AssignmentInstance.find({
            where: {AssignmentInstanceID: req.params.ai_id},
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
                    },],
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
                })
            }
            var json = {
                Error: false,
                AssignmentInstance: response,
                SectionUsers: [],
            }
            return response.Section.getSectionUsers().then(function (sectionUsers) {
                if (!sectionUsers) return

                // json.SectionUsers = sectionUsers
                return Promise.map(sectionUsers, function (sectionUser) {
                    console.log('ww')
                    var su = sectionUser.toJSON()
                    json.SectionUsers.push(su)

                    User.find({
                        where: {
                            UserID: sectionUser.UserID
                        }
                    }).then(function (user) {
                        if (!user) return

                        console.log('ww22')
                        var u = user.toJSON()
                        su.User = u
                    })
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
                        if (!assignmentGrade) return

                        console.log('ww11')
                        var ag = assignmentGrade.toJSON()
                        su.assignmentGrade = ag
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
                            },],
                        }).then(function (workflowGrades) {
                            if (!workflowGrades) return

                            console.log('ww1.5')
                            ag.WorkflowActivityGrades = []

                            return Promise.map(workflowGrades, function (workflowGrade) {
                                if (!workflowGrade) return

                                console.log('ww11.5', workflowGrade)
                                var wg = workflowGrade.toJSON()
                                ag.WorkflowActivityGrades.push(wg)
                                if (!wg.WorkflowActivity) return

                                return TaskGrade.findAll({
                                    where: {
                                        SectionUserID: sectionUser.SectionUserID,
                                        WorkflowActivityID: workflowGrade.WorkflowActivityID,
                                    },
                                    include: [{
                                        model: TaskInstance,
                                        include: [{
                                            model: TaskActivity,
                                        },],
                                    },],
                                }).then(function (taskGrades) {
                                    if (!taskGrades) return

                                    console.log('ww1.75')
                                    wg.WorkflowActivity.users_WA_Tasks = []

                                    return Promise.map(taskGrades, function (taskGrade) {
                                        if (!taskGrade) return

                                        var tg = taskGrade.toJSON()
                                        tg.taskGrade = taskGrade
                                        tg.taskActivity = taskGrade.TaskInstance.TaskActivity
                                        wg.WorkflowActivity.users_WA_Tasks.push(tg)

                                        return TaskSimpleGrade.find({
                                            where: {
                                                SectionUserID: sectionUser.SectionUserID,
                                                TaskInstanceID: taskGrade.TaskInstanceID
                                            },
                                        }).then(function (taskSimpleGrade) {
                                            if (!taskSimpleGrade) return

                                            tg.taskSimpleGrade = taskSimpleGrade
                                        })
                                    })
                                })
                            })
                        })
                    })
                }).then(function () {
                    console.log('then', 'json')
                    res.json(json)
                })
            })
        })
    })

    //Endpoint for Assignment Manager
    router.get("/manager", function(req, res) {

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

    router.get("/manager/checkAssignments", function(req, res) {

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
    router.get("/ModelTest/:userID", function(req, res) {


        WorkflowInstance.findById(req.params.userID).then(function(WorkflowInstance) {
            console.log("WorkflowInstance Found");

            WorkflowInstance.getWorkflowActivity().then(function(workflowActivity) {
                console.log("WorkflowActivity Found " + workflowActivity.Name);
            });

            WorkflowInstance.getAssignment().then(function(assignment) {
                console.log("Assignment Found : " + assignment.Name);
            });
        });

        WorkflowActivity.findById(req.params.userID).then(function(workflowActivity) {
            console.log("WorkflowActivity Found " + workflowActivity.Name);

            workflowActivity.getWorkflowInstances().then(function(workflows) {
                console.log("workflows Found ");
            });

        });

        Assignment.findById(req.params.userID).then(function(assignment) {
            console.log("Assignment Found : " + assignment.Name);

            assignment.getWorkflowInstances().then(function(workflows) {
                console.log("workflows Found ");
            });

        });

        TaskInstance.findById(req.params.userID).then(function(taskInstance) {
            console.log("Semester name : " + taskInstance.TaskInstanceID);

            taskInstance.getUser().then(function(User) {
                console.log("TaskInstance User Name " + User.FirstName);
            });
            taskInstance.getTaskActivity().then(function(TaskActivity) {
                console.log("TaskActivity Name " + TaskActivity.Name);
            });

        });

        TaskActivity.findById(2).then(function(TaskActivity) {
            console.log("TaskActivity name : " + TaskActivity.Name);

            TaskActivity.getTaskInstances().then(function(TaskInstances) {
                console.log("Found");
            });

        });

        Semester.findById(req.params.userID).then(function(Semester) {
            console.log("Semester name : " + Semester.Name);

            Semester.getSections().then(function(Sections) {
                console.log("Found");
            });

        });

        Section.findById(req.params.userID).then(function(Section) {
            console.log("Section name : " + Section.Name);

            Section.getSemester().then(function(Semester) {
                console.log("Semester Name : " + Semester.Name);
                //res.status(200).end();
            });

            Section.getCourse().then(function(Course) {
                console.log("Course Name : " + Course.Name);
                //res.status(200).end();
            });
            Section.getSectionUsers().then(function(Users) {
                console.log("Found");
                //res.status(200).end();
            });

        });

        UserLogin.findById(req.params.userID).then(function(user) {
            console.log("User Email : " + user.Email);

        });

        Course.findById(req.params.userID).then(function(course) {
            console.log("User Course : " + course.Name);

            course.getUser().then(function(Creator) {
                console.log("Creator Name : " + Creator.FirstName);
                //res.status(200).end();
            });

            course.getSections().then(function(sections) {
                console.log('Sections Found');
            });
        });
        //Course.find
        User.findById(req.params.userID).then(function(user) {
            console.log("User name : " + user.FirstName);
            var UserLog = user.getUserLogin().then(function(USerLogin) {
                console.log("User Email : " + USerLogin.Email);

            });
            user.getUserContact().then(function(USerLogin) {
                console.log("User Email : " + USerLogin.Email);
                res.status(200).end();
            });
            //console.Log("Email " + UserLog.Email);
        });
    });

    //-----------------------------------------------------------------------------------------------------

    //Endpoint for Login Function
    router.post("/login", function(req, res) {
        if (req.body.emailaddress == null || req.body.password == null) {
            console.log('/login : Invalid Credentials');
            res.status(401).end();
            return;
        }
        UserLogin.find({
            where: {
                Email: req.body.emailaddress
            },
            attributes: ['UserID', 'Status', 'Password']
        }).then(async function(user) {
            if (user != null && await password.verify(user.Password, req.body.password)) {
                res.json({
                    "Error": false,
                    "Message": "Success",
                    "UserID": user.UserID,
                    "Status": user.Status
                });
            } else {
                console.log('/login : Invalid Credentials');
                res.status(401).end()
            }
        });
    });
    //-----------------------------------------------------------------------------------------------------

    //Endpoint to update a User's Email
    router.put("/update/email", function(req, res) {
        if (req.body.password == null || req.body.email == null || req.body.userid == null) {
            console.log("/update/email : Bad Input");
            res.status(400).end();
        }

        UserLogin.find({
            where: {
                UserID: req.body.userid
            }
        }).then(async function(user) {
            if (user != null && await password.verify(user.Password, req.body.password)) {
                user.Email = req.body.email;
                user.save().then(function(used) {
                    res.status(200).end();
                }).catch(function(err) {
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
    router.put("/update/name", function(req, res) {
        User.find({
            where: {
                UserID: req.body.userid
            }
        }).then(function(user) {
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
                user.save().then(function(used) {
                    res.json({
                        "FirstName": user.FirstName,
                        "LastName": user.LastName
                    });
                }).catch(function(err) {
                    console.log('/update/name : ' + err);
                    res.status(401).end();
                });
            }
        });
    });

    //-----------------------------------------------------------------------------------------------------

    //Endpoint to return general user data
    router.get("/generalUser/:userid", function(req, res) {
        User.findAll({
            where: {
                UserID: req.params.userid
            },
            attributes: ['FirstName', 'LastName', 'UserType', 'Admin', 'Country', 'City', 'ProfilePicture'],
            include: [{
                model: UserLogin,
                attributes: ['Email']
            }]
        }).then(function(user) {
            res.json({
                "Error": false,
                "Message": "Success",
                "User": user
            });
        }).catch(function(err) {
            console.log("/generalUser : " + err.message);
            res.status(401).end();
        });

    });

    //-----------------------------------------------------------------------------------------------------

    //Endpoint to create a semester
    // JV - contructing the /createSemester where it allows user to create a non existance. return false when new semester already exist
    router.post("/createSemester", function(req, res) {
        var startDate = dateFormat(req.body.start_sem, "yyyy-mm-dd");
        var endDate = dateFormat(req.body.end_sem, "yyyy-mm-dd");
        console.log(req.body.start_sem + " " + req.body.end_sem);
        if (req.body.end_sem == null || req.body.start_sem == null) {
            console.log("/createSemester : Dates must be defined");
            res.status(400).end();
        } else if (startDate > endDate) {
            console.log("/createSemester : StartDate cannot be grater than EndDate");
            res.status(400).end();
        } else {
            Semester.find({
                where: {
                    OrganizationID: req.body.organizationID,
                    Name: req.body.semesterName //new
                },
                attributes: ['SemesterID']
            }).then(function(response) {
                if (response == null || response.SemesterID == null) {
                    Semester.create({
                        OrganizationID: req.body.organizationID, //organization ID
                        Name: req.body.semesterName,
                        StartDate: req.body.start_sem,
                        EndDate: req.body.end_sem
                    }).catch(function(err) {
                        console.log(err);
                    }).then(function(result) {
                        res.json({
                            "newsemester": result,
                            "sem_feedback": true
                        });
                    });

                } else {
                    console.log("Semester Name and Organization Exist");
                    res.json({
                        "newsemester": null,
                        "sem_feedback": false
                    });
                }
            });
        }
    });

    //-----------------------------------------------------------------------------------------------------

    //Endpoint to return Semester Information
    router.get("/semester/:semesterid", function(req, res) {

        Semester.find({
            where: {
                SemesterID: req.params.semesterid
            },
            attributes: ['SemesterID', 'Name', 'StartDate', 'EndDate', 'OrganizationID']
        }).then(function(rows) {
            res.json({
                "Error": false,
                "Message": "Success",
                "Semester": rows
            });
        }).catch(function(err) {
            console.log("/semester/email : " + err.message);
            res.status(401).end();
        });


    });

    //-----------------------------------------------------------------------------------------------------

    //Endpoint to get All Semester Information
    router.get("/semester", function(req, res) {

        Semester.findAll({}).then(function(rows) {
            res.json({
                "Error": false,
                "Message": "Success",
                "Semesters": rows
            });
        }).catch(function(err) {
            console.log("/semester: " + err.message);
            res.status(401).end();
        });
    });

    //-----------------------------------------------------------------------------------------------------

    //Endpoint to create course
    router.post("/course/create", function(req, res) {
        console.log("/course/create: called");
        if (req.body.userid == null) {
            console.log("/course/create : UserID cannot be null");
            res.status(400).end();
            return;
        }
        if (req.body.Name == null) {
            console.log("/course/create : Name cannot be null");
            res.status(400).end();
            return;
        }
        if (req.body.number == null) {
            console.log("/course/create : Number cannot be null");
            res.status(400).end();
            return;
        }
        if (req.body.organizationid == null) {
            console.log("/course/create : OrganizationID cannot be null");
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
        }).then(function(response) {
            if (response == null || response.CourseID == null) {
                Course.create({
                    CreatorID: req.body.userid,
                    Number: req.body.number,
                    Name: req.body.Name,
                    OrganizationID: req.body.organizationid,
                    Abbreviations: req.body.course_abb,
                    Description: req.body.course_description
                }).catch(function(err) {
                    console.log(err);
                }).then(function(result) {
                    res.json({
                        "NewCourse": result,
                        "Message": true
                    });

                });
            } else {
                res.json({
                    "Message": false
                });
            }
        });
    });

    //-----------------------------------------------------------------------------------------------------

    //End point to create section for course
    router.post("/course/createsection", function(req, res) {


        if (req.body.semesterid == null) {
            console.log("course/createsection : SemesterID cannot be null");
            res.status(400).end();
            return;
        }
        if (req.body.courseid == null) {
            console.log("course/createsection : CourseID cannot be null");
            res.status(400).end();
            return;
        }
        if (req.body.name == null) {
            console.log("course/createsection : Name cannot be null");
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
        }).then(function(results) {
            var section = Section.build({
                SemesterID: req.body.semesterid,
                CourseID: req.body.courseid,
                OrganizationID: req.body.organizationid, //new
                StartDate: results.StartDate,
                EndDate: results.EndDate,
                Name: req.body.name,
                Description: req.body.description

            }).save().then(function(response) {
                res.json({
                    "result": response
                });
            }).catch(function(err) {
                console.log("/course/createsection : " + err.message);

                res.status(401).end();
            });
        });

    });

    //-----------------------------------------------------------------------------------------------------

    //Endpoint to add a user to a course
    router.post("/user/create", function(req, res) {
        var email = new Email();

        if (req.body.email === null || req.body.phone === null || req.body.passwd === null || req.body.phone === null || req.body.userName === null || req.body.firstName === null || req.body.lastName === null) {
            console.log("/user/create : Missing attributes");
            res.status(400).end();
        }

        UserContact.create({
            Email: req.body.email,
            Phone: req.body.phone
        }).then(function(userContact) {
            sequelize.query('SET FOREIGN_KEY_CHECKS = 0');
            User.create({
                UserContactID: userContact.UserContactID,
                UserName: req.body.userName,
                FirstName: req.body.firstName,
                MiddleInitial: req.body.middleInitial,
                LastName: req.body.lastName,
                Suffix: req.body.suffix,
                OrganizationGroup: req.body.organization,
                UserType: 'Student',
                Admin: 0
            }).then(async function(user) {
                UserLogin.create({
                    UserID: user.UserID,
                    Email: req.body.email,
                    Password: await password.hash(req.body.passwd)
                }).then(function(userLogin) {
                    console.log("/user/create: New user added to the system");
                    sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
                    //email.sendNow(user.UserID, 'create user');
                    res.status(200).end();
                }).catch(function(err) {
                    console.log(err);
                    res.status(400).end();
                });
            });
        });
    });

    router.put("/update/password", function(req, res) {
        if (req.body.userId === null || req.body.oldPasswd === null || req.body.newPasswd === null) {
            console.log("/update/password : Missing attributes");
            res.status(400).end();
        } else if (req.body.oldPasswd == req.body.newPasswd) {
            console.log("/update/password : Same password");
            res.status(400).end();
        } else {
            UserLogin.find({
                where: {
                    UserID: req.body.userId
                }
            }).then(async function(userLogin) {
                if (await password.verify(userLogin.Password, req.body.oldPasswd)) {
                    console.log("/user/create : Password matched");
                    UserLogin.update({
                        Password: await password.hash(req.body.newPasswd)
                    }, {
                        where: {
                            UserID: req.body.userId
                        }
                    }).then(function(done) {
                        console.log("/update/password: Password updated successfully");
                        //email.sendNow(user.UserID, 'new password');
                        res.status(200).end();
                    }).catch(function(err) {
                        console.log(err);
                        res.status(400).end();
                    });

                } else {
                    console.log("/update/password: Password not match");
                    res.status(401).end();
                }
            });
        }

    });

    // adding the user, called on add user page
    router.post("/adduser", function(req, res) {
        console.log("/adduser:called");
        var email = new Email();
        if (req.body.email === null) {
            console.log("/adduser : Email cannot be null");
            res.status(400).end();
        }
        var user_role = "";
        var useradmin = 0;
        if (req.body.role == 'Admin') {
            console.log("/adduser: User is an admin");
            user_role = "Instructor";
            useradmin = 1;
        } else if (req.body.role == 'Instructor') {
            user_role = "Instructor";
        } else user_role = "Student";

        UserLogin.find({
            where: {
                Email: req.body.email
            },
            attributes: ['UserID']
        }).then(function(userLogin) {
            if (userLogin == null || userLogin.UserID == null) {
                UserContact.create({
                    Email: req.body.email,
                    Phone: 'XXX-XXX-XXXX'
                }).catch(function(err) {
                    console.log(err);
                }).then(function(userCon) {
                    sequelize.query('SET FOREIGN_KEY_CHECKS = 0')
                        .then(function() {
                            sequelize.sync({});
                            User.create({
                                FirstName: req.body.firstname,
                                LastName: req.body.lastname,
                                OrganizationGroup: {
                                    "OrganizationID": []
                                },
                                UserContactID: userCon.UserContactID,
                                UserType: user_role,
                                Admin: useradmin,
                                Country: '',
                                City: ''
                            }).catch(function(err) {
                                console.log(err);
                            }).then(async function(user) {
                                UserLogin.create({
                                    UserID: user.UserID,
                                    Email: req.body.email,
                                    Password: await password.hash(req.body.password),
                                    Status: '1'
                                }).catch(function(err) {
                                    console.log(err);
                                }).then(function(userLogin) {
                                    email.sendNow(userLogin.UserID, 'create user', req.body.password);
                                    res.json({
                                        "Message": "User has succesfully added"
                                    });
                                });
                            });
                        });
                });
            } else {
                res.json({
                    "Message": "User is currently exist"
                });
            }
        })
    });

    router.post("/course/adduser", function(req, res) {
        //console.log("role "+req.body.role);
        var email = new Email();
        if (req.body.email === null) {
            console.log("course/adduser : Email cannot be null");
            res.status(400).end();
        }
        if (req.body.courseid === null) {
            console.log("course/adduser : CourseID cannot be null");
            res.status(400).end();
        }
        if (req.body.sectionid === null) {
            console.log("course/adduser : SectionID cannot be null");
            res.status(400).end();
        }

        UserLogin.find({
            where: {
                Email: req.body.email
            },
            attributes: ['UserID']
        }).then(function(userLogin) {
            if (userLogin == null || userLogin.UserID == null) {
                UserContact.create({
                    Email: req.body.email,
                    Phone: 'XXX-XXX-XXXX'
                }).catch(function(err) {
                    console.log(err);
                }).then(function(userCon) {
                    sequelize.query('SET FOREIGN_KEY_CHECKS = 0')
                        .then(function() {
                            sequelize.sync({});
                            console.log(userCon.UserContactID);
                            User.create({
                                FirstName: 'Temp',
                                LastName: 'Temp',
                                OrganizationGroup: {
                                    "OrganizationID": []
                                },
                                UserContactID: userCon.UserContactID,
                                UserType: req.body.role,
                                Admin: 0,
                                Country: 'United Stated',
                                City: 'Temp'
                            }).catch(function(err) {
                                console.log(err);
                            }).then(async function(user) {
                                UserLogin.create({
                                    UserID: user.UserID,
                                    Email: req.body.email,
                                    Password: await password.hash("pass123")
                                }).catch(function(err) {
                                    console.log(err);
                                }).then(function(userLogin) {
                                    //Email User With Password
                                    email.sendNow(userLogin.UserID, 'create user', req.body.password);
                                    SectionUser.create({
                                        SectionID: req.body.sectionid,
                                        UserID: userLogin.UserID,
                                        UserRole: req.body.role,
                                        UserStatus: 'Active'
                                    }).catch(function(err) {
                                        console.log(err);
                                    }).then(function(sectionUser) {
                                        res.status(200).end();
                                        return sequelize.query('SET FOREIGN_KEY_CHECKS = 1')

                                    });
                                });
                            });
                        });
                });
            } else {
                SectionUser.create({
                    SectionID: req.body.sectionid,
                    UserID: userLogin.UserID,
                    UserRole: req.body.role,
                    UserStatus: 'Active'
                }).catch(function(err) {
                    console.log(err);
                }).then(function(sectionUser) {
                    res.json({
                        "UserID": sectionUser.UserID,
                        "Message": "Success"
                    });
                })
            }
        })
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
    //                                     UserRole: 'Student',
    //                                     UserStatus: 'Active'
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
    //                 UserRole: 'Student',
    //                 UserStatus: 'Active'
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

    //Endpoint to find all courses
    router.get("/course/:courseId", function(req, res) {
        Course.find({
            where: {
                CourseID: req.params.courseId
            },
            attributes: ["CourseID", "Number", "Name", "Description"]
        }).then(function(result) {
            Section.findAll({
                where: {
                    CourseID: req.params.courseId
                }
            }).then(function(sections) {
                res.json({
                    "Error": false,
                    "Message": "Success",
                    "Course": result,
                    "Sections": sections
                });
            });

        }).catch(function(err) {
            console.log("/course : " + err.message);
            res.status(400).end();
        })

    });

    //-----------------------------------------------------------------------------------------------------

    //Need to translate getsectionUsers function
    router.get("/course/getsection/:sectionId", function(req, res) {

        Section.find({
            where: {
                SectionID: req.params.sectionId
            },
            attributes: ["Name", "Description"]
        }).then(function(rows) {
            SectionUser.findAll({
                where: {
                    SectionID: req.params.sectionId
                },
                attributes: ['UserID', 'UserRole', 'UserStatus'],
                include: {
                    model: User,
                    attributes: ['UserName', 'FirstName', 'LastName', 'MiddleInitial']
                }
            }).then(function(users) {
                res.json({
                    "result": rows,
                    "UserSection": users
                });
            })
        }).catch(function(err) {
            console.log("/course : " + err.message);
            res.status(400).end();
        })
    });

    //-----------------------------------------------------------------------------------------------------
    router.get("/getCourseSections/:courseID", function(req, res) {

        Section.findAll({
            where: {
                CourseID: req.params.courseID,
                SemesterID: req.query.semesterID
            },
            attributes: ["SectionID", "Name", "Description"]
        }).then(function(sections) {
            res.json({
                "Sections": sections
            });
        })
    });

    //-----------------------------------------------------------------------------------------------------

    //Endpoint to update a course
    router.put("/course/update", function(req, res) {

        if (req.body.Name == null) {
            console.log("course/create : Name cannot be null");
            res.status(400).end();
            return;
        }
        if (req.body.courseid == null) {
            console.log("course/create : CourseID cannot be null");
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
        }).then(function(result) {
            Course.find({
                where: {
                    CourseID: req.body.courseid
                }
            }).then(function(courseUpdated) {
                res.json({
                    "Error": false,
                    "Message": "Success",
                    "result": result,
                    "CourseUpdated": courseUpdated
                });
            });
        }).catch(function(err) {
            console.log('/course/update : ' + err);
            res.status(401).end();
        });


    });

    //-----------------------------------------------------------------------------------------------------

    //Endpoint to update a section
    router.put("/course/updatesection", function(req, res) {

        if (req.body.semesterid == null) {
            console.log("course/updatesection : SemesterID cannot be null");
            res.status(400).end();
            return;
        }
        if (req.body.courseid == null) {
            console.log("course/updatesection : CourseID cannot be null");
            res.status(400).end();
            return;
        }
        if (req.body.description == null) {
            console.log("course/updatesection : Description cannot be null");
            res.status(400).end();
            return;
        }

        if (req.body.sectionid == null) {
            console.log("course/updatesection : sectionid cannot be null");
            res.status(400).end();
            return;
        }

        if (req.body.name == null) {
            console.log("course/updatesection : name cannot be null");
            res.status(400).end();
            return;
        }

        Section.update({
            Name: req.body.name,
            Description: req.body.description
        }, {
            where: {
                SectionID: req.body.sectionid,
                CourseID: req.body.courseid,
                SemesterID: req.body.semesterid
            }
        }).then(function(result) {
            Section.find({
                where: {
                    SectionID: req.body.sectionid,
                    CourseID: req.body.courseid,
                    SemesterID: req.body.semesterid
                }
            }).then(function(sectionUpdated) {
                res.json({
                    "Error": false,
                    "Message": "Success",
                    "result": result,
                    "CourseUpdated": sectionUpdated
                });
            }).catch(function(err) {
                console.log('/course/update : ' + err);
                res.status(401).end();
            });
        })

    });

    //-----------------------------------------------------------------------------------------------------

    //Endpoint to delete user
    router.delete("/course/deleteuser", function(req, res) {

        SectionUser.destroy({
            where: {
                UserID: req.body.userID,
                SectionID: req.body.SectionID
            }
        }).then(function(rows) {
            console.log("Delete User Success");
            res.status(200).end();
        }).catch(function(err) {
            console.log("/course/deleteuser : " + err.message);

            res.status(400).end();
        });


    });

    //-----------------------------------------------------------------------------------------------------

    //Endpoint to get a user's courses
    router.get("/course/getCourses/:userid", function(req, res) {

        SectionUser.findAll({
            where: {
                UserID: req.params.userid
            },
            attributes: ['SectionUserID', 'SectionID', 'UserROle', 'UserStatus'],
            include: [{
                model: Section,
                required: true,
                attributes: ['CourseID']
            }]
        }).then(function(rows) {
            if (rows.length > 0) {
                res.json({
                    "Error": false,
                    "Message": "Success",
                    "Result": rows
                });
            } else {
                res.json({
                    "Error": true,
                    "Message": "User Has No Courses"
                });
            }
        }).catch(function(err) {
            res.status(401).end();
        });
    });

    //-----------------------------------------------------------------------------------------------------

    //Endpoint to get start a password reset request
    router.post("/resetPassword", function(req, res) {
        if (req.body.email == null) {
            console.log("/resetPassword : Email not sent");
            req.status(401).end();
            return;
        }
        var guid = Guid.create();
        //What is Guid?

        UserLogin.find({
            where: {
                Email: req.body.email
            }
        }).then(function(userlogin) {
            if (userlogin == null) {
                console.log("/resetPassword : Email does not exist");
                res.status(401).end();
            } else {
                User.find({
                    where: {
                        UserID: userlogin.UserID
                    }
                }).then(function(user) {
                    user.getResetPasswordRequest().then(function(PasswordRequest) {
                        Guid.isGuid(guid);
                        var value = guid.value;
                        if (PasswordRequest != null) {
                            ResetPasswordRequest.update({
                                RequestHash: value
                            }, {
                                where: {
                                    UserID: PasswordRequest.UserID
                                }
                            }).then(function() {
                                console.log("/resetPassword : Record updated ");
                                res.status(200).end();
                            });
                        } else {
                            var newRequest = ResetPasswordRequest.build({
                                UserID: user.UserID,
                                RequestHash: value
                            });
                            newRequest.save().then(function() {
                                console.log("/resetPassword : Record created ");
                                res.status(200).end();
                            }).catch(function(error) {
                                // Ooops, do some error-handling
                                console.log("/resetPassword : Error while inserting " + error.message);
                                res.status(401).end();
                            });

                        }
                    });
                });
            }
        });
    });

    //-----------------------------------------------------------------------------------------------------

    //still need fixing
    router.get("/getPasswordResetRequest", function(req, res) {
        /*var query = "select ?? from ?? where ??=?";
        var table = ["UserID", "ResetPasswordRequest", "RequestHash", req.query.PasswordHash];
        query = mysql.format(query, table);
        connection.query(query, function(err, result) {
            if (err) {
                console.log("/getPasswordResetRequest : " + err.message);
                res.status(404).end();
            } else {
                if (result.length > 0) {
                    console.log("/getPasswordResetRequest : Request found");
                    res.json({
                        "Error": false,
                        "Message": "Success",
                        "UserID": result
                    });
                } else {
                    console.log("/getPasswordReset : Request not found");
                    res.json({
                        "Error": true,
                        "Message": "Request Password not found"
                    });
                }
            }
        });*/

        ResetPasswordRequest.find({
            where: {
                RequestHash: req.query.PasswordHash
            },
            attributes: ["UserID"]
        }).then(function(result) {
            if (result.length > 0) {
                console.log("/getPasswordResetRequest : Request found");
                res.json({
                    "Error": false,
                    "Message": "Success",
                    "UserID": result
                });
            } else {
                console.log("/getPasswordReset : Request not found");
                res.json({
                    "Error": true,
                    "Message": "Request Password not found"
                });
            }
        }).catch(function(err) {
            console.log("/getPasswordResetRequest : " + err.message);
            res.status(404).end();
        });
    });

    //-----------------------------------------------------------------------------------------------------

    router.post("/password/reset", function(req, res) {
        if (req.body.HashRequest == null) {
            console.log("/resetPassword : HashRequest not sent");
            req.status(401).end();
        }
        if (req.body.newPassword == null) {
            console.log("/resetPassword : newPassword not sent");
            req.status(401).end();
        }
        User.find({
            where: {
                UserID: userlogin.UserID
            }
        }).then(function(user) {
            ResetPasswordRequest.find({
                where: {
                    RequestHash: req.body.HashRequest
                }
            }).then(async function(request) {
                if (request == null) {
                    console.log("/resetPassword : HashRequest does not exist");
                    res.status(401).end();
                } else {
                    UserLogin.update({
                        Password: await password.hash(req.body.newPassword)
                    }, {
                        where: {
                            UserID: request.UserID
                        }
                    }).then(function() {
                        request.destroy();
                        console.log("/resetPassword : Password updated");
                        res.status(200).end();
                    });
                }
            });
        });
    });

    //-----------------------------------------------------------------------------------------------------

    //Endpoint to Get Courses Created by an Instructor
    router.get("/getCourseCreated/:instructorID", function(req, res) {
        Course.findAll({
            where: {
                CreatorID: req.params.instructorID
            }
        }).then(function(Courses) {
            console.log("/getCourseCreated/ Courses found");
            res.json({
                "Error": false,
                "Courses": Courses
            });
        });
    });

    //Get all courses that the student has been enrolled in by their ID
    router.get("/getAllEnrolledCourses/:studentID", function(req, res) {
        SectionUser.findAll({
            where: {
                UserID: req.params.studentID
            },
            attributes: ['UserRole', 'UserStatus'],
            include: [{
                model: Section,
                attributes: ['Name'],
                include: [{
                    model: Course,
                    attributes: ['Number', 'Name', 'Abbreviations']
                }]
            }]
        }).then(function(Courses) {
            console.log(`/getEnrolledCourses/ Courses for ${req.params.studentID} found `);
            res.json({
                "Error": false,
                "Courses": Courses
            });
        });
    });

    //Get the courses that are currently active(eg. in current semester) for a student
    router.get("/getActiveEnrolledCourses/:studentID", function(req, res) {
        SectionUser.findAll({
            where: {
                UserID: req.params.studentID,
                UserStatus: "Active"
            },
            attributes: ['UserRole'],
            include: [{
                model: Section,
                attributes: ['Name'],
                include: [{
                    model: Course,
                    attributes: ['Number', 'Name', 'Abbreviations']
                }]
            }]
        }).then(function(Courses) {
            console.log(`/getEnrolledCourses/ Courses for ${req.params.studentID} found `);
            res.json({
                "Error": false,
                "Courses": Courses
            });
        });
    });

    //-----------------------------------------------------------------------------------------------------

    //Endpoint to Get Courses Created by an Instructor
    router.get("/getOrganizationCourses/:organizationID", function(req, res) {
        Course.findAll({
            where: {
                OrganizationID: req.params.organizationID
            }
        }).then(function(Courses) {
            console.log("/getOrganizationCourses/ Courses found");
            res.json({
                "Error": false,
                "Courses": Courses
            });
        });
    });

    //-----------------------------------------------------------------------------------------------------

    //Endpoint to make a user an admin
    router.put("/makeUserAdmin/", function(req, res) {

        User.findById(req.body.UserID).then(function(user) {
            if (user == null) {
                console.log("/makeUserAdmin/ User not found");
                res.status(401).end();
            } else {
                user.Admin = 1;
                user.save().then(function() {
                    console.log("/makeUserAdmin : User Updated ");
                    res.status(200).end();
                }).catch(function(error) {
                    // Ooops, do some error-handling
                    console.log("/makeUserAdmin : Error while inserting " + error.message);
                    res.status(401).end();
                });
            }
        });
    });

    //-----------------------------------------------------------------------------------------------------

    //Endpoint to make a user not an admin
    router.put("/makeUserNotAdmin/", function(req, res) {
        UserLogin.find({
            where: {
                UserID: req.body.UserID
            }
        }).then(async function(userLogin) {
            if (userLogin != null && await password.verify(userLogin.Password, req.body.password)) {
                User.findById(req.body.UserID).then(function(user) {
                    if (user == null) {
                        console.log("/makeUserNotAdmin/ User not found");
                        res.status(401).end();
                    } else {
                        user.Admin = 0;
                        user.save().then(function() {
                            console.log("/makeUserNotAdmin : User Updated ");
                            res.status(200).end();
                        }).catch(function(error) {
                            // Ooops, do some error-handling
                            console.log("/makeUserNoAdmin : Error while inserting " + error.message);
                            res.status(401).end();
                        });
                    }
                });
            } else {
                console.log("/makeUserNoAdmin : Authentication Failed");
                res.status(401).end();
            }
        });
    });

    //-----------------------------------------------------------------------------------------------------

    //Assign a New Instructor
    router.put("/instructor/new", function(req, res) {
        var email = req.body.email;
        UserLogin.find({
            where: {
                Email: email
            },
            attributes: ['UserID']
        }).then(function(userID) {
            if (userID == null) {
                console.log('Email Not Found - Making Instructor ' + email);
                UserContact.create({
                    Email: email,
                    Phone: 'XXX-XXX-XXXX'
                }).catch(function(err) {
                    console.log(err);
                }).then(function(userCon) {
                    User.create({
                        FirstName: 'Temp',
                        LastName: 'Temp',
                        OrganizationGroup: {
                            "OrganizationID": []
                        },
                        UserContactID: userCon.UserContactID,
                        UserType: 'Instructor',
                        Admin: 0,
                        Country: 'United Stated',
                        City: 'Newark'
                    }).catch(function(err) {
                        console.log(err);
                    }).then(async function(user) {
                        UserLogin.create({
                            UserID: user.UserID,
                            Email: email,
                            Password: await password.hash('pass123')
                        }).catch(function(err) {
                            console.log(err);
                        }).then(function(userLogin) {
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
                    attributes: ['UserType', 'UserID']
                }).then(function(makerID) {
                    if (makerID.UserType != 'Instructor') {
                        makerID.updateAttributes({
                            UserID: makerID.UserID,
                            UserType: 'Instructor'
                        }).success(function() {
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
    router.get("/instructor/all", function(req, res) {
        User.findAll({
            where: {
                UserType: 'Instructor'
            },
            attributes: ['UserID', 'FirstName', 'LastName', 'Admin']
        }).then(function(instructors) {
            console.log("/instructors called");
            res.json({
                "Instructors": instructors
            });
        });
    });

    router.get("/organization", function(req, res) {
        console.log("/organization: called");
        Organization.findAll({}).then(function(rows) {
            res.json({
                "Error": false,
                "Message": "Success",
                "Organization": rows
            });
        }).catch(function(err) {
            console.log("/organization: " + err.message);
            res.status(401).end();
        });
    });


    //creates organization
    router.post("/createorganization", function(req, res) {
        console.log("/createorganization")
        Organization.find({
            where: {
                UserID: req.body.userid,
                Name: req.body.organizationname //new
            },
            attributes: ['OrganizationID']
        }).then(function(response) {
            if (response == null || response.OrganizationID == null) {
                Organization.create({
                    UserID: req.body.userid,
                    Name: req.body.organizationname
                }).catch(function(err) {
                    console.log(err);
                }).then(function(result) {
                    res.json({
                        "neworganization": result,
                        "org_feedback": true
                    });
                });

            } else {
                console.log("User and Organization Exist")
                res.json({
                    "neworganization": null,
                    "org_feedback": false
                });
            }
        });
    });

    //-----------------------------------------------------------------------------------------------------

    //Get UserID from Email
    router.get("/getUserID/:email", function(req, res) {
        UserLogin.find({
            where: {
                Email: req.params.email
            }
        }).then(function(user) {
            res.json({
                "UserID": user.UserID
            });
        }).catch(function(e) {
            console.log("getUserID " + e);
            res.json({
                "UserID": -1
            });
        });
    });

    //-----------------------------------------------------------------------------------------------------

    //Endpoint to Get Pending Tasks
    router.get("/taskInstance/:userid", function(req, res) {
        TaskInstance.findAll({
            where: {
                UserID: req.params.userid
            }
        }).then(function(taskInstance) {
            res.json({
                "TaskInstances": taskInstance
            });
        }).catch(function(e) {
            console.log("/taskInstanceInstance/:userid " + e);
            res.json({
                "TaskInstances": -1
            });
        });
    });

    //-----------------------------------------------------------------------------------------------------
    //Endpoint to create an assignment instance based on assignment and section
    router.post("assignment/section", function(req, res) {

        AssignmentInstance.create({
            AssignmentID: req.body.assignmentid,
            SectionID: req.body.sectionid

        }).save().then(function() {

            console.log('/assignment/section success');
            res.status(200).end();

        }).catch(function(e) {
            console.log('/assignment/section ' + e);
            res.status(400).end();
        });
    });

    //---------------------------------------------------------------------------------------------------------------------------------------------

    //Endpoint to get task instance header data for front end
    router.get("/taskInstanceTemplate/main/:taskInstanceID", function(req, res) {
        logger.log('info', 'get: /taskInstanceTemplate/main/:taskInstanceID', {req_query: req.query})
        TaskInstance.find({
            where: {
                TaskInstanceID: req.params.taskInstanceID
            }
        }).then(function(taskInstanceResult) {
            TaskActivity.find({
                where: {
                    TaskActivityID: taskInstanceResult.TaskActivityID
                }
            }).then(function(taskActivityResult) {
                Course.find({
                    where: {
                        CourseID: req.query.courseID
                    }
                }).then(function(courseResult) {
                    Assignment.find({
                        where: {
                            AssignmentID: taskActivityResult.AssignmentID
                        }
                    }).then(function(assignmentResult) {
                        Section.find({
                            where: {
                                SectionID: req.query.sectionID
                            }
                        }).then(function(sectionResult) {
                            logger.log('debug', {section_res: sectionResult.toJSON()})
                            Semester.find({
                                where: {
                                    SemesterID: sectionResult.SemesterID
                                }
                            }).then(function(semesterResult) {
                                res.json({
                                    "Error": false,
                                    "Message": "Success",
                                    "taskActivityID": taskInstanceResult.TaskActivityID,
                                    "taskActivityType": taskActivityResult.Type,
                                    "courseName": courseResult.Name,
                                    "courseNumber": courseResult.Number,
                                    "assignmentName": assignmentResult.Name,
                                    "assignmentID": assignmentResult.AssignmentID,
                                    "semesterID": sectionResult.SemesterID,
                                    "semesterName": semesterResult.Name
                                });
                            }).catch(function(err) {
                                //Catch error and print into console.
                                console.log('/taskInstanceTemplate/main/ ' + err);
                                res.status(400).end();
                            });
                        });
                    });
                });
            });
        });
    });

    // Endpoint to submit the taskInstance input and sync into database
    router.post('/taskInstanceTemplate/create/submit', function(req, res) {
        logger.log('info', 'post: /taskInstanceTemplate/create/submit', {req_body: req.body})

        if (req.body.taskInstanceid == null) {
            logger.log('info', 'TaskInstanceID cannot be null')
            return res.status(400).end()
        }
        if (req.body.userid == null) {
            logger.log('info', 'UserID cannot be null')
            return res.status(400).end()
        }
        if (req.body.taskInstanceData == null) {
            logger.log('info', 'Data cannot be null')
            return res.status(400).end()
        }
        return TaskInstance.find({
            where: {
                TaskInstanceID: req.body.taskInstanceid,
            },
            include: [
                {
                    model: TaskActivity,
                    attributes: ['Type'],
                },
            ],
        }).then(function (ti) {
            logger.log('info', 'task instance found', ti.toJSON())
            //Ensure userid input matches TaskInstance.UserID
            if (req.body.userid != ti.UserID) {
                logger.log('error', 'UserID Not Matched')
                return res.status(400).end()
            }
            var ti_data = JSON.parse(ti.Data)

            if (!ti_data) {
                ti_data = []
            }
            ti_data.push(req.body.taskInstanceData)

            logger.log('info', 'updating task instance', {ti_data: ti_data})

            return TaskInstance.update({
                Data: ti_data,
                ActualEndDate: new Date(),
                Status: 'complete',
            }, {
                where: {
                    TaskInstanceID: req.body.taskInstanceid,
                    UserID: req.body.userid,
                }
            }).then(function (done) {
                logger.log('info', 'task instance updated', {done: done})
                logger.log('info', 'triggering next task')
                //Trigger next task to start
                ti.triggerNext()

                if (-1 != ['edit', 'comment'].indexOf(ti.TaskActivity.Type)) {
                    var pre_ti_id = JSON.parse(ti.PreviousTask)[0].id
                    logger.log('info', 'this is a revision task, finding previous task instance id', pre_ti_id)

                    TaskInstance.find({where: {TaskInstanceID: pre_ti_id}}).then(function (pre_ti) {
                        logger.log('info', 'task instance found', pre_ti.toJSON())
                        ti_data = JSON.parse(pre_ti.Data)

                        if (!ti_data) {
                            ti_data = []
                        }
                        ti_data.push(req.body.taskInstanceData)

                        logger.log('info', 'updating task instance', {ti_data: ti_data})

                        return TaskInstance.update({
                            Data: ti_data,
                        }, {
                            where: {
                                TaskInstanceID: pre_ti.TaskInstanceID,
                            },
                        }).then(function (done) {
                            logger.log('info', 'task instance updated', {done: done})
                        }).catch(function (err) {
                            logger.log('error', 'task instance update failed', {err: err})
                        })
                    })
                }
                return res.status(200).end()
            }).catch(function (err) {
                logger.log('error', 'task instance update failed', {err: err})
                return res.status(400).end();
            })
        })
    })

    //Endpoint to save the task instance input
    router.post("/taskInstanceTemplate/create/save", function(req, res) {
        if (req.body.taskInstanceid == null) {
            console.log("/taskInstanceTemplate/create/save : TaskInstanceID cannot be null");
            res.status(400).end();
            return;
        }
        if (req.body.userid == null) {
            console.log("/taskInstanceTemplate/create/save : UserID cannot be null");
            res.status(400).end();
            return;
        }
        if (req.body.taskInstanceData == null) {
            console.log("/taskInstanceTemplate/create/save : Data cannot be null");
            res.status(400).end();
            return;
        }

        TaskInstance.find({
            where: {
                TaskInstanceID: req.body.taskInstanceid,
                UserID: req.body.userid
            }
        }).then(function(result) {
            //Ensure userid input matches TaskInstance.UserID
            if (req.body.userid != result.UserID) {
                console.log("/taskInstanceTemplate/create/save : UserID Incorrect Match");
                res.status(400).end();
                return;
            }

            //Task_Status remains incomplete and store userCreatedProblem
            result.update({
                Data: req.body.taskInstanceData

            }).then(function(response) {
                res.json({
                    "Error": false,
                    "Message": "Success",
                    "Result": response
                });
            }).catch(function(err) {
                console.log('/taskInstanceTemplate/create/save ' + err);
                res.status(400).end();
            });

        });

    });


    //---------------------------------------------------------------------------------------------------------------------------------------------


    //Endpoint to get the PendingTasks of users
    /* Need to only pick relevant data. Too big, could cause scaling slowdown issues
    Most likely: TaskInstanceID,UserID,WorlkflowID, StartDate,EndDate,Status from TaskInstance; Name,Visual_ID from TaskActivity; Name from WorkflowActivity
    */
    router.get("/getPendingTaskInstances/:userID", function(req, res) {
        TaskInstance.findAll({
            where: {
                UserID: req.params.userID,
                $or: [{
                    Status: "incomplete"
                }, {
                    Status: "started"
                }]
            },
            attributes: ["TaskInstanceID", "UserID", "WorkflowInstanceID", "StartDate", "EndDate", "Status"],
            include: [ ///// Need new mappings in index.js AssignmentInstance -> Assignment, Assignment ::=> AssignmentInstance
                {
                    model: AssignmentInstance,
                    attributes: ["AssignmentInstanceID", "AssignmentID"],
                    include: [{
                        model: Section,
                        attributes: ["SectionID"],
                        include: [{
                            model: Course,
                            attributes: ["Name", "CourseID"]
                        }]

                    }, {
                        model: Assignment,
                        attributes: ["Name"]
                    }]
                },
                /*TaskInstance - > AssignmentInstance - > Section - > Course */
                {
                    model: TaskActivity,
                    attributes: ["Name", "Type", "VisualID"],
                    include: [{
                        model: WorkflowActivity,
                        attributes: ["Name"]
                    }]
                }
            ]
        }).then(function(taskInstances) {

            console.log("/getPendingTaskInstances/ TaskInstances found");
            res.json({
                "Error": false,
                "PendingTaskInstances": taskInstances
            });

        }).catch(function(err) {

            console.log('/getPendingTaskInstances: ' + err);
            res.status(404).end();

        });


    });

    //Endpoint to get completed task instances for user
    router.get("/getCompletedTaskInstances/:userID", function(req, res) {

        TaskInstance.findAll({
            where: {
                UserID: req.params.userID,
                Status: "complete"
            },
            attributes: ["TaskInstanceID", "UserID", "WorkflowInstanceID", "StartDate", "EndDate", "Status"],
            include: [ ///// Need new mappings in index.js AssignmentInstance -> Assignment, Assignment ::=> AssignmentInstance
                {
                    model: AssignmentInstance,
                    attributes: ["AssignmentInstanceID", "AssignmentID"],
                    include: [{
                        model: Section,
                        attributes: ["SectionID"],
                        include: [{
                            model: Course,
                            attributes: ["Name", "CourseID"]
                        }]

                    }, {
                        model: Assignment,
                        attributes: ["Name"]
                    }]
                }, {
                    model: TaskActivity,
                    attributes: ["Name", "Type", "VisualID"],
                    include: [{
                        model: WorkflowActivity,
                        attributes: ["Name"]
                    }]
                }
            ]
        }).then(function(taskInstances) {

            console.log("/getCompletedTaskInstances/ TaskInstances found");

            res.json({
                "Error": false,
                "CompletedTaskInstances": taskInstances
            });
        }).catch(function(err) {

            console.log('/getCompletedTaskInstances: ' + err);
            res.status(404).end();

        });
    });

    // view access contraints
    //Endpoint to retrieve all the assignment and its current state
    router.get('/getAssignmentRecord/:assignmentInstanceid', function(req, res) {
        var taskFactory = new TaskFactory();

        console.log('/getAssignmentRecord/:assignmentInstanceid: Initiating...');

        var tasks = [];
        var info = {};

        return AssignmentInstance.find({
            where: {
                AssignmentInstanceID: req.params.assignmentInstanceid
            }
        }).then(function(AI_Result) {

            return WorkflowInstance.findAll({
                where: {
                    AssignmentInstanceID: req.params.assignmentInstanceid
                }
            }).then(function(WI_Result) {

                if (WI_Result === null || typeof WI_Result === undefined) {
                    console.log('/getAssignmentRecord/:assignmentInstanceid: No WI_Result');
                } else {
                    //Iterate through all workflow instances found
                    return Promise.mapSeries(WI_Result, function(workflowInstance) {

                        console.log('/getAssignmentRecord/:assignmentInstanceid: WorkflowInstance', workflowInstance.WorkflowInstanceID);
                        var tempTasks = [];

                        return Promise.mapSeries(JSON.parse(workflowInstance.TaskCollection), function(task) {

                            console.log('/getAssignmentRecord/:assignmentInstanceid: TaskCollection', task);
                            //each task is TaskInstanceID
                            return TaskInstance.find({
                                where: {
                                    TaskInstanceID: task
                                },
                                attributes: ['TaskInstanceID', 'WorkflowInstanceID', 'Status', 'NextTask', 'IsSubWorkflow'],
                                include: [{
                                    model: User,
                                    attributes: ['UserID', "UserType", 'UserName']
                                }, {
                                    model: TaskActivity,
                                    attributes: ['Type']
                                }]
                            }).then(function(taskInstanceResult) {

                                //Array of all the task instances found within taskcollection
                                if (taskInstanceResult.IsSubWorkflow === 0) {

                                    taskFactory.getSubWorkflow(taskInstanceResult.TaskInstanceID, new Array()).then(function(subworkflow) {
                                      if(!taskInstanceResult.hasOwnProperty('SubWorkflow')){
                                        taskInstanceResult.setDataValue('SubWorkflow', subworkflow);
                                      } else {
                                        taskInstanceResult.SubWorkflow.push(sw);
                                      }
                                    });

                                    tempTasks.push(taskInstanceResult);
                                }
                            });
                        }).then(function(result) {

                            //Array of arrays of all task instance collection
                            tasks.push(tempTasks);

                            return AssignmentInstance.find({
                                where: {
                                    AssignmentInstanceID: req.params.assignmentInstanceid
                                }
                            }).then(function(AI_Result) {
                                info.SectionID = AI_Result;
                                return Assignment.find({
                                    where: {
                                        AssignmentID: AI_Result.AssignmentID
                                    },
                                    attributes: ['OwnerID', 'SemesterID', 'CourseID', 'DisplayName', 'SectionID']
                                }).then(function(A_Result) {
                                    info.Assignment = A_Result;
                                    //console.log("A_Result", A_Result);
                                    return User.find({
                                        where: {
                                            UserID: A_Result.OwnerID
                                        },
                                        attributes: ['FirstName', 'MiddleInitial', 'LastName']
                                    }).then(function(user) {
                                        info.User = user;

                                        return Course.find({
                                            where: {
                                                CourseID: A_Result.CourseID
                                            },
                                            attributes: ['Name']
                                        }).then(function(course) {
                                            info.Course = course;
                                        });
                                    });
                                });
                            });
                        });
                    });
                }

            }).then(function(done) {

                console.log('/getAssignmentRecord/:assignmentInstanceid: Done!');

                res.json({
                    "Error": false,
                    "Info": info,
                    "Workflows": JSON.parse(AI_Result.WorkflowCollection),
                    "AssignmentRecords": tasks
                });

            }).catch(function(err) {

                console.log('/getAssignmentRecord: ' + err);
                res.status(404).end();
            });
        });
    });

    //Endpoint for all current task data and previous task data and put it in an array
    router.get('/superCall/:taskInstanceId', function(req, res) {
        logger.log('info', 'post: /superCall/:taskInstanceId', {req_body: req.body, req_params: req.params})
        var allocator = new TaskFactory();

        allocator.findPreviousTasks(req.params.taskInstanceId, new Array()).then(function(done) {

            //console.log('done!', done);
            var ar = new Array();
            if (done == null) {

                return TaskInstance.find({
                        where: {
                            TaskInstanceID: req.params.taskInstanceId
                        },
                        attributes: ["TaskInstanceID", "Data", "Status", "Files"],
                        include: [{
                            model: TaskActivity,
                            attributes: ["TaskActivityID","Type", "Rubric", "Instructions", "Fields", "NumberParticipants", "FileUpload"]
                        }]
                    })
                    .then((result) => {
                        //console.log(result);
                        ar.push(result);
                        res.json({
                            "previousTasksList": done,
                            "superTask": ar
                        });
                    });
            }


            Promise.mapSeries(done, function(task) {
                return TaskInstance.find({
                    where: {
                        TaskInstanceID: task
                    },
                    attributes: ["TaskInstanceID", "Data", "Status", "Files"],
                    include: [{
                        model: TaskActivity,
                        attributes: ["TaskActivityID","Type", "Rubric", "Instructions", "Fields", "NumberParticipants", "FileUpload", 'VersionEvaluation']
                    }]
                }).then((result) => {
                    //console.log(result);
                    ar.push(result);
                });
            }).then(function() {
                return TaskInstance.find({
                        where: {
                            TaskInstanceID: req.params.taskInstanceId
                        },
                        attributes: ["TaskInstanceID", "Data", "Status", "Files"],
                        include: [{
                            model: TaskActivity,
                            attributes: ["TaskActivityID","Type", "Rubric", "Instructions", "Fields", "NumberParticipants", "FileUpload"]
                        }]
                    })
                    .then((result) => {
                        //console.log(result);
                        allocator.applyVersionContstraints(ar, result)
                        ar.push(result);
                        res.json({
                            "previousTasksList": done,
                            "superTask": ar
                        });
                    });
            });

        }).catch(function(err) {
            console.log(err);
            res.status(401).end();
        });
    });

    //Endpoint to get all the sections assoicate with course and all the task activities within the workflow activities
    router.get('/getAssignToSection/', function(req, res) {

        console.log("/getAssignToSection: Initiating... ")

        var sectionIDs = [];
        var taskCollection = {};
        var isDone = false;
        var DisplayName;

        Assignment.find({
            where: {
                AssignmentID: req.query.assignmentid
            },
            attributes: ["DisplayName"]
        }).then(function(AI_Result) {
            DisplayName = AI_Result;
        })

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
        Promise.all(sections).then(function(result) {
            console.log('Finding all sections associate with course... ');

            //Create an array of all the sections associate with courseid
            result.forEach(function(section) {
                sectionIDs.push({
                    value: section.SectionID,
                    label: section.Name
                });
            });

            isDone = true;

            console.log('sectionIDs', sectionIDs);
        }).catch(function(err) {
            console.log('/getAssignToSection: ', err);
            res.status(404).end();
        });

        //Promise workflowActivity has all the data returned
        Promise.all(workflowActivity).then(function(result) {

            //Check if result is empty
            if (result !== null || typeof result !== undefined) {
                //WorkflowActivityID -- key
                result.forEach(function(workflow) {
                    taskCollection[workflow.WorkflowActivityID] = [];
                });
            }

            return [taskCollection, result];

        }).then(function(resultArray) {
            console.log('Finding all workflows and its task collection...')
            //promise all instances in resultArray have returned
            return Promise.map(resultArray[1], function(workflow) {

                console.log('WorkflowActivityID: ', workflow.WorkflowActivityID);

                //Loop through TaskActivityCollection in each workflowActivity
                return Promise.map(JSON.parse(workflow.TaskActivityCollection), function(taskActivityID) {

                    console.log('TaskActivityID:', taskActivityID)

                    //Find TaskActivity object and return
                    return TaskActivity.find({
                        where: {
                            TaskActivityID: taskActivityID
                        }
                    }).then(function(taskActivity) {

                        //Push the resulting name and TaskActivityID on to javascript object
                        taskCollection[workflow.WorkflowActivityID].push({
                            "taskActivityID": taskActivity.TaskActivityID,
                            "name": taskActivity.Name,
                            "type": taskActivity.Type
                        });
                        taskCollection[workflow.WorkflowActivityID].sort(function(a, b) {
                            var x = a.taskActivityID < b.taskActivityID ? -1 : 1;
                            return x;
                        });

                    }).catch(function(err) {
                        console.log('/getAssignToSection: ', err);
                        res.status(404).end();
                    });;
                });
            });

        }).then(function(done) {
            //if sectionIDs are set then return

            if (isDone === true) {
                res.json({
                    "assignment": DisplayName,
                    "sectionIDs": sectionIDs,
                    "taskActivityCollection": taskCollection //returns workflow id follows by task act
                });
            }
        }).catch(function(err) {
            console.log('/getAssignToSection: ', err);
            res.status(404).end();
        });


    });

    //Endopint to assign an assignment to a section
    router.post('/getAssignToSection/submit/', function(req, res) {
        //creates new allocator object
        var taskFactory = new TaskFactory();
        var manager = new Manager();

        console.log('/getAssignToSection/submit/  Creating Assignment Instance...');


        //create assignment instance
        taskFactory.createAssignmentInstances(req.body.assignmentid, req.body.sectionIDs, req.body.startDate, req.body.wf_timing).then(function(done) {
            console.log('/getAssignToSection/submit/   All Done!');
            console.log(typeof req.body.wf_timing.startDate, req.body.wf_timing.startDate);
            if (moment(req.body.wf_timing.startDate) <= new Date()) {

                manager.checkAssignments();
            };
            res.status(200).end();
        }).catch(function(err) {
            console.log(err);
            res.status(404).end();
        });

    });

    router.get('/getTree', function(req, res) {
        var taskFactory = new TaskFactory();
        var node1;
        var node2;

        Promise.all([taskFactory.getTree(1, function(tree) {
            let ar = [];
            tree.walk(function(node) {
                console.log(node.model.id);
                ar.push(node.model.id);
            })
            node1 = tree.first(function(node) {
                //console.log("first :", node);
                return node.model.id === 1;
            })
            node2 = tree.all(function(node) {
                //console.log("all :", node);
                return node.model.parent === 1
            })

            //console.log('nodes',node1, node2);
            // res.json({
            //     Arra: ar,
            //     Node1: node1,
            //     Node2: node2
            // });
            //res.status(200).end();
        })]).then(function(done) {
            console.log('nodes', node1, node2);
        });
    });

    router.get('/openRevision/:taskInstanceID', function(res, req) {

        if (req.params.taskInstanceID == null) {
            console.log('/openRevision/:taskInstanceID TaskInstanceID cannot be empty!');
            res.stats(404).end()
        }

        TaskInstance.find({
            where: {
                TaskInstanceID: req.params.taskInstanceID
            }
        }).then(function(ti_result) {
            TaskActivity.find({
                where: {
                    TaskActivityID: ti_result.TaskActivityID
                }
            }).then(function(ta_result) {
                if (ta_result.AllowRevision === 0) {
                    console.log('Allow revision is false');
                    res.stats(404).end();
                } else {
                    ti_result.Status = 'pending';
                }
            }).catch(function(err) {
                console.log(err);
                res.status(404).end();
            });
        });
    })

    router.get('/openRevision/save', function(res, req) {
        if (req.body.data == null) {
            console.log("/openRevision/save: data is missing");
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
        }).catch(function(err) {
            console.log(err);
            res.stats(400).end()
        });

    });

    router.get('/openRevision/submit', function(res, req) {
        if (req.body.data == null) {
            console.log("/openRevision/save: data is missing");
            res.status(404).end();
        }
        if (req.body.taskInstanceID == null) {
            console.log('/openRevision/save TaskInstanceID cannot be empty!');
            res.stats(404).end();
        }

        //append second status
        TaskInstance.update({
            Data: req.body.data,
            Status: 'complete'
        }, {
            where: {
                TaskInstanceID: req.body.taskInstanceID
            }
        }).catch(function(err) {
            console.log(err);
            res.stats(400).end()
        });

    });

    //Backend router to reallocate students
    router.post("/reallocate", function(req, res) {

        if (req.body.taskid == null || req.body.users == null) {
            console.log('/reallocate: missing required fields.');
            res.status(401).end();
            return;
        }

        var realloc = new Allocator([], 0);

        realloc.reallocate(req.body.taskid, req.body.users);
    });

    router.get('/getActiveAssignmentsForSection/:sectionId', function(req, res) {
        console.log(`Finding Assignments for Section ${req.params.sectionId}`);
        AssignmentInstance.findAll({
            where: {
                SectionID: req.params.sectionId
            },
            attributes: ["AssignmentInstanceID", "StartDate", "EndDate"],
            include: [{
                model: Assignment,
                attributes: ['DisplayName']
            }]
        }).then(function(result) {
            console.log('Assignments have been found!');
            res.json({
                "Error": false,
                "Assignments": result
            });
        }).catch(function(err) {
            console.log('/getActiveAssignmentsForSection/' + req.params.sectionId + ": " + err);
            res.status(404).end();
        });
    });

    router.get('/getActiveAssignments/:courseId', function(req, res) {
        console.log('Finding assignments...');
        Assignment.findAll({
            where: {
                CourseID: req.params.courseId
            },
            attributes: ['AssignmentID', 'DisplayName', 'Type'],
            include: [{
                model: AssignmentInstance,
                as: 'AssignmentInstances',
                attributes: ["AssignmentInstanceID", "StartDate", "EndDate", "SectionID"]

            }]
        }).then(function(result) {
            console.log('Assignments have been found!');
            res.json({
                "Error": false,
                "Assignments": result
            });
        }).catch(function(err) {
            console.log('/getActiveAssignments/' + req.params.courseId + ": " + err);
            res.status(404).end();
        });
    });

    router.get("/getAllEnrolledCourses/:studentID", function(req, res) {
        SectionUser.findAll({
            where: {
                UserID: req.params.studentID
            },
            attributes: ['UserRole', 'UserStatus'],
            include: [{
                model: Section,
                attributes: ['Name'],
                include: [{
                    model: Course,
                    attributes: ['Number', 'Name', 'Abbreviations']
                }]
            }]
        }).then(function(Courses) {
            console.log(`/getEnrolledCourses/ Courses for ${req.params.studentID} found `);
            res.json({
                "Error": false,
                "Courses": Courses
            });
        });
    });

    router.get("/getActiveEnrolledCourses/:studentID", function(req, res) {
        SectionUser.findAll({
            where: {
                UserID: req.params.studentID,
                UserStatus: "Active"
            },
            raw: true,
            attributes: ['UserRole'],
            include: [{
                model: Section,
                attributes: ['Name'],
                include: [{
                    model: Course,
                    attributes: ['Number', 'Name', 'Abbreviations']
                }]
            }]
        }).then(function(Courses) {
            console.log(`/getEnrolledCourses/ Courses for ${req.params.studentID} found `);
            res.json({
                "Error": false,
                "Courses": Courses
            });
        });
    });

    router.get("/getSubWorkflow/:taskInstanceID", function(req, res) {
        var taskFactory = new TaskFactory();
        taskFactory.getSubWorkflow(req.params.taskInstanceID, new Array()).then(function(subworkflow) {
            res.json({
                "Error": false,
                "SubWorkflow": subworkflow
            });
        });
    });

    router.get("/getNextTask/:taskInstanceID", function(req, res) {
        var taskFactory = new TaskFactory();
        taskFactory.getNextTask(req.params.taskInstanceID, new Array()).then(function(NextTask) {
            res.json({
                "Error": false,
                "NextTask": NextTask
            });
        });
    });

    router.get("/skipDispute/:taskInstanceID", function(req, res) {
        TaskInstance.find({
            where: {
                TaskInstanceID: req.params.taskInstanceID
            }
        }).then(function(ti) {
            ti.skipDispute();
        });
    });
    //-----------------------------------------------------------------------------------------------------

    //Endpoint to return Semester Information
    router.get("/getOrganizationSemesters/:organizationID", function(req, res) {

        Semester.findAll({
            where: {
                OrganizationID: req.params.organizationID
            },
            attributes: ['SemesterID', 'Name', 'StartDate', 'EndDate', 'OrganizationID']
        }).then(function(rows) {
            res.json({
                "Error": false,
                "Message": "Success",
                "Semesters": rows
            });
        }).catch(function(err) {
            console.log("/semester/email : " + err.message);
            res.status(401).end();
        });


    });

    //-----------------------------------------------------------------------------------------------------

    //Endpoint to return Organization Information
    router.get("/organization/:organizationid", function(req, res) {

        Organization.find({
            where: {
                OrganizationID: req.params.organizationid
            },
            attributes: ['OrganizationID', 'Name']
        }).then(function(rows) {
            res.json({
                "Error": false,
                "Message": "Success",
                "Organization": rows
            });
        }).catch(function(err) {
            console.log("/organization: " + err.message);
            res.status(401).end();
        });


    });

    //Endpoint to delete organization
    router.get("/organization/delete/:organizationid", function(req, res) {
        Organization.destroy({
            where: {
                OrganizationID: req.params.organizationid
            }
        }).then(function(rows) {
            console.log("Delete Organization Success");
            res.status(200).end();
        }).catch(function(err) {
            console.log("/organization/delete : " + err.message);

            res.status(400).end();
        });
    });

    //-----------------------------------------------------------------------------------------------------

    //Endpoint to return Section Information
    router.get("/section/:sectionid", function(req, res) {

        Section.find({
            where: {
                SectionID: req.params.sectionid
            },
            attributes: ['SectionID', 'Name', 'CourseID', 'OrganizationID', 'SemesterID']
        }).then(function(rows) {
            res.json({
                "Error": false,
                "Message": "Success",
                "Section": rows
            });
        }).catch(function(err) {
            console.log("/section: " + err.message);
            res.status(401).end();
        });


    });

}

module.exports = REST_ROUTER;
