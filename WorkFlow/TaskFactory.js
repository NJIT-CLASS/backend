/**
 * Created by cesarsalazar on 4/20/16.
 */

var models = require('../Model');
var Promise = require('bluebird');
var moment = require('moment');
var TreeModel = require('tree-model');


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

var Allocator = require('./Allocator.js');

tree = new TreeModel();


class TaskFactory {

    getUsersFromSection(sectionid) {
        console.log('Retrieving all users from section: ', sectionid, '...');
        var users = [];
        //Promise the users are returned
        return new Promise(function(resolve, reject) {

            SectionUser.findAll({
                where: {
                    SectionID: sectionid
                }
            }).then(function(results) {
                results.forEach(function(user) {
                    users.push(user.UserID);
                });
                console.log('All users have been found!');
                resolve(users);
            }).catch(function(err) {
                console.log('Cannot find all users!');
                console.log(err);
            });
        });
    }

    createAssignmentInstances(a_id, sectionIDs, startDate, wf_timing) {
        var x = this;

        console.log('Creating assignment instance...');
        //Iterate through all sectionIDs passed in and promise each is returned before next execution
        return Promise.map(sectionIDs, function(sectionid) {
            //creates new AssignmentInstance
            return AssignmentInstance.create({
                //creates attributes
                AssignmentID: a_id,
                SectionID: sectionid,
                StartDate: startDate,
                WorkflowTiming: wf_timing

            }).then(function(assignmentInstance) {

                console.log('Assignment instance created! : ', assignmentInstance.AssignmentInstanceID);
                x.updateWorkflowTiming(wf_timing);
                //return AssignmentInstanceID

            }).catch(function(err) {
                console.log('Cannot create assignment instance!');
                console.log(err);
            });
        });
    }

    updateWorkflowTiming(wf_timing) {
        return Promise.mapSeries(wf_timing.workflows, function(workflow, index) {
            return Promise.mapSeries(wf_timing.workflows[index].tasks, function(task) {
                TaskActivity.update({
                    DueType: task.DueType
                }, {
                    where: {
                        TaskActivityID: task.id
                    }
                }).catch(function(err) {
                    console.log('Update WorkflowTiming Failed!');
                    console.log(err);
                });

            });
        });
    }

    getWorkflowTiming(ai_id) {
        console.log('Finding WorkflowTiming...');
        //creates new promise
        return new Promise(function(resolve, reject) {
            //find the AssignmentInstance object where AssignmentInstanceID equals ai_id
            AssignmentInstance.find({
                where: {
                    AssignmentInstanceID: ai_id
                }
            }).then(function(result) {
                //returns WorkflowTiming found
                console.log('WorkflowTiming has been found!');

                resolve(result.WorkflowTiming);

            }).catch(function(err) {
                console.log('Finding WorkflowTiming failed!');
                console.log(err);
                reject(err);
            });
        });
    }

    updatePreviousAndNextTasks(ai_id) {
        console.log('Updating all previous and next tasks...');

        //Finding all workflow instances using ai_id
        return WorkflowInstance.findAll({
            where: {
                AssignmentInstanceID: ai_id
            }
        }).then(function(workflows) {

            console.log('All workflows found!');
            //Iterate through all the workflow instances returned
            return Promise.mapSeries(workflows, function(workflow, index) {

                var taskCollection = JSON.parse(workflow.TaskCollection);
                var previousTask = null;

                console.log('Updating previous and next tasks in workflow: ', workflow.WorkflowInstanceID);
                return Promise.mapSeries(taskCollection, function(task, index) {

                    if (taskCollection[index + 1] !== null || typeof taskCollection[index + 1] !== undefined) {
                        return TaskInstance.update({
                            PreviousTask: previousTask,
                            NextTask: taskCollection[index + 1]
                        }, {
                            where: {
                                TaskInstanceID: task
                            }
                        }).then(function(result) {
                            previousTask = task;
                        });
                    } else {
                        return TaskInstance.update({
                            PreviousTask: previousTask,
                            NextTask: null
                        }, {
                            where: {
                                TaskInstanceID: task
                            }
                        });
                    }
                });
            });
        }).catch(function(err) {
            console.log('No workflow found!');
            console.log(err);
        });
    }

    findPreviousTasks(ti_id, previousTasks) {
        var x = this;
        return new Promise(function(resolve, reject) {
            TaskInstance.find({
                where: {
                    TaskInstanceID: ti_id
                }
            }).then(function(taskInstance) {
                var p = previousTasks;
                if (taskInstance.PreviousTask === null || typeof taskInstance.PreviousTask === undefined) {
                    resolve(null);
                } else {
                    console.log('Previous Task', taskInstance.PreviousTask);
                    Promise.map(JSON.parse(taskInstance.PreviousTask), function(ti_id) {
                        p.push(ti_id);
                    }).then(function(done) {
                        x.findPreviousTasks(JSON.parse(taskInstance.PreviousTask)[0], p).then(function(result) {
                            resolve(p);
                        });
                    });
                }
            }).catch(function(err) {
                console.log(err);
                throw new Error('Cannot find previous tasks');
            });
        });
    }

