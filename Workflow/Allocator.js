import {
    Assignment,
    AssignmentGrade,
    AssignmentInstance,
    AssignmentInstance_Archive,
    Assignment_Archive,
    Badge,
    BadgeInstance,
    Category,
    CategoryInstance,
    Comments,
    CommentsArchive,
    CommentsViewed,
    Contact,
    Course,
    CourseBackUp,
    EmailNotification,
    ExtraCredit,
    FileReference,
    Goal,
    GoalInstance,
    Level,
    LevelInstance,
    Organization,
    PartialAssignments,
    ResetPasswordRequest,
    Section,
    SectionUser,
    SectionUserRecord,
    Semester,
    StudentRankSnapchot,
    SectionRankSnapchot,
    TaskActivity,
    TaskActivity_Archive,
    TaskGrade,
    TaskInstance,
    TaskInstance_Archive,
    TaskSimpleGrade,
    User,
    UserContact,
    UserLogin,
    UserBadgeInstances,
    UserPointInstances,
    VolunteerPool,
    WorkflowActivity,
    WorkflowActivity_Archive,
    WorkflowGrade,
    WorkflowInstance,
    WorkflowInstance_Archive
} from '../Util/models.js';
import { resolve } from 'url';

var models = require('../Model');
var Promise = require('bluebird');
var moment = require('moment');
var TaskFactory = require('./TaskFactory.js');
var _ = require('underscore');
var Email = require('./Email.js');

const logger = require('./Logger.js');
var email = new Email();

class Allocator {

    //constructor, give users and one workflow from WorkflowTiming
    constructor(users, userIndex) {
        this.users = users;
        this.workflow = {};
        this.pointer = userIndex;
        this.count = 0;
    }

    getRightUser(ta_id) {
        let x = this;
        let taskUser = [];

        return new Promise(function (resolve, reject) {
            return TaskActivity.find({
                where: {
                    TaskActivityID: ta_id
                }
            }).then(function (ta) {

                let constraints = JSON.parse(ta.AssigneeConstraints)[2];

                if (JSON.parse(ta.AssigneeConstraints)[0] === 'instructor') {
                    return x.getInstructor(ta_id).then(function (instructor) {
                        taskUser.push(instructor);
                        resolve(taskUser);
                    });
                } else {

                    if (ta.Type === 'needs_consolidation') { //|| ta.Type === 'completed') {
                        if (Object.keys(x.workflow).length < 1) {
                            var same = constraints.same_as[0];
                            console.log('same', same);
                            console.log('workflow', x.workflow);
                            taskUser.push(0);
                        } else {
                            var same = constraints.same_as[0];
                            console.log('same', same);
                            console.log('workflow', x.workflow);
                            taskUser.push(x.workflow[same][0]);
                        }
                    } else if (_.isEmpty(constraints)) {
                        //return the first one in the user list
                        taskUser.push(x.user(ta_id));
                        x.count++;
                    } else if (_.has(constraints, 'same_as') && !(_.has(constraints, 'not'))) {
                        var same = constraints.same_as[0];
                        console.log('same', same);
                        console.log('workflow', x.workflow);
                        taskUser.push(x.workflow[same][0]);
                    } else if (!(_.has(constraints, 'same_as')) && _.has(constraints, 'not')) {
                        while (_.contains(constraints.not, x.users[x.count])) {
                            x.count++;
                        }
                        taskUser.push(x.user(ta_id));
                        x.count++;
                    } else if (_.has(constraints, 'same_as') && _.has(constraints, 'not')) {
                        while (_.contains(constraints.not, x.users[x.count])) {
                            x.count++;
                        }
                        taskUser.push(x.user(ta_id));

                        if (ta.Type === 'grade_problem' && ta.NumberParticipants > 1) {
                            var same = constraints.same_as[0];
                            console.log('same', same);
                            console.log('workflow', x.workflow);
                            taskUser.push(x.workflow[same][0]);
                        }
                        x.count++;
                    }
                }
            }).then(function (done) {
                x.workflow[ta_id] = taskUser;
                resolve(taskUser);
            }).catch(function (err) {
                console.log('Error allocating the users');
                reject(err);
            });
        });
    }

    user(ta_id) {
        let x = this;
        let index = x.pointer + x.count;
        if (index == x.users.length) {
            x.count = 0 - x.pointer;
            index = x.pointer + x.count;
            return x.users[index];
        } else {
            return x.users[index];
        }
    }

    getInstructor(ta_id) {
        return new Promise(function (resolve, reject) {

            return TaskActivity.find({
                where: {
                    TaskActivityID: ta_id
                }
            }).then(function (ta_result) {
                return Assignment.find({
                    where: {
                        AssignmentID: ta_result.AssignmentID
                    }
                }).then(function (assignment) {
                    resolve(assignment.OwnerID);
                });
            }).catch(function (err) {
                console.log('Error retrieving instructor ID');
                console.log(err);
            });
        });
    }


    //-------------------------------------------------------
    // get taskActivityID linked to this task
    getTaskActivityID(task) {



        return new Promise(function (resolve, reject) {

            //console.log('Finding the taskActivityID...');

            var taskActivityID = [];


            TaskInstance.findAll({
                where: {
                    TaskInstanceID: task
                }
            }).then(function (results) {

                //taskActivityID.push(results.TaskActivityID);
                results.forEach(function (task) {
                    //tasks.push(task.TaskActivityID);
                    taskActivityID.push(task.TaskActivityID);
                }, this);

                //console.log('taskActivityID was found!');

                resolve(taskActivityID);

            }).catch(function (err) {
                console.log('Find taskActivityID failed!');
                console.log(err);
            });

        });

    }

    // get AssigneeConstraints linked to this taskActivityID
    getConstraints(ta_id) {

        return new Promise(function (resolve, reject) {
            var constraints;
            return TaskActivity.find({
                where: {
                    TaskActivityID: ta_id
                }
            }).then(function (result) {
                constraints = JSON.parse(result.AssigneeConstraints);
                //console.log(constraints);
                //console.log('All constraints were saved!');

                resolve(constraints);
            }).catch(function (err) {
                console.log('Find constraints failed!');
                reject(err);
            });
        });
    }

    //get user that will be removed from workflow instance
    getLateUser(task) {

        return new Promise(function (resolve, reject) {
            //console.log('Finding the late user...');
            var lateUser;
            TaskInstance.findAll({
                where: {
                    TaskInstanceID: task
                }
            }).then(function (results) {

                results.forEach(function (task) {
                    lateUser = task.UserID;
                }, this);
                //console.log('lateUser was found!');
                resolve(lateUser);
            }).catch(function (err) {
                console.log('Find workflowInstanceID failed!');
                console.log(err);
            });
        });
    }



    // get workflowInstanceID linked to this task
    getWorkflowInstanceID(task) {


        return new Promise(function (resolve, reject) {

            //console.log('Finding the workflowInstanceID...');

            var workflowInstanceID = [];


            TaskInstance.findAll({
                where: {
                    TaskInstanceID: task
                }
            }).then(function (results) {

                //workflowInstanceID.push(results.WorkflowInstanceID);
                results.forEach(function (workflow) {
                    workflowInstanceID.push(workflow.WorkflowInstanceID);
                }, this);

                //console.log('workflowInstanceID was found!');

                resolve(workflowInstanceID);

            }).catch(function (err) {
                console.log('Find workflowInstanceID failed!');
                console.log(err);
            });
        });
    }

    // get workflowInstanceID linked to this task
    async getWorkflowInstanceIDs(ai_id, user_id) {

        var wis = [];

        var tis = await TaskInstance.findAll({
            where: {
                AssignmentInstanceID: ai_id,
                UserID: user_id
            },
            attributes: ['WorkflowInstanceID']
        });

        await Promise.map(tis, function (ti) {
            if (!(_.contains(wis, ti.WorkflowInstanceID))) {
                wis.push(ti.WorkflowInstanceID)
            }
        });

        return wis;



        // return new Promise(function (resolve, reject) {

        //     //console.log('Finding the workflowInstanceID...');

        //     var workflowInstanceID = [];


        //     TaskInstance.findAll({
        //         where: {
        //             TaskInstanceID: task
        //         }
        //     }).then(function (results) {

        //         //workflowInstanceID.push(results.WorkflowInstanceID);
        //         results.forEach(function (workflow) {
        //             workflowInstanceID.push(workflow.WorkflowInstanceID);
        //         }, this);

        //         //console.log('workflowInstanceID was found!');

        //         resolve(workflowInstanceID);

        //     }).catch(function (err) {
        //         console.log('Find workflowInstanceID failed!');
        //         console.log(err);
        //     });
        // });
    }

