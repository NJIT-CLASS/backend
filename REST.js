var mysql = require("mysql");
var dateFormat = require('dateformat');
var Guid = require('guid');
var models = require('./Model');
var User = models.User;
var UserLogin = models.UserLogin;
var UserContact = models.UserContact;
var Course = models.Course;
var Section = models.Section;
var SectionUser = models.SectionUser;

var Semester = models.Semester;
var Task = models.Task;
var TaskActivity = models.TaskActivity;
var Assignment = models.Assignment;
var AssignmentSection = models.AssignmentSection;
var Workflow = models.Workflow;
var WorkflowActivity = models.WorkflowActivity;
var ResetPasswordRequest = models.ResetPasswordRequest;
var Manager = require('./WorkFlow/Manager.js');
var Allocator = require('./WorkFlow/Allocator.js');
var sequelize = require("./Model/index.js").sequelize;
//var server = require('./Server.js');

//var User = server.app.get('models').User;



function REST_ROUTER(router, connection, md5) {
    var self = this;
    self.handleRoutes(router, connection, md5);
}

REST_ROUTER.prototype.handleRoutes = function(router, connection, md5) {

    //Endpoint to Create an Assignment
    router.post("/assignment/create", function(req, res) {

        var value = req.body.assignment;


        /*******************************
         *     Exectuing Transaction   *
         *      if something fails,    *
         *  changes will be rolledback *
         *******************************/

        sequelize.transaction(function(t) {
            "use strict";

            /**
             * Defining assignment
             */
            var assignment = Assignment.build({
                Description: req.body.assignment.Description,
                GradeDistribution: req.body.assignment.GradeDistribution,
                Title: req.body.assignment.Title,
                UserID: req.body.assignment.UserID,
                GroupSize: req.body.assignment.GroupSize,
                Settings: {},
                UseCase: "1a"
            });

            /**
             * save changes for assignment
             */
            return assignment.save({
                transaction: t
            }).then(function(assignment) {

                //for (let workflow of req.body.assignment.WorkflowActivity) {

                /**
                 * Getting  workflow for assignment
                 */
                var workflow = req.body.assignment.WorkflowActivity;
                console.log("creating workflow");


                /**
                 * Defining Workflow
                 */
                var workFlow = WorkflowActivity.build({
                    Name: workflow.Name,
                    Type: workflow.Type,
                    MaximumDuration: workflow.MaximumDuration,
                    Description: workflow.Description,
                    WA_A_id: assignment.AssignmentID

                });
                var promises = [];

                /**
                 * Saving Changes
                 */
                return workFlow.save({
                    transaction: t
                }).then(function(workflow) {
                    "use strict";
                    console.log("Succesfully creation of wokflow activity");


                    /**
                     * Creating each TaskActivity for the assignment
                     */
                    for (taskactivity in req.body.assignment.TaskActivity) {

                        console.log("Creating taskActivity");

                        var taskActivity = TaskActivity.build({
                            Name: taskactivity.Name,
                            Type: taskactivity.Type,
                            MaximumDuration: taskactivity.MaximumDuration,
                            EarliestStartTime: taskactivity.EarliestStartTime,
                            Instructions: taskactivity.Instructions,
                            Visual_ID: taskactivity.Visual_ID,
                            TaskActivity_grade_difference: taskactivity.TaskActivity_grade_difference,
                            Task_grade_type: taskactivity.Task_grade_type,
                            Assignee_constraints: JSON.stringify(taskactivity.Assignee_constraints),
                            TA_due: JSON.stringify(taskactivity.TA_due),
                            TA_trigger_condition: JSON.stringify(taskactivity.TA_trigger_condition),
                            TA_next_task: JSON.stringify(taskactivity.TA_next_task),
                            TA_WA_id: null, //workflow.WorkflowActivityID,
                            TA_AA_id: assignment.AssignmentID
                        });

                        /**
                         * Adding Promises to array
                         * for just one time execution
                         */
                        promises.push(taskActivity.save({
                            transaction: t
                        }));
                    }

                    /**
                     * Executing task creation changes all at once
                     */
                    return Promise.all(promises, {
                        transaction: t
                    });
                });
                //}
            })
        }).then(function(result) {
            /**
             * Transcation has been succesful
             * Changes have been commited
             */

            //Loggin error
            console.log("Assignment Creation succesfully");

            res.status(200).end();
        }).catch(function(err) {

            // Transaction has been rolled back
            // err is the reason why rejected the promise chain returned to the transaction callback
            console.log("Assignment Creation has failed");

            //Loggin error
            console.log(err);
            res.status(400).end();


        });;

        /**********************************
        keep until testing is finished

        var assignment = Assignment.build({
        	Description : req.body.assignment.Description,
        	GradeDistribution : req.body.assignment.GradeDistribution,
        	Title : req.body.assignment.Title,
        	UserID : req.body.assignment.UserID,
        	GroupSize : req.body.assignment.GroupSize,
        	Settings : {},
        	UseCase : "1a"
        });


        assignment.save().then(function(assignment)
        {

        	//for (let workflow of req.body.assignment.WorkflowActivity) {
        	var workflow = req.body.assignment.WorkflowActivity;
        	console.log("creating workflow");

        	var workFlow = WorkflowActivity.build(
        		{
        			Name : workflow.Name,
        			Type : workflow.Type,
        			MaximumDuration : workflow.MaximumDuration,
        			Description : workflow.Description,
        			WA_A_id : assignment.AssignmentID

        		}
        	);

        	workFlow.save().then(function(workflow)
        	{
        		"use strict";
        		console.log("Succesfully creation of wokflow activity");



        		for (let taskactivity of req.body.assignment.TaskActivity) {

        			console.log("Creating taskActivity");

        			var taskActivity = TaskActivity.build(
        				{
        					Name : taskactivity.Name,
        					Type : taskactivity.Type,
        					MaximumDuration : taskactivity.MaximumDuration,
        					EarliestStartTime : taskactivity.EarliestStartTime,
        					Instructions : taskactivity.Instructions,
        					Visual_ID : taskactivity.Visual_ID,
        					TaskActivity_grade_difference : taskactivity.TaskActivity_grade_difference,
        					Task_grade_type : taskactivity.Task_grade_type,
        					Assignee_constraints : JSON.stringify(taskactivity.Assignee_constraints),
        					TA_due : JSON.stringify(taskactivity.TA_due),
        					TA_trigger_condition : JSON.stringify(taskactivity.TA_trigger_condition) ,
        					TA_next_task : JSON.stringify(taskactivity.TA_next_task),
        					TA_WA_id : workflow.WorkflowActivityID,
        					TA_AA_id : assignment.AssignmentID
        				}
        			);

        			taskActivity.save().then(function()
        			{
        				console.log("Succesfully creation of task activity");

        			}).catch(function(e){
        				console.log(e);
        			});
        		}
        	}).catch(function(e){
        		console.log(e);
        	});
        	//}
        }).catch(function(e){
        	console.log(e);
        });

        */
    });

    //Endpoint for Assignment Allocator
    router.get("/allocator", function(req, res) {

        var alloc = new Allocator.Allocator();
        alloc.Allocate([1], [1]);
        //alloc.createRole('test');
        //var a = [];
        //alloc.count(a);
    });

    //Endpoint for Assignment Manager
    router.get("/manager", function(req, res) {

        //Manager.Manager.checkTimeoutTasks();
        AssignmentSection.findById(1).then(
            function(asection) {
                Manager.Manager.trigger(asection);

            }
        );
    });

    router.get("/ModelTest/:userID", function(req, res) {


        Workflow.findById(req.params.userID).then(function(Workflow) {
            console.log("Workflow Found");

            Workflow.getWorkflowActivity().then(function(workflowActivity) {
                console.log("WorkflowActivity Found " + workflowActivity.Name);
            });

            Workflow.getAssignment().then(function(assignment) {
                console.log("Assignment Found : " + assignment.Title);
            });
        });

        WorkflowActivity.findById(req.params.userID).then(function(workflowActivity) {
            console.log("WorkflowActivity Found " + workflowActivity.Name);

            workflowActivity.getWorkflows().then(function(workflows) {
                console.log("workflows Found ");
            });

        });

        Assignment.findById(req.params.userID).then(function(assignment) {
            console.log("Assignment Found : " + assignment.Title);

            assignment.getWorkflows().then(function(workflows) {
                console.log("workflows Found ");
            });

        });

        Task.findById(req.params.userID).then(function(Task) {
            console.log("Semester name : " + Task.TaskID);

            Task.getUser().then(function(User) {
                console.log("Task User Name " + User.FirstName);
            });
            Task.getTaskActivity().then(function(TaskActivity) {
                console.log("TaskActivity Name " + TaskActivity.Name);
            });

        });

        TaskActivity.findById(2).then(function(TaskActiviy) {
            console.log("TaskActiviy name : " + TaskActiviy.Name);

            TaskActiviy.getTasks().then(function(Tasks) {
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
                console.log("Course Title : " + Course.Title);
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
            console.log("User Course : " + course.Title);

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

    //Endpoint for Login Function
    router.post("/login", function(req, res) {
        var query = "SELECT ?? FROM ?? WHERE ?? = ? AND ?? = ?";
        var table = ["UserID", "UserLogin", "Email", req.body.emailaddress, "Password", md5(req.body.password)];
        query = mysql.format(query, table);

        if (req.body.emailaddress == null) {
            console.log("/login : Old emailaddress not sent");
            res.status(401).end();
            return;
        }

        if (req.body.password == null) {
            console.log("/login : Password not sent");
            res.status(401).end();
            return;
        }


        connection.query(query, function(err, rows) {
            if (err) {
                res.status(401).end();
            } else {
                if (rows.length > 0) {
                    res.json({
                        "Error": false,
                        "Message": "Success",
                        "UserID": rows[0].UserID
                    });
                } else {
                    res.status(401).end();
                }
            }
        });
    });

    //Updates Email
    router.put("/update/email", function(req, res) {
        if (req.body.password == null || req.body.email == null || req.body.userid == null) {
            console.log("/update/email : Bad Input");
            res.status(400).end();
        }

        UserLogin.find({
            where: {
                UserID: req.body.userID,
                Password: req.body.password
            },
            attributes: ['Email']
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

    //Updates Name
    router.put("/update/name", function(req, res) {
        var query = "UPDATE ?? SET ?? = ?, ?? = ? WHERE ?? = ?";
        var table = ["User", "FirstName", req.body.firstname, "LastName", req.body.lastname, "UserID", req.body.userid];
        query = mysql.format(query, table);
        connection.query(query, function(err, rows) {
            if (err) {
                console.log("/update/name : " + err.message);

                res.status(401).end();
            } else {
                res.json({
                    "Error": false,
                    "Message": "Success",
                    "FirstName": req.body.firstname,
                    "LastName": req.body.lastname
                });
            }
        });
    });

    //Issue 3 - General User Endpoint
    router.get("/generalUser/:userid", function(req, res) {
        //select u.FirstName, u.LastName, u.UserType, uc.Email from User as u inner join UserContact as uc on u.UserContactID = uc.UserContactID where UserID = 1;
        var query = "SELECT ??, ??, ??, ??, ?? FROM ?? as ?? inner join ?? as ?? on ??=?? WHERE ?? = ?";
        var table = ["u.FirstName", "u.LastName", "u.UserType", "uc.Email", "u.Admin", "User", "u", "UserContact", "uc", "uc.UserContactID", "u.UserContactID", "UserID", req.params.userid];
        query = mysql.format(query, table);
        connection.query(query, function(err, rows) {
            if (err) {
                console.log("/generalUser : " + err.message);
                res.status(401).end();
            } else {
                res.json({
                    "Error": false,
                    "Message": "Success",
                    "User": rows
                });
            }
        });
    });

    //Issue 4
    /**
     * Create Semester
     * Issue #4.1
     * Cesar Salazar
     */
    router.post("/CreateSemester", function(req, res) {
        var query = "insert into Semester (Name, StartDate,EndDate) values(?,?,?)";

        //Formating Dates
        var startDate = dateFormat(req.body.startDate, "yyyy-mm-dd");
        var endDate = dateFormat(req.body.endDate, "yyyy-mm-dd");

        if (req.body.endDate == null || req.body.startDate == null) {
            console.log("/CreateSemester : Dates must be defined");
            res.status(400).end();
        } else if (startDate > endDate) {
            console.log("/CreateSemester : StartDate cannot be grater than EndDate");
            res.status(400).end();
        } else {
            var table = [req.body.Name, startDate, endDate, req.body.OrganizationID];
            query = mysql.format(query, table);
            connection.query(query, function(err, response) {
                if (err) {
                    console.log("/CreateSemester : " + err.message);
                    res.status(400).end();
                } else {
                    console.log("/CreateSemester Succesfully");
                    res.json({
                        "SemesterID": response.insertId
                    });
                }
            });

        }

    });

    //Christian Alexander - Issue 4.2
    //Get Semester Information
    router.get("/semester/:semesterid", function(req, res) {
        var query = "select ??, ??, ??, ?? from ?? where ??=?";
        var table = ["SemesterID", "Name", "StartDate", "EndDate", "Semester",
            "SemesterID", req.params.semesterid
        ];

        query = mysql.format(query, table);

        connection.query(query, function(err, rows) {
            if (err) {
                console.log("/semester/email : " + err.message);

                res.status(400).end();
            } else {
                res.json({
                    "Error": false,
                    "Message": "Success",
                    "Course": rows
                });
            }
        });
    });

    //Christian Alexander - Issue 4.3
    //Get All Semester Information
    router.get("/semester", function(req, res) {
        var query = "select *  from ??";
        var table = ["Semester"];

        query = mysql.format(query, table);

        connection.query(query, function(err, rows) {
            if (err) {
                console.log("/semester : " + err.message);

                res.status(400).end();
            } else {
                res.json({
                    "Error": false,
                    "Message": "Success",
                    "Semesters": rows
                });
            }
        });
    });

    //Issue 5
    /**
     * Spring 3
     * Issue # 5.1
     * Create Course
     * Cesar Salazar
     */
    router.post("/course/create", function(req, res) {
        var query = "insert into ??(??,??,??) values(?,?,?)";
        var table = ["Course", "CreatorID", "Number", "Title",
            req.body.userid, req.body.number, req.body.title
        ];

        if (req.body.userid == null) {
            console.log("course/create : UserID cannot be null");
            res.status(400).end();
            return;
        }
        if (req.body.title == null) {
            console.log("course/create : Title cannot be null");
            res.status(400).end();
            return;
        }

        query = mysql.format(query, table);
        connection.query(query, function(err, response) {
            if (err) {
                console.log("/course/create : " + err.message);

                res.status(400).end();
            } else {
                getCreatedCourseID(function(result) {
                    res.json({
                        "result": result
                    });
                });
            }
        });
    });

    function getCreatedCourseID(callback) {
        var query = "SELECT LAST_INSERT_ID()";
        var table = [];
        query = mysql.format(query, table);

        connection.query(query, function(err, rows) {
            if (err) {
                res.status(400).end();
            } else {
                callback(rows);
            }
        });
    }

    //Christian Alexander - Issue 5.2
    //Create Course Section
    router.post("/course/createsection", function(req, res) {


        var query = "insert into ??(??,??,??,??) values(?,?,?,?)";
        var table = ["Section", "CourseID", "SemesterID", "Name",
            "Description", req.body.courseid, req.body.semesterid, req.body.name,
            req.body.description
        ];


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
        if (req.body.description == null) {
            console.log("course/createsection : Description cannot be null");
            res.status(400).end();
            return;
        }

        query = mysql.format(query, table);

        connection.query(query, function(err, response) {
            if (err) {
                console.log("/course/createsection : " + err.message);

                res.status(401).end();
            } else {
                getCreatedCourseID(function(result) {
                    res.json({
                        "result": result
                    });
                });
            }
        });
    });
    //Christian Alexander - 5.3
    //Add Student to Section
    /*TO DO = GET CourseID, ADD IT TO TABLE */
    router.put("/course/adduser", function(req, res) {
        if (req.body.email == null || req.body.courseid = null || req.body.coursesectionid == null) {
            console.log("course/adduser : Email cannot be null");
            res.status(400).end();
        }

        UserLogin.find({
            where: {
                UserID: req.body.UserID
            },
            attributes: ['UserID']
        }).then(function(userLogin) {
            if (userLogin.UserID == null) {
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
                        UserType: 'Student',
                        Admin: 0
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
                            SectionUser.create({
                                SectionID: req.body.sectionid,
                                UserID: userLogin.UserID,
                                UserRole: 'Student',
                                UserStatus: 'Active'
                            }).catch(function(err) {
                                console.log(err);
                            }).then(function(sectionUser) {
                                res.status(200).end();
                            })
                        })
                    });
                });
            } else {
                SectionUser.create({
                    SectionID: req.body.sectionid,
                    UserID: userLogin.UserID,
                    UserRole: 'Student',
                    UserStatus: 'Active'
                }).catch(function(err) {
                    console.log(err);
                }).then(function(sectionUser) {
                    res.json({
                        "UserID": sectionUser.UserID
                    });
                })
            }
        })
    });

    /**
     * getCourse
     * Issue # 5.4
     * Cesar Salazar
     */
    router.get("/course/:courseId", function(req, res) {
        var query = "SELECT ??,??, ?? FROM ?? Where ??=?";
        var table = ["CourseID", "Number", "Title", "Course", "CourseID", req.params.courseId];
        query = mysql.format(query, table);
        connection.query(query, function(err, result) {
            if (err) {
                console.log("/course : " + err.message);
                res.status(400).end();
            } else {
                //res.json({"Error": false, "Message": "Success", "Course": result});
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

            }
        });

    });


    /**
     * getCourseSection
     * Issue # 5.5
     * Cesar Salazar
     */
    router.get("/course/getsection/:sectionId", function(req, res) {

        var query = "SELECT ??, ?? FROM ?? where ?? = ?";
        var table = ["Name", "Description", "Section", "SectionID", req.params.sectionId];
        query = mysql.format(query, table);

        connection.query(query, function(err, rows) {
            if (err) {
                console.log("/course/getsection/ : " + err.message);
                res.status(400).end();
            } else {
                getSectionUsers(req.params.sectionId, function(result) {
                    res.json({
                        "result": rows,
                        "UserSection": result
                    });
                });
            }
        });

    });

    /**
     * Get list of users for the given section.
     * @param SectionID
     * @param callback
     */
    function getSectionUsers(SectionID, callback) {
        var query = "SELECT distinct ??, ??, ??, ??, ?? FROM ?? as ?? inner join ?? as ?? where ?? = ?";
        //select distinct  u.UserID, u.UserType, u.FirstName, u.MiddleInitial, u.LastName from SectionUser as us inner join User as u where SectionID = 2;
        var table = ["u.UserID", "u.UserType", "u.FirstName", "u.MiddleInitial", "u.LastName", "SectionUser", "us", "User", "u", "SectionID", SectionID];
        query = mysql.format(query, table);
        console.log(query);
        connection.query(query, function(err, rows) {
            if (err) {
                console.log("Method getSectionUsers : " + err.message);

                res.status(401).end();
            } else {
                callback(rows);
            }
        });
    }

    /**
     * UpdateCourse
     * Issue # 5.6
     * Cesar Salazar

     course ID
     course name
     course number
     course creator id
     */
    router.put("/course/update", function(req, res) {
        var query = "update ?? set ??=?, ??=? where ?? = ?";
        var table = ["Course", "Title", req.body.Title, "Number", req.body.Number, "CourseID", req.body.CourseID];

        if (req.body.title == null) {
            console.log("course/create : Title cannot be null");
            res.status(400).end();
            return;
        }

        if (req.body.CourseID == null) {
            console.log("course/create : CourseID cannot be null");
            res.status(400).end();
            return;
        }


        query = mysql.format(query, table);
        connection.query(query, function(err, rows) {
            if (err) {
                console.log("/course/update : " + err.message);

                res.status(400).end();
            } else {
                res.status(200).end();
            }
        });

    });

    //Christian Alexander - Issue 5.7
    //Update a Course Section
    router.put("/course/updatesection", function(req, res) {
        var query = "update ?? set ??=?, ??=? where ??=? and ?? = ?";
        var table = ["Section", "Name", req.body.name, "Description",
            req.body.description, "SectionID", req.body.sectionid,
            "SemesterID", req.body.semesterid
        ];

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

        query = mysql.format(query, table);
        connection.query(query, function(err, rows) {
            if (err) {
                console.log("/course/updatesection : " + err.message);

                res.status(401).end();
            } else {
                res.status(200).end();
            }
        });
    });
    /**
     * Delete User from Section
     * Issue # 5.8
     * Cesar Salazar

     UserID
     SectionID
     */
    router.delete("/course/deleteuser", function(req, res) {
        var query = "delete from ?? where ?? = ? and ?? = ?";
        var table = ["SectionUser", "UserID", req.body.userID, "SectionID", req.body.SectionID];
        query = mysql.format(query, table);
        connection.query(query, function(err, rows) {
            if (err) {
                console.log("/course/deleteuser : " + err.message);

                res.status(400).end()
            } else {
                res.status(200).end()
            }
        });

    });

    //Endpoint to get a user's courses
    router.get("/course/getCourses/:userid", function(req, res) {

        var query = "select ??, ?? from ?? as su inner join Section as s on s.SectionID = su.SectionID where ??=?";
        var table = ["s.CourseID", "s.SectionID", "SectionUser", "su.UserID", req.params.userid];
        query = mysql.format(query, table);
        connection.query(query, function(err, rows) {
            if (err) {
                res.status(401).end();
            } else {
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
            }
        });
    });


    //Endpoint to get start a password reset request
    router.post("/resetPassword", function(req, res) {
        if (req.body.email == null) {
            console.log("/resetPassword : Email not sent");
            req.status(401).end();
            return;
        }
        var guid = Guid.create();
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

    /**
     * Create reset password hash
     * Issue # 8.3
     * Cesar Salazar

     */
    router.get("/getPasswordResetRequest", function(req, res) {
        var query = "select ?? from ?? where ??=?";
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
        });
    });

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
                        Admin: 0
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
}

module.exports = REST_ROUTER;
