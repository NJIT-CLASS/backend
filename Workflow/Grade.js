import {
    Assignment,
    AssignmentGrade,
    AssignmentInstance,
    Course,
    ExtraCredit,
    SectionUser,
    SectionUserRecord,
    TaskActivity,
    TaskGrade,
    TaskInstance,
    TaskSimpleGrade,
    User,
    WorkflowActivity,
    WorkflowGrade,
    WorkflowInstance,
    UserContact,
} from '../Util/models.js';
import { stringArrayToSet } from 'winston/lib/winston/common';
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
                    attributes: ['WorkflowInstanceID','WorkflowActivityID', 'TaskCollection'],
                    include: [{
                        model: WorkflowActivity,
                        attributes: ['Name'],
                        
                    }]
                },
                {
                    model: TaskActivity,
                    attributes: ['SimpleGrade', 'DisplayName']
                }
            ]
        });

        var sec_user = await util.findSectionUserID(ti.AssignmentInstanceID, ti.UserID);

        var user_history = JSON.parse(ti.UserHistory);

        if (ti.TaskActivity.SimpleGrade !== 'none' && ti.TaskActivity.SimpleGrade.substr(0, 11) === 'off_per_day') {
            var avg_grade = await x.getAverageSimpleGrade(JSON.parse(ti.WorkflowInstance.TaskCollection));
            var days_late = await x.getNumberOfDaysLate(ti);
            var regExp = /\(([^)]+)\)/;
            var penalty = regExp.exec(ti.TaskActivity.SimpleGrade);
            penalty = parseInt(penalty[1]);
            if (JSON.parse(ti.Status)[3] === 'late') {
                avg_grade = avg_grade - avg_grade * (penalty / 100) * days_late;

                if (avg_grade < 0) {
                    avg_grade = 0;
                }
            }

            if(days_late < 0){
                days_late = 0;
            }

            try {
                var grade = await TaskSimpleGrade.create({
                    TaskInstanceID: ti.TaskInstanceID,
                    TaskActivityID: ti.TaskActivityID,
                    AssignmentInstanceID: ti.AssignmentInstanceID,
                    SectionUserID: sec_user,
                    WorkflowActivityID: ti.WorkflowInstance.WorkflowActivityID,
                    WorkflowInstanceID: ti.WorkflowInstance.WorkflowInstanceID,
                    WADisplayName: ti.WorkflowInstance.WorkflowActivity.Name,
                    TADisplayName: ti.TaskActivity.DisplayName,
                    TIExtraCredit: user_history[user_history.length - 1].is_extra_credit,
                    DaysLate: days_late,
                    DailyPenalty: penalty,
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
    async addTaskGrade(finalGrade) {

        var ti = await TaskInstance.find({
            where: {
                TaskInstanceID: finalGrade.gradeOwnerID
            },
            include: [{
                model: WorkflowInstance,
                attributes: ['WorkflowActivityID'],
                include: [{
                    model: WorkflowActivity,
                    attributes: ['Name', 'NumberOfSets', 'GradeDistribution'],
                    
                }]
            },
            {
                model: TaskActivity,
                attributes: ['SimpleGrade', 'DisplayName', 'Fields']
            }]
        });
        console.log('add task grade ai_id :', ti.AssignmentInstanceID);
        var sec_user = await util.findSectionUserID(ti.AssignmentInstanceID, ti.UserID);

        var user_history = JSON.parse(ti.UserHistory);

        var task_grade = await TaskGrade.create({
            TaskInstanceID: ti.TaskInstanceID,
            TaskActivityID: ti.TaskActivityID,
            WorkflowInstanceID: ti.WorkflowInstanceID,
            WorkflowActivityID: ti.WorkflowInstance.WorkflowActivityID,
            AssignmentInstanceID: ti.AssignmentInstanceID,
            SectionUserID: sec_user,
            TADisplayName: ti.TaskActivity.DisplayName,
            WADisplayName: ti.WorkflowInstance.WorkflowActivity.Name,
            Grade: finalGrade.task.FinalGrade,
            TIExtraCredit: user_history[user_history.length - 1].is_extra_credit,
            WANumberOfSets: ti.WorkflowInstance.WorkflowActivity.NumberOfSets,
            TIFields: {
                fields: ti.TaskActivity.Fields,
                data: finalGrade.task.Data
            }
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
        logger.log('info', '/Workflow/Grade/addWorkflowGrade: Adding grade');

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
                WorkflowInstanceID: wi.WorkflowInstanceID,
                SectionUserID: sec_user,
                Grade: grade
            });
        } else {
            var total = w_grade.Grade + grade;
            await w_grade.update({
                Grade: total
            });
        }


        logger.log('info', '/Workflow/Grade/addWorkflowGrade: Done! WorkflowGradeID: ', wi_id);
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
            var original_id = ti.ReferencedTask;
            //return [wi.WorkflowActivityID, ti.TaskInstanceID, ti.FinalGrade];
            if(original_id === null || typeof original_id === null){
                return null;
            } else {
                return {
                    'gradeOwnerID': original_id,
                    'task': ti
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
            attributes: ['TaskActivityID', 'WorkflowActivityID', 'Type', 'DisplayName', 'RefersToWhichTask', 'SimpleGrade']
        }).catch(function(err){
            console.log(err);
        });

        let simple_grade_max = {}
        await Promise.mapSeries(ta, (task) =>{
            if(!_.has(simple_grade_max, task.WorkflowActivityID)){
                simple_grade_max[task.WorkflowActivityID] = 0;
            }

            if(task.SimpleGrade != 'none'){
                simple_grade_max[task.WorkflowActivityID] += 1;
            }
        })

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
                'SimpleGrade': simple_grade,
                'SimpleGradeMax': simple_grade_max
            }
        }

        return result;

    }


    async getUserTaskInfoArray(ai_id){
        let x = this;
        let ai = await x.getAssginmentInstance(ai_id);
        let gradableTaskObj = await x.getGradableTasks(ai.AssignmentID);
        let wfs = await x.getWorkflowActivities(ai_id)
        let UTIA = {
            ai_id: ai_id,
            ai_name: ai.DisplayName,
            workflows: wfs,
            wf_grade_distribution: JSON.parse(ai.Assignment.GradeDistribution),
            users: [],
            userIDs: [],
            quality: {},
            qualityID: [],
            timeliness: {},
            timelinessID: [],
            extraCredit: {},
            extraCreditID: [],
            gradableTasks: gradableTaskObj.gradableTasks
        }

        var tis = await TaskInstance.findAll({
            where:{
                AssignmentInstanceID: ai_id,
                $or:[{
                    TaskActivityID: {
                        $in: gradableTaskObj.gradableTaskKeys
                    },
                },{
                    ExtraCredit: 1
                },{
                    TASimpleGrade: {
                        $notLike: 'none'
                    } 
                }]
            },
            attributes: ['TaskInstanceID', 'TaskActivityID', 'WorkflowInstanceID', 'Status', 'UserID', 'TASimpleGrade', 'ExtraCredit'],
            include: [{
                model: WorkflowInstance,
                attributes: ['WorkflowActivityID']
            }, {
                model:TaskActivity,
                attributes:['DisplayName']
            }]
        });

        await Promise.mapSeries(tis, async (ti) => {
            var sectUserID = await util.findSectionUserID(ai_id, ti.UserID);
            if(!_.contains(UTIA.userIDs, ti.UserID)){
                let user = await UserContact.find({
                    where:{
                        UserID: ti.UserID
                    },
                    attributes:['UserID','FirstName', 'LastName', 'Email']
                });
                UTIA.users.push({
                    sectionUserID: sectUserID,
                    user: user
                });
                UTIA.userIDs.push(ti.UserID);
            }
            if(gradableTaskObj.gradableTasks.hasOwnProperty(ti.TaskActivityID)){
                if(!UTIA.quality.hasOwnProperty(sectUserID)){
                    UTIA.quality[sectUserID] = [];
                }
                UTIA.quality[sectUserID].push(ti);
                UTIA.qualityID.push(ti.TaskInstanceID);
            }
            if(ti.TASimpleGrade !== 'none'){

                if(!await UTIA.timeliness.hasOwnProperty(sectUserID)){
                    UTIA.timeliness[sectUserID] = [];
                }

                UTIA.timeliness[sectUserID].push(ti);
                UTIA.timelinessID.push(ti.TaskInstanceID);
            }
            if(ti.ExtraCredit == 1) {s
                UTIA.extraCredit.push(ti);
                UTIA.extraCredit.push(ti.TaskInstance)
            }
        });

        console.log('quality: ', UTIA.qualityID);
        console.log('timeliness: ', UTIA.timelinessID);
        console.log('extra credit: ', UTIA.extraCreditID);
        console.log('users: ', UTIA.userIDs)
        return UTIA;
    }

    async getAssginmentInstance(ai_id){
        let ai = await AssignmentInstance.find({
            where:{
                AssignmentInstanceID: ai_id
            },
            attributes: ['AssignmentID', 'SectionID', 'DisplayName'],
            include: [{
                model:Assignment,
                attributes: ['GradeDistribution']
            }]
        });

        return ai;
    }

    async  getWorkflowActivities(a_id){
        let wfs = await WorkflowActivity.findAll({
            where:{
                AssignmentID: a_id
            },
            attributes: ['WorkflowActivityID', 'Name', 'NumberOfSets', 'GradeDistribution', 'TaskActivityCollection']
        });

        return wfs;
    }

    //{ '1': [ 3, 5, 7 ], '8': [ 9, 11, 13 ] } 
    //{ 'Gradable TaskActivityID': [ Potential Final Grade TaskActivityIDs ] } 
    async getGradableTasks(a_id){
        let gradableTasks = {};
        let gradableTasksKeys = [];
        var tas = await TaskActivity.findAll({
            where:{
                AssignmentID: a_id
            },
            attributes:["TaskActivityID", "RefersToWhichTask", "Type"]
        });
        
        await Promise.mapSeries(tas, (ta) => {

            if(ta.RefersToWhichTask !== null){

                if(!gradableTasks.hasOwnProperty(ta.RefersToWhichTask)){
                    gradableTasks[ta.RefersToWhichTask] = [];
                    gradableTasksKeys.push(ta.RefersToWhichTask);
                }
                if(ta.Type === 'grade_problem' || ta.Type === 'consolidation' || ta.Type === 'resolve_dispute'){
                    gradableTasks[ta.RefersToWhichTask].push(ta.TaskActivityID)
                }
            }

        });
        
        console.log(gradableTasks);

        return {
            gradableTasks: gradableTasks,
            gradableTaskKeys: gradableTasksKeys
        };
    }

    async getPossibleFinalGrades(ai_id, gradableTasks){
        //{ '1': [ 3, 5, 7 ], '8': [ 9, 11, 13 ] } 
        //{ 'Gradable TaskActivityID': [ Potential Final Grade TaskActivityIDs ] } 

        let wis = await WorkflowInstance.findAll({
            where:{
                AssignmentInstanceID: ai_id
            },
            attributes:['WorkflowInstanceID', 'TaskCollection']
        });

        await Promise.mapSeries(wis, async (wi) => {
            let taskCollection = JSON.parse(wi.TaskCollection);

            await Promise.mapSeries(gradableTasks, async (path) =>{

                let tis = await TaskInstance.findAll({
                    where:{
                        WorkflowInstanceID: wi.WorkflowInstanceID,
                        TaskInstanceID:{
                            $in:path
                        } 
                    }
                });

                await Promise.mapSeries(tis, (ti) => {

                    if(ti.TAType === "grade_problem"){

                    }
                })

            });
        })
    }



    async getAssignmentGradeReport(ai_id){
        let x = this;
        let UTIA = await x.getUserTaskInfoArray(ai_id);
        //let possibleFinalGrades = await x.getPossibleFinalGrades(ai_id, UTIA.gradableTasks)
        let userContacts = UTIA.users;
        let gradeReport = {
            assignmentName: UTIA.ai_name
        };

        await Promise.mapSeries(userContacts, async (userContact) => {
            
            let a_grade = await x.getAssignmentGrade(ai_id, userContact.sectionUserID);
            let workflowGradeReport = await x.getWorkflowGradeReport(UTIA, {sectionUserID: userContact.sectionUserID, userID: userContact.user.UserID});

            if(a_grade !== null || a_grade !== null ){
                a_grade = a_grade.Grade;
            } else {
                a_grade= 'not yet completed';
            }

            gradeReport[userContact.sectionUserID] = {
                UserID: userContact.user.UserID,
                firstName: userContact.user.FirstName,
                lastName: userContact.user.LastName,
                email: userContact.user.Email,
                assginmentGrade: a_grade,
                workflowGradeReport: workflowGradeReport
            }
        });

        return gradeReport;
    }

    async getWorkflowGradeReport(UTIA, user){
        let x = this;
        let workflowGradeReport = {}

        await Promise.mapSeries(UTIA.workflows, async (wf) => {
            let w_grade = await x.getWorkflowGrade(UTIA.ai_id, user.sectionUserID, wf.WorkflowActivityID);
            let problemAndTimelinessGrade = await x.getProblemAndTimelinessGradeReport(UTIA, user, wf)

            if(w_grade === null || w_grade === undefined){
                w_grade = 'not yet complete'
            } else {
                w_grade = w_grade.Grade
            }

            workflowGradeReport[wf.WorkflowActivityID] = {
                name: wf.Name,
                workflowActivityID: wf.WorkflowActivityID,
                numberOfSets: wf.NumberOfSets,
                weight: UTIA.wf_grade_distribution[wf.WorkflowActivityID],
                workflowGrade: w_grade,
                scaledGrade: '-',
                problemAndTimelinessGrade: problemAndTimelinessGrade
            }
        });

        return workflowGradeReport;
    }

    async getProblemAndTimelinessGradeReport(UTIA, user, wf){
        let x = this;
        let problemAndTimelinessGrade = {}

        await Promise.mapSeries(UTIA.quality[user.sectionUserID], async (ti) =>{
            let t_grade = await x.getTaskGrade(ti.TaskInstanceID);
            let taskGradeFields = await x.getTaskGradeFieldsReport(UTIA, user, ti);

            if(wf.WorkflowActivityID === ti.WorkflowInstance.WorkflowActivityID){
                problemAndTimelinessGrade[ti.TaskInstanceID] = {
                    name: ti.TaskActivity.DisplayName,
                    taskInstanceID: ti.TaskInstanceID,
                    workflowInstanceID: ti.WorkflowInstanceID,
                    workflowName: wf.Name,
                    weightInProblem: JSON.parse(wf.GradeDistribution)[ti.TaskActivityID] || '-',
                    weightInAssignment: t_grade.TAGradeWeightInAssignment || '-',
                    taskGrade: t_grade.Grade || 'not yet complete',
                    scaledGrade: t_grade.TIScaledGrade ||'-',
                    taskGradeFields: taskGradeFields
                }
            }
        });

        let t_simple_grades_count = await x.getTaskSimpleGradeCount(UTIA.ai_id, user.sectionUserID);
        let timelinessGradeDetailsReport = await x.getTimelinessGradeDetailsReport(UTIA, user, wf);
        let timelinessGradeDetails = timelinessGradeDetailsReport.timelinessGradeDetails;
        let simpleGradeCount = timelinessGradeDetailsReport.simpleGradeCount;
        
        problemAndTimelinessGrade['timelinessGrade'] = {
            workflowName: wf.Name,
            weightInProblem: JSON.parse(wf.GradeDistribution)['simple'] || '-',
            weightInAssignment: '-',
            taskSimpleGrade: t_simple_grades_count + ' out of ' + simpleGradeCount + ' complete' ,
            scaledGrade: '-',
            timelinessGradeDetails: timelinessGradeDetails
        }
        
        return problemAndTimelinessGrade;
    }
    
    async getTaskGradeFieldsReport(UTIA, user, ti){
        let x = this;
        let taskGradeFeilds = {};

        let resolveDispute = await TaskInstance.find({
            where: {
                ReferencedTask: ti.TaskInstanceID,
                TAType: 'resolve_dispute'
            },
            include:{
                model: TaskActivity,
                attributes: ['Fields']
            }
        });

        if(resolveDispute !== null || resolveDispute !== undefined){
            if(resolveDispute.FinalGrade !== null){
                taskGradeFeilds[resolveDispute.TaskInstanceID] = {

                }
            }
            
        }

        return {
            "1": {
                name: "unnamed",
                type: "numeric",
                value: '-',
                max: '-',
                weight: '-',
                scaledGrade: '-'
            },
            "2": {
                name: "unnamed",
                type: "rating",
                value: '-',
                max: '-',
                weight: '-',
                scaledGrade: '-'
            }
        }


    }

    async getTimelinessGradeDetailsReport(UTIA, user, wf){
        let x = this;
        let simpleGradeCount = 0;
        let timelinessGradeDetails = {};

        if(!UTIA.timeliness.hasOwnProperty(user.sectionUserID)){
            return {
                timelinessGradeDetails: timelinessGradeDetails,
                simpleGradeCount: simpleGradeCount
            }
        }
        
        await Promise.mapSeries(UTIA.timeliness[user.sectionUserID], async (ti) =>{
            if(wf.WorkflowActivityID === ti.WorkflowInstance.WorkflowActivityID){
                simpleGradeCount++;
            }

            let timelinessGrade = await x.getTaskSimpleGrade(ti.TaskInstanceID);

            if(timelinessGrade === null || typeof timelinessGrade === undefined || timelinessGrade === undefined){
                timelinessGradeDetails[ti.TaskInstanceID] = {
                    name: ti.TaskActivity.DisplayName,
                    status: JSON.parse(ti.Status)[0],
                    daysLate: '-',
                    penalty: '-',
                    totalPenalty: '-',
                    grade: '-'
                }
            } else {
                let totalPenalty = timelinessGrade.DaysLate * timelinessGrade.DailyPenalty;

                if(totalPenalty > 100) {
                    totalPenalty = 100;
                }
                timelinessGradeDetails[ti.TaskInstanceID] = {
                    name: ti.TaskActivity.DisplayName,
                    status: JSON.parse(ti.Status)[0],
                    daysLate: timelinessGrade.DaysLate,
                    penalty: timelinessGrade.DailyPenalty,
                    totalPenalty: totalPenalty,
                    grade: timelinessGrade.Grade
                }
            }

        });

        return {
            timelinessGradeDetails: timelinessGradeDetails,
            simpleGradeCount: simpleGradeCount
        }
    }

    async getAssignmentGrade(ai_id, sectUserID){
        let a_grade = await AssignmentGrade.find({
            where:{
                AssignmentInstanceID: ai_id,
                SectionUserID: sectUserID
            }
        });

        return a_grade;
    }

    async getWorkflowGrade(ai_id, sectUserID, wa_id){
        let w_grade = await WorkflowGrade.findOne({
            where:{
                AssignmentInstanceID: ai_id,
                SectionUserID: sectUserID,
                WorkflowActivityID: wa_id
            }
        });

        return w_grade;
    }

    async getTaskGrade(ti_id){
        let t_grade = await TaskGrade.find({
            where:{
                TaskInstanceID: ti_id
            }
        });

        return t_grade || {}
    }

    async getTaskSimpleGradeCount(ai_id, sectUserID){
        let t_simple_grades = await TaskSimpleGrade.count({
            where:{
                AssignmentInstanceID: ai_id,
                SectionUserID: sectUserID
            }
        });

        return t_simple_grades;
    }

    async getTaskSimpleGrade(ti_id){
        let timelinessGrade= await TaskSimpleGrade.find({
            where:{
                TaskInstanceID: ti_id
            }
        });

        return timelinessGrade;
    }

}

module.exports = Grade;