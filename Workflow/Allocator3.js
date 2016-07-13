var models = require('../Model');
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

var WorkflowInstance = models.WorkflowInstance;
var WorkflowActivity = models.WorkflowActivity;
var ResetPasswordRequest = models.ResetPasswordRequest;

//Constructor for Allocator3
function Allocator3() {

};
//------------------------------------------------------------------------------------- d
Allocator3.prototype.getAssignmentsFromAcitivity = function() {
    var assignments = [];

    Assignment.findAll({
        raw: true
    }).then(function(results) {
        results.forEach(function(assignment) {
            assignments.push(assignment.AssignmentID);
        }, this);
        console.log('Assignment', assignments);
    }).catch(function(err) {
        console.log(err);
    });
    return assignments;
}


//-------------------------------------------------------------------------------------

Allocator3.prototype.getWorkflowsFromActivity = function(a_id) {
        var workflows = [];
        WorkflowActivity.findAll({
            where: {
                AssignmentID: a_id
            }
        }).then(function(results) {
            results.forEach(function(workflow) {
                workflows.push(workflow.WorkflowActivityID);
            }, this);

            console.log('WorkflowActivity', workflows);

        }).catch(function(err) {
            console.log(err);
        });

        return workflows;
    }
    //-------------------------------------------------------------------------------------

Allocator3.prototype.getWorkflowInstances = function(a_id) {
    var workflows = [];

    WorkflowActivity.find({
        where: {
            AssignmentID: a_id
        }
    }).then(function(workflowActivity) {
        WorkflowInstance.findAll({
            where: {
                WorkflowActivityID: workflowActivity.WorkflowActivityID
            }
        }).then(function(results) {
            results.forEach(function(workflow) {
                workflows.push(workflow.WorkflowInstanceID);
            }, this);

            console.log('WorkflowInstance', workflows);

        });
    }).catch(function(err) {
        console.log(err);
    });

    return workflows;

}

//-------------------------------------------------------------------------------------

Allocator3.prototype.getTasksFromActivity = function(wa_id) {
    var tasks = {};

    TaskActivity.findAll({
        where: {
            WorkflowActivityID: wa_id
        }
    }).then(function(results) {
        results.forEach(function(task) {
            //tasks.push(task.TaskActivityID);
            tasks[task.VisualID] = task.TaskActivityID
        }, this);

        console.log('TaskActivity', tasks);

    }).catch(function(err) {
        console.log(err);
    });

    return tasks;
}


//-------------------------------------------------------------------------------------

Allocator3.prototype.getTaskInstances = function(wi_id) {
    var tasks = [];
    TaskInstance.findAll({
        where: {
            WorkflowInstanceID: wi_id
        }
    }).then(function(results) {
        results.forEach(function(task) {
            tasks.push(task.TaskInstanceID);
        }, this);

        console.log(tasks);

    }).catch(function(err) {
        console.log(err);
    });

    return tasks;
}


//-------------------------------------------------------------------------------------

Allocator3.prototype.updateUH = function(taskid, newUser) {
    var newUH = [];
    var UserHistory = [];

    TaskInstance.findAll({
        where: {
            TaskInstanceID: taskid
        }
    }).then(function(results) {
        for (var task in results) {
            UserHistory.push(task.UserHistory);
        }
    }).catch(function(err) {
        console.log(err);
    });

    if (UserHistory === null || typeof UserHistory === 'undefined') {
        //If UserHistory is null update the UserHistory

        newUH.push({
            'regular': newUser
        });


        TaskInstance.Update({
            UserHistory: JSON.stringify(newUH)
        }, {
            where: {
                TaskInstanceID: taskid
            }
        }).catch(function(err) {
            console.log(err);
        });

    } else {
        aJson = JSON.parse(UserHistory)

        for (var j in aJson) {
            newUH.push(j);
        }

        newUH.push({
            'regular': newUser
        });

        TaskInstance.Update({
            UserHistory: JSON.stringify(newUH)
        }, {
            where: {
                TaskInstanceID: taskid
            }
        }).catch(function(err) {
            console.log(err);
        });

        console.log(UserHistory);

    }
}

//-------------------------------------------------------------------------------------

Allocator3.prototype.updateUSER = function(taskid, newUser) {
    TaskInstance.Update({
        UserID: newUser
    }, {
        where: {
            TaskInstanceID: taskid
        }
    }).catch(function(err) {
        console.log(err);
    });
}

//-------------------------------------------------------------------------------------


Allocator3.prototype.getStudents = function(sectionid) {

    var shuffle = function(array) {
        var currentIndex = array.length,
            temporaryValue, randomIndex;

        // While there remain elements to shuffle...
        while (0 !== currentIndex) {

            // Pick a remaining element...
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex -= 1;

            // And swap it with the current element.
            temporaryValue = array[currentIndex];
            array[currentIndex] = array[randomIndex];
            array[randomIndex] = temporaryValue;
        }

        return array;
    }

    SectionUser.findAll({
        where: {
            SectionID: sectionid
        }
    }).then(function(results) {
        shuffle(results);

        console.log(results);

        return results;
    }).catch(function(err) {
        console.log(err);
    });


}

//-------------------------------------------------------------------------------------

Allocator3.prototype.inArray = function(needle, haystack) {
    var length = haystack.length;
    for (var i = 0; i < length; i++) {
        if (haystack[i] == needle) return true;
    }
    return false;
}

//-------------------------------------------------------------------------------------

/*
  Find list of Users through SectionUser that are in the section
*/

