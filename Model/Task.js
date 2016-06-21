/**
 * Created by cesarsalazar on 3/29/16.
 */
module.exports = function(sequelize, DataTypes) {
    return sequelize.define('Task', {
        TaskID: {
            type: DataTypes.INTEGER,
            field: 'TaskID', // Will result in an attribute that is firstName when user facing but first_name in the database
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        UserID: {
            type: DataTypes.INTEGER,
            field: 'UserID',
            allowNull: false
        },
        TaskActivityID: {
            type: DataTypes.INTEGER,
            field: 'TaskActivityID', // Will result in an attribute that is firstName when user facing but first_name in the database
            allowNull: false
        },
        WorkflowID: {
            type: DataTypes.INTEGER,
            field: 'WorlkflowID',
            allowNull: false
        },
        AssignmentSectionID: {
            type: DataTypes.INTEGER,
            field: 'AssignmentSectionID', // Will result in an attribute that is firstName when user facing but first_name in the database
            allowNull: false
        },
        Task_status: {
            type: DataTypes.STRING,
            field: 'Task_status', // Will result in an attribute that is firstName when user facing but first_name in the database
            allowNull: true,
            defaultValue: 'INCOMPLETE'
        },
        StartDate: {
            type: DataTypes.DATE,
            field: 'StartDate',
            allowNull: false
        },
        EndDate: {
            type: DataTypes.DATE,
            field: 'EndDate', // Will result in an attribute that is firstName when user facing but first_name in the database
            allowNull: false
        },
        Data: {
            type: DataTypes.JSON,
            field: 'Data', // Will result in an attribute that is firstName when user facing but first_name in the database
            allowNull: false
        },
        Settings: {
            type: DataTypes.JSON,
            field: 'Settings',
            allowNull: false
        },
        GroupID: {
            type: DataTypes.INTEGER,
            field: 'GroupID', // Will result in an attribute that is firstName when user facing but first_name in the database
            allowNull: true
        },
        type: {
            type: DataTypes.STRING,
            field: 'type', // Will result in an attribute that is firstName when user facing but first_name in the database
            allowNull: true
        },
        user_history: {
            type: DataTypes.BLOB,
            field: 'user_history',
            allowNull: true
        },
        Task_final_grade: {
            type: DataTypes.FLOAT,
            field: 'Task_final_grade',
            allowNull: true
        },
        Task_files: {
            type: DataTypes.JSON,
            field: 'Task_files',
            allowNull: true
        },
        Task_reference: {
            type: DataTypes.INTEGER,
            field: 'Task_reference',
            allowNull: true
        },
        Next_Tasks: {
            type: DataTypes.BLOB,
            field: 'Next_Tasks',
            allowNull: true
        },
        Previous_Tasks: {
            type: DataTypes.BLOB,
            field: 'Previous_Tasks',
            allowNull: true
        },
        Email_Last_Sent: {
            type: DataTypes.DATE,
            field: 'Email_Last_Sent',
            allowNull: false,
            defaultValue: '2000-01-01T00:00:00'
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

            addTriggerCondition: function(data) {
                var settings = JSON.parse(this.Settings);

                if (typeof settings.trigger === 'undefined')
                    settings.trigger = [];
                //else
                settings.trigger.push(data);

                this.Settings = settings;

                this.save().then(function() {
                    console.log("Trigger added");
                });
            },
            getTriggerConditions: function() {
                settings = JSON.parse(this.Settings);

                if (typeof settings.trigger == 'undefined')
                    return null;

                return settings.trigger;
            },
            addExpireCondition: function(data) {
                settings = JSON.parse(this.Settings);

                if (typeof settings.expire == 'undefined')
                    settings.expire = [];

                settings.expire.push(data);
                this.save().then(function() {
                    console.log("Expired Condition added");
                });
            },
            getExpireConditions: function() {
                settings = JSON.parse(this.Settings);

                if (typeof settings.expire == 'undefined')
                    return null;

                return settings.expire;

            },
            triggerConditionsAreMet: function(callback) {
                //this.getTriggerConditions();
                if (this.Status == 'triggered' || this.Status == 'started')
                    return true;

                var conditions = this.getTriggerConditions();

                if (conditions == null) return false;

                for (var i = 0; i < conditions.length; i++) {
                    this.conditionMet(conditions[i], callback);
                }
                // if(!

                //return false;
                //   )

                //}
                /*conditions.forEach(function(condition){
                        if(!this.conditionMet(condition))
                            return false;
                   });*/

                //return true;
            },
            expireConditionsAreMet: function(callback) {
                conditions = this.getExpireConditions();

                if (conditions == null) return false;

                conditions.forEach(function(condition) {
                    this.conditionMet(condition, callback)
                        //    return false;
                });

                return true;
            },
            conditionMet: function(condition, callback) {
                if (typeof condition === 'undefined')
                    throw Error('No condition type defined');


                switch (condition.type) {
                    // See if tasks in a work flow are all at a certain status (all complete/expired/etc.)
                    // Query by the task type
                    case 'task status':

                        if (typeof condition['task status'] === 'undefined')
                            throw Error('Condition not defined for "type of tasks status"');

                        if (typeof condition['task type'] === 'undefined')
                            throw Error('Condition not defined for "type of tasks type"');


                        this.Model.modelManager.models[6].findAll({
                            where: {
                                WorkflowID: this.WorkflowID,
                                Settings: {
                                    $ne: null,
                                },
                                Status: condition['task status']
                            }
                        }).then(function(tasklist) {
                            if (tasklist == null)
                                callback(false);
                            else {
                                for (var i = 0; i < tasklist.length; i++) {
                                    var settings = JSON.parse(tasklist[i].Settings);
                                    if (typeof settings.trigger[0] !== 'undefined') {
                                        if (settings.trigger[0].type == condition.type) {
                                            callback(false);
                                            return;
                                        }
                                    }

                                }
                                callback(true);
                            }
                        });



                        break;

                    case 'reference unique task status':


                        if (typeof condition['task status'] === 'undefined')
                            throw Error('Condition not defined for "type of tasks status"');

                        if (typeof condition['task type'] === 'undefined')
                            throw Error('Condition not defined for "type of tasks type"');

                        if (typeof condition['task reference id'] === 'undefined')
                            throw Error('task reference id is not defined!"');


                        tasks = this.Model.modelManager.models[6].findAll({
                            where: {
                                WorkflowID: this.WorkflowID,
                                Settings: {
                                    $ne: null
                                }
                            }
                        }).then(function(tasklist) {
                            if (tasklist == null)
                                callback(false);
                            else {
                                for (var i = 0; i < tasklist.length; i++) {
                                    var settings = JSON.parse(tasklist[i].Settings);
                                    if (typeof settings.trigger[0] !== 'undefined') {
                                        if (settings.trigger[0].type == condition.type && settings.trigger[0]['task reference id'] == condition['task reference id']) {
                                            callback(true);
                                            return;
                                        }
                                    }

                                }
                                callback(false);
                            }
                        });


                        break;

                    case 'value of task out of range':
                    case 'value of task in range':

                        if (typeof condition['task type'] === 'undefined')
                            throw Error('Condition not defined for "value of task out of range"');

                        this.Model.modelManager.models[6].find({
                            where: {
                                WorkflowID: this.WorkflowID,
                                Settings: {
                                    $ne: null
                                },
                                Data: {
                                    $ne: null,
                                }
                            }
                        }).then(function(task) {
                            if (task == null)
                                callback(false);
                            else {
                                var data = JSON.parse(task.Data);
                                if (typeof data.value[0] !== 'undefined') {
                                    callback(false);
                                    return;
                                }
                                callback(true);
                            }
                        });


                        break;
                        // Check if the value of a task meets an expected value
                    case 'compare value of task':

                        if (typeof condition['task type'] === 'undefined')
                            throw Error('Task type not defined for "compare value of task"');

                        if (typeof condition['compare value'] === 'undefined')
                            throw Error('Compare value not defined for "compare value of task"');


                        this.Model.modelManager.models[6].find({
                            where: {
                                WorkflowID: this.WorkflowID,
                                Settings: {
                                    $ne: null
                                },
                                Data: {
                                    $ne: null,
                                }
                            }
                        }).then(function(task) {
                            if (task == null)
                                callback(false);
                            else {
                                var data = JSON.parse(task.Data);
                                if (typeof data.value[0] !== 'undefined') {
                                    callback(false);
                                    return;
                                }
                                if (data.value[0] !== condition['compare value']) {
                                    callback(false);
                                    return;
                                }

                                callback(true);
                            }
                        });
                        break;

                        // See if a certain time has elapsed since this task was triggered
                    case 'time since trigger':

                        if (typeof condition['task elapsed'] === 'undefined')
                            throw Error('Task elapsed time condition not defined for "time since trigger"');

                        // var time = new Date();
                        var time = new Date(this.StartDate.getTime() + (1000 * condition['task elapsed']));

                        var now = new Date();

                        if (time > now) {
                            callback(false);
                        } else
                            callback(true);


                        break;
                        // One of the tasks is a certain status
                    case 'check tasks for status':

                        if (typeof condition['task status'] === 'undefined' || !(condition['task types'] instanceof Array))
                            throw Error('Condition error');

                        var flag = true;

                        for (var i = 0; i < condition['task types'].length; i++) {
                            if (!flag)
                                return;

                            this.Model.modelManager.models[6].find({
                                where: {
                                    WorkflowID: this.WorkflowID,
                                    Status: condition['task status']
                                }
                            }).then(function(task) {

                                if (!flag)
                                    return;

                                if (task == null)
                                    callback(false);
                                else {
                                    var settings = JSON.parse(task.Settings);
                                    if (typeof settings.trigger[0] !== 'undefined') {
                                        if (settings.trigger[0].type == condition.type) {
                                            callback(true);
                                            flag == false;
                                            return;
                                        }
                                    }
                                }
                            });
                        }
                        if (flag)
                            callback(false);

                        break;
                        // This will cause a task to be trigged if all other tasks in the workflow are not triggered
                    case 'first task trigger':
                        this.count({
                            where: {
                                Status: {
                                    $ne: 'not triggered'
                                },
                                TaskID: {
                                    $ne: this.TaskID
                                }
                            }
                        }).then(function(count) {
                            if (count == 0)
                                callback(true);
                            else
                                callback(false);
                        });
                        break;
                        // Unknown type
                    default:
                        throw Error('Workflow task condition does not have registered type');



                }
            },
            trigger: function(force) // Default should be false
                {
                    if (typeof force === 'undefined')
                        force = false;

                    if (this.Status != 'not triggered' && !force)
                        return true;

                    if (!this.isInternal() && this.UserID == null)
                        throw Error('No user assigned to task to trigger it.');

                    this.Status = 'triggered';
                    this.StartDate = new Date();
                    // Add force End to data base
                    //this.EndForceDate = this.timeOut();
                    this.Save();

                    //Notify the user

                    //check callbackname Piece

                },
            timeOut: function() {
                // how to implement this method ?
                this.EndDate = new Date();
                this.Status = 'time out';

                //Notify the user

                //type has to be added to the data base
                if (this.type == 'dispute') {
                    this.setData('value', false);
                    this.save().then(function() {
                        this.complete();
                    });

                } else {
                    this.save().then(function() {
                        console.log("Task marked as complete");
                    });
                }

            },
            expire: function() {
                this.EndDate = new Date();
                this.Status = 'expire';
                this.save().then(function() {
                    console.log("Task marked as expired");
                });
            },
            complete: function() {
                this.EndDate = new Date();
                this.Status = 'complete';
                this.save().then(function() {
                    console.log("Task marked as complete");
                });
            },
            timeoutTime: function(callback) {
                if (this.StartDate == null)
                    throw Error('Start time for instance cannot be null.');

                //Missing task_times
                this.getTaskActivity().then(function(taskActivity) {
                    var today = new Date();
                    callback(today + taskActivity.MaximumDuration);
                });
            },
            forceEndTime: function(callback) {
                this.timeoutTime(callback);
            },
            getSettingsAttribute: function(value) {
                if (value == '')
                    return [];

                return JSON.parse(value);
            },
            setSettingsAttribute: function(value) {
                this.Settings = JSON.parse(value);
            },
            getDataAttribute: function(value) {
                if (value == '')
                    return [];

                return JSON.parse(value);
            },
            setDataAttribute: function(value) {
                this.Data = JSON.parse(value);
            },
            setData: function(key, value) {
                if (typeof value === 'undefined')
                    value = null;

                var data = JSON.parse(this.Data);
                data[key] = value;
                this.Data = data;

            },
            setGrades: function(key, value) {
                if (typeof value === 'undefined')
                    value = null;

                var data = JSON.parse(this.Data);
                data['grades'][key] = value;
                this.Data = data;

            },
            setSetting: function(key, value) {
                if (typeof value === 'undefined')
                    value = null;

                var setting = JSON.parse(this.Settings);
                setting[key] = value;
                this.Settings = setting;
            },
            humanTask: function() {
                //call human task name from manager
            },
            isInternal: function() {
                var setting = JSON.parse(this.Settings);
                return (typeof setting['internal' !== 'undefined'] && setting['internal'])
            }



        },

        classMethods: {

            queryByStatus: function(user, status, callback) { //user is UserID

                if (typeof status === 'undefined')
                    status = 'pending';

                this.find({
                    where: {
                        UserID: user
                    }
                }).then(function(task) {
                    switch (status) {
                        case 'pending':
                            this.findAll({
                                where: {
                                    $or: [{
                                        Status: "triggered"
                                    }, {
                                        Status: "started"
                                    }, {
                                        Status: 'timed out'
                                    }]
                                }
                            }).then(callback);
                            break;
                        case 'completed':
                            this.findAll({
                                where: {
                                    $or: [{
                                        Status: "complete"
                                    }]
                                }
                            }).then(callback);
                            break;
                        case 'all':
                            this.findAll({
                                where: {
                                    $or: [{
                                        Status: "not triggered"
                                    }, {
                                        Status: "expired"
                                    }]
                                }
                            }).then(callback);
                            break;
                    }

                });

            }
        },
        // define the table's name
        tableName: 'Task'
    });
};

///var User =

///module.exports = User;
