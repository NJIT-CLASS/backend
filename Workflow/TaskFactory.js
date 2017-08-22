/**
 * Created by cesarsalazar on 4/20/16.
 */

import {
    Assignment,
    AssignmentGrade,
    AssignmentInstance,
    AssignmentInstance_Archive,
    Assignment_Archive,
    Comments,
    CommentsArchive,
    CommentsViewed,
    Contact,
    Course,
    CourseBackUp,
    EmailNotification,
    FileReference,
    Organization,
    PartialAssignments,
    ResetPasswordRequest,
    Section,
    SectionUser,
    Semester,
    TaskActivity,
    TaskActivity_Archive,
    TaskGrade,
    TaskInstance,
    TaskInstance_Archive,
    TaskSimpleGrade,
    User,
    UserContact,
    UserLogin,
    VolunteerPool,
    WorkflowActivity,
    WorkflowActivity_Archive,
    WorkflowGrade,
    WorkflowInstance,
    WorkflowInstance_Archive,
    Category
} from '../Util/models.js';

var Allocator = require('./Allocator.js');
var Promise = require('bluebird');
var moment = require('moment');
var TreeModel = require('tree-model');
var FlatToNested = require('flat-to-nested');
var consts = require('../Util/constant.js');
var Email = require('./Email.js');
var Util = require('./Util.js');
var _ = require('underscore');

var tree = new TreeModel();
var flatToNested = new FlatToNested();

