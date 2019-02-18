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


var models = require('../models');
var TaskFactory = require('./TaskFactory.js');
var Promise = require('bluebird');
var Allocator = require('./Allocator.js');
var Email = require('./Email.js');
var Make = require('./Make.js');
var TaskTrigger = require('./TaskTrigger.js');
var _ = require('underscore');

var taskFactory = new TaskFactory();
var trigger = new TaskTrigger();
var alloc = new Allocator();
var email = new Email();
var make = new Make();
const logger = require('./Logger.js');

/**
 *
 * @constructor
 */

class Manager {

    async check() {
        var x = this;

        logger.log('info', '/Workflow/Manager/check(): initiating...');
        var lst = await TaskInstance.findAll({
            where: {
                $or: [{
                    Status: {
                        $like: '%"started"%'

                    }
                }, {
                    Status: {
                        $like: '%"late_reallocated"%'
                    }
                }],
                $and: {
                    Status: {
                        $notLike: '%"late"%'
                    }
                }
            },
            include: [{
                model: AssignmentInstance,
                attributes: ['AssignmentInstanceID', 'AssignmentID', 'WorkflowTiming'],
                include: [{
                    model: Section,
                    attributes: ['SectionID'],
                }],
            }, {
                model: TaskActivity,
                attributes: ['Type', 'WhatIfLate', 'AtDurationEnd', 'DueType']
            }]
        });


        var res = {};
        //TODO: for users list, replace it with: get volunteers that are active in section user [see commented lines, TODOs]
        await Promise.mapSeries(lst, async function (it) {
            // console.log(it.TaskInstanceID, it.AssignmentInstance.Section.SectionID, it.UserID)
            var secId = it.AssignmentInstance.Section.SectionID;
            if (!res[secId]) {
                res[secId] = {
                    tasks: [],
                    users: []
                }; //TODO: comment this line once volunteers are used instead

                //var volunteers = await x.getActiveVolunteers(secId)
                //res[secId] = {tasks: [], users: volunteers} //TODO: uncomment this line once volunteers are used instead
            }
            res[secId].tasks.push(it);
            //res[secId].users.push(it.UserID); //TODO: call get Volunteers and make sure they are active
        });

        await Object.keys(res).forEach(async function (secId) {
            var users = await x.getActiveVolunteers(lst.AssginmentInstanceID, secId);
            if (users.length === 0) { //no volunteer found from the section, get everyone from the section
                var users = await make.getUsersFromSection(secId);
                logger.log('info', 'no volunteer found from the section, use everyone instead');
            }
            // console.log(users);
            Promise.each(res[secId].tasks, async function (task) {
                await x.checkTask(task, users);
            });
        });
        /*var x = this;
        TaskInstance.findAll({
            where: {
                $or: [{
                    Status: "started"
                }, {
                    Status: "late_reallocated"
                }]
            }
        }).then(function(taskInstances) {
            if (taskInstances.length === 0) {
                console.log("No Task Instance Found!");
            }
            else {
                alloc.groupSectionUsers(taskInstances, function (res) {
                    console.log('res::', res)
                });
                alloc.findSectionUsers(taskInstances[0].AssignmentInstanceID, function (users) {
                    taskInstances.forEach(function (task) {
                        console.log('Checking Task Instance', task.TaskInstanceID);
                        x.checkTask(task, users);
                        //check for started task instances
                    });
                });
            }
            /!*taskInstances.forEach(function(task) {
                console.log('Checking Task Instance', task.TaskInstanceID);
                x.checkTask(task);
                //check for started task instances
            });*!/
        });*/
    }

    async checkTask(task, users) {
        //only check for started
        var x = this;
        var date = await task.timeOutTime();
        var now = new Date();
        if (date < now) {
            await x.timeOut(task, users);
        }
    }

