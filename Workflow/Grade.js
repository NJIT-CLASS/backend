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
var TaskGrade = models.TaskGrade;
var TaskSimpleGrade = models.TaskSimpleGrade;
var TaskActivity = models.TaskActivity;
var Assignment = models.Assignment;
var AssignmentGrade = models.AssignmentGrade;
var AssignmentInstance = models.AssignmentInstance;

var WorkflowInstance = models.WorkflowInstance;
var WorkflowGrade = models.WorkflowGrade;
var WorkflowActivity = models.WorkflowActivity;
var ResetPasswordRequest = models.ResetPasswordRequest;
var EmailNotification = models.EmailNotification;

var util = new Util();
const logger = require('winston');



class Grade {

    /**
     * Add simple grade
     * 
     * @param {any} ti_id 
     * @memberof Grade
     */
    async addSimpleGrade(ti_id) {
        var x = this;

        var ti = await TaskInstance.find({
            where: {
                TaskInstanceID: ti_id
            },
            include: [{
                model: WorkflowInstance,
                attributes: ['WorkflowActivityID']
            },
            {
                model: TaskActivity,
                attributes:['SimpleGrade']
            }]
        });
        var sec_user = await util.findSectionUserID(ti.AssignmentInstanceID, ti.UserID);

        if (ti.TaskActivity.SimpleGrade !== 'none') {
            try {
                var grade = await TaskSimpleGrade.create({
                    TaskInstanceID: ti.TaskInstanceID,
                    SectionUserID: sec_user,
                    WorkflowActivityID: ti.WorkflowInstance.WorkflowActivityID,
                    Grade: 1
                });

                logger.log('info', '/Workflow/Grade/addSimpleGrade: Done! TaskSimpleGradeID: ', grade.TaskSimpleGradeID);

            } catch (err) {
                logger.log('error', '/Workflow/Grade/addSimpleGrade: cannot create task simple grade', {
                    error: err
                });
            }
        }

    }

    /**
     * adds task grade
     * 
     * @param {any} ti_id 
     * @param {any} grade 
     * @memberof Grade
     */
    async addTaskGrade(ti_id, grade) {

        var ti = await TaskInstance.find({
            where: {
                TaskInstanceID: ti_id
            },
            include: [{
                model: WorkflowInstance,
                attributes: ['WorkflowActivityID']
            }]
        });

        var sec_user = await util.findSectionUserID(ti.AssignmentInstanceID, ti.UserID);

        var task_grade = await TaskGrade.create({
            TaskInstanceID: ti_id,
            WorkflowInstanceID: ti.WorkflowInstanceID,
            AssignmentInstanceID: ti.AssignmentInstanceID,
            SectionUserID: sec_user,
            WorkflowActivityID: ti.WorkflowInstance.WorkflowActivityID,
            Grade: grade
        });

        

        logger.log('info', '/Workflow/Grade/addTaskGrade: Done! TaskGradeID: ', task_grade.TaskGradeID);
    }
    
    /**
     * add workflow grade
     * 
     * @param {any} wi_id 
     * @param {any} user_id 
     * @param {any} grade 
     * @memberof Grade
     */
    async addWorkflowGrade(wi_id, user_id, grade){
        
        console.log('here');
        var wi = await WorkflowInstance.find({
            where:{
                WorkflowInstanceID: wi_id
            }
        });

        console.log('here2')
        var sec_user = await util.findSectionUserID(wi.AssignmentInstanceID, user_id);

        console.log('ai_id', wi.AssignmentInstanceID, 'sec_user', sec_user)

        var workflow_grade = await WorkflowGrade.create({
            WorkflowActivityID: wi.WorkflowActivityID,
            AssignmentInstanceID: wi.AssignmentInstanceID,
            SectionUserID: sec_user,
            Grade: grade
        });

        logger.log('info', '/Workflow/Grade/addWorkflowGrade: Done! WorkflowGradeID: ', workflow_grade.WorkflowGradeID);
    }