    //get students in the workflowInstanceID - this students will be avoided
    getUsersFromWorkflowInstance(wi_id) {



        return new Promise(function (resolve, reject) {

            //console.log('Finding the users in the workflowInstanceID...');

            var avoid_users = [];

            TaskInstance.findAll({
                where: {
                    WorkflowInstanceID: wi_id
                }
            }).then(function (results) {

                results.forEach(function (user) {
                    avoid_users.push(user.UserID);
                }, this);


                //console.log('users in workflowInstanceID were found!');

                resolve(avoid_users);

            }).catch(function (err) {
                console.log('Find users in workflowInstanceID failed!');
                console.log(err);
            });
        });
    }

    //get ti_id where user is allocated within a wi_id
    getTaskInstancesWhereUserAlloc(user, wi_id, ti_id) {
        //console.log('Finding the TaskInstances...');


        return new Promise(function (resolve, reject) {

            var tempAllocRecord = [];
            tempAllocRecord.push(ti_id);

            TaskInstance.findAll({
                where: {
                    WorkflowInstanceID: wi_id,
                    UserID: user
                }
            }).then(function (results) {

                results.forEach(function (result) {
                    if (result.TaskInstanceID > ti_id) {
                        tempAllocRecord.push(result.TaskInstanceID);
                    }
                }, this);

                resolve(tempAllocRecord);
                //console.log('TaskInstances were found!');
                //tempAllocRecord.push(ti_id);


            }).catch(function (err) {
                console.log('Find TaskInstances failed!');
                console.log(err);
            });
        });
    }

    // Previous implementation of get user (before spring 2017)
    /*//get newUser
    getUserPre(avoid_users, users) {
        //console.log(typeof users)
        // console.log("getUser() users", users)
        var new_user
        // var new_users = []
        var idx
        return Promise.all(Promise.map(users, function (user, i) {
            if (!_.contains(avoid_users, user)) {
                if (idx == null) {
                    idx = i
                }
                // new_users.push(user)
                // console.log('users shift', users)
            }

        })).then(function (done) {
            new_user = users[idx] //new_users[0]
            // console.log('prev::', users)
            users.splice(idx, 1)
            users.push(new_user)
            // console.log('new::', users)
            return new_user
        })
    }*/

    //TODO: need an api call for this
    // reallocate new users to all tasks of all users in all assignments of a section with volunteers
    reallocate_section(section_id, user_ids, volunteer_u_ids, is_extra_credit) {
        if (is_extra_credit == null) { // if extra credit is not specified: assume it is extra credit by default
            is_extra_credit = true;
        }
        logger.log('info', 'reallocate new users to all tasks of all users in all assignments of a section with volunteers', {
            section_id: section_id,
            user_ids: user_ids,
            volunteer_u_ids: volunteer_u_ids,
            is_extra_credit: is_extra_credit,
        });
        var x = this;
        // check if any user_id is part of volunteers, if so: remove it from volunteers
        volunteer_u_ids = volunteer_u_ids.filter(function (user_id) {
            return !_.contains(user_ids, user_id);
        });
        return AssignmentInstance.findAll({
            where: {
                SectionID: section_id,
                //TODO: For future: get only active assignments
            }
        }).then(function (ais) {
            return Promise.map(ais, function (ai) {
                return x.reallocate_ai(ai.AssignmentInstanceID, user_ids, volunteer_u_ids, is_extra_credit);
            });
        });
    }

    reallocate_ais_of_users(user_ids, volunteer_u_ids) {
        logger.log('info', 'reallocate new users to all assignments of all users with volunteers', {
            user_ids: user_ids,
            volunteer_u_ids: volunteer_u_ids,
        })
        var x = this
        volunteer_u_ids = volunteer_u_ids.filter(function (user_id) {
            return !_.contains(user_ids, user_id)
        })
        var ai_ids = {}
        return TaskInstance.findAll({
            where: {
                UserID: {
                    $in: user_ids
                }
            }
        }).then(function (tis) {
            return Promise.map(tis, function (ti) {
                ai_ids[ti.AssignmentInstanceID] = true
            }).then(function (tis) {
                return Promise.map(Object.keys(ai_ids), function (ai_id) {
                    return x.reallocate_ai(ai_id, user_id, volunteer_u_ids)
                })
            })
        })
    }

    //TODO: need an api call for this
    // reallocate new users to all tasks of all users in an assignment with volunteers
    reallocate_ai(ai_id, user_ids, volunteer_u_ids, is_extra_credit) {
        if (is_extra_credit == null) { // if extra credit is not specified: assume it is extra credit by default
            is_extra_credit = true;
        }
        logger.log('info', 'reallocate new users to all tasks of all users in an assignment with volunteers', {
            ai_id: ai_id,
            user_ids: user_ids,
            volunteer_u_ids: volunteer_u_ids,
            is_extra_credit: is_extra_credit,
        });
        var x = this;
        // check if any user_id is part of volunteers, if so: remove it from volunteers
        volunteer_u_ids = volunteer_u_ids.filter(function (user_id) {
            return !_.contains(user_ids, user_id);
        });
        return TaskInstance.findAll({
            where: {
                UserID: {
                    $in: user_ids,
                },
                AssignmentInstanceID: ai_id,
                Status: {
                    $notLike: '%"viewed"%',
                    //TODO: For future: get only non-opened task instances
                }
            }
        }).then(function (tis) {
            return Promise.each(tis, function (ti) {
                return x.reallocate(ti, volunteer_u_ids, is_extra_credit);
            });
        });
    }

    //TODO: need an api call for this
    // reallocate given users to given tasks respectively
    reallocate_users_to_tasks(tis, u_ids, is_extra_credit) {
        logger.log('debug', {
            call: 'reallocate_users_to_tasks'
        });
        if (is_extra_credit == null) { // if extra credit is not specified: assume it is extra credit by default
            is_extra_credit = true;
        }
        logger.log('info', 'reallocate given users to given tasks respectively', {
            is_extra_credit: is_extra_credit,
            user_ids: u_ids,
            task_instances: tis.map(function (it) {
                return it.toJSON();
            }),
        });
        var x = this;

        return Promise.map(tis, function (ti, i) {
            return x.reallocate_user_to_task(ti, u_ids[i], is_extra_credit);
        });
    }

    // reallocate given user to a given task instance
    // async reallocate_user_to_task(ti, new_u_id, is_extra_credit, new_status) {
    //     if (is_extra_credit === null) { // if extra credit is not specified: assume it is extra credit by default
    //         is_extra_credit = true;
    //     }

    //     logger.log('debug', {
    //         call: 'reallocate_user_to_task'
    //     });
    //     var task_id = ti.TaskInstanceID;
    //     // append a new user history
    //     var ti_u_hist = JSON.parse(ti.UserHistory) || [];

    //     ti_u_hist.push({
    //         time: new Date(),
    //         user_id: new_u_id,
    //         is_extra_credit: is_extra_credit,
    //     });

    //     logger.log('info', 'update a task instance with a new user and user history', {
    //         task_instance: ti.toJSON(),
    //         new_user_id: new_u_id,
    //         user_history: ti_u_hist
    //     });


    //     if (new_status === null) {
    //         logger.log('debug', '/Workflow/Allocator/reallocate_user_to_task: no status specified');

    //         return TaskInstance.update({
    //             UserID: new_u_id,
    //             UserHistory: ti_u_hist,
    //         }, {
    //             where: {
    //                 TaskInstanceID: task_id
    //             }
    //         }).then(async function (res) {
    //             if (JSON.parse(res.Status)[0] !== 'bypassed' || JSON.parse(res.Status)[0] !== 'not_yet_started' || JSON.parse(res.Status)[0] !== 'automatic') {
    //                 await res.extendDate(JSON.parse(ti.TaskActivity.DueType)[1], JSON.parse(ti.TaskActivity.DueType)[0]);
    //             }
    //             await res.extendDate(JSON.parse(ti.TaskActivity.DueType)[1], JSON.parse(ti.TaskActivity.DueType)[0]);
    //             await email.sendNow(ti.UserID, 'remove_reallocated');
    //             await email.sendNow(new_u_id, 'new_reallocated');
    //             logger.log('info', 'task instance updated', {
    //                 res: res
    //             });
    //             return res;
    //         }).catch(function (err) {
    //             logger.log('error', 'task instance update failed', err);
    //             return err;
    //         });

    //     } else {
    //         var status = JSON.parse(ti.Status);
    //         await Promise.mapSeries(Object.keys(new_status), function (key) {
    //             status[parseInt(key)] = new_status[key];
    //         });

    //         logger.log('debug', '/Workflow/Allocator/reallocate_user_to_task: new status specified');

    //         return TaskInstance.update({
    //             UserID: new_u_id,
    //             UserHistory: ti_u_hist,
    //             Status: JSON.stringify(status)
    //         }, {
    //             where: {
    //                 TaskInstanceID: task_id
    //             }
    //         }).then(async function (res) {