    checkLate() {
        var x = this;
        TaskInstance.findAll({
            where: {
                Status: '%"late"%'
            }
        }).then(function (taskInstances) {
            taskInstances.forEach(function (task) {
                email.send(task.UserID, 'late', {'ti_id': task.TaskInstanceID});
            });
        });
    }

    checkAssignments() {
        var x = this;
        AssignmentInstance.findAll({
            where: {
                EndDate: null
            }
        }).then(function (AIs) {
            return Promise.mapSeries(AIs, function (assignmentInstance) {
                console.log('checkAssginments: AssignmentInstanceID', assignmentInstance.AssignmentInstanceID);
                return x.checkAssignment(assignmentInstance);
            });
        });
    }

    checkAssignment(assignmentInstance) {
        var x = this;
        var startDate = assignmentInstance.StartDate;

        var now = new Date();

        if (startDate < now) {
            console.log('checkAssginment: Start Date has past ', assignmentInstance.AssignmentInstanceID);
            return x.isStarted(assignmentInstance, function (result) {
                console.log('checkAssignment: ', assignmentInstance.AssignmentInstanceID, result);
                if (!result)
                    //return taskFactory.createInstances(assignmentInstance.SectionID, assignmentInstance.AssignmentInstanceID);
                    return make.allocateUsers(assignmentInstance.SectionID, assignmentInstance.AssignmentInstanceID);
            });
        }
    }

    isStarted(assignmentInstance, callback) {
        WorkflowInstance.count({
            where: {
                AssignmentInstanceID: assignmentInstance.AssignmentInstanceID
            }
        }).then(function (count) {
            callback(count > 0 ? true : false);
        });
    }

    async timeOut(task, users) {
        //var alloc = new Allocator();
        //check the option whether keep the same person or allocate to a new person
        //extended date is in DueType second postion

        // WhatIfLate: (0 = keep_same_participant, 1 = allocate_new_person_from_contingency_pool,
        // 2 = allocate_to_different_person_in_same_group, 3 = abandon_task, 4 = resolved_task, 5 = allocate to
        // new instructor and more. If # > 0 then change status to overtime)

        //Change parameter WhatIfLate to Array of [action, number(days)];

        //decision point to decide change the status whether late, abandon, or complete

        var x = this;
        var status = JSON.parse(task.Status);
        if (task.TaskActivity.Type === 'dispute') {
            trigger.skipDispute(task.TaskInstanceID);
        } else {

            switch (task.TaskActivity.AtDurationEnd) {
                case '"late"':
                    //check WhatIfLate action
                    await x.whatIfLate(task, users);
                    break;
                case 'resolve':
                    status[0] = 'complete';
                    await x.updateStatus(task, status);
                    await trigger.bypassAllSubworkflows(task);
                    //submitted. Stop task instance and continue subworkflow task status = complete
                    break;
                case 'abandon':
                    status[0] = 'abandoned';
                    await x.updateStatus(task, status);
                    await trigger.bypassAllSubworkflows(task);
                    //abandoning subworkflow. status = complete
                    //*add subworkflow complete.
                    //Skip to subworkflow complete
                    break;
                case 'complete':
                    //change status to complete and begin next tasks`
                    status[0] = 'complete';
                    await x.updateStatus(task, status);
                    await trigger.next(task.TaskInstanceID);
                    break;
                default:
                    console.log('AtDurationEnd does not fall into any category.');
            }

        }

    }

    async updateStatus(task, status) {
        task.Status = JSON.stringify(status);
        await task.save();
    }

