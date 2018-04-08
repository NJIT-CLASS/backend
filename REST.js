import {
    Assignment,
    AssignmentGrade,
    AssignmentInstance,
    AssignmentInstance_Archive,
    Assignment_Archive,
    Badge,
    BadgeInstance,
    Category,
    CategoryInstance,
    Comments,
    CommentsArchive,
    CommentsViewed,
    Contact,
    Course,
    CourseBackUp,
    EmailNotification,
    ExtraCredit,
    FileReference,
    Goal,
    GoalInstance,
    Level,
    LevelInstance,
    Notifications,
    Organization,
    PartialAssignments,
    ResetPasswordRequest,
    Section,
    SectionUser,
    SectionUserRecord,
    Semester,
    StudentRankSnapchot,
    SectionRankSnapchot,
    TaskActivity,
    TaskActivity_Archive,
    TaskGrade,
    TaskInstance,
    TaskInstance_Archive,
    TaskSimpleGrade,
    TestUser,
    User,
    UserContact,
    UserLogin,
    UserBadgeInstances,
    UserPointInstances,
    VolunteerPool,
    WorkflowActivity,
    WorkflowActivity_Archive,
    WorkflowGrade,
    WorkflowInstance,
    WorkflowInstance_Archive
} from './Util/models.js';

import {
    FILE_SIZE as file_size,
    MAX_NUM_FILES as max_files,
    ROLES,
    canRoleAccess
} from './Util/constant';
import {TOKEN_KEY, REFRESH_TOKEN_KEY, TOKEN_LIFE, REFRESH_TOKEN_LIFE} from './backend_settings';

var dateFormat = require('dateformat');
var Guid = require('guid');
var Promise = require('bluebird');
var password = require('./password');
var moment = require('moment');
const sequelize = require('./Model/index.js').sequelize;
var contentDisposition = require('content-disposition');
var Manager = require('./Workflow/Manager.js');
var Allocator = require('./Workflow/Allocator.js');
import Reallocator from './Workflow/Reallocator.js';
var TaskFactory = require('./Workflow/TaskFactory.js');
var TaskTrigger = require('./Workflow/TaskTrigger.js');
var Email = require('./Workflow/Email.js');
var Make = require('./Workflow/Make.js');
var Util = require('./Workflow/Util.js');
var Grade = require('./Workflow/Grade.js');
var FlatToNested = require('flat-to-nested');
var fs = require('fs');
var logger = require('./Workflow/Logger.js');
var LevelTrigger = require('./Workflow/LevelTrigger.js');
var jwt = require('jsonwebtoken');
const multer = require('multer'); //TODO: we may need to limit the file upload size
const randtoken = require('rand-token');

//In-memory object to store refresh tokens
const refreshTokens = {};
const USE_TOKENS = process.env.NODE_ENV === 'production';
var storage = multer({
    dest: './files/',
    limits: { //Max 3 files and total of 50MB
        fileSize: file_size,
        files: max_files
    }
});

let ra = new Reallocator();

Date.prototype.addDays = function(days) {
    var dat = new Date(this.valueOf());
    dat.setDate(dat.getDate() + days);
    return dat;
};

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


    ///////////////                 System Level APIs                   ///////////////////////////

    // endpoint for login function
    router.post('/login', function (req, res) {
        if (req.body.emailaddress == null || req.body.password == null) {
            console.log('/login : invalid credentials');
            res.status(400).end();
        }
        UserLogin.find({
            where: {
                Email: req.body.emailaddress
            },
            attributes: ['UserID', 'Email', 'Password', 'Pending', 'Attempts', 'Timeout', 'Blocked'],
            include: [{
                model: User,
                attributes: ['Admin', 'Instructor', 'Role']
            }]
        }).then(async function (user) {
            let current_timestamp = new Date(); // get current time of login
            if (user == null) { // deny if user doesn't exist
                console.log('/login: invalid credentials');
                return res.status(400).end();
            } else if (user.Blocked) { // deny if user is manually blocked
                console.log('/login: blocked login of ' + user.Email);
                return res.status(400).json({
                    'Error': true,
                    'Message': 'Timeout',
                    'Timeout': 60
                });
            } else if (user.Timeout != null && user.Timeout > current_timestamp) { // deny if there is a timeout in the future
                console.log('/login: prevented login due to timeout for ' + user.Email);
                let timeOut = new Date(user.Timeout) - new Date();
                timeOut = Math.ceil(timeOut / 1000 / 60);
                console.log(timeOut);
                return res.status(400).json({
                    'Error': true,
                    'Message': 'Timeout',
                    'Timeout': timeOut
                });
            } else {
                // if the password is correct
                if (user != null && await password.verify(user.Password, req.body.password)) {
                    // unset past timeout with correct password, login
                    // set attempts back to zero

                    UserLogin.update({
                        Attempts: 0,
                        Timeout: null,
                        LastLogin: new Date()
                    }, {
                        where: {
                            UserID: user.UserID
                        }
                    }).then(function (userLogin) {
                        // normal login (ideal scenario)

                        //Create JSON Web token for authentication
                        const payload = {
                            admin: user.User.Admin,
                            instructor: user.User.Instructor,
                            role: user.User.Role || ROLES.ADMIN, //TODO: Remove this
                            id: user.UserID
                        };
                        let token = jwt.sign(payload, TOKEN_KEY, {
                            expiresIn: TOKEN_LIFE
                        });
                        // let refreshToken = jwt.sign({}, REFRESH_TOKEN_KEY, {
                        //     expiresIn: REFRESH_TOKEN_LIFE
                        // });

                        let refreshToken = randtoken.uid(256);
                        refreshTokens[refreshToken] = [new Date().addDays(REFRESH_TOKEN_LIFE), user.UserID];
                        //refreshTokens[refreshToken] = [new Date(new Date().getTime() + 2*60000), user.UserID];
                        res.status(201).json({
                            'Error': false,
                            'Message': 'Success',
                            'UserID': user.UserID,
                            'Pending': user.Pending,
                            'Token':token,
                            'RefreshToken': refreshToken
                        });

                    }).catch(function (err) {
                        sequelize.options.omitNull = true;
                        console.log('/login: ' + err);
                        res.status(400).end();
                    });


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
                        res.status(400).json({
                            'Error': true,
                            'Message': 'Timeout',
                            'Timeout': minutes,
                        });
                    }).catch(function (err) {
                        console.log('/login: ' + err);
                        res.status(400).end();
                    });
                }
            }
        }).catch(function (err) {
            console.log('/login: ' + err);
            res.status(400).end();
        });
    });
    //-----------------------------------------------------------------------------------------------------

    router.post('/password/reset', function (req, res) {

        console.log('Password reset here');
        if (req.body.email === null || req.body.email === '') {
            return res.status(400).end();
        }

        return UserLogin.findOne({
            where: {
                Email: req.body.email
            }
        }).then(async(user) => {

<<<<<<< HEAD
                if (user == null) {
                    return res.status(400).end();
                }
                var temp_pass = await password.generate();
                user.Password = await password.hash(temp_pass);
                user.Pending = true;
                user.Timeout = null;
                user.Attempts = 0;
                console.log('found user', user);
                user.save().then((result) => {
                    console.log("temp pass: ", result);
                    let email = new Email();
                    email.sendNow(result.UserID, 'reset password', {'pass':temp_pass});
                    res.status(200).end();
                });
            })
=======
            if (user == null) {
                return res.status(400).end();
            }
            var temp_pass = await password.generate();
            user.Password = await password.hash(temp_pass);
            user.Pending = true;
            user.Timeout = null;
            user.Attempts = 0;
            user.Timeout = null;
            console.log('found user', user);
            user.save().then((result) => {
                console.log('temp pass: ', result);
                let email = new Email();
                email.sendNow(result.UserID, 'reset password', {'pass':temp_pass});
                res.status(200).end();
            });
        })
