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

var TaskFactory = require('./TaskFactory.js');

//var models = require('../Model');
var Promise = require('bluebird');
var moment = require('moment');
var consts = require('../Util/constant.js');
var Email = require('./Email.js');
var Grade = require('./Grade.js');
var TaskFactory = require('./TaskFactory.js');
var Util = require('./Util.js');
var _ = require('underscore');


const logger = require('./Logger.js');
var email = new Email();
var grade = new Grade();
var util = new Util();
let taskFactory = new TaskFactory();



class TaskTrigger {
    /**
     * Wrapper function to decide which function to execute
     * @param  {[type]}  ti_id [description]
     * @return {Promise}       [description]
     */
    async next(ti_id) {
        var x = this;

        var ti = await TaskInstance.find({
            where: {
                TaskInstanceID: ti_id
            },
            include:[{
                model: TaskActivity,
                attributes: ['SimpleGrade']
            }]
        });

        if(ti.TaskActivity.SimpleGrade !== 'none'){
            await grade.addSimpleGrade(ti_id);
        }
        
        if (ti.NextTask === '[]') { //no more task in this branch
            await x.completed(ti_id);
        } else {
            if (await x.hasEditOrComment(ti)) {
                await x.triggerEditOrComment(ti);
            } else {
                await x.trigger(ti);
            }
        }
    }

    /**
     * Wrapper to determine the type of next task and trigger
     * 
     * @param {any} ti 
     * @memberof TaskTrigger
     */
    async trigger(ti) {
        var x = this;
        await Promise.mapSeries(JSON.parse(ti.NextTask), async function(task) { //loop through the list of next tasks
            var next_task = await TaskInstance.find({
                where: {
                    TaskInstanceID: task.id
                }
            });

            var type = await next_task.getType(); //get next tasks' type

            if (type === 'needs_consolidation') {
                await x.needsConsolidate(next_task);
            } else {
                if (JSON.parse(next_task.Status)[0] !== 'complete' && JSON.parse(next_task.Status)[0] !== 'bypassed') { // added bypassed for bypassed tasks 4-8-18
                    await x.triggerNext(next_task);
                }
            }
        });
    }


    async completed(ti_id) {

        var x = this;
        // check if the workflow of the assignment that belongs to the user is completed
        // check if all the workflow of the assignment that belongs to the user is completed

        //TODO: To check a workflow instance has completed find the task collection from workflow instance and search them all
        //TODO: To check if a assignement instance has completed find the workflow collection from assignment instance and search through them.

        var ti = await TaskInstance.find({
            where: {
                TaskInstanceID: ti_id
            }
        });

        var final_grade = await grade.findFinalGrade(ti);
        //console.log('herte', final_grade);
        if(final_grade != null){
            await grade.addTaskGrade(final_grade.id, final_grade.grade, final_grade.max_grade);
        }


        if (await grade.checkWorkflowDone(ti.WorkflowInstanceID)) {
            var grades = await TaskGrade.findAll({
                where: {
                    WorkflowInstanceID: ti.WorkflowInstanceID
                }
            });

            //Amadou
            let taskFactory = new TaskFactory;
            // taskFactory.updatePointInstance('high_grade', ti.AssignmentInstanceID, ti.UserID);


            await Promise.mapSeries(grades, async function(t_grade) {
                await grade.addWorkflowGrade(t_grade.WorkflowInstanceID, t_grade.SectionUserID, t_grade.Grade);
            });
        }

        if (await grade.checkAssignmentDone(ti.AssignmentInstanceID)) {
            var grades = await WorkflowGrade.findAll({
                where: {
                    AssignmentInstanceID: ti.AssignmentInstanceID
                }
            });

            await Promise.mapSeries(grades, async function(w_grade) {
                await grade.addAssignmentGrade(w_grade.AssignmentInstanceID, w_grade.SectionUserID, w_grade.Grade);
            });
        }

    }



    /**
     * determine whether a task is followed by an edit task
     * @param  {[type]}  ti [description]
     * @return {Promise}    [description]
     */
    async hasEditOrComment(ti) {
        //try{
        var bool = false;

        await Promise.mapSeries(JSON.parse(ti.NextTask), async function(task) { //loop through the list of next tasks
            var next_task = await TaskInstance.find({
                where: {
                    TaskInstanceID: task.id
                }
            });


            var type = await next_task.getType();

            if (type === 'edit' || type === 'comment') {
                bool = true;
            }
        });

        //console.log('result', bool);

        return bool;

        // } catch(err){
        //     logger.log('error', 'failed to determine whether task follows by edit', {ti_id: ti.TaskInstanceID});
        // }
    }