    async getActiveVolunteers(ai_id, secId) {
        // var users = [];
        // var volunteers = await VolunteerPool.findAll({
        //     where: {
        //         SectionID: secId
        //     },
        //     attributes: ['UserID']
        // });


        // await Promise.mapSeries(volunteers, function (volunteer) {
        //     users.push(volunteer.UserID);
        // });


        // logger.log('debug', 'Volunteers found', {
        //     users: users
        // })
        // return users;

        // var ai = await AssignmentInstance.find({
        //     where: {
        //         AssignmentInstanceID: ai_id
        //     },
        //     attributes: ['SectionID']
        // });

        var section_users = await SectionUser.findAll({
            where:{
                SectionID: secId,
                $or: [{
                    Volunteer: {
                        $like: 'Appointed'

                    }
                }, {
                    Volunteer: {
                        $like: 'Approved'
                    }
                }]
            }
        });

        var volunteer_pool = await VolunteerPool.findAll({
            where:{
                AssignmentInstanceID: ai_id,
                $or: [{
                    status: {
                        $like: 'Appointed'

                    }
                }, {
                    status: {
                        $like: 'Approved'
                    }
                }],
            }
        });

        var volunteers = [];
        await Promise.map(volunteer_pool, async (volunteer) =>{
                volunteers.push(volunteer.UserID);
        });

        await Promise.map(section_users, async (volunteer) =>{
            volunteers.push(volunteer.UserID);
        });

        //clear array for any duplicate
        await _.uniq(volunteers);

        logger.log('debug', 'return', {
            assignment_instance: volunteers
        });
        
        return volunteers;

    }

    async whatIfLate(task, users) {
        var x = this;
        var status = JSON.parse(task.Status);
        switch (task.TaskActivity.WhatIfLate) {
            case '"keep_same_participant"':
                status[3] = 'late';
                await x.updateStatus(task, status);
                email.sendNow(task.UserID, 'late', {'ti_id': task.TaskInstanceID});
                break;
            case '"allocate_new_participant_from_contigency_pool"':
                status[5] = 'reallocated_no_extra_credit';
                await x.updateStatus(task, status);
                //Run allocation algorithm, extend due date.
                await task.extendDate(JSON.parse(task.TaskActivity.DueType)[1], JSON.parse(task.TaskActivity.DueType)[0]);
                await alloc.reallocate(task, users, false, {
                    '5': 'reallocated_no_extra_credit'
                }).then(async function (done) {
                    //console.log(done);
                    if (!done || !done[0]) {
                        return;
                    } else {
                        console.log('now saving');
                        await task.save();
                    }
                });
                //send email to notify user about allocation
                break;
            case '"allocate_new_participant_extra_credit"':

                status[5] = 'reallocated_extra_credit';
                await x.updateStatus(task, status);
                //Run allocation algorithm, extend due date.
                await task.extendDate(JSON.parse(task.TaskActivity.DueType)[1], JSON.parse(task.TaskActivity.DueType)[0]);
                await alloc.reallocate(task, users, true, {
                    '5': 'reallocated_extra_credit'
                }).then(async function (done) {
                    //console.log(done);
                    if (!done || !done[0]) {
                        return;
                    } else {
                        console.log('now saving');
                        await task.save();
                    }
                });
                //send email to notify user about allocation
                break;
            case '"allocate_to_different_person_in_same_group"':
                status[0] = 'started';
                await x.updateStatus(task, status);
                //Run allocation algorithm specifiy with team, extend due date.
                alloc.findGroupUsers(task.GroupID, function (users) {
                    //alloc.reallocate(task.TaskInstanceID, users);
                });
                //send email to notify user about allocation
                break;
            case '"allocate_to_instructor"':
                console.log('TaskInstance ', task.TaskInstanceID, ': Allocating instructor to the task...');
                //Run allocation algorithm specifiy with team, extend due date
                var instructor = await alloc.findInstructor(task.AssignmentInstanceID);
                await alloc.reallocate_user_to_task(task, instructor, false);
                await task.extendDate(JSON.parse(task.TaskActivity.DueType)[1], JSON.parse(task.TaskActivity.DueType)[0]);
                //send email to notify user about allocation
                break;
            default:
                logger.log('error', '/Workflow/Manager/whatIfLate: Fatal! Unknown case!');
        }
    }
}

module.exports = Manager;