    //             await res.extendDate(JSON.parse(ti.TaskActivity.DueType)[1], JSON.parse(ti.TaskActivity.DueType)[0]);
    //             await email.sendNow(ti.UserID, 'remove_reallocated');
    //             await email.sendNow(new_u_id, 'new_reallocated');
    //             logger.log('info', 'task instance updated', {
    //                 res: res
    //             });
    //             return res;
    //         }).catch(function (err) {
    //             logger.log('error', 'task instance update failed', err);
    //             return err;
    //         });
    //     }

    // }

    // find a new appropriate user to reallocate
    //get newUser
    find_new_user(u_ids, vol_u_ids, avoid_u_ids) {
        logger.log('debug', {
            call: 'find_new_user'
        });
        logger.log('info', 'find a new appropriate user to reallocate', {
            user_ids: u_ids,
            volunteer_user_ids_so_far: vol_u_ids,
            avoid_user_ids: avoid_u_ids,
        });
        vol_u_ids = vol_u_ids || [];
        var idx = null;

        // first, find if there is a new user that has not been part of volunteers so far used for this assignment AND that has not been part of avoid users
        return Promise.map(u_ids, function (u_id) {
            if (idx == null && !_.contains(avoid_u_ids, u_id) && !_.contains(vol_u_ids, u_id)) {
                vol_u_ids.unshift(u_id);
                idx = 0;
            }
        }).then(function (done) {
            logger.log('info', 'found a new user that is not part of volunteers yet ?', {
                found: idx != null
            });

            // if not found a user yet: pick the first one from volunteers so far and that is not part of avoid users
            return Promise.map(vol_u_ids, function (u_id, i) {
                if (idx == null && _.contains(u_ids, u_id) && !_.contains(avoid_u_ids, u_id)) {
                    // return Promise.map(vol_u_ids, function (u_id, i) {
                    //     if (idx == null && !_.contains(avoid_u_ids, u_id)) {

                    idx = i;
                }
            }).then(function (done) {
                if (idx == null) {
                    logger.log('error', 'no user found that can be reallocated');
                    return;
                }
                var new_user_id = vol_u_ids[idx]; //new_user_id[0]
                // reorder the volunteers used so far for this assignment
                vol_u_ids.splice(idx, 1);
                vol_u_ids.push(new_user_id);

                logger.log('info', 'volunteers updated & return a new chosen user', {
                    updated_volunteer_user_ids_so_far: vol_u_ids,
                    new_user_id: new_user_id,
                });
                return new_user_id;
            });
        });
    }

    // wrapper for multiple users ????

    // reallocate new users to all assignments of all users with volunteers
    /*reallocate_ais_of_users(user_ids, volunteer_u_ids) {
        logger.log('info', 'reallocate new users to all assignments of all users with volunteers', {
            user_ids: user_ids,
            volunteer_u_ids: volunteer_u_ids,
        })
        var x = this
        volunteer_u_ids = volunteer_u_ids.filter(function (user_id) {
            return !_.contains(user_ids, user_id)
        })
        var ai_ids = {}

        return TaskInstance.findAll({where: {UserID: {$in: user_ids}}}).then(function (tis) {
            return Promise.map(tis, function (ti) {
                ai_ids[ti.AssignmentInstanceID] = true
            }).then(function (tis) {
                return Promise.map(Object.keys(ai_ids), function (ai_id) {
                    return x.reallocate_ai(ai_id, user_id, volunteer_u_ids)
                })
            })
        })
    }*/
 
    // reallocate new users to all tasks of a user in an assignment with volunteers
    reallocate_ai(ai_id, user_id, volunteer_u_ids) {
        logger.log('info', 'reallocate new users to all tasks of a user in an assignment with volunteers', {
            ai_id: ai_id,
            user_id: user_id,
            volunteer_u_ids: volunteer_u_ids,
        });
        var x = this;
        var u_idx = volunteer_u_ids.indexOf(user_id);
        if (u_idx != -1) {
            volunteer_u_ids = volunteer_u_ids.slice(0);
            volunteer_u_ids.splice(u_idx, 1);
        }
        return TaskInstance.findAll({
            where: {
                UserID: user_id,
                AssignmentInstanceID: ai_id,
                Status: {
                    $notLike: '%"complete"%',
                }
            }
        }).then(function (tis) {
            return Promise.each(tis, function (ti) {
                return x.reallocate(ti, volunteer_u_ids);
            });
        });
    }
 
    // reallocate given users to given tasks respectively
    reallocate_users_to_tasks(tis, u_ids) {
        logger.log('debug', {
            call: 'reallocate_users_to_tasks'
        });
        logger.log('info', 'reallocate given users to given tasks respectively', {
            user_ids: u_ids,
            task_instances: tis.map(function (it) {
                return it.toJSON();
            })
        });
        var x = this;

        return Promise.map(tis, function (ti, i) {
            return x.reallocate_user_to_task(ti, u_ids[i]);
        });
    }

    //TODO: IMMEDIATE! Add a checker for for assignee constraints
    // async reallocate_user_to_task(ti, new_u_id, is_extra_credit) {

    //     if (is_extra_credit == null) {
    //         is_extra_credit = true;
    //     }

    //     logger.log('debug', {
    //         call: 'reallocate_user_to_task'
    //     });
    //     var task_id = ti.TaskInstanceID;
    //     var ti_u_hist = JSON.parse(ti.UserHistory) || [];

    //     ti_u_hist.push({
    //         time: new Date(),
    //         user_id: new_u_id,
    //         is_extra_credit: is_extra_credit,
    //     });

    //     logger.log('info', 'update a task instance with a new user and user history', {
    //         task_instance: ti.toJSON(),
    //         new_user_id: new_u_id,
    //         user_history: ti_u_hist
    //     });

    async reallocate_user_to_task(ti, new_u_id, is_extra_credit, change_date) {
        if (is_extra_credit == null) {
            is_extra_credit = true;
        }
        if (change_date == null) {
            change_date = true;  // update date
        }

        var reallocation_status = 'reallocated_no_extra_credit';
        if(is_extra_credit){
            reallocation_status = 'reallocated_extra_credit';
        }

        // logger.log('debug', {
        //     call: 'reallocate_user_to_task'
        // });
        if(JSON.parse(ti.Status)[0] === 'complete'){
            return {
                Error: true,
                ti_id: ti.TaskInstanceID,
                Message: 'Task already completed'
            };
        }

        var task_id = ti.TaskInstanceID;
        var ti_u_hist = JSON.parse(ti.UserHistory) || [];
        var ti_status = JSON.parse(ti.Status);

        ti_status[5] = reallocation_status;  // change reallocation status
        ti_status[4] = 'not_opened';         // change view back to deafult
        ti_status[3] = 'before_end_time';   // change from late to not late
        var new_end_date = ti.EndDate;  // keep same date
        if(change_date){
            new_end_date = await this.get_new_date(ti); // get time extension
        }

        ti_u_hist.push({
            time: new Date(),
            user_id: new_u_id,
            is_extra_credit: is_extra_credit,
        });

        logger.log('info', 'update a task instance with a new user and user history', {
            task_instance: ti.toJSON(),
            new_user_id: new_u_id,
            user_history: ti_u_hist,
            new_status: ti_status,
            new_end_date: new_end_date
        });

        return await TaskInstance.update({
            UserID: new_u_id,
            UserHistory: ti_u_hist,
            Status: JSON.stringify(ti_status),
            EndDate: new_end_date,
        }, {
            where: {
                TaskInstanceID: task_id
            }
        }).then(function (res) {
            // logger.log('info', 'task instance updated', {
            //     res: res
            // });
            //return res;
            return {
                Error: false,
                ti_id: ti.TaskInstanceID,
                Message: "Success"
            };
        }).catch(function (err) {
            logger.log('error', 'task instance update failed', err);
            return {
                Error: true,
                Message: 'Failed reallocate user to another task'
            };
        });
    }



    //     await TaskInstance.update({
    //         UserID: new_u_id,
    //         UserHistory: ti_u_hist,
    //     }, {
    //         where: {
    //             TaskInstanceID: task_id
    //         }
    //     }).then(async function (res) {
    //         //logger.log('info', 'task instance updated', {res: res});
    //         await res.extendDate(JSON.parse(ti.TaskActivity.DueType)[1], JSON.parse(ti.TaskActivity.DueType)[0]);
    //         await email.sendNow(ti.UserID, 'remove_reallocated');
    //         await email.sendNow(new_u_id, 'new_reallocated');
    //         return res;
    //     }).catch(function (err) {
    //         logger.log('error', 'task instance update failed', err);
    //         return err;
    //     });
    // }

    check_assign_constraint(ti) {

    }

    get_ai_volunteers(ai_id) {
        logger.log('debug', {
            call: 'get_ai_volunteers',
            ai_id: ai_id
        });

        return AssignmentInstance.find({
            where: {
                AssignmentInstanceID: ai_id
            }
        }).then(function (ai) {
            logger.log('debug', 'return', {
                assignment_instance: ai.toJSON()
            });
            return JSON.parse(ai.Volunteers);
        });
    }

