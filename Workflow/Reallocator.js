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
var Promise = require('bluebird');
var moment = require('moment');
var TaskFactory = require('./TaskFactory.js');
const sequelize = require('../models/index.js').sequelize;
var _ = require('underscore');
var Email = require('./Email.js');

const logger = require('./Logger.js');
var email = new Email();

export default class Reallocator {
    //TODO  Possible removal as: NOT USED IN WORKFLOW CANCELLATION, TASK REALOCATION, or USER REALOCATION 
    reallocate_user_to_task(ti, new_u_id, is_extra_credit) { //reallocate ti with new_u_id
        if (is_extra_credit == null) {
            is_extra_credit = true;
        }

        // logger.log('debug', {
        //     call: 'reallocate_user_to_task'
        // });

        if(JSON.parse(ti.Status)[0] === 'complete'){
            return {
                Error: true,
                Message: 'Task already completed'
            };
        }

        var task_id = ti.TaskInstanceID;
        var ti_u_hist = JSON.parse(ti.UserHistory) || [];
        var extraCredit = 0;

        ti_u_hist.push({
            time: new Date(),
            user_id: new_u_id,
            is_extra_credit: is_extra_credit,
        });

        if(is_extra_credit){
            extraCredit = 1;
        }
        

        logger.log('info', 'update a task instance with a new user and user history', {
            task_instance: ti.toJSON(),
            new_user_id: new_u_id,
            user_history: ti_u_hist
        });

        return TaskInstance.update({
            UserID: new_u_id,
            UserHistory: ti_u_hist,
            ExtraCredit: extraCredit
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
                Message: null
            };
        }).catch(function (err) {
            logger.log('error', 'task instance update failed', err);
            return {
                Error: true,
                Message: 'Failed reallocate user to another task'
            };
        });
    }
    //TODO  Possible removal as: NOT USED IN WORKFLOW CANCELLATION, TASK REALOCATION, or USER REALOCATION
    async reallocate_instructor(tis, instructor){
        let x = this;
        await Promise.mapSeries(tis, async(ti_id) => {
            let ti = await TaskInstance.find({
                where: {
                    TaskInstanceID: ti_id
                }
            });

            let response = await x.reallocate_user_to_task(ti, instructor, false);

            if(response.Error){
                return {
                    Error: true,
                    Message: 'Failed reallocate instructor to task'
                };
            } else {
                return response;
            }
        });
    }

    //TODO  Possible removal as: NOT USED IN WORKFLOW CANCELLATION, TASK REALOCATION, or USER REALOCATION
    async reallocate_tasks(tis, new_users, section_id, ai_id, option, is_extra_credit) {
        let x = this;
        let users = new_users;
        let response = null;

        if(option === 'volunteers'){
            users = await x.get_volunteers(section_id, ai_id);
            if(users.length === 0){
                return {
                    Error: true,
                    Message: 'No Volunteers Found!'
                };
            }
        } else if(option === 'students'){
            users = await x.get_section_users(section_id, option);
            if(users.length === 0){
                return {
                    Error: true,
                    Message: 'No Students Found!'
                };
            } 
        } else if(option === 'instructor'){
            users = await x.get_section_users(section_id, option);
            if(users.length === 0){
                return {
                    Error: true,
                    Message: 'No Instructor Found!'
                };
            } else {
                return await x.reallocate_instructor(tis, users[0]);
            }
        } else {
            return {
                Error: true,
                Message: 'invalid option'
            };
        }

        // let maps = x.check(tis, users);
        // let keys = Object.keys(maps);

        // await Promise.mapSeries(keys, async(ti_id, index) => {
        //     let ti = await TaskInstance.find({
        //         where: {
        //             TaskInstanceID: ti_id
        //         }
        //     });

        //     return await x.reallocate_user_to_task(ti, maps[keys[index]], is_extra_credit);
        // });

        // return {
        //     Error: false,
        //     Message: null
        // };
    }
    //TODO  Possible removal as: NOT USED IN WORKFLOW CANCELLATION, TASK REALOCATION, or USER REALOCATION
    //checks if the users are valid for reallocation
    async check(tis, users){
        let x = this;
        let maps = {};
        await Promise.mapSeries(tis, async(ti_id) => {
            let ti = await TaskInstance.find({
                where: {
                    TaskInstanceID: ti_id
                }
            });

            let workflow_tis = await x.get_workflow_tis(ti);
            let ignore_users = await x.get_workflow_users(ti.WorkflowInstanceID);
            let new_user = await x.get_new_user(users, ignore_users);

            if(new_user === undefined){
                return {
                    Error: true,
                    Message: 'There is an error with reallocation. Please check your list of students.'
                };
            }

            await Promise.mapSeries(workflow_tis, (w_ti_id) => {
                if(!maps.hasOwnProperty(JSON.stringify(w_ti_id))){
                    maps[w_ti_id] = new_user;
                }
            });
        });

        return maps;
    }
    //TODO  Possible removal as: NOT USED IN WORKFLOW CANCELLATION, TASK REALOCATION, or USER REALOCATION
    async get_workflow_tis(ti){
        let return_list = [];
        return_list.push(ti.TaskInstanceID);

        let tasks = await TaskInstance.findAll({
            where:{
                WorkflowInstanceID: ti.WorkflowInstanceID
            },
            attributes:['TaskInstanceID', 'UserID']
        });

        await Promise.mapSeries(tasks, async (task) => {
            if(task.UserID === ti.UserID){
                return_list.push(task.TaskInstanceID);
            }
        });
    }
    //TODO  Possible removal as: NOT USED IN WORKFLOW CANCELLATION, TASK REALOCATION, or USER REALOCATION
    async get_new_user(users, ignore_users){
        let new_user;
        let filter_users = _.difference(users, ignore_users);

        if(filter_users.length === 0){
            return new_user;
        }

        new_user = users.shift();
        users.unshift(new_user);

        return new_user;

    }
    //TODO  Possible removal as: NOT USED IN WORKFLOW CANCELLATION, TASK REALOCATION, or USER REALOCATION
    async get_volunteers(section_id, ai_id){
        let volunteers;
        if(ai_id !== null && ai_id !== undefined){
            volunteers = await VolunteerPool.findAll({
                where:{
                    SectionID: section_id,
                    AssignmentInstanceID: ai_id 
                },
                attributes:['UserID']
            });
        } else {
            volunteers = await VolunteerPool.findAll({
                where:{
                    SectionID: section_id,
                },
                attributes:['UserID']
            });
        }
        return volunteers;
    }
    //TODO  Possible removal as: NOT USED IN WORKFLOW CANCELLATION, TASK REALOCATION, or USER REALOCATION
    async get_section_users(section_id, option){
        let users;
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
        return users;
    }
    //TODO  Possible removal as: NOT USED IN WORKFLOW CANCELLATION, TASK REALOCATION, or USER REALOCATION
    async get_workflow_users(wi_id){
        let users = await WorkflowInstance.findAll({
            where:{
                WorkflowInstanceID: wi_id
            }, 
            attributes:['UserID']
        });
        return users;
    }
};