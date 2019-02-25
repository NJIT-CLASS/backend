/**
 * Created by cesarsalazar on 4/20/16.
 */

var models = require('../models');
var Allocator = require('./Allocator.js');
var Promise = require('bluebird');
var moment = require('moment');
var TreeModel = require('tree-model');
var FlatToNested = require('flat-to-nested');
var consts = require('../Util/constant.js');
var Email = require('./Email.js');
var Util = require('./Util.js');
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
var TaskSimpleGrade = models.TaskSimpleGrade;

var tree = new TreeModel();
var flatToNested = new FlatToNested();

const logger = require('winston');

var execution = consts.EXECUTION_STATUS;
var cancellation = consts.CANCELLATION_STATUS;
var revision = consts.REVISION_STATUS;
var due = consts.DUE_STATUS;
var pageInteraction = consts.PAGE_INTERACTION_STATUS;
var reallocation = consts.REALLOCATION_STATUS;


class TaskFactory {

    getUserFromSection(sectionid) {
        console.log('Retrieving all users from section: ', sectionid, '...');
        var users = [];

        Section.findAll({
            where: {
                SectionID: sectionid,
                UserStatus: {
                    $notIn: ['Inactive']
                }
            }
        });
    }

    async createAssignmentInstances(a_id, sectionIDs, startDate, wf_timing) {
        var x = this;

        console.log('Creating assignment instance...');
        //Iterate through all sectionIDs passed in and promise each is returned before next execution
        await Promise.mapSeries(sectionIDs, async function (sectionid) {
            //creates new AssignmentInstance
            var ai = await AssignmentInstance.create({
                //creates attributes
                AssignmentID: a_id,
                SectionID: sectionid,
                StartDate: startDate,
                WorkflowTiming: wf_timing

            });

            await x.updateWorkflowTiming(wf_timing);



        });

        logger.log('info', '/Workflow/TaskFactory/createAssignmentInstances: Done!');
    }

    async updateWorkflowTiming(wf_timing) {
        await Promise.mapSeries(wf_timing.workflows, async function (workflow, index) {
            await Promise.mapSeries(wf_timing.workflows[index].tasks, async function (task) {
                await TaskActivity.update({
                    DueType: task.DueType
                }, {
                    where: {
                        TaskActivityID: task.id
                    }
                }).catch(function (err) {
                    console.log('Update WorkflowTiming Failed!');
                    console.log(err);
                });

            });
        });
    }

    async getWorkflowTiming(ai_id) {
        logger.log('info', 'Finding WorkflowTiming from ', {
            AssignmentInstance: ai_id
        });

        var ais = await AssignmentInstance.find({
            where: {
                AssignmentInstanceID: ai_id
            }
        }).catch(function (err) {
            logger.log('error', 'error has been found /TaskFactory.js/getWorkflowTiming(ai_id)');
        });

        return ais.WorkflowTiming;
    }