    async inactivate_section_user(section_id, user_id) {
        await SectionUser.update({
            Active: 0
        }, {
            where: {
                SectionID: section_id,
                UserID: user_id
            }
        });
    }

    async delete_volunteer(section_id, user_id) {
        await VolunteerPool.destroy({
            where: {
                SectionID: section_id,
                UserID: user_id
            }
        });
    }

    async check_assign_constraints(old_u_id, new_u_id, task_collection) {

        await Promise.mapSeries(task_collection, function (ti_id) {
            var ti = TaskInstance.find({
                where: {
                    TaskInstanceID: ti_id
                }
            });



        });
    }


    // async reallocate_user_to_workflow(old_ti, new_u_id, wi_id, is_extra_credit /*, new_status*/ ) {
    //     var x = this;
    //     var wi = await WorkflowInstance.find({
    //         where: {
    //             WorkflowInstanceID: wi_id
    //         }
    //     });

    //     await email.sendNow(old_ti.UserID, 'remove_reallocated');
    //     await email.sendNow(new_u_id, 'new_reallocated');

    //     await Promise.mapSeries(JSON.parse(wi.TaskCollection), async function (ti_id) {
    //         var ti = await TaskInstance.find({
    //             where: {
    //                 TaskInstanceID: ti_id
    //             }
    //         });

    //         if (ti.UserID === old_ti.UserID) {
    //             logger.log('debug', {
    //                 wi_id: wi_id,
    //                 old_user: old_ti.UserID,
    //                 old_ti: old_ti.TaskInstanceID,
    //                 ti: ti.TaskInstanceID,
    //                 ti_user: ti.UserID,
    //                 new_u_id: new_u_id
    //             });
    //             await x.reallocate_user_to_task(ti, new_u_id, is_extra_credit /*, new_status*/ );
    //         }
    //     });

    // }


    async reallocate_user_to_workflow(ti, new_u_id, is_extra_credit /*, new_status*/ ) {
        var x = this;
        var wi = await WorkflowInstance.find({
            where: {
                WorkflowInstanceID: ti.WorkflowInstanceID
            }
        });

        // await email.sendNow(old_ti.UserID, 'remove_reallocated');
        // await email.sendNow(new_u_id, 'new_reallocated');
        // ignore if complete, bypassed, or cancelled.
        var tis = await TaskInstance.findAll({
            where:{
                WorkflowInstanceID: ti.WorkflowInstanceID,
                $and: [    
                    { 
                        Status: {
                            $notLike: '%"complete"%',
                        }
                    },
                    {
                        Status: {
                            $notLike: '%"bypassed"%',  // dont update bypassed
                        }
                    },
                    {
                        Status: {
                            $notLike: '%"cancelled"%', // dont update completed
                        }
                    }
                ]
            }       
        });

        await Promise.mapSeries(tis, async (new_ti) => {
            if(new_ti.UserID === ti.UserID){
                await x.reallocate_user_to_task(new_ti, new_u_id, is_extra_credit);
            }
        });
        return {'Error':false, 'ti_id':ti.TaskInstanceID, 'Message': "Success"};
    }
    /* will remove this soon mss86
        // reallocate all active assigments of user, called when user is made "inactive"
        async reallocate_all_ai_of_user(section_user_id){
            var x = this;
            try{
                var sectionuser = await SectionUser.findOne({
                    where:{
                        SectionUserID: section_user_id,
                    }
                });
                var user_id=sectionuser.UserID;
                var section_id = sectionuser.SectionID;
                return await x.reallocate_user_to_assignment(null,[user_id],section_id,true,true);
            }catch(e){
                logger.log('error','realocate_all_ai_of_user',e);
            }
        }
        // reallocate users of one or all assigment Instances with volunteers
        async reallocate_user_to_assignment(ai_id, user_ids, sec_id, replace_all_assigmnets, is_extra_credit) {
            var x = this;
            logger.log('info', 'reallocate new users to assigment instance ', {
                ai_id: ai_id,
                user_ids: user_ids,
                replace_all_assigmnets: replace_all_assigmnets,
                is_extra_credit: is_extra_credit,
                sec_id:sec_id,
            });

            var voluenteers = await x.get_volunteers_ids(sec_id); // get voluenteer pool
            var sec_instructors = await x.get_section_users_ids(sec_id, 'instructor');
            var instructor_id = sec_instructors[0];            
            await Promise.map(user_ids, async(user_id)  => {     // remove users from volunteer pool
                await x.delete_volunteer(sec_id,user_id);   
            }) 
            voluenteers =voluenteers.filter(function (user_id) { // remove users from voluenteers
                return !_.contains(user_ids, user_id);
            });

            if(replace_all_assigmnets){ // replace all Task Instances of the users in all Assigments in the Section
                try{
                    var ais= await AssignmentInstance.findAll({
                        where: {
                            SectionID: sec_id,
                        }
                    });
                }catch(e){
                    logger.log('error', 'failed to find ais inside reallocate_user_to_assigment inside if statement',e);
                }
                await Promise.map(ais, async (ai) => { // for each Assigment Instance
                    var tis= await x.get_uncomplete_tis_of_users(ai.AssignmentInstanceID, user_ids);
                    await Promise.mapSeries(tis, async (ti) => { // for each Task Instance
                        await x.reallocate_ti(ti,voluenteers,is_extra_credit,false,instructor_id);
                    });
                });
                //return await x.reallocate_section(sec_id,user_ids, user_pool, is_extra_credit, );
            }else{ // replace All Tasks of given Assigment instance and users
                //return await x.reallocate_ai(ai_id, user_ids, voluenteers, is_extra_credit);
                var tis= await x.get_uncomplete_tis_of_users(ai_id, user_ids);
                await Promise.mapSeries(tis, async (ti) => { // for each Task Instance
                    await x.reallocate_ti(ti,voluenteers,is_extra_credit,false,instructor_id);
                });
                return {'test':'test'};
            }
        }
        
        // get tis of users, in assigment instance
        async get_uncomplete_tis_of_users(ai_id, user_ids){
            try{
                var tis= await TaskInstance.findAll({
                    where: {
                        UserID: {
                            $in: user_ids,
                        },
                        AssignmentInstanceID: ai_id,
                        $and: {  // make sure status in not complete and not bypassed, and not abondoned
                            Status: {
                                $notLike: '%"complete"%',
                            },
                            Status: {
                                $notLike: '%"bypassed"%',
                            },
                            Status: {
                                $notLike: '%"abandoned"%',
                            }
                        }
                    }
                });
                return tis;
            }catch(e){
                logger.log('error', 'get_uncomplete_tis_of_users',e);
            }
        }
        */
        // return volunteers userIds for section
        async get_volunteers_ids(section_id){
            var volunteers=[];
            try{
                var vols = await VolunteerPool.findAll({
                    where:{
                        SectionID: section_id,
                    },
                    attributes:['UserID']
                });
                await Promise.map(vols, function(vol){
                    volunteers.push(vol.UserID);
                });
            }catch(e){
                logger.log('error','get_volunteers_ids',e);
            }
            return volunteers;
        }
        // return user for section
        async get_section_users_ids(section_id, option){
            var users;
            var user_ids=[];
            try{
                if(option === 'students'){
                    users = await SectionUser.findAll({
                        where:{
                            SectionID: section_id,
                            Role: 'Student',
                            Active: 1
                        },
                        attributes:['UserID']
                    });
                } else if(option === 'instructor') {
                    users = await SectionUser.findAll({
                        where:{
                            SectionID: section_id,
                            Role: 'Instructor',
                            Active: 1
                        },
                        attributes:['UserID']
                    });
                }
                await Promise.map(users, function(user){
                    user_ids.push(user.UserID);
                });
            }catch(e){
                logger.log('error','get_section_users_ids',e);
            }
            return user_ids;
        }
    // reallocate all tasks of a given users & ai_id with volutneers
    // wrap around the above api (get all assignments)

    // return error message if no user can be allocated


    //////////////////////////////////////////////////////////////////
    ///////////Reallocate a new user to a given task instance/////////
    //////////////////////////////////////////////////////////////////

    //ti_id = User(TaskInstanceID) to be reallocated
    //u_ids = list (pool) of users to pick the new user from
    //x.getLateUser(task) = the user that has been late for submitting his/her work; TaskInstance Type has been marked as 'late'
    //x.getTaskActivityID(task) & x.getWorkflowInstanceID(task) = find TaskActivityID and WorkflowInstanceID associate with the task
    //Promise.map(list, function(each_index_from_the_list){}) - for details you can check bluebird.js
    //x.getUsersFromWorkflowInstance(wi_id) = find users within the same workflow, used to find the list of user that should be avoided
    //x.getTaskInstancesWhereUserAlloc(lateUser, wi_id, task) = find all the TaskInstances within the workflow that have the same UserID
    //x.find_new_user(u_ids, vol_u_ids, avoid_u_ids) = find a new appropriate user to reallocate
    //x.reallocate_user_to_task(task, newUser) = reallocate given user to a given task instance
    //x.find_new_user(avoidUsers, users) = find the User that's not part of the avoided list and use that user to replace the current user
    //x.reallocate_user_to_task(task, newUser) = find the task that needs to allocate and replace the user

