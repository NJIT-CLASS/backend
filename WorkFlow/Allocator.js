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

    //constructor
    constructor(users, workflow) {
        this.users = users;
        this.workflow = workflow;
        this.pointer = 0;
    }

    getUser() {
        let x = this;
        let taskUser = [];
        let count = 0;
        return TaskActivity.find({
            where: {
                TaskActivityID: x.workflow.tasks[x.pointer].id
            }
        }).then(function(ta) {
            //console.log(x.users);
            //console.log(ta.TaskActivityID);
            let constraints = JSON.parse(ta.AssigneeConstraints)[2];
            console.log(ta.AssigneeConstraints);
            if (ta.Type === 'needs_consolidation' || ta.Type === 'complete') {
                //do nothing
            } else if (_.isEmpty(constraints)) {
                //return the first one in the user list
                console.log('here1');
                taskUser.push(x.users[count]);
            } else if (_.has(constraints, "same_as") && !(_.has(constraints, "not"))) {
                console.log('here2');
                var same = constraints.same_as[0];
                taskUser.push(x.users[same]);
            } else if (!(_.has(constraints, "same_as")) && _.has(constraints, "not")) {
                console.log('here3');
                while (_.contains(constraints.not, x.users[count])) {
                    count++;
                }
                taskUser.push(x.users[count]);
            } else if (_.has(constraints, "same_as") && _.has(constraints, "not")) {
                console.log('here4');
                while (_.contains(constraints.not, x.users[count])) {
                    count++;
                }
                var same = constraints.same_as[0];
                taskUser.push(x.users[count]);
                taskUser.push(x.users[same]);
            }
        }).then(function(done) {
            var first = x.users.shift();
            x.users.push(first);
            x.pointer++;
            return taskUser;
        });


    }

    // allocate(sectionid, ai_id) {
    //     var users = factory.getUsersFromSection(sectionid).sort();
    //     var workflowCollection = getWorkflowCollection(ai_id);
    //
    //     return Promise.mapSeries(workflowCollection, function(wi_id) {
    //
    //         return getTaskCollection(wi_id).then(function(taskCollection) {
    //
    //             return Promise.mapSeries(taskCollection, function(ti_array) {
    //
    //                 return Promise.mapSeries(ti_array, function(ti_id) {
    //
    //                     return getTask(ti_id).then(function(ti) {
    //
    //                         return getConstraints(ti.TaskActivityID).then(function(constraints) {
    //
    //                         });
    //
    //                     });
    //
    //                 });
    //
    //             });
    //
    //         });
    //
    //     });
    //
    // }

    getWorkflowCollection(ai_id) {
        return new Promise(function(resolve, reject) {
            return AssignmentInstance.find({
                where: {
                    AssignmentInstanceID: ai_id
                }
            }).then(function(ai_result) {
                resolve(JSON.parse(ai_result.WorkflowCollection));
            }).catch(function(err) {
                console.log("cannot find the workflow collection");
                reject(err);
            });
        });
    }

    getTaskCollection(wi_id) {
        return new Promise(function(resolve, reject) {
            return WorkflowInstance.find({
                where: {
                    WorkflowInstance: wi_id
                }
            }).then(function(wi_result) {
                resolve(JSON.parse(wi_result.TaskCollection));
            }).catch(function(err) {
                console.log("cannot find the task collection");
                reject(err);
            });
        });
    }

    getTask(ti_id) {
        return new Promise(function(resolve, reject) {
            return TaskInstance.find({
                where: {
                    TaskInstanceID: ti_id
                }
            }).then(function(ti_result) {
                resolve(ti_result);
            }).catch(function(err) {
                console.log("cannot find the task ", ti_id);
                reject(err);
            });
        });
    }

    getConstraints(ta_id) {
        return new Promise(function(resolve, reject) {
            return TaskActivity.find({
                where: {
                    TaskActivityID: ta_id
                }
            }).then(function(ta_result) {
                resolve(ta_result.AssigneeConstraints);
            }).catch(function(err) {
                console.log("cannot find the task ", ti_id);
                reject(err);
            });
        });
    }





};




module.exports = Allocator;