>>>>>>> 71704e9dfb1da00f92c07a20d8bb255a9ed1fae7
            .catch((err) => {
                console.log(err);
                res.status(500).end();
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

    router.post('/addInitialUser',async function (req, res) {
        let isThereOneUser = await User.findOne();
        if(isThereOneUser !== null){
            return res.status(400).end();
        }

        var email = new Email();
        if (req.body.email === null) {
            console.log('/adduser : Email cannot be null');
            res.status(400).end();
        }

<<<<<<< HEAD
        UserLogin.find({
            where: {
                Email: req.body.email
            },
            attributes: ['UserID']
        }).then(function (response) {
            if (response == null || response.UserID == null) {
                sequelize.query('SET FOREIGN_KEY_CHECKS = 0')

                    .then(function() {
                        User.create({
                            FirstName: req.body.firstname,
                            LastName: req.body.lastname,
                            Instructor: req.body.instructor,
                            Admin: req.body.admin
                        }).catch(function(err) {
                            console.log(err);
                            sequelize.query('SET FOREIGN_KEY_CHECKS = 1')
                                .then(function () {
                                    res.status(500).end();
                                });
                        }).then(async function(user) {
                            UserContact.create({
                                UserID: user.UserID,
                                FirstName: req.body.firstname,
                                LastName: req.body.lastname,
                                Email: req.body.email,
                                Phone: '(XXX) XXX-XXXX'
                            }).catch(function(err) {
                                console.log(err);
                                sequelize.query('SET FOREIGN_KEY_CHECKS = 1')
                                    .then(function () {
                                        res.status(500).end();
                                    });
                            }).then(async function(userCon) {
                                console.log('trustpass', req.body.trustpassword);
                                UserLogin.create({
                                    UserID: user.UserID,
                                    Email: req.body.email,
                                    Password: await password.hash(req.body.password),
                                    Pending: req.body.trustpassword ? false : true
                                }).catch(function(err) {
                                    console.log(err);
                                    sequelize.query('SET FOREIGN_KEY_CHECKS = 1')
                                        .then(function() {
                                            res.status(500).end();
                                        });
                                }).then(function(userLogin) {
                                    let email = new Email();
                                    email.sendNow(user.UserID, 'initial_user');
                                    sequelize.query('SET FOREIGN_KEY_CHECKS = 1')
                                        .then(function() {
                                            res.json({
                                                'Message': 'User has succesfully added'
                                            });
                                        });

                                });
                            });
                        });
                    });
            } else {
=======
        let generatedPassword = await password.hash(req.body.password);
        return sequelize.query('CALL addInitialUserToSystem (:firstName,:lastName,:Instructor,:Admin,:Role,:Email,:Phone,:Password,:Pending );', 
            {
                replacements: { 
                    firstName :req.body.firstname
                    ,lastName : req.body.lastname
                    ,Instructor : 1
                    ,Admin : 1
                    ,Role : ROLES.ADMIN
                    ,Email : req.body.email
                    ,Phone : '(XXX) XXX-XXXX'
                    ,Password : generatedPassword
                    ,Pending :0
                }
            })
            .then(function(queryResult){
                
                let email = new Email();
                email.sendNow(queryResult[0].UserID, 'invite user', { pass:'[user defined]'});
               
>>>>>>> 71704e9dfb1da00f92c07a20d8bb255a9ed1fae7
                res.json({
                    'Message': 'User has succesfully added'
                });
            })
            .catch(function(err){
                console.log(err);
                res.status(500).end();
            });

                               
    });

    router.get('/test', async function (req, res) {

        // var tf = new TaskFactory();
        // var make = new Make();
        //var users = await make.allocateUsers(1, 3);
        // var alloc = new Allocator();


        // var grade = new Grade();
        // var instructor = await alloc.findInstructor(3);
        // console.log(instructor);

        // var grades = await grade.getStudentSimpleGrade(1, 1);

        // res.json({
        //     error: false,
        //     grades: grades
        // });

        // let email = new Email();
        // let data = {
        //     pass: '1234567'
        // };
        // email.sendNow(70, 'initial_user');
        // email.sendNow(73, 'initial_user');

        let task = await TaskInstance.find({
            where:{
                TaskInstanceID: 1
            },
            attributes: ['AssignmentInstanceID'],
            include: [{
                model: AssignmentInstance,
                include: [{
                    model: Section,
                    include:[{
                        model:Course
                    }]
                }]
            }]
        });

        res.json({
            'Task' : task
        })
        // email.sendNow(70, 'invite user', data);
        // email.sendNow(70, 'new task');
        // email.sendNow(70, 'late');
        // email.sendNow(70, 'reset password', data);

        //grade.addSimpleGrade(1);
        // grade.addTaskGrade(1, 99, 100);
        // await grade.addWorkflowGrade(1, 3, 99);
        //await grade.addAssignmentGrade(1, 3, 99);
        res.status(200).end();
    });

    router.post('/refreshToken',async function(req,res){
        let refreshToken = req.body.refreshToken;
        let token = req.body.token || req.query.token || req.headers['x-access-token'];
        let userId = req.body.userId;

        if(refreshToken){
            if(refreshToken in refreshTokens){
                // jwt.verify(refreshToken,TOKEN_KEY, async function(err, decoded) {
                //let expDate = refreshTokens[refreshToken][0];
                if (Date.now() >= refreshTokens[refreshToken][0]) {

                    console.log('Expired  refresh Token');
                    delete refreshTokens[refreshToken];
                    return res.status(400).end();
                }

                let decodedToken = jwt.decode(token, TOKEN_KEY);
                var userIDFromToken = decodedToken.id;
                var userIDFromMemory = refreshTokens[refreshToken][1];
                if(userIDFromToken === userId && userIDFromMemory  === userId ){
                    const user = await User.findOne({
                        where: {
                            UserID: userId
                        },
                        attributes: ['UserID','Admin', 'Instructor']
                    });

                    const payload = {
                        admin: user.Admin,
                        instructor: user.Instructor,
                        id: user.UserID
                    };
                    let token = jwt.sign(payload, TOKEN_KEY, {
                        expiresIn: TOKEN_LIFE
                    });

                    return res.status(200).json({
                        Token: token
                    });
                } else {

                    return res.status(400).end();
                }

                //});

            } else {
                return res.status(400).end();

            }
        } else {
            return res.status(400).end();
        }
    });
    ////////////----------------   END System Level APIs                           ////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////

    //Middleware to verify token
    router.use(function(req,res,next){
        if(!USE_TOKENS){
            req.user = {
                role: ROLES.ADMIN
            };
            next();
            return;
        }
        let token = req.body.token || req.query.token || req.headers['x-access-token'];
        if (token) {
            jwt.verify(token,TOKEN_KEY, function(err, decoded) {
                
                if (err) {
                    if(err.name == 'TokenExpiredError'){
                        console.log('Expired Token');
                        return res.status(400).end();
                    } else {
                        console.log(err);
                        return res.status(400).json({
                            success: false,
                            message: 'Failed to authenticate token.'
                        });
                    }

                } else {
                    req.user = decoded;
                    next();
                }
            });
        }
        else {
            return res.status(400).json({
                success: false,
                message: 'No token provided.'
            });

        }
    });


    router.use(function(req,res,next){
        if(canRoleAccess(req.user.role, ROLES.GUEST)){
            next();
        } else {
            return res.status(401).end();
        }
    });
    //-------------------------------------------------------------------
    ////////////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////                 Guest Level APIs
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
                res.status(400).end();
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
                res.status(400).end();
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
                    res.status(400).end();
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
            attributes: ['UserID', 'FirstName', 'LastName', 'Instructor', 'Admin', 'Role'],
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
            res.status(400).end();
        });

    });

    //-----------------------------------------------------------------------------------------------------

    router.post('/update/password', function (req, res) {
        let email = new Email();
        if (req.body.userId === null || req.body.oldPasswd === null || req.body.newPasswd === null) {
            console.log('/update/password : Missing attributes');
            res.status(400).json({error:'Missing Attributes'}).end();
        } else if (req.body.oldPasswd == req.body.newPasswd) {
            console.log('/update/password : Same password');
            res.status(400).json({error:'New Password cannot match old password.'}).end();
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
                        email.sendNow(userLogin.UserID, 'new password');
                        res.status(200).json({error:false}).end();
                    }).catch(function (err) {
                        console.log(err);
                        res.status(400).json({error:'Password could not be updated.'}).end();
                    });

                } else {
                    console.log('/update/password: Password not match');
                    res.status(400).json({error:'Current password does not match.'}).end();
                }
            });
        }

    });

    ///////////////////////////
    ////////////----------------   END Guest APIs                           ////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////
    router.use(function(req,res,next){
        if(!USE_TOKENS){
            next();
            return;
        }

        if(canRoleAccess(req.user.role, ROLES.PARTICIPANT)){
            next();
        } else {
            return res.status(401).end();
        }
    });
    ////////////////////////////////////////////////////////////////////////////////////////////////////
    ///////////////                 Participant Level APIs                   ///////////////////////////

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
        console.log('Calling assignment create');
        var taskFactory = new TaskFactory();
        if (req.body.partialAssignmentId == null) {
            PartialAssignments.create({
                PartialAssignmentName: req.body.assignment.AA_name,
                UserID: req.body.userId,
                CourseID: req.body.courseId,
                Data: req.body.assignment
            }).then((result) => {

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
    //---------------------------------------------------------------------------
    router.get('/notifications/load',async function(req, res) {
        console.log('/notifications/load : was called');

        var v = await VolunteerPool.findAll({
            where: {
                status: 'pending'
            },
            attributes: ['volunteerpoolID']
        }).then(function(rows) {
            var arrayLength = rows.length;
            for (var i = 0; i < arrayLength; x++) {
                Notifications.create({
                    VolunteerpoolID: rows[i].volunteerpoolID
                });
            }
        }).catch(function(err) {
            console.log('/notifications/load/:UserID + volunteerpool ' + err);
            res.status(400).end();
        });

        var f = await Comments.findAll({
            where: {
                Flag: 1
            },
            attributes: ['commentsID','UserID']
        }).then(function(rows2) {
            var arrayLength = rows2.length;
            for (var j = 0; j < arrayLength; j++) {
                Notifications.create({
                    CommentsID: rows[j].CommentsID,
                    UserID: rows[j].UserID,
                    Flag: 1
                });
            }
        }).catch(function(err) {
            console.log('/notifications/load/:UserID + volunteerpool ' + err);
            res.status(400).end();
        });


        res.json({
            'Error': false,
            'Message': 'Success',
            'volunteer': v,
            'comments-flag': f,

        });

    });
    //---------------------------------------------------------------------------
    router.get('/notifications/all', function(req, res) {
        console.log('/notifications/all: was called');

        Notifications.findAll({
            where: {
                Dismiss: null
            }
        }).then(function(rows) {
            res.json({
                'Error': false,
                'Message': 'Success',
                'Notifications': rows
            });
        }).catch(function(err) {
            console.log('/notifications/all ' + err.message);
            res.status(400).end();
        });

    });
    //---------------------------------------------------------------------------
    router.get('/notifications/user/:UserID', function(req, res) {
        console.log('/notifications/user/:UserID was called');

        Notifications.findAll({
            where: {
                UserID: req.params.UserID,
                Dismiss: null
            }
        }).then(function(rows) {
            res.json({
                'Error': false,
                'Message': 'Success',
                'Notifications': rows
            });
        }).catch(function(err) {
            console.log('/notifications/user/:UserID' + err.message);
            res.status(400).end();
        });

    });
    //---------------------------------------------------------------------------
    router.get('/notifications/dismiss/:notificationsID', function(req, res) {
        console.log('/notifications/dismiss/:notificationsID was called');

        Notifications.update({
            Dismiss:1
        },{
            where: {
                NotificationsID: req.params.notificationsID
            }
        }).then(function(rows) {
            res.json({
                'Error': false,
                'Message': 'Success'
            });
        }).catch(function(err) {
            console.log('/notifications/dismiss/:notificationsID' + err.message);
            res.status(400).end();
        });

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
            res.status(400).json({
                'Error': true
            });
        });

    });

    //Endpoint to get the data from a partial assignment for the assignment editor
    router.get('/partialAssignments/byId/:partialAssignmentId', function (req, res) {

        PartialAssignments.find({
            where: {
                PartialAssignmentID: req.params.partialAssignmentId,

            }
        }).then(result => {
            console.log(result);
            res.json({
                'Error': false,
                'PartialAssignment': result
            });
        }).catch(result => {
            console.log(result);
            res.status(400).json({
                Error: true
            });
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
            res.status(400).json({
                Error: true
            });

        });
    });

    //Endpoint to get a user's active assignment instances by the section
    router.get('/getActiveAssignmentsForSection/:sectionId', function (req, res) {
        console.log(`/getActiveAssignmentsForSection/:sectionId: Finding Assignments for Section ${req.params.sectionId}`);
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
            console.log('/getActiveAssignmentsForSection/:sectionId: Assignments have been found!');
            res.json({
                'Error': false,
                'Assignments': result
            });
        }).catch(function (err) {
            console.log('/getActiveAssignmentsForSection/' + req.params.sectionId + ': ' + err);
            res.status(400).json({
                Error: true
            });
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
            res.status(400).end();
        });
    });

    router.post('/files/upload/:type?', function (req, res) {
        console.log('File upload:', req.body);
        let successfulFiles = [];
        let unsuccessfulFiles = [];

        Promise.mapSeries(req.body.files, (file) => {
            return FileReference.create({
                UserID: req.body.userId,
                Info: file,
                LastUpdated: new Date(),
            }).then(function (result) {
                successfulFiles.push(file);
                return {File: file, FileID: result.FileID};
            }).catch(function (err) {
                unsuccessfulFiles.push(file);
                return { File: file, Error: err };
            });
        }).then(results => {
            console.log(results);
            let newFileIDs = results.map(instanceInfo => instanceInfo.FileID);
            switch (req.params.type) {
            case 'task':
                return TaskInstance.find({
                    where: {
                        TaskInstanceID: req.body.taskInstanceId
                    }
                }).then(ti => {
                    let newFilesArray = JSON.parse(ti.Files) || [];
                    newFilesArray = newFilesArray.concat(newFileIDs);

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
                        return res.status(200).json({
                            SuccessfulFiles: successfulFiles,
                            UnsuccessfulFiles: unsuccessfulFiles
                        });
                    });
                })
                    .catch(er => {
                        logger.log('error', 'file task info not uploaded successfully', er);
                        res.status(400).end();
                    });
                break;
            case 'profile-picture':
                UserContact.update({
                    ProfilePicture: newFileIDs[0]
                }, {
                    where: {
                        UserID: req.body.userId
                    }
                }).then(function (done) {
                    logger.log('info', 'user updated with new profile pictures info', {
                        res: done
                    });
                    // respond with file info
                    return res.status(200).json({
                        SuccessfulFiles: successfulFiles,
                        UnsuccessfulFiles: unsuccessfulFiles
                    });
                })
                    .catch(er => {
                        logger.log('error', 'profile-picture info not uploaded successfully', er);
                        res.status(400).end();
                    });
                break;
            default:
                res.status(200).json({
                    FileID: result.FileID
                });
                break;
            }
        });

    });


    router.post('/file/upload/:type?', function (req, res) {
        console.log('File upload:', req.body);
        FileReference.create({
            UserID: req.body.userId,
            Info: req.body.fileInfo,
            LastUpdated: new Date(),
        }).then(function (result) {

            switch (req.params.type) {
            case 'task':
                TaskInstance.find({
                    where: {
                        TaskInstanceID: req.body.taskInstanceId
                    }
                }).then(ti => {
                    let newFilesArray = JSON.parse(ti.Files) || [];
                    newFilesArray = newFilesArray.concat([result.FileID]);

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
                        res.status(200).json({
                            FileID: result.FileID
                        });
                    });
                })
                    .catch(er => {
                        logger.log('error', 'file task info not uploaded successfully', er);
                        res.status(400).end();
                    });
                break;
            case 'profile-picture':
                UserContact.update({
                    ProfilePicture: [result.FileID]
                }, {
                    where: {
                        UserID: req.body.userId
                    }
                }).then(function (done) {
                    logger.log('info', 'user updated with new profile pictures info', {
                        res: done
                    });
                    // respond with file info
                    res.status(200).json({
                        FileID: result.FileID
                    });
                    return done;
                })
                    .catch(er => {
                        logger.log('error', 'profile-picture info not uploaded successfully', er);
                        res.status(400).end();
                    });
                break;
            default:
                res.status(200).json({
                    FileID: result.FileID
                });
                break;
            }

        })
            .catch(function (err) {
                logger.log('error', 'file info not uploaded successfully');
                res.status(400).end();
            });
    });

    router.get('/file/download/:fileId', function (req, res) {
        FileReference.findOne({
            where: {
                FileID: req.params.fileId
            }
        }).then(function (result) {
            res.status(200).json(result);
        })
            .catch(function (err) {
                logger.log('error', 'file info not downloaded successfully');
                res.status(400).json(result);
            });
    });

    router.delete('/file/delete/:fileId', async function (req, res) {
        let taskId = req.body.taskId || '';
        var userId = req.body.userId;
        if(userId === null || userId === ''){
            logger.log('error', '/file/delete User Not Authorized');
            return res.status(400).end();
        }
        logger.log('info', 'deleting file info from database with FileID: ',req.params.fileId, req.body);
        FileReference.findOne({
            where: {
                FileID: req.params.fileId,
                UserID: userId
            }
        }).then(async function (fileResult) {
            var fileInfo = fileResult;
            fileResult.destroy();

            if(taskId !== ''){
                let result = await TaskInstance.findOne({
                    where: {
                        TaskInstanceID: taskId
                    },
                    attributes: ['Files']
                }).catch(err => {
                    logger.log('error', 'could not get files', err, req.params);
                    return res.status(400).end();
                });

                let fileArray = result.Files;

                fileArray = JSON.parse(fileArray);
                fileArray.splice(fileArray.indexOf(req.body.fileId), 1);


                await TaskInstance.update({
                    Files: fileArray
                },
                {
                    where: {
                        TaskInstanceID: taskId
                    }
                });

                return res.json(fileInfo);
            }

        })
            .catch(function (err) {
                logger.log('error', 'file info not deleted successfully', err);
                res.status(400).end();
            });
    });

    router.get('/getCourseSections/:courseID', function (req, res) {

        let whereOptions = {
            CourseID: req.params.courseID
        };

        if (req.query.semesterID != null) {
            whereOptions.SemesterID = req.query.semesterID;
        }

        Section.findAll({
            where: whereOptions,
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
                    attributes: ['Number', 'Name']
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

    router.post('/getUserID/', function (req, res) {
        UserLogin.find({
            where: {
                Email: req.body.email
            }
        }).then(function (user) {
            if(user === null){
                UserContact.find({
                    Email: req.body.email
    
                }).then(function(userCon) {
                    if(userCon === null){
                        res.json({
                            'UserID': null
                        });
                    } else{
                        res.json({
                            'UserID': userCon.UserID
                        });
                    }
                });
            } else {
                res.json({
                    'UserID': user.UserID
                });
            }
        }).catch(function (e) {
            console.log('getUserID ' + e);
           

            res.json({
                'UserID': null
            });
                

        });
    });

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
            .catch(function(err) {
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
            return res.status(400).end();
        }

        //Update points for student as they submit tasks
        let taskFactory = new TaskFactory;
        taskFactory.updatePointInstance(ti.TaskActivity.Type, ti.AssignmentInstanceID, req.body.userid);

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
                        attributes: ['SectionID', 'Name'],
                        include: [{
                            model: Course,
                            attributes: ['Name', 'CourseID', 'Number']
                        }]

                    }, {
                        model: Assignment,
                        attributes: ['Name']
                    }]
                },
                /*TaskInstance - > AssignmentInstance - > Section - > Course */
                {
                    model: TaskActivity,
                    attributes: ['Name', 'DisplayName', 'Type', 'AllowRevision'],
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
            res.status(400).end();

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
            attributes: ['TaskInstanceID', 'UserID', 'WorkflowInstanceID', 'StartDate', 'EndDate', 'Status', 'ActualEndDate'],
            include: [ ///// Need new mappings in index.js AssignmentInstance -> Assignment, Assignment ::=> AssignmentInstance
                {
                    model: AssignmentInstance,
                    attributes: ['AssignmentInstanceID', 'AssignmentID'],
                    include: [{
                        model: Section,
                        attributes: ['SectionID', 'Name'],
                        include: [{
                            model: Course,
                            attributes: ['Name', 'CourseID', 'Number']
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
            res.status(400).end();

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
                res.status(400).end();
            });
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
        }).then(function(assignments) {
            res.json({
                'Error': false,
                'Message': 'Success',
                'Assignments': assignments

            });
        }

        );
    });

    router.get('/SectionsByUser/:userId', function (req, res) {

        SectionUser.findAll({
            where: {
                UserID: req.params.userId
            },
            attributes: ['SectionID','Role'],
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
            res.status(400).end();
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
            attributes: ['SectionUserID', 'UserID', 'Active', 'Volunteer', 'Role']
        }).then(function (SectionUsers) {
            console.log('/sectionUsers called');
            if (req.params.role === 'Student') {
                SectionUsers = SectionUsers.map(user => {
                    let newUser = {
                        UserID: user.UserID,
                        SectionUserID: user.SectionUserID,
                        Active: user.Active,
                        Role: user.Role,
                        User: user.User,
                        UserLogin: user.UserLogin
                    };
                    if (user.User.VolunteerPools.length != 0) {
                        newUser.Volunteer = true;
                        newUser.Status = user.User.VolunteerPools[0].status;

                    } else {
                        newUser.Volunteer = false;
                        newUser.Status = 'Inactive';

                    }
                    return newUser;
                });
            }
            return res.json({
                'Error': false,
                'SectionUsers': SectionUsers
            });
        });
    });

    //End point to add mutliple users to a section and invite any new ones
    router.post('/sectionUsers/addMany/:sectionid', function (req, res) {
        //expects - users
<<<<<<< HEAD
        return sequelize.query('SET FOREIGN_KEY_CHECKS = 0')
            .then(function () {
                Promise.mapSeries(req.body.users, (userDetails) => {
                    return UserLogin.find({
                        where: {
                            Email: userDetails.email
                        },
                        attributes: ['UserID']
                    }).then(function(response) {
                        if (response == null || response.UserID == null) {
                            return sequelize.transaction(function(t) {
                                let role = null;
                                switch(userDetails.role){
                                case 'Instructor':
                                    role = ROLES.TEACHER;
                                    break;
                                case 'Student':
                                    role = ROLES.PARTICIPANT;
                                    break;
                                case 'Observer':
                                    role = ROLES.GUEST;
                                }
                                return User.create({
                                    FirstName: userDetails.firstName,
                                    LastName: userDetails.lastName,
                                    Instructor: userDetails.role === 'Instructor',
                                    Role: role
                                }, {
                                    transaction: t
                                }).then(async function(user) {
                                    let temp_pass = await password.generate();
                                    return UserContact.create({
                                        UserID: user.UserID,
                                        FirstName: userDetails.firstName,
                                        LastName: userDetails.lastName,
                                        Email: userDetails.email,
                                        Phone: '(XXX) XXX-XXXX'
                                    }, {
                                        transaction: t
                                    }).then(async function(userCon) {
                                        let testHash = await password.hash(temp_pass);
                                        return UserLogin.create({
                                            UserID: user.UserID,
                                            Email: userDetails.email,
                                            Password: testHash
                                        }, {
                                            transaction: t
                                        }).then(function(userLogin) {

                                            return SectionUser.create({
                                                SectionID: req.params.sectionid,
                                                UserID: userLogin.UserID,
                                                Active: userDetails.active,
                                                Volunteer: userDetails.volunteer,
                                                Role: userDetails.role
                                            }, {
                                                transaction: t
                                            }).then(function(sectionUser) {
                                                console.log('Creating user, inviting, and adding to section');
                                                logger.log('info', 'post: sectionUsers/:sectionid, user invited to system', {
                                                    req_body: userDetails
                                                });

                                                let email = new Email();
                                                email.sendNow(user.UserID, 'invite user', {'pass': temp_pass, 'sectionid': req.params.sectionid});

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
=======
        return Promise.mapSeries(req.body.users, async function(userDetails) {
>>>>>>> 71704e9dfb1da00f92c07a20d8bb255a9ed1fae7

            let role = null;
            switch(userDetails.role){
            case 'Instructor':
                role = ROLES.TEACHER;
                break;
            case 'Student':
                role = ROLES.PARTICIPANT;
                break;
            case 'Observer':
                role = ROLES.GUEST;
            }

            let temp_pass = await password.generate();
            let hashedPassword = await password.hash(temp_pass);
                    
            return sequelize.query('CALL addUserToSection (:FirstName,:LastName,:Instructor,:Admin,:Role,:Email,:Phone,:Password,:Pending,:SectionID,:Active,:Volunteer,:SectionRole )', 
                {
                    replacements: { 
                        FirstName : (userDetails.firstName || '')
                        ,LastName :( userDetails.lastName || '' )
                        ,Instructor : userDetails.role === 'Instructor' ? 1 : 0
                        ,Admin : 0
                        ,Role : role
                        ,Email : userDetails.email
                        ,Phone : '(XXX) XXX-XXXX'
                        ,Password : hashedPassword
                        ,Pending :1
                        ,SectionID : req.params.sectionid
                        ,Active : (userDetails.active || 1)
                        ,Volunteer :(userDetails.volunteer || 1 )
                        ,SectionRole : userDetails.role
                    }
                })
                .then(function(queryResult){
                    let email = new Email();
                    email.sendNow(queryResult[0].UserID, 'invite user', {'pass': temp_pass});
                })
                .catch(function (err) {
                    console.error(err);
                    logger.log('error', 'post: sectionUsers/:sectionid, user invited to system', {
                        req_body: req.body,
                        firstName: userDetails.firstName,
                        error: err
                    });
                    
                    res.status(500).end();   
                });
        })
            .then(function(done){
                console.log('Promise.map Results: ', done);
                res.status(200).end();
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
            console.log('User response:', response.UserID);
            if (response == null || response.UserID == null) {
                sequelize.query('SET FOREIGN_KEY_CHECKS = 0')
                    .then(function () {
                        return sequelize.transaction(function (t) {

                            let role = null;
                            switch(req.body.role){
                            case 'Instructor':
                                role = ROLES.TEACHER;
                                break;
                            case 'Student':
                                role = ROLES.PARTICIPANT;
                                break;
                            case 'Observer':
                                role = ROLES.GUEST;
                            }
                            return User.create({
                                FirstName: req.body.firstName,
                                LastName: req.body.lastName,
                                Instructor: req.body.role === 'Instructor',
                                Role: role
                            }, {
                                transaction: t
                            })
                                .catch(function(err) {
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
                                    let temp_pass = await password.generate();
                                    return UserContact.create({
                                        UserID: user.UserID,
                                        FirstName: req.body.firstName,
                                        LastName: req.body.lastName,
                                        Email: req.body.email,
                                        Phone: '(XXX) XXX-XXXX'
                                    }, {
                                        transaction: t
                                    }).catch(function(err) {
                                        console.error(err);
                                        logger.log('error', 'post: sectionUsers/:sectionid, user invited to system', {
                                            req_body: req.body,
                                            error: err
                                        });
                                        sequelize.query('SET FOREIGN_KEY_CHECKS = 1')
                                            .then(function() {
                                                res.status(500).end();
                                            });
                                    })
                                        .then(async function(userCon) {
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
                                                email.sendNow(user.UserID, 'invite user new to system', {'pass':temp_pass, 'sectionid': req.params.sectionid});
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
                                                        .then(function() {
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
                            if(req.body.role == 'Instructor'){
                                //making Teacher role
                                User.update({
                                    Role: ROLES.TEACHER
                                },{
                                    where: {
                                        UserID: response.UserID
                                    }
                                }
                                ).then(function(makeTeacher){
                                    res.json({
                                        success: true,
                                        message: 'existing user'
                                    });
                                });
                            } else {
                                res.json({
                                    success: true,
                                    message: 'existing user'
                                });
                            }
                            
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
    
    router.post('/sectionUsers/changeActive/:sectionUserID', (req, res) => {
        // TODO:  This API does a simple database update, but it may need
        // to do some special reallocation to deal with inactive students
        //
        var newActiveStatus = true;
        if (req.body.active != null) {
            newActiveStatus = req.body.active;
        }
        SectionUser.update({
            Active: newActiveStatus
        }, {
            where: {
                SectionUserID: req.params.sectionUserID
            }
        }).then(sectionUser => {
            res.status(201).json({
                message: 'Success',
                SectionUserID: sectionUser.SectionUserID
            });
        }).catch(err => {
            logger.log('error', 'post: /sectionUser/changeActive/, user active status not set', {
                error: err,
                req_params: req.params,
            });
            res.status(400).end();
        });
    });
    /* not currently working  mss86   
    router.post('/sectionUsers/changeActive/:sectionUserID',async (req, res) => {
        //
         //When students is made Inactive, Its Assigment's get reallocated to voluenteers/instructor
         //
        var newActiveStatus = true;
        if (req.body.active != null) {
            newActiveStatus = req.body.active;
        }
        try{
            var sectionUser = await SectionUser.update(
                {
                    Active: newActiveStatus
                }, 
                {
                    where: {
                        SectionUserID: req.params.sectionUserID
                    }
                });
                if(newActiveStatus==false){ // reallocate the student with voluenteers or lastly instructor
                        try{
                            var alloc = new Allocator([],0);
                            alloc.reallocate_all_ai_of_user(req.params.sectionUserID);
                        }catch(e){
                            logger.log('error','post: /sectionUser/changeActive/  failed to reallocate student',e);
                            res.status(500).end();
                        }
                    }
                res.status(201).json({
                    message: 'Success',
                    SectionUserID: sectionUser.SectionUserID
                });
            }catch (e) {
                logger.log('error', 'post: /sectionUser/changeActive/, user active status not set', {
                    error: e,
                    req_params: req.params,
                });
                res.status(400).end();
            }
    });
*/
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

    router.get('/task/files/:taskId', async function (req, res) {

        let result = await TaskInstance.findOne({
            where: {
                TaskInstanceID: req.params.taskId
            },
            attributes: ['Files']
        }).catch(err => {
            logger.log('error', 'could not get files', err, req.params);
            return res.status(400).end();
        });

        /*if(result.Files == null){
        return res.json({
        Files: []
        });
        } else {
        return res.json({
        Files: result.Files
        });
        }*/


        let fileArray = [];

        await Promise.map(JSON.parse(result.Files), async file => {
            var fr = await FileReference.findOne({
                where: {
                    FileID: file
                },
                attributes: ['FileID','Info']
            });

            fileArray.push(fr);
        });



        return res.json({
            Files: fileArray
        });

    });


    //get Section information
    router.get('/section/info/:sectionId',async function(req,res) {
        let sectionInfo = await Section.findOne({
            where: {
                SectionID: req.params.sectionId
            },
            include: [{
                model: Course
            },{
                model:Semester
            }]
        });

        let activeAssignments = await AssignmentInstance.findAll({
            where: {
                SectionID: req.params.sectionId
            },
            attributes: ['AssignmentInstanceID', 'StartDate', 'EndDate'],
            include: [{
                model: Assignment,
                attributes: ['DisplayName']
            }]
        });

        let sectionUsers = await SectionUser.findAll({
            where: {
                SectionID: req.params.sectionId
            },
            attributes: ['UserID', 'Role', 'Active'],
            include: {
                model: User,
                attributes: ['FirstName', 'LastName']
            }
        });

        res.json({
            Section: sectionInfo,
            OngoingAssignments: activeAssignments,
            Users: sectionUsers
        });

    });

    //Endpoint to allocate students
    router.get('/allocate', function (req, res) {

        // var taskFactory = new TaskFactory();
        // //allocator.createInstances(1, 16);
        // taskFactory.createInstances(3, 13).then(function(done) {
        //     console.log('/getAssignToSection/allocate   All Done!');
        //     res.status(200).end();
        // }).catch(function(err) {
        //     console.log(err);
        //     res.status(400).end();
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

    // Grade reporting ==========================================================================

    router.post('/getUserAssignmentGrades', function(req, res){
        if(req.body.userID == null || req.body.sectionID == null){
            console.log(req);
            console.log('/getUserAssignmentGrades:userID : no user or section ID passed');
            res.status(400).end();
            return;
        }

        var json = {
            error:false,
            grades:[]
        };

        return SectionUser.findAll({
            where: {
                UserID:req.body.userID,
                SectionID:req.body.sectionID
            },
            attributes:['SectionUserID','Role','SectionID']
        }).then(function(response){
            if(!response) return;

            console.log('User grades called');
            return Promise.map(response, function(sectionIDs){
                if(!sectionIDs) return;

                var userSectionIDs=sectionIDs.toJSON();

                return AssignmentGrade.find({
                    where:{
                        SectionUserID:userSectionIDs.SectionUserID
                    },
                    attributes:['Grade','AssignmentGradeID','AssignmentInstanceID','Comments']
                }).then(function (grades){
                    if(!grades) return;
                    var gradesJSON = grades.toJSON();
                    gradesJSON['AssignmentDetails']={};
                    json.grades.push(gradesJSON);

                    return AssignmentInstance.find({
                        where:{
                            AssignmentInstanceID:gradesJSON.AssignmentInstanceID
                        },
                        attributes:['AssignmentID']
                    }).then(function (params){
                        if(!params) return;

                        return Assignment.find({
                            where:{AssignmentID:params.AssignmentID}
                        }).then(function (params){
                            if(!params) return;
                            gradesJSON.AssignmentDetails=params;
                        });
                    });
                    return grades;
                });
            });
        }).then(function(done){
            res.json(json);
        }).catch(function(error){
            res.status(400).end();
        });
    });

    // Grade reporting ==========================================================================



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
            attributes: ['AssignmentInstanceID', 'AssignmentID', 'SectionID'],
            include: [{
                model: Assignment
            },{
                model: Section,
                include: [{
                    model: Course,
                }]
            }],
        }).then( async function(response) {
            // console.log('res: ', response)
            if (response == null) {
                return res.json({
                    Error: true
                });
            }

            var wf = await WorkflowActivity.findAll({
                where:{
                    AssignmentID: response.AssignmentID,
                    
                },
                attributes: ['WorkflowActivityID','GradeDistribution']
            });
            var json = {
                Error: false,
                AssignmentInstance: response,
                WorkflowActivity: wf,
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
                }).then(function (done) {
                    console.log('then', 'json');
                    res.json(json);
                });
            });
        });
    });

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
            res.status(400).end();
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
            res.status(400).end();
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

                //Update Categories as new section is being created
                let taskFactory = new TaskFactory;
                taskFactory.createCategoryInstances(response.SemesterID, response.CourseID, response.SectionID);

                res.json({
                    'result': response
                });
            }).catch(function (err) {
                console.log('/course/createsection : ' + err.message);

                res.status(400).end();
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

                    .then(function() {
                        User.create({
                            FirstName: req.body.firstname,
                            LastName: req.body.lastname,
                            Role: req.body.role
                        }).catch(function(err) {
                            console.log(err);
                            sequelize.query('SET FOREIGN_KEY_CHECKS = 1')
                                .then(function () {
                                    res.status(500).end();
                                });
                        }).then(async function(user) {
                            UserContact.create({
                                UserID: user.UserID,
                                FirstName: req.body.firstname,
                                LastName: req.body.lastname,
                                Email: req.body.email,
                                Phone: '(XXX) XXX-XXXX'
                            }).catch(function(err) {
                                console.log(err);
                                sequelize.query('SET FOREIGN_KEY_CHECKS = 1')
                                    .then(function () {
                                        res.status(500).end();
                                    });
                            }).then(async function(userCon) {
                                console.log('trustpass', req.body.trustpassword);
                                UserLogin.create({
                                    UserID: user.UserID,
                                    Email: req.body.email,
                                    Password: await password.hash(req.body.password),
                                    Pending: req.body.trustpassword ? false : true
                                }).catch(function(err) {
                                    console.log(err);
                                    sequelize.query('SET FOREIGN_KEY_CHECKS = 1')
                                        .then(function() {
                                            res.status(500).end();
                                        });
                                }).then(function(userLogin) {
                                    let email = new Email();
                                    email.sendNow(user.UserID, 'invite user', '[user defined]');
                                    sequelize.query('SET FOREIGN_KEY_CHECKS = 1')
                                        .then(function() {
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
                                    email.sendNow(userLogin.UserID, 'invite user', {'pass':req.body.password});
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
            res.status(400).end();
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
                res.status(400).end();
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
            res.status(400).end();
        });

        function checkForDuplicateIDs(a) {
            var seen = {};
            var out = [];
            var len = a.length;
            var j = 0;
            for (var i = 0; i < len; i++) {
                var item = a[i];
                if (seen[item.CourseID] !== 1) {
                    seen[item.CourseID] = 1;
                    out[j++] = item;
                }
            }
            return out;
        }

        await sections.forEach(function (section) {
            //console.log(section.Section);
            if (section.Section !== null) {
                courses.push({
                    'CourseID': section.Section.Course.CourseID,
                    'Number': section.Section.Course.Number,
                    'Name': section.Section.Course.Name
                });
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
            res.status(400).end();
        });

        await createdCourses.forEach(function (course) {


            courses.push({
                'CourseID': course.CourseID,
                'Number': course.Number,
                'Name': course.Name
            });

        });

        res.json({
            'Error': false,
            'Message': 'Success',
            'Courses': checkForDuplicateIDs(courses)
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
            res.status(400).end();
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

    //Endpoint for all current task data and previous task data and put it in an array
    router.get('/superCall/:taskInstanceId', async function (req, res) {
        logger.log('info', 'get: /superCall/:taskInstanceId', {
            req_query: req.query,
            req_params: req.params
        });
        var view_constraint;
        var allocator = new TaskFactory();

        let taskActivityAttributes = ['TaskActivityID', 'Type', 'Rubric', 'Instructions', 'Fields', 'NumberParticipants', 'FileUpload', 'DisplayName', 'AllowRevision'];

        await allocator.findPreviousTasks(req.params.taskInstanceId, new Array()).then(async function (pre_tis) {

        //console.log('pre_tis!', pre_tis);
            var ar = new Array();
            if (pre_tis == null) {

                var ti = await TaskInstance.find({
                    where: {
                        TaskInstanceID: req.params.taskInstanceId
                    },
                    attributes: ['TaskInstanceID', 'Data', 'Status', 'Files', 'UserID'],
                    include: [{
                        model: TaskActivity,
                        attributes: taskActivityAttributes
                    }]
                });

                //console.log(result);
                ar.push(ti);
                res.json({
                    'previousTasksList': pre_tis,
                    'superTask': ar
                });
            } else {


                await Promise.mapSeries(pre_tis, async function (task) {
                    await TaskInstance.find({
                        where: {
                            TaskInstanceID: task
                        },
                        attributes: ['TaskInstanceID', 'Data', 'Status', 'Files', 'UserID', 'PreviousTask'],
                        include: [{
                            model: TaskActivity,
                        }]
                    }).then(async(result) => {
                    //console.log(result);
                    // check to see if the user has view access to this task in the history (workflow) and if not: immediately respond with error
                        ar.push(result);

                        view_constraint = await allocator.applyViewContstraints(res, req.query.userID, result);
                    });
                });

                if (view_constraint === false || view_constraint === undefined) {
                    var ti = await TaskInstance.find({
                        where: {
                            TaskInstanceID: req.params.taskInstanceId
                        },
                        attributes: ['TaskInstanceID', 'Data', 'Status', 'Files', 'UserID', 'PreviousTask'],
                        include: [{
                            model: TaskActivity,
                        }]
                    });
                    //console.log(ti);
                    //ar.push(ti);
                    // res.json({
                    //     error: false,
                    //     previousTasksList: pre_tis,
                    //     superTask: ar,
                    // });
                    //logger.log('debug', 'done collecting previous tasks');
                    //check to see if the user has view access to the current task (requested task) and if not: immediately respond with error
                    view_constraint = await allocator.applyViewContstraints(res, req.query.userID, ti);
                    if (view_constraint === false || view_constraint === undefined) {
                        if (res._headerSent) { // if already responded (response sent)
                            return;
                        }
                        // update data field of all tasks with the appropriate allowed version
                        ar = await allocator.applyVersionContstraints(ar, ti, req.query.userID);
                        ar.push(ti);
                        res.json({
                            error: false,
                            previousTasksList: pre_tis,
                            superTask: ar,
                        });

                    } else {
                        res.json(view_constraint);
                    }


                } else {
                    res.json(view_constraint);
                }
            }

        }).catch(function (err) {
            console.log(err);
            res.status(400).end();
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

        console.log('req.query.assignmentid', req.query.assignmentid);
        console.log('req.query.courseid', req.query.courseid);

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
            res.status(400).end();
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
                console.log('workflow.TaskActivityCollection', workflow.TaskActivityCollection);
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
                            'displayName': taskActivity.DisplayName,
                            'type': taskActivity.Type,
                            'defaults': taskActivity.DueType
                        });
                        taskCollection[workflow.WorkflowActivityID].sort(function (a, b) {
                            var x = a.taskActivityID < b.taskActivityID ? -1 : 1;
                            return x;
                        });

                    }).catch(function (err) {
                        console.log('/getAssignToSection: ', err);
                        res.status(400).end();
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
            res.status(400).end();
        });


    });

    //Endopint to assign an assignment to a section
    router.post('/getAssignToSection/submit/', async function (req, res) {
    //creates new allocator object
        var taskFactory = new TaskFactory();
        var manager = new Manager();
        var make = new Make();

        console.log('/getAssignToSection/submit/  Creating Assignment Instance...');
        logger.log('info', 'Assing TO Section submit', req.body);

        //create assignment instance
        await taskFactory.createAssignmentInstances(req.body.assignmentid, req.body.sectionIDs, req.body.startDate, req.body.wf_timing).then(async function (done) {
            console.log('/getAssignToSection/submit/ All Done!');
            console.log('Done value:', done);
            console.log(typeof req.body.wf_timing, req.body.startDate);
            if (moment(req.body.startDate) <= new Date()) {
                await Promise.mapSeries(req.body.sectionIDs, async function (secId) {
                    await Promise.mapSeries(done, async function(assignmentInstanceId){
                        console.log('Assignment Instance ID?:', assignmentInstanceId);
                        await make.allocateUsers(secId, assignmentInstanceId);
                    });
                });
            }
            res.status(200).end();
        }).catch(function (err) {
            console.log(err);
            res.status(400).end();
        });

    });

    router.get('/openRevision/:taskInstanceID', function (res, req) {

        if (req.params.taskInstanceID == null) {
            console.log('/openRevision/:taskInstanceID TaskInstanceID cannot be empty!');
            res.stats(400).end();
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
                    res.stats(400).end();
                } else {
                    ti_result.Status = 'pending';
                }
            }).catch(function (err) {
                console.log(err);
                res.status(400).end();
            });
        });
    });

    router.get('/openRevision/save', function (res, req) {
        if (req.body.data == null) {
            console.log('/openRevision/save: data is missing');
            res.status(400).end();
        }
        if (req.body.taskInstanceID == null) {
            console.log('/openRevision/save TaskInstanceID cannot be empty!');
            res.stats(400).end();
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
            res.status(400).end();
        }
        if (req.body.taskInstanceID == null) {
            console.log('/openRevision/save TaskInstanceID cannot be empty!');
            res.stats(400).end();
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
            res.status(400).end();
            return;
        }

        var realloc = new Allocator([], 0);

        realloc.reallocate(req.body.taskid, req.body.users);
    });

    router.post('/reallocate/task_to_user/', async(req, res) => {
        // console.log('req.body.ti_id', req.body.ti_id);
        // console.log('req.body.user_id,', req.body.user_id,);
        // console.log('req.body.isExtraCredit,', req.body.isExtraCredit,);

        let ti = await TaskInstance.find({
            where: {
                TaskInstanceID: req.body.ti_id
            }
        });

        //let response = await ra.reallocate_user_to_task(ti, req.body.user_id, req.body.isExtraCredit);
        var a = new Allocator([],0);  // use updated version
        let response = await a.reallocate_user_to_task(ti, req.body.user_id, req.body.isExtraCredit);
        console.log('respose back', response);
        res.json(response);
    });

    router.post('/reallocate/tasks', async(req, res) => {
        console.log('req.body.tasks', req.body.tasks);
        console.log('req.body.users', req.body.users);
        console.log('req.body.sectionID', req.body.sectionID);
        console.log('req.body.option', req.body.option);
        console.log('req.body.isExtraCredit', req.body.isExtraCredit);

        let response = await ra.reallocate_tasks(req.body.tasks, req.body.users, req.body.sectionID, undefined, req.body.option, req.body.isExtraCredit);

        res.json(response);
    });

    router.post('/createSectionUserRecord', async function (req, res) {
        var levelTrigger = new LevelTrigger();

        await levelTrigger.createSectionUserRecord(req.body.sectionUserID);

        res.status(200).end();
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
            res.status(400).end();
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
            res.status(400).end();
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
            res.status(400).end();
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
            res.status(400).end();
        });
    });

    router.delete('/delete/user/:userID', (req, res) => {
        console.log('deleting user', req.params.userID);

        return sequelize.transaction(function(t) {
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
        else{
            // var va2 = va[0];
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
            res.status(400).end();
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
            'AssignmentInfo': everyones_work
        });
    });
    //---------------------------------------------------------------------------
    router.get('/EveryonesWork/AssignmentInstanceID/:assignmentInstanceID', async function (req, res) {
        console.log('/EveryonesWork/AssignmentInstanceID/:assignmentInstanceID: was called');

        var everyones_work = {};


        var ai = await AssignmentInstance.findOne({
            where: {
                AssignmentInstanceID: req.params.assignmentInstanceID
            }
        });
        var aa = await Assignment.findOne({
            where: {
                AssignmentID: ai.AssignmentID
            }
        });

        var sec = await Section.find({
            where: {
                SectionID: ai.SectionID
            },
            attributes: ['SemesterID', 'CourseID', 'Name']
        });

        var ses = await Semester.find({
            where: {
                SemesterID: sec.SemesterID
            },
            attributes: ['Name']
        });

        var cou = await Course.find({
            where: {
                CourseID: sec.CourseID
            },
            attributes: ['Number']
        });
        var wa = await WorkflowActivity.findAll({
            where: {
                AssignmentID: ai.AssignmentID
            }
        });


        Promise.map(wa, async workflowAct => {
            let wA = workflowAct.WorkflowActivityID;
            everyones_work[wA] = {
                Name: workflowAct.Name
            };

            var wI = await WorkflowInstance.findAll({
                where: {
                    AssignmentInstanceID: req.params.assignmentInstanceID,
                    WorkflowActivityID: wA
                }
            });

            var workflowInstances = wI.map(async wI => {
                let taskCollection = JSON.parse(wI.TaskCollection);
                var lastTask = await TaskInstance.max('TaskInstanceID', {
                    where: {
                        AssignmentInstanceID: req.params.assignmentInstanceID,
                        WorkflowInstanceID: wI.WorkflowInstanceID,
                        Status: {
                            $like: '%"complete"%'
                        },
                    }
                });
                var firstTask = await TaskInstance.findOne({
                    where: {
                        TaskInstanceID: taskCollection[0]
                    },
                    attributes: ['TaskInstanceID', 'Data']
                });

                return {
                    FirstTask: firstTask,
                    LatestTask: lastTask
                };
            });

            return Promise.all(workflowInstances).then(wIs => {
                everyones_work[wA].Tasks = wIs;
                return wIs;
            });

        }).then(done => {
            return res.json({
                'AssignmentInfo': {
                    'Course': cou.Number,
                    'Section': sec.Name,
                    'Semester': ses.Name,
                },
                'Workflows': everyones_work
            });
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


    //-----------------------------------------------------------------------------------------------------



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

    router.get('/sectionUserInfo/:userId/:sectionId', function (req, res) {
        SectionUser.findOne({
            where: {
                SectionID: req.params.sectionId,
                UserID: req.params.userId
            },
            attributes: ['SectionUserID', 'Role', 'Active']
        }).then(user => {
            return res.json({
                Info: user
            });
        });
    });
    //-------------------------------------------------------------------------

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
            res.status(400).end();
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
            res.status(400).end();
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
            res.status(400).end();
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
            res.status(400).end();
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
            Status: 'Inactive'
            // AssignmentInstanceID: req.body.AssignmentInstanceID
        }).then(function (rows) {
            console.log('add User Success, new ID=', rows.VolunteerPoolID);
            res.status(200).json({
                VolunteerPoolID: rows.VolunteerPoolID
            });
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
            res.status(400).end();
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
            res.status(400).end();
        }).catch(function (err) {
            console.log('/VolunteerPool/sectionlStatusUpdate ' + err.message);
            res.status(400).end();
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
            res.status(400).end();
        }).catch(function (err) {
            console.log('/VolunteerPool/sectionlStatusUpdate ' + err.message);
            res.status(400).end();
        });


    });

    router.get('/reallocatepools/:ai_id', function (req, res) {
        var reallocate = new Allocator();
        var ai_id = req.params.ai_id;
        //var manually_chosen = {};
        var pools = reallocate.get_ai_volunteers(ai_id);
        var volunteer_pool, section_students, section_instructors;

        if (pools[volunteer_pool] == null) {
            volunteer_pool = false;

            if (pools[section_students] == null) {
                section_students = false;

                return Promise.each(pools[section_instructors], function (si) {
                    return reallocate.reallocate(si, pools[section_instructors]);
                });

                section_instructors = true;

            } else {

                return Promise.each(pools[section_students], function (ss) {
                    return reallocate.reallocate(ss, pools[section_students]);
                });

                section_students = true;
            }
        } else {
            return Promise.each(pools[volunteer_pool], function (vo) {
                return reallocate.reallocate(vo, pools[volunteer_pool]);
            });
            volunteer_pool = true;
        }

        res.json({
            'volunteer_pool': volunteer_pool,
            'section_students': section_students,
            'section_instructors': section_instructors,
            'reallocate': pools
        });

    });

    router.post('/reallocate_ai/', async function (req, res) {
        var reallocate = new Allocator();

        await reallocate.reallocate_ai();
    });

    //---------------------comments APIs----------------------------------------------
    router.post('/comments/add', function (req, res) {
        console.log('/comments/add : was called');
        logger.log('error', '/comments/add failed', req.body);
        if (req.body.UserID === null || ((req.body.TaskInstanceID === null) && (req.body.AssignmentInstanceID === null)) || (req.body.CommentsText === null && req.body.Rating === null) || req.body.ReplyLevel === null) {
            console.log('/comments/add : Missing attributes');
            res.status(400).end();
        }

        console.log('got to create part');
        console.log({
            CommentsID: req.body.CommentsID,
            UserID: req.body.UserID,
            TargetID: req.body.TargetID,
            AssignmentInstanceID: req.body.AssignmentInstanceID,
            Type: req.body.Type,
            CommentsText: req.body.CommentsText,
            Rating: req.body.Rating,
            Flag: req.body.Flag,
            Status: req.body.Status,
            ReplyLevel: req.body.ReplyLevel,
            Parents: req.body.Parents,
            Hide: 0,
            Viewed: 0,
            Time: req.body.Time,
            Complete: req.body.Complete,
            CommentTarget: req.body.CommentTarget,
            OriginTaskInstanceID: req.body.OriginTaskInstanceID,

        });
        Comments.create({
            CommentsID: req.body.CommentsID,
            UserID: req.body.UserID,
            TargetID: req.body.TargetID,
            AssignmentInstanceID: req.body.AssignmentInstanceID,
            Type: req.body.Type,
            CommentsText: req.body.CommentsText,
            Rating: req.body.Rating,
            Flag: req.body.Flag,
            Status: req.body.Status,
            ReplyLevel: req.body.ReplyLevel,
            Parents: req.body.Parents,
            Hide: 0,
            Viewed: 0,
            Time: req.body.Time,
            Complete: req.body.Complete,
            CommentTarget: req.body.CommentTarget,
            OriginTaskInstanceID: req.body.OriginTaskInstanceID,

        }).then(function (result) {
            res.status(200).end();
        }).catch(function (err) {
            console.log(err);
            res.status(400).end();
        });
    });
    //------------------------------------------------------------------------------------------
    router.post('/comments/edit', function (req, res) {

        if (req.body.CommentsID == null) {
            console.log('/comments/edit : CommentsID cannot be null');
            res.status(400).end();
            return;
        };
        if (req.body.CommentsText == null) {
            console.log('/comments/edit : CommentsText cannot be null');
            res.status(400).end();
            return;
        };
        Comments.findAll({
            where: {
                CommentsID: req.body.CommentsID
            }
        }).then(function (rows) {
            CommentsArchive.create({
                CommentsID: rows[0].CommentsID,
                UserID: rows[0].UserID,
                CommentTarget: rows[0].CommentTarget,
                TargetID: rows[0].TargetID,
                AssignmentInstanceID: rows[0].AssignmentInstanceID,
                Type: rows[0].Type,
                CommentsText: rows[0].CommentsText,
                Rating: rows[0].Rating,
                Flag: rows[0].Flag,
                Status: rows[0].Status,
                Label: rows[0].Status,
                ReplyLevel: rows[0].ReplyLevel,
                Parents: rows[0].Parents,
                Delete: rows[0].Delete,
                Hide: rows[0].Hide,
                HideReason: rows[0].HideReason,
                HideType: rows[0].HideType,
                Edited: rows[0].Edited,
                Time: rows[0].Time,
                Complete: rows[0].Complete,
                OriginTaskInstanceID: rows[0].OriginTaskInstanceID,
            });
            console.log('/comments/edit : Comments archived');
        }).catch(function (err) {
            console.log('/comments/edit (CommentsArchive): ' + err);
            res.status(400).end();
        });


        Comments.update({
            Type: req.body.Type,
            CommentsText: req.body.CommentsText,
            Rating: req.body.Rating,
            Flag: req.body.Flag,
            Status: req.body.Status,
            ReplyLevel: req.body.ReplyLevel,
            Parents: req.body.Parents,
            Time: req.body.Time,
            Complete: req.body.Complete,
            Edited: 1,

        }, {
            where: {
                CommentsID: req.body.CommentsID
            }
        }).then(function (result) {
            res.json({
                'Error': false,
                'Message': 'Success'
            });
        }).catch(function (err) {
            console.log('/comments/edit: ' + err);
            res.status(400).end();
        });
    });

    //-----------------------------------------------------------------------------
    router.post('/comments/delete', function (req, res) {

        if (req.body.CommentsID == null) {
            console.log('/comments/delete : CommentsID cannot be null');
            res.status(400).end();
            return;
        };

        Comments.update({
            Delete: 1
        }, {
            where: {
                CommentsID: req.body.CommentsID,
                Delete: null
            }
        }).then(function (result) {
            Comments.find({
                where: {
                    CommentsID: req.body.CommentsID
                }
            }).then(function (CommentsUpdated) {
                res.json({
                    'Error': false,
                    'Message': 'Success',
                    'Result': result,
                    'CommentsUpdated': CommentsUpdated
                });
            });
        }).catch(function (err) {
            console.log('/comments/delete: ' + err);
            res.status(400).end();
        });
    });
    //-------------------------------------------------------------------------
    router.post('/comments/viewed', function (req, res) {
        if (req.body.CommentsID == null) {
            console.log('/comments/viewed : CommentsID cannot be null');
            res.status(400).end();
            return;
        };
        CommentsViewed.create({
            CommentsID: req.body.CommentsID,
            UserID: req.body.UserID,
            Time: req.body.Time,

        }).then(function (result) {
            res.status(200).end();
        }).catch(function (err) {
            console.log(err);
            res.status(400).end();
        });
    });

    //------------------------------------------------------------------------------

    router.post('/comments/setFlag', function (req, res) {

        if (req.body.CommentsID == null) {
            console.log('/comments/setFlag : CommentsID cannot be null');
            res.status(400).end();
            return;
        }

        Comments.update({
            Flag: 1
        }, {
            where: {
                CommentsID: req.body.CommentsID,
                Delete: null
            }
        }).then(function (result) {
            Comments.find({
                where: {
                    CommentsID: req.body.CommentsID
                }
            }).then(function (CommentsUpdated) {
                res.json({
                    'Error': false,
                    'Message': 'Success',
                    'Result': result,
                    'Flag': CommentsUpdated
                });
            });
        }).catch(function (err) {
            console.log('/comment/setFlag: ' + err);
            res.status(400).end();
        });
    });
    //-------------------------------------------------------------------------
    router.post('/comments/removeFlag', function (req, res) {

        if (req.body.CommentsID == null) {
            console.log('/comments/removeFlag : CommentsID cannot be null');
            res.status(400).end();
            return;
        }

        Comments.update({
            Flag: 0
        }, {
            where: {
                CommentsID: req.body.CommentsID,
                Delete: null
            }
        }).then(function (result) {
            Comments.find({
                where: {
                    CommentsID: req.body.CommentsID
                }
            }).then(function (CommentsUpdated) {
                res.json({
                    'Error': false,
                    'Message': 'Success',
                    'Result': result,
                    'Flag': CommentsUpdated
                });
            });
        }).catch(function (err) {
            console.log('/comment/removeFlag: ' + err);
            res.status(400).end();
        });
    });
    //-------------------------------------------------------------------------

    router.post('/comments/rating', function (req, res) {

        if (req.body.CommentsID == null) {
            console.log('/comments/rating : CommentsID cannot be null');
            res.status(400).end();
            return;
        }

        Comments.update({
            Rating: req.body.Rating
        }, {
            where: {
                CommentsID: req.body.CommentsID,
                Delete: null
            }
        }).then(function (result) {
            Comments.find({
                where: {
                    CommentsID: req.body.CommentsID
                }
            }).then(function (CommentsUpdated) {
                res.json({
                    'Error': false,
                    'Message': 'Success',
                    'Result': result,
                    'Rating': CommentsUpdated
                });
            });
        }).catch(function (err) {
            console.log('/comment/flag: ' + err);
            res.status(400).end();
        });
    });
    //-------------------------------------------------------------------------
    router.get('/comments/countOfComments/:Target/id/:TargetID', function (req, res) {
        console.log('/comments/countOfComments/:Target/id/:TargetID was called');
        Comments.findAll({
            where: {
                CommentTarget: req.params.Target,
                TargetID: req.params.TargetID,
                Status: 'submitted',
                Type: 'comment',
                Delete: null
            }
        }).then(function (rows) {
            res.json({
                'Error': false,
                'Message': 'Success',
                'NumberComments': rows.length
            });
        }).catch(function (err) {
            console.log('/comments/countOfComments/' + err.message);
            res.status(400).end();
        });
    });
    //-------------------------------------------------------------------------
    router.get('/comments/countOfFlags/:Target/id/:TargetID', function (req, res) {
        console.log('/comments/countOfFlags/:Target/id/:TargetID was called');
        Comments.findAll({
            where: {
                CommentTarget: req.params.Target,
                TargetID: req.params.TargetID,
                Status: 'submitted',
                Type: 'flag',
                Delete: null
            }
        }).then(function (rows) {
            res.json({
                'Error': false,
                'Message': 'Success',
                'NumberComments': rows.length
            });
        }).catch(function (err) {
            console.log('/comments/countOfComments/' + err.message);
            res.status(400).end();
        });
    });
    //-------------------------------------------------------------------------
    router.get('/comments/countOfUsers/:assignmentInstanceID', function (req, res) {
        console.log('comments/countOfUsers was called');
        Comments.findAll({
            where: {
                AssignmentInstanceID: req.params.AssignmentInstanceID,
                Delete: null
            }
        }).then(function (rows) {
            res.json({
                'Error': false,
                'Message': 'Success',
                'Number of Comments': rows.length
            });
        }).catch(function (err) {
            console.log('/comments/count ' + err.message);
            res.status(400).end();
        });
    });
    //-------------------------------------------------------------------------
    router.get('/comments/countOfRating/:assignmentInstanceID', function (req, res) {
        console.log('comments/countOfRating was called');
        Comments.findAll({
            where: {
                AssignmentInstanceID: req.params.AssignmentInstanceID,
                Rating: {
                    $not: null
                },
                Delete: null
            }
        }).then(function (rows) {
            res.json({
                'Error': false,
                'Message': 'Success',
                'Number of Rating': rows.length
            });
        }).catch(function (err) {
            console.log('/comments/count ' + err.message);
            res.status(400).end();
        });
    });

    //-------------------------------------------------------------------------
    router.get('/comments/aveRating/comment/:CommentsID', function (req, res) {
        console.log('/comments/aveRating/comment/ was called');
        var total = 0.0;
        var c = Comments.findAll({
            where: {
                Parents: req.params.CommentsID,
                Rating: {
                    $not: null
                },
                Delete: null
            }
        });
        Promise.map(JSON.parse(c.Rating), function (t) {
            total += c.Rating;
        }).catch(function (err) {
            console.log('/comments/count ' + err.message);
            res.status(400).end();
            var ave = total / c.length;
            res.json({
                'Error': false,
                'Message': 'Success',
                'Total ratings': total,
                'Average rating': ave
            });
        });
    });
    //-------------------------------------------------------------------------
    router.get('/comments/aveRating/comment/:Target/id/:TargetID', async function (req, res) {
        console.log('/comments/aveRating/comment/:Target/id/:TargetID was called');
        var total = 0.0;
        var c = await Comments.findAll({
            where: {
                CommentTarget: req.params.Target,
                TargetID: req.params.TargetID,
                Rating: {
                    $not: null
                },
                Delete: null,
                Hide: 0,
                Status: 'submitted'
            }
        });
        /*Promise.map(c, function(t){
            total += t.Rating;
            console.log(t.Rating)*/

        for (let i of c) {
            total += i.Rating;
        }

        var ave = total / c.length;
        res.json({
            'Error': false,
            'Message': 'Success',
            'NumRatings': c.length,
            'TotalRatings': total,
            'AveRating': ave
        });
    });
    //-------------------------------------------------------------------------
    router.get('/comments/aveRating/comment/:userID', function (req, res) {
        console.log('/comments/aveRating/comment/ was called');
        var total = 0.0;
        var c = Comments.findAll({
            where: {
                UserID: req.params.userID,
                Rating: {
                    $not: null
                },
                Delete: null
            }
        });
        Promise.map(JSON.parse(c.Rating), function (t) {
            total += c.Rating;
        }).catch(function (err) {
            console.log('/comments/count ' + err.message);
            res.status(400).end();
            var ave = total / c.length;
            res.json({
                'Error': false,
                'Message': 'Success',
                'Total ratings': total,
                'Average rating': ave
            });
        });
    });

    //-------------------------------------------------------------------------
    router.get('/comments/ai/:AssignmentInstanceID', function (req, res) {
        console.log('comments/ai/:AssignmentInstanceID was called');
        Comments.findAll({
            where: {
                AssignmentInstanceID: req.params.AssignmentInstanceID,
                Delete: null
            },
            attributes: ['CommentsID', 'UserID', 'AssignmentInstanceID', 'TaskInstanceID', 'Type', 'CommentsText', 'Rating', 'Flag', 'Status', 'Label', 'ReplyLevel', 'Parents', 'Hide', 'Viewed']
        }).then(function (rows) {
            res.json({
                'Error': false,
                'Message': 'Success',
                'Comments': rows
            });
        }).catch(function (err) {
            console.log('comments/ai ' + err.message);
            res.status(400).end();
        });
    });

    //-------------------------------------------------------------------------
    router.get('/comments/ti/:Target/id/:TargetID', async function (req, res) {
        console.log('comments/ti/:Target/id/:TargetID was called');
        console.log(req.params.Target, req.params.TargetID);
        var parents = await Comments.findAll({
            where: {
                TargetID: req.params.TargetID,
                CommentTarget: req.params.Target,
                Delete: null,
                Parents: null
            }
        }).catch(function (err) {
            console.log('comments/ti ' + err.message);
            res.status(400).end();
        });
        var children = await Comments.findAll({
            where: {
                TargetID: req.params.TargetID,
                CommentTarget: req.params.Target,
                Delete: null,
                Parents: {
                    $ne: null
                }
            }
        }).catch(function (err) {
            console.log('comments/ti ' + err.message);
            res.status(400).end();
        });

        for (var j = 0; j < children.length; j++) {
            for (var i = 0; i < parents.length; i++) {
                if (parents[i].CommentsID == children[j].Parents) {
                    if (i < parents.length) {
                        i++;
                        var m = i;
                    }
                    while ((parents[i] != null) && (i < parents.length) && ((parents[i].Parents == children[j].Parents) || (parents[i].Parents == parents[m].CommentsID))) {
                        i++;
                    }
                    parents.splice(i, 0, children[j]);
                    break;
                }
            }
        }

        res.json({
            'Error': false,
            'Message': 'Success',
            'Comments': parents
        });

    });

    //-------------------------------------------------------------------------
    router.get('/comments/CommentsID/:CommentsID', function (req, res) {
        console.log('/comments/CommentsID/:CommentsID was called');
        Comments.findAll({
            where: {
                CommentsID: req.params.CommentsID,
                Delete: null
            }
            //,
            //attributes: ['CommentsID', 'UserID', 'AssignmentInstanceID', 'TaskInstanceID','Type', 'CommentsText', 'Rating', 'Flag', 'Status', 'Label', 'ReplyLevel', 'Parents', 'Hide', 'Viewed']
        }).then(function (rows) {
            res.json({
                'Error': false,
                'Message': 'Success',
                'Comments': rows
            });
        }).catch(function (err) {
            console.log('comments/CommentsID/:CommentsID ' + err.message);
            res.status(400).end();
        });
    });
    //-------------------------------------------------------------------------
    router.get('/comments/IDData/:TaskInstanceID', function (req, res) {
        console.log('/comments/IDData/:TaskInstanceID was called');
        TaskInstance.findAll({
            where: {
                TaskInstanceID: req.params.TaskInstanceID,
            },
            attributes: ['AssignmentInstanceID', 'WorkflowInstanceID']
        }).then(function (rows) {
            res.json({
                'Error': false,
                'Message': 'Success',
                'AssignmentInstanceID': rows[0].AssignmentInstanceID,
                'WorkflowInstanceID': rows[0].WorkflowInstanceID
            });
        }).catch(function (err) {
            console.log('/comments/IDData/:TaskInstanceID ' + err.message);
            res.status(400).end();
        });
    });
    //-------------------------------------------------------------------------
    router.get('/comments/TaskIDData/:WorkflowInstanceID', function (req, res) {
        console.log('/comments/TaskIDData/:WorkflowInstanceID was called');
        TaskInstance.findOne({
            where: {
                WorkflowInstanceID: req.params.WorkflowInstanceID,
            },
            attributes: ['AssignmentInstanceID', 'TaskInstanceID']
        }).then(function (rows) {
            res.json({
                'Error': false,
                'Message': 'Success',
                'TaskInstanceID': rows.TaskInstanceID,
            });
        }).catch(function (err) {
            console.log('/comments/TaskIDData/:WorkflowInstanceID ' + err.message);
            res.status(400).end();
        });
    });
    //-------------------------------------------------------------------------
    router.get('/comments/userID/:UserID', function (req, res) {
        console.log('/comments/userID/:UserID');
        return Comments.findAll({
            where: {
                UserID: req.params.UserID,
                Delete: null,
                Hide: 0
            },
            //attributes: ['CommentsID', 'UserID', 'AssignmentInstanceID', 'TaskInstanceID','Type', 'CommentsText', 'Rating', 'Flag', 'Status', 'Label', 'ReplyLevel', 'Parents', 'Hide', 'Viewed']
        }).then(function (rows) {
            res.json({
                'Error': false,
                'Message': 'Success',
                'Comments': rows
            });
        }).catch(function (err) {
            console.log('comments/userID/:UserID ' + err.message);
            res.status(400).end();
        });
    });
    //-------------------------------------------------------------------------
    router.get('/comments/courseData/:assignmentInstanceID', async function (req, res) {
        console.log('/comments/courseData/:assignmentInstanceID');

        var AI_Result = await AssignmentInstance.findOne({
            where: {
                AssignmentInstanceID: req.params.assignmentInstanceID
            },
            attributes: ['SectionID']
        }).catch(function (err) {
            console.log('comments/courseData/:assignmentInstanceID AI' + err.message);
            res.status(400).end();
        });

        var Section_Result = await Section.findOne({
            where: {
                SectionID: AI_Result.SectionID
            },
            attributes: ['Name', 'CourseID', 'SemesterID']
        }).catch(function (err) {
            console.log('comments/courseData/:assignmentInstanceID Section' + err.message);
            res.status(400).end();
        });

        var Course_Result = await Course.findOne({
            where: {
                CourseID: Section_Result.CourseID
            },
            attributes: ['Name']
        }).catch(function (err) {
            console.log('comments/courseData/:assignmentInstanceID Course' + err.message);
            res.status(400).end();
        });

        var Semester_Result = await Semester.findOne({
            where: {
                SemesterID: Section_Result.SemesterID
            },
            attributes: ['Name']
        }).catch(function (err) {
            console.log('comments/courseData/:assignmentInstanceID Semester' + err.message);
            res.status(400).end();
        });

        res.json({
            'Error': false,
            'Message': 'Success',
            'CourseName': Course_Result.Name,
            'SectionName': Section_Result.Name,
            'SemesterName': Semester_Result.Name
        });
    });
    //-------------------------------------------------------------------------
    router.post('/comments/hide', function (req, res) {
        if (req.body.CommentsID == null) {
            console.log('/comments/hide : CommentsID cannot be null');
            res.status(400).end();
            return;
        }
        Comments.update({
            Hide: 1,
            HideReason: req.body.HideReason,
            HideType: req.body.HideType
        }, {
            where: {
                CommentsID: req.body.CommentsID,
                Delete: null
            }
        }).then(function (result) {
            Comments.find({
                where: {
                    CommentsID: req.body.CommentsID
                }
            }).then(function (CommentsUpdated) {
                res.json({
                    'Error': false,
                    'Message': 'Success',
                    'Rating': CommentsUpdated
                });
            });
        }).catch(function (err) {
            console.log('/comment/hide: ' + err);
            res.status(400).end();
        });
    });
    //-------------------------------------------------------------------------
    router.post('/comments/unhide', function (req, res) {
        if (req.body.CommentsID == null) {
            console.log('/comments/unhide : CommentsID cannot be null');
            res.status(400).end();
            return;
        }
        Comments.update({
            Hide: 0,
            HideReason: 'NULL',
            HideType: 'NULL'
        }, {
            where: {
                CommentsID: req.body.CommentsID,
                Delete: null
            }
        }).then(function (result) {
            Comments.find({
                where: {
                    CommentsID: req.body.CommentsID
                }
            }).then(function (CommentsUpdated) {
                res.json({
                    'Error': false,
                    'Message': 'Success',
                    'Rating': CommentsUpdated
                });
            });
        }).catch(function (err) {
            console.log('/comment/unhide: ' + err);
            res.status(400).end();
        });
    });
    //------------------------Contact APIs-------------------------------------
    router.get('/contact/add/:UserID', function (req, res) {
        console.log('/contact/add : was called');
        User.findAll({
            where: {
                UserID: req.params.UserID
            },
            attributes: ['UserID', 'FirstName', 'LastName', 'OrganizationGroup']
        }).then(function (rows) {
            console.log('Creating UserID,FirstName,LastName,OrganizationGroup.');
            Contact.create({
                UserID: rows[0].UserID,
                FirstName: rows[0].FirstName,
                LastName: rows[0].LastName,
                OrganizationGroup: rows[0].OrganizationGroup
            });
            res.status(400).end();
        }).catch(function (err) {
            console.log('/contact/add/:UserID' + err.message);
            res.status(400).end();
        });
        UserLogin.findAll({
            where: {
                UserID: req.params.UserID
            },
            attributes: ['Email']
        }).then(function (rows2) {
            console.log('Adding Email');
            Contact.update({
                Email: rows2[0].Email
            }, {
                where: {
                    UserID: req.params.UserID
                },
            });
            res.status(400).end();
        }).catch(function (err) {
            console.log('/contact/add/:UserID' + err.message);
            res.status(400).end();
        });
    });

    //---------------------------------------------------------------------------
    router.delete('/contact/delete/:UserID', function (req, res) {

        Contact.destroy({
            where: {
                UserID: req.params.UserID
            }
        }).then(function (rows) {
            console.log('Delete User Success');
            res.status(200).end();
        }).catch(function (err) {
            console.log('/contact/delete/:UserID: ' + err.message);

            res.status(400).end();
        });


    });

    //---------------------------------------------------------------------------
    router.get('/contact', function (req, res) {

        Contact.findAll({
            attributes: ['UserID', 'FirstName', 'LastName', 'Email', 'OrganizationGroup', 'Global']
        }).then(function (rows) {
            res.json({
                'Error': false,
                'Message': 'Success',
                'Contact': rows
            });
        }).catch(function (err) {
            console.log('/contact: ' + err.message);
            res.status(400).end();
        });
    });
    //---------------------------------------------------------------------------
    router.get('/contact/organizationGroup/:OrganizationGroup', function (req, res) {

        Contact.findAll({
            where: {
                OrganizationGroup: req.params.OrganizationGroup
            },
            attributes: ['UserID', 'FirstName', 'LastName', 'Email', 'OrganizationGroup', 'Global']
        }).then(function (rows) {
            res.json({
                'Error': false,
                'Message': 'Success',
                'Contact': rows
            });
        }).catch(function (err) {
            console.log('/contact: ' + err.message);
            res.status(400).end();
        });
    });
    //---------------------------------------------------------------------------
    router.get('/contact/global/:Global', function (req, res) {

        Contact.findAll({
            where: {
                Global: req.params.Global
            },
            attributes: ['UserID', 'FirstName', 'LastName', 'Email', 'OrganizationGroup', 'Global']
        }).then(function (rows) {
            res.json({
                'Error': false,
                'Message': 'Success',
                'Contact': rows
            });
        }).catch(function (err) {
            console.log('/contact: ' + err.message);
            res.status(400).end();
        });
    });
    //---------------------------------------------------------------------------

    router.get('/VolunteerPool/:UserID', function (req, res) {

        VolunteerPool.findAll({
            where: {
                UserID: req.params.UserID
            },
            attributes: ['VolunteerPoolID', 'UserID', 'SectionID', 'AssignmentInstanceID', 'status']
        }).then(function (rows) {
            res.json({
                'Error': false,
                'Message': 'Success',
                'Volunteers': rows
            });
        }).catch(function (err) {
            console.log('/VolunteerPool/:UserID ' + err.message);
            res.status(400).end();
        });


    });

    router.get('/getSectionUserRecord/:sectionUserID', async function (req, res) {
        let record = await SectionUserRecord.find({
            where: {
                SectionUserID: req.params.sectionUserID
            }
        });

        res.json({
            'Error': false,
            'SectionUserRecord': record
        });
    });

    router.get('/sections/instructor/:user_id', async function (req, res) {
        let sections = await SectionUser.findAll({
            where: {
                UserID: req.params.user_id,
                Role: 'Instructor'
            },
            attributes: ['SectionID'],
            include: [{
                model: Section,
                attributes: ['Name'],
                include: [{
                    model: Course,
                    attributes: ['Number']
                }]
            }]
        });

        res.json({
            'Error': false,
            'Sections': sections
        });
    });

    router.get('/section/assignments/:section_id', async function (req, res) {
        let assignments = await AssignmentInstance.findAll({
            where: {
                SectionID: req.params.section_id
            },
            attributes: ['AssignmentInstanceID'],
            include: [{
                model: Assignment,
                attributes: ['Name', 'DisplayName', 'Type']
            }]
        });

        res.json({
            'Error': false,
            'Assignments': assignments
        });
    });

    router.get('/assignment/structure/:assignmentInstanceID', async function (req, res) {

        let structure = [];
        let assignment = await AssignmentInstance.find({
            where: {
                AssignmentInstanceID: req.params.assignmentInstanceID
            },
            attributes: ['AssignmentID']
        });

        let was = await WorkflowActivity.findAll({
            where: {
                AssignmentID: assignment.AssignmentID
            },
            attributes: ['WorkflowActivityID', 'Name']
        });

        await Promise.mapSeries(was, async(wa) => {
            console.log('wa id', wa.WorkflowActivityID);
            let tas = [];
            let ta = await TaskActivity.findAll({
                where: {
                    WorkflowActivityID: wa.WorkflowActivityID
                },
                attributes: ['TaskActivityID', 'Name']
            });

            await Promise.mapSeries(ta, (task) => {
                tas.push({
                    Name: task.Name,
                    TaskActivityID: task.TaskActivityID
                });
            });

            structure.push({
                WorkflowActivityID: wa.WorkflowActivityID,
                Name: wa.Name,
                Tasks: tas
            });
        });




        res.json({
            Error: false,
            Structure: structure
        });

    });

    router.get('/assignment/data/:assignmentInstanceID', async function (req, res) {
        let data = {};

        let workflows = await WorkflowInstance.findAll({
            where: {
                AssignmentInstanceID: req.params.assignmentInstanceID
            }
        });

        await Promise.mapSeries(workflows, async(workflow) => {
            let tasks = {};
            let tis = await TaskInstance.findAll({
                where: {
                    WorkflowInstanceID: workflow.WorkflowInstanceID
                },
                Attributes: ['TaskInstanceID', 'TaskActivityID', 'Status', 'UserID', 'WorkflowInstanceID', 'AssignmentInstanceID'],
                include: [{
                    model: User,
                    Attributes: ['FirstName', 'LastName', 'Instructor']
                }]
            });

            tasks['id'] = workflow.WorkflowInstanceID;

            await Promise.mapSeries(tis, async(ti) => {
                tasks[ti.TaskActivityID] = {
                    TaskInstanceID: ti.TaskInstanceID,
                    WorkflowInstanceID: ti.WorkflowInstanceID,
                    AssignmentInstanceID: ti.AssignmentInstanceID,
                    Status: JSON.parse(ti.Status),
                    Name: `${ti.User.FirstName} ${ti.User.LastName}`,
                    UserID: ti.UserID,
                    Instructor: ti.User.Instructor

                };
            });

            if (data.hasOwnProperty(workflow.WorkflowActivityID)) {
                data[workflow.WorkflowActivityID].workflows.push({
                    WorkflowInstanceID: workflow.WorkflowInstanceID,
                    Tasks: tasks
                });
            } else {
                data[workflow.WorkflowActivityID] = {
                    workflows: [{
                        WorkflowInstanceID: workflow.WorkflowInstanceID,
                        Tasks: tasks
                    }]
                };
            }

        });

        let assignment = await AssignmentInstance.find({
            where: {
                AssignmentInstanceID: req.params.assignmentInstanceID
            },
            attributes: ['SectionID']
        });

        let students = await SectionUser.findAll({
            where: {
                SectionID: assignment.SectionID,
                Active: 1
            },
            attributes: ['UserID', 'Volunteer', 'Role'],
            include: [{
                model: User,
                attributes: ['FirstName', 'LastName']
            }]
        });

        res.json({
            Error: false,
            Students: students,
            Data: data

        });

    });

    /***********************************************************************************************************
     ** GAMIFICATION APIs - Amadou work starts here
     ************************************************************************************************************/
    //Endpoints to get user's badges
    router.get('/userBadges/:userID', async function (req, res) {
        let select = `SELECT u.UserID, bi.BadgeInstanceID, b.Name, b.Description, b.Logo logo, ci.SemesterID, ci.CourseID, ci.SectionID, ci.CategoryID
                        FROM  badgeinstance AS bi
                        JOIN Userbadgeinstances AS ub ON bi.BadgeInstanceID = ub.BadgeInstanceID
                        JOIN user AS u ON u.UserID = ub.UserID
                        JOIN categoryinstance AS ci ON ci.CategoryID = bi.CategoryInstanceID
                        JOIN badge AS b ON b.BadgeID = bi.BadgeID
                        WHERE u.UserID = ?`;

        sequelize.query(select, {
            replacements: [
                req.params.userID
            ],
            type: sequelize.QueryTypes.SELECT
        }).then(result => {
            if (!result) {
                result = [];
            }
            res.json({
                'Error': false,
                'badges': result
            });

        }).catch((err) => {
            console.info(err);
            res.status(400).end();
        });
    });

    //Endpoint to get the user's points
    router.get('/userProgress/:userID/:categoryID', async function (req, res) {

        let select = `SELECT ci.CategoryID, ci.CourseID, ci.SectionID, ci.SemesterID,
                      ci.Tier1Instances, ci.Tier2Instances, ci.Tier3Instances, upi.pointInstances,
                      b.Name, b.Description, b.Logo, upi.UserID, bi.BadgeInstanceID
                      FROM categoryinstance AS ci
                      JOIN userpointinstances upi ON upi.CategoryInstanceID = ci.CategoryInstanceID
                      JOIN badgeinstance bi ON bi.CategoryInstanceID = ci.CategoryInstanceID
                      JOIN badge b ON b.BadgeID = bi.BadgeID
                      WHERE upi.UserID =? AND ci.CategoryID =?
                      ORDER BY ci.CategoryID ASC`;

        sequelize.query(select, {
            replacements: [
                req.params.userID,
                req.params.categoryID
            ],
            type: sequelize.QueryTypes.SELECT
        }).then(result => {
            if (!result) {
                result = [];
            }
            var progress = {
                badges: []
            };
            for (var x = 0; x < result.length; x++) {
                progress.UserID = result[x].UserID;
                progress.CategoryID = result[x].CategoryID;
                progress.CourseID = result[x].CourseID;
                progress.SectionID = result[x].SectionID;
                progress.SemesterID = result[x].SemesterID;
                progress.Tier1Instances = result[x].Tier1Instances;
                progress.Tier2Instances = result[x].Tier2Instances;
                progress.Tier3Instances = result[x].Tier3Instances;
                progress.pointInstances = result[x].pointInstances;
                progress.badges.push({
                    id: result[x].BadgeInstanceID,
                    name: result[x].Name,
                    description: result[x].Description,
                    logo: result[x].Logo
                });
            }

            res.json({
                'Error': false,
                'progress': progress
            });

        }).catch((err) => {
            console.info(err);
            res.status(400).end();
        });
    });

    //Endpoint for user courses/sections
    router.get('/studentCourses/:userID/:semesterID', async function (req, res) {

        let select = `SELECT DISTINCT c.Name, c.Number, c.Description, c.CourseID,
                        s.SectionID, s.SemesterID, s.Name SectionName
                        FROM course AS c
                        JOIN section AS s ON s.CourseID = c.CourseID
                        JOIN sectionuser AS us ON us.SectionID = s.SectionID
                        WHERE us.UserID =? AND s.SemesterID=?`;

        sequelize.query(select, {
            replacements: [
                req.params.userID,
                req.params.semesterID
            ],
            type: sequelize.QueryTypes.SELECT
        }).then(result => {

            if (!result) {
                result = [];
            }
            res.json({
                'Error': false,
                'courses': result
            });
        }).catch(() => {
            res.status(400).end();
        });
    });

    //Endpoint to get badges for each category
    router.get('/badgeCategories/:courseID/:sectionID/:semesterID', async function (req, res) {

        var select = `SELECT c.CategoryID,c.Tier1Instances,c.Tier2Instances,c.Tier3Instances,
                      ct.Name, ct.Description
                      FROM categoryinstance c
                      join category ct on ct.CategoryID = c.CategoryID
                      WHERE c.CourseID=?
                      AND c.sectionID=?
                      AND c.SemesterID=?`;

        sequelize.query(select, {
            replacements: [
                req.params.courseID,
                req.params.sectionID,
                req.params.semesterID
            ],
            type: sequelize.QueryTypes.SELECT
        }).then(categories => {
            if (!categories) {
                categories = [];
            }

            categories.forEach((item) => {

                var select = `SELECT DISTINCT b.Name, b.Description, bi.BadgeInstanceID BadgeID, bi.CategoryInstanceID CategoryID
                                    FROM badgeinstance bi
                                    JOIN badge b ON b.BadgeID = bi.BadgeID
                                    JOIN categoryinstance ci ON ci.CategoryInstanceID = bi.CategoryInstanceID
                                    WHERE ci.CategoryInstanceID = ${item.CategoryID}`;

                sequelize.query(select).then(function(badges) {
                    if (badges.length > 0) {
                        item.badges = badges[0];
                    } else {
                        item.badges = [];
                    }
                });
            });

            setTimeout(() => {
                res.json({
                    'Error': false,
                    'categories': categories
                });
            }, 1000);
        })
            .catch(() => {
                res.status(400).end();
            });
    });

    //Endpoint students' ranking by for a class
    router.get('/getSectionRanking/:semesterID/:courseID/:sectionID/:userID', async function (req, res) {

        let lastUpdate = await StudentRankSnapchot.findOne({
            attributes: ['UpdateDate'],
            order: [
                ['StudentRankSnapchotID', 'DESC']
            ]
        });

        let students = await StudentRankSnapchot.findAll({
            where: {
                SectionID: req.params.sectionID,
                SemesterID: req.params.semesterID,
                CourseID: req.params.courseID,
                UpdateDate: {
                    $eq: lastUpdate.UpdateDate
                },
            },
            order: [
                ['Rank', 'ASC']
            ]
        });

        let currentStudent = await StudentRankSnapchot.findOne({
            where: {
                SectionID: req.params.sectionID,
                SemesterID: req.params.semesterID,
                CourseID: req.params.courseID,
                UserID: req.params.userID,
                UpdateDate: {
                    $eq: lastUpdate.UpdateDate
                },
            }
        });

        res.json({
            'Error': false,
            'students': students,
            'currentStudent': currentStudent
        });
    });

    //Endpoint for ranking accross sections based on average points
    router.get('/getSectionsRanking/:semesterID', async function (req, res) {

        let lastUpdate = await SectionRankSnapchot.findOne({
            attributes: ['UpdateDate'],
            order: [
                ['SectionRankSnapchotID', 'DESC']
            ]
        });

        let where = {};
        if (lastUpdate) {
            where = {
                SemesterID: req.params.semesterID,
                UpdateDate: {
                    $eq: lastUpdate.UpdateDate
                }
            };
        } else {
            where = {
                SemesterID: req.params.semesterID,
            };
        }

        SectionRankSnapchot.findAll({
            where: where,
            order: [
                ['Rank', 'ASC']
            ]
        }).then((sections) => {

            res.json({
                'Error': false,
                'sections': sections
            });

        }).catch((err) => {
            console.info(err);
            res.status(400).end();
        });
    });

    //Get movements, changes in point for each student and rank them
    router.get('/getMovement/:semesterID', async function (req, res) {

        let lastUpdate = await StudentRankSnapchot.findOne({
            attributes: ['UpdateDate'],
            order: [
                ['StudentRankSnapchotID', 'DESC']
            ]
        });

        StudentRankSnapchot.findAll({
            where: {
                SemesterID: req.params.semesterID,
                UpdateDate: {
                    $eq: lastUpdate.UpdateDate
                },
                PointsMovement: {
                    $not: '0'
                }
            },
            order: [
                ['PointsMovement', 'DESC']
            ]
        }).then((students) => {

            res.json({
                'Error': false,
                'students': students
            });

        }).catch((err) => {
            console.info(err);
            res.status(400).end();
        });
    });

    //Get the different level for each class
    router.get('/getLevels/:semesterID/:courseID/:sectionID/:userID', async function (req, res) {

        let levelInstances = await LevelInstance.findAll({
            where: {
                SemesterID: req.params.semesterID,
                CourseID: req.params.semesterID,
                sectionID: req.params.semesterID
            }
        });

        let levels = await Level.findAll();
        let result = [];

        for (let x = 0; x < levelInstances.length; x++) {
            let levelInstance = levelInstances[x].dataValues;

            for (let x = 0; x < levels.length; x++) {
                let level = levels[x];
                if (levelInstance.LevelID == level.LevelID) {
                    levelInstance.Name = level.Name;
                    levelInstance.Description = level.Description;
                }

            }
            result.push(levelInstance);
        }

        let userPoints = await StudentRankSnapchot.findOne({
            where: {
                SemesterID: req.params.semesterID,
                CourseID: req.params.semesterID,
                sectionID: req.params.semesterID,
                UserID: req.params.userID
            },
            attributes: ['TotalPoints']
        });

        if (!userPoints) {
            userPoints = {
                TotalPoints: 0
            };
        }

        res.json({
            'Error': false,
            'levels': result,
            'currentPoints': userPoints.TotalPoints
        });
    });

    //Get the goals for each class
    router.get('/getGoals/:semesterID/:courseID/:sectionID', async function (req, res) {

        let goalInstances = await GoalInstance.findAll({
            where: {
                SemesterID: req.params.semesterID,
                CourseID: req.params.semesterID,
                sectionID: req.params.semesterID
            }
        });

        let goals = await Goal.findAll();
        let result = [];

        for (let x = 0; x < goalInstances.length; x++) {
            let goalInstance = goalInstances[x].dataValues;

            for (let x = 0; x < goals.length; x++) {
                let goal = goals[x];
                if (goalInstance.GoalID == goal.GoalID) {
                    goalInstance.Name = goal.Name;
                    goalInstance.Description = goal.Description;
                    goalInstance.Logo = goal.Logo;
                    goalInstance.LogoAchieved = goal.LogoAchieved;
                }

            }
            result.push(goalInstance);
        }

        res.json({
            'Error': false,
            'Goals': result
        });
    });

    //Just for testing
    // router.get('/testing', async function (req, res) {

    //     // let taskFactory = new TaskFactory;
    //     //taskFactory.createCategoryInstances(1, 1, 1);
    //     //taskFactory.rankingSnapshot(true);
    //     //taskFactory.rankingSnapshot(false, true);
    //     //taskFactory.updatePointInstance('create_problem', '3', '1');
    //     // let taskFactory = new TaskFactory;
    //     // taskFactory.createCategoryInstances(1, 1, 1);
    //     console.log('sending from testing ....');
    //     let email = new Email();
    //     email.sendNow(2, 'late');

    //     // res.json({
    //     //     'Error': false,
    //     //     'SectionUserRecord': 'hello world'
    //     // });
    // });
    router.post('/addExp', async function (req, res) {
        var levelTrigger = new LevelTrigger();

        await levelTrigger.addExp(req.body.exp, req.body.sectionUserID);

        res.status(200).end();
    });

    router.post('/claimExtraCredit', async function (req, res) {
        var grade = new Grade();
        console.log(req.body.goalInstanceID, req.body.sectionUserID);
        await grade.claimExtraCredit(req.body.goalInstanceID, req.body.sectionUserID);
        res.status(200).end();
    });


    router.get('/goals/section/:sectionId', function (req, res) {
        GoalInstance.findAll({
            where: {
                SectionID: req.params.sectionId
            },
            include: [Goal]
        }).then(result => {
            return res.json({
                Goals: result
            });
        });
    });

    /***********************************************************************************************************
     **  Amadou work ends here
     ************************************************************************************************************/

    
    //---------------------------------------------------------------------------
    router.get('/notifications/load',async function(req, res) {
        console.log('/notifications/load : was called');

        var v = await VolunteerPool.findAll({
            where: {
                status: 'pending'
            },
            attributes: ['volunteerpoolID']
        }).then(function(rows) {
            var arrayLength = rows.length;
            for (var i = 0; i < arrayLength; x++) {
                Notifications.create({
                    VolunteerpoolID: rows[i].volunteerpoolID
                });
            }
        }).catch(function(err) {
            console.log('/notifications/load/:UserID + volunteerpool ' + err);
            res.status(400).end();
        });

        var f = await Comments.findAll({
            where: {
                Flag: 1
            },
            attributes: ['commentsID','UserID']
        }).then(function(rows2) {
            var arrayLength = rows2.length;
            for (var j = 0; j < arrayLength; j++) {
                Notifications.create({
                    CommentsID: rows[j].CommentsID,
                    UserID: rows[j].UserID,
                    Flag: 1
                });
            }
        }).catch(function(err) {
            console.log('/notifications/load/:UserID + volunteerpool ' + err);
            res.status(400).end();
        });


        res.json({
            'Error': false,
            'Message': 'Success',
            'volunteer': v,
            'comments-flag': f,

        });

    });
    //---------------------------------------------------------------------------
    router.get('/notifications/all', function(req, res) {
        console.log('/notifications/all: was called');

        Notifications.findAll({
            where: {
                Dismiss: null
            }
        }).then(function(rows) {
            res.json({
                'Error': false,
                'Message': 'Success',
                'Notifications': rows
            });
        }).catch(function(err) {
            console.log('/notifications/all ' + err.message);
            res.status(400).end();
        });

    });
    //---------------------------------------------------------------------------
    router.get('/notifications/user/:UserID', function(req, res) {
        console.log('/notifications/user/:UserID was called');

        Notifications.findAll({
            where: {
                UserID: req.params.UserID,
                Dismiss: null
            }
        }).then(function(rows) {
            res.json({
                'Error': false,
                'Message': 'Success',
                'Notifications': rows
            });
        }).catch(function(err) {
            console.log('/notifications/user/:UserID' + err.message);
            res.status(400).end();
        });

    });
    //---------------------------------------------------------------------------
    router.get('/notifications/dismiss/:notificationsID', function(req, res) {
        console.log('/notifications/dismiss/:notificationsID was called');

        Notifications.update({
            Dismiss:1
        },{
            where: {
                NotificationsID: req.params.notificationsID
            }
        }).then(function(rows) {
            res.json({
                'Error': false,
                'Message': 'Success'
            });
        }).catch(function(err) {
            console.log('/notifications/dismiss/:notificationsID' + err.message);
            res.status(400).end();
        });

    });

    ////////////----------------   END Participant APIs
    ////////////////////////////////////////////////////////////////////////////////////////////////////
    router.use(function(req,res,next){
        if(!USE_TOKENS){
            next();
            return;
        }
        if(canRoleAccess(req.user.role, ROLES.TEACHER)){
            next();
        } else {
            return res.status(401).end();
        }
    });
    ////////////////////////////////////////////////////////////////////////////////////////////////////
    ////////////----------------   Teacher APIs
    ///////////////////////////


    ///////////////////////////
    ////////////----------------   END Teacher Access APIs
    ////////////////////////////////////////////////////////////////////////////////////////////////////
    router.use(function(req,res,next){
        if(!USE_TOKENS){
            next();
            return;
        }
        if(canRoleAccess(req.user.role, ROLES.ENHANCED)){
            next();
        } else {
            return res.status(401).end();
        }
    });
    ////////////////////////////////////////////////////////////////////////////////////////////////////
    ////////////                 Enhanced Access Level APIs

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
                User.create({
                    FirstName: 'Temp',
                    LastName: 'Temp',
                    OrganizationGroup: {
                        'OrganizationID': []
                    },
                    Instructor: true,
                    Admin: false
                })
                    .then(function (user) {
                        UserContact.create({
                            Email: email,
                            Phone: 'XXX-XXX-XXXX',
                            FirstName: 'Temp',
                            LastName: 'Temp',
                            UserID: user.UserID
                        }).then(async function (userCon) {
                            UserLogin.create({
                                UserID: user.UserID,
                                Email: email,
                                Password: await password.hash('pass123')
                            }).then(function (userLogin) {
                                //Email User With Password
                                console.log('/instructor/new made');
                                res.status(200).end();
                            })
                                .catch(function (err) {
                                    console.log(err);
                                });
                        })
                            .catch(function (err) {
                                console.log('Error creating user');
                                console.log(err);
                            });
                    })
                    .catch(function (err) {
                        console.log(err);
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

    ///////////////////////////
    ////////////----------------   END Enhanced Access APIs
    ////////////////////////////////////////////////////////////////////////////////////////////////////
    router.use(function(req,res,next){
        if(!USE_TOKENS){
            next();
            return;
        }
        if(canRoleAccess(req.user.role, ROLES.ADMIN)){
            next();
        } else {
            return res.status(401).end();
        }
    });
    ////////////////////////////////////////////////////////////////////////////////////////////////////
    ////////////                 Admin Level APIs

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
            res.status(200).end();
        }).catch(function (err) {
            console.log('/AssignmentArchive/save/:AssignmentInstanceID ' + err.message);
            res.status(400).end();
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
            res.status(400).end();
        }).catch(function (err) {
            console.log('/AssignmentRestore/save/:AssignmentInstanceID ' + err.message);
            res.status(400).end();
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
            res.status(400).end();
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
            res.status(400).end();
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
            res.status(400).end();
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
            res.status(400).end();
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
            res.status(400).end();
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
            res.status(400).end();
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
            res.status(400).end();
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
            res.status(400).end();
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
            res.status(400).end();
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
            res.status(400).end();
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
            res.status(400).end();
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

    //Endpoint to make a user an admin
    router.put('/makeUserAdmin/', function (req, res) {

        User.findById(req.body.UserID).then(function (user) {
            if (user == null) {
                console.log('/makeUserAdmin/ User not found');
                res.status(400).end();
            } else {
                user.Admin = 1;
                user.save().then(function () {
                    console.log('/makeUserAdmin : User Updated ');
                    res.status(200).end();
                }).catch(function (error) {
                    // Ooops, do some error-handling
                    console.log('/makeUserAdmin : Error while inserting ' + error.message);
                    res.status(400).end();
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
                        res.status(400).end();
                    } else {
                        user.Admin = 0;
                        user.save().then(function () {
                            console.log('/makeUserNotAdmin : User Updated ');
                            res.status(200).end();
                        }).catch(function (error) {
                            // Ooops, do some error-handling
                            console.log('/makeUserNoAdmin : Error while inserting ' + error.message);
                            res.status(400).end();
                        });
                    }
                });
            } else {
                console.log('/makeUserNoAdmin : Authentication Failed');
                res.status(400).end();
            }
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
            res.status(400).end();
        });


    });

    //---------------------------------------------------------------------------
    router.get('/userManagement', async function (req, res) {
        console.log('/userManagement : was called');
        await User.findAll({
            attributes: ['UserID', 'FirstName', 'LastName', 'OrganizationGroup', 'Admin'/*, 'Test'*/, 'Instructor'],
            include: [{
                model: UserContact,
                attributes: ['Email', 'FirstName', 'LastName']
            }, {

                model: UserLogin,
                attributes: ['Email', 'Pending', 'Attempts', 'Timeout', 'Blocked']
            }

            ]
        }).then(function (result) {
            console.log('Assignments have been found!');
            res.json({
                'Error': false,
                'Assignments': result
            });
        }).catch(function (err) {
            console.log('/userManagement (User table)' + err.message);
            res.status(400).end();
        });

    });

    //---------------------------------------------------------------------------
    router.get('/userManagement/blocked/:UserID', function (req, res) {
        console.log('/userManagement/blocked : was called');

        UserLogin.update({
            Blocked: 1
        }, {
            where: {
                UserID: req.params.UserID
            }
        }).then(function (update) {
            UserLogin.find({
                where: {
                    UserID: req.params.UserID
                }
            }).then(function (result) {
                res.json({
                    'Error': false,
                    'Message': 'Success',
                    'Result': result
                });
            });
        }).catch(function (err) {
            console.log('/userManagement/blocked/ ' + err);
            res.status(400).end();
        });
    });
    //---------------------------------------------------------------------------
    router.get('/userManagement/unblocked/:UserID', function (req, res) {
        console.log('/userManagement/unblocked : was called');

        UserLogin.update({
            Blocked: 0
        }, {
            where: {
                UserID: req.params.UserID
            }
        }).then(function (update) {
            UserLogin.find({
                where: {
                    UserID: req.params.UserID
                }
            }).then(function (result) {
                res.json({
                    'Error': false,
                    'Message': 'Success',
                    'Result': result
                });
            });
        }).catch(function (err) {
            console.log('/userManagement/unblocked/ ' + err);
            res.status(400).end();
        });
    });
    //---------------------------------------------------------------------------


    ///////////////////////////
    ////////////----------------   END Admin APIs
    ////////////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////
    
    // API to reallocate users in assigments instances created 3-4-18 mss86
    //@ sec_id: section ID
    //@ ai_ids: [] assigment instance ids
    //@ user_pool_wc: [ [#,..],..] array of arrays of users to use with constrains
    //@ user_pool_woc: [#,..] array of users without constrains
    //@ is_extra_credit: boolean
    router.post('/reallocate/user_based', async function (req, res){
        if(req.body.ai_ids == null || req.body.old_user_ids == null || req.body.is_extra_credit == null || req.body.sec_id == null || req.body.user_pool_wc == null || req.body.user_pool_woc == null ){
            logger.log('error','/reallocate/assigment: fields cannot be null');
            res.status(400).end();
            return;
        };
        var allocate = new Allocator([],0);
        var inactivate_users;
        if(req.body.inactivate_users == null){
            inactivate_users ='this_assignment';
        }else{
            inactivate_users = req.body.inactivate_users;
        }
        var remove_from_all_assigments;
        if(req.body.remove_from_all_assigments == null){
            remove_from_all_assigments =false;
        }else{
            remove_from_all_assigments = req.body.remove_from_all_assigments;
        }
        await Promise.map(req.body.old_user_ids, async (old_user_id)=>{
            if(inactivate_users == 'all_assignments'){
                await allocate.inactivate_section_user(req.body.sec_id, old_user_id); // deactive user in section
            }
            await allocate.delete_volunteer(req.body.sec_id , old_user_id);     // remove user from voluenteers
        });
        logger.log('info','/reallocate/user_based called');
        
        var ais = [];
        if(remove_from_all_assigments){                 // remove user from all Assigments
            ais = await AssignmentInstance.findAll({ 
                where: { 
                    SectionID: req.body.sec_id          // TODO: get only active assigments in section
                }
            });
        }else{
            await Promise.map(req.body.ai_ids, async(ai_id) => { // remove users from provided ais
                var ai = await AssignmentInstance.findOne({ 
                    where: { 
                        AssignmentInstanceID: ai_id
                    }
                });
                ais.push(ai);
            });
        }
        var result = await allocate.reallocate_users(req.body.sec_id, ais, req.body.old_user_ids , req.body.user_pool_wc, req.body.user_pool_woc, req.body.is_extra_credit);
        res.json( result );
    });
    // API to reallocate Tasks  created 3-4-18 mss86
    //@ taskarray: [ 'ti' [#,..]] or [ 'wi' [#,..]] or [ 'ai' [#,..]] 
    //@ user_pool_wc: [ [#,..],..] array of arrays of users to use with constrains
    //@ user_pool_woc: [#,..] array of users without constrains
    //@ is_extra_credit: boolean
    router.post('/reallocate/task_based', async function (req, res){
        if(req.body.taskarray == null || req.body.user_pool_wc == null || req.body.user_pool_woc == null || req.body.is_extra_credit == null){
            logger.log('error','/reallocate/assigment: fields cannot be null');
            res.status(400).end();
            return;
        };
        logger.log('info','/reallocate/task_based called');
        var allocate = new Allocator([],0);
        var result = await allocate.reallocate_tasks_based(req.body.taskarray, req.body.user_pool_wc, req.body.user_pool_woc, req.body.is_extra_credit);
        res.json( result );
    });
    // API to cancel workflows   created 3-10-19 mss86
    //@ ai_id: assigment instance
    //@ workflow_ids: [ ] of wi_ids
    router.post('/reallocate/cancel_workflows', async function (req, res){
        if(req.body.ai_id == null || req.body.wi_ids == null){
            logger.log('error','/reallocate/cancel_workflows: fields cannot be null');
            res.status(400).end();
            return;
        };
        logger.log('info',{
            call:'/reallocate/cancel_workflows',
            ai_id: req.body.ai_id,
            wi_ids: req.body.wi_ids,
        });
        var wi_ids = req.body.wi_ids;
        var allocate = new Allocator([],0);
        var assigment_array = [];
        var index = 0;
        await Promise.mapSeries(wi_ids, async(wi_id) =>{    // group the assigments per Workflow Activity
            var wi = await allocate.get_wi_from_wi_id(wi_id);
            var wa_id = wi.WorkflowActivityID;
            if(index === 0){
                assigment_array.push({wa_id: wa_id, wi_ids:[wi_id]});
                index++;
            }else{
                var pos = assigment_array.map(function(e) { return e.wa_id; }).indexOf(wa_id); 
                if( pos > -1){
                    assigment_array[pos].wi_ids.push(wi_id);
                }else{
                    assigment_array.push({wa_id: wa_id, wi_ids:[wi_id]});
                }
            }
        });
        var Message = 'Workflows Successfully Cancelled';
        var array_of_results =[];
        var result;
        var needs_confirmation       = false;     // confirmation by instructor    
        var wanted_to_cancel_started = false;
        var extra_task_for_extra_credit = false;
        var realocate_error = false;
        try{
            await Promise.mapSeries(assigment_array, async(activity) =>{
                result = await allocate.cancel_workflow(req.body.ai_id, activity.wa_id, activity.wi_ids);
                array_of_results.push(result);
                if(result.Error){
                    needs_confirmation = true;
                }
                if(result.extra_task_for_extra_credit){
                    extra_task_for_extra_credit = true;
                }
                if(result.wanted_to_cancel_started){
                    wanted_to_cancel_started = true;
                }
            });
            if(result.Error){
                needs_confirmation = true;
                if(result.wanted_to_cancel_started && !result.extra_task_for_extra_credit){
                    Message = 'Some users will have less tasks then others, Started workflows will not be cancelled';
                }else if(result.wanted_to_cancel_started && result.extra_task_for_extra_credit){
                    Message = 'Some users will have less tasks then others, extra tasks will be allocated for extra credit, Started workflows will not be cancelled';
                }else if(!result.wanted_to_cancel_started && result.extra_task_for_extra_credit){
                    Message = 'Some users will have less tasks then others, extra tasks will be allocated for extra credit';
                }else{
                    Message = 'Some users will have less tasks then others';
                }
            }else{
                if(result.wanted_to_cancel_started && !result.extra_task_for_extra_credit){
                    Message = 'Started workflows were not cancelled';
                }else if(result.wanted_to_cancel_started && result.extra_task_for_extra_credit){
                    Message = 'Extra tasks were allocated for extra credit, Started workflows were not be cancelled';
                }else if(!result.wanted_to_cancel_started && result.extra_task_for_extra_credit){
                    Message = 'Extra tasks were allocated for extra credit';
                }
            }
            if(!needs_confirmation){    // Use the graph and apply it to the database
                await Promise.map( array_of_results , async (w_activity) => {
                    var data = w_activity.data;
                    var Graph = data.Graph;
                    var wi_ids = data.wi_ids;
                    var ai_id = data.ai_id;
                    var users_to_realocate = data.users_to_realocate_later;
                    var replace_users = data.users_to_realocate_later;
                    if(wi_ids.length > 0){
                        result = await allocate.apply_cancellation_graph(Graph, wi_ids, users_to_realocate,ai_id);
                    }
                });
                array_of_results=[];
            }
        }catch(e){
            logger.log('error','error in /reallocate/cancel_workflows', e);
            realocate_error = true;
            Message = 'Could not cancel, error occured';
        }
        res.json( 
            {
                Error: realocate_error,
                confirmation_required : needs_confirmation,
                Message: Message,
                data: array_of_results 
            } 
        );
    });
    // API to Confirm Workfow Cancellation By Instructor   created 3-10-19 mss86
    //@ data: [] array of Json containing Graph and wi_ids
    router.post('/reallocate/confirm_cancellation', async function (req, res){
        if(req.body.data == null ){
            logger.log('error','/reallocate/cancel_workflows: fields cannot be null');
            res.status(400).end();
            return;
        };
        logger.log('info',{
            call:'/reallocate/confirm_cancellation',
            data: req.body.data,
        });
        var allocate = new Allocator([],0);
        var result;
        await Promise.map( req.body.data , async (w_activity) => {
            var data = w_activity.data;
            var Graph = data.Graph;
            var wi_ids = data.wi_ids;
            var ai_id = data.ai_id;
            var users_to_realocate = data.users_to_realocate_later;
            var replace_users = data.users_to_realocate_later;
            result = await allocate.apply_cancellation_graph(Graph, wi_ids, users_to_realocate,ai_id);
        });
        res.json( result );
    });

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
        function(test) {
            console.log(test);
        }
        ]).toString());

        // var manager = new Manager()
        // manager.debug()
        var a = new Allocator();
        // a.reallocate_ais_of_users([1, 5], [3, 5, 8, 11, 1])
        res.status(200).end();
    });

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

    //----------------------------------------------------------------

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

   
    //-------inactive a user from a section---------------------------------
    router.post('/inactiveuser/section', function(req, res) {

        if (req.body.UserID  == null) {
            console.log('/inactiveuser/section : UserID cannot be null');
            res.status(400).end();
            return;
        };
        if (req.body.SectionID == null) {
            console.log('/inactiveuser/section : SectionID cannot be null');
            res.status(400).end();
            return;
        };
        SectionUser.update({
            Active:0
        },{
            where: {
                UserID: req.body.UserID,
                SectionID: req.body.SectionID

            }
        });

    });

    //---------Section status---------------------------------------------------
    router.post('/status/section/:sectionID', function(req, res) {

        Section.find({
            where: {
                SectionID: req.params.sectionID
            }
        }).then(function(rows) {
            res.json({
                'Error': false,
                'Message': 'Success',
                'Semester': rows
            });
        }).catch(function(err) {
            console.log('/status/section/:sectionID ' + err.message);
            res.status(400).end();
        });

    });

    //-----------user management------------------------------------
    router.post('/usermanagement/testuser/add', function(req, res) {

        User.update({
            Test: 1
        }, {
            where: {
                UserID: req.body.UserID
            }
        }).then(function(rows) {
            res.json({
                'Error': false,
                'Message': 'Success'
            });
        }).catch(function(err) {
            console.log('/usermanagement/testuser/add' + err.message);
            res.status(400).end();
        });

    });

    //----------------------------------------------------------------
    router.post('/usermanagement/testuser/remove', function(req, res) {

        User.update({
            Test: 0
        }, {
            where: {
                UserID: req.body.UserID
            }
        }).then(function(rows) {
            res.json({
                'Error': false,
                'Message': 'Success'
            });
        }).catch(function(err) {
            console.log('/usermanagement/testuser/remove' + err.message);
            res.status(400).end();
        });

    });

    //----------------------------------------------------------------
    router.post('/usermanagement/role', function(req, res) {

        User.update({
            Role: req.body.Role
        }, {
            where: {
                UserID: req.body.UserID
            }
        }).then(function(rows) {
            res.json({
                'Error': false,
                'Message': 'Success'
            });
        }).catch(function(err) {
            console.log('/usermanagement/role' + err.message);
            res.status(400).end();
        });

    });

    //----------------------------------------------------------------
    router.post('/testuser/create',async function(req, res) {
        console.log('/testuser/create : was called');
        console.log(TestUser);
        await TestUser.create({
            Test: true
        }).catch(function(err) {
            console.log('TestUser.create ' + err.message);
            res.status(400).end();
        });

        var f = await TestUser.findAll({
        }).catch(function(err) {
            console.log('TestUser.findAll ' + err.message);
            res.status(400).end();
        });

        var n = f[f.length-1].X;


        res.json({
            'Error': false,
            'Message': 'Success',
            'FirstName': 'Test' + n,
            'LastName': 'User' + n,
            'Email': 'testuser' + n + '@dummysite.tst'
        });

    });

    //-----------user management------------------------------------
    router.post('/usermanagement/testuser/add', function(req, res) {

        User.update({
            Test: 1
        }, {
            where: {
                UserID: req.body.UserID
            }
        }).then(function(rows) {
            res.json({
                'Error': false,
                'Message': 'Success'
            });
        }).catch(function(err) {
            console.log('/usermanagement/testuser/add' + err.message);
            res.status(401).end();
        });

    });

    router.post('/getSectionByAssignmentInstance', function(req, res){
        //console.log(req);
        AssignmentInstance.find({
            where: {
                AssignmentInstanceID: req.body.assignmentInstanceID
            },
            attributes: ['SectionID']
        }).then(result => {
            return res.json(result);
        });
    });

    //----------------------------------------------------------------
    router.post('/volunteerpool/section/:section_id',async function(req, res) {
        console.log('/volunteerpool/section/ : was called');
        VolunteerPool.findAll({
            where:{
                SectionID:req.params.section_id
            }
        }).then(function (result) {
            console.log('Volunteers have been found by section.');
            res.json({
                'Error': false,
                'Volunteers': result
            });
        }).catch(function (err) {
            console.log('/volunteerpool/section/: ' + err);
            res.status(400).end();
        });
    });

    //-----------------------------------------------------------------------------------------------------

    //----------------------------------------------------------------
    router.post('/volunteerpool/section/:section_id',async function(req, res) {
        console.log('/volunteerpool/section/ : was called');
        VolunteerPool.findAll({
            where:{
                SectionID:req.params.section_id
            }
        }).then(function (result) {
            console.log('Volunteers have been found by section.');
            res.json({
                'Error': false,
                'Volunteers': result
            });
        }).catch(function (err) {
            console.log('/volunteerpool/section/: ' + err);
            res.status(400).end();
        });
    });

    //-----------------------------------------------------------------------------------------------------

};
module.exports = REST_ROUTER;