    //Done: The algorithm would always reallocate the first user from the list obtained. Needs to update the list of the users so
    //the same user won't be reallocated second time.

    // async reallocate(ti, u_ids, is_extra_credit /*, new_status*/ ) { //reallocates the user with a new user. Knock the old user out of all Workflows
    //     logger.log('debug', {
    //         call: 'reallocate'
    //     });
    //     if (is_extra_credit == null) { // if extra credit is not specified: assume it is extra credit by default
    //         is_extra_credit = true;
    //     }
    //     logger.log('info', 'reallocate new user to a given task instance', {
    //         task_instance: ti.toJSON(),
    //         user_ids: u_ids,
    //         is_extra_credit: is_extra_credit,
    //     });

    //     var ti_id = ti.TaskInstanceID;
    //     var x = this;

    //     var lateUsers = await x.getLateUser(ti_id);
    //     var vol_u_ids = await x.get_ai_volunteers(ti.AssignmentInstanceID) || [];
    //     var wi_ids = await x.getWorkflowInstanceIDs(ti.AssignmentInstanceID, ti.UserID);

    //     await x.inactivate_section_user(ti.AssignmentInstance.Section.SectionID, ti.UserID);
    //     await x.delete_volunteer(ti.AssignmentInstance.Section.SectionID, ti.UserID);

    //     // console.log('vol:' + volunteers)
    //     vol_u_ids = vol_u_ids || [];
    //     await Promise.mapSeries(wi_ids, async function (wi_id) {

    //         var avoid_u_ids = await x.getUsersFromWorkflowInstance(wi_id);
    //         var new_u_id = await x.find_new_user(u_ids, vol_u_ids, avoid_u_ids);

    //         logger.log('debug', 'update assignment instance volunteers', {
    //             assignment_instance_id: ti.AssignmentInstanceID,
    //             volunteer_user_ids: vol_u_ids,
    //         });

    //         let res = await AssignmentInstance.update({
    //             Volunteers: vol_u_ids
    //         }, {
    //             where: {
    //                 AssignmentInstanceID: ti.AssignmentInstanceID
    //             }
    //         });
            
    //         logger.log('info', 'assignment instance volunteers updated', {
    //             res: res
    //         });
    //         //await x.reallocate_user_to_task(ti, new_u_id, is_extra_credit/*, new_status*/);
    //         await x.reallocate_user_to_workflow(ti, new_u_id, wi_id, is_extra_credit /*, new_status*/ );

    //     });
    // }


    reallocate(ti, u_ids, is_extra_credit) {
        logger.log('debug', {
            call: 'reallocate'
        });
        if (is_extra_credit == null) { // if extra credit is not specified: assume it is extra credit by default
            is_extra_credit = true;
        }
        logger.log('info', 'reallocate new user to a given task instance', {
            task_instance: ti.toJSON(),
            user_ids: u_ids,
            is_extra_credit: is_extra_credit,
        });

        var ti_id = ti.TaskInstanceID;
        var x = this;
        // var task = ti_id //task instance needs to be given
        // var constraint
        // var lateUser
        // var avoid_users = []
        // var users = userList // users need to be given
        //console.log(users)

        /*Promise.all([]).spread(function(lateUsers, volunteers) {
         lateUser = done[0]
         //console.log(lateUser)
         })*/
        // return Promise.all([x.getLateUser(ti_id), x.getVolunteers(ti), x.getTaskActivityID(ti_id), x.getWorkflowInstanceID(ti_id)]).spread(function (lateUsers, vol_u_ids, ta_ids, workflowInstanceIDs) {
        return Promise.all([x.getLateUser(ti_id), x.get_ai_volunteers(ti.AssignmentInstanceID), x.getWorkflowInstanceID(ti_id)]).spread(function (lateUsers, vol_u_ids, wi_ids) {
            // console.log('vol:' + volunteers)
            vol_u_ids = vol_u_ids || [];
            // return Promise.map(taskActivityIDs, function (ta_id) {
            //console.log(ta_id)
            return Promise.map(wi_ids, function (wi_id) {
                //console.log(wi_id)
                // return Promise.all([x.getUsersFromWorkflowInstance(wi_id), x.getTaskInstancesWhereUserAlloc(lateUsers[0], wi_id, ti_id)]).spread(function (avoid_u_ids, TaskInstances) {
                return Promise.all([x.getUsersFromWorkflowInstance(wi_id)]).spread(function (avoid_u_ids) {
                    // console.log("avoidUsers", avoidUsers)
                    // avoidUsers.map(function(user) {
                    //     avoid_users.push(user)
                    // })
                    return x.find_new_user(u_ids, vol_u_ids, avoid_u_ids).then(function (new_u_id) {
                        // return Promise.map(TaskInstances, function (task) {
                        /*WorkflowInstance.update({
                         Volunteers: volunteers
                         }, {
                         where: {
                         WorkflowInstanceID: ti.WorkflowInstanceID
                         }
                         })*/
                        logger.log('debug', 'update assignment instance volunteers', {
                            assignment_instance_id: ti.AssignmentInstanceID,
                            volunteer_user_ids: vol_u_ids,
                        });
                        return AssignmentInstance.update({
                            Volunteers: vol_u_ids
                        }, {
                            where: {
                                AssignmentInstanceID: ti.AssignmentInstanceID
                            }
                        }).then(function (res) {
                            logger.log('info', 'assignment instance volunteers updated', {
                                res: res
                            });
                            //return x.reallocate_user_to_task(ti, new_u_id, is_extra_credit);

                            return x.reallocate_user_to_workflow(ti, new_u_id, is_extra_credit);
                        }).catch(function (err) {
                            logger.log('error', 'assignment instance volunteers update failed', err);
                            return err;
                        });
                        // })
                    });
                });
            });
            // })
        });
    }
    

