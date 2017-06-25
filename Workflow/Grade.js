var models = require('../Model');
var Promise = require('bluebird');
var Util = require('./Util.js');
var _ = require('underscore');

var FileReference = models.FileReference;
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


const logger = require('winston');



class Grade {

    async addSimpleGrade(ti_id){
        var x = this;
        var util = new Util();

        var ti = await TaskInstance.find({
            where:{
                TaskInstanceID: ti_id
            }
        });

        var ta = await TaskActivity.find({
            where:{
                TaskActivityID: ti.TaskActivityID
            }
        });

        var wa_id = await util.findWorkflowActivityID(ti.WorkflowInstanceID);
        var sec_user_id = await util.findSectionUserID(ti.AssignmentInstanceID, ti.UserID);

        if(ta.SimpleGrade !== 'none'){
            try{
                await TaskSimpleGrade.create({
                    TaskInstanceID: ti.TaskInstanceID,
                    WorkflowActivityID: wa_id,
                    SectionUserID: sec_user_id,
                    Grade: 1
                });
            } catch(err){
                logger.log('error', 'cannot create task simple grade', {
                    error: err
                });
            }
        }

    }

    async getTaskCollection(wi_id){
        try{

            var x = this;
            var task_collection = [];
            var wi = await WorkflowInstance.find({
                where:{
                    WorkflowInstanceID: wi_id
                }
            });

            await Promise.mapSeries(JSON.parse(wi.TaskCollection), async function(tasks){
                await Promise.mapSeries(tasks, async function(task){
                    await task_collection.push(task);
                });
            });

            return task_collection;

        }catch(err){
            logger.log('error', 'cannot find task collection');
        }
    }

    async getWorkflowCollection(ai_id){
        try{
            var x = this;
            var ai = await AssignmentInstance.find({
                where:{
                    AssignmentInstanceID: ai_id
                }
            });

            return ai.WorkflowCollection;
        } catch(err){
            logger.log('error', 'cannot find workflow collection');
        }
    }


    //check if all the workflow instances within an assignment is done
    async checkAssignmentDone(ai_id){
        var x = this;
        var wf_collection = await x.getWorkflowCollection(ai_id);
        var workflows_not_done = [];

        await Promise.map(JSON.parse(wf_collection), async function(wi_id){
            if(!(await x.checkWorkflowDone(wi_id))){
                workflows_not_done.push(wi_id);
            }
        });

        if(_.isEmpty(workflows_not_done)){
            logger.log('info', 'assignment completed!');
            return true;
        } else {
            logger.log('info', 'assignment still in progress, waiting workflows to complete', {
                workflows: workflows_not_done
            });
            return false;
        }

    }

    //check if all the task instances within a workflow is done
    async checkWorkflowDone(wi_id){
        var x = this;
        var task_collection = await x.getTaskCollection(wi_id);
        var tasks_not_done = [];

        await Promise.map(task_collection, async function(ti_id){
            if(!(await x.checkTaskDone(ti_id))){
                tasks_not_done.push(ti_id);
            }
        });

        if(_.isEmpty(tasks_not_done)){
            logger.log('info', 'workflow completed!');
            return true;
        } else {
            logger.log('info', 'workflow still in progress, waiting users to complete', {
                tasks: tasks_not_done
            });
            return false;
        }
    }

    async checkTaskDone(ti_id){

        try{
            var x = this;

            var ti = await TaskInstance.find({
                where:{
                    TaskInstanceID: ti_id
                }
            });

            if(JSON.parse(ti.Status)[0] === 'complete' || JSON.parse(ti.Status)[0] === 'automatic'){
                return true;
            } else {
                return false;
            }

        }catch(err){
            logger.log('error', 'cannot check whether the tasks are done', {
                TaskInstanceID: ti_id,
                error: err
            });
        }
    }



}

module.exports = Grade;
