var moment = require('moment');
var models = require('../Model');
var Email = require('../Workflow/Email.js');
var Promise = require('bluebird');
var _ = require('underscore');
var Util = require('../Workflow/Util.js');
var Grade = require('../Workflow/Grade.js');
//var Allocator = require('../Workflow/Allocator.js');
const logger = require('winston');
//var util = new Util();

module.exports = function (sequelize, DataTypes) {
    return sequelize.define('TaskInstance', {
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
            type: DataTypes.STRING,
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
        IsSubWorkflow: {
            type: DataTypes.INTEGER,
            field: 'IsSubworkflow',
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
            timeOutTime: function () {
                if (this.StartDate == null) {
                    throw Error('Start time for instance cannot be null.');
                } else if (this.EndDate == null) {
                    throw Error('End time for instance cannot be null.');
                }
                return this.EndDate;
            },

            triggerNext: async function () {
                let x = this;
                let email = new Email();

                if ((x.StartDate === null || x.EndDate === null) && JSON.parse(x.Status)[0] !== 'automatic') {
                    throw Error('Missing attributes!  TaskInstanceID:', x.TaskInstanceID);
                    return null;
                } else if (x.NextTask === null) {
                    x.completed();
                    return null;
                }


                return Promise.mapSeries(JSON.parse(x.NextTask), function (task, index) {
                    return Promise.mapSeries(taskArray, function (task) {
                        models.TaskInstance.find({
                            where: {
                                TaskInstanceID: task.id
                            }
                        }).then(function (nextTask) {
                            models.TaskActivity.find({
                                where: {
                                    TaskActivityID: nextTask.TaskActivityID
                                }
                            }).then(function (ta_result) {
                                return x.findType(function (type) {
                                    if (ta_result.Type === 'needs_consolidation' && nextTask.FinalGrade == null) {
                                        nextTask.needsConsolidate();
                                    } else if (type === 'consolidation' && x.FinalGrade == null && JSON.parse(x.Status)[0] !== 'bypassed') {
                                        x.consolidate();
                                    } else if (type === 'resolve_dispute' && x.FinalGrade == null && JSON.parse(x.Status)[0] !== 'bypassed') {
                                        x.resolveDispute();
                                    }
                                    // else if (ta_result.Type === 'completed') {
                                    //     nextTask.completed();
                                    // }
                                    else {
                                        //findNewDates return an array of [newStartDate, newEndDate]
                                        console.log('Triggering next task to start... Current TaskInstanceID:', x.TaskInstanceID);
                                        var dates = nextTask.findNewDates(function (dates) {
                                            var newStatus = JSON.parse(nextTask.Status);
                                            newStatus[0] = 'started';
                                            models.TaskInstance.update({
                                                Status: JSON.stringify(newStatus),
                                                StartDate: dates[0],
                                                EndDate: dates[1]
                                            }, {
                                                where: {
                                                    TaskInstanceID: nextTask.TaskInstanceID
                                                }
                                            }).then(function (done) {
                                                //email.sendNow(nextTask.UserID, 'new task', null);
                                            }).catch(function (err) {
                                                console.log(err);
                                                throw Error('Cannot start next task!');
                                                return null;
                                            });
                                        });
                                    }
                                });
                            });
                        });
                    });
                });
            },

            triggerEdit: function () {
                let x = this;
                let email = new Email();

                if ((x.StartDate === null || x.EndDate === null) && JSON.parse(x.Status)[0] !== 'automatic') {
                    throw Error('Missing attributes!  TaskInstanceID:', x.TaskInstanceID);
                    return null;
                } else if (x.NextTask === null) {
                    logger.log('error', 'trigger edit, next task is null');
                    return null;
                }



            },


            skipDispute: function () {

                let x = this;
                //checks if conditions are met
                if (x.StartDate === null || x.EndDate === null) {
                    throw Error('Missing attributes!  TaskInstanceID:', x.TaskInstanceID);
                    return null;
                } else if (x.NextTask === null) {
                    return null;
                }

                var newDate = new Date();
                var newStat = JSON.parse(x.Status);
                newStat[0] = 'complete';
                x.Status = JSON.stringify(newStat);
                x.ActualEndDate = newDate;

                return Promise.all([x.save()]).then(function () {
                    return Promise.mapSeries(JSON.parse(x.NextTask), function (taskArray, index) {
                        return Promise.mapSeries(taskArray, function (task) {
                            models.TaskInstance.find({
                                where: {
                                    TaskInstanceID: task.id
                                }
                            }).then(function (nextTask) {
                                models.TaskActivity.find({
                                    where: {
                                        TaskActivityID: nextTask.TaskActivityID
                                    }
                                }).then(function (ta_result) {

                                    //findNewDates return an array of [newStartDate, newEndDate]
                                    console.log('Skipping dispute task... Current TaskInstanceID:', x.TaskInstanceID);

                                    var newStatus = JSON.parse(nextTask.Status);
                                    newStatus[0] = 'bypassed';
                                    models.TaskInstance.update({
                                        Status: JSON.stringify(newStatus),
                                        StartDate: newDate,
                                        EndDate: newDate,
                                        ActualEndDate: newDate
                                    }, {
                                        where: {
                                            TaskInstanceID: nextTask.TaskInstanceID
                                        }
                                    }).catch(function (err) {
                                        console.log(err);
                                        throw Error('Cannot start next task!');
                                        return null;
                                    });
                                });
                            });
                        });
                    });
                });
            },

            //After needs consolidation, if the grades do not exceed threshold, skip consolidation
            skipConsolidation: function () {

                let x = this;
                //checks if conditions are met
                if (x.NextTask === null) {
                    return null;
                }

                var newDate = new Date();

                return Promise.all([x.save()]).then(function () {
                    return Promise.mapSeries(JSON.parse(x.NextTask), function (taskArray, index) {
                        return Promise.mapSeries(taskArray, function (task) {
                            models.TaskInstance.find({
                                where: {
                                    TaskInstanceID: task.id
                                }
                            }).then(function (nextTask) {
                                models.TaskActivity.find({
                                    where: {
                                        TaskActivityID: nextTask.TaskActivityID
                                    }
                                }).then(function (ta_result) {

                                    //findNewDates return an array of [newStartDate, newEndDate]
                                    console.log('Skipping consolidation task... Current TaskInstanceID:', x.TaskInstanceID);
                                    var newStatus = JSON.parse(nextTask.Status);
                                    newStatus[0] = 'bypassed';
                                    return models.TaskInstance.update({
                                        Status: JSON.stringify(newStatus),
                                        StartDate: newDate,
                                        EndDate: newDate,
                                        ActualEndDate: newDate
                                    }, {
                                        where: {
                                            TaskInstanceID: nextTask.TaskInstanceID
                                        }
                                    }).then(function (done) {
                                        return Promise.mapSeries(JSON.parse(nextTask.NextTask), function (taskArray, index) {
                                            return Promise.mapSeries(taskArray, function (task) {
                                                models.TaskInstance.find({
                                                    where: {
                                                        TaskInstanceID: task.id
                                                    }
                                                }).then(function (nextNextTask) {

                                                    //findNewDates return an array of [newStartDate, newEndDate]
                                                    console.log('Triggering next task to start... Current TaskInstanceID:', x.TaskInstanceID);
                                                    var dates = nextTask.findNewDates(function (dates) {
                                                        var newStatus = JSON.parse(nextNextTask.Status);
                                                        newStatus[0] = 'started';
                                                        models.TaskInstance.update({
                                                            Status: JSON.stringify(newStatus),
                                                            StartDate: dates[0],
                                                            EndDate: dates[1]
                                                        }, {
                                                            where: {
                                                                TaskInstanceID: nextNextTask.TaskInstanceID
                                                            }
                                                        }).catch(function (err) {
                                                            console.log(err);
                                                            throw Error('Cannot start next task!');
                                                            return null;
                                                        });
                                                    });
                                                });
                                            });
                                        });
                                    }).catch(function (err) {
                                        console.log(err);
                                        throw Error('Cannot start next task!');
                                        return null;
                                    });
                                });
                            });
                        });
                    });
                });
            },

            findType: function (callback) {
                var x = this;
                return models.TaskActivity.find({
                    where: {
                        TaskActivityID: x.TaskActivityID
                    }
                }).then(function (ta) {
                    callback(ta.Type);
                });
            },

            getType: async function () {
                var x = this;
                var ta = await models.TaskActivity.find({
                    where: {
                        TaskActivityID: x.TaskActivityID
                    }
                });

                return ta.Type;
            },

            //findNewDates computes the startDate passed in and find newStartDate and newEndDate
            findNewDates: function (callback) {
                models.TaskActivity.find({
                    where: {
                        TaskActivityID: this.TaskActivityID
                    }
                }).then(function (ta_result) {
                    //console.log('ta_result', ta_result);
                    var newStartDate = moment().add(JSON.parse(ta_result.StartDelay), 'minutes');
                    var newEndDate = moment().add(JSON.parse(ta_result.StartDelay), 'minutes');
                    if (JSON.parse(ta_result.DueType)[0] === 'duration') {
                        newEndDate.add(JSON.parse(ta_result.DueType)[1], 'minutes');
                    } else if (JSON.parse(ta_result.DueType)[0] === 'specificTime') {
                        newEndDate = moment(JSON.parse(ta_result.DueType)[1]).toDate();
                    }
                    callback([newStartDate, newEndDate]);
                }).catch(function (err) {
                    console.log(err);
                    throw Error('Cannot find Date!');
                });
            },

            extendDate: function (time, dueType) {
                var x = this;
                if (dueType === 'specific time') {
                    var newEndDate = moment().add(2880, 'minutes');

                    x.EndDate = newEndDate;
                    x.save();
                } else {
                    var newEndDate = moment().add(time, 'minutes');

                    x.EndDate = newEndDate;
                    x.save();
                }
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

            getTaskActivity: function (callback) {
                models.TaskActivity.find({
                    where: {
                        TaskActivityID: this.TaskActivityID
                    }
                }).then(function (ta_result) {
                    callback(ta_result);
                }).catch(function (err) {
                    console.log(err);
                    throw Error('Cannot find TaskActivity!');
                });
            },

            findDueType: function (callback) {
                models.TaskActivity.find({
                    where: {
                        TaskActivityID: this.TaskActivityID
                    }
                }).then(function (ta_result) {
                    //console.log('ta_result', ta_result);
                    callback(ta_result.DueType);
                }).catch(function (err) {
                    console.log(err);
                    throw Error('Cannot find DueType!');
                });
            },

            //Consolidate grading tasks
            needsConsolidate: function () {
                var x = this;
                var isAllCompleted = true;
                var triggerConsolidate = false;
                console.log('Checking all grading solution complete...');
                return Promise.map(JSON.parse(x.PreviousTask), function (ti) {
                    return models.TaskInstance.find({
                        where: {
                            TaskInstanceID: ti.id
                        }
                    }).then(function (ti_result) {
                        //Check if all grading solution are completed
                        if (JSON.parse(ti_result.Status)[0] != 'complete') {
                            console.log('Grading tasks pending...');
                            isAllCompleted = false;
                        }
                    });
                }).then(function (done) {
                    if (isAllCompleted) {
                        //if isAllCompleted = true then find the grades in previous grading solution tasks
                        console.log('Consolidating Tasks...');
                        return x.findNeedsConsolidationGrades(function (grades, maxGrade) {
                            console.log('grades', grades);
                            console.log('maxGrade is: ', maxGrade);
                            var max = Math.max.apply(null, grades);
                            var min = Math.min.apply(null, grades);
                            //
                            models.TaskActivity.find({
                                where: {
                                    TaskActivityID: x.TaskActivityID
                                }
                            }).then(function (ta_result) {

                                //checks if the grades exceed threshold
                                if (JSON.parse(ta_result.TriggerConsolidationThreshold)[1] == 'percent') {
                                    var percent = (max - min) / maxGrade * 100;
                                    if (percent > JSON.parse(ta_result.TriggerConsolidationThreshold)[0]) {
                                        triggerConsolidate = true;
                                    }
                                } else if (JSON.parse(ta_result.TriggerConsolidationThreshold)[1] == 'point') {
                                    var point = max - min;
                                    if (point > ta_result.JSON.parse(ta_result.TriggerConsolidationThreshold)[0]) {
                                        triggerConsolidate = true;
                                    }
                                }

                                //insert grade
                                if (ta_result.FunctionType === 'max') {
                                    console.log('The needs consolidation grade is: ', max);
                                    x.FinalGrade = max;
                                } else if (ta_result.FunctionType === 'min') {
                                    console.log('The needs consolidation grade is: ', min);
                                    x.FinalGrade = min;
                                } else if (ta_result.FunctionType === 'average') {
                                    console.log('The needs consolidation grade is: ', (max + min) / 2);
                                    x.FinalGrade = (max + min) / 2;
                                }
                                x.save();
                            }).then(function () {
                                console.log('All tasks completed!', triggerConsolidate);
                                if (triggerConsolidate) {
                                    console.log('Threshold exceed!');
                                    x.triggerNext();
                                } else {
                                    x.skipConsolidation();
                                }
                            }).catch(done);

                        });

                        //consolidate calculation
                        //if the difference exceed threshold, open consolidate task, otherwise, bypass consolidation.
                    }
                });
            },

            findNeedsConsolidationGrades: function (callback) {

                console.log('computing grades...');

                var x = this;
                var grades = [];
                var maxGrade = 0;
                var numParticipants;
                return Promise.map(JSON.parse(x.PreviousTask), function (ti) {
                    var grade = 0;
                    return models.TaskInstance.find({
                        where: {
                            TaskInstanceID: ti.id
                        },
                        include: [{
                            model: models.TaskActivity
                        }]
                    }).then(function (ti_result) {
                        var keys = Object.keys(JSON.parse(ti_result.Data));
                        numParticipants = ti_result.TaskActivity.NumberParticipants;
                        return Promise.mapSeries(keys, function (val) {
                            if (val !== 'number_of_fields' && JSON.parse(ti_result.TaskActivity.Fields)[val].field_type == 'assessment') {
                                if (JSON.parse(ti_result.TaskActivity.Fields)[val].assessment_type == 'grade') {
                                    grade += parseInt(JSON.parse(ti_result.Data)[val][0]);
                                    maxGrade += JSON.parse(ti_result.TaskActivity.Fields)[val].numeric_max;
                                } else if (JSON.parse(ti_result.TaskActivity.Fields)[val].assessment_type == 'rating') {
                                    grade += parseInt(JSON.parse(ti_result.Data)[val][0]) * (100 / JSON.parse(ti_result.TaskActivity.Fields)[val].rating_max);
                                    maxGrade += 100;
                                } else if (JSON.parse(ti_result.TaskActivity.Fields)[val].assessment_type == 'evaluation') {
                                    // How evaluation works?
                                    // if(JSON.parse(ti_result.Data)[val][0] == 'Easy'){
                                    //
                                    // } else if(JSON.parse(ti_result.Data)[val][0] == 'Medium'){
                                    //
                                    // } else if(JSON.parse(ti_result.Data)[val][0] == 'Hard'){
                                    //
                                    // }
                                }
                            }
                        }).then(function () {
                            grades.push(grade);
                        }).catch(function (err) {
                            console.log(err);
                        });
                    });
                }).then(function (done) {
                    callback(grades, maxGrade / numParticipants);
                }).catch(function (err) {
                    console.log(err);
                });
            },


            consolidate: function () {
                var x = this;

                var grade = 0;
                return models.TaskActivity.find({
                    where: {
                        TaskActivityID: x.TaskActivityID
                    },
                }).then(function (ta_result) {
                    console.log(JSON.parse(x.Data), x.TaskInstanceID);
                    var keys = Object.keys(JSON.parse(x.Data));

                    return Promise.mapSeries(keys, function (val) {
                        if (val !== 'number_of_fields' && JSON.parse(ta_result.Fields)[val].field_type == 'assessment') {
                            if (JSON.parse(ta_result.Fields)[val].assessment_type == 'grade') {
                                grade += parseInt(JSON.parse(x.Data)[val][0]);
                            } else if (JSON.parse(ta_result.Fields)[val].assessment_type == 'rating') {
                                grade += parseInt(JSON.parse(x.Data)[val][0]) * (100 / JSON.parse(ta_result.Fields)[val].rating_max);
                            } else if (JSON.parse(ta_result.Fields)[val].assessment_type == 'evaluation') {
                                // How evaluation works?
                                // if(JSON.parse(x.Data)[val][0] == 'Easy'){
                                //
                                // } else if(JSON.parse(x.Data)[val][0] == 'Medium'){
                                //
                                // } else if(JSON.parse(x.Data)[val][0] == 'Hard'){
                                //
                                // }
                            }
                        }
                    }).then(function () {
                        //insert grade
                        console.log('consolidated grade: ', grade);
                        x.FinalGrade = grade;
                        x.save();
                    }).then(function (done) {
                        x.triggerNext();
                    }).catch(function (err) {
                        console.log(err);
                    });
                });

            },

            findConsolidationAndDisputeGrade: function (callback) {
                console.log('computing grades...');

                var x = this;

                var grade = 0;
                return models.TaskActivity.find({
                    where: {
                        TaskActivityID: x.TaskActivityID
                    },
                }).then(function (ta_result) {
                    var keys = Object.keys(JSON.parse(x.Data));

                    return Promise.mapSeries(keys, function (val) {
                        if (val !== 'number_of_fields' && JSON.parse(ta_result.Fields)[val].field_type == 'assessment') {
                            if (JSON.parse(ta_result.Fields)[val].assessment_type == 'grade') {
                                grade += parseInt(JSON.parse(x.Data)[val][0]);
                            } else if (JSON.parse(ta_result.Fields)[val].assessment_type == 'rating') {
                                grade += parseInt(JSON.parse(x.Data)[val][0]) * (100 / JSON.parse(ta_result.Fields)[val].rating_max);
                            } else if (JSON.parse(ta_result.Fields)[val].assessment_type == 'evaluation') {
                                // How evaluation works?
                                // if(JSON.parse(x.Data)[val][0] == 'Easy'){
                                //
                                // } else if(JSON.parse(x.Data)[val][0] == 'Medium'){
                                //
                                // } else if(JSON.parse(x.Data)[val][0] == 'Hard'){
                                //
                                // }
                            }
                        }
                    }).then(function () {
                        callback(grade);
                    }).catch(function (err) {
                        console.log(err);
                    });
                });
            },

            retrieveNeedsConsolidationGrades: function (callback) {
                var x = this;
                var grade = [];

                return Promise.mapSeries(JSON.parse(x.PreviousTask), function (ti) {
                    return models.TaskInstance.find({
                        where: {
                            TaskInstanceID: ti.id
                        }
                    }).then(function (needsConsolidation) {
                        return needsConsolidation.findNeedsConsolidationGrades(function (grades, maxGrade) {
                            callback(grades, maxGrade);
                        });
                    });
                });
            },

            resolveDispute: function () {
                var x = this;
                console.log('resolving dispute grade...');
                return x.findConsolidationAndDisputeGrade(function (grade) {
                    console.log('disputed grade: ', grade);
                    x.FinalGrade = grade;
                    x.save();
                }).then(function (done) {
                    x.triggerNext();
                }).catch(function (err) {
                    console.log(err);
                });
            },



            completed: async function () {
                var x = this;
                var isWorkflowCompleted = false;
                var isAllCompleted = false;
                var grade = new Grade();
                console.log('Checking all subworkflows are completed...');
                // check if the workflow of the assignment that belongs to the user is completed
                // check if all the workflow of the assignment that belongs to the user is completed

                //TODO: To check a workflow instance has completed find the task collection from workflow instance and search them all
                //TODO: To check if a assignement instance has completed find the workflow collection from assignment instance and search through them.

                await grade.checkWorkflowDone(x.WorkflowInstanceID);

                return Promise.all([x.triverseWorkflow()]).then(function (result) {
                    console.log(result);
                    if (result[0] !== null || result === null) {
                        return models.WorkflowInstance.find({
                            where: {
                                WorkflowInstanceID: x.WorkflowInstanceID
                            },
                            include: [{
                                model: models.AssignmentInstance
                            }]
                        }).then(function (wi) {
                            console.log('Searching final grade belongs to...');
                            return Promise.all([x.gradeBelongsTo()]).then(function (userid) {
                                console.log(userid);
                                return models.SectionUser.find({
                                    where: {
                                        UserID: userid[0],
                                        SectionID: wi.AssignmentInstance.SectionID
                                    }
                                }).then(function (user) {
                                    console.log('result', user.SectionUserID, result);

                                    return models.TaskGrade.create({
                                        SectionUserID: user.SectionUserID,
                                        WorkflowActivityID: result[0][0],
                                        TaskInstanceID: result[0][1],
                                        Grade: result[0][2]
                                    }).then(done => {
                                        console.log('task grade created');
                                    }).catch(err => {
                                        console.log(err);
                                    });
                                });
                            });
                        });
                        console.log(grade);
                        // return TaskGrade.create({
                        //
                        // })
                    }


                    //when a workflow has reached complete. This function will be called
                    //It will go through the workflow structure and triverse the tree to see if all other
                    //subworkflows are completed.
                    //If everything has been completed, collect the grades.
                });
            },


            //Trace the previous tasks to find the final grade
            triverseWorkflow: function () {
                var x = this;
                console.log('traversing the workflow to find final grade...');
                if (x.FinalGrade !== null) {

                    console.log('Final grade found! The final grade is:', x.FinalGrade);

                    return models.WorkflowInstance.find({
                        where: {
                            WorkflowInstanceID: x.WorkflowInstanceID
                        },
                    }).then(function (wi) {
                        //[WorkflowActivityID, TaskInstanceID, FinalGrade]
                        return [wi.WorkflowActivityID, x.TaskInstanceID, x.FinalGrade];
                    });

                } else if (x.FinalGrade === null && x.PreviousTask != null) {
                    //return Promise.map(JSON.parse(x.PreviousTask), ti => {
                    return models.TaskInstance.find({
                        where: {
                            TaskInstanceID: JSON.parse(x.PreviousTask)[0].id
                        }
                    }).then(ti_result => {
                        //Check if all grading solution are completed
                        return ti_result.triverseWorkflow();
                    });
                    //})
                } else {
                    console.log('no grades found.');
                    return null;
                }
            },

            //Find final grade belongs to which user
            gradeBelongsTo: function () {
                var x = this;

                return models.TaskActivity.find({
                    where: {
                        TaskActivityID: x.TaskActivityID
                    }
                }).then(function (ta_result) {
                    if (ta_result.Type === 'grade_problem') {
                        //return Promise.map(JSON.parse(x.PreviousTask), ti => {
                        return models.TaskInstance.find({
                            where: {
                                TaskInstanceID: JSON.parse(x.PreviousTask)[0].id
                            }
                        }).then(ti_result => {
                            console.log('UserID found:', ti_result.UserID);
                            return ti_result.UserID;
                        });
                        //})

                    } else {
                        //return Promise.map(JSON.parse(x.PreviousTask), ti => {
                        return models.TaskInstance.find({
                            where: {
                                TaskInstanceID: JSON.parse(x.PreviousTask)[0].id
                            }
                        }).then(ti_result => {
                            return ti_result.gradeBelongsTo();
                        });
                        //})
                    }
                });
            }

        },
        // define the table's name
        tableName: 'TaskInstance'
    });
};