    // Task based reallocation created 2-28-18 mss86
    //@ tasks: array of type and ids [ 'ti',[#,...]]  ti : realocate only this task, "wi": realocate all task in workflow
    //@ user_pool_wc: [ [],..] ids to use with constrains
    //@ user_pool_woc: [] ids to use without constrains
    //@ is_extra_credit: boolean
    async reallocate_tasks_based(tasks,user_pool_wc, user_pool_woc, is_extra_credit){
        logger.log('info',{
            call:"reallocate_tasks_based",
            tasks: tasks,
            user_pool_wc: user_pool_wc,
            user_pool_woc: user_pool_woc,
            is_extra_credit: is_extra_credit
        });
        var x = this;
        const t_type = tasks[0];
        var task_ids = tasks[1];
        var ignore_users=[];
        var response =[];
        await Promise.map(task_ids, async (ti_id) => {     // dont use these users in any reallocation
            ignore_users.push(await x.getLateUser(ti_id));
        });
        await Promise.mapSeries(task_ids, async (ti_id) => {   
            var ti    = await x.get_ti_from_ti_id(ti_id);           // get Instance from ID
            var ai_id = ti.AssignmentInstanceID; 
            var wi_id = await x.getWorkflowInstanceID(ti_id);       
            var avoid_u_ids = await x.getUsersFromWorkflowInstance(wi_id); 
            avoid_u_ids  = _.union(avoid_u_ids,ignore_users);  // merge cancelled users with ignore users    
            logger.log('debug',{avoid_u_ids: avoid_u_ids});
            var vol_u_ids  = await x.get_ai_volunteers(ai_id) || [];    // get used valuenteers for assigment instance
            var new_u_id   = await x.find_new_user_from_pool(user_pool_wc,user_pool_woc,vol_u_ids, avoid_u_ids);
            if(!new_u_id){
                response.push({
                    'Error': true,
                    'ti_id':ti_id,
                    'Message': 'None of the provided users could be used as replacement for the Task'
                });
                return;         // dont try to reallocate without user;
            }
            var res;
            if(t_type === 'ti'){            // realocate only in this task 
                res = await x.reallocate_user_to_task(ti, new_u_id,is_extra_credit);
                response.push(res);
            }else if(t_type ==='wi'){       // realocate user of task in entire workflow
                res = await x.reallocate_user_to_workflow(ti,new_u_id,is_extra_credit)
                response.push(res);
            }
            await x.update_ai_volunteers(vol_u_ids, ai_id);       
        });
        return response;  
    }
    // reallocate late tasks withing workflows created 3-2-18 mss86
    //@ helper function for reallocate_tasks_based
    //@ wi_ids: WorkFlowInstanceIds
    /* will remove since no longer needed 3-16-18 mss86
    async reallocate_workflow(wi_ids,user_pool_wc, user_pool_woc, is_extra_credit){
        logger.log('info',{
            call:"reallocate_workflow",
            wi_ids: wi_ids,
            user_pool_wc: user_pool_wc,
            user_pool_woc: user_pool_woc,
            is_extra_credit: is_extra_credit
        });
        var x = this;
        var ignore_users=[];
        var tis_array=[];
        var response=[];
        await Promise.mapSeries(wi_ids, async (wi_id) => {    // Find late users to not use them in reallocation 
            var tis = await x.get_late_tis(wi_id);           // get all late tasks
            tis_array.push(tis);
            await Promise.map(tis, async(ti) =>{
                ignore_users.push(ti.UserID);
            })
        });
        await Promise.mapSeries(wi_ids, async (wi_id, idx) => {
            if(! tis_array[idx].length > 0){
                response.push( {'Error':true, 'wi_id':wi_id, 'Message': 'No late Tasks found in workflows'});
                return;
            }
            var avoid_u_ids = await x.getUsersFromWorkflowInstance(wi_id);
            avoid_u_ids = _.union(avoid_u_ids, ignore_users);
            await Promise.mapSeries(tis_array[idx], async(ti) => {
                var vol_u_ids   = await x.get_ai_volunteers(ti.AssignmentInstanceID) || []; 
                var new_u_id    = await x.find_new_user_from_pool(user_pool_wc,user_pool_woc,vol_u_ids, avoid_u_ids);
                if(!new_u_id){
                    response.push({'Error': true, 'wi_id':wi_id, 'Message': 'None of provided users could be used as replacement for late tasks in workflow'});
                    return;
                }
                await x.reallocate_user_to_workflow(ti, new_u_id, is_extra_credit);
                await x.update_ai_volunteers(vol_u_ids, ti.AssignmentInstanceID);
            });
            response.push({'Error':false, 'wi_id':wi_id, 'Message': null});
        });
        return response;
    }
    */
    // User Based, Updated version of realocate created 2-27-18 mss86
    //@ ais: AssigmentInstace
    //@ old_user_ids: [] ids to replace
    //@ user_pool_wc: [ [],..] ids to use with constrains
    //@ user_pool_woc: [] ids to use without constrains
    //@ is_extra_credit: boolean
    async reallocate_users(section_id, ais, old_user_ids, user_pool_wc, user_pool_woc, is_extra_credit) {
        logger.log('info', 'reallocate_users was called',{
            section_id: section_id, 
            //ais: ais, 
            old_user_ids: old_user_ids,
            user_pool_wc: user_pool_wc, 
            user_pool_woc: user_pool_woc, 
            is_extra_credit: is_extra_credit,
        });
        var response = [];   
        await Promise.mapSeries(ais , async(ai) =>{   // for each Assigment Instance
            var wi_ids = JSON.parse(ai.WorkflowCollection);  // array of workflowIDS 
            if(wi_ids == null){
                logger.log('error','workflow ids cannot be null', wi_ids);
                return;
            }
            var x = this;
            var vol_u_ids = await x.get_ai_volunteers(ai.AssignmentInstanceID); // get used valuenteers for assigment
            vol_u_ids = vol_u_ids || [];
            await Promise.mapSeries(wi_ids, async function (wi_id) {  // for each workflow 
                var avoid_u_ids = await x.getUsersFromWorkflowInstance(wi_id);
                avoid_u_ids = _.union(avoid_u_ids, old_user_ids);     // add old user ids to avoid list
                await Promise.mapSeries(old_user_ids,async (old_user_id) => { 
                    var new_u_id = await x.find_new_user_from_pool(user_pool_wc, user_pool_woc, vol_u_ids, avoid_u_ids);
                    if(new_u_id == null){
                        response.push({
                            Error: true,
                            ai:ai.AssignmentInstanceID,
                            old_user_id: old_user_id,
                            Message:"No users provided could be used in some Tasks of user"
                        });
                        return;
                    } 
                    var ti = await TaskInstance.findOne({
                        where:{
                            WorkflowInstanceID: wi_id,
                            UserID: old_user_id
                        }
                    })
                    if(ti != null){
                        await x.reallocate_user_to_workflow(ti, new_u_id, is_extra_credit);
                    }
                    response.push({
                        Error: false,
                        ai:ai.AssignmentInstanceID,
                        old_user_id: old_user_id,
                        Message: "Success"
                    });  
                });
            }); 
            logger.log('info','Assigment Voluenteers updated to: ', vol_u_ids);
            await x.update_ai_volunteers(vol_u_ids, ai.AssignmentInstanceID );
        });
        return response;
    }
    // Finds new user from lists of lists. created 2-27-18 mss86
    //@ uses only the first list if possible, then second(section ids), lasty (instructors)
    //@   u_ids_wc: [ [],..]  list of lists with constrains
    //@   u_ids_woc   [ ] list of users without constrains
    //@   avoid_u_ids [ ] list of users to avoid
    async find_new_user_from_pool(u_ids_wc, u_ids_woc, vol_u_ids, avoid_u_ids) {
        vol_u_ids = vol_u_ids || [];
        var idx = null;
        var new_user_id=null;
        logger.log('info','find_new_user_from_pool was called',{
            u_ids_wc: u_ids_wc, 
            u_ids_woc: u_ids_woc, 
            vol_u_ids: vol_u_ids, 
            avoid_u_ids: avoid_u_ids,
        }); 
        // loop through each users array without Constrains
        await Promise.mapSeries(u_ids_wc, async(u_ids) =>{
            if(!new_user_id){
                // check if there is a user that has not been part of voluenteers so far and fits
                if(!new_user_id){    
                    await Promise.map(u_ids, function (u_id) {  // changed to map from mapSeries
                        if (new_user_id == null && !_.contains(avoid_u_ids, u_id) && !_.contains(vol_u_ids, u_id)) {
                            new_user_id = u_id;
                            logger.log('debug','new user not yet in voluenteers found from users with constrains :',new_user_id);
                        }
                    });
                }
                // find user that has been part of voluenteers and least recently used
                if(!new_user_id){
                    await Promise.map(vol_u_ids, function (u_id, i) {  // changed to map from mapSeries
                        if (idx == null && _.contains(u_ids, u_id) && !_.contains(avoid_u_ids, u_id)) {
                            idx = i;
                            new_user_id = u_id;
                            logger.log('debug','new user that is part of voluenteers found users with constrains :',new_user_id);
                        }
                    });
                }
            }      
        });
        // if not found a user yet, pick first user from Users without Contrains that was least used
        if(!new_user_id){
            new_user_id = u_ids_woc[0];  
            // find a user  that didnt voluenteer yet
            Promise.mapSeries(u_ids_woc, async (user_id)=>{
                if(!_.contains(vol_u_ids,user_id)){
                    new_user_id = user_id;
                }
            });
            logger.log('debug','user without constrains used :',new_user_id);
            idx = vol_u_ids.indexOf(new_user_id); // 
        }
        // reorder the volunteers used so far for this assignment
        if(new_user_id != null){ // if new user was found
            if(idx != null && idx > -1){
                vol_u_ids.splice(idx, 1); // remove user
            }
            vol_u_ids.push(new_user_id);  // add user to end of list
        }
        return new_user_id; 
    }
    // update_ai_volunteers 
    //@ u_ids : array of ids
    //@ ai_id : assigment instance id
    async update_ai_volunteers(vol_u_ids, ai_id){
        logger.log('info',{
            call:"update_ai_volunteers",
            vol_u_ids: vol_u_ids,
            ai_id: ai_id,
        });
        var vol_user_ids = vol_u_ids || [];
        await AssignmentInstance.update({
            Volunteers: vol_user_ids
            }, {
                where: {
                    AssignmentInstanceID: ai_id
                }
        }).catch(function (err) {
            logger.log('error', 'update_ai_volunteers, failed to update', err);
        });
        return;
    }
    // Get TaskInstance from ti_id  created 3-2-18 mss86
    //@ ti_id: taskinstanceID
    async get_ti_from_ti_id(ti_id){
        logger.log('info',{
            call:"get_ti_from_ti_i",
            ti_id: ti_id,
        });
        var result = await TaskInstance.findOne({
            where: {
                TaskInstanceID: ti_id
            }
        })
        if(result){
            return result;
        }else{
            logger.log('error','get_ti_from_ti_id, no TaskInstance Exists');
            return;
        }
    }
    // Get TaskInstance from wi_id  created 3-2-18 mss86
    //@ wi_id: WorkFlowInstanceID
    async get_ti_from_wi_id(wi_id){
        logger.log('info',{
            call:"get_ti_from_wi_id",
            wi_id: wi_id,
        });
        var result = await TaskInstance.findOne({
            where: {
                WorkflowInstanceID: wi_id
            }
        })
        if(result){
            return result;
        }else{
            logger.log('error','get_ti_from_wi_id, no TaskInstance Exists');
            return;
        }
    }
    // Get AssigmentInstance from ai_id  created 3-2-18 mss86
    //@ ai_id: AssignmentInstanceID
    async get_wi_ids_from_ai(ai_id, wa_id){
        logger.log('debug',{
            call:"get_wi_ids_from_ai",
            ai_id: ai_id,
            wa_id: wa_id
        });
        var result = await WorkflowInstance.findAll({
            where: {
                AssignmentInstanceID: ai_id,
                WorkflowActivityID: wa_id
            },
            order: [
                ['WorkflowInstanceID', 'ASC']
            ],
            attributes: ['WorkflowInstanceID']
    
        });
        if(result){
            var wi_ids = []
            await Promise.mapSeries(result, async(res) =>{
                wi_ids.push(res.WorkflowInstanceID);
            });
            console.log(wi_ids);
            return wi_ids;
        }else{
            logger.log('error','get_wi_ids_from_ai, no Workflows Exists');
            return;
        }
    }
    // Get workflowInstacne from wi_id  created 3-14-18 mss86
    //@ wi_id: workflowInstaceID
    async get_wi_from_wi_id(wi_id){
        logger.log('info',{call:'get_wi_from_wi_id',wi_id: wi_id});
        var wi = await WorkflowInstance.findOne({
            where: {
                WorkflowInstanceID: wi_id,
            }
        });
        return wi;
    }
    // Get All late task within workflow created 3-2-18 mss86
    //@ wi_id: WorkFlowInstanceID
    async get_late_tis(wi_id){
        logger.log('info',{
            call:"get_late_tis",
            wi_id: wi_id,
        });
        var late_tasks=[];
        var tis = await TaskInstance.findAll({
            where:{
                WorkFlowInstanceID: wi_id,
                $and: [
                    { 
                        Status: {
                            $like: '%"late"%',
                        }
                    },    
                    { 
                        Status: {
                            $notLike: '%"complete"%',
                        }
                    },
                    {
                        Status: {
                            $notLike: '%"bypassed"%', 
                        }
                    },
                    {
                        Status: {
                            $notLike: '%"cancelled"%', 
                        }
                    }
                ]
            }
        });
        await Promise.map(tis, async(ti) => {
            late_tasks.push(ti);
        });
        return late_tasks;
    }
    // Get new due date for task created 3-3-18 mss86
    //@ ti: taskinstance
    async get_new_date(ti){
        var extension = 1440; // TODO: change this default 1 day to 1/2 of orginal
        //var date = new Date (ti.EndDate); 
        if(ti.EndDate != null){ // keep the date null if it was null
            var date = new Date ();  // from current time, since realocation can happen few days after
            var newdate = new Date ( date );
            newdate.setMinutes ( date.getMinutes() + extension );
            logger.log('debug','get_new_date: ',date);
            return newdate;
        }else{
            return null;
        }
    }
    //finds the students from the same section
    findSectionUsers(ai_id, callback) {
        AssignmentInstance.find({
            where: {
                AssignmentInstanceID: ai_id
            }
        }).then(function (result) {
            SectionUser.findAll({
                where: {
                    SectionID: result.SectionID
                }
            }).then(function (users) {
                var userArray = [];
                Promise.map(users, function (user) {
                    userArray.push(user.UserID);
                }).then(function (done) {
                    console.log('Users:', userArray);
                    callback(userArray);
                });
            }).catch(function (err) {
                console.log(err);
                throw Error('Cannot find TaskActivity!');
            });
        });
    }