    getNumberParticipants(taskActivityID) {
        console.log('Finding number of participants in task activity: ', taskActivityID, '...');
        var numParticipants = []
        return new Promise(function(resolve, reject) {
            return TaskActivity.find({
                where: {
                    TaskActivityID: taskActivityID
                }
            }).then(function(result) {
                //console.log('NumberParticipants ', result.NumberParticipants);
                for (var i = 0; i < result.NumberParticipants; i++) {
                    numParticipants.push(0);
                }

                resolve(numParticipants);
            }).catch(function(err) {
                console.log('Finding number of participants failed!');
                console.log(err);
                reject(numParticipants);
            });
        });
    }

    updateAssigneeConstraints(ta_array) {
        console.log('Updating Assignee Constraints...');

        if (typeof ta_array === undefined) {
            console.log('ta_array undefined.');
        } else {
            //Iterate through ta_array
            return Promise.mapSeries(ta_array, function(task) {
                return TaskActivity.find({
                    where: {
                        TaskActivityID: task
                    }
                }).then(function(result) {
                    var assigneeConstraints = JSON.parse(result.AssigneeConstraints);
                    //Loop through Assignee Constraints
                    for (var item in assigneeConstraints[2]) {
                        var temp = [];
                        assigneeConstraints[2][item].forEach(function(index) {
                            temp.push(ta_array[index]);
                        });
                        assigneeConstraints[2][item] = temp;
                        console.log("AssigneeConstraints", temp);
                    }
                    return TaskActivity.update({
                        AssigneeConstraints: assigneeConstraints
                    }, {
                        where: {
                            TaskActivityID: result.TaskActivityID
                        }
                    });
                });
            }).catch(function(err) {
                console.log("Updating Assignee Constraint Failure")
                console.log(err);
            });
        };


    }

