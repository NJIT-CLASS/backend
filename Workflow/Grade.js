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
                    AssignmentInstanceID: ti.AssignmentInstanceID,
                    SectionUserID: sec_user,
                    WorkflowActivityID: ti.WorkflowInstance.WorkflowActivityID,
                    IsExtraCredit: user_history[user_history.length - 1].is_extra_credit,
                    Grade: avg_grade
                });

                logger.log('info', '/Workflow/Grade/addSimpleGrade: Done! TaskSimpleGradeID: ', grade.TaskSimpleGradeID);

                return grade;

            } catch (err) {
                logger.log('error', '/Workflow/Grade/addSimpleGrade: cannot create task simple grade', {
                    error: err
                });

                return;
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
            TaskActivityID: ti.TaskActivityID,
            WorkflowInstanceID: ti.WorkflowInstanceID,
            AssignmentInstanceID: ti.AssignmentInstanceID,
            SectionUserID: sec_user,
            WorkflowActivityID: ti.WorkflowInstance.WorkflowActivityID,
            Grade: grade,
            IsExtraCredit: user_history[user_history.length - 1].is_extra_credit,
            MaxGrade: max_grade
        }).catch(function(err){
            console.log(err);
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

        //console.log('wi_id', wi_id, 'sec_user', sec_user, 'grade', grade);
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
            var total = w_grade.grade + grade;
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

        await Promise.map(JSON.parse(wf_collection), async function(wi_id) {
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

        await Promise.map(task_collection, async function(ti_id) {
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

            //var original = await x.gradeBelongsTo(ti);
            var original = ti.ReferencedTask;
            //return [wi.WorkflowActivityID, ti.TaskInstanceID, ti.FinalGrade];
            if(original === null || typeof original === null){
                return null;
            } else {
                return {
                    'id': original.id,
                    'grade': ti.FinalGrade,
                    'max_grade': 100
                };
            }
            

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
        logger.log('info', '/Workflow/Grade/gradeBelongsTo: searching for user... TaskActivityID: ',ti.TaskActivityID);
        var ta = await TaskActivity.find({
            where: {
                TaskActivityID: ti.TaskActivityID
            }
        });

        let field = JSON.parse(ta.Fields) 

        if (ta.Type === 'grade_problem') {
            var pre_ti = await TaskInstance.find({
                where: {
                    TaskInstanceID: JSON.parse(ti.PreviousTask)[0].id
                }
            });

            var maxGrade = 0;
            let field = JSON.parse(ta.Fields);

            
            await Promise.mapSeries(Object.keys(field), async function(val) {
                if (val === 'field_distribution' && val != null) { //check if field type is assessment
                    let distribution = field.field_distribution;
                    await Promise.mapSeries(Object.keys(field.field_distribution), function(val) {
                        maxGrade += distribution[val];
                    });
                }
            });

            logger.log('info', '/Workflow/Grade/gradeBelongsTo: userID found:', pre_ti.UserID);
            return {
                'id': pre_ti.TaskInstanceID,
                'max_grade': 100
            };
        } else {
            if(ti.PreviousTask === null || typeof ti.PreviousTask === undefined){
                logger.log('info', '/Workflow/Grade/gradeBelongsTo: no previous task, function end', ti.PreviousTask);
                return null;
            }

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

    async getStudentSimpleGrade(user_id, ai_id) {

        var tis = await TaskInstance.findAll({
            Where: {
                UserID: user_id,
                AssignmentInstanceID: ai_id,
                Status: {
                    $notLike: '%"automatic"%'
                }
            },
            include: [{
                model: TaskActivity
            }, {
                model: TaskSimpleGrade
            }]
        });


        return tis;
    }

    async claimExtraCredit(goal_instance_id, section_user_id) {
        let x = this;
        let record = await SectionUserRecord.find({
            SectionUserID: section_user_id
        });

        if(record.AvailablePoints > 0){
            var goal_progression = JSON.parse(record.GoalProgression);
            goal_progression[goal_instance_id].Claim = true;
            var available_points = record.AvailablePoints;
            available_points = available_points - 1;
            var used_points = record.UsedPoints;
            used_points = used_points + 1;

            await x.extraCreditCreateOrUpdate(section_user_id);
    
            await record.update({
                GoalProgression: goal_progression,
                AvailablePoints: available_points,
                UsedPoints: used_points
            });
        }
    }

    async extraCreditCreateOrUpdate(section_user_id) {
        let extra_credit = await ExtraCredit.find({
            where: {
                SectionUserID: section_user_id
            }
        });

        if (extra_credit === null) {
            await ExtraCredit.create({
                SectionUserID: section_user_id
            });
        } else {
            let points = extra_credit.Points + 1;
            await extra_credit.update({
                Points: points
            });
        }
    }

    async getGradeReport(ai_id){ //Should make a snapshot table to store all the info to save time when pull grades

        var ai_grade = await AssignmentGrade.findAll({
            where:{
                AssignmentInstanceID: ai_id
            }
        }).catch(function(err){
            console.log(err);
        });

        var ai = await AssignmentInstance.findOne({
            where:{
                AssignmentInstanceID: ai_id
            },
            attributes: ['AssignmentID', 'SectionID']
        }).catch(function(err){
            console.log(err);
        });

        var assignment = await Assignment.findOne({
            where:{
                AssignmentID: ai.AssignmentID
            },
            attributes: ['GradeDistribution', 'DisplayName', 'CourseID', 'WorkflowActivityIDs']
        }).catch(function(err){
            console.log(err);
        });

        var course = await Course.findOne({
            where:{
                CourseID: assignment.CourseID
            },
            attributes: ['Number', 'Name']
        }).catch(function(err){
            console.log(err);
        });

        var wi_grade = await WorkflowGrade.findAll({
            where:{
                AssignmentInstanceID: ai_id
            }
        }).catch(function(err){
            console.log(err);
        });

        var wa = await WorkflowActivity.findAll({
            where:{
                AssignmentID: ai.AssignmentID
            },
            attributes: ['WorkflowActivityID', 'GradeDistribution', 'TaskActivityCollection']
        }).catch(function(err){
            console.log(err);
        });

        var ti_grade = await TaskGrade.findAll({
            where:{
                AssignmentInstanceID: ai_id
            }
        }).catch(function(err){
            console.log(err);
        });

        var simple_grade = await TaskSimpleGrade.findAll({
            where:{
                AssignmentInstanceID: ai_id
            }
        }).catch(function(err){
            console.log(err);
        });

        var ta = await TaskActivity.findAll({
            where:{
                AssignmentID: ai.AssignmentID
            },
            attributes: ['TaskActivityID', 'WorkflowActivityID', 'Type', 'DisplayName', 'RefersToWhichTask']
        }).catch(function(err){
            console.log(err);
        });

        var sec_users = await SectionUser.findAll({
            where:{
                SectionID: ai.SectionID
            },
            include:{
                model: User,
            }
        }).catch(function(err){
            console.log(err);
        });


        let result = {
            'Course': course,
            'AssignmentActivity': assignment,
            'WorkflowActivity': wa,
            'TaskActivity': ta,
            'SectionUsers': sec_users,
            'Grades': {
                'Assignment': ai_grade,
                'Workflow': wi_grade,
                'Task': ti_grade,
                'SimpleGrade': simple_grade
            }
        }

        return result;

    }

}

module.exports = Grade;