    //finds group members
    findGroupUsers(g_id, callback) {

    }

    //finds group members
    async findInstructor(ai_id) {
        var ai = await AssignmentInstance.find({
            where: {
                AssignmentInstanceID: ai_id
            },
            include: [{
                model: Assignment,
                attributes: ['OwnerID']
            }]
        });

        var instructors = await SectionUser.findAll({
            where: {
                Role: 'Instructor',
                SectionID: ai.SectionID,
                Active: 1
            }
        });

        if (instructors.length === 0) {
            logger.log('info', '/Workflow/Allocator/findInstructor: No instructor found in the section, using the owner as replacement');
            return ai.Assignment.OwnerID;
        } else {
            logger.log('info', '/Workflow/Allocator/findInstructor: found instructors');
            return instructors[Math.floor(Math.random() * instructors.length)].UserID;
        }
    }
    // Create Graph for realocation durning workflow cancellation created 3-7-18 mss86
    //@ array of arrays of arrays of similar objects
    //  [  
    //    [wi_id, [{}] , [{}], [{},{}],......]     workflow 
    //    [wi_id, [{}] , [{}], [{},{}],......]     workflow 
    //    ...                                workflow ...
    //  ]
    async create_assigment_graph(ai_id, wa_id){
        logger.log('info', {call: 'create_assigment_graph', ai_id: ai_id});
        var x = this;
        var wi_ids  = await x.get_wi_ids_from_ai(ai_id , wa_id);
        var Graph = [];
        var invalid_workflows=[];
        await Promise.map(wi_ids, async (wi_id, wi_idx) => {
            var wi = await x.get_wi_from_wi_id(wi_id);
            var ti_ids = JSON.parse(wi.TaskCollection);
            var g_workflow = [wi_id];  // wi_id at index 0
            var g_task = [];
            var skip_workflow = false;
            await Promise.mapSeries(ti_ids , async(ti_id , ti_idx) =>{
                var ti = await x.get_ti_from_ti_id(ti_id);
                var viewed = false;
                var completed = false;
                var Status = JSON.parse(ti.Status);
                if(Status[4] === 'viewed'   || Status[0] === 'bypassed'){
                    viewed = true;
                }
                if(Status[0] === 'complete' || Status[0] === 'bypassed'){
                    completed = true;
                }
                if(ti_idx === 0 && Status[1] === 'cancelled'){ // if the first task is cancelled, workflow is cancelled
                    skip_workflow = true;  
                }
                var history =JSON.parse(ti.UserHistory);
                var first_user =history[0].user_id;
                var obj_data = {'ta_id': ti.TaskActivityID, 'ti_id': ti_id, 'userID': ti.UserID, 'viewed': viewed, 'completed':completed, 'newuser':false, 'first_user': first_user };
                if(g_task.length === 0){           // if its empty add to array
                    g_task.push(obj_data);
                }else if(g_task[g_task.length-1].ta_id === ti.TaskActivityID){      // if its the same activity put in same array
                    g_task.push(obj_data);
                }else{                             // if its different activity, put it in a new array
                    g_workflow.push(g_task);
                    g_task=[];
                    g_task.push(obj_data);
                }
                if(ti_idx >= ti_ids.length-1){     // if this was the last task
                    g_workflow.push(g_task);
                    g_task = [];
                }
            });
            if(skip_workflow){
                invalid_workflows.push(wi_idx);
            }
            Graph[wi_idx] = g_workflow;        // worfkflow array into graph
            return;
        });
        // this will only be used if previus cancellation took place.
        invalid_workflows.sort(function (a,b) { return b-a; }); // reverse sort to remove from bottom up.
        await Promise.mapSeries(invalid_workflows, async(invalid_workflow) => {  
            Graph.splice(invalid_workflow,1);                   // remove workflows     
        });
        return Graph;
    }
    // changes the status of task from normal to cancelled created 3-13-18 mss86
    //@ ti_id task instance id
    async cancel_task(ti_id){
        logger.log('info',{call:'cancel_task', ti_id: ti_id})
        var ti = await this.get_ti_from_ti_id(ti_id)
        var ti_status = JSON.parse(ti.Status);

        ti_status[1] = 'cancelled';  // change status to cancelled

        await TaskInstance.update({
            Status: JSON.stringify(ti_status)
            }, {
                where: {
                    TaskInstanceID: ti_id
                }
        }).catch(function (err) {
            logger.log('error', 'cancel_task, failed to update', err);
        });
        return;
    }
    // Cancel workflows and realocate the users to other workflows created 3-11-18 mss86
    //@ ai_id: assigment instance id
    //@ wi_ids: [ ] workdlow ids to cancel
    async cancel_workflow(ai_id, wa_id, wi_ids){
        var x = this;
        logger.log('info',{ call:'cancel_workflow', ai_id: ai_id, wi_ids: wi_ids});
        var success = true;
        var Message = '';
        var Graph = await x.create_assigment_graph(ai_id, wa_id);
        var constrains = await x.create_constrain_array_for_graph(Graph[0]);
        logger.log('debug', constrains);
        await x.print_graph(Graph);
        
        var old_indexes = []; 
        var old_users =[];
        await Promise.mapSeries(wi_ids, async (wi_id)=>{        // find indexes of workflow that needs to be removed in the graph
            await Promise.map(Graph, async(workflow, idx) =>{  
                if(workflow[0] === wi_id){
                    old_indexes.push(idx);
                    old_users.push(workflow[1][0].userID);
                    logger.log('debug',{cancel_workflow: wi_id, idx: idx});
                    return;
                }
            });
        });
        var Users = [];
        Users[0] = [];   
        //console.log(old_users);
        //console.log(old_indexes);
        await Promise.mapSeries(Graph, async(workflow, w_idx) =>{   // make array of usable users that can be used
            await Promise.mapSeries(workflow, async(activity, a_idx) => {
                if(a_idx === 0){return}             // ship first index
                if(!Array.isArray(Users[a_idx])){
                    Users[a_idx]=[];
                }
                await Promise.mapSeries(activity, async(task, t_idx) => {
                    if (!Array.isArray(Users[a_idx][t_idx])){
                        Users[a_idx][t_idx] = [];
                    }
                    if (!task.viewed && task.first_user === task.userID && ! _.contains(old_users,task.userID)){
                        Users[a_idx][t_idx].push(task.userID);          // only add users that we can place in workflows
                        //task.userID = 0;
                    }
                });
            });
        });
        old_indexes.sort(function(a, b){return b-a});  // reverse sort to remove from bottom up
        await Promise.mapSeries(old_indexes, async(old_index)=>{
            Graph.splice(old_index,1);
        });
        await x.print_graph(Graph);
        console.log(Users);
        var num_of_wf = Graph.length;
        var num_of_at = Graph[0].length;
        for(var i = 2 ; i< num_of_at ; i++){
            for(var j = 0 ; j< num_of_wf ; j++){
                for(var k = 0 ; k < Graph[j][i].length ; k++){
                    var task_instance = Graph[j][i][k];
                    if(!task_instance.viewed){
                        var Found = false;
                        for(var user_i = 0; user_i < Users[i][k].length; user_i++){
                            var new_user = Users[i][k][user_i];
                            //console.log(Graph[j][i][k].userID);
                            var ok = await x.check_constrains_for_workflow(Graph[j],constrains,i-1, new_user );
                            //console.log(ok);
                            if(ok){
                                task_instance.userID  = new_user;
                                task_instance.newuser = true;
                                Users[i][k].splice(user_i, 1);
                                Found = true;
                                break;
                            }
                        }
                        if(!Found){
                            success = false;
                            logger.log('error', "No user could be allocated to this task",i,j,k);
                        }
                    } 
                    //console.log(Graph[j][i][k].userID);
                }
            }
        }
        console.log(Users);
        x.print_graph(Graph);
        //return //Graph;
        if(success){
            await x.apply_cancellation_graph(Graph, wi_ids);
            return {'Error': false, 'Message': Message}
        }else{
            return {'Error': true , 'Message': Message , data:{Graph:Graph, wi_ids: wi_ids}}
        }
    }
    // Uses A graph Created during workflow Cancellation and Applies the realocation created 3-22-18 mss86
    // and cancellation to the database
    //@ Graph: A Graph created during workflow cancellation
    //@ wi_ids: [ ] workflow IDS that are to be cancelled
    async apply_cancellation_graph(Graph, wi_ids){
        var x = this;
            //////////////////////////////////////////// cancel all the task intances in the workflow
            await Promise.map(wi_ids, async(wi_id) =>{ 
                var wi = await x.get_wi_from_wi_id(wi_id);
                var ti_ids = JSON.parse(wi.TaskCollection);
                await Promise.map(ti_ids, async(ti_id) => {
                    await x.cancel_task(ti_id);
                });
            });   
        //////////////////////////////////////////////// check and cancel same activities with same user in same workflow
            await Promise.map(Graph, async(workflow, wi_idx) =>{
                await Promise.map(workflow, async(activity, act_idx) =>{
                    if(act_idx === 0 || act_idx === 1){return;}
                    var users_old=[]; 
                    var users_new=[]; 
                    await Promise.mapSeries(activity, async( task, task_idx) =>{
                        var in_users_new = users_new.indexOf(task.userID); 
                        if(in_users_new > -1){ 
                            var ti_to_cancel;
                            for(var i=0; i< task_idx ; i++){
                                if(activity[i].userID = task.userID){
                                    ti_to_cancel = activity[i].ti_id;
                                    Graph[wi_idx][act_idx][task_idx].newuser = false; // dont realocate a user since this task will be canceled.
                                    break;
                                }
                            }
                            logger.log('debug', "cancel Duplicate task activity with ti:",ti_to_cancel);
                            await x.cancel_task(ti_to_cancel);
                        }else if(users_old.includes(task.userID)){
                            Graph[wi_idx][act_idx][task_idx].newuser = false;
                            await x.cancel_task(task.ti_id);
                        }else{
                            if(task.newuser){
                                users_new.push(task.userID);
                            }else{
                                users_old.push(task.userID);
                            }
                        }
                    });
                    /////////////////////////////////////////////////////////////// Realocate the users that Changed
                    await Promise.mapSeries(activity, async( task, task_idx) =>{
                        if(task.newuser){
                            var ti = await x.get_ti_from_ti_id(task.ti_id);
                            await x.reallocate_user_to_task(ti,task.userID, false, false); // not extra credit, dont change end date
                        }
                    });
                });
            });

    return {Error: false , Message: "Success"};
    }
    