Allocator3.prototype.getUsersFromSection = function(sectionid) {

    var users = [];

    return new Promise(function(resolve, reject) {
        SectionUser.findAll({
            where: {
                SectionID: sectionid
            }
        }).then(function(results) {
            results.forEach(function(user) {
                users.push(user.UserID);
            });

            //console.log(users);

            resolve(users);
        }).catch(function(err) {
            console.log(err);
        });
    })
}

/*
  Find the list of WorkflowActivities associated with the Assignment
*/

Allocator3.prototype.getWorkflowActivities = function(a_id) {

    return new Promise(function(resolve, reject) {
        Assignment.find({
            where: {
                AssignmentID: a_id
            }
        }).then(function(result) {

            console.log('WorkflowActivityIDs :', result.WorkflowActivityIDs.toString('utf8'));
            resolve(JSON.parse(result.WorkflowActivityIDs.toString('utf8')));

        }).catch(function(err) {
            console.log(err);
        });

    });
}

/*
  Find the list of TaskActivities associated with the WorkflowActivity
*/

Allocator3.prototype.getTaskActivityCollection = function(wa_id) {
    //creates new promise
    return new Promise(function(resolve, reject) {
        //find the WorkflowActivity where WorkflowActivityID equals wa_id
        WorkflowActivity.find({
            where: {
                WorkflowActivityID: wa_id
            }
        }).then(function(result) {
            console.log('TaskActivityIDs :', result.TaskActivityCollection);
            //returns a JSON object of TaskActivityCollection
            resolve(JSON.parse(result.TaskActivityCollection));
        }).catch(function(err) {
            console.log(err);
        });

    });
}

/*
  Create AssignmentInstances
*/

Allocator3.prototype.createAssignmentInstances = function(a_id, sectionid, startDate, wf_timing) {
    //creates new promise
    return new Promise(function(resolve, reject) {
        //creates new AssignmentInstance
        AssignmentInstance.create({
            //creates attributes
            AssignmentID: a_id,
            SectionID: sectionid,
            StartDate: startDate,
            WorkflowTiming: wf_timing
        }).then(function(assignmentInstance) {
            console.log('Assignment instance created: ', assignmentInstance.AssignmentInstanceID);
            //return AssignmentInstanceID
            resolve(assignmentInstance.AssignmentInstanceID);
        }).catch(function(err) {
            console.log(err);
            reject(err);
        });
    });
}

/*
  Obtain workflowTiming through Assignment Instance ID
*/

Allocator3.prototype.getWorkflowTiming = function(ai_id) {
    //creates new promise
    return new Promise(function(resolve, reject) {
        //find the AssignmentInstance object where AssignmentInstanceID equals ai_id
        AssignmentInstance.find({
            where: {
                AssignmentInstanceID: ai_id
            }
        }).then(function(result) {
            //returns WorkflowTiming found
            resolve(result.WorkflowTiming);
        }).catch(function(err) {
            console.log(err);
            reject(err);
        });
    });
}


/*
  Create WorkflowInstances, and TaskInstances
*/

Allocator3.prototype.createInstances = function(sectionid, ai_id) {
    var users;
    var workflowTiming;
    //creates seperate array to store all the workflow instances created
    var workflowArray = [];

    Promise.all([this.getUsersFromSection(sectionid), this.getWorkflowTiming(ai_id)]).then(function(result) {
        users = result[0];
        workflowTiming = JSON.parse(result[1]);

        //iterate through all users from the section
        users.forEach(function(user) {
            console.log(user);
            //iterate through all the workflows
            Promise.map(workflowTiming.workflows, function(workflow, index) {
                //creates seperate array to store all task instances created within the workflow
                var taskArray = [];
                var wi_id;

                //create workflow instances for each user
                WorkflowInstance.create({
                    //create attributes.
                    WorkflowActivityID: workflow.id,
                    AssignmentInstanceID: ai_id,
                    StartDate: workflow.startDate
                }).then(function(workflowInstance) {
                    //push the resulting workflowInstance object from callback to workflow Array
                    workflowArray.push(workflowInstance.WorkflowInstanceID);
                    console.log('workflowArray ', workflowArray);
                    wi_id = workflowInstance.WorkflowInstanceID;
                    //iterate through all the tasks stored under workflows
                    Promise.map(workflowTiming.workflows[index].tasks, function(task) {
                        //create individual task instances
                        TaskInstance.create({
                            //create attributes
                            UserID: user,
                            TaskActivityID: task.id,
                            WorkflowInstanceID: workflowInstance.WorkflowInstanceID,
                            AssignmentInstanceID: ai_id,
                            Status: 'not_yet_started',
                            Data: task.DueType,
                            //PreviousTask: taskArray
                        }).then(function(taskInstance) {
                            //push the resulting workflowInstance object from callback to workflow Array
                            taskArray.push(taskInstance.TaskInstanceID);

                            WorkflowInstance.update({
                                TaskCollection: taskArray.sort()

                            }, {
                                where: {
                                    WorkflowInstanceID: wi_id
                                }
                            });

                        }).catch(function(err) {
                            console.log(err);
                        });
                    }).then(function(done) {
                        AssignmentInstance.update({
                            WorkflowCollection: workflowArray.sort()
                        }, {
                            where: {
                                AssignmentInstanceID: ai_id
                            }
                        }).catch(function(err) {
                            console.log(err);
                        });
                    });
                });
            });
        });

    });


}

module.exports.Allocator3 = Allocator3;
