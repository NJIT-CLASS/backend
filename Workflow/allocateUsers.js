var models = require('../Model');
var Promise = require('bluebird');
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
var WorkflowInstance = models.WorkflowInstance;
var WorkflowActivity = models.WorkflowActivity;
var ResetPasswordRequest = models.ResetPasswordRequest;
var EmailNotification = models.EmailNotification;

function allocateUsers() { //constructor

};

//this function will get the assignmentActivityIDs in the DB
allocateUsers.prototype.getAssignments = function() {


    return new Promise(function(resolve, reject) {
        //console.log('Finding all assignments...');

        var assignmentIds = [];

        return Assignment.findAll({
            raw: true
        }).then(function(results) {

            results.forEach(function(assignment) {
                //console.log(assignment.AssignmentID);
                assignmentIds.push(assignment.AssignmentID);
            });

            //console.log('All assignments have been found!');

            resolve(assignmentIds);


        }).catch(function(err) {
            console.log('Find assignments failed!');
            reject(err);
        });

    });


}

//-----------------------------------------------------------------------------------------------------------
//this function will get the workflowActivityIDs in the DB
allocateUsers.prototype.getWorkflows = function(a_id) {

        return new Promise(function(resolve, reject) {
            //console.log('Finding all workflow activities associate with assignment ', a_id, '...');

            var workflowActivityIds = [];

            return WorkflowActivity.findAll({
                where: {
                    AssignmentID: a_id
                }
            }).then(function(results) {

                results.forEach(function(workflow) {
                    workflowActivityIds.push(workflow.WorkflowActivityID);
                }, this);

                //console.log('All workflow activities have been found!');

                resolve(workflowActivityIds);

            }).catch(function(err) {
                console.log('Find workflow activities failed!');
                reject(err);
            });
        });


    }
    //------------------------------------------------------------------------------------------------------------
    //this function will get the taskActivityIDs in the DB
allocateUsers.prototype.getTasks = function(wa_id, a_id) {
    return new Promise(function(resolve, reject) {

        //console.log('Finding task activities associate with workflow activity ', wa_id, '...');

        var taskActivityIds = [];

        return TaskActivity.findAll({
            where: {
                WorkflowActivityID: wa_id,
                AssignmentID: a_id
            }
        }).then(function(results) {

            results.forEach(function(task) {
                //tasks.push(task.TaskActivityID);
                taskActivityIds.push(task.TaskActivityID);
            }, this);

            //console.log('All task activities have been found!');

            resolve(taskActivityIds);

        }).catch(function(err) {
            console.log('Find task activities failed!');
            reject(err);
        });
    });
}

//-------------------------------------------------------------------------------------------------------------
//this function will get the AssignmentInstanceIDs in the DB
allocateUsers.prototype.getAssignmentInstances = function(a_id, sectionID) {

        return new Promise(function(resolve, reject) {

            //console.log('Finding all assignment instances associate with assignment ', a_id, 'and section ', sectionID);

            var AssignmentInstanceIds = [];

            return AssignmentInstance.findAll({
                where: {
                    AssignmentID: a_id,
                    SectionID: sectionID
                }
            }).then(function(results) {
                results.forEach(function(assignment) {
                    AssignmentInstanceIds.push(assignment.AssignmentInstanceID);
                }, this);
                //console.log('All AssignmentInstanceIds have been found!');
                resolve(AssignmentInstanceIds);
            }).catch(function(err) {
                console.log('Find assignment instances failed!');
                reject(err);
            });
        });

    }
    //-------------------------------------------------------------------------------------------------------------
    //this function will get the workflowInstanceIDs in the DB
allocateUsers.prototype.getWorkflowInstances = function(wa_id, ai_id) {
    return new Promise(function(resolve, reject) {
        //console.log('Finding all workflow instances associate with assignment ', ai_id, '...');

        var workflowInstanceIds = [];

        return WorkflowInstance.findAll({
            where: {
                WorkflowActivityID: wa_id,
                AssignmentInstanceID: ai_id
            }
        }).then(function(results) {
            results.forEach(function(workflow) {
                workflowInstanceIds.push(workflow.WorkflowInstanceID);
            }, this);

            //console.log('All workflow instances have been found!');

            resolve(workflowInstanceIds);

        }).catch(function(err) {
            console.log('Finding workflow instances failed!');
            reject(err);
        });
    });


}