    // Debug to print the graphs  created 3-12-18 mss86
    async print_graph(Graph){
        var output="\n";
        await Promise.mapSeries(Graph, async(g) => {
            await Promise.mapSeries(g, async(ar,idx)=>{
                if(idx === 0){ 
                    output += "wi_id:\t"+ar+"\t"; 
                    return;
                }
                output += '[';
                await Promise.mapSeries(ar, async(a)=>{ 
                    output +=' '+a.userID;
                });
                output += ']';
            });
            output +='\n';
        });
        logger.log('debug', output);
        return;
    }
    // Creates Array of constrains for canceling workflow graph created 3-20-18
    
    async create_constrain_array_for_graph(wi){
        logger.log('debug',{ 
            call:'create_constrain_array_for_graph',
            wi: wi
        });
        var x = this;
        var constrains = [];
        await Promise.mapSeries(wi, async (activity,idx) =>{
            if(idx === 0){ return; }  // first index has wi_id
            var ta = await TaskActivity.findOne({     // get constrains
                where: {
                    TaskActivityID: activity[0].ta_id
                },
                attributes: ['AssigneeConstraints','NumberParticipants']
            });
            var task_constrains = JSON.parse(ta.AssigneeConstraints);

            var temp = [];
            if(task_constrains[0] === "instructor"){                                            // if its instructor 
                constrains.push( {who:'instructor'} );
            }else if(task_constrains[0] === "student" || task_constrains[0] === "both"){        // if student or both
                var activity_idx = null;
                if(ta.NumberParticipants == 1 && _.has(task_constrains[2], 'same_as')){                     // if there is only such activity, honor same_as
                    activity_idx = await x.get_graph_activity_index_from_ta(wi, task_constrains[2].same_as[0]);
                    constrains.push({who:'student',same_as:activity_idx});
                }else if(_.has(task_constrains[2], 'not')){                                                 // else honor only not_in
                    var not_ins = task_constrains[2].not;
                    if(_.has(task_constrains[2], 'same_as')){           // remove same_as from not_in if exists
                        var j = not_ins.indexOf(task_constrains[2].same_as[0]);
                        if(not_ins.indexOf(j > -1 )){ 
                            not_ins.splice(j, 1);
                        }
                    }
                    await Promise.map(not_ins, async(not_in) =>{ // for each not_in ai_id, convert it to graph index
                        activity_idx = await x.get_graph_activity_index_from_ta(wi, not_in);
                        temp.push(activity_idx);
                    });
                    constrains.push({who:'student', not_in : temp} );
                }else if(_.has(task_constrains[2], 'not_in_workflow_instance')){
                    for(var i = 1; i< idx ; i++){
                        temp.push(i);
                    }
                    constrains.push({who:'student', not_in : temp} );
                }else{
                    constrains.push({who:'student', not_in : temp} );
                }
            } 
        });
        return constrains;
    }
    // converts task activity to index in the cancellation graph created 3-20-18 mss86
    async get_graph_activity_index_from_ta(wi, ta_id ) {
        for(var i = 1; i< wi.length ; i++){ /// no no no 
            if(wi[i][0].ta_id === ta_id){
                return i;
            }
        }
        return null;
    }
    // checks costrains when cancelling workflow created 3-22-18 mss86
    async check_constrains_for_workflow(workflow, constrains, index, userID){
        //console.log( {cons: constrains[index], idx:index , userID:userID })
        if(constrains[index].who === 'instructor'){
            return true;
        }else{
            if(_.has(constrains[index], 'same_as')){
                if(workflow[constrains[index].same_as][0].userID === userID){
                    return true
                }else { 
                    return false;
                }
            }else if(_.has(constrains[index], 'not_in')) {
                for(var i = 0 ; i < constrains[index].not_in.length ; i++ ){                    // for each constrain of not_in 
                    for( var j = 0 ; j < workflow[constrains[index].not_in[i]].length ; j++ ){  // check if multiple tasks of same activity
                        var task = workflow[constrains[index].not_in[i]][j];
                        if(task.userID === userID){
                            return false;
                        }
                    }
                }   
            }
        }
        return true;
    }



    
};




module.exports = Allocator;