    /**
     * add assignment grade
     * 
     * @param {any} ai_id 
     * @param {any} user_id 
     * @param {any} grade 
     * @memberof Grade
     */
    async addAssignmentGrade(ai_id, user_id, grade){

        var sec_user = await util.findSectionUserID(ai_id, user_id);

        var assignment_grade = await AssignmentGrade.create({
            AssignmentInstanceID: ai_id,
            SectionUserID: sec_user,
            Grade: grade
        });

        logger.log('info', '/Workflow/Grade/addAssignmentGrade: Done! AssignmentGradeID: ', assignment_grade.AssignmentGradeID);

    }


    /**
     * Finds and returns task collection
     * 
     * @param {any} wi_id 
     * @returns 
     * @memberof Grade
     */
    async getTaskCollection(wi_id) {
        try {

            var x = this;
            var task_collection = [];
            var wi = await WorkflowInstance.find({
                where: {
                    WorkflowInstanceID: wi_id
                }
            });

            return JSON.parse(wi.TaskCollection);

        } catch (err) {
            logger.log('error', 'cannot find task collection');
        }
    }

    /**
     * finds and returns workflow collection
     * 
     * @param {any} ai_id 
     * @returns 
     * @memberof Grade
     */
    async getWorkflowCollection(ai_id) {
        try {
            var x = this;
            var ai = await AssignmentInstance.find({
                where: {
                    AssignmentInstanceID: ai_id
                }
            });

            return ai.WorkflowCollection;
        } catch (err) {
            logger.log('error', 'cannot find workflow collection');
        }
    }


    /**
     * checks if all workflows in the assignment is done
     * 
     * @param {any} ai_id 
     * @returns 
     * @memberof Grade
     */
    async checkAssignmentDone(ai_id) {
        var x = this;
        var wf_collection = await x.getWorkflowCollection(ai_id);
        var workflows_not_done = [];

        await Promise.map(JSON.parse(wf_collection), async function (wi_id) {
            if (!(await x.checkWorkflowDone(wi_id))) {
                workflows_not_done.push(wi_id);
            }
        });

        if (_.isEmpty(workflows_not_done)) {
            logger.log('info', 'assignment completed!');
            return true;
        } else {
            logger.log('info', 'assignment still in progress, waiting workflows to complete', {
                workflows: workflows_not_done
            });
            return false;
        }

    }

    /**
     * checks if all task instances within a workflow are done
     * 
     * @param {any} wi_id 
     * @returns 
     * @memberof Grade
     */
    async checkWorkflowDone(wi_id) {
        var x = this;
        var task_collection = await x.getTaskCollection(wi_id);
        var tasks_not_done = [];

        await Promise.map(task_collection, async function (ti_id) {
            if (!(await x.checkTaskDone(ti_id))) {
                tasks_not_done.push(ti_id);
            }
        });

        if (_.isEmpty(tasks_not_done)) {
            logger.log('info', 'workflow completed!');
            return true;
        } else {
            logger.log('info', 'workflow still in progress, waiting users to complete', {
                tasks: tasks_not_done
            });
            return false;
        }
    }

    /**
     * checks if a task is done
     * 
     * @param {any} ti_id 
     * @returns 
     * @memberof Grade
     */
    async checkTaskDone(ti_id) {

        try {
            var x = this;

            var ti = await TaskInstance.find({
                where: {
                    TaskInstanceID: ti_id
                }
            });

            if (JSON.parse(ti.Status)[0] === 'complete' || JSON.parse(ti.Status)[0] === 'automatic' || JSON.parse(ti.Status)[0] === 'bypassed') {
                return true;
            } else {
                return false;
            }

        } catch (err) {
            logger.log('error', 'cannot check whether the tasks are done', {
                TaskInstanceID: ti_id,
                error: err
            });
        }
    }



}

module.exports = Grade;