    createAssignment(assignment) {
        var x = this;
        var TA_array = [];
        console.log('Creating assignment activity...');
        //Create assignment activity
        return Assignment.create({
            OwnerID: assignment.AA_userID,
            Name: assignment.AA_name,
            CourseID: assignment.AA_course,
            Instructions: assignment.AA_instructions,
            Type: assignment.AA_type,
            DisplayName: assignment.AA_display_name,
            SectionID: assignment.AA_section,
            SemesterID: assignment.AA_semester,
            GradeDistribution: assignment.AA_grade_distribution,
            Documentation: assignment.AA_documentation,
        }).then(function(assignmentResult) {
            //Keep track all the workflow activities created under assignment
            var WA_array = [];
            console.log('Assignment creation successful!');
            console.log('AssignmentID: ', assignmentResult.AssignmentID);
            //Iterate through array of workflow activities (Created WorkflowActivity in order)
            return Promise.mapSeries(assignment.WorkflowActivity, function(workflow, index) {
                console.log('Creating workflow activity...');
                return WorkflowActivity.create({
                    AssignmentID: assignmentResult.AssignmentID,
                    Type: workflow.WA_type,
                    Name: workflow.WA_name,
                    GradeDistribution: workflow.WA_grade_distribution,
                    NumberOfSets: workflow.WA_number_of_sets,
                    Documentation: workflow.WA_documentation,
                    GroupSize: workflow.WA_default_group_size,
                    WorkflowStructure: workflow.WorkflowStructure,
                }).then(function(workflowResult) {
                    console.log('Workflow creation successful!');
                    console.log('WorkflowActivityID: ', workflowResult.WorkflowActivityID);
                    WA_array.push(workflowResult.WorkflowActivityID);
                    //Keep track all the task activities within each workflow
                    TA_array = [];
                    //Iterate through TaskActivity array in each WorkflowActivity (Create TaskActivity in order)
                    return Promise.mapSeries(assignment.WorkflowActivity[index].Workflow, function(task) {
                        console.log('Creating task activity...');
                        return TaskActivity.create({
                            WorkflowActivityID: workflowResult.WorkflowActivityID,
                            AssignmentID: workflowResult.AssignmentID,
                            Type: task.TA_type,
                            Name: task.TA_name,
                            FileUpload: task.TA_file_upload,
                            DueType: task.TA_due_type,
                            StartDelay: task.TA_start_delay,
                            AtDurationEnd: task.TA_at_duration_end,
                            WhatIfLate: task.TA_what_if_late,
                            DisplayName: task.TA_display_name,
                            Documentation: task.TA_documentation,
                            OneOrSeparate: task.TA_one_or_separate,
                            AssigneeConstraints: task.TA_assignee_constraints,
                            SimpleGrade: task.TA_simple_grade,
                            IsFinalGradingTask: task.TA_is_final_grade,
                            Instructions: task.TA_overall_instructions,
                            Rubric: task.TA_rubric,
                            Fields: task.TA_fields,
                            AllowReflection: task.TA_allow_reflection,
                            AllowRevision: task.TA_allow_revisions,
                            AllowAssessment: task.TA_allow_assessment,
                            NumberParticipants: task.TA_number_participant,
                            TriggerConsolidationThreshold: task.TA_trigger_consolidation_threshold,
                            FunctionType: task.TA_function_type,
                            AllowDispute: task.TA_allow_dispute,
                            LeadsToNewProblem: task.TA_leads_to_new_problem,
                            LeadsToNewSolution: task.TA_leads_to_new_solution,
                            VisualID: task.TA_visual_id,
                            MinimumDuration: task.TA_minimum_duration
                        }).then(function(taskResult) {
                            console.log('Task creation successful!');
                            console.log('TaskActivityID: ', taskResult.TaskActivityID);
                            TA_array.push(taskResult.TaskActivityID);
                        }).catch(function(err) {
                            console.log("Workflow creation failed");
                            //Loggin error
                            console.log(err);
                            return false;
                        });
                    }).then(function(done) {
                        //Replace all fake IDs within workflow activity grade distribution with real WorkflowActivityID
                        //(Assumed all task activities are created in order)
                        var WA_gradeDistribution = {};
                        var WA_count = 0;
                        for (var item in assignment.WorkflowActivity[index].WA_grade_distribution) {
                            WA_gradeDistribution[TA_array[WA_count]] = assignment.WorkflowActivity[index].WA_grade_distribution[item];
                            WA_count++;
                        }
                        //Update the list of TaskActivities in WorkflowActivity and Grade Distribution
                        WorkflowActivity.update({
                            TaskActivityCollection: TA_array,
                            GradeDistribution: WA_gradeDistribution
                        }, {
                            where: {
                                WorkflowActivityID: workflowResult.WorkflowActivityID
                            }
                        });
                        //Update AssigneeConstraints replace fake IDs with real TaskActivityID
                        x.updateAssigneeConstraints(TA_array);
                        //reset TA_array
                        TA_array = [];
                    }).catch(function(err) {
                        console.log("Workflow creation failed");
                        //Loggin error
                        console.log(err);
                        return false;
                    });
                }).then(function(done) {
                    //After all WorkflowActivities are created update the list of WorkflowActivities in Assignment
                    var AA_gradeDistribution = {};
                    var AA_count = 0;
                    for (var item in assignment.AA_grade_distribution) {
                        AA_gradeDistribution[WA_array[AA_count]] = assignment.AA_grade_distribution[item];
                        AA_count++;
                    }
                    Assignment.update({
                        WorkflowActivityIDs: WA_array,
                        GradeDistribution: AA_gradeDistribution
                    }, {
                        where: {
                            AssignmentID: assignmentResult.AssignmentID
                        }
                    });
                    TA_array = []
                });
            }).catch(function(err) {
                // err is the reason why rejected the promise chain returned to the transaction callback
                console.log("Assignment creation failed");
                //Loggin error
                console.log(err);
                return false;
            });
        });
    }

    createWorkflowInstance(workflow, ai_id) {
        return new Promise(function(resolve, reject) {
            WorkflowInstance.create({
                //create attributes.
                WorkflowActivityID: workflow.id,
                AssignmentInstanceID: ai_id,
                StartTime: workflow.startDate
            }).then(function(result) {
                resolve(result.WorkflowInstanceID);
            }).catch(function(err) {
                console.log(err);
                reject(err);
            });
        });
    }

    createTaskInstance(task, userid, wi_id, ai_id) {
        return new Promise(function(resolve, reject) {
            //var endDate = new Date(new Date(startDate).getTime() + task.DueType[1]);
            TaskActivity.find({
                where: {
                    TaskActivityID: task.id
                }
            }).then(function(ta_result) {

                if (ta_result.Type == 'needs_consolidation' || ta_result.Type == 'completed') {
                    TaskInstance.create({
                        //create attributes
                        UserID: userid,
                        TaskActivityID: task.id,
                        WorkflowInstanceID: wi_id,
                        AssignmentInstanceID: ai_id,
                        Status: 'automatic',
                    }).then(function(result) {
                        resolve([result.TaskInstanceID]);
                    }).catch(function(err) {
                        console.log(err);
                        reject(err);
                    });
                } else {
                    TaskInstance.create({
                        //create attributes
                        UserID: userid,
                        TaskActivityID: task.id,
                        WorkflowInstanceID: wi_id,
                        AssignmentInstanceID: ai_id,
                        Status: 'not_yet_started',
                    }).then(function(result) {
                        resolve([result.TaskInstanceID]);
                    }).catch(function(err) {
                        console.log(err);
                        reject(err);
                    });
                }
            });
        });
    }