const logger = require('./Logger.js');

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
        await Promise.mapSeries(sectionIDs, async function(sectionid) {
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
        await Promise.mapSeries(wf_timing.workflows, async function(workflow, index) {
            await Promise.mapSeries(wf_timing.workflows[index].tasks, async function(task) {
                await TaskActivity.update({
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

    async getWorkflowTiming(ai_id) {
        logger.log('info', 'Finding WorkflowTiming from ', {
            AssignmentInstance: ai_id
        });

        var ais = await AssignmentInstance.find({
            where: {
                AssignmentInstanceID: ai_id
            }
        }).catch(function(err) {
            logger.log('error', 'error has been found /TaskFactory.js/getWorkflowTiming(ai_id)');
        });

        return ais.WorkflowTiming;
    }


    // check to see if the user has view access to the task and if not: immediately respond with error
    async applyViewContstraints(res, user_id, ti) {
        logger.log('info', 'apply view constraints to task instance', {
            user_id: user_id,
            task_instance: ti.toJSON()
        });

        if (JSON.parse(ti.Status)[0] === 'not_yet_started') {
            logger.log('debug', ' not_yet_started, return res');
            return res._headerSent || {
                    'error': true,
                    'message': 'Task not even started yet',
                }
                // || res.json({
                //     'error': true,
                //     'message': 'Task not even started yet',
                // });
        }
        if (ti.UserID == user_id) {
            logger.log('debug', 'UserID don\'t match, return res')
            return;
        }
        if (JSON.parse(ti.Status)[0] != 'complete') {
            logger.log('debug', 'current task not completed, return res')
            return;
        }
        if (ti.TaskActivity.SeeSibblings && ti.TaskActivity.SeeSameActivity) {
            logger.log('debug', 'SeeSiblings & SeeSameActivity')
            return;
        }

        // find all non-completed task instances allocated to the user
        var sibling_tis = await TaskInstance.findAll({
            where: {
                UserID: user_id,
                Status: {
                    $notLike: '%"complete"%',
                },
            }
        });

        logger.log('debug', 'check sibling tasks');

        await Promise.map(sibling_tis, function(sibling_ti) {
            if (!ti.TaskActivity.SeeSibblings) {
                if (sibling_ti.PreviousTask == ti.PreviousTask) {
                    logger.log('debug', 'sibling task not completed, return res');
                    return res._headerSent || {
                            'error': true,
                            'message': 'Sibling task not completed yet',
                        }
                        // || res.json({
                        //     'error': true,
                        //     'message': 'Sibling task not completed yet',
                        // });
                }
            }
        });

        var same_ta_tis = await TaskInstance.findAll({
            where: {
                TaskActivityID: ti.TaskActivityID,
                UserID: user_id,
                Status: {
                    $notLike: '%"complete"%',
                },
            }
        });

        logger.log('debug', 'same act check apply view constraints to task instance');
        console.log('!ti.TaskActivity.SeeSameActivity', !ti.TaskActivity.SeeSameActivity);
        console.log('ti.TaskActivity.SeeSameActivity', ti.TaskActivity.SeeSameActivity)
        if (!ti.TaskActivity.SeeSameActivity) {
            console.log('!!same_ta_tis', !!same_ta_tis)
            if (!!same_ta_tis) {
                logger.log('debug', 'same task activity task instance not completed, return res');
                logger.log('debug', res._headerSent);
                return res._headerSent || {
                        'error': true,
                        'message': 'Same type of task not completed yet',
                    }
                    // || res.json({
                    //     'error': true,
                    //     'message': 'Same type of task not completed yet',
                    // });
            }
        }
        logger.log('debug', 'done applying view constraints');
        // // find all non-completed task instances allocated to the user
        // return TaskInstance.findAll({
        //     where: {
        //         UserID: user_id,
        //         Status: {
        //             $notLike: '%"complete"%',
        //         },
        //     }
        // }).then(function (sibling_tis) {
        //     logger.log('debug', 'check sibling tasks');

        //     return Promise.map(sibling_tis, function (sibling_ti) {
        //         if (!ti.TaskActivity.SeeSibblings) {
        //             if (sibling_ti.PreviousTask == ti.PreviousTask) {
        //                 logger.log('debug', 'sibling task not completed, return res');
        //                 return res._headerSent || res.json({
        //                     'error': true,
        //                     'message': 'Sibling task not completed yet',
        //                 });
        //             }
        //         }
        //     }).then(function (done) {
        //         return TaskInstance.findAll({
        //             where: {
        //                 TaskActivityID: ti.TaskActivityID,
        //                 UserID: user_id,
        //                 Status: {
        //                     $notLike: '%"complete"%',
        //                 },
        //             }
        //         }).then(function (same_ta_tis) {
        //             logger.log('debug', 'same act check apply view constraints to task instance');

        //             if (!ti.TaskActivity.SeeSameActivity) {
        //                 if (!!same_ta_tis) {
        //                     logger.log('debug', 'same task activity task instance not completed, return res');
        //                     logger.log('debug', res._headerSent);
        //                     return res._headerSent || res.json({
        //                         'error': true,
        //                         'message': 'Same type of task not completed yet',
        //                     });
        //                 }
        //             }
        //             logger.log('debug', 'done applying view constraints');
        //         });
        //     });
        // });
    }

    // update data field of all tasks with the appropriate allowed version according to the current task
    async applyVersionContstraints(pre_tis, cur_ti, user_id) {
        logger.log('info', 'apply version constraints to previous task instances based on a current task instance', {
            task_instance: cur_ti.toJSON(),
            user_id: user_id
        });
        var x = this;
        var ar = [];
        await Promise.mapSeries(pre_tis, async function(ti, i) {
            if (user_id == cur_ti.UserID) {
                if (-1 != ['grade_problem', 'consolidation', 'dispute', 'resolve_dispute'].indexOf(cur_ti.TaskActivity.Type)) {
                    ar.push(await x.setDataVersion(ti, ti.TaskActivity.VersionEvaluation));
                } else if (-1 != ['edit', 'comment'].indexOf(cur_ti.TaskActivity.Type) /*&& (i != pre_tis.length - 1)*/ ) {
                    ar.push(await x.setDataVersion(ti, 'last'));
                } else if (-1 != ['create_problem', 'solve_problem'].indexOf(cur_ti.TaskActivity.Type)) {
                    ar.push(await x.setDataVersion(ti, 'last'));
                } else if (!'todo: logic: if cur_ti has good Data and status is revision') { //TODO

                    ar.push(await x.setDataVersion(ti, 'last'));
                }
            } else {
                // x.setDataVersion(ti, 'none') //TODO
            }
        });

        //console.log('ar', ar);

        return ar;
        // if (user_id != cur_ti.UserID) {
        //     // x.setDataVersion(cur_ti, 'none') //TODO
        // }
    }

    // set the data field of the task
    setDataVersion(ti, version_eval) {
        logger.log('info', 'update task instance data with appropriate version', {
            task_instance: ti.toJSON(),
            version_evaluation: version_eval
        });

        ti.Data = JSON.parse(ti.Data);

        if (version_eval == 'none' || !ti.Data) {
            ti.Data = JSON.stringify([]);
            return ti;
        }
        if (version_eval == 'whole') {
            return ti;
        }
        if (version_eval == 'first') {
            ti.Data = JSON.stringify([ti.Data[0]]);
            return ti;
        }
        if (version_eval == 'last') {
            ti.Data = JSON.stringify([ti.Data[ti.Data.length - 1]]);
            return ti;
        }
        logger.log('error', 'invalid version evaluation');
    }

    getNumberParticipants(taskActivityID) {
        console.log('Finding number of participants in task activity: ', taskActivityID, '...');
        var numParticipants = [];
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
                        //console.log('AssigneeConstraints', temp);
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
                console.log('Updating Assignee Constraint Failure');
                console.log(err);
            });
        };


    }

    createAssignment(assignment) {
        var x = this;
        var TA_array = [];
        //console.log('Creating assignment activity...');
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
            //console.log('Assignment creation successful!');
            //console.log('AssignmentID: ', assignmentResult.AssignmentID);
            //Iterate through array of workflow activities (Created WorkflowActivity in order)
            return Promise.mapSeries(assignment.WorkflowActivity, function(workflow, index) {
                // console.log('Creating workflow activity...');
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
                    //console.log('Workflow creation successful!');
                    // console.log('WorkflowActivityID: ', workflowResult.WorkflowActivityID);
                    WA_array.push(workflowResult.WorkflowActivityID);
                    //Keep track all the task activities within each workflow
                    TA_array = [];
                    //Iterate through TaskActivity array in each WorkflowActivity (Create TaskActivity in order)
                    return Promise.mapSeries(assignment.WorkflowActivity[index].Workflow, function(task) {
                        //  console.log('Creating task activity...');
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
                        }).then(function(taskResult) {
                            //console.log('Task creation successful!');
                            //console.log('TaskActivityID: ', taskResult.TaskActivityID);
                            TA_array.push(taskResult.TaskActivityID);
                        }).catch(function(err) {
                            console.log('Workflow creation failed');
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
                        x.replaceTreeID(workflowResult.WorkflowActivityID, TA_array, workflowResult.WorkflowStructure);
                        //reset TA_array
                        TA_array = [];
                    }).catch(function(err) {
                        console.log('Workflow creation failed');
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
                    TA_array = [];
                });
            }).catch(function(err) {
                // err is the reason why rejected the promise chain returned to the transaction callback
                console.log('Assignment creation failed');
                //Loggin error
                console.log(err);
                return false;
            });
        });
    }

    replaceTreeID(wa_id, ta_array, tree) {

        var replacedTree = tree;
        var count = 0;

        return Promise.map(replacedTree, function(node, index) {
            if (node.id != -1 && node.hasOwnProperty('parent')) {
                replacedTree[index]['id'] = ta_array[count];
                replacedTree[index]['parent'] = ta_array[replacedTree[index].parent];
                count++;
            } else if (node.id != -1) {
                replacedTree[index]['id'] = ta_array[count];
                count++;
            }

        }).then(function(done) {
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

            await Promise.mapSeries(flatTree, function(node) {
                if (node.id === ta_id) {
                    it = node;
                }
            });

            await Promise.mapSeries(flatTree, function(node) {
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
        }).then(function(wa_result) {
            let treeRoot = tree.parse(flatToNested.convert(JSON.parse(wa_result.WorkflowStructure)));
            callback(treeRoot, wa_result.TaskActivityCollection, JSON.parse(wa_result.WorkflowStructure));
        }).catch(function(err) {
            console.log(err);
            console.log('getTree(wa_id, callback) failed retrieving tree');
        });
    }

    collectTasks(ai_id) {
        AssignmentInstance.find({
            where: {
                AssignmentInstanceID: ai_id
            }
        }).then(function(ai) {
            WorkflowInstance.find({
                where: {
                    WorkflowInstanceID: ai.AssignmentInstanceID
                }
            }).then(function(wi) {
                // where: {

                // }
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
        return new Promise(function(resolve, reject) {
            TaskInstance.find({
                where: {
                    TaskInstanceID: ti_id
                }
            }).then(function(ti) {
                var s = subworkflow;
                if (ti.NextTask === null || typeof ti.NextTask === undefined) {
                    resolve(null);
                } else {
                    return Promise.mapSeries(JSON.parse(ti.NextTask), function(task) {
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
                        }).then(function(nextTask) {
                            //assumed 0 will not be subworkflow
                            if (ti.IsSubWorkflow < nextTask.IsSubWorkflow && nextTask.IsSubWorkflow != 0) {
                                //new subworkflow
                                console.log('found a subworkflow!');

                                s.push(nextTask);
                                return x.getNextTask(nextTask.TaskInstanceID, s).then(function(wf) {

                                    if (wf !== null) {
                                        s = wf;
                                        return Promise.mapSeries(s, function(task, index) {
                                            return x.getSubWorkflow(task.TaskInstanceID, new Array()).then(function(sw) {
                                                if (!s[index].hasOwnProperty('SubWorkflow')) {
                                                    s[index].setDataValue('SubWorkflow', sw);
                                                } else {
                                                    console.log('here ', ti.TaskInstanceID);
                                                    s[index].SubWorkflow.push(sw);
                                                }
                                            });
                                        });
                                    }
                                }).then(function(done) {
                                    resolve(s);
                                });
                            }
                        });

                        //});
                    }).then(function(done) {
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

        return new Promise(function(resolve, reject) {
            TaskInstance.find({
                where: {
                    TaskInstanceID: ti_id
                }
            }).then(function(ti) {
                var w = workflow;
                if (_.isEmpty(JSON.parse(ti.NextTask)) || typeof ti.NextTask === undefined) {
                    resolve(null);
                } else {
                    return Promise.mapSeries(JSON.parse(ti.NextTask), function(task) {
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
                        }).then(function(nextTask) {
                            if (nextTask.IsSubWorkflow == ti.IsSubWorkflow) {
                                w.push(nextTask);
                                next = nextTask.TaskInstanceID;
                            }
                        });
                        //  });
                    }).then(function(done) {
                        x.getNextTask(next, w).then(function(result) {
                            resolve(w);
                        });
                    });
                }
            });
        });
    }

    addUserBadgeInstance(userID, courseID, option) {

        console.info('user id', userID);

        var $this = this;

        UserPointIntances.find({
            where: {
                UserID: userID
            },
            attributes: [
                'QuestionsPoints',
                'HighGradesPoints',
                'SolutionsPoints',
                'GraderPoints',
                'EarlySubmissionPoints',
                'ParticipationPoints'
            ]

        }).then(function(result) {

            var update = {};

            if (option.indexOf('QuestionsPoints') > -1) {
                update.QuestionsPoints = parseInt(result['QuestionsPoints']) + 1;
            }
            if (option.indexOf('HighGradesPoints') > -1) {
                update.HighGradesPoints = parseInt(result['HighGradesPoints']) + 1;
            }
            if (option.indexOf('SolutionsPoints') > -1) {
                update.SolutionsPoints = parseInt(result['SolutionsPoints']) + 1;
            }
            if (option.indexOf('GraderPoints') > -1) {
                update.GraderPoints = parseInt(result['GraderPoints']) + 1;
            }
            if (option.indexOf('EarlySubmissionPoints') > -1) {
                update.EarlySubmissionPoints = parseInt(result['EarlySubmissionPoints']) + 1;
            }
            if (option.indexOf('ParticipationPoints') > -1) {
                update.ParticipationPoints = parseInt(result['ParticipationPoints']) + 1;
            }

            $this.updateUserPoints(userID, update);


        }).catch(function(err) {

        });

    }

    updateUserPoints(userID, update) {

        UserPoints.update(
            update, {
                where: {
                    UserID: userID
                }
            }).then(function(result) {
            console.info('Success!!! result is ', result);
        }).catch(function(err) {
            console.log('Error !!!!', err);
        });
    }

    updateUserBadges(userID, UserPoints) {

        UserBadges.find({
            where: {
                UserID: userID
            },
            attributes: ['QuestionsPoints',
                'HighGradesPoints',
                'SolutionsPoints',
                'GraderPoints',
                'EarlySubmissionPoints',
                'ParticipationPoints'
            ]

        }).then(function(result) {


        }).catch(function(err) {

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
                    return Promise.mapSeries(JSON.parse(taskInstance.PreviousTask), function(task) {
                        // console.log('find previous task ', task)
                        p.push(task.id);
                        //p.push(JSON.parse(taskInstance.PreviousTask).id);
                    }).then(function(done) {
                        x.findPreviousTasks(JSON.parse(taskInstance.PreviousTask)[0].id, p).then(function(result) {
                            resolve(p);
                        });
                    });
                }
            }).catch(function(err) {
                console.log('Cannot find previous tasks', err);
                //throw new Error('Cannot find previous tasks');
            });
        });
    }

    /*********************************************************************************************************** 
     **  Amadou workd starts here
     ************************************************************************************************************/
    //Update points instances when student submit task
    async updatePointInstance(taskActivityType, assignmentInstanceID, userID) {

        let assignmentInstance = await AssignmentInstance.find({
            where: {
                AssignmentInstanceID: assignmentInstanceID
            },
            attributes: ['SectionID'],
        });

        let section = await Section.find({
            where: {
                SectionID: assignmentInstance.SectionID
            },
            attributes: ['SectionID', 'SemesterID', 'CourseID']
        });

        let category = await Category.find({
            where: {
                Type: {
                    $like: taskActivityType
                }
            },
            attributes: ['Type', 'CategoryID']
        });

        let categoryInstance = await CategoryInstance.find({
            where: {
                SemesterID: section.SemesterID,
                CourseID: section.CourseID,
                SectionID: section.SectionID,
                CategoryID: category.CategoryID
            },
            attributes: ['CategoryInstanceID', 'CategoryID']
        });

        var $this = this;

        UserPointInstances.find({
            where: {
                UserID: userID,
                CategoryInstanceID: categoryInstance.CategoryInstanceID
            },
            attributes: ['UserID', 'CategoryInstanceID', 'PointInstances']

        }).then((result) => {
            //Create record if it does not exit
            if (!result) {
                let data = {
                    UserID: userID,
                    CategoryInstanceID: categoryInstance.CategoryInstanceID
                };
                data.PointInstances = 1;
                UserPointInstances.create(data);
            } else { //update when exist
                let update = {
                    PointInstances: parseInt(result.PointInstances) + 1
                };
                UserPointInstances.update(
                    update, {
                        where: {
                            UserID: userID,
                            CategoryInstanceID: result.CategoryInstanceID
                        }
                    });
            }

        }).catch(function(err) {
            console.error(err);
        });
    }

    //Create category for each class
    async createCategoryInstances(semesterID, courseID, sectionID) {

        let categories = await Category.findAll();

        if (!categories) {
            categories = [];

            let type = ['create_problem', 'create_solution', 'create_comment', 'high_grade'];

            for (let x = 0; x < type.length; x++) {

                categories.push(Category.create({
                    'Type': type[x],
                    'Name': type[x],
                    'Description': type[x],
                    'Tier1Instances': '10',
                    'Tier2Instances': '20',
                    'Tier3Instances': '30',
                    'InstanceValue': '10'
                }));
            }

        }

        for (let x = 0; x < categories.length; x++) {
            console.log('here 4')
            let category = categories[x];

            let data = {};
            data.CategoryID = category.CategoryID;
            data.SemesterID = semesterID;
            data.CourseID = courseID;
            data.SectionID = sectionID;

            let categoryInstance = await CategoryInstance.findOne({
                where: data
            });

            data.Tier1Instances = category.Tier1Instances;
            data.Tier2Instances = category.Tier2Instances;
            data.Tier3Instances = category.Tier3Instances;
            data.InstanceValue = category.InstanceValue;

            if (!categoryInstance) {
                console.log('here 2')
                categoryInstance = CategoryInstance.create(data);
            }

            this.createBadgeInstances(category.CategoryID, categoryInstance);
            this.createGoalInstances(categoryInstance, data.SemesterID, data.CourseID, data.SectionID);
        }

        this.createLevelInstances(semesterID, courseID, sectionID);
    }

    //Create levels for each class
    async createLevelInstances(semesterID, courseID, sectionID) {
        let levels = await Level.findAll();

        for (let x = 0; x < levels.length; x++) {
            let level = levels[x].dataValues;;

            let data = {};
            data.LevelID = level.LevelID;
            data.SemesterID = semesterID;
            data.CourseID = courseID;
            data.SectionID = sectionID;

            let exists = await LevelInstance.find({
                where: data
            });

            console.info(exists);

            if (!exists) {
                data.ThresholdPoints = level.ThresholdPoints;
                let levelInstance = await LevelInstance.create(data);
            }
        }
    }

    //Create goals for class
    async createGoalInstances(categoryInstance, semesterID, courseID, sectionID) {
        let goals = await Goal.findAll();

        for (let x = 0; x < goals.length; x++) {
            let goal = goals[x];

            if (goal.CategoryID == categoryInstance.CategoryID) {
                let data = {};
                data.GoalID = goal.GoalID;
                data.SemesterID = semesterID;
                data.CourseID = courseID;
                data.SectionID = sectionID;
                data.CategoryInstanceID = categoryInstance.CategoryInstanceID;

                let goalInstance = await GoalInstance.findOne({
                    where: data
                });

                if (!goalInstance) {
                    data.ThresholdInstances = goal.ThresholdInstances;
                    goalInstance = await GoalInstance.create(data);
                }
            }
        }
    }

    //Create badges for each class
    async createBadgeInstances(categoryID, categoryInstance) {

        let badges = await Badge.findAll({
            where: {
                CategoryID: categoryID
            }
        });

        for (let x = 0; x < badges.length; x++) {
            let badge = badges[x];

            let data = {};
            data.BadgeID = badge.BadgeID;
            data.CategoryInstanceID = categoryInstance.CategoryInstanceID;

            let badgeInstance = await BadgeInstance.findOne({
                where: data
            });

            if (!badgeInstance) {
                badgeInstance = await BadgeInstance.create(data);
            }
        }
    }

    //Award badges to users
    async awardBadgesToUser(userID, categoryInstance, userPoints) {

        this.createBadgeInstances(categoryInstance.CategoryID, categoryInstance);

        let badgeInstances = BadgeInstance.findOne({
            where: {
                CategoryInstanceID: categoryInstance.CategoryInstanceID
            },
            attributes: ['BadgeInstanceID'],
            order: [
                ['BadgeInstanceID', 'ASC']
            ]
        });

        let data = {
            UserID: userID,
            SemesterID: categoryInstance.SemesterID,
            CourseID: categoryInstance.CourseID,
            SectionID: categoryInstance.SectionID
        };

        let userBadgeInstances = await this.getUserBadgeInstances(categoryInstance, userID);

        data.BadgeInstanceID = userBadgeInstances[0].BadgeInstanceID;

        if (+userPoints >= +categoryInstance.Tier1Instances) {
            UserBadgeInstances.update({
                BadgeAwarded: 'yes'
            }, {
                where: data
            });
        } else {
            UserBadgeInstances.update({
                BadgeAwarded: 'no'
            }, {
                where: data
            });
        }

        data.BadgeInstanceID = userBadgeInstances[1].BadgeInstanceID;

        if (+userPoints >= +categoryInstance.Tier1Instances) {
            UserBadgeInstances.update({
                BadgeAwarded: 'yes'
            }, {
                where: data
            });
        } else {
            UserBadgeInstances.update({
                BadgeAwarded: 'no'
            }, {
                where: data
            });
        }

        data.BadgeInstanceID = userBadgeInstances[2].BadgeInstanceID;

        if (+userPoints >= +categoryInstance.Tier1Instances) {
            UserBadgeInstances.update({
                BadgeAwarded: 'yes'
            }, {
                where: data
            });
        } else {
            UserBadgeInstances.update({
                BadgeAwarded: 'no'
            }, {
                where: data
            });
        }

    }

    //Get UserBadge
    //Create if does not exist
    async getUserBadgeInstances(categoryInstance, userID) {

        let data = {
            UserID: userID,
            SemesterID: categoryInstance.SemesterID,
            CourseID: categoryInstance.CourseID,
            SectionID: categoryInstance.SectionID
        };

        let badges = await Badge.findAll({
            where: {
                CategoryID: categoryInstance.CategoryID
            },
            attributes: ['BadgeID']
        });

        //get existing ones.
        let badgeInstances = await BadgeInstance.findAll({
            where: {
                CategoryInstanceID: categoryInstance.CategoryInstanceID
            },
            attributes: ['BadgeInstanceID']
        });

        let userBadgeInstances = [];

        for (let x = 0; x < badgeInstances.length; x++) {
            let badgeInstance = badgeInstances[x];
            data.BadgeInstanceID = badgeInstance.BadgeInstanceID;

            let exist = await UserBadgeInstances.findOne({
                where: data
            });

            if (!exist) {
                data.BadgeAwarded = 'no';
                exist = await UserBadgeInstances.create(data);
            }

            userBadgeInstances.push(exist);
        }

        return userBadgeInstances;
    }

    //Get sunday of each week
    getSunday(date) {
        var day = date.getDay() || 7;
        if (day !== 1)
            date.setHours(-24 * (day));
        return date;
    }

    //Create snapshot for student rank and section based on average points
    async rankingSnapshot() {
        console.info('Runing cron here ...');

        let updateDate = new Date(new Date().setHours(0, 0, 0, 0));

        //Get current snapshot for today
        let secSnapExist = await SectionRankSnapchot.findOne({
            where: {
                UpdateDate: {
                    $eq: updateDate
                }
            },
            attributes: ['SectionRankSnapchatID']
        });

        //Get current snapshot for today
        let stuSnapExist = await StudentRankSnapchot.findOne({
            where: {
                UpdateDate: {
                    $eq: updateDate
                }
            },
            attributes: ['StudentRanksnapchotID']
        });

        //exit if snapchat already exist for today
        if (secSnapExist && stuSnapExist) {
            return;
        }

        //Get current semester
        let semester = await Semester.findOne({
            where: {
                StartDate: {
                    $or: {
                        $lt: new Date(),
                        $eq: new Date()
                    }
                },
                EndDate: {
                    $or: {
                        $gt: new Date(),
                        $eq: new Date()
                    }
                }
            },
            include: [{
                model: Section,
                as: 'Sections',
                include: [{
                    model: Course
                }]
            }]
        });
        //exit if no current semester
        if (!semester) {
            return;
        }

        //Get las updated snapshot for date
        let lastUpdate = await StudentRankSnapchot.findOne({
            attributes: ['UpdateDate'],
            order: [
                ['StudentRankSnapchotID', 'DESC']
            ]
        });

        //last update date
        let lastUpdateDate;
        if (lastUpdate) {
            lastUpdateDate = lastUpdate.UpdateDate;
        } else {
            lastUpdateDate = new Date();
            lastUpdateDate.setDate(lastUpdateDate.getDate() - 1);
            lastUpdateDate.setHours(0, 0, 0, 0);
        }

        let sectionsRanks = {};
        //Go through sections
        for (let xx = 0; xx < semester.Sections.length; xx++) {

            let curSection = semester.Sections[xx];

            let sectionUsers = await SectionUser.findAll({
                where: {
                    SectionID: curSection.SectionID
                },
                attributes: ['UserID', 'SectionID'],
                order: [
                    ['SectionID', 'ASC']
                ]
            });

            let students = [];

            for (let x = 0; x < sectionUsers.length; x++) {

                let sectionUser = sectionUsers[x];

                let user = await User.findOne({
                    where: {
                        UserID: sectionUser.UserID
                    },
                    attributes: ['UserID', 'FirstName', 'LastName']
                });

                let section = await Section.findOne({
                    where: {
                        SectionID: curSection.SectionID
                    },
                    attributes: ['SectionID', 'CourseID', 'Name']
                });

                let course = await Course.findOne({
                    where: {
                        CourseID: section.CourseID
                    },
                    attributes: ['CourseID', 'Name', 'Number']
                });

                let categoryInstances = await CategoryInstance.findAll({
                    where: {
                        CourseID: section.CourseID,
                        SemesterID: semester.SemesterID,
                        SectionID: sectionUser.SectionID
                    },
                    order: [
                        ['SectionID', 'ASC']
                    ]
                });

                let totalPoints = 0;

                for (let y = 0; y < categoryInstances.length; y++) {

                    let categoryInstance = categoryInstances[y];

                    let pointInstance = await UserPointInstances.find({
                        where: {
                            UserID: sectionUser.UserID,
                            CategoryInstanceID: categoryInstance.CategoryInstanceID,
                        },
                        attributes: ['PointInstances', 'UserPointInstanceID']
                    });


                    let category = await Category.find({
                        where: {
                            CategoryID: categoryInstance.CategoryID
                        },
                        attributes: ['Name', 'Description']
                    });

                    let currentPoints = 0;

                    if (pointInstance) {
                        currentPoints = (parseInt(pointInstance.PointInstances) * categoryInstance.InstanceValue);
                        totalPoints += currentPoints;
                    } else {
                        pointInstance = {
                            PointInstances: 0
                        };
                    }

                    await this.awardBadgesToUser(user.UserID, categoryInstance, currentPoints);
                };

                let previous = await StudentRankSnapchot.findOne({
                    where: {
                        SemesterID: semester.SemesterID,
                        CourseID: course.CourseID,
                        SectionID: section.SectionID,
                        UserID: user.UserID,
                        UpdateDate: {
                            $eq: lastUpdateDate
                        }
                    }
                });

                let data = {};
                data.SemesterID = semester.SemesterID;
                data.SemesterName = semester.Name;
                data.CourseID = course.CourseID;
                data.CourseName = course.Name;
                data.CourseNumber = course.Number;
                data.SectionID = section.SectionID;
                data.SectionName = section.Name;

                if (!sectionsRanks[course.CourseID]) {
                    sectionsRanks[course.CourseID] = {};
                }
                if (!sectionsRanks[course.CourseID][section.SectionID]) {
                    sectionsRanks[course.CourseID][section.SectionID] = Object.assign({}, data);
                }
                if (!sectionsRanks[course.CourseID][section.SectionID]['count']) {
                    sectionsRanks[course.CourseID][section.SectionID]['count'] = 1;
                } else {
                    sectionsRanks[course.CourseID][section.SectionID]['count'] += 1;
                }
                if (!sectionsRanks[course.CourseID][section.SectionID]['TotalPoints']) {
                    sectionsRanks[course.CourseID][section.SectionID]['TotalPoints'] = totalPoints;
                } else {
                    sectionsRanks[course.CourseID][section.SectionID]['TotalPoints'] += totalPoints;
                }

                data.TotalPoints = totalPoints;
                data.UserID = user.UserID;
                data.FirstName = user.FirstName;
                data.LastName = user.LastName;

                if (previous) {
                    data.PointsMovement = previous.TotalPoints - data.TotalPoints;
                } else {
                    data.PointsMovement = 0;
                }
                //Add student records to array
                students.push(data);
                totalPoints = 0;
            };

            //Check if snapshot
            if (!stuSnapExist) {
                //Sort record by total points
                students.sort(function(a, b) {
                    return parseFloat(a.TotalPoints) - parseFloat(b.TotalPoints);
                });
                //Store student snapchot
                for (let xxx = 0; xxx < students.length; xxx++) {
                    let student = Object.assign({}, students[xxx]);
                    student.Rank = students.length - xxx;
                    student.UpdateDate = updateDate;
                    let snapchot = StudentRankSnapchot.create(student);
                };
            }

        };
        //Check if sanpchot has been saved for today
        if (!secSnapExist) {
            //Evaluate average points and remove unwanted values
            let SecRanks = [];
            for (let c in sectionsRanks) {
                let cur = sectionsRanks[c];
                for (let s in cur) {
                    let current = sectionsRanks[c][s];
                    current.AveragePoints = Math.round(parseInt(current.TotalPoints) / parseInt(current.count));
                    delete current.TotalPoints;
                    delete current.count;
                    SecRanks.push(current);
                }
            }
            //Sort section ranking to rank sections
            SecRanks.sort(function(a, b) {
                return parseFloat(a.AveragePoints) - parseFloat(b.AveragePoints);
            });

            //Evaluate ranking and store snapchot for section ranking if only the average is greater than 0
            for (let yyy = 0; yyy < SecRanks.length; yyy++) {
                let sectionRank = Object.assign({}, SecRanks[yyy]);
                sectionRank.Rank = SecRanks.length - yyy;
                sectionRank.UpdateDate = updateDate;
                SectionRankSnapchot.create(sectionRank);
            };
        }
    }


    /*********************************************************************************************************** 
     **  Amadou work ends here
     ************************************************************************************************************/
}


module.exports = TaskFactory;