    /**
     * triggers edit task
     * TODO: Still need to consider the case when there are multiple edits
     * @param  {[type]}  ti [description]
     * @return {Promise}    [description]
     */
    async triggerEditOrComment(ti) {
        //try{
        var x = this;
        await Promise.mapSeries(JSON.parse(ti.NextTask), async function(task) { //loop through the list of next tasks
            var next_task = await TaskInstance.find({
                where: {
                    TaskInstanceID: task.id
                }
            });

            var type = await next_task.getType();

            if (type === 'edit' || type === 'comment') {
                await x.triggerNext(next_task);
                
            }
        });

        //current task status becomes completed
        var status = JSON.parse(ti.Status);
        status[0] = 'complete';
        if (status[2] === 'submitted_for_approval') {
            status[2] = 'being_revised(1)';
        } else if (status[2].substr(0, 13) === 'being_revised') {
            var regExp = /\(([^)]+)\)/;
            var matches = regExp.exec(status[2]);
            matches = parseInt(matches[1]);
            matches++;
            status[2] = 'being_revised(' + JSON.stringify(matches) + ')';
        } else {
            status[2] = 'submitted_for_approval';
        }


        await TaskInstance.update({
            Status: JSON.stringify(status),
        }, {
            where: {
                TaskInstanceID: ti.TaskInstanceID
            }
        });