    createInstances(sectionid, ai_id) {
        console.log('Initiating create instances function...')
        var x = this;

        //creates seperate array to store all the workflow instances created
        var workflowArray = [];

        // this.getUsersFromSection(sectionid) - returns all users from section(sectionid)
        // this.getWorkflowTiming(ai_id) - returns WorkflowTiming from Assignment Instance.
        return Promise.all([x.getUsersFromSection(sectionid), x.getWorkflowTiming(ai_id)]).spread(function(users, workflowTiming) {

            console.log('Found number of users: ', users);
            console.log('Found workflowTiming: ', JSON.parse(workflowTiming));
            console.log('Going through each user...');

            //iterate through all users from section
            return Promise.mapSeries(users, function(user, userIndex) {
                return Promise.mapSeries(JSON.parse(workflowTiming).workflows, function(workflow, index) {
                    console.log('workflow: ', workflow.id);
                    //creates seperate array to store all task instances created within the workflow
                    var taskArray = [];
                    //Store the current WorkflowInstanceID once it is created
                    var wi_id;

                    var allocator = new Allocator(users, userIndex);
                    var startDate = new Date(JSON.parse(workflowTiming).workflows[index].startDate);
                    console.log('Creating workflow instance...');
                    return x.createWorkflowInstance(workflow, ai_id).then(function(workflowInstanceId) {
                        //push the resulting workflowInstance object from callback to workflow Array
                        workflowArray.push(workflowInstanceId);
                        //store WorkflowInstanceID created
                        wi_id = workflowInstanceId;
                        console.log('Going through individual tasks...');
                        //iterate through all the tasks stored under workflows
                        return Promise.mapSeries(JSON.parse(workflowTiming).workflows[index].tasks, function(task, num) {
                            console.log('task: ', task.id);
                            return allocator.getRightUser(task.id).then(function(allocUsers) {
                                var task_collection = [];
                                return Promise.mapSeries(allocUsers, function(a_user) {
                                    return x.createTaskInstance(task, a_user, workflowInstanceId, ai_id).then(function(createTaskResult) {
                                        console.log('taskInstanceId: ', createTaskResult[0]);
                                        //push the resulting workflowInstance object from callback to workflow Array

                                        task_collection.push(createTaskResult[0]);
                                        console.log("DueType", task.DueType);
                                        if (num === 0) {
                                            var endDate = moment(JSON.parse(workflowTiming).workflows[index].startDate);
                                            if (task.DueType[0] === "duration") {
                                                endDate.add(task.DueType[1], 'minutes');
                                            } else if (task.DueType[0] === "specificTime") {
                                                endDate = task.DueType[1];
                                            }
                                            TaskInstance.update({
                                                StartDate: startDate,
                                                EndDate: endDate,
                                                Status: 'started'
                                            }, {
                                                where: {
                                                    TaskInstanceID: createTaskResult[0]
                                                }
                                            });
                                        }
                                    }).catch(function(err) {
                                        console.log(err);
                                    });
                                }).then(function(done) {
                                    taskArray.push(task_collection);
                                });
                            });
                        }).then(function(done) {
                            console.log('Updating task collection in workflow instance...');
                            //Update TaskCollection
                            WorkflowInstance.update({
                                TaskCollection: taskArray.sort(function(a, b) {
                                    return a - b;
                                })
                            }, {
                                where: {
                                    WorkflowInstanceID: wi_id
                                }
                            });
                        });
                    });
                });
            });
        }).then(function(done) {
            console.log('Updating workflow collection in assignment instance...');
            //Update WorkflowCollection
            AssignmentInstance.update({
                WorkflowCollection: workflowArray.sort(function(a, b) {
                    return a - b;
                })
            }, {
                where: {
                    AssignmentInstanceID: ai_id
                }
            }).then(function(done) {
                return x.updatePreviousAndNextTasks(ai_id);
            }).catch(function(err) {
                console.log(err);
            });
        }).catch(function(err) {
            console.log(err);
        });
    }

    getTree(wa_id, callback) {
        WorkflowActivity.find({
            where: {
                WorkflowActivityID: wa_id
            }
        }).then(function(wa_result) {
            let tree = new TreeModel();
            let treeRoot = tree.parse(JSON.parse(wa_result.WorkflowStructure).model);

            callback(treeRoot);
        }).catch(function(err) {
            console.log(err);
            console.log("getTree(wa_id, callback) failed retrieving tree");
        });
    }
}


module.exports = TaskFactory;
