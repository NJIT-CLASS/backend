import {
    Assignment,
    AssignmentGrade,
    AssignmentInstance,
    AssignmentInstance_Archive,
    Assignment_Archive,
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
    WorkflowInstance_Archive
} from '../Util/models.js';

//var models = require('../Model');
var Promise = require('bluebird');
var Util = require('./Util.js');
var _ = require('underscore');
var moment = require('moment');

var util = new Util();
const logger = require('./Logger.js');



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
                    attributes: ['WorkflowActivityID', 'TaskCollection']
                },
                {
                    model: TaskActivity,
                    attributes: ['SimpleGrade']
                }
            ]
        });
        var sec_user = await util.findSectionUserID(ti.AssignmentInstanceID, ti.UserID);

        var user_history = JSON.parse(ti.UserHistory);

        if (ti.TaskActivity.SimpleGrade !== 'none' && ti.TaskActivity.SimpleGrade.substr(0, 11) === 'off_per_day') {
            var avg_grade = await x.getAverageSimpleGrade(JSON.parse(ti.WorkflowInstance.TaskCollection));
            if (JSON.parse(ti.Status)[3] === 'late') {
                var days_late = await x.getNumberOfDaysLate(ti);
                var regExp = /\(([^)]+)\)/;
                var matches = regExp.exec(ti.TaskActivity.SimpleGrade);
                matches = parseInt(matches[1]);

                avg_grade = avg_grade - avg_grade * (matches / 100) * days_late;

                if (avg_grade < 0) {
                    avg_grade = 0;
                }
            }

            try {
                var grade = await TaskSimpleGrade.create({
                    TaskInstanceID: ti.TaskInstanceID,
                    SectionUserID: sec_user,
                    WorkflowActivityID: ti.WorkflowInstance.WorkflowActivityID,
                    IsExtraCredit: user_history[user_history.length - 1].is_extra_credit,
                    Grade: avg_grade
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
     * @param {any} max_grade 
     * @memberof Grade
     */
    async addTaskGrade(ti_id, grade, max_grade) {

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

        var user_history = JSON.parse(ti.UserHistory);

        var task_grade = await TaskGrade.create({
            TaskInstanceID: ti_id,
            WorkflowInstanceID: ti.WorkflowInstanceID,
            AssignmentInstanceID: ti.AssignmentInstanceID,
            SectionUserID: sec_user,
            WorkflowActivityID: ti.WorkflowInstance.WorkflowActivityID,
            Grade: grade,
            IsExtraCredit: user_history[user_history.length - 1].is_extra_credit,
            MaxGrade: max_grade
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
    async addWorkflowGrade(wi_id, sec_user, grade) {

        console.log('wi_id', wi_id, 'sec_user', sec_user, 'grade', grade);
        var wi = await WorkflowInstance.find({
            where: {
                WorkflowInstanceID: wi_id
            }
        });

        //var sec_user = await util.findSectionUserID(wi.AssignmentInstanceID, user_id);

        var w_grade = await WorkflowGrade.find({
            where: {
                AssignmentInstanceID: wi.AssignmentInstanceID,
                SectionUserID: sec_user
            }
        });

        if (w_grade === null) {
            var workflow_grade = await WorkflowGrade.create({
                WorkflowActivityID: wi.WorkflowActivityID,
                AssignmentInstanceID: wi.AssignmentInstanceID,
                SectionUserID: sec_user,
                Grade: grade
            });
        } else {
            var total = t_grade.grade + grade;
            await w_grade.update({
                Grade: total
            });
        }


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
    async addAssignmentGrade(ai_id, sec_user, grade) {

        //var sec_user = await util.findSectionUserID(ai_id, user_id);

        var a_grade = await AssignmentGrade.find({
            where: {
                AssignmentInstanceID: ai_id,
                SectionUserID: sec_user
            }
        });

        if (a_grade === null) {
            var assignment_grade = await AssignmentGrade.create({
                AssignmentInstanceID: ai_id,
                SectionUserID: sec_user,
                Grade: grade
            });
        } else {
            var total = a_grade.grade + grade;
            await a_grade.update({
                Grade: total
            });
        }


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


    async findFinalGrade(ti) {
        var x = this;
        console.log('traversing the workflow to find final grade...');
        if (ti.FinalGrade !== null) {

            logger.log('info', '/Workflow/Grade/findFinalGrade: final grade found! The final grade is:', ti.FinalGrade);

            var wi = await WorkflowInstance.find({
                where: {
                    WorkflowInstanceID: ti.WorkflowInstanceID
                },
            });

            var original = await x.gradeBelongsTo(ti);
            //return [wi.WorkflowActivityID, ti.TaskInstanceID, ti.FinalGrade];

            return {
                'id': original.id,
                'grade': ti.FinalGrade,
                'max_grade': original.max_grade
            };

        } else if (ti.FinalGrade === null && ti.PreviousTask !== null) {

            var pre_ti = await TaskInstance.find({
                where: {
                    TaskInstanceID: JSON.parse(ti.PreviousTask)[0].id
                }
            });

            if (pre_ti.IsSubworkflow === ti.IsSubworkflow) {
                var data = await x.findFinalGrade(pre_ti);
                return data;
            } else {
                console.log('no grades found.');
                return null;
            }
        } else {
            console.log('no grades found.');
            return null;
        }
    }

    async gradeBelongsTo(ti) {
        var x = this;
        //logger.log('info', '/Workflow/Grade/gradeBelongsTo: searching for user...');
        var ta = await TaskActivity.find({
            where: {
                TaskActivityID: ti.TaskActivityID
            }
        });

        if (ta.Type === 'grade_problem') {
            var pre_ti = await TaskInstance.find({
                where: {
                    TaskInstanceID: JSON.parse(ti.PreviousTask)[0].id
                }
            });

            var maxGrade = 0;
            await Promise.mapSeries(Object.keys(JSON.parse(ti.Data)), function (val) {
                if ((val !== 'number_of_fields' && val !== 'revise_and_resubmit') && JSON.parse(ta.Fields)[val].field_type == 'assessment') {
                    if (JSON.parse(ta.Fields)[val].assessment_type == 'grade') {
                        maxGrade += JSON.parse(ta.Fields)[val].numeric_max;
                    } else if (JSON.parse(ta.Fields)[val].assessment_type == 'rating') {
                        maxGrade += 100;
                    } else if (JSON.parse(ta.Fields)[val].assessment_type == 'evaluation') {
                        // How evaluation works?
                        // if(JSON.parse(ti.Data)[val][0] == 'Easy'){
                        //
                        // } else if(JSON.parse(ti.Data)[val][0] == 'Medium'){
                        //
                        // } else if(JSON.parse(ti.Data)[val][0] == 'Hard'){
                        //
                        // }
                    }
                }
            });

            logger.log('info', '/Workflow/Grade/gradeBelongsTo: userID found:', pre_ti.UserID);
            return {
                'id': pre_ti.TaskInstanceID,
                'max_grade': maxGrade
            };
        } else {
            var pre_ti = await TaskInstance.find({
                where: {
                    TaskInstanceID: JSON.parse(ti.PreviousTask)[0].id
                }
            });

            var ti_id = await x.gradeBelongsTo(pre_ti);
            return ti_id;
        }
    }


    async getAverageSimpleGrade(task_collection) {
        var grade = 100;
        var length = task_collection.length;
        return grade / length;
    }

    async getNumberOfDaysLate(ti) {
        var now = moment();
        var endDate = ti.EndDate;
        now.diff(endDate, 'days');
        return now.diff(endDate, 'days') + 1;
    }

}

module.exports = Grade;