    // check to see if the user has view access to the task and if not: immediately respond with error
    applyViewContstraints(res, user_id, ti) {
        logger.log('info', 'apply view constraints to task instance', {
            user_id: user_id,
            task_instance: ti.toJSON()
        });
        if (JSON.parse(ti.Status)[0] == 'not_yet_started') {
            logger.log('debug', ' not_yet_started, return res');
            return res._headerSent || res.json({
                'error': true,
                'message': 'Task not even started yet',
            });
        }
        if (ti.UserID == user_id) {
          ti.TaskActivity.SeeSibblings = true;
          ti.TaskActivity.SeeSameActivity = true;
            return;
        }
        else {
          ti.TaskActivity.SeeSibblings = false;
          ti.TaskActivity.SeeSameActivity = false;
        }
        if (JSON.parse(ti.Status)[0] == 'complete') {
          ti.TaskActivity.SeeSibblings = true;
          ti.TaskActivity.SeeSameActivity = true;
            return;
        }
        if (ti.TaskActivity.SeeSibblings && ti.TaskActivity.SeeSameActivity) {
            return;
        }
        // find all non-completed task instances allocated to the user
        return TaskInstance.findAll({
            where: {
                UserID: user_id,
                Status: {
                    $notLike: '%"complete"%',
                },
            }
        }).then(function (sibling_tis) {
            logger.log('debug', 'check sibling tasks');

            return Promise.map(sibling_tis, function (sibling_ti) {
                if (!ti.TaskActivity.SeeSibblings) {
                    if (sibling_ti.PreviousTask == ti.PreviousTask) {
                        logger.log('debug', 'sibling task not completed, return res');
                        return res._headerSent || res.json({
                            'error': true,
                            'message': 'Sibling task not completed yet',
                        });
                    }
                }
            }).then(function (done) {
                return TaskInstance.findAll({
                    where: {
                        TaskActivityID: ti.TaskActivityID,
                        UserID: user_id,
                        Status: {
                            $notLike: '%"complete"%',
                        },
                    }
                }).then(function (same_ta_tis) {
                    logger.log('debug', 'same act check apply view constraints to task instance');

                    if (!ti.TaskActivity.SeeSameActivity) {
                        if (!!same_ta_tis) {
                            logger.log('debug', 'same task activity task instance not completed, return res');
                            return res._headerSent || res.json({
                                'error': true,
                                'message': 'Same type of task not completed yet',
                            });
                        }
                    }
                    logger.log('debug', 'done applying view constraints');
                });
            });
        });
    }

    // update data field of all tasks with the appropriate allowed version according to the current task
    applyVersionContstraints(pre_tis, cur_ti, user_id) {
        logger.log('info', 'apply version constraints to previous task instances based on a current task instance', {
            task_instance: cur_ti.toJSON(),
            user_id: user_id
        });
        var x = this;
        pre_tis.forEach(function (ti, i) {
            if (user_id == cur_ti.UserID) {
                if (-1 != ['grade_problem', 'consolidation', 'dispute', 'resolve_dispute'].indexOf(cur_ti.TaskActivity.Type)) {
                    x.setDataVersion(ti, ti.TaskActivity.VersionEvaluation);
                } else if (-1 != ['edit', 'comment'].indexOf(cur_ti.TaskActivity.Type) && (i != pre_tis.length - 1)) {
                    x.setDataVersion(ti, 'last');
                } else if (-1 != ['create_problem', 'solve_problem'].indexOf(cur_ti.TaskActivity.Type)) {
                    x.setDataVersion(ti, 'last');
                } else if (!'todo: logic: if cur_ti has good Data and status is revision') { //TODO
                    x.setDataVersion(ti, 'last');
                }
            } else {
                // x.setDataVersion(ti, 'none') //TODO
            }
        });
        if (user_id != cur_ti.UserID) {
            // x.setDataVersion(cur_ti, 'none') //TODO
        }
    }

    // set the data field of the task
    setDataVersion(ti, version_eval) {
        logger.log('info', 'update task instance data with appropriate version', {
            task_instance: ti.toJSON(),
            version_evaluation: version_eval
        });

        ti.Data = JSON.parse(ti.Data);
        if (version_eval == 'none' || !ti.Data) {
            ti.Data = [];
            return;
        }
        if (version_eval == 'whole') {
            return;
        }
        if (version_eval == 'first') {
            ti.Data = [ti.Data[0]];
            return;
        }
        if (version_eval == 'last') {
            ti.Data = [ti.Data.slice(-1)[0]];
            return;
        }
        logger.log('error', 'invalid version evaluation');
    }