//-------------------------------------------------------------------------------------------------------------
//this function will get the taskInstanceIDs in the DB
allocateUsers.prototype.getTaskInstances = function(ai_id, wi_id, ta_id) {
        return new Promise(function(resolve, reject) {

            //console.log('Finding task instances associate with workflow instances ', wi_id, '...');

            var taskInstanceIds = [];

            return TaskInstance.findAll({
                where: {
                    WorkflowInstanceID: wi_id,
                    AssignmentInstanceID: ai_id,
                    TaskActivityID: ta_id
                }
            }).then(function(results) {

                results.forEach(function(task) {
                    taskInstanceIds.push(task.TaskInstanceID);
                }, this);

                //console.log('All task instances have been found!');

                resolve(taskInstanceIds);

            }).catch(function(err) {
                console.log('Find task instances failed!');
                reject(err);
            });
        });


    }
    //--------------------------------------------------------------------------------------------------------------
    //get constraints per TA_id (TaskActivity_id)
allocateUsers.prototype.getConstraints = function(TA_id) {
        return new Promise(function(resolve, reject) {
            var constraints;
            return TaskActivity.find({
                where: {
                    TaskActivityID: TA_id
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
    //-------------------------------------------------------------------------------------------------------------
    //get all users from a particular section
allocateUsers.prototype.getUsersFromSection = function(sectionID, userStatus) {
        return new Promise(function(resolve, reject) {

            //console.log('Retrieving all users from section: ', sectionID, '...');

            var users = [];

            return SectionUser.findAll({
                where: {
                    SectionID: sectionID,
                    UserStatus: userStatus
                }
            }).then(function(results) {

                results.forEach(function(user) {
                    users.push(user.UserID);
                });
                resolve(users)
                    //console.log('All users have been found!');

            }).catch(function(err) {
                console.log('Cannot find all users!');
                reject(err);
            });
        });

    }
    //-------------------------------------------------------------------------------------------------------------
    //updating users array
    // allocateUsers.prototype.updateUsers = function(users){
    //   var temp = users.shift();
    //   users.push(temp);
    //   //console.log(users);
    //   return users;
    // }
    //-----------------------------------------------------------------------------------------------------------------
    //get the right user to the task instance following the constraints in the according task activity
allocateUsers.prototype.getUser = function(ta_id, task, users, constraints, allocRecord) { //getting the user according to constraints
        var i = 0; //???
        var user = -1; // there is not userID = 0;
        var avoid_users = [];
        //console.log(users);
        //console.log(constraints);
        if (Object.keys(constraints).length === 0) {
            //console.log('constraints are null....');
            user = users.shift();
            users.push(user);
            //console.log(user);
            allocRecord.push([ta_id, user]);
        } else {
            //console.log('we have constraints.....');
            if (Object.keys(constraints).length > 0) {
                var constraints_keys = Object.keys(constraints);
                //console.log(constraints_keys);
                constraints_keys.forEach(function(key) {
                    //console.log(key);
                    if (key.localeCompare('same_as') === 0) {
                        //console.log(constraints.same_as);
                        var tmp = constraints.same_as;
                        tmp.forEach(function(t) {
                            allocRecord.forEach(function(arr) {
                                if (arr.indexOf(t) === 0) {
                                    user = arr[1];
                                    console.log(user);
                                    allocRecord.push([ta_id, user]);
                                    return user;
                                }
                            });
                        });
                    } else { //not
                        //console.log(constraints.not);
                        var temp = constraints.not;
                        //console.log(temp[0]);
                        //console.log(allocRecord);

                        temp.forEach(function(t) {
                            allocRecord.forEach(function(arr) {
                                if (arr.indexOf(t) === 0) {
                                    avoid_users.push(arr[1]);
                                    //console.log(avoid_users);
                                }
                            });
                        });
                        users.forEach(function(u) {
                            console.log(u);
                            if (avoid_users.indexOf(u) === -1) {
                                //console.log(u);
                                user = u;
                                allocRecord.push([ta_id, user]);
                                //console.log(allocRecord);
                                return user;
                            }
                        });
                        console.log('============');
                    }
                });
            }
        }
    }
    //------------------------------------------------------------------------------------------------------------------------------------------
    //this function will write to DB
allocateUsers.prototype.updateDB = function(user, ti_id) {

    return new Promise(function(resolve, reject) {

        return TaskInstance.update({
            UserID: user
        }, {
            where: {
                TaskInstanceID: ti_id
            }
        }).then(function(result) {
            console.log('DB was updated!');
            resolve(result);
        }).catch(function(err) {
            reject(err);
        });

    });
}









//-----------------------------------------------------------------------------------------------------------------------------------------------------

module.exports.allocateUsers = allocateUsers;
