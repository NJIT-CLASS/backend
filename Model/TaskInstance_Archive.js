var moment = require('moment');
var models = require('../Model');
var email = require('../Workflow/Email.js');
var Promise = require('bluebird');
//var Allocator = require('../Workflow/Allocator.js');

module.exports = function(sequelize, DataTypes) {
    return sequelize.define('TaskInstance_Archive', {
        TaskInstanceID: {
            //Unique Identifier for the task instance.
            type: DataTypes.INTEGER.UNSIGNED,
            field: 'TaskInstanceID',
            allowNull: false,
            primaryKey: true,
            autoIncrement: true,
            unique: true
        },
        UserID: {
            //Id of the user assigned to this task
            //Foreign Key
            type: DataTypes.INTEGER.UNSIGNED,
            field: 'UserID',
            allowNull: false
        },
        TaskActivityID: {
            //Unique Identifier for the task activity.
            //Foreign Key
            type: DataTypes.INTEGER.UNSIGNED,
            field: 'TaskActivityID',
            allowNull: false
        },
        WorkflowInstanceID: {
            //Unique identifier for a workflow instance.
            //Foreign Key
            type: DataTypes.INTEGER.UNSIGNED,
            field: 'WorkflowInstanceID',
            allowNull: false
        },
        AssignmentInstanceID: {
            //Unique identifier for Assignment instance.
            //Foreign Key
            type: DataTypes.INTEGER.UNSIGNED,
            field: 'AssignmentInstanceID',
            allowNull: false
        },
        GroupID: {
            //Id of the group assigned to this task (not currently used)
            type: DataTypes.INTEGER.UNSIGNED,
            field: 'GroupID',
            allowNull: true //Should be false, but not needed in the system now
        },
        Status: {
            //Current status of the task instance
            type: DataTypes.STRING(20),
            field: 'Status',
            allowNull: true
        },
        StartDate: {
            //Time stamp for task instance start.
            type: DataTypes.DATE,
            field: 'StartDate',
            allowNull: true
        },
        EndDate: {
            //End date of the task
            type: DataTypes.DATE,
            field: 'EndDate',
            allowNull: true
        },
        ActualEndDate: {
            type: DataTypes.DATE,
            field: 'ActualEndDate',
            allowNull: true
        },
        Data: {
            //User’s input is stored here. For non-display tasks, this will hold the value calculated by the task’s function.
            type: DataTypes.JSON,
            field: 'Data',
            allowNull: true
        },
        UserHistory: {
            //Prior users assigned to this task instance, if reallocated (will be refined in future versions)
            type: DataTypes.JSON,
            field: 'UserHistory',
            allowNull: true
        },
        FinalGrade: {
            //Will hold a potential final grade for the “referred_to” task_activity, or be null if it does not. This will be a single consolidated grade, not the individual criteria subgrades.
            type: DataTypes.FLOAT.UNSIGNED,
            field: 'FinalGrade',
            allowNull: true
        },
        Files: {
            //File identifiers when uploaded by users (when uploaded as user input)
            type: DataTypes.JSON,
            field: 'Files',
            allowNull: true
        },
        ReferencedTask: {
            //Task_ID of the referenced task, if any.
            type: DataTypes.INTEGER.UNSIGNED,
            field: 'ReferencedTask',
            allowNull: true
        },
        NextTask: {
            //Array of possible next
            type: DataTypes.JSON,
            field: 'NextTask',
            allowNull: true
        },
        PreviousTask: {
            //Array of possible previous
            type: DataTypes.JSON,
            field: 'PreviousTask',
            allowNull: true
        },
        EmailLastSent: {
            //The Record of when the last email was sent.
            //Keep a whole array of email history
            type: DataTypes.DATE,
            field: 'EmailLastSent',
            allowNull: false,
            defaultValue: '1999-01-01T00:00:00'
        }

    }, {
        timestamps: false,

        // don't delete database entries but set the newly added attribute deletedAt
        // to the current date (when deletion was done). paranoid will only work if
        // timestamps are enabled
        paranoid: true,

        // don't use camelcase for automatically added attributes but underscore style
        // so updatedAt will be updated_at
        underscored: true,

        // disable the modification of table names; By default, sequelize will automatically
        // transform all passed model names (first parameter of define) into plural.
        // if you don't want that, set the following
        freezeTableName: true,

        instanceMethods: {
            // timeOut: function() {
            //     var x = this;
            //     //var alloc = new Allocator();
            //     //check the option whether keep the same person or allocate to a new person
            //     //extended date is in DueType second postion
            //
            //     // WhatIfLate: (0 = keep_same_participant, 1 = allocate_new_person_from_contingency_pool,
            //     // 2 = allocate_to_different_person_in_same_group, 3 = abandon_task, 4 = resolved_task, 5 = allocate to
            //     // new instructor and more. If # > 0 then change status to overtime)
            //
            //     //Change parameter WhatIfLate to Array of [action, number(days)];
            //
            //     //decision point to decide change the status whether late, abandon, or complete
            //     if (x.Type == 'dispute') {
            //         x.Status = 'complete';
            //         return Promise.map(JSON.parse(x.NextTask), function(task) {
            //             TaskInstance.find({
            //                 where: {
            //                     TaskInstanceID: task
            //                 }
            //             }).then(function(nextTask) {
            //                 nextTask.Status = 'bypassed';
            //                 //need an algorithm that checks for all subworkflow/workflow complete. Triverse the tree to find all subworkflow.
            //             }).then(function(err) {
            //                 console.log("Resolve dispute failed to bypass. TaskInstanceID: ", nextTask.TaskInstanceID);
            //                 console.log(err);
            //             });
            //         });
            //     } else {
            //         models.TaskActivity.find({
            //             where: {
            //                 TaskActivityID: x.TaskActivityID
            //             }
            //         }).then(function(taskActivity) {
            //             switch (taskActivity.AtDurationEnd) {
            //                 case 'late':
            //                     //check WhatIfLate action
            //                     switch (taskActivity.WhatIfLate) {
            //                         case '"keep_same_participant"':
            //                             x.Status = 'late';
            //                             //email.sendNow(x.UserID, 'late');
            //                             break;
            //                         case "allocate_new_person_from_contingency_pool":
            //                             x.Status = 'late_reallocated';
            //
            //                             //Run allocation algorithm, extend due date.
            //                             // x.findSectionUsers(x.AssignmentInstanceID, function(users) {
            //                             //     alloc.reallocate(x.TaskInstanceID, users);
            //                             // });
            //                             //send email to notify user about allocation
            //                             break;
            //                         case "allocate_to_different_person_in_same_group":
            //                             x.Status = 'late_reallocated';
            //
            //                             //Run allocation algorithm specifiy with team, extend due date.
            //                             // x.findGroupUsers(x.GroupID, function(users) {
            //                             //     alloc.reallocate(x.TaskInstanceID, users);
            //                             // });
            //                             //send email to notify user about allocation
            //                             break;
            //                         case "allocate_to_instructor":
            //                             x.Status = 'late_reallocated';
            //                             //Run allocation algorithm specifiy with team, extend due date
            //                             // x.findInstructor(x.AssignmentInstanceID, function(instructor) {
            //                             //     alloc.reallocate(x.TaskInstanceID, instructor);
            //                             // });
            //                             //send email to notify user about allocation
            //                             break;
            //                             // case "abandon_task":
            //                             //     this.Status = "complete";
            //                             //     break;
            //                             // case "resolved_task":
            //                             //     this.Status = "complete";
            //                             //     break;
            //                         default:
            //                     }
            //                     break;
            //                 case "resolve":
            //                     x.Status = 'complete';
            //                     //submitted. Stop task instance and continue subworkflow task status = complete
            //                     break;
            //                 case "abandon":
            //                     x.Status = 'abandoned';
            //                     //abandoning subworkflow. status = complete
            //                     //*add subworkflow complete.
            //                     //Skip to subworkflow complete
            //                     break;
            //                 case "complete":
            //                     //change status to complete
            //                     x.Status = 'complete';
            //                     //start nexttask
            //                     x.triggerNext();
            //                     break;
            //                 default:
            //                     console.log('AtDurationEnd does not fall into any category.')
            //             }
            //             x.save();
            //         });
            //     }
            // },

            timeOutTime: function() {
                if (this.StartDate == null) {
                    throw Error('Start time for instance cannot be null.');
                } else if (this.EndDate == null) {
                    throw Error('End time for instance cannot be null.');
                }
                return this.EndDate;
            },

            triggerNext: function() {
                x = this;
                if ((x.StartDate === null || x.EndDate === null) && x.Status !== 'automatic') {
                    throw Error('Missing attributes!  TaskInstanceID:', x.TaskInstanceID);
                    return null;
                }


                return Promise.mapSeries(JSON.parse(x.NextTask), function(task, index) {
                    models.TaskInstance.find({
                        where: {
                            TaskInstanceID: task
                        }
                    }).then(function(nextTask) {
                        models.TaskActivity.find({
                            where: {
                                TaskActivityID: nextTask.TaskActivityID
                            }
                        }).then(function(ta_result) {

                            if (ta_result.Type === 'needs_consolidation') {
                                nextTask.consolidate();
                            } else if (ta_result.Type === 'complete') {
                                nextTask.complete();
                            } else {
                                //findNewDates return an array of [newStartDate, newEndDate]
                                console.log('Triggering next task to start... Current TaskInstanceID:', x.TaskInstanceID);
                                var dates = nextTask.findNewDates(function(dates) {
                                    models.TaskInstance.update({
                                        Status: 'started',
                                        StartDate: dates[0],
                                        EndDate: dates[1]
                                    }, {
                                        where: {
                                            TaskInstanceID: nextTask.TaskInstanceID
                                        }
                                    }).catch(function(err) {
                                        console.log(err);
                                        throw Error('Cannot start next task!');
                                        return null;
                                    });
                                });
                            }
                        });
                    });
                });
            },

            //findNewDates computes the startDate passed in and find newStartDate and newEndDate
            findNewDates: function(callback) {
                models.TaskActivity.find({
                    where: {
                        TaskActivityID: this.TaskActivityID
                    }
                }).then(function(ta_result) {
                    //console.log('ta_result', ta_result);
                    var newStartDate = moment().add(JSON.parse(ta_result.StartDelay), 'minutes');
                    var newEndDate = moment().add(JSON.parse(ta_result.StartDelay), 'minutes');
                    if (JSON.parse(ta_result.DueType)[0] === 'duration') {
                        newEndDate.add(JSON.parse(ta_result.DueType)[1], 'minutes');
                    } else if (JSON.parse(ta_result.DueType)[0] === 'specificTime') {
                        newEndDate = moment(JSON.parse(ta_result.DueType)[1]).toDate();
                    }
                    callback([newStartDate, newEndDate]);
                }).catch(function(err) {
                    console.log(err);
                    throw Error('Cannot find Date!');
                });
            },

            extendDate: function(time) {
                var x = this;
                var newEndDate = moment().add(time, 'minutes');

                x.EndDate = newEndDate;
                x.save();
            },

            // //finds the students from the same section
            // findSectionUsers: function(ai_id, callback) {
            //     models.AssignmentInstance.find({
            //         where: {
            //             AssignmentInstanceID: ai_id
            //         }
            //     }).then(function(result) {
            //         models.SectionUser.findAll({
            //             where: {
            //                 SectionID: result.SectionID
            //             }
            //         }).then(function(users) {
            //             var userArray = [];
            //             users.forEach(function(user){
            //               userArray.push(user);
            //             });
            //             console.log("Users:",userArray);
            //             callback(users);
            //         }).catch(function(err) {
            //             console.log(err);
            //             throw Error("Cannot find TaskActivity!");
            //         });
            //     });
            // },
            //
            // //finds group members
            // findGroupUsers: function(g_id, callback) {
            //
            // },
            //
            // //finds group members
            // findInstructor: function(ai_id, callback) {
            //     models.AssignmentInstance.find({
            //         where: {
            //             AssignmentInstanceID: ai_id
            //         }
            //     }).then(function(result) {
            //         models.Assignment.find({
            //             where: {
            //                 AssignmentID: result.AssignmentID
            //             },
            //             attributes: ["OwnerID"]
            //         }).then(function(instructor) {
            //             console.log("Inustructor:", instructor.OwnerID);
            //             callback(instructor.OwnerID);
            //         }).catch(function(err) {
            //             console.log(err);
            //             throw Error("Cannot find TaskActivity!");
            //         });
            //     });
            // },

            getTaskActivity: function(callback) {
                models.TaskActivity.find({
                    where: {
                        TaskActivityID: this.TaskActivityID
                    }
                }).then(function(ta_result) {
                    callback(ta_result);
                }).catch(function(err) {
                    console.log(err);
                    throw Error('Cannot find TaskActivity!');
                });
            },

            findDueType: function(callback) {
                models.TaskActivity.find({
                    where: {
                        TaskActivityID: this.TaskActivityID
                    }
                }).then(function(ta_result) {
                    //console.log('ta_result', ta_result);
                    callback(ta_result.DueType);
                }).catch(function(err) {
                    console.log(err);
                    throw Error('Cannot find DueType!');
                });
            },

            //Consolidate grading tasks
            consolidate: function() {
                var x = this;
                var isAllCompleted = true;
                console.log('Checking all grading solution complete...');
                return Promise.map(JSON.parse(x.PreviousTask), function(ti_id) {
                    return models.TaskInstance.find({
                        where: {
                            TaskInstanceID: ti_id
                        }
                    }).then(function(ti_result) {
                        //Check if all grading solution are completed
                        if (ti_result.Status != 'complete') {
                            console.log('Grading tasks pending...');
                            isAllCompleted = false;
                        }
                    });
                }).then(function(done) {
                    if (isAllCompleted) {
                        //if isAllCompleted = true then find the grades in previous grading solution tasks
                        console.log('Consolidating Tasks...');
                        x.findGrades(function(grades) {
                            var max = Math.max.apply(null, grades);
                            var min = Math.min.apply(null, grades);
                            //if ((max - min) > ) {}
                            models.TaskActivity.find({
                                where: {
                                    TaskActivityID: x.TaskActivityID
                                }
                            }).then(function(ta_result) {
                                if (ta_result.FunctionType === 'max') {
                                    x.FinalGrade = max;
                                } else if (ta_result.FunctionType === 'min') {
                                    x.FinalGrade = min;
                                } else if (ta_result.FunctionType === 'average') {
                                    x.FinalGrade = (max + min) / 2;
                                }
                            });
                        });


                        console.log('All tasks completed!');
                        x.triggerNext();
                        //consolidate calculation
                        //if the difference exceed threshold, open consolidate task, otherwise, bypass consolidation.
                    }
                });
            },

            findGrades: function(callback) {
                var grades = [];
                Promise.map(JSON.parse(x.PreviousTask), function(ti_id) {
                    models.TaskInstance.find({
                        where: {
                            TaskInstanceID: ti_id
                        }
                    }).then(function(ti_result) {
                        var total = 0;
                        //Adding all grades together
                        for (var i = 0; i < ti_result.Data.number_of_fields; i++) {
                            total += ti_result.Data[i];
                        }
                        grades.push(total);
                    });
                }).then(function(done) {
                    callback(grades);
                }).catch(function(err) {
                    console.log(err);
                });
            },

            complete: function() {
                var x = this;
                var isAllCompleted = true;
                console.log('Checking all subworkflows are completed...');

                //when a workflow has reached complete. This function will be called
                //It will go through the workflow structure and triverse the tree to see if all other
                //subworkflows are completed.
                //If everything has been completed, collect the grades.
            }


            // getTaskActivity: function(){
            //   console.log("fsegsegs");
            //   sequelize.models.TaskActivity.find({
            //     where:{
            //       TaskActivityID: this.TaskActivityID
            //     }
            //   }).then(function(ta_result){
            //     console.log(ta_result);
            //   })
            // }
            //     addTriggerCondition: function(data) {
            //         var settings = JSON.parse(this.Settings);
            //
            //         if (typeof settings.trigger === 'undefined')
            //             settings.trigger = [];
            //         //else
            //         settings.trigger.push(data);
            //
            //         this.Settings = settings;
            //
            //         this.save().then(function() {
            //             console.log("Trigger added");
            //         });
            //     },
            //
            //     getTriggerConditions: function() {
            //         settings = JSON.parse(this.Settings);
            //
            //         if (typeof settings.trigger == 'undefined')
            //             return null;
            //
            //         return settings.trigger;
            //     },
            //
            //     addExpireCondition: function(data) {
            //         settings = JSON.parse(this.Settings);
            //
            //         if (typeof settings.expire == 'undefined')
            //             settings.expire = [];
            //
            //         settings.expire.push(data);
            //         this.save().then(function() {
            //             console.log("Expired Condition added");
            //         });
            //     },
            //
            //     getExpireConditions: function() {
            //         settings = JSON.parse(this.Settings);
            //
            //         if (typeof settings.expire == 'undefined')
            //             return null;
            //
            //         return settings.expire;
            //
            //     },
            //
            //     triggerConditionsAreMet: function(callback) {
            //         //this.getTriggerConditions();
            //         if (this.Status == 'triggered' || this.Status == 'started')
            //             return true;
            //
            //         var conditions = this.getTriggerConditions();
            //
            //         if (conditions == null) return false;
            //
            //         for (var i = 0; i < conditions.length; i++) {
            //             this.conditionMet(conditions[i], callback);
            //         }
            //         // if(!
            //
            //         //return false;
            //         //   )
            //
            //         //}
            //         /*conditions.forEach(function(condition){
            //                 if(!this.conditionMet(condition))
            //                     return false;
            //            });*/
            //
            //         //return true;
            //     },
            //     expireConditionsAreMet: function(callback) {
            //         conditions = this.getExpireConditions();
            //
            //         if (conditions == null) return false;
            //
            //         conditions.forEach(function(condition) {
            //             this.conditionMet(condition, callback)
            //                 //    return false;
            //         });
            //
            //         return true;
            //     },
            //     conditionMet: function(condition, callback) {
            //         if (typeof condition === 'undefined')
            //             throw Error('No condition type defined');
            //
            //
            //         switch (condition.type) {
            //             // See if tasks in a work flow are all at a certain status (all complete/expired/etc.)
            //             // Query by the task type
            //             case 'task status':
            //
            //                 if (typeof condition['task status'] === 'undefined')
            //                     throw Error('Condition not defined for "type of tasks status"');
            //
            //                 if (typeof condition['task type'] === 'undefined')
            //                     throw Error('Condition not defined for "type of tasks type"');
            //
            //
            //                 this.Model.modelManager.models[6].findAll({
            //                     where: {
            //                         WorkflowID: this.WorkflowID,
            //                         Settings: {
            //                             $ne: null,
            //                         },
            //                         Status: condition['task status']
            //                     }
            //                 }).then(function(tasklist) {
            //                     if (tasklist == null)
            //                         callback(false);
            //                     else {
            //                         for (var i = 0; i < tasklist.length; i++) {
            //                             var settings = JSON.parse(tasklist[i].Settings);
            //                             if (typeof settings.trigger[0] !== 'undefined') {
            //                                 if (settings.trigger[0].type == condition.type) {
            //                                     callback(false);
            //                                     return;
            //                                 }
            //                             }
            //
            //                         }
            //                         callback(true);
            //                     }
            //                 });
            //
            //
            //
            //                 break;
            //
            //             case 'reference unique task status':
            //
            //
            //                 if (typeof condition['task status'] === 'undefined')
            //                     throw Error('Condition not defined for "type of tasks status"');
            //
            //                 if (typeof condition['task type'] === 'undefined')
            //                     throw Error('Condition not defined for "type of tasks type"');
            //
            //                 if (typeof condition['task reference id'] === 'undefined')
            //                     throw Error('task reference id is not defined!"');
            //
            //
            //                 tasks = this.Model.modelManager.models[6].findAll({
            //                     where: {
            //                         WorkflowID: this.WorkflowID,
            //                         Settings: {
            //                             $ne: null
            //                         }
            //                     }
            //                 }).then(function(tasklist) {
            //                     if (tasklist == null)
            //                         callback(false);
            //                     else {
            //                         for (var i = 0; i < tasklist.length; i++) {
            //                             var settings = JSON.parse(tasklist[i].Settings);
            //                             if (typeof settings.trigger[0] !== 'undefined') {
            //                                 if (settings.trigger[0].type == condition.type && settings.trigger[0]['task reference id'] == condition['task reference id']) {
            //                                     callback(true);
            //                                     return;
            //                                 }
            //                             }
            //
            //                         }
            //                         callback(false);
            //                     }
            //                 });
            //
            //
            //                 break;
            //
            //             case 'value of task out of range':
            //             case 'value of task in range':
            //
            //                 if (typeof condition['task type'] === 'undefined')
            //                     throw Error('Condition not defined for "value of task out of range"');
            //
            //                 this.Model.modelManager.models[6].find({
            //                     where: {
            //                         WorkflowID: this.WorkflowID,
            //                         Settings: {
            //                             $ne: null
            //                         },
            //                         Data: {
            //                             $ne: null,
            //                         }
            //                     }
            //                 }).then(function(task) {
            //                     if (task == null)
            //                         callback(false);
            //                     else {
            //                         var data = JSON.parse(task.Data);
            //                         if (typeof data.value[0] !== 'undefined') {
            //                             callback(false);
            //                             return;
            //                         }
            //                         callback(true);
            //                     }
            //                 });
            //
            //
            //                 break;
            //                 // Check if the value of a task meets an expected value
            //             case 'compare value of task':
            //
            //                 if (typeof condition['task type'] === 'undefined')
            //                     throw Error('Task type not defined for "compare value of task"');
            //
            //                 if (typeof condition['compare value'] === 'undefined')
            //                     throw Error('Compare value not defined for "compare value of task"');
            //
            //
            //                 this.Model.modelManager.models[6].find({
            //                     where: {
            //                         WorkflowID: this.WorkflowID,
            //                         Settings: {
            //                             $ne: null
            //                         },
            //                         Data: {
            //                             $ne: null,
            //                         }
            //                     }
            //                 }).then(function(task) {
            //                     if (task == null)
            //                         callback(false);
            //                     else {
            //                         var data = JSON.parse(task.Data);
            //                         if (typeof data.value[0] !== 'undefined') {
            //                             callback(false);
            //                             return;
            //                         }
            //                         if (data.value[0] !== condition['compare value']) {
            //                             callback(false);
            //                             return;
            //                         }
            //
            //                         callback(true);
            //                     }
            //                 });
            //                 break;
            //
            //                 // See if a certain time has elapsed since this task was triggered
            //             case 'time since trigger':
            //
            //                 if (typeof condition['task elapsed'] === 'undefined')
            //                     throw Error('Task elapsed time condition not defined for "time since trigger"');
            //
            //                 // var time = new Date();
            //                 var time = new Date(this.StartDate.getTime() + (1000 * condition['task elapsed']));
            //
            //                 var now = new Date();
            //
            //                 if (time > now) {
            //                     callback(false);
            //                 } else
            //                     callback(true);
            //
            //
            //                 break;
            //                 // One of the tasks is a certain status
            //             case 'check tasks for status':
            //
            //                 if (typeof condition['task status'] === 'undefined' || !(condition['task types'] instanceof Array))
            //                     throw Error('Condition error');
            //
            //                 var flag = true;
            //
            //                 for (var i = 0; i < condition['task types'].length; i++) {
            //                     if (!flag)
            //                         return;
            //
            //                     this.Model.modelManager.models[6].find({
            //                         where: {
            //                             WorkflowID: this.WorkflowID,
            //                             Status: condition['task status']
            //                         }
            //                     }).then(function(task) {
            //
            //                         if (!flag)
            //                             return;
            //
            //                         if (task == null)
            //                             callback(false);
            //                         else {
            //                             var settings = JSON.parse(task.Settings);
            //                             if (typeof settings.trigger[0] !== 'undefined') {
            //                                 if (settings.trigger[0].type == condition.type) {
            //                                     callback(true);
            //                                     flag == false;
            //                                     return;
            //                                 }
            //                             }
            //                         }
            //                     });
            //                 }
            //                 if (flag)
            //                     callback(false);
            //
            //                 break;
            //                 // This will cause a task to be trigged if all other tasks in the workflow are not triggered
            //             case 'first task trigger':
            //                 this.count({
            //                     where: {
            //                         Status: {
            //                             $ne: 'not triggered'
            //                         },
            //                         TaskID: {
            //                             $ne: this.TaskID
            //                         }
            //                     }
            //                 }).then(function(count) {
            //                     if (count == 0)
            //                         callback(true);
            //                     else
            //                         callback(false);
            //                 });
            //                 break;
            //                 // Unknown type
            //             default:
            //                 throw Error('Workflow task condition does not have registered type');
            //
            //
            //
            //         }
            //     },
            //     trigger: function(force) // Default should be false
            //         {
            //             if (typeof force === 'undefined')
            //                 force = false;
            //
            //             if (this.Status != 'not triggered' && !force)
            //                 return true;
            //
            //             if (!this.isInternal() && this.UserID == null)
            //                 throw Error('No user assigned to task to trigger it.');
            //
            //             this.Status = 'triggered';
            //             this.StartDate = new Date();
            //             // Add force End to data base
            //             //this.EndForceDate = this.timeOut();
            //             this.Save();
            //
            //             //Notify the user
            //
            //             //check callbackname Piece
            //
            //         },
            //     timeOut: function() {
            //         // how to implement this method ?
            //         this.EndDate = new Date();
            //         this.Status = 'time out';
            //
            //         //Notify the user
            //
            //         //type has to be added to the data base
            //         if (this.Type == 'dispute') {
            //             this.setData('value', false);
            //             this.save().then(function() {
            //                 this.complete();
            //             });
            //
            //         } else {
            //             this.save().then(function() {
            //                 console.log("Task marked as complete");
            //             });
            //         }
            //
            //     },
            //     expire: function() {
            //         this.EndDate = new Date();
            //         this.Status = 'expire';
            //         this.save().then(function() {
            //             console.log("Task marked as expired");
            //         });
            //     },
            //     complete: function() {
            //         this.EndDate = new Date();
            //         this.Status = 'complete';
            //         this.save().then(function() {
            //             console.log("Task marked as complete");
            //         });
            //     },
            //     timeoutTime: function(callback) {
            //         if (this.StartDate == null)
            //             throw Error('Start time for instance cannot be null.');
            //
            //         //Missing task_times
            //         this.getTaskActivity().then(function(taskActivity) {
            //             var today = new Date();
            //             callback(today + taskActivity.MaximumDuration);
            //         });
            //     },
            //     forceEndTime: function(callback) {
            //         this.timeoutTime(callback);
            //     },
            //     getSettingsAttribute: function(value) {
            //         if (value == '')
            //             return [];
            //
            //         return JSON.parse(value);
            //     },
            //     setSettingsAttribute: function(value) {
            //         this.Settings = JSON.parse(value);
            //     },
            //     getDataAttribute: function(value) {
            //         if (value == '')
            //             return [];
            //
            //         return JSON.parse(value);
            //     },
            //     setDataAttribute: function(value) {
            //         this.Data = JSON.parse(value);
            //     },
            //     setData: function(key, value) {
            //         if (typeof value === 'undefined')
            //             value = null;
            //
            //         var data = JSON.parse(this.Data);
            //         data[key] = value;
            //         this.Data = data;
            //
            //     },
            //     setGrades: function(key, value) {
            //         if (typeof value === 'undefined')
            //             value = null;
            //
            //         var data = JSON.parse(this.Data);
            //         data['grades'][key] = value;
            //         this.Data = data;
            //
            //     },
            //     setSetting: function(key, value) {
            //         if (typeof value === 'undefined')
            //             value = null;
            //
            //         var setting = JSON.parse(this.Settings);
            //         setting[key] = value;
            //         this.Settings = setting;
            //     },
            //     humanTask: function() {
            //         //call human task name from manager
            //     },
            //     isInternal: function() {
            //         var setting = JSON.parse(this.Settings);
            //         return (typeof setting['internal' !== 'undefined'] && setting['internal'])
            //     }
            //
            //
            //
            // },
            //
            // classMethods: {
            //
            //     queryByStatus: function(user, status, callback) { //user is UserID
            //
            //         if (typeof status === 'undefined')
            //             status = 'pending';
            //
            //         this.find({
            //             where: {
            //                 UserID: user
            //             }
            //         }).then(function(task) {
            //             switch (status) {
            //                 case 'pending':
            //                     this.findAll({
            //                         where: {
            //                             $or: [{
            //                                 Status: "triggered"
            //                             }, {
            //                                 Status: "started"
            //                             }, {
            //                                 Status: 'timed out'
            //                             }]
            //                         }
            //                     }).then(callback);
            //                     break;
            //                 case 'completed':
            //                     this.findAll({
            //                         where: {
            //                             $or: [{
            //                                 Status: "complete"
            //                             }]
            //                         }
            //                     }).then(callback);
            //                     break;
            //                 case 'all':
            //                     this.findAll({
            //                         where: {
            //                             $or: [{
            //                                 Status: "not triggered"
            //                             }, {
            //                                 Status: "expired"
            //                             }]
            //                         }
            //                     }).then(callback);
            //                     break;
            //             }
            //
            //         });
            //
            //     }
        },
        // define the table's name
        tableName: 'taskinstance_archive'
    });
};