        // } catch(err){
        //     logger.log('error', 'failed to trigger edit task', {ti_id: ti.TaskInstanceID});
        // }
    }

    /**
     * decide whehter consolidates the previous tasks and determine either bypass or proceed to consolidation task
     * 
     * @param {any} ti 
     * @memberof TaskTrigger
     */
    async needsConsolidate(ti) {
        //try{
        var x = this;
        if (await x.checkPrevious(ti)) {
            logger.log('info', 'consolidating tasks...');

            var final_grade = await x.findGrades(ti);
            //console.log('final_grade', final_grade);

            if (final_grade !== null) { //update final grade if something has returned
                await TaskInstance.update({
                    FinalGrade: final_grade[0]
                }, {
                    where: {
                        TaskInstanceID: ti.TaskInstanceID
                    }
                });
            }

            if (final_grade === null || final_grade[1]) { //triggers consolidation if no grade found nor the threshold exceed
                await x.next(ti.TaskInstanceID);
            } else {
                await x.skipConsolidation(ti); //ti is needs_consolidation
            }

        }

        // } catch(err){
        //     logger.log('error', 'failed to consolidate tasks', {ti_id: ti.TaskInstanceID});
        // }
    }

    /**
     * checks previous task of needs consolidation are done
     * @param  {[type]}  ti [description]
     * @return {Promise}    [description]
     */
    async checkPrevious(ti) {
        logger.log('info', 'checking all previous tasks are completed.');
        //try{
        var is_all_completed = true;

        await Promise.map(JSON.parse(ti.PreviousTask), async function(task) {
            var pre = await TaskInstance.find({
                where: {
                    TaskInstanceID: task.id
                }
            });
            //Check if all grading solution are completed
            if (JSON.parse(pre.Status)[0] !== 'complete' && JSON.parse(pre.Status)[0] !== 'automatic' && JSON.parse(pre.Status)[0] !== 'bypassed') {
                console.log('here all false')
                is_all_completed = false;
            }
        });

        if (is_all_completed) {
            logger.log('info', 'all previous tasks are completed.');
        } else {
            logger.log('info', 'some previous tasks are still in progress.');
        }

        return is_all_completed;
        // } catch(error){
        //     logger.log('error', 'failed checking previous tasks', {ti_id: ti.TaskInstanceID});
        // }

    }

    /**
     * determines if final grade exists, and returns the computed grades if found
     * @param  {[type]}  task [description]
     * @return {Promise}      [description]
     */
    async findGrades(task) {
        logger.log('info', '/findGrades:checking for grades...');
        //try{
        var x = this;
        var final_grade;
        var grades = [];
        var maxGrade = 0;
        var triggerConsolidate = false;

        await Promise.map(JSON.parse(task.PreviousTask), async function(ti) { //find FinalGrade of PreviousTask
            var pre = await TaskInstance.find({
                where: {
                    TaskInstanceID: ti.id
                },
                include: [{
                    model: TaskActivity
                }]
            });

            if (pre.FinalGrade !== null) { //if no FinalGrade found, dont push
                grades.push(pre.FinalGrade);
                let data =  JSON.parse(pre.Data)[0];
                //console.log(data);
                await Promise.mapSeries(Object.keys(JSON.parse(pre.Data)[JSON.parse(pre.Data).length - 1]), function(val) {
                    let field = JSON.parse(pre.TaskActivity.Fields)
                    if ((val !== 'revise_and_resubmit' && val !== 'field_titles' && val !== 'number_of_fields' && val !== 'field_distribution')&&field[val].field_type === 'assessment') { //check if field type is assessment
                        let distribution = field.field_distribution[val];
                        if (field[val].assessment_type === 'grade') {
                            final_grade += (parseInt(data[val][0])/field[val].numeric_max)*(distribution/100)*100;
                        } else if (field[val].assessment_type === 'rating') {
                            final_grade += (data[val][0]/field[val].rating_max)*(distribution/100)*100;
                        } else if (field[val].assessment_type === 'pass') {
                            if(data[val][0] == 'pass'){
                                final_grade += field[val].numeric_max*(distribution/100)*100;
                            }
                        } else if (field[val].assessment_type === 'evaluation') {
                            let label_length = field[val].list_of_labels.length;
                            final_grade += ((field[val].list_of_labels.indexOf(data[val][0])+1)/label_length)*(distribution/100)*100;
                        }
                    }
                });
            }
        });


        if (_.isEmpty(grades)) { //if no grades found return null
            return null;
        } else { //there are some grades found, compute FinalGrade for needs_consolidation
            var max = Math.max.apply(null, grades);
            var min = Math.min.apply(null, grades);

            var ta = await TaskActivity.find({
                where: {
                    TaskActivityID: task.TaskActivityID
                }
            });

            //checks if the grades exceed threshold
            if (JSON.parse(ta.TriggerConsolidationThreshold)[1] == 'percent') {
                var percent = (max - min);
                if (percent > JSON.parse(ta.TriggerConsolidationThreshold)[0]) {
                    triggerConsolidate = true;
                }
            } else if (JSON.parse(ta.TriggerConsolidationThreshold)[1] == 'point') {
                var point = max - min;
                if (point > ta.JSON.parse(ta.TriggerConsolidationThreshold)[0]) {
                    triggerConsolidate = true;
                }
            }

            //determine function type and return appropriate grade
            if (ta.FunctionType === 'max') {
                //console.log('The needs consolidation grade is: ', max);
                return [max, triggerConsolidate];
            } else if (ta.FunctionType === 'min') {
                //console.log('The needs consolidation grade is: ', min);
                return [min, triggerConsolidate];
            } else if (ta.FunctionType === 'average' ||ta.FunctionType === 'avg') {
                //console.log('The needs consolidation grade is: ', (max + min) / 2);
                return [(max + min) / 2, triggerConsolidate];
            } else {
                logger.log('error', 'unknown function type', {
                    function: ta.FunctionType
                });
            }
        }
        // } catch(err){
        //     logger.log('error', 'failed finding grades', {ti_id: ti.TaskInstanceID});
        // }
    }


    /**
     * bypass the consolidation task and begins task after consolidation
     * @param  {[type]}  needs_consolidation
     * @return {Promise}    [description]
     */
    async skipConsolidation(needs_consolidation) {
        logger.log('info', 'threshold exceed, skipping consolidation');
        //try{

        var x = this;
        var date = new Date();

        await Promise.map(JSON.parse(needs_consolidation.NextTask), async function(task) {
            var consolidation = await TaskInstance.find({ //assumed needs_consolidation's next task is always consolidation
                where: {
                    TaskInstanceID: task.id
                }
            });

            await x.bypass(consolidation);
            await x.next(consolidation.TaskInstanceID);
        });



        // } catch(err){
        //     logger.log('error', 'failed skipping consolidation', {ti_id: ti.TaskInstanceID});
        // }
    }

    /**
     * skip dispute task
     * @param  {[type]}  dispute [description]
     * @return {Promise}    [description]
     */
    async skipDispute(ti_id) {
        //  try{

        var x = this;

        var dispute = await TaskInstance.find({
            where: {
                TaskInstanceID: ti_id
            }
        });

        var date = new Date();
        var status = JSON.parse(dispute.Status);
        status[0] = 'complete';

        await TaskInstance.update({
            Status: JSON.stringify(status),
            EndDate: date,
            ActualEndDate: date
        }, {
            where: {
                TaskInstanceID: dispute.TaskInstanceID
            }
        });



        await Promise.map(JSON.parse(dispute.NextTask), async function(task) {
            var next = await TaskInstance.find({ //assumed needs_consolidation's next task is always consolidation
                where: {
                    TaskInstanceID: task.id
                }
            });

            await x.bypassAll(next);

        });

        // } catch(err){
        //     logger.log('error', 'failed skipping dispute', {ti_id: ti.TaskInstanceID});
        // }
    }

    /**
     * set the status of the task instance to bypassed and update dates
     * @param  {[type]}  ti [description]
     * @return {Promise}    [description]
     */
    async bypass(ti) {
        var x = this;
        logger.log('info', 'bypassing task instance...', {
            ti_id: ti.TaskInstanceID
        });
        //try{
        var date = new Date();

        var status = JSON.parse(ti.Status);
        status[0] = 'bypassed';

        await TaskInstance.update({
            Status: JSON.stringify(status),
            StartDate: date,
            EndDate: date,
            ActualEndDate: date
        }, {
            where: {
                TaskInstanceID: ti.TaskInstanceID
            }
        });

        if (ti.NextTask === '[]') { //no more task in this branch
            await x.completed(ti.TaskInstanceID);
        }



        // } catch(err){
        //     logger.log('error', 'failed bypassing task instance', {ti_id: ti.TaskInstanceID});
        // }
    }

    /**
     * bypass all the following tasks
     * 
     * @param {any} ti 
     * @memberof TaskTrigger
     */
    async bypassAll(ti) {
        var x = this;
        await x.bypass(ti);

        if (JSON.parse(ti.NextTask) !== '[]') {
            await Promise.map(JSON.parse(ti.NextTask), async function(task) {
                var next = await TaskInstance.find({ //assumed needs_consolidation's next task is always consolidation
                    where: {
                        TaskInstanceID: task.id
                    }
                });

                await x.bypassAll(next);
            });
        }
    }


    /**
     * triggers all following tasks
     * @param  {[type]}  ti [description]
     * @return {Promise}    [description]
     */
    async triggerNext(ti) { //ti == next_task
        logger.log('info', 'triggering next task to start', {
            ti_id: ti.TaskInstanceID
        });
        //try{
        var x = this;

        if (await x.checkPrevious(ti)) {
            var dates = await x.getNewDates(ti); //dates[0] === StartDate dates[1] === EndDate

            var status = JSON.parse(ti.Status);
            status[0] = 'started';

            await TaskInstance.update({
                Status: JSON.stringify(status),
                StartDate: dates[0],
                EndDate: dates[1]
            }, {
                where: {
                    TaskInstanceID: ti.TaskInstanceID
                }
            }).then(function() {
                email.sendNow(ti.UserID, 'new_task', {'ti_id': ti.TaskInstanceID});
            });

            logger.log('info', 'trigger completed', {
                ti_id: ti.TaskInstanceID
            });
        }
        // } catch(error){
        //     logger.log('error', 'failed to trigger next task', {ti_id: ti.TaskInstanceID});
        // }

    }


    /**
     * calculates StartDate and EndDate of a TaskInstance
     * @param  {[type]}  ti [description]
     * @return {Promise}    [description]
     */
    async getNewDates(ti) {
        //try{
        var ta = await TaskActivity.find({
            where: {
                TaskActivityID: ti.TaskActivityID
            }
        });

        var newStartDate = await moment().add(JSON.parse(ta.StartDelay), 'minutes');
        var newEndDate = await moment().add(JSON.parse(ta.StartDelay), 'minutes');
        if (JSON.parse(ti.DueType)[0] === 'duration') {
            await newEndDate.add(JSON.parse(ti.DueType)[1], 'minutes');
            //await newEndDate.add(1, 'minutes');
        } else if (JSON.parse(ti.DueType)[0] === 'specific time') {
            newEndDate = await moment(JSON.parse(ti.DueType)[1]).toDate();
        }

        return [newStartDate, newEndDate];
        // }catch(err){
        //     logger.log('error', 'failed to find new dates', {ti_id: ti.TaskInstanceID});
        // }


    }

    /**
     * computes the assessment grade if there is any
     * @param  {[type]}  ti   [description]
     * @param  {[type]}  data [description]
     * @return {Promise}      [description]
     */
    async finalGrade(ti, data) {

        logger.log('info', '/finalGrade:checking for grades...');
        var x = this;
        var final_grade = 0;
        
        var ta = await TaskActivity.find({
            where: {
                TaskActivityID: ti.TaskActivityID
            }
        });
        let field = JSON.parse(ta.Fields);

        if (typeof data === 'string') {
            var keys = Object.keys(JSON.parse(data)); //find the latest version of the data
        } else {
            var keys = Object.keys(data); //find the latest version of the data
        }
        await Promise.mapSeries(keys, function(val) {
            
            if ((val !== 'revise_and_resubmit' && val !== 'field_titles' && val !== 'number_of_fields' && val !== 'field_distribution') && field[val].field_type === 'assessment') { //check if field type is assessment
                let distribution = field.field_distribution[val];
                if (field[val].assessment_type === 'grade') {
                    final_grade += (parseInt(data[val][0])/field[val].numeric_max)*(distribution/100)*100;
                } else if (field[val].assessment_type === 'rating') {
                    final_grade += (parseInt(data[val][0])/field[val].rating_max)*(distribution/100)*100;
                } else if (field[val].assessment_type === 'pass') {
                    if(data[val][0] == 'pass'){
                        final_grade += (distribution/100)*100;
                    }
                } else if (field[val].assessment_type === 'evaluation') {
                    let label_length = field[val].list_of_labels.length;
                    final_grade += ((field[val].list_of_labels.indexOf(data[val][0])+1)/label_length)*(distribution/100)*100;
                }
            }
        });

        if (final_grade === 0) {
            logger.log('info', 'no grade has been found!');
            return 0;

        } else {
            // logger.log('info', 'grade has been found!', {
            //     'grade': final_grade
            // });
            return final_grade;
        }
    }


    /**
     * Revise and Resubmit
     * Send back to the original task to revise
     * @param {any} ti_id 
     * @param {any} data 
     * @memberof TaskTrigger
     */
    async revise(ti_id, data) {
        var x = this;

        var ti = await TaskInstance.find({ //find the revising task
            where: {
                TaskInstanceID: ti_id
            },
            include: [{
                model: TaskActivity
            }]
        });

        var original_task = await x.getEdittingTask(ti); //find the original task that been editted

        //update the current task status
        var status = JSON.parse(ti.Status);
        status[0] = 'complete';
        var final_grade = await x.finalGrade(ti, data);
        var ti_data = JSON.parse(ti.Data);

        if (!ti_data) {
            ti_data = [];
        }

        await ti_data.push(data);

        await TaskInstance.update({
            Data: ti_data,
            ActualEndDate: new Date(),
            Status: JSON.stringify(status),
            FinalGrade: final_grade
        }, {
            where: {
                TaskInstanceID: ti.TaskInstanceID
            }
        });

        //update the original task statusnp
        var original_data = JSON.parse(original_task.Data);
        if (!original_data) {
            original_data = [];
        }
        original_data[original_data.length - 1].revise_and_resubmit = { 'data': data, 'fields': JSON.parse(ti.TaskActivity.Fields) };

        var status = JSON.parse(original_task.Status);
        status[0] = "started";
        status[4] = "not_opened";

        await TaskInstance.update({
            Status: JSON.stringify(status),
            Data: original_data
        }, {
            where: {
                TaskInstanceID: original_task.TaskInstanceID
            }
        });

        email.sendNow(original_task.UserID, 'revise', {'ti_id': original_task.TaskInstanceID});
    }


    /**
     * Revise and resubmit.
     * Approve the edit task is done.
     * @param {any} ti_id 
     * @param {any} data 
     * @memberof TaskTrigger
     */
    async approved(ti_id, data) {

        var x = this;
        var ti = await TaskInstance.find({ //find the approving task
            where: {
                TaskInstanceID: ti_id
            }
        });
        var original_task = await x.getEdittingTask(ti); //find the original task that been editted
        await x.trigger(original_task); //trigger tasks


        //update the current task status
        var status = JSON.parse(ti.Status);
        status[0] = 'complete';

        var ti_data = JSON.parse(ti.Data);
        if (!ti_data) {
            ti_data = [];
        }
        await ti_data.push(data);

        var final_grade = await x.finalGrade(ti, data);

        await TaskInstance.update({
            Data: ti_data,
            ActualEndDate: new Date(),
            Status: JSON.stringify(status),
            FinalGrade: final_grade
        }, {
            where: {
                TaskInstanceID: ti.TaskInstanceID
            }
        });


        //update the original task status
        // var original_data = JSON.parse(original_task.Data);
        // if (!original_data) {
        //     original_data = [];
        // }
        // original_data.push(data);
        var status = JSON.parse(original_task.Status);
        status[2] = 'approved';

        await TaskInstance.update({
            Status: JSON.stringify(status),
            //Data: JSON.stringify(original_data)
        }, {
            where: {
                TaskInstanceID: ti.TaskInstanceID
            }
        });

        await x.next(ti_id);
    }

    /**
     * Revise and Resumit
     * Find the task that's been editted
     * @param {any} ti 
     * @returns 
     * @memberof TaskTrigger
     */
    async getEdittingTask(ti) {
        var x = this;
        var type = await ti.getType(); //assumed the task type can only be either edit or consolidation

        if (type === 'edit' || type === 'comment') { //assumed the original task for edit is the previous task edit -> original_task(show only be one previous task)
            var original_task = await TaskInstance.find({
                where: {
                    TaskInstanceID: JSON.parse(ti.PreviousTask)[0].id
                }
            });

            return original_task;
        } else { //this case should happen when type === consolidation. Assumed the orignal task is consolidation -> needs_consolidation -> edit -> original_task
            var needs_consolidation = await TaskInstance.find({
                where: {
                    TaskInstanceID: JSON.parse(ti.PreviousTask)[0].id
                }
            });

            var edit = await TaskInstance.find({
                where: {
                    TaskInstanceID: JSON.parse(needs_consolidation.PreviousTask)[0].id
                }
            });

            var original_task = await TaskInstance.find({
                where: {
                    TaskInstanceID: JSON.parse(edit.PreviousTask)[0].id
                }
            });


            return original_task;
        }
    }


    /**
     * Wrapper to determine which subworkflows to bypass
     * 
     * @param {any} ti 
     * @memberof TaskTrigger
     */
    async bypassAllSubworkflows(ti) {
        var x = this;

        if (JSON.parse(ti.NextTask) !== '[]') {
            await Promise.map(JSON.parse(ti.NextTask), async function(task) {
                var next = await TaskInstance.find({
                    where: {
                        TaskInstanceID: task.id
                    }
                });

                if (ti.IsSubworkflow !== next.IsSubworkflow) {
                    await x.bypassAll(next);
                }
            });
        }
    }


    /*
    * Cancel All Tasks
    */
    async cancelAll(ti){
        var x = this;
        await x.cancel(ti);

        if (JSON.parse(ti.NextTask) !== '[]') {
            await Promise.map(JSON.parse(ti.NextTask), async function(task) {
                var next = await TaskInstance.find({ //assumed needs_consolidation's next task is always consolidation
                    where: {
                        TaskInstanceID: task.id
                    }
                });
                await x.cancelAll(next);
            });
        }
    }
    /*
    * Cancel Task Instance
    */
    async cancel(ti){
        logger.log('info',{
            call:'cancel_task', 
            ti_id: ti.TaskInstanceID
        });
        var ti_status = JSON.parse(ti.Status);
        if(ti_status[0] == 'bypassed' || ti_status[0] == 'complete' ){
            return;
        }
        ti_status[1] = 'cancelled';  

        await TaskInstance.update({
            Status: JSON.stringify(ti_status),
            ActualEndDate: new Date()
            }, {
                where: {
                    TaskInstanceID: ti.TaskInstanceID
                }
        }).catch(function (err) {
            logger.log('error', 'cancel_task, failed to update', err);
        });
    }

    async submit(req){
        var ti = await TaskInstance.find({
            where: {
                TaskInstanceID: req.body.taskInstanceid,
            },
            include: [{
                model: TaskActivity,
                attributes: ['Type', 'AllowRevision', 'AllowReflection'],
            }, ],
        });

        if (JSON.parse(ti.Status)[0] === 'complete') {
            logger.log('error', 'The task has been complted already');
            return res.status(400).end();
        }

        
        //Ensure userid input matches TaskInstance.UserID
        if (req.body.userid != ti.UserID) {
            logger.log('error', 'UserID Not Matched');
            return res.status(400).end();
        }
        if (ti.TaskActivity.Type === 'edit' || ti.TaskActivity.Type === 'comment') {
            await x.approved(req.body.taskInstanceid, req.body.taskInstanceData);
        } else {

            var ti_data = await JSON.parse(ti.Data);

            if (!ti_data) {
                ti_data = [];
            }

            await ti_data.push(req.body.taskInstanceData);

            var newStatus = JSON.parse(ti.Status);
            newStatus[0] = 'complete';

            var final_grade = await x.finalGrade(ti, req.body.taskInstanceData);

            var done = await TaskInstance.update({
                Data: ti_data,
                ActualEndDate: new Date(),
                Status: JSON.stringify(newStatus),
                FinalGrade: final_grade
            }, {
                where: {
                    TaskInstanceID: req.body.taskInstanceid,
                    UserID: req.body.userid,
                }
            });

            var new_ti = await TaskInstance.find({
                where: {
                    TaskInstanceID: req.body.taskInstanceid,
                },
                include: [{
                    model: TaskActivity,
                    attributes: ['Type'],
                }, ],
            });

            logger.log('info', 'task instance updated');
            logger.log('info', 'triggering next task');

            await x.next(req.body.taskInstanceid);
        }

        return res.status(200).end();
    }


    async reset(ti_id, duration, keep_content){
            let x = this;
            let ti = await TaskInstance.find({
                where:{
                    TaskInstanceID: ti_id
                }
            });
            
            if(JSON.parse(ti.Status)[0] == 'not_yet_started'){
                logger.log('error', '/TaskTrigger/reset cannot reset task because it has not yet started')
                return;
            }
            
            let newStartDate = moment();
            let newEndDate = moment();

            if(duration == '[]'){ //if nothing specified, calculate original time duration and halves
                if(JSON.parse(ti.DueType)[0] == "specific time"){
                    let startDate = await moment(ti.StartDate);
                    let endDate = await moment(ti.EndDate);

                    let time = await moment.duration(endDate.diff(startDate));
                    let minutes = await time.asMinutes();

                    await newEndDate.add(minutes/2, 'minutes');
                    
                } else if (JSON.parse(ti.DueType)[0] == "duration"){
                    await newEndDate.add(JSON.parse(ti.DueType)[1], 'minutes');
                } else {
                    logger.log('error', '/TaskTrigger/reset/ failed to reset task in 1');
                    return;
                }
            } else { //expecting ["duration", minutes] or ["specific time", {startDate: date, endDate: date}]
                duration = JSON.parse(duration);

                if(JSON.parse(ti.DueType)[0] == "specific time"){
                    newStartDate = duration[1].startDate;
                    newEndDate = duration[1].endDate;
                    
                } else if (JSON.parse(ti.DueType)[0] == "duration"){
                    await newEndDate.add(duration[1], 'minutes');
                } else {
                    logger.log('error', '/TaskTrigger/reset/ failed to reset task in 1');
                    return;
                }
            }

            if(JSON.parse(ti.Status)[0] == 'automatic'){//when reset task is needs_consolidation
                logger.log('info', '/TaskTrigger/reset: automatic task re-triggering needs cosolidation');

                var u_history = JSON.parse(ti.UserHistory);
                u_history.push({
                    time: new Date(),
                    user_id: ti.UserID,
                    message: 'task has been reset',
                    is_extra_credit: JSON.parse(ti.UserHistory)[0].is_extra_credit
                });

                
                await TaskInstance.update({
                    StartDate: null,
                    EndDate: null,
                    ActualEndDate: null,
                    FinalGrade: null,
                    UserHistory: u_history
                }, {
                    where:{
                        TaskInstanceID: ti_id
                    }
                });
                await x.resetFollowingTask(ti.TaskInstanceID, JSON.parse(ti.NextTask), keep_content);
                await x.needsConsolidate(ti);
            } else {

                var status = JSON.parse(ti.Status);
                status[0] = 'started';
                status[2] = 'n/a';
                status[4] = 'not_opened';

                var u_history = JSON.parse(ti.UserHistory);
                u_history.push({
                    time: new Date(),
                    user_id: ti.UserID,
                    message: 'task has been reset',
                    is_extra_credit: JSON.parse(ti.UserHistory)[0].is_extra_credit
                });


                await x.resetFollowingTask(ti.TaskInstanceID, JSON.parse(ti.NextTask), keep_content);
                if(keep_content == true){
                    await TaskInstance.update({
                        Status: JSON.stringify(status),
                        StartDate: newStartDate,
                        EndDate: newEndDate,
                        ActualEndDate: null,
                        FinalGrade: null,
                        UserHistory: u_history
                    }, {
                        where:{
                            TaskInstanceID: ti_id
                        }
                    });
                } else {
                    await TaskInstance.update({
                        Status: JSON.stringify(status),
                        StartDate: newStartDate,
                        EndDate: newEndDate,
                        ActualEndDate: null,
                        FinalGrade: null,
                        Data: null,
                        UserHistory: u_history
                    }, {
                        where:{
                            TaskInstanceID: ti_id
                        }
                    });
                }
            }

            email.sendNow(ti.UserID, 'reset');

            await TaskGrade.destroy({
                where:{
                    TaskInstanceID: ti_id
                }
            });
    
            await TaskSimpleGrade.destroy({
                where:{
                    TaskInstanceID: ti_id
                }
            });



    }

    async resetFollowingTask(previous_ti, nextTasks, keep_content){ //recursive call to reset following tasks
        let x = this;
        await Promise.map(nextTasks, async function(task){
            let ti = await TaskInstance.find({
                where:{
                    TaskInstanceID: task.id
                }
            });

            if(JSON.parse(ti.Status)[0] != "not_yet_started"){
                await x.resetTask(previous_ti, ti, keep_content);
                await x.resetFollowingTask(previous_ti, JSON.parse(ti.NextTask), keep_content);
            }
        });
    }

    async resetTask(previous_ti, ti, keep_content){
        var status = JSON.parse(ti.Status);
        status[0] = 'not_yet_started';
        status[2] = 'n/a';
        status[4] = 'not_opened';

        var u_history = JSON.parse(ti.UserHistory);
        u_history.push({
            time: new Date(),
            user_id: ti.UserID,
            message: 'task has been reset by previous task: ' + previous_ti,
            is_extra_credit: JSON.parse(ti.UserHistory)[0].is_extra_credit
        });

        if(JSON.parse(ti.Status)[0] == 'automatic'){//when reset task is needs_consolidation
            logger.log('info', '/TaskTrigger/reset: automatic task re-triggering needs cosolidation');
            status[0] = 'automatic';
            await TaskInstance.update({
                StartDate: null,
                EndDate: null,
                ActualEndDate: null,
                FinalGrade: null,
                UserHistory: u_history
            }, {
                where:{
                    TaskInstanceID: ti.TaskInstanceID
                }
            });

        } else {
            if(keep_content == true){
                await TaskInstance.update({
                    Status: JSON.stringify(status),
                    StartDate: null,
                    EndDate: null,
                    ActualEndDate: null,
                    FinalGrade: null,
                    UserHistory: u_history
                }, {
                    where:{
                        TaskInstanceID: ti.TaskInstanceID
                    }
                }
            );
            } else {
                await TaskInstance.update({
                    Status: JSON.stringify(status),
                    StartDate: null,
                    EndDate: null,
                    ActualEndDate: null,
                    FinalGrade: null,
                    Data: null,
                    UserHistory: u_history
                }, {
                    where:{
                        TaskInstanceID: ti.TaskInstanceID
                    }
                });
            }
        }


        email.sendNow(ti.UserID, 'reset');

        await TaskGrade.destroy({
            where:{
                TaskInstanceID: ti.TaskInstanceID
            }
        });

        await TaskSimpleGrade.destroy({
            where:{
                TaskInstanceID: ti.TaskInstanceID
            }
        });
    }

}
module.exports = TaskTrigger;