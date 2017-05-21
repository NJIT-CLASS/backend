/**
 * Created by cesarsalazar on 4/20/16.
 */

var models = require('../Model');
var Allocator = require('./Allocator.js');
var Promise = require('bluebird');
var moment = require('moment');
var TreeModel = require('tree-model');
var FlatToNested = require('flat-to-nested');
var consts = require('../Util/constant.js');
var Email = require('./Email.js');
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

    async getUsersFromSection(sectionid) {
        logger.log('info', 'collecting users from section', {section: sectionid});
        console.log('Retrieving all users from section: ', sectionid, '...');
        var users = [];

        var sec_users = await SectionUser.findAll({
            where: {
                SectionID: sectionid
            }
        }).catch(function(err) {
            logger.log('error', 'error has been found /TaskFactory.js/getUsersFromSection(sectionid)');
        });

        await sec_users.forEach(function(user) {
            if (user.Role !== 'Instructor' && user.Role !== 'Observer') {
                users.push(user.UserID);
            }
        });

        return users;
    }

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

    async getWorkflowTiming(ai_id) {
        logger.log('info','Finding WorkflowTiming from ', {
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

    //Finds and updates the list of previous tasks and next tasks of a list of workflow instance
    updatePreviousAndNextTasks(wi_list) {
        //wi_list is a list of workflow instance in that assignment
        var x = this;
        logger.log('info','Updating all previous and next tasks...', {
            wi_list: wi_list
        });

        if (wi_list.length == 0) {
            console.log('TaskFactory.js/updatePreviousAndNextTasks: wi_list length is 0.');
            return;
        } else {
            WorkflowInstance.find({
                where: {
                    WorkflowInstanceID: wi_list[0]
                }
            }).then(function(wi) {

                x.getTree(wi.WorkflowActivityID, function(tree, ta_collection, flat_tree) {
                    //console.log('tree', tree);
                    return Promise.mapSeries(wi_list, function(wi_id) {
                        WorkflowInstance.find({
                            where: {
                                WorkflowInstanceID: wi_id
                            }
                        }).then(function(wi) {
                            return Promise.all([x.matchNodeToWorkflow(wi.TaskCollection, flat_tree)]).then(function(structureList) {
                                return Promise.mapSeries(JSON.parse(wi.TaskCollection), function(taskArray) {
                                    return Promise.mapSeries(taskArray, function(task) {
                                        return Promise.all([x.listOfPreviousTasks(task, tree, structureList[0]), x.listOfNextTasks(task, tree, structureList[0])]).all().then(function([previous, next]) {
                                            if (previous == null && next !== null) {
                                                TaskInstance.update({
                                                    NextTask: next
                                                }, {
                                                    where: {
                                                        TaskInstanceID: task
                                                    },
                                                });

                                            } else if (next == null && previous !== null) {
                                                TaskInstance.update({
                                                    PreviousTask: previous,
                                                }, {
                                                    where: {
                                                        TaskInstanceID: task
                                                    },
                                                });

                                            } else if (next !== null && previous !== null) {

                                                TaskInstance.update({
                                                    PreviousTask: previous,
                                                    NextTask: next
                                                }, {
                                                    where: {
                                                        TaskInstanceID: task
                                                    },
                                                });
                                            }
                                        });
                                    });
                                });
                            });
                        });
                    });
                });
            });
        }



        //Finding all workflow instances using ai_id
        // return WorkflowInstance.findAll({
        //     where: {
        //         AssignmentInstanceID: ai_id
        //     }
        // }).then(function(workflows) {
        //
        //     console.log('All workflows found!');
        //     //Iterate through all the workflow instances returned
        //     return Promise.mapSeries(workflows, function(workflow, index) {
        //
        //         var taskCollection = JSON.parse(workflow.TaskCollection);
        //         var previousTask = null;
        //
        //         console.log('Updating previous and next tasks in workflow: ', workflow.WorkflowInstanceID);
        //         return Promise.mapSeries(taskCollection, function(task, index) {
        //
        //             if (taskCollection[index + 1] !== null || typeof taskCollection[index + 1] !== undefined) {
        //                 return TaskInstance.update({
        //                     PreviousTask: previousTask,
        //                     NextTask: taskCollection[index + 1]
        //                 }, {
        //                     where: {
        //                         TaskInstanceID: task
        //                     }
        //                 }).then(function(result) {
        //                     previousTask = task;
        //                 });
        //             } else {
        //                 return TaskInstance.update({
        //                     PreviousTask: previousTask,
        //                     NextTask: null
        //                 }, {
        //                     where: {
        //                         TaskInstanceID: task
        //                     }
        //                 });
        //             }
        //         });
        //     });
        // }).catch(function(err) {
        //     console.log('No workflow found!');
        //     console.log(err);
        // });
    }

    //construct a JSON of TaskInstance id and corresponding tree structure node
    // ex) {'1': { id: 166, isSubWorkflow: 0 },'2': { id: 167, parent: 1, isSubWorkflow: 0 }}
    // '2' and '2' are TaskActivityID and { id: 166, isSubWorkflow: 0 } { id: 167, parent: 1, isSubWorkflow: 0 } are flattened tree node
    //with actual task instance id
    matchNodeToWorkflow(ti_collection, flat_tree) {
        var struct = {};
        //console.log("flat tree", flat_tree);
        return Promise.mapSeries(JSON.parse(ti_collection), function(taskArray) {
            return Promise.mapSeries(taskArray, function(task) {
                return TaskInstance.find({
                    where: {
                        TaskInstanceID: task
                    }
                }).then(function(ti) {
                    return Promise.mapSeries(flat_tree, function(node) {
                        //console.log("node id", node.id);
                        if (node.id == ti.TaskActivityID && !struct.hasOwnProperty(node.id)) {
                            struct[node.id] = [{
                                id: task,
                                isSubWorkflow: node.isSubWorkflow
                            }];

                            return TaskInstance.update({
                                IsSubWorkflow: node.isSubWorkflow
                            }, {
                                where: {
                                    TaskInstanceID: task
                                }
                            }).catch(function(err) {
                                console.log('Error updating the IsSubWorkflow...', err);
                            });
                        } else if (node.id == ti.TaskActivityID && struct.hasOwnProperty(node.id)) {
                            struct[node.id].push({
                                id: task,
                                isSubWorkflow: node.isSubWorkflow
                            });

                            return TaskInstance.update({
                                IsSubWorkflow: node.isSubWorkflow
                            }, {
                                where: {
                                    TaskInstanceID: task
                                }
                            }).catch(function(err) {
                                console.log('Error updating the IsSubWorkflow...', err);
                            });
                        }

                    });
                });
            });
        }).then(function(done) {
            //console.log('matchNodeToWorkflow', struct);
            return struct;
        }).catch(function(err) {
            console.log('Error contructing the structure...', err);
        });
    }

    //return the find the list of previous tasks that is the parent of the ti_id
    listOfPreviousTasks(ti_id, tree, structureList) {
        //console.log('collecting previous task for task instance ', ti_id, '...');
        var parent = null;
        return TaskInstance.find({
            where: {
                TaskInstanceID: ti_id
            }
        }).then(function(ti) {
            return Promise.all([tree.walk(function(node) {
                //console.log(typeof node.model.id, typeof ti_id);
                //console.log(node.model.id == ti.TaskActivityID, node.model.id, ti_id);
                if (node.parent !== undefined && node.model.id == ti.TaskActivityID) {
                    parent = structureList[node.parent.model.id];
                };
            })]).then(function(previous) {
                return parent;
            });

            // return Promise.all([nd]).then(function(previous) {
            //     console.log("Previous in listOfPreviousTasks", previous);
            //     return previous;
            // });
        }).catch(function(err) {
            console.log('Error finding the previous task...', err);
        });

        //console.log(node)
    }

    //return the list next tasks that is prior the ti_id
    listOfNextTasks(ti_id, tree, structureList) {
        //console.log('collecting a list of next task for task instance ', ti_id, '...');
        var children = [];
        return TaskInstance.find({
            where: {
                TaskInstanceID: ti_id
            }
        }).then(function(ti) {
            return Promise.all([tree.walk(function(node) {
                //console.log(typeof node.parent.model, typeof ti_id);
                //console.log("Lookoing at node:", node.model.id, "Parent is: ", node.parent);
                if (node.parent !== undefined && node.model.id !== -1 && node.parent.model.id == ti.TaskActivityID) {
                    children.push(structureList[node.model.id]);
                }
            })]).then(function(next) {
                if (children.length == 0) {
                    return null;
                } else {
                    return children;
                }
            });

        }).catch(function(err) {
            console.log('Error finding the list of next tasks...', err);
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
            return;
        }
        if (JSON.parse(ti.Status)[0] != 'complete') {
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
        }).then(function(sibling_tis) {
            logger.log('debug', 'check sibling tasks');

            return Promise.map(sibling_tis, function(sibling_ti) {
                if (!ti.TaskActivity.SeeSibblings) {
                    if (sibling_ti.PreviousTask == ti.PreviousTask) {
                        logger.log('debug', 'sibling task not completed, return res');
                        return res._headerSent || res.json({
                            'error': true,
                            'message': 'Sibling task not completed yet',
                        });
                    }
                }
            }).then(function(done) {
                return TaskInstance.findAll({
                    where: {
                        TaskActivityID: ti.TaskActivityID,
                        UserID: user_id,
                        Status: {
                            $notLike: '%"complete"%',
                        },
                    }
                }).then(function(same_ta_tis) {
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
        pre_tis.forEach(function(ti, i) {
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
            }).catch(function(err) {
                console.log('Updating Assignee Constraint Failure');
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
                            console.log('Task creation successful!');
                            console.log('TaskActivityID: ', taskResult.TaskActivityID);
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

    async createWorkflowInstance(workflow, ai_id) {

        var wi = await WorkflowInstance.create({
            //create attributes.
            WorkflowActivityID: workflow.id,
            AssignmentInstanceID: ai_id,
            StartTime: workflow.startDate
        }).catch(function(err) {
            logger.log('error', 'cannot create workflow instance', {
                error: err
            });
            return;
        });

        return wi.WorkflowInstanceID;
        // return new Promise(function(resolve, reject) {
        //     WorkflowInstance.create({
        //         //create attributes.
        //         WorkflowActivityID: workflow.id,
        //         AssignmentInstanceID: ai_id,
        //         StartTime: workflow.startDate
        //     }).then(function(result) {
        //         resolve(result.WorkflowInstanceID);
        //     }).catch(function(err) {
        //         console.log(err);
        //         reject(err);
        //     });
        // });
    }

    createTaskInstance(task, userid, wi_id, ai_id) {
        // logger.log('debug', 'creating task instance',{
        //     task:task,
        //     userid: userid,
        //     wi_id: wi_id,
        //     ai_id: ai_id
        // });
        return new Promise(function(resolve, reject) {
            //var endDate = new Date(new Date(startDate).getTime() + task.DueType[1]);
            TaskActivity.find({
                where: {
                    TaskActivityID: task.id
                }
            }).then(function(ta_result) {

                var ti_u_hist = [{
                    time: new Date(),
                    user_id: userid,
                    is_extra_credit: false,
                }];

                if (ta_result.Type == 'needs_consolidation' || ta_result.Type == 'completed') {
                    TaskInstance.create({
                        //create attributes
                        UserID: userid,
                        TaskActivityID: task.id,
                        WorkflowInstanceID: wi_id,
                        AssignmentInstanceID: ai_id,
                        Status: JSON.stringify([execution.AUTOMATIC, cancellation.NORMAL, revision.NOT_AVAILABLE, due.BEFORE_END_TIME, pageInteraction.NOT_OPENED, reallocation.ORIGINAL_USER]),
                        UserHistory: ti_u_hist,
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
                        Status: JSON.stringify([execution.NOT_YET_STARTED, cancellation.NORMAL, revision.NOT_AVAILABLE, due.BEFORE_END_TIME, pageInteraction.NOT_OPENED, reallocation.ORIGINAL_USER]),
                        UserHistory: ti_u_hist
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
        console.log('Initiating create instances function...');
        var x = this;
        var email = new Email();

        //creates seperate array to store all the workflow instances created
        var workflowArray = [];

        // this.getUsersFromSection(sectionid) - returns all users from section(sectionid)
        // this.getWorkflowTiming(ai_id) - returns WorkflowTiming from Assignment Instance.
        return Promise.all([x.getUsersFromSection(sectionid), x.getWorkflowTiming(ai_id)]).spread(function(users, workflowTiming) {

            //console.log('Found number of users: ', users);
            //console.log('Found workflowTiming: ', JSON.parse(workflowTiming));
            //console.log('Going through each user...');

            //iterate through all users from section
            return Promise.mapSeries(users, function(user, userIndex) {
                return Promise.mapSeries(JSON.parse(workflowTiming).workflows, function(workflow, index) {
                    //console.log('workflow: ', workflow.id);
                    //creates seperate array to store all task instances created within the workflow
                    var taskArray = [];
                    //Store the current WorkflowInstanceID once it is created
                    var wi_id;

                    var allocator = new Allocator(users, userIndex);
                    var startDate = new Date(JSON.parse(workflowTiming).workflows[index].startDate);
                    //console.log('Creating workflow instance...');
                    return x.createWorkflowInstance(workflow, ai_id).then(function(workflowInstanceId) {
                        //push the resulting workflowInstance object from callback to workflow Array
                        workflowArray.push(workflowInstanceId);
                        //store WorkflowInstanceID created
                        wi_id = workflowInstanceId;
                        //console.log('Going through individual tasks...');
                        //iterate through all the tasks stored under workflows
                        return Promise.mapSeries(JSON.parse(workflowTiming).workflows[index].tasks, function(task, num) {
                            //console.log('task: ', task.id);
                            return allocator.getRightUser(task.id).then(function(allocUsers) {
                                console.log('right user', allocUsers);
                                var task_collection = [];
                                return Promise.mapSeries(allocUsers, function(a_user) {
                                    return x.createTaskInstance(task, a_user, workflowInstanceId, ai_id).then(function(createTaskResult) {
                                        //console.log('taskInstanceId: ', createTaskResult[0]);
                                        //push the resulting workflowInstance object from callback to workflow Array

                                        task_collection.push(createTaskResult[0]);
                                        //console.log("DueType", task.DueType);
                                        if (num === 0) {
                                            var endDate = moment(JSON.parse(workflowTiming).workflows[index].startDate);
                                            if (task.DueType[0] === 'duration') {
                                                endDate.add(task.DueType[1], 'minutes');
                                            } else if (task.DueType[0] === 'specificTime') {
                                                endDate = task.DueType[1];
                                            }
                                            TaskInstance.find({
                                                where: {
                                                    TaskInstanceID: createTaskResult[0]
                                                }
                                            }).then(function(ti) {
                                                var newStatus = JSON.parse(ti.Status);
                                                newStatus[0] = 'started';
                                                TaskInstance.update({
                                                    StartDate: startDate,
                                                    EndDate: endDate,
                                                    Status: JSON.stringify(newStatus)
                                                }, {
                                                    where: {
                                                        TaskInstanceID: createTaskResult[0]
                                                    }
                                                });
                                                //email.sendNow(ti.UserID, 'new task', null);
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
                            //console.log('Updating task collection in workflow instance...');
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
            //console.log('Updating workflow collection in assignment instance...');
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
                return x.updatePreviousAndNextTasks(workflowArray);
            }).catch(function(err) {
                console.log(err);
            });
        }).catch(function(err) {
            console.log(err);
        });
    }

    async getNumParticipants(taskActivityID) {
        // logger.log('debug', 'finding number of participants', {
        //     taskActivityID: taskActivityID
        // });
        try{

            var numParticipants;
            var ta = await TaskActivity.find({
                where: {
                    TaskActivityID: taskActivityID
                }
            });
            let num = new Array(ta.NumberParticipants);
            num.fill(0);
            return num;
        } catch(err){
            logger.log('error', 'cannot find number of participants', {
                TaskActivity: taskActivityID,
                error: err
            });
        }
    }

    async updateWorkflowCollection(ai_id, wfs){
        try{
            await AssignmentInstance.update({
                WorkflowCollection: wfs.sort(function(a, b) {
                    return a - b;
                })
            }, {
                where: {
                    AssignmentInstanceID: ai_id
                }
            });
        } catch(err){
            logger.log('error', 'cannot update workflow collection', {
                error: err
            });
        }

    }

    async updateTaskCollection(wi_id, tis){
        try{
            await WorkflowInstance.update({
                TaskCollection: tis.sort(function(a, b) {
                    return a - b;
                })
            }, {
                where: {
                    WorkflowInstanceID: wi_id
                }
            });
        } catch(err){
            logger.log('error', 'cannot update task collection', {
                error: err
            });
        }
    }

    async getAssigneeConstraints(ta_id) {
        // logger.log('debug', 'find assignee constraints', {
        //     ta_id: ta_id
        // });
        try{
            var ta = await TaskActivity.find({
                where: {
                    TaskActivityID: ta_id
                }
            }).catch(function(err) {
                logger.log('error', 'cannot find assignee constraints');
                return;
            });

            return JSON.parse(ta.AssigneeConstraints);
        } catch(err){
            logger.log('error', 'cannot get assignee constraints', {
                error: err
            });
        }

    }

    async getOwnerID(ta_id) {
        // logger.log('debug', 'finding owner ID', {
        //     task_activity: ta_id
        // });
        try{
            var ta = await TaskActivity.find({
                where: {
                    TaskActivityID: ta_id
                }
            }).catch(function(err) {
                logger.log('error', 'cannot find task activity for a owner');
            });

            var a = await Assignment.find({
                where: {
                    AssignmentID: ta.AssignmentID
                }
            }).catch(function(err) {
                logger.log('error', 'cannot find assignment for a owner');
            });

            return a.OwnerID;
        } catch(err){
            logger.log('error', 'cannot find owner ID', {
                error: err,
                task_activity: ta_id
            });
        }

    }

    async getVoidUsers(void_ta, ta_to_u_id) {
        // logger.log('debug', 'finding void users', {
        //     void_ta: void_ta,
        //     ta_to_u_id: ta_to_u_id
        // });
        try{
            var void_users = [];

            await Promise.mapSeries(void_ta, function(ta_id) {
                if (ta_to_u_id.hasOwnProperty(ta_id)) {
                    void_users.push(ta_to_u_id[ta_id]);
                }
            });

            // logger.log('debug', 'void users', {
            //     void_users: void_users
            // });

            return void_users;
        } catch(err){
            logger.log('error', 'cannot find void users', {
                void_tasks: void_tasks,
                ta_ti: ta_to_u_id,
                error: err
            });
        }

    }


    //(not in use)
    async getSameUser(ta, ta_to_u_id, users){
        var x = this;
        var assign_constr = await x.getAssigneeConstraints(ta.id); //get assignee constraints

        if (assign_constr[2].hasOwnProperty('same_as')) { // check if assignee constraints has "same_as"
            return ta_to_u_id[assign_constr[2].same_as[0]];
        } else {
            return null;
        }

    }

    //Find the right user for allocation
    async getAllocUser(ta, ta_to_u_id, users, i, j, num_participants) {

        // logger.log('debug', 'finding user to allocate',{
        //     ta:ta,
        //     ta_to_u_id:ta_to_u_id,
        //     users:users,
        //     i:i,
        //     j:j,
        //     num_participants:num_participants
        // });

        var x = this;
        var index = j;
        var alloc_users = [];
        var assign_constr = await x.getAssigneeConstraints(ta.id); //get assignee constraints

        await Promise.mapSeries(num_participants, async function(q, place){
            if (index === users.length) {// check if user index is beyond length
                index = 0;
            }

            if (assign_constr[0] === 'instructor') { //if the first index is 'instructor', find the owner. TODO: Future, allocate to instructor in the section User table
                var owner = await x.getOwnerID(ta.id);
                alloc_users.push(owner);
            } else if (Object.keys(ta_to_u_id).length === 0) { //if nothing is inside ta_to_u_id return the current user pointing to and index add 1
                if (i in users) {
                    alloc_users.push(users[i]);
                    index = index + 1;
                } else {
                    alloc_users.push(users[i % users.length]);
                    index = index + 1;
                }
            } else {
                if (i in users) {
                    if(_.isEmpty(assign_constr[2])){
                        alloc_users.push(users[index]);
                        index++;
                    } else if (assign_constr[2].hasOwnProperty('same_as') && place === 0) { // check if assignee constraints has "same_as", if there is more than 1 participants only the first user is same as
                        alloc_users.push(ta_to_u_id[assign_constr[2].same_as[0]]);
                    } else {

                        if (assign_constr[2].hasOwnProperty('not')) {

                            var void_users = await x.getVoidUsers(assign_constr[2].not, ta_to_u_id); //*
                            //console.log('void_users', void_users);
                            if(void_users.length >= users.length){
                                logger.log('error', 'Fatal! No user to allocate! Reallocate to instructor');
                                var owner = await x.getOwnerID(ta.id);
                                alloc_users.push(owner);
                            } else {
                                if (void_users.length > 0) {
                                    if (_.contains(void_users, users[index])) { //check if the void users contains the user
                                        index++;
                                    } else {
                                        alloc_users.push(users[index]);
                                        index++;
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });

        return [alloc_users, index];
    }

    async beginFirstTask(wf_task, tasks, startDate){
        var endDate = moment(startDate);

        await Promise.mapSeries(tasks, async function(task){
            if (wf_task.DueType[0] === 'duration') {
                endDate.add(wf_task.DueType[1], 'minutes');
            } else if (wf_task.DueType[0] === 'specificTime') {
                endDate = wf_task.DueType[1];
            }
            await TaskInstance.find({
                where: {
                    TaskInstanceID: task
                }
            }).then(async function(ti) {
                var newStatus = JSON.parse(ti.Status);
                newStatus[0] = 'started';
                await TaskInstance.update({
                    StartDate: startDate,
                    EndDate: endDate,
                    Status: JSON.stringify(newStatus)
                }, {
                    where: {
                        TaskInstanceID: task
                    }
                });
                //email.sendNow(ti.UserID, 'new task', null);
            });
        });

    }

    async createTaskInstances(wf, ai_id, new_wi_id, users, i, j) {
        var x = this;
        var index = j;
        var tis = [];
        var ta_to_u_id = {};

        logger.log('info', 'creating new task instances ',{
            workflow: new_wi_id,
            users: users,
            index: j
        });

        await Promise.mapSeries(wf.tasks, async function(ta, t_index) {
            var num_participants = await x.getNumParticipants(ta.id);

            var u_id_and_index = await x.getAllocUser(ta, ta_to_u_id, users, i, index, num_participants);
            index = u_id_and_index[1];

            var temp_tasks = [];

            // logger.log('debug', 'u_id_and_index', {
            //     u_id_and_index: u_id_and_index
            // });

            await Promise.mapSeries(u_id_and_index[0], async function(u_id){
                var ti = await x.createTaskInstance(ta, u_id, new_wi_id, ai_id);
                temp_tasks.push(ti[0]);
                ta_to_u_id[ta.id] = u_id;
            });

            tis.push(temp_tasks);

            if(t_index === 0){
                await x.beginFirstTask(wf.tasks[0], temp_tasks, wf.startDate);
            }
        });

        await x.updateTaskCollection(new_wi_id, tis);

        return [tis, index];
    }

    async createWorkflowInstances(users, ai_id, wf_timing, i) {
        var x = this;
        var j = i;
        var wfs = [];

        logger.log('info', 'creating new workflows instances begin with', {userid: users[i]});

        await Promise.mapSeries(JSON.parse(wf_timing).workflows, async function(wf) {
            var new_wi_id = await x.createWorkflowInstance(wf, ai_id);
            var new_tis_and_index = await x.createTaskInstances(wf, ai_id, new_wi_id, users, i, j);
            wfs.push(new_wi_id);
            j = new_tis_and_index[1];
        });

        return wfs;
    }

    //new allocation algorithm
    async allocateUsers(sectionid, ai_id) {

        if (sectionid === null || ai_id === null) {
            logger.log('error', 'create workflow instances and task instance failed', {
                sectionid: sectionid,
                ai_id: ai_id
            });
            return;
        }

        logger.log('info', 'creating workflow instances and task instances for', {
            assignment_instance: ai_id
        });

        var x = this;
        var users = await x.getUsersFromSection(sectionid);
        //var shift_users = await x.getUsersFromSection(sectionid);
        var wf_timing = await x.getWorkflowTiming(ai_id);
        var workflows = [];


        await Promise.mapSeries(users, async function(u_id, i) {
            var new_wfs = await x.createWorkflowInstances(users, ai_id, wf_timing, i);
            workflows = workflows.concat(new_wfs);
        });

        await x.updateWorkflowCollection(ai_id, workflows);
        await x.updatePreviousAndNextTasks(workflows);
        logger.log('info', 'update previous and next task done!');


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
                where: {

                }
            });
        });
    }

    collectGradesInAssignment(user, ai_id) {


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
                    return Promise.mapSeries(JSON.parse(ti.NextTask), function(taskArray) {
                        return Promise.mapSeries(taskArray, function(task) {
                            return TaskInstance.find({
                                where: {
                                    TaskInstanceID: task.id
                                },
                                attributes: ['TaskInstanceID', 'WorkflowInstanceID', 'Status', 'NextTask', 'IsSubWorkflow'],
                                include: [{
                                    model: User,
                                    attributes: ['UserID', 'Instructor', 'UserName']
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
                        });
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
                if (ti.NextTask === null || typeof ti.NextTask === undefined) {
                    resolve(null);
                } else {
                    return Promise.mapSeries(JSON.parse(ti.NextTask), function(taskArray) {
                        return Promise.mapSeries(taskArray, function(task) {
                            return TaskInstance.find({
                                where: {
                                    TaskInstanceID: task.id
                                },
                                attributes: ['TaskInstanceID', 'WorkflowInstanceID', 'Status', 'NextTask', 'IsSubWorkflow'],
                                include: [{
                                    model: User,
                                    attributes: ['UserID', 'Instructor', 'UserName']
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
                        });
                    }).then(function(done) {
                        x.getNextTask(next, w).then(function(result) {
                            resolve(w);
                        });
                    });
                }
            });
        });
    }
}


module.exports = TaskFactory;
