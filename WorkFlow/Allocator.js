var models = require('../Model');
var Promise = require('bluebird');
var moment = require('moment');
var TaskFactory = require('./TaskFactory.js');
var _ = require('underscore');

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
var WorkflowInstance = models.WorkflowInstance;
var WorkflowActivity = models.WorkflowActivity;
var ResetPasswordRequest = models.ResetPasswordRequest;
var EmailNotification = models.EmailNotification;


class Allocator {

    //constructor, give users and one workflow from WorkflowTiming
    constructor(users, userIndex) {
        this.users = users;
        this.workflow = {};
        this.pointer = userIndex;
        this.count = 0;
    }

    getRightUser(ta_id) {
        let x = this;
        let taskUser = []

        return new Promise(function(resolve, reject) {
            return TaskActivity.find({
                where: {
                    TaskActivityID: ta_id
                }
            }).then(function(ta) {

                let constraints = JSON.parse(ta.AssigneeConstraints)[2];

                if (JSON.parse(ta.AssigneeConstraints)[0] === "instructor") {
                    return x.getInstructor(ta_id).then(function(instructor) {
                        taskUser.push(instructor);
                        resolve(taskUser);
                    });
                } else {


                    if (ta.Type === 'needs_consolidation' || ta.Type === 'completed') {
                        if (Object.keys(x.workflow).length < 1) {
                            var same = constraints.same_as[0];
                            console.log('same', same);
                            console.log('workflow', x.workflow);
                            taskUser.push(0);
                        } else {
                            var same = constraints.same_as[0];
                            console.log('same', same);
                            console.log('workflow', x.workflow);
                            taskUser.push(x.workflow[same][0]);
                        }
                    } else if (_.isEmpty(constraints)) {
                        //return the first one in the user list
                        taskUser.push(x.user(ta_id));
                        x.count++;
                    } else if (_.has(constraints, "same_as") && !(_.has(constraints, "not"))) {
                        var same = constraints.same_as[0];
                        console.log('same', same);
                        console.log('workflow', x.workflow);
                        taskUser.push(x.workflow[same][0]);
                    } else if (!(_.has(constraints, "same_as")) && _.has(constraints, "not")) {
                        while (_.contains(constraints.not, x.users[x.count])) {
                            x.count++;
                        }
                        taskUser.push(x.user(ta_id));
                        x.count++;
                    } else if (_.has(constraints, "same_as") && _.has(constraints, "not")) {
                        while (_.contains(constraints.not, x.users[x.count])) {
                            x.count++;
                        }
                        taskUser.push(x.user(ta_id));

                        if (ta.Type === 'grade_problem' && ta.NumberParticipants > 1) {
                            var same = constraints.same_as[0];
                            console.log('same', same);
                            console.log('workflow', x.workflow);
                            taskUser.push(x.workflow[same][0]);
                        }
                        x.count++;
                    }
                }
            }).then(function(done) {
                x.workflow[ta_id] = taskUser;
                resolve(taskUser);
            }).catch(function(err) {
                console.log("Error allocating the users");
                reject(err);
            });
        });
    }

    user(ta_id) {
        let x = this;
        let index = x.pointer + x.count;
        if (index == x.users.length) {
            x.count = 0 - x.pointer;
            index = x.pointer + x.count;
            return x.users[index];
        } else {
            return x.users[index];
        }
    }

    getInstructor(ta_id) {
        return new Promise(function(resolve, reject) {

            return TaskActivity.find({
                where: {
                    TaskActivityID: ta_id
                }
            }).then(function(ta_result) {
                return Assignment.find({
                    where: {
                        AssignmentID: ta_result.AssignmentID
                    }
                }).then(function(assignment) {
                    resolve(assignment.OwnerID);
                });
            }).catch(function(err) {
                console.log('Error retrieving instructor ID');
                console.log(err);
            });
        });
    }


    //-------------------------------------------------------
    // get taskActivityID linked to this task
    getTaskActivityID(task) {



        return new Promise(function(resolve, reject) {

            //console.log('Finding the taskActivityID...');

            var taskActivityID = [];


            TaskInstance.findAll({
                where: {
                    TaskInstanceID: task
                }
            }).then(function(results) {

                //taskActivityID.push(results.TaskActivityID);
                results.forEach(function(task) {
                    //tasks.push(task.TaskActivityID);
                    taskActivityID.push(task.TaskActivityID);
                }, this);

                //console.log('taskActivityID was found!');

                resolve(taskActivityID);

            }).catch(function(err) {
                console.log('Find taskActivityID failed!');
                console.log(err);
            });

        });

    }

    // get AssigneeConstraints linked to this taskActivityID
    getConstraints(ta_id) {

        return new Promise(function(resolve, reject) {
            var constraints;
            return TaskActivity.find({
                where: {
                    TaskActivityID: ta_id
                }
            }).then(function(result) {
                constraints = JSON.parse(result.AssigneeConstraints);
                //console.log(constraints);
                //console.log('All constraints were saved!');

                resolve(constraints);
            }).catch(function(err) {
                console.log('Find constraints failed!');
                reject(err);
            });
        });
    }

    //get user that will be removed from workflow instance
    getLateUser(task) {


        return new Promise(function(resolve, reject) {

            //console.log('Finding the late user...');

            var lateUser;


            TaskInstance.findAll({
                where: {
                    TaskInstanceID: task
                }
            }).then(function(results) {

                results.forEach(function(task) {
                    lateUser = task.UserID;
                }, this);

                //console.log('lateUser was found!');

                resolve(lateUser);

            }).catch(function(err) {
                console.log('Find workflowInstanceID failed!');
                console.log(err);
            });
        });
    }