    getNumberParticipants(taskActivityID) {
        console.log('Finding number of participants in task activity: ', taskActivityID, '...');
        var numParticipants = [];
        return new Promise(function (resolve, reject) {
            return TaskActivity.find({
                where: {
                    TaskActivityID: taskActivityID
                }
            }).then(function (result) {
                //console.log('NumberParticipants ', result.NumberParticipants);
                for (var i = 0; i < result.NumberParticipants; i++) {
                    numParticipants.push(0);
                }

                resolve(numParticipants);
            }).catch(function (err) {
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
            return Promise.mapSeries(ta_array, function (task) {
                return TaskActivity.find({
                    where: {
                        TaskActivityID: task
                    }
                }).then(function (result) {
                    var assigneeConstraints = JSON.parse(result.AssigneeConstraints);
                    //Loop through Assignee Constraints
                    for (var item in assigneeConstraints[2]) {
                        var temp = [];
                        assigneeConstraints[2][item].forEach(function (index) {
                            temp.push(ta_array[index]);
                        });
                        assigneeConstraints[2][item] = temp;
                        console.log('AssigneeConstraints', temp);
                    }
                    return TaskActivity.update({
                        AssigneeConstraints: assigneeConstraints
                    }, {
                        where: {
                            TaskActivityID: result.TaskActivityID
                        }
                    });
                });
            }).catch(function (err) {
                console.log('Updating Assignee Constraint Failure');
                console.log(err);
            });
        };


    }

    createAssignment(assignment) {
        var x = this;
        var TA_array = [];
        logger.log('info', '/TaskFactory/createAssignment/: Creating assignment...');
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
        }).then(function (assignmentResult) {
            //Keep track all the workflow activities created under assignment
            var WA_array = [];
            logger.log('info', '/TaskFactory/createAssignment/: Assignment created. ID:', assignmentResult.AssignmentID);
            //Iterate through array of workflow activities (Created WorkflowActivity in order)
            return Promise.mapSeries(assignment.WorkflowActivity, function (workflow, index) {
                logger.log('info', '/TaskFactory/createAssignment/: Creating workflow...');
                return WorkflowActivity.create({
                    AssignmentID: assignmentResult.AssignmentID,
                    Type: workflow.WA_type,
                    Name: workflow.WA_name,
                    GradeDistribution: workflow.WA_grade_distribution,
                    NumberOfSets: workflow.WA_number_of_sets,
                    Documentation: workflow.WA_documentation,
                    GroupSize: workflow.WA_default_group_size,
                    WorkflowStructure: workflow.WorkflowStructure,
                }).then(function (workflowResult) {
                    logger.log('info', '/TaskFactory/createAssignment/: Workflow created. ID:', workflowResult.WorkflowActivityID);
                    WA_array.push(workflowResult.WorkflowActivityID);
                    //Keep track all the task activities within each workflow
                    TA_array = [];
                    //Iterate through TaskActivity array in each WorkflowActivity (Create TaskActivity in order)
                    return Promise.mapSeries(assignment.WorkflowActivity[index].Workflow, function (task) {
                        logger.log('info', '/TaskFactory/createAssignment/: Creating task...');
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
                            Rubric: task.TA_overall_rubric,
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
                            MinimumDuration: task.TA_minimum_duration,
                            VersionEvaluation: task.VersionEvaluation,
                            SeeSibblings: task.SeeSibblings,
                            SeeSameActivity: task.SeeSameActivity,
                        }).then(function (taskResult) {
                            logger.log('info', '/TaskFactory/createAssignment/: Task created. ID:', taskResult.TaskActivityID);
                            TA_array.push(taskResult.TaskActivityID);
                        }).catch(function (err) {
                            logger.log('error', '/TaskFactory/createAssignment/: Failed creating task. Aborting...');
                            //Loggin error
                            console.log(err);
                            return false;
                        });
                    }).then(function (done) {
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
                        x.replaceTreeID(workflowResult.WorkflowActivityID, TA_array, workflowResult.WorkflowStructure);
                        //reset TA_array
                        TA_array = [];
                    }).catch(function (err) {
                        logger.log('error', '/TaskFactory/createAssignment/: Failed creating workflow. Aborting...');
                        //Loggin error
                        console.log(err);
                        return false;
                    });
                }).then(function (done) {
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
                    TA_array = [];
                });
            }).catch(function (err) {
                // err is the reason why rejected the promise chain returned to the transaction callback
                logger.log('error', '/TaskFactory/createAssignment/: Failed creating assignment. Aborting...');
                //Loggin error
                console.log(err);
                return false;
            });
        });
    }

    replaceTreeID(wa_id, ta_array, tree) {

        var replacedTree = tree;
        var count = 0;

        return Promise.map(replacedTree, function (node, index) {
            if (node.id != -1 && node.hasOwnProperty('parent')) {
                replacedTree[index]['id'] = ta_array[count];
                replacedTree[index]['parent'] = ta_array[replacedTree[index].parent];
                count++;
            } else if (node.id != -1) {
                replacedTree[index]['id'] = ta_array[count];
                count++;
            }

        }).then(function (done) {
            WorkflowActivity.update({
                WorkflowStructure: replacedTree
            }, {
                where: {
                    WorkflowActivityID: wa_id
                }
            });
            console.log(replacedTree);
        });
    }

    async hasSubWorkflow(ta_id, wa_id) {
        try {
            var wa = await WorkflowActivity.find({
                where: {
                    WorkflowActivityID: wa_id
                }
            });

            let flatTree = JSON.parse(wa.WorkflowStructure);
            let it;

            await Promise.mapSeries(flatTree, function (node) {
                if (node.id === ta_id) {
                    it = node;
                }
            });

            await Promise.mapSeries(flatTree, function (node) {
                if (node.hasOwnProperty('parent')) {
                    if (node.parent === it.id && node.isSubWorkflow !== it.isSubWorkflow) {
                        return true;
                    }
                }
            });

            return false;

        } catch (err) {
            logger.log('error', 'find subworkflow has failed', {
                wa_id: wa_id,
                error: err
            });
        }
    }

    getTree(wa_id, callback) {
        WorkflowActivity.find({
            where: {
                WorkflowActivityID: wa_id
            }
        }).then(function (wa_result) {
            let treeRoot = tree.parse(flatToNested.convert(JSON.parse(wa_result.WorkflowStructure)));
            callback(treeRoot, wa_result.TaskActivityCollection, JSON.parse(wa_result.WorkflowStructure));
        }).catch(function (err) {
            console.log(err);
            console.log('getTree(wa_id, callback) failed retrieving tree');
        });
    }

    collectTasks(ai_id) {
        AssignmentInstance.find({
            where: {
                AssignmentInstanceID: ai_id
            }
        }).then(function (ai) {
            WorkflowInstance.find({
                where: {
                    WorkflowInstanceID: ai.AssignmentInstanceID
                }
            }).then(function (wi) {
                where: {

                }
            });
        });
    }

    //Retrieving all subworkflows that's subsequent to the ti_id
    getSubWorkflow(ti_id, subworkflow) {

        // var x = this;
        // console.log('finding subworkflow of task instance', ti_id, '...');
        //
        // return new Promise(function(resolve, reject) {
        //     TaskInstance.find({
        //         where: {
        //             TaskInstanceID: ti_id
        //         }
        //     }).then(function(ti) {
        //         if (ti.NextTask === null || typeof ti.NextTask === undefined) {
        //             resolve(null);
        //         } else {
        //             return Promise.mapSeries(JSON.parse(ti.NextTask), function(taskArray) {
        //                 return Promise.mapSeries(taskArray, function(task) {
        //                     return TaskInstance.find({
        //                         where: {
        //                             TaskInstanceID: task.id
        //                         },
        //                         attributes: ['TaskInstanceID', 'WorkflowInstanceID', 'Status', 'NextTask', 'IsSubWorkflow'],
        //                         include: [{
        //                             model: User,
        //                             attributes: ['UserID', "UserType", 'UserName']
        //                         }, {
        //                             model: TaskActivity,
        //                             attributes: ['Type']
        //                         }]
        //                     }).then(function(nextTask) {
        //                         if (ti.IsSubWorkflow < nextTask.IsSubWorkflow && nextTask.IsSubWorkflow != 0) {
        //                             subworkflow.push(nextTask);
        //                         }
        //                     });
        //                 });
        //             });
        //         }
        //     });
        // });

        var x = this;
        //subworkflow = [];
        console.log('finding subworkflow of task instance', ti_id, '...');
        return new Promise(function (resolve, reject) {
            TaskInstance.find({
                where: {
                    TaskInstanceID: ti_id
                }
            }).then(function (ti) {
                var s = subworkflow;
                if (ti.NextTask === null || typeof ti.NextTask === undefined) {
                    resolve(null);
                } else {
                    return Promise.mapSeries(JSON.parse(ti.NextTask), function (task) {
                        //  return Promise.mapSeries(taskArray, function(task) {
                        return TaskInstance.find({
                            where: {
                                TaskInstanceID: task.id
                            },
                            attributes: ['TaskInstanceID', 'WorkflowInstanceID', 'Status', 'NextTask', 'IsSubWorkflow'],
                            include: [{
                                model: User,
                                attributes: ['UserID', 'Instructor']
                            }, {
                                model: TaskActivity,
                                attributes: ['Type']
                            }]
                        }).then(function (nextTask) {
                            //assumed 0 will not be subworkflow
                            if (ti.IsSubWorkflow < nextTask.IsSubWorkflow && nextTask.IsSubWorkflow != 0) {
                                //new subworkflow
                                console.log('found a subworkflow!');

                                s.push(nextTask);
                                return x.getNextTask(nextTask.TaskInstanceID, s).then(function (wf) {

                                    if (wf !== null) {
                                        s = wf;
                                        return Promise.mapSeries(s, function (task, index) {
                                            return x.getSubWorkflow(task.TaskInstanceID, new Array()).then(function (sw) {
                                                if (!s[index].hasOwnProperty('SubWorkflow')) {
                                                    s[index].setDataValue('SubWorkflow', sw);
                                                } else {
                                                    console.log('here ', ti.TaskInstanceID);
                                                    s[index].SubWorkflow.push(sw);
                                                }
                                            });
                                        });
                                    }
                                }).then(function (done) {
                                    resolve(s);
                                });
                            }
                        });

                        //});
                    }).then(function (done) {
                        console.log('No subworkflow found', ti.TaskInstanceID, '...');
                        resolve(null);
                    });
                }
            });
        });
    }

    getNextTask(ti_id, workflow) {
        var x = this;
        var next = null;
        //subworkflow = [];

        console.log('finding task instance', ti_id, '...');

        return new Promise(function (resolve, reject) {
            TaskInstance.find({
                where: {
                    TaskInstanceID: ti_id
                }
            }).then(function (ti) {
                var w = workflow;
                if (_.isEmpty(JSON.parse(ti.NextTask)) || typeof ti.NextTask === undefined) {
                    resolve(null);
                } else {
                    return Promise.mapSeries(JSON.parse(ti.NextTask), function (task) {
                        //return Promise.mapSeries(taskArray, function(task) {
                        return TaskInstance.find({
                            where: {
                                TaskInstanceID: task.id
                            },
                            attributes: ['TaskInstanceID', 'WorkflowInstanceID', 'Status', 'NextTask', 'IsSubWorkflow'],
                            include: [{
                                model: User,
                                attributes: ['UserID', 'Instructor']
                            }, {
                                model: TaskActivity,
                                attributes: ['Type']
                            }]
                        }).then(function (nextTask) {
                            if (nextTask.IsSubWorkflow == ti.IsSubWorkflow) {
                                w.push(nextTask);
                                next = nextTask.TaskInstanceID;
                            }
                        });
                        //  });
                    }).then(function (done) {
                        x.getNextTask(next, w).then(function (result) {
                            resolve(w);
                        });
                    });
                }
            });
        });
    }

    findPreviousTasks(ti_id, previousTasks) {
        var x = this;
        return new Promise(function (resolve, reject) {
            TaskInstance.find({
                where: {
                    TaskInstanceID: ti_id
                }
            }).then(function (taskInstance) {
                var p = previousTasks;
                if (taskInstance.PreviousTask === null || typeof taskInstance.PreviousTask === undefined) {
                    resolve(null);
                } else {
                    console.log('Previous Task', taskInstance.PreviousTask);
                    return Promise.mapSeries(JSON.parse(taskInstance.PreviousTask), function (task) {
                        // console.log('find previous task ', task)
                        p.push(task.id);
                        //p.push(JSON.parse(taskInstance.PreviousTask).id);
                    }).then(function (done) {
                        x.findPreviousTasks(JSON.parse(taskInstance.PreviousTask)[0].id, p).then(function (result) {
                            resolve(p);
                        });
                    });
                }
            }).catch(function (err) {
                console.log('Cannot find previous tasks', err);
                //throw new Error('Cannot find previous tasks');
            });
        });
    }
}


module.exports = TaskFactory;
