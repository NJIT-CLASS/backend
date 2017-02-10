var mysql = require("mysql");
var dateFormat = require('dateformat');
var Guid = require('guid');
var models = require('./Model');
var Promise = require('bluebird');

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

var Manager = require('./WorkFlow/Manager.js');
var Allocator = require('./WorkFlow/Allocator.js');
var TaskFactory = require('./WorkFlow/TaskFactory.js');
var sequelize = require("./Model/index.js").sequelize;
var Email = require('./WorkFlow/Email.js');
var FlatToNested = require('flat-to-nested');

//-----------------------------------------------------------------------------------------------------


function REST_ROUTER(router, connection, md5) {
    var self = this;
    self.handleRoutes(router, connection, md5);
}

//-----------------------------------------------------------------------------------------------------

REST_ROUTER.prototype.handleRoutes = function(router, connection, md5) {

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
        // opts = {
        //   from: "qxl2@njit.edu",
        //   replyTo: "qxl2@njit.edu",
        //   to: "njitplamaster@gmail.com",
        //   subject: "Test",
        //   html: "Test"
        // };
        //
        // email.send(opts);


    });



    //-----------------------------------------------------------------------------------------------------

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
                Email: req.body.emailaddress,
                Password: md5(req.body.password)
            },
            attributes: ['UserID', 'Status']
        }).then(function(user) {
            if (user == null) {
                console.log('/login : Invalid Credentials');
                res.status(401).end()
            } else {
                console.log(user.Status);
                res.json({
                    "Error": false,
                    "Message": "Success",
                    "UserID": user.UserID,
                    "Status": user.Status
                });
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
                UserID: req.body.userid,
                Password: md5(req.body.password)
            }
        }).then(function(user) {
            if (user == null) {
                console.log('/update/email : Bad Input');
                res.status(401).end();
            } else {
                user.Email = req.body.email;
                user.save().then(function(used) {
                    res.status(200).end();
                }).catch(function(err) {
                    res.json({
                        'Email': used.Email
                    });
                });
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
            attributes: ['FirstName', 'LastName', 'UserType', 'Admin', 'Country', 'City'],
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

        Semester.findAll({
            where: {
                SemesterID: req.params.semesterid
            },
            attributes: ['SemesterID', 'Name', 'StartDate', 'EndDate', 'OrganizationID']
        }).then(function(rows) {
            res.json({
                "Error": false,
                "Message": "Success",
                "Course": rows
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
            }).then(function(user) {
                UserLogin.create({
                    UserID: user.UserID,
                    Email: req.body.email,
                    Password: md5(req.body.passwd)
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
            }).then(function(userLogin) {
                if (md5(req.body.oldPasswd) == userLogin.Password) {
                    console.log("/user/create : Password matched");
                    UserLogin.update({
                        Password: md5(req.body.newPasswd)
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
                            }).then(function(user) {
                                UserLogin.create({
                                    UserID: user.UserID,
                                    Email: req.body.email,
                                    Password: md5(req.body.password),
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
                            }).then(function(user) {
                                UserLogin.create({
                                    UserID: user.UserID,
                                    Email: req.body.email,
                                    Password: md5("pass123")
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
    //                         }).then(function(user) {
    //                             UserLogin.create({
    //                                 UserID: user.UserID,
    //                                 Email: req.body.email,
    //                                 Password: md5('pass123')
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
            }).then(function(request) {
                if (request == null) {
                    console.log("/resetPassword : HashRequest does not exist");
                    res.status(401).end();
                } else {
                    UserLogin.update({
                        Password: md5(req.body.newPassword)
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
                UserID: req.body.UserID,
                Password: md5(req.body.password)
            }
        }).then(function(userLogin) {
            if (userLogin == null) {
                console.log("/makeUserNoAdmin : Authentication Failed");
                res.status(401).end();
            } else {
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
                    }).then(function(user) {
                        UserLogin.create({
                            UserID: user.UserID,
                            Email: email,
                            Password: md5('pass123')
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

    //Endpoint to submit the taskInstance input and sync into database
    router.post("/taskInstanceTemplate/create/submit", function(req, res) {
        if (req.body.taskInstanceid == null) {
            console.log("/taskInstanceTemplate/create/submit : TaskInstanceID cannot be null");
            res.status(400).end();
            return;
        }
        if (req.body.userid == null) {
            console.log("/taskInstanceTemplate/create/submit : UserID cannot be null");
            res.status(400).end();
            return;
        }
        if (req.body.taskInstanceData == null) {
            console.log("/taskInstanceTemplate/create/submit : Data cannot be null");
            res.status(400).end();
            return;
        }

        TaskInstance.update({
            Data: req.body.taskInstanceData,
            ActualEndDate: new Date(),
            Status: 'complete'
        }, {
            where: {
                TaskInstanceID: req.body.taskInstanceid,
                UserID: req.body.userid
            }
        }).then(function(done) {
            TaskInstance.find({
                where: {
                    TaskInstanceID: req.body.taskInstanceid
                }
            }).then(function(ti_result) {
                //Ensure userid input matches TaskInstance.UserID
                if (req.body.userid != ti_result.UserID) {
                    console.log("/taskInstanceTemplate/create/submit : UserID Not Matched!");
                    res.status(400).end();
                }

                //Trigger next task to start
                ti_result.triggerNext();
                res.status(200).end();

            }).catch(function(err) {
                res.status(400).end();
            });
        });

    });

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

    //Endpoint to retrieve all the assignment and its current state
    router.get('/getAssignmentRecord/:assignmentInstanceid', function(req, res) {

        console.log('/getAssignmentRecord/:assignmentInstanceid: Initiating...');

        var tasks = [];
        var info = {};

        AssignmentInstance.find({
            where: {
                AssignmentInstanceID: req.params.assignmentInstanceid
            }
        }).then(function(AI_Result) {

            WorkflowInstance.findAll({
                where: {
                    AssignmentInstanceID: req.params.assignmentInstanceid
                }
            }).then(function(WI_Result) {

                if (WI_Result === null || typeof WI_Result === undefined) {
                    console.log('/getAssignmentRecord/:assignmentInstanceid: No WI_Result');
                } else {
                    //Iterate through all workflow instances found
                    return Promise.map(WI_Result, function(workflowInstance) {

                        console.log('/getAssignmentRecord/:assignmentInstanceid: WorkflowInstance', workflowInstance.WorkflowInstanceID);
                        var tempTasks = [];

                        return Promise.map(JSON.parse(workflowInstance.TaskCollection), function(task) {

                            console.log('/getAssignmentRecord/:assignmentInstanceid: TaskCollection', task);
                            //each task is TaskInstanceID
                            return TaskInstance.find({
                                where: {
                                    TaskInstanceID: task
                                },
                                attributes: ['TaskInstanceID', 'WorkflowInstanceID', 'Status'],
                                include: [{
                                    model: User,
                                    attributes: ['UserID', 'UserName']
                                }, {
                                    model: TaskActivity,
                                    attributes: ['Type']
                                }]
                            }).then(function(taskInstanceResult) {

                                //Array of all the task instances found within taskcollection
                                tempTasks.push(taskInstanceResult);
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
        var allocator = new TaskFactory();

        allocator.findPreviousTasks(req.params.taskInstanceId, new Array()).then(function(done) {

            //console.log('done!', done);
            var ar = new Array();
            if (done == null) {

                return TaskInstance.find({
                        where: {
                            TaskInstanceID: req.params.taskInstanceId
                        },
                        attributes: ["TaskInstanceID", "Data", "Status"],
                        include: [{
                            model: TaskActivity,
                            attributes: ["Type", "Rubric", "Instructions", "Fields", "NumberParticipants"]
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
                    attributes: ["TaskInstanceID", "Data", "Status"],
                    include: [{
                        model: TaskActivity,
                        attributes: ["Type", "Rubric", "Instructions", "Fields", "NumberParticipants"]
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
                        attributes: ["TaskInstanceID", "Data", "Status"],
                        include: [{
                            model: TaskActivity,
                            attributes: ["Type", "Rubric", "Instructions", "Fields", "NumberParticipants"]
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
            if (req.body.wf_timing.Time >= new Date()) {
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

        taskFactory.getTree(1, function(tree) {
            let ar = [];
            tree.walk(function(node) {
                console.log(node.model.id);
                ar.push(node.model.id);
            })

            res.json({
                Arra: ar
            });
            res.status(200).end();
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

        var realloc = new Allocator([],0);

        realloc.reallocate(req.body.taskid, req.body.users);
    });

}

module.exports = REST_ROUTER;