    // get workflowInstanceID linked to this task
    getWorkflowInstanceID(task) {


        return new Promise(function(resolve, reject) {

            //console.log('Finding the workflowInstanceID...');

            var workflowInstanceID = [];


            TaskInstance.findAll({
                where: {
                    TaskInstanceID: task
                }
            }).then(function(results) {

                //workflowInstanceID.push(results.WorkflowInstanceID);
                results.forEach(function(workflow) {
                    workflowInstanceID.push(workflow.WorkflowInstanceID);
                }, this);

                //console.log('workflowInstanceID was found!');

                resolve(workflowInstanceID);

            }).catch(function(err) {
                console.log('Find workflowInstanceID failed!');
                console.log(err);
            });
        });
    }

    //get students in the workflowInstanceID - this students will be avoided
    getUsersFromWorkflowInstance(wi_id) {



        return new Promise(function(resolve, reject) {

            //console.log('Finding the users in the workflowInstanceID...');

            var avoid_users = [];

            TaskInstance.findAll({
                where: {
                    WorkflowInstanceID: wi_id
                }
            }).then(function(results) {

                results.forEach(function(user) {
                    avoid_users.push(user.UserID);
                }, this);


                //console.log('users in workflowInstanceID were found!');

                resolve(avoid_users);

            }).catch(function(err) {
                console.log('Find users in workflowInstanceID failed!');
                console.log(err);
            });
        });
    }

    //get ti_id where user is allocated within a wi_id
    getTaskInstancesWhereUserAlloc(user, wi_id, ti_id) {
        //console.log('Finding the TaskInstances...');


        return new Promise(function(resolve, reject) {

            var tempAllocRecord = [];
            tempAllocRecord.push(ti_id);

            TaskInstance.findAll({
                where: {
                    WorkflowInstanceID: wi_id,
                    UserID: user
                }
            }).then(function(results) {

                results.forEach(function(result) {
                    if (result.TaskInstanceID > ti_id) {
                        tempAllocRecord.push(result.TaskInstanceID);
                    }
                }, this);

                resolve(tempAllocRecord);
                //console.log('TaskInstances were found!');
                //tempAllocRecord.push(ti_id);


            }).catch(function(err) {
                console.log('Find TaskInstances failed!');
                console.log(err);
            });
        });
    }

    //get newUser
    getUser(avoid_users, users) {
        console.log(typeof users);
        var new_user;
        users.forEach(function(user) {
            //console.log(user);
            if (avoid_users.indexOf(user) === 0) {
                users.shift();
            }

        });
        new_user = users[0];
        //console.log(new_user);
        return new_user;

    }


    //updateDB
    updateUSER(taskid, newUser) {

        console.log('Updating task instance...')

        TaskInstance.update({
            UserID: newUser
        }, {
            where: {
                TaskInstanceID: taskid
            }
        }).then(function(result) {
            console.log('User updated! ', result.UserID)
        }).catch(function(err) {
            console.log('Cannot update user!');
            console.log(err);
        });

    }

    reallocate(ti_id, userList) {
        var x = this;
        var task = ti_id; //task instance needs to be given
        var constraint;
        var lateUser;
        var newUser;
        var avoid_users = [];
        var users = userList; // users need to be given
        //console.log(users);
        Promise.all([x.getLateUser(task)]).then(function(done) {
            lateUser = done[0];
            //console.log(lateUser);
        });
        Promise.all([x.getTaskActivityID(task), x.getWorkflowInstanceID(task)]).spread(function(taskActivityIDs, workflowInstanceIDs) {
            taskActivityIDs.map(function(ta_id) {
                //console.log(ta_id);
                workflowInstanceIDs.map(function(wi_id) {
                    //console.log(wi_id);
                    //console.log('im here......');
                    Promise.all([x.getUsersFromWorkflowInstance(wi_id), x.getTaskInstancesWhereUserAlloc(lateUser, wi_id, task)]).spread(function(avoidUsers, TaskInstances) {
                        //console.log(avoid_users);
                        avoidUsers.map(function(user) {
                            avoid_users.push(user);
                        });
                        //console.log(avoid_users);
                        newUser = x.getUser(avoid_users, users);
                        TaskInstances.map(function(task) {
                            x.updateUSER(task, newUser);
                        });
                        //console.log(newUser);
                    });
                });
            });
        });
    }


    //finds the students from the same section
    findSectionUsers(ai_id, callback) {
        AssignmentInstance.find({
            where: {
                AssignmentInstanceID: ai_id
            }
        }).then(function(result) {
            SectionUser.findAll({
                where: {
                    SectionID: result.SectionID
                }
            }).then(function(users) {
                var userArray = [];
                users.forEach(function(user){
                  userArray.push(user);
                });
                console.log("Users:",userArray);
                callback(users);
            }).catch(function(err) {
                console.log(err);
                throw Error("Cannot find TaskActivity!");
            });
        });
    }

    //finds group members
    findGroupUsers(g_id, callback) {

    }

    //finds group members
    findInstructor(ai_id, callback) {
        AssignmentInstance.find({
            where: {
                AssignmentInstanceID: ai_id
            }
        }).then(function(result) {
            Assignment.find({
                where: {
                    AssignmentID: result.AssignmentID
                },
                attributes: ["OwnerID"]
            }).then(function(instructor) {
                console.log("Inustructor:", instructor.OwnerID);
                callback(instructor.OwnerID);
            }).catch(function(err) {
                console.log(err);
                throw Error("Cannot find TaskActivity!");
            });
        });
    }




};




module.exports = Allocator;
