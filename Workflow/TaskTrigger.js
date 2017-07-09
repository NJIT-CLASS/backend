var models = require('../Model');
var Promise = require('bluebird');
var moment = require('moment');
var consts = require('../Util/constant.js');
var Email = require('./Email.js');
var Grade = require('./Grade.js');
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

const logger = require('winston');
var email = new Email();
var grade = new Grade();
var util = new Util();



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
            }
        });

        if (ti.NextTask === '[]') { //no more task in this branch
            await x.completed(ti_id);
        } else {
            if (await x.hasEdit(ti)) {
                await x.triggerEdit(ti);
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
        await Promise.mapSeries(JSON.parse(ti.NextTask), async function (task) { //loop through the list of next tasks
            var next_task = await TaskInstance.find({
                where: {
                    TaskInstanceID: task.id
                }
            });

            var type = await next_task.getType(); //get next tasks' type

            if (type === 'needs_consolidation') {
                await x.needsConsolidate(next_task);
            } else {
                if (JSON.parse(next_task.Status)[0] !== 'complete') {
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
        await grade.addTaskGrade(final_grade.id, final_grade.grade, final_grade.max_grade);

        if (await grade.checkWorkflowDone(ti.WorkflowInstanceID)) {
            var grades = await TaskGrade.findAll({
                where: {
                    WorkflowInstanceID: ti.WorkflowInstanceID
                }
            });

            await Promise.mapSeries(grades, async function (t_grade) {
                await grade.addWorkflowGrade(t_grade.WorkflowInstanceID, t_grade.SectionUserID, t_grade.Grade);
            });
        }

        if (await grade.checkAssignmentDone(ti.AssignmentInstanceID)) {
            var grades = await WorkflowGrade.findAll({
                where: {
                    AssignmentInstanceID: ti.AssignmentInstanceID
                }
            });

            await Promise.mapSeries(grades, async function (w_grade) {
                await grade.addAssignmentGrade(w_grade.AssignmentInstanceID, w_grade.SectionUserID, w_grade.Grade);
            });
        }

    }



    /**
     * determine whether a task is followed by an edit task
     * @param  {[type]}  ti [description]
     * @return {Promise}    [description]
     */
    async hasEdit(ti) {
        //try{
        var bool = false;

        await Promise.mapSeries(JSON.parse(ti.NextTask), async function (task) { //loop through the list of next tasks
            var next_task = await TaskInstance.find({
                where: {
                    TaskInstanceID: task.id
                }
            });


            var type = await next_task.getType();

            if (type === 'edit') {
                bool = true;
            }
        });

        console.log('result', bool);
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
    async triggerEdit(ti) {
        //try{
        var x = this;
        await Promise.mapSeries(JSON.parse(ti.NextTask), async function (task) { //loop through the list of next tasks
            var next_task = await TaskInstance.find({
                where: {
                    TaskInstanceID: task.id
                }
            });

            var type = await next_task.getType();

            if (type === 'edit') {
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
            console.log('matches0', matches);
            matches = parseInt(matches[1]);
            console.log('matches', matches);
            matches++;
            console.log('matches2', matches);
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
            console.log('final_grade', final_grade);

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

        await Promise.map(JSON.parse(ti.PreviousTask), async function (task) {
            var pre = await TaskInstance.find({
                where: {
                    TaskInstanceID: task.id
                }
            });
            //Check if all grading solution are completed
            if (JSON.parse(pre.Status)[0] !== 'complete' && JSON.parse(pre.Status)[0] !== 'automatic' && JSON.parse(pre.Status)[0] !== 'bypassed') {
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
        logger.log('info', 'checking for grades...');
        //try{
        var x = this;
        var final_grade;
        var grades = [];
        var maxGrade = 0;
        var triggerConsolidate = false;

        await Promise.map(JSON.parse(task.PreviousTask), async function (ti) { //find FinalGrade of PreviousTask
            var pre = await TaskInstance.find({
                where: {
                    TaskInstanceID: ti.id
                },
                include: [{
                    model: models.TaskActivity
                }]
            });

            if (pre.FinalGrade !== null) { //if no FinalGrade found, dont push
                grades.push(pre.FinalGrade);

                await Promise.mapSeries(Object.keys(JSON.parse(pre.Data)), function (val) {
                    if (JSON.parse(pre.TaskActivity.Fields)[val].field_type !== undefined && val !== 'number_of_fields' && JSON.parse(pre.TaskActivity.Fields)[val].field_type == 'assessment') {
                        if (JSON.parse(pre.TaskActivity.Fields)[val].assessment_type == 'grade') {
                            maxGrade += JSON.parse(pre.TaskActivity.Fields)[val].numeric_max;
                        } else if (JSON.parse(pre.TaskActivity.Fields)[val].assessment_type == 'rating') {
                            maxGrade += 100;
                        } else if (JSON.parse(pre.TaskActivity.Fields)[val].assessment_type == 'evaluation') {
                            // How evaluation works?
                            // if(JSON.parse(pre.Data)[val][0] == 'Easy'){
                            //
                            // } else if(JSON.parse(pre.Data)[val][0] == 'Medium'){
                            //
                            // } else if(JSON.parse(pre.Data)[val][0] == 'Hard'){
                            //
                            // }
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
                var percent = (max - min) / maxGrade * 100;
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
                console.log('The needs consolidation grade is: ', max);
                return [max, triggerConsolidate];
            } else if (ta.FunctionType === 'min') {
                console.log('The needs consolidation grade is: ', min);
                return [min, triggerConsolidate];
            } else if (ta.FunctionType === 'average') {
                console.log('The needs consolidation grade is: ', (max + min) / 2);
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

        await Promise.map(JSON.parse(needs_consolidation.NextTask), async function (task) {
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



        await Promise.map(JSON.parse(dispute.NextTask), async function (task) {
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
            await Promise.map(JSON.parse(ti.NextTask), async function (task) {
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
            }).then(function () {
                //email.sendNow(nextTask.UserID, 'new task', null);
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
        if (JSON.parse(ta.DueType)[0] === 'duration') {
            await newEndDate.add(JSON.parse(ta.DueType)[1], 'minutes');
            //await newEndDate.add(1, 'minutes');
        } else if (JSON.parse(ta.DueType)[0] === 'specificTime') {
            newEndDate = await moment(JSON.parse(ta.DueType)[1]).toDate();
        }

        return [newStartDate, newEndDate];
        // }catch(err){
        //     logger.log('error', 'failed to find new dates', {ti_id: ti.TaskInstanceID});
        // }


    }

    /**
     * finds the grade of a task with the data passed in
     * @param  {[type]}  ti   [description]
     * @param  {[type]}  data [description]
     * @return {Promise}      [description]
     */
    async finalGrade(ti, data) {
        logger.log('info', 'checking for grades...');
        //try{
        var x = this;
        var grade = 0;

        var ta = await TaskActivity.find({
            where: {
                TaskActivityID: ti.TaskActivityID
            }
        });
        console.log(data);
        if (typeof data === 'string') {
            var keys = Object.keys(JSON.parse(data)); //find the latest version of the data
        } else {
            var keys = Object.keys(data); //find the latest version of the data
        }

        await Promise.mapSeries(keys, function (val) {
            //if (typeof JSON.parse(ta.Fields)[val].field_type !== undefined) {
            if (val !== 'number_of_fields' && JSON.parse(ta.Fields)[val].field_type === 'assessment') {
                if (JSON.parse(ta.Fields)[val].assessment_type === 'grade') {
                    grade += parseInt(data[val][0]);
                } else if (JSON.parse(ta.Fields)[val].assessment_type === 'rating') {
                    grade += parseInt(data[val][0]) * (100 / JSON.parse(ta.Fields)[val].rating_max);
                } else if (JSON.parse(ta.Fields)[val].assessment_type === 'evaluation') {
                    // How evaluation works?
                    // if(JSON.parse(pre.Data)[val][0] == 'Easy'){
                    //
                    // } else if(JSON.parse(pre.Data)[val][0] == 'Medium'){
                    //
                    // } else if(JSON.parse(pre.Data)[val][0] == 'Hard'){
                    //
                    // }
                }
            }
            // }
        });

        if (grade === 0) {
            logger.log('info', 'no grade has been found!');
            return null;
        } else {
            logger.log('info', 'grade has been found!', {
                'grade': grade
            });
            return grade;
        }

        // }catch(err){
        //     logger.log('error', 'failed finding final grades', {ti_id: ti.TaskInstanceID});
        // }
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
            }
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

        //update the original task status
        // var original_data = JSON.parse(original_task.Data);
        // if (!original_data) {
        //     original_data = [];
        // }
        // original_data.push(data);
        var status = JSON.parse(original_task.Status);
        status[0] = 'started';

        await TaskInstance.update({
            Status: JSON.stringify(status),
            //Data: JSON.stringify(original_data)
        }, {
            where: {
                TaskInstanceID: original_task.TaskInstanceID
            }
        });


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

        if (type === 'edit') { //assumed the original task for edit is the previous task edit -> original_task(show only be one previous task)
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
            await Promise.map(JSON.parse(ti.NextTask), async function (task) {
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
}

module.exports = TaskTrigger;