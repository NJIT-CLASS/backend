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
    UserContact
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
            include: [
                {
                    model: WorkflowInstance,
                    attributes: ['WorkflowInstanceID', 'WorkflowActivityID', 'TaskCollection'],
                    include: [
                        {
                            model: WorkflowActivity,
                            attributes: ['Name']
                        }
                    ]
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

// 2/9/2019 - find count of ti in wi with simple grade !== "none"; avg_grade = 100/count  
        let simpleGradeTIs =
                    await TaskInstance.findAll({
                        where: {
                            WorkflowInstanceID: ti.WorkflowInstanceID,
                                TASimpleGrade: {
                                    $notLike: 'none'
                                }
                        }
                    });
            var avg_grade = (100 / simpleGradeTIs.length);
         //   console.log("addSimpleGrade, ti, length, 100/length, grade", ti.TaskInstanceID, simpleGradeTIs.length, (100 / simpleGradeTIs.length), avg_grade);
         //   var avg_grade = await x.getAverageSimpleGrade(JSON.parse(ti.WorkflowInstance.TaskCollection));
 
 
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

            if (days_late < 0) {
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
                    TIExtraCredit: ti.ExtraCredit,
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
     * called by routines in TaskInstance.js
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
            include: [
                {
                    model: WorkflowInstance,
                    attributes: ['WorkflowActivityID'],
                    include: [
                        {
                            model: WorkflowActivity,
                            attributes: ['Name', 'NumberOfSets', 'GradeDistribution']
                        }
                    ]
                },
                {
                    model: TaskActivity,
 //                   attributes: ['SimpleGrade', 'DisplayName', 'Fields']
                    attributes: ['AssignmentID', 'SimpleGrade', 'DisplayName', 'Fields'],
                    include: [
                        {
                            model: Assignment,
                            attributes: ['GradeDistribution']
                        }
                    ]}
            ]
        });
        console.log('add task grade ai_id :', ti.AssignmentInstanceID);
        var sec_user = await util.findSectionUserID(ti.AssignmentInstanceID, ti.UserID);

        var user_history = JSON.parse(ti.UserHistory);

        var WAID = ti.WorkflowInstance.WorkflowActivityID;
        var TAID = ti.TaskActivityID;

     // refer to: weightInProblem: JSON.parse(wf.GradeDistribution)[ti.TaskActivityID],
     //   var WAWeight = ti.TaskActivityID.Assignment.GradeDistribution.WIID;
     //   var WAWeight = JSON.parse(ti.TaskActivityID.Assignment.GradeDistribution)[WAID];
        var WAWeight = JSON.parse(ti.TaskActivity.Assignment.GradeDistribution)[WAID];
        
     // refer to: weightInProblem: JSON.parse(wf.GradeDistribution)[ti.TaskActivityID],
     //   var TAGradeWeight = ti.WorkflowInstance.WorkflowActivity.GradeDistribution.TAID;
        var TAGradeWeight = JSON.parse(ti.WorkflowInstance.WorkflowActivity.GradeDistribution)[TAID];
        // 2/15/2021 added AdjustedTAGradeWeight to account for problem sets
        var AdjustedTAGradeWeight = TAGradeWeight / ti.WorkflowInstance.WorkflowActivity.NumberOfSets;
        var TAGradeWeightinAssignment = ((TAGradeWeight * WAWeight)/100) / ti.WorkflowInstance.WorkflowActivity.NumberOfSets;
     //   may need to just use ti.FinalGrade
        var TIScaledGrade = (finalGrade.task.FinalGrade * TAGradeWeightinAssignment) / 100;
    // Comments is not currently used.  I'm hijacking it and putting the status value in the Comments field in case we need it later
        //var Comments = ti.Status[0];

        console.log("addTaskGrade", ti.TaskInstanceID, "FinalGrade", finalGrade.task.FinalGrade, 
                "WAWeight", WAWeight, "TAGradeWeight", TAGradeWeight, "AdjustedTAGradeWeight", AdjustedTAGradeWeight, 
                "TAGradeWeightinAssignment", TAGradeWeightinAssignment, "TIScaledGrade", TIScaledGrade);
     
        // missing values in WAWeight, TAGradeWeight, TAGradeWeightinAssignment, TIScaledGrade, Comments
        /*var task_grade = await TaskGrade.create({
            TaskInstanceID: ti.TaskInstanceID,
            TaskActivityID: ti.TaskActivityID,
            WorkflowInstanceID: ti.WorkflowInstanceID,
            WorkflowActivityID: ti.WorkflowInstance.WorkflowActivityID,
            AssignmentInstanceID: ti.AssignmentInstanceID,
            SectionUserID: sec_user,
            TADisplayName: ti.TaskActivity.DisplayName,
            WADisplayName: ti.WorkflowInstance.WorkflowActivity.Name,
            Grade: finalGrade.task.FinalGrade,
            TIExtraCredit: ti.ExtraCredit,
            WANumberOfSets: ti.WorkflowInstance.WorkflowActivity.NumberOfSets,
            TIFields: {
                fields: ti.TaskActivity.Fields,
                data: finalGrade.task.Data
            } */
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
                TIExtraCredit: ti.ExtraCredit,
                WANumberOfSets: ti.WorkflowInstance.WorkflowActivity.NumberOfSets,
                WAWeight: WAWeight,
                // 2/15/2021 Adjusting TAGradeWeight for number of problem sets
                //TAGradeWeight: TAGradeWeight,
                TAGradeWeight: AdjustedTAGradeWeight,
                TAGradeWeightInAssignment:TAGradeWeightinAssignment,
                TIScaledGrade: TIScaledGrade,
                //Comments: Comments,
                TIFields: {
                    fields: ti.TaskActivity.Fields,
                    data: finalGrade.task.Data
                }
                }).catch(function(err) {
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

        ////console.log('wi_id', wi_id, 'sec_user', sec_user, 'grade', grade);
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
                }
            });

            //var original = await x.gradeBelongsTo(ti);
            var original_id = ti.ReferencedTask;
            //return [wi.WorkflowActivityID, ti.TaskInstanceID, ti.FinalGrade];
            if (original_id === null || typeof original_id === null) {
                return null;
            } else {
                return {
                    gradeOwnerID: original_id,
                    task: ti
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
        logger.log('info', '/Workflow/Grade/gradeBelongsTo: searching for user... TaskActivityID: ', ti.TaskActivityID);
        var ta = await TaskActivity.find({
            where: {
                TaskActivityID: ti.TaskActivityID
            }
        });

        let field = JSON.parse(ta.Fields);

        if (ta.Type === 'grade_problem') {
            var pre_ti = await TaskInstance.find({
                where: {
                    TaskInstanceID: JSON.parse(ti.PreviousTask)[0].id
                }
            });

            var maxGrade = 0;
            let field = JSON.parse(ta.Fields);

            await Promise.mapSeries(Object.keys(field), async function(val) {
                if (val === 'field_distribution' && val != null) {
                    //check if field type is assessment
                    let distribution = field.field_distribution;
                    await Promise.mapSeries(Object.keys(field.field_distribution), function(val) {
                        maxGrade += distribution[val];
                    });
                }
            });

            logger.log('info', '/Workflow/Grade/gradeBelongsTo: userID found:', pre_ti.UserID);
            return {
                id: pre_ti.TaskInstanceID,
                max_grade: 100
            };
        } else {
            if (ti.PreviousTask === null || typeof ti.PreviousTask === undefined) {
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

    //2/9/2021 Note: wi.task_collection includes needs consolidation tasks; Also, why is that count used in the simple grade weight?
    // fixed this in addSimpleGrade, so don't need this
    //async getAverageSimpleGrade(task_collection) {
    //    var grade = 100;
    //    var length = task_collection.length;
    //    return grade / length;
    //}


    /* original
    async getNumberOfDaysLate(ti) {
        var now = moment();
        var endDate = ti.EndDate;
        var actualEndDate = ti.ActualEndDate;
        now.diff(endDate, 'days');
        return now.diff(endDate, 'days') + 1;
    }
*/

// 1/26/2021 Confirm that we return late+1 instead of late (2/9/2021: NO, just return late); confirm late < 0 instead of late <= 0 (2/9/2021: doesn't matter)
    async getNumberOfDaysLate(ti) {
//        var now = moment();
        var endDate = ti.EndDate;
        var actualEndDate = moment(ti.ActualEndDate);
        var late = actualEndDate.diff(endDate,"days");
        if (late < 0) {
            return 0
        }
        // else {return (late + 1)
        else {
            return late
            }
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
            include: [
                {
                    model: TaskActivity
                },
                {
                    model: TaskSimpleGrade
                }
            ]
        });

        return tis;
    }

    async claimExtraCredit(goal_instance_id, section_user_id) {
        let x = this;
        let record = await SectionUserRecord.find({
            SectionUserID: section_user_id
        });

        if (record.AvailablePoints > 0) {
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

    async getGradeReport(ai_id) {
        //Should make a snapshot table to store all the info to save time when pull grades

        var ai_grade = await AssignmentGrade.findAll({
            where: {
                AssignmentInstanceID: ai_id
            }
        }).catch(function(err) {
            //console.log(err);
        });

        var ai = await AssignmentInstance.findOne({
            where: {
                AssignmentInstanceID: ai_id
            },
            attributes: ['AssignmentID', 'SectionID']
        }).catch(function(err) {
            //console.log(err);
        });

        var assignment = await Assignment.findOne({
            where: {
                AssignmentID: ai.AssignmentID
            },
            attributes: ['GradeDistribution', 'DisplayName', 'CourseID', 'WorkflowActivityIDs']
        }).catch(function(err) {
            //console.log(err);
        });

        var course = await Course.findOne({
            where: {
                CourseID: assignment.CourseID
            },
            attributes: ['Number', 'Name']
        }).catch(function(err) {
            //console.log(err);
        });

        var wi_grade = await WorkflowGrade.findAll({
            where: {
                AssignmentInstanceID: ai_id
            }
        }).catch(function(err) {
            //console.log(err);
        });

        var wa = await WorkflowActivity.findAll({
            where: {
                AssignmentID: ai.AssignmentID
            },
            attributes: ['WorkflowActivityID', 'GradeDistribution', 'TaskActivityCollection']
        }).catch(function(err) {
            //console.log(err);
        });

        var ti_grade = await TaskGrade.findAll({
            where: {
                AssignmentInstanceID: ai_id
            }
        }).catch(function(err) {
            //console.log(err);
        });

        var simple_grade = await TaskSimpleGrade.findAll({
            where: {
                AssignmentInstanceID: ai_id
            }
        }).catch(function(err) {
            console.log(err);
        });

        var ta = await TaskActivity.findAll({
            where: {
                AssignmentID: ai.AssignmentID
            },
            attributes: ['TaskActivityID', 'WorkflowActivityID', 'Type', 'DisplayName', 'RefersToWhichTask', 'SimpleGrade']
        }).catch(function(err) {
            console.log(err);
        });

        let simple_grade_max = {};
        await Promise.mapSeries(ta, task => {
            if (!_.has(simple_grade_max, task.WorkflowActivityID)) {
                simple_grade_max[task.WorkflowActivityID] = 0;
            }

            if (task.SimpleGrade != 'none') {
                simple_grade_max[task.WorkflowActivityID] += 1;
            }
        });

        var sec_users = await SectionUser.findAll({
            where: {
                SectionID: ai.SectionID
            },
            include: {
                model: User
            }
        }).catch(function(err) {
            console.log(err);
        });

        let result = {
            Course: course,
            AssignmentActivity: assignment,
            WorkflowActivity: wa,
            TaskActivity: ta,
            SectionUsers: sec_users,
            Grades: {
                Assignment: ai_grade,
                Workflow: wi_grade,
                Task: ti_grade,
                SimpleGrade: simple_grade,
                SimpleGradeMax: simple_grade_max
            }
        };

        return result;
    }

    async getUserTaskInfoArray(ai_id) {
        let x = this;
        let ai = (await x.getAssginmentInstance(ai_id)) || [];
        let gradableTaskObj = (await x.getGradableTasks(ai.AssignmentID)) || [];
        let wfs = (await x.getWorkflowActivities(ai.AssignmentID)) || [];
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
            extraTimeliness: {},
            extraTimelinessID: [],
            extraQuality: {},
            extraQualityID: [],
 //           gradableTasks: gradableTaskObj.gradableTasks
            gradableTasks: gradableTaskObj.gradableTasks,
// 2/7/2021 Here added new field UTIA.weights for info needed for calculating scaled grades
            weights: []
            // tiAttributes: {}  with findall for AI or maybe only for gradable tasks // add comma to prior item
        };

        var tis =
            (await TaskInstance.findAll({
                where: {
                    AssignmentInstanceID: ai_id,
                    $or: [
                        {
                            TaskActivityID: {
                                $in: gradableTaskObj.gradableTaskKeys
                            }
                        },
                        {
                            ExtraCredit: 1
                        },
                        {
                            TASimpleGrade: {
                                $notLike: 'none'
                            }
                        }
                    ]
                },
                attributes: ['TaskInstanceID', 'TaskActivityID', 'WorkflowInstanceID', 'Status', 'UserID', 'TASimpleGrade', 'ExtraCredit'],
                include: [
                    {
                        model: WorkflowInstance,
                        attributes: ['WorkflowActivityID'],
                        include: [
                            {
                                model: WorkflowActivity,
                                attributes: ['Name', 'GradeDistribution']
                            }
                        ]
                    },
                    {
                        model: TaskActivity,
                        attributes: ['DisplayName']
                    }
                ]
            })) || [];

        await Promise.mapSeries(tis, async ti => {
            var sectUserID = await util.findSectionUserID(ai_id, ti.UserID);
            var isProf = await this.isInstructor(sectUserID);

            if (!UTIA.quality.hasOwnProperty(sectUserID)) {
                UTIA.quality[sectUserID] = [];
            }
            if (!UTIA.timeliness.hasOwnProperty(sectUserID)) {
                UTIA.timeliness[sectUserID] = [];
            }
            if (!UTIA.extraCredit.hasOwnProperty(SectionUser)) {
                UTIA.extraCredit[sectUserID] = [];
            }
            if (!UTIA.extraQuality.hasOwnProperty(sectUserID)) {
                UTIA.extraQuality[sectUserID] = [];
            }
            if (!UTIA.extraTimeliness.hasOwnProperty(sectUserID)) {
                UTIA.extraTimeliness[sectUserID] = [];
            }

            if (!isProf) {
                if (!_.contains(UTIA.userIDs, ti.UserID) && ti.ExtraCredit == 0) {
                    let user = await UserContact.find({
                        where: {
                            UserID: ti.UserID
                        },
                        attributes: ['UserID', 'FirstName', 'LastName', 'Email']
                    });
                    UTIA.users.push({
                        sectionUserID: sectUserID,
                        user: user
                    });
                    UTIA.userIDs.push(ti.UserID);
                }

                if (gradableTaskObj.gradableTasks.hasOwnProperty(ti.TaskActivityID) && ti.ExtraCredit == 0) {
// 2/15/2021 Don't include bypassed or cancelled tasks
                let ti_status = JSON.parse(ti.Status);
                if (ti_status[1] !== 'cancelled' && ti_status[0] !== 'bypassed') {
                    UTIA.quality[sectUserID].push(ti);
                    UTIA.qualityID.push(ti.TaskInstanceID);
// 2/7/2021 Here push all info needed for calculating scaled grades to UTIA.weights   
// 2/15/2021 Note: TAGradeWeight now has been adjusted for the number of problem sets
                    let taskWeights = await TaskGrade.find({
                        where: {
                            TaskInstanceID: ti.TaskInstanceID
                        },
                        attributes: ['WANumberOfSets', 'WAWeight', 'TAGradeWeight', 'TAGradeWeightInAssignment']
                    });
                    if (taskWeights !== null) {
                        UTIA.weights.push({
                            TaskInstanceID: ti.TaskInstanceID,
                            taskWeights
                        })
                    };

/*                 
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
                TIExtraCredit: ti.ExtraCredit,
                WANumberOfSets: ti.WorkflowInstance.WorkflowActivity.NumberOfSets,
                WAWeight: WAWeight,
                TAGradeWeight: TAGradeWeight,
                TAGradeWeightInAssignment:TAGradeWeightinAssignment,
                TIScaledGrade: TIScaledGrade,                    
                */

                }
            }

// 2/11/2021 Don't include bypassed or cancelled tasks
                let ti_status = JSON.parse(ti.Status);
                if (ti_status[1] !== 'cancelled' && ti_status[0] !== 'bypassed') {
                    if (ti.TASimpleGrade !== 'none' && ti.ExtraCredit == 0) {
                        UTIA.timeliness[sectUserID].push(ti);
                        UTIA.timelinessID.push(ti.TaskInstanceID);
                    }
                    if (ti.ExtraCredit == 1) {
                        UTIA.extraCredit[sectUserID].push(ti);
                        UTIA.extraCreditID.push(ti.TaskInstanceID);
                    }
                    if (ti.ExtraCredit == 1 && gradableTaskObj.gradableTasks.hasOwnProperty(ti.TaskActivityID)) {
                        UTIA.extraQuality[sectUserID].push(ti);
                        UTIA.extraQualityID.push(ti.TaskInstanceID);
    // 2/7/2021 Here push all info needed for calculating scaled grades to UTIA.weights                    
                    }

                    if (ti.ExtraCredit == 1 && ti.TASimpleGrade !== 'none') {
                        UTIA.extraTimeliness[sectUserID].push(ti);
                        UTIA.extraTimelinessID.push(ti.TaskInstanceID);
                    }
                }
            }
        });

        console.log('quality: ', UTIA.qualityID);
        console.log('timeliness: ', UTIA.timelinessID);
        console.log('extra quality', UTIA.extraQualityID);
        console.log('extra timeliness', UTIA.extraTimelinessID);
        console.log('extra credit: ', UTIA.extraCreditID);
        console.log('users: ', UTIA.userIDs);
        return UTIA;
    }

    async isInstructor(sectUserID) {
        var secUser = await SectionUser.find({
            where: {
                SectionUserID: sectUserID
            },
            attributes: ['Role']
        });

        if (secUser.Role === 'Instructor') {
            return true;
        } else {
            return false;
        }
    }

    async getAssginmentInstance(ai_id) {
        let ai = await AssignmentInstance.find({
            where: {
                AssignmentInstanceID: ai_id
            },
            attributes: ['AssignmentID', 'SectionID', 'DisplayName'],
            include: [
                {
                    model: Assignment,
                    attributes: ['GradeDistribution']
                }
            ]
        });

        return ai;
    }

    async getWorkflowActivities(a_id) {
        let wfs = await WorkflowActivity.findAll({
            where: {
                AssignmentID: a_id
            },
            attributes: ['WorkflowActivityID', 'Name', 'NumberOfSets', 'GradeDistribution', 'TaskActivityCollection']
        });

        return wfs;
    }

    //{ '1': [ 3, 5, 7 ], '8': [ 9, 11, 13 ] }
    //{ 'Gradable TaskActivityID': [ Potential Final Grade TaskActivityIDs ] }
    async getGradableTasks(a_id) {
        let gradableTasks = {};
        let gradableTasksKeys = [];
        var tas = await TaskActivity.findAll({
            where: {
                AssignmentID: a_id
            },
            attributes: ['TaskActivityID', 'RefersToWhichTask', 'Type']
        });

        await Promise.mapSeries(tas, ta => {
            if (ta.RefersToWhichTask !== null) {
                if (!gradableTasks.hasOwnProperty(ta.RefersToWhichTask)) {
                    gradableTasks[ta.RefersToWhichTask] = [];
                    gradableTasksKeys.push(ta.RefersToWhichTask);
                }
                if (ta.Type === 'grade_problem' || ta.Type === 'consolidation' || ta.Type === 'resolve_dispute') {
 // 1/26/2021 Possibly add needs_consolidation
                    gradableTasks[ta.RefersToWhichTask].push(ta.TaskActivityID);
                }
            }
        });

        console.log(gradableTasks);

        return {
            gradableTasks: gradableTasks,
            gradableTaskKeys: gradableTasksKeys
        };
    }

    async getAssignmentGradeReport(ai_id) {
        let x = this;
        let UTIA = await x.getUserTaskInfoArray(ai_id);
        let userContacts = UTIA.users || [];
        let gradeReport = {
            assignmentName: UTIA.ai_name || 'Not Found'
        };

        await Promise.mapSeries(userContacts, async userContact => {
            let a_grade = (await x.getAssignmentGrade(ai_id, userContact.sectionUserID)) || 0;
            let workflowGradeReport =
                (await x.getWorkflowGradeReport(UTIA, {
                    sectionUserID: userContact.sectionUserID,
                    userID: userContact.user.UserID
                })) || [];
            let assignmentExtraCreditReport =
                (await x.getAssignmentExtraCreditReport(UTIA, {
                    sectionUserID: userContact.sectionUserID,
                    userID: userContact.user.UserID
                })) || [];
            let numOfExtraCredit =
                (await x.getNumOfExtraCreditReport(UTIA, {
                    sectionUserID: userContact.sectionUserID,
                    userID: userContact.user.UserID
                })) || 0;

            if (a_grade !== null || a_grade !== null) {
                a_grade = a_grade.Grade;
            } else {
                a_grade = 'not yet completed';
            }

            gradeReport[userContact.sectionUserID] = {
                UserID: userContact.user.UserID,
                firstName: userContact.user.FirstName,
                lastName: userContact.user.LastName,
                email: userContact.user.Email,
                assignmentGrade: a_grade,
                workflowGradeReport: workflowGradeReport,
                assignmentExtraCreditReport: assignmentExtraCreditReport,
                numOfExtraCredit: numOfExtraCredit
            };
        });

        return gradeReport;
    }

    async getWorkflowGradeReport(UTIA, user) {
        let x = this;
        let workflowGradeReport = {};

        await Promise.mapSeries(UTIA.workflows, async wf => {
            let w_grade = await x.getWorkflowGrade(UTIA.ai_id, user.sectionUserID, wf.WorkflowActivityID);
            let problemAndTimelinessGrade = await x.getProblemAndTimelinessGradeReport(UTIA, user, wf);
            // 2/8/2021  fix scaled grade; can't use UTIA.weights since no ti
            let wfScaledGrade = '-';

            if (w_grade === null || w_grade === undefined) {
                w_grade = 'not yet complete';
 
            } else {
                w_grade = w_grade.Grade;
            // 2/8/2021  fix scaled grade; can't use UTIA.weights since no ti
            wfScaledGrade = (w_grade * UTIA.wf_grade_distribution[wf.WorkflowActivityID]) / 100;
            }

            workflowGradeReport[wf.WorkflowActivityID] = {
                name: wf.Name,
                workflowActivityID: wf.WorkflowActivityID,
                numberOfSets: wf.NumberOfSets,
                weight: UTIA.wf_grade_distribution[wf.WorkflowActivityID],
                workflowGrade: w_grade,
                // scaledGrade: '-',
                scaledGrade: wfScaledGrade,
               problemAndTimelinessGrade: problemAndTimelinessGrade
            };
        });

        return workflowGradeReport;
    }

    async getProblemAndTimelinessGradeReport(UTIA, user, wf) {
        let x = this;
        let problemAndTimelinessGrade = {};
        let WAWeight = UTIA.wf_grade_distribution[wf.WorkflowActivityID];
        
        await Promise.mapSeries(UTIA.quality[user.sectionUserID], async ti => {
            console.log('ti_id ', ti.TaskInstanceID, ' sect user id', user.sectionUserID);
            let t_grade = await x.getTaskGrade(ti.TaskInstanceID);
            let taskGradeFields = await x.getTaskGradeFieldsReport(UTIA, user, ti);

            //need routine to add number of steps
            //let ptgrNumberOfSteps = await x.getNumberOfSteps(UTIA, ti);
            //need routine to calculate weightInAssignment
            //let ptgrWeightInAssignment = await x.getWeightInAssignment(UTIA,ti);

            /* 1/27/2021 probably not needed here if we can get the data into the TaskGrade database instead.
            //Now calculate weightInProblem, weightInAssignment, taskGrade, scaledGrade
             // Prepping the following does not seem to do anything when executed; doesn't show up in DB or report
            var WIID = ti.WorkflowInstance.WorkflowActivityID;
            var TAID = ti.TaskActivityID;

            var WAWeight = ti.TaskActivityID.Assignment.GradeDistribution.WIID;
            var TAGradeWeight = ti.WorkflowInstance.WorkflowActivity.GradeDistribution.TAID;
            var TAGradeWeightinAssignment = (TAGradeWeight * WAWeight)/ ti.WorkflowInstance.WorkflowActivity.NumberOfSets;
            //   may need to just use ti.FinalGrade
            var TIScaledGrade = finalGrade.task.FinalGrade * TAGradeWeightinAssignment;
*/

             
            if (wf.WorkflowActivityID === ti.WorkflowInstance.WorkflowActivityID) {
                let problemQualityWeight = JSON.parse(wf.GradeDistribution)[ti.TaskActivityID];
                //let assignmentQualityWeight = ((WAWeight * problemQualityWeight) / ti.WorkflowInstance.WorkflowActivity.NumberOfSets) / 100;
                let assignmentQualityWeight = ((WAWeight * problemQualityWeight) / wf.NumberOfSets) / 100;

                // 2/15/2021 Added ScaledWIGrade
                let scaledWIGrade = (t_grade.TIScaledGrade / WAWeight) * 100;

                problemAndTimelinessGrade[ti.TaskInstanceID] = {
                    name: ti.TaskActivity.DisplayName,
                    taskInstanceID: ti.TaskInstanceID,
                    workflowInstanceID: ti.WorkflowInstanceID,
                    workflowName: wf.Name,
                    
                    // 2/15/2021: Adjusted weightInProblem for #sets; changed weightInAssignment to fullWeightInAssignment and added weightInAssignment 
                    //weightInProblem: JSON.parse(wf.GradeDistribution)[ti.TaskActivityID] || '-',
                    //weightInProblem: problemQualityWeight || '-',
                    weightInProblem: t_grade.TAGradeWeight || '-',
                    weightInAssignment: t_grade.WAWeight || '-',
                    fullWeightInAssignment: assignmentQualityWeight || '-',
                    taskGrade: t_grade.Grade || 'not yet complete',
                    // 2/15/2021 Add weighted WA grade
                    scaledWIGrade: scaledWIGrade  || '-',
                    scaledGrade: t_grade.TIScaledGrade || '-',
                    taskGradeFields: taskGradeFields || {}
                };
            }
        });

        // 2/10/2021 Updated to only count tasks in the current workflow
        // 2/15/2021 Updated further to only count tasks in UTIA.timelinessID (thus passing UTIA as parameter)
        let t_simple_grades_count = await x.getTaskSimpleGradeCount(UTIA, UTIA.ai_id, user.sectionUserID, wf.WorkflowActivityID);
        //let t_simple_grades_count = await x.getTaskSimpleGradeCount(UTIA.ai_id, user.sectionUserID, wf.WorkflowActivityID);
        //let t_simple_grades_count = await x.getTaskSimpleGradeCount(UTIA.ai_id, user.sectionUserID);
        let timelinessGradeDetailsReport = await x.getTimelinessGradeDetailsReport(UTIA, user, wf);
        let timelinessGradeDetails = timelinessGradeDetailsReport.timelinessGradeDetails;
        let simpleGradeCount = timelinessGradeDetailsReport.simpleGradeCount;
        // 2/15/2021 capture the timelinessGradeTotal, completedTaskCount, startedTaskCount, unstartedTaskCount
        let completedTaskCount = timelinessGradeDetailsReport.completedTaskCount;
        let startedTaskCount = timelinessGradeDetailsReport.startedTaskCount;
        let unstartedTaskCount = simpleGradeCount - completedTaskCount - startedTaskCount;
        let timelinessGradeTotal = timelinessGradeDetailsReport.timelinessGradeTotal;

        //let WAWeight = UTIA.wf_grade_distribution[wf.WorkflowActivityID];
        //let WAWeight = JSON.parse(wf.AssignmentID.GradeDistribution)[ti.WorkflowInstance.WorkflowActivityID];
        let problemWeight = JSON.parse(wf.GradeDistribution)['simple'];
        //let assignmentWeight = (WAWeight * problemWeight)/ ti.WorkflowInstance.WorkflowActivity.NumberOfSets;
        // 1/28/2021 I don't believe number of sets affects simplegrade weight, but please confirm
        // 2/9/2021 I now believe number of sets affects assignment weight; also should add number of WAWeight, timelinessMaxiumumGrade (see XL) and #problem sets to timelinessgrade attributes
        let assignmentWeight = (WAWeight * problemWeight)/100;
   
  // 2/15/2021 determine scaledGrade
  // 2/15/2021 Note new way of timeliness grading - only include completed + started tasks, but not unstarted tasks
        let gradeTotal = timelinessGradeTotal / (completedTaskCount + startedTaskCount);
        let scaledGradeInWA = (gradeTotal * problemWeight) / 100;
        let scaledGradeInAssignment = (gradeTotal * assignmentWeight) / 100;
    // 2/16/2021 determine scaledWeightInAssignment, but on second thought, don't push into timelinessGradeDetailsReport
        //let scaledWeightInAssignment = assignmentWeight / (completedTaskCount + startedTaskCount);
    // 2/16/2021 determine scaledWeightInWA
        //let scaledWeightInWA = problemWeight / (completedTaskCount + startedTaskCount);
    // timelinessGradeDetails.scaledWeightInAssignment = scaledWeightInAssignment;

    // 2/16/2021  Adding timelinessStatistics for end of timelinessGradeDetailsReport
        let timelinessStatistics = {};    
        timelinessStatistics['timelinessStatistics'] = {
            gradeSummation: timelinessGradeTotal,
            completedTaskCount: completedTaskCount,
            startedTaskCount: startedTaskCount,
            adjustedTimelinessGrade: gradeTotal
        };
        
        console.log("PTG-timeliness: WID", wf.WorkflowActivityID, "WAWeight", WAWeight, "problemWeight", problemWeight, "assignmentWeight", assignmentWeight, 
        //        "scaledWeightInWA", scaledWeightInWA, "scaledWeightInAssignment", scaledWeightInAssignment, 
                "gradeTotal", gradeTotal, "timelinessGradeTotal", timelinessGradeTotal,"ScaledGrade", scaledGradeInAssignment);
 
        
        problemAndTimelinessGrade['timelinessGrade'] = {
            workflowName: wf.Name,
         //   weightInProblem: JSON.parse(wf.GradeDistribution)['simple'] || '-',
         //   weightInAssignment: '-',
            simpleGradeWeightInProblem: problemWeight || '-',
            problemWeightInAssignment: WAWeight || '-',
            adjustedTimelinessGradeFromPTGDR: gradeTotal,
            // weightInAssignment: assignmentWeight || '-',
            taskSimpleGrade: t_simple_grades_count + ' out of ' + simpleGradeCount + ' complete',
        // 2/15/2021 return completedTaskCount, startedTaskCount, unstartedTaskCount, , scaledGradeinWA, scaledGradeinAssignment
        // 22/16/2021 return scaledWeightInWA, scaledWeightInAssignment (for each timeliness task), gradeTotal
            //gradeSummation: gradeTotal,    
            //scaledWeightInWA: scaledWeightInWA,    
            //scaledWeightInAssignment: scaledWeightInAssignment,
            completedTaskCount: completedTaskCount,
            startedTaskCount: startedTaskCount,
            unstartedTaskCount: unstartedTaskCount,
            scaledGradeInWA: scaledGradeInWA || '-',
            scaledGrade: scaledGradeInAssignment || '-',
            //scaledGrade: '-',
            timelinessGradeDetails: timelinessGradeDetails,
        // 2/16/2021 Added timelinessStatistics
            timelinessStatistics: timelinessStatistics
        };

        return problemAndTimelinessGrade;
    }
/*  playing around...
    async getNumberOfSteps(UTIA, ti) {
            //weight: UTIA.wf_grade_distribution[wf.WorkflowActivityID],
        let sets = UTIA.workflows.NumberOfSets;
        return sets;
    }

    async getWeightInAssignment(UTIA,ti) {
        // add gradableTIInfo to UTIA, just for the Gradable tasks (see that array); FINDALL TIs for TA, and extract attributes we want
        // i.e., TA, WA, whether it's subworkflow is complete, and the latest grade and its task (look for "consolidate/ion in this file")


        let ta = //function to get TA

        var firstTask = await TaskInstance.findOne({
            where: {
                TaskInstanceID: taskCollection[0]
            },
            attributes: ["TaskInstanceID", "Data"]
        });

        var tis =
        (await TaskInstance.findAll({
            where: {
                AssignmentInstanceID: ai_id,
                $or: [
                    {
                        TaskActivityID: {
                            $in: gradableTaskObj.gradableTaskKeys
                        }
                    },
                    {
                        ExtraCredit: 1
                    },
                    {
                        TASimpleGrade: {
                            $notLike: 'none'
                        }
                    }
                ]
            },
            attributes: ['TaskInstanceID', 'TaskActivityID', 'WorkflowInstanceID', 'Status', 'UserID', 'TASimpleGrade', 'ExtraCredit'],
            include: [
                {
                    model: WorkflowInstance,
                    attributes: ['WorkflowActivityID'],
                    include: [
                        {
                            model: WorkflowActivity,
                            attributes: ['Name', 'GradeDistribution']
                        }
                    ]
                },
                {
                    model: TaskActivity,
                    attributes: ['DisplayName']
                }
            ]
        })) || [];

        let sets = UTIA.workflows.NumberOfSets;
        let wfGradeDistribution = UTIA.workflows.GradeDistribution;  //From here extract TI's-TA

    }
*/
    async getAssignmentExtraCreditReport(UTIA, user) {
        let x = this;
        let assignmentExtraCreditReport = {};

        if (!UTIA.extraQuality.hasOwnProperty(user.sectionUserID)) {
            return;
        }

        await Promise.mapSeries(UTIA.extraQuality[user.sectionUserID], async ti => {
            let t_grade = await x.getTaskGrade(ti.TaskInstanceID);
            let taskGradeFields = await x.getTaskGradeFieldsReport(UTIA, user, ti);

            assignmentExtraCreditReport[ti.TaskInstanceID] = {
                name: ti.TaskActivity.DisplayName,
                taskInstanceID: ti.TaskInstanceID,
                workflowInstanceID: ti.WorkflowInstanceID,
                workflowName: ti.WorkflowInstance.WorkflowActivity.Name,
                weightInProblem: JSON.parse(ti.WorkflowInstance.WorkflowActivity.GradeDistribution)[ti.TaskActivityID] || '-',
                weightInAssignment: t_grade.TAGradeWeightInAssignment || '-',
                taskGrade: t_grade.Grade || 'not yet complete',
                scaledGrade: t_grade.TIScaledGrade || '-',
                taskGradeFields: taskGradeFields || {}
            };
        });

        let timelinessGradeDetailsReport = await x.getExtraCreditTimelinessGradeDetailsReport(UTIA, user);
        let timelinessGradeDetails = timelinessGradeDetailsReport.timelinessGradeDetails;
        let simpleGrade = timelinessGradeDetailsReport.simpleGradeCount;

        assignmentExtraCreditReport['timelinessGrade'] = {
            workflowName: 'Entire Assignment',
            grade: simpleGrade,
            weightInProblem: 'n/a',
            weightInAssignment: 'n/a',
            scaledGrade: 'n/a',
            timelinessGradeDetails: timelinessGradeDetails
        };

        return assignmentExtraCreditReport;
    }

    async getTaskGradeFieldsReport(UTIA, user, ti) {
        let x = this;
        let taskGradeFields = {};

        let resolveDispute = await TaskInstance.find({
            where: {
                ReferencedTask: ti.TaskInstanceID,
                TAType: 'resolve_dispute'
            },
            include: {
                model: TaskActivity,
                attributes: ['Fields']
            }
        });

        if (resolveDispute !== null && resolveDispute !== undefined && resolveDispute.FinalGrade !== null) {
            console.log('here resolve');
            taskGradeFields[resolveDispute.TaskInstanceID] = await this.getTaskGradeFields(resolveDispute);
            return taskGradeFields;
        }

        let consolidation = await TaskInstance.find({
            where: {
                ReferencedTask: ti.TaskInstanceID,
                TAType: 'consolidation'
            },
            include: {
                model: TaskActivity,
                attributes: ['Fields']
            }
        });

        if (consolidation !== null && consolidation !== undefined && consolidation.FinalGrade !== null) {
            console.log('here consolidate');
            taskGradeFields[consolidation.TaskInstanceID] = await this.getTaskGradeFields(consolidation);
            return taskGradeFields;
        }

        let grades = await TaskInstance.findAll({
            where: {
                ReferencedTask: ti.TaskInstanceID,
                TAType: 'grade_problem'
            },
            include: {
                model: TaskActivity,
                attributes: ['Fields']
            }
        });

        if (grades !== null && grades !== undefined) {
            await Promise.mapSeries(grades, async grade => {
                if (grade.FinalGrade !== null) {
                    taskGradeFields[grade.TaskInstanceID] = await this.getTaskGradeFields(grade);
                }
            });
        }

        return taskGradeFields;
    }

    async getTaskGradeFields(task) {
        if (task.Data === null) {
            //console.log('ERROR!: No data from resolve dispute!');
            return {};
        }

        var taskGradeFields = {};
        var data = JSON.parse(task.Data)[JSON.parse(task.Data).length - 1];
        var fields = JSON.parse(task.TaskActivity.Fields);
        var keys = Object.keys(fields);
        await Promise.mapSeries(keys, async key => {
            if (key !== 'field_titles' && key !== 'number_of_fields' && key !== 'field_distribution') {
                var type = '-';
                var name = '-';
                var value = '-';
                var max = '-';
                var weight = '-';
                var scaledGrade = '-';
                var labelPosition = '-';
                var labelMaxValue = '-';
                var labelNumericValue = '-';
// 2/8/2021 Adding fieldScaledGrade and all calculations for it below, as well as convertedNumericValue
                var fieldScaledGrade = '-';
                var convertedNumericValue = '-';


                if (fields[key].field_type === 'assessment') {
                    name = fields[key].title;
                    value = data[key][0];
                    weight = fields.field_distribution[key];
                    switch (fields[key].assessment_type) {
                    case 'grade':
                        type = 'Numeric';
                        max = fields[key].numeric_max;
                        fieldScaledGrade = value/max * weight;
                        convertedNumericValue = value/max * 100;
                        break;
                    case 'pass':
                        type = 'Pass/Fail';
                        max = 1;
                        if (value == "pass") {
                            fieldScaledGrade = max * weight;
                            convertedNumericValue = 100;
                        }
                        else {
                            fieldScaledGrade = 0;
                            convertedNumericValue = 0;
                        }
                        break;
                    case 'rating':
                        type = 'Rating';
                        max = fields[key].rating_max;
                        fieldScaledGrade = value/max * weight;
                        convertedNumericValue = value/max * 100;
                        break;
                    case 'evaluation':
                        type = 'Label';
                        max = fields[key].list_of_labels.length;
                        labelMaxValue = fields[key].list_of_labels[max-1];
                        labelPosition = fields[key].list_of_labels.indexOf(value) + 1;
// 2/7/2021 Changed labels so first label (0th) has the grade/labelNumericValue = zero, and to allow a single label
//                        labelNumericValue = labelPosition / max * 100;
                        if (max == 1) {
                            labelNumericValue = 100;
                        }
                        else {
                            labelNumericValue = (labelPosition - 1) / (max - 1) * 100;
                        }
                        // max = 100;
                        fieldScaledGrade = (labelNumericValue * weight) / 100; 
                        convertedNumericValue = labelNumericValue;
                        break;
                    default:
                        type = '-';
                        max = '-';
                    }
                }

                if (fields[key].field_type === 'assessment' && fields[key].assessment_type === 'evaluation') {
                    taskGradeFields[key] = {
                        type: type,
                        name: name,
                        value: value,
                        max: max,
                        weight: weight,
                        //scaledGrade: scaledGrade,
                        convertedNumericValue: convertedNumericValue,
                        scaledGrade: fieldScaledGrade,
                        labelNumericValue: labelNumericValue,
                        labelPosition: labelPosition,
                        labelMaxValue: labelMaxValue
                    }
                } else {
                        taskGradeFields[key] = {
                        type: type,
                        name: name,
                        value: value,
                        max: max,
                        weight: weight,
                        convertedNumericValue: convertedNumericValue,
                        //scaledGrade: scaledGrade
                        scaledGrade: fieldScaledGrade
                    };
                }
            }
        });

        // //console.log('tgf2', taskGradeFields)

        return taskGradeFields;
    }

    async getTimelinessGradeDetailsReport(UTIA, user, wf) {
        let x = this;
        let simpleGradeCount = 0;
        let timelinessGradeDetails = {};
        // 2/15/2021 capture the timelinessGradeTotal, completedTaskCount, startedTaskCount
        let completedTaskCount = 0;
        let startedTaskCount = 0;
        var timelinessGradeTotal = 0;

        if (!UTIA.timeliness.hasOwnProperty(user.sectionUserID)) {
            return {
                timelinessGradeDetails: timelinessGradeDetails,
                // 2/15/2021 also return timelinessGradeTotal, completedTaskCount, startedTaskCount
                timelinessGradeTotal: timelinessGradeTotal,
                completedTaskCount: completedTaskCount,
                startedTaskCount: startedTaskCount,
                simpleGradeCount: simpleGradeCount
            };
        }

        // 2/10/2021  Extend WAID "if" span for entire routine, so timelinessGradeDetails only contains tasks from this WAID
        // ****** may need to extend so it doesn't count extra credit, cancelled or bypassed tasks
        await Promise.mapSeries(UTIA.timeliness[user.sectionUserID], async ti => {
            if (wf.WorkflowActivityID === ti.WorkflowInstance.WorkflowActivityID) {
                simpleGradeCount++;
        // 2/10/2021 moving endbracket, tabbed content over one tab
        //    }

        // 2/15/2021 separating out status to use later
                let status = JSON.parse(ti.Status)[0];

                let timelinessGrade = await x.getTaskSimpleGrade(ti.TaskInstanceID);

                if (timelinessGrade === null || typeof timelinessGrade === undefined || timelinessGrade === undefined) {
                    timelinessGradeDetails[ti.TaskInstanceID] = {
                        name: ti.TaskActivity.DisplayName,
                        status: status,
                        //status: JSON.parse(ti.Status)[0],
                        daysLate: '-',
                        penalty: '-',
                        totalPenalty: '-',
                        grade: '-'
                    };
                } else {
                    let totalPenalty = timelinessGrade.DaysLate * timelinessGrade.DailyPenalty;

                    if (totalPenalty > 100) {
                        totalPenalty = 100;
                    }
                    
                    // 2/15/2021 using grade calcluated here instead of from TaskSimpleGrade database
                    let grade = 100 - totalPenalty;

                    timelinessGradeDetails[ti.TaskInstanceID] = {
                        name: ti.TaskActivity.DisplayName,
                        status: status,
                        //status: JSON.parse(ti.Status)[0],
                        daysLate: timelinessGrade.DaysLate,
                        penalty: timelinessGrade.DailyPenalty,
                        totalPenalty: totalPenalty,
                        // 2/15/2021 using grade calcluated here instead of from TaskSimpleGrade database
                        grade: grade
                        // grade: timelinessGrade.Grade
                    };
                    // 2/15/2021 also calculate timelinessGradeTotal, completedTaskCount, startedTaskCount
                    if (status == 'complete') {
                        completedTaskCount++;
                        timelinessGradeTotal += grade;
                    }
                    if (status == 'started') {
                        startedTaskCount++;
                    }
                    //console.log("getTimelinessGradeDetailsReport: ti, grade, status,timelinessGradeTotal, startedTaskCount, completedTaskCount", 
                    //  ti.TaskInstanceID, grade, status,timelinessGradeTotal, startedTaskCount, completedTaskCount);                
                }
                
        // 2/10/2021 moved endbracket here
            }
        });

        return {
            timelinessGradeDetails: timelinessGradeDetails,
            // also return timelinessGradeTotal, completedTaskCount, startedTaskCount
            timelinessGradeTotal: timelinessGradeTotal,
            completedTaskCount: completedTaskCount,
            startedTaskCount: startedTaskCount,
            simpleGradeCount: simpleGradeCount
        };
    }

    async getExtraCreditTimelinessGradeDetailsReport(UTIA, user) {
        let x = this;
        let simpleGradeCount = 0;
        let timelinessGradeDetails = {};

        if (!UTIA.extraTimeliness.hasOwnProperty(user.sectionUserID)) {
            return {
                timelinessGradeDetails: timelinessGradeDetails,
                simpleGradeCount: simpleGradeCount
            };
        }

        await Promise.mapSeries(UTIA.extraTimeliness[user.sectionUserID], async ti => {
            let timelinessGrade = await x.getTaskSimpleGrade(ti.TaskInstanceID);

            if (timelinessGrade === null || typeof timelinessGrade === undefined || timelinessGrade === undefined) {
                timelinessGradeDetails[ti.TaskInstanceID] = {
                    workflowName: ti.WorkflowInstance.WorkflowActivity.Name,
                    name: ti.TaskActivity.DisplayName,
                    status: JSON.parse(ti.Status)[0],
                    daysLate: '-',
                    penalty: '-',
                    grade: '-'
                };
            } else {
                if (JSON.parse(ti.Status)[0] == 'complete') {
                    simpleGradeCount++;
                }
                timelinessGradeDetails[ti.TaskInstanceID] = {
                    workflowName: ti.WorkflowInstance.WorkflowActivity.Name,
                    name: ti.TaskActivity.DisplayName,
                    status: JSON.parse(ti.Status)[0],
                    daysLate: timelinessGrade.DaysLate,
                    penalty: timelinessGrade.DailyPenalty,
                    grade: timelinessGrade.Grade
                };
            }
        });

        return {
            timelinessGradeDetails: timelinessGradeDetails,
            simpleGradeCount: simpleGradeCount
        };
    }

    async getNumOfExtraCreditReport(UTIA, user) {
        let x = this;
        let getNumOfExtraCreditReport = {};

        if (!UTIA.extraCredit.hasOwnProperty(user.sectionUserID)) {
            return;
        }

        await Promise.mapSeries(UTIA.extraCredit[user.sectionUserID], async ti => {
            let t_grade = await x.getTaskGrade(ti.TaskInstanceID);
            let timelinessGrade = await x.getTaskSimpleGrade(ti.TaskInstanceID);

            if (_.isEmpty(t_grade)) {
                t_grade = '-';
            }

            if (_.isEmpty(timelinessGrade)) {
                timelinessGrade = '-';
            }

            if (ti.TASimpleGrade === 'none') {
                timelinessGrade = 'n/a';
            }

            getNumOfExtraCreditReport[ti.TaskInstanceID] = {
                workflowName: ti.WorkflowInstance.WorkflowActivity.Name,
                workflowInstanceID: ti.WorkflowActivityID,
                name: ti.TaskActivity.DisplayName,
                taskInstanceID: ti.TaskInstanceID,
                taskGrade: t_grade,
                timelinessGrade: timelinessGrade
            };
        });

        return getNumOfExtraCreditReport;
    }

    async getAssignmentGrade(ai_id, sectUserID) {
        let a_grade = await AssignmentGrade.find({
            where: {
                AssignmentInstanceID: ai_id,
                SectionUserID: sectUserID
            }
        });

        return a_grade;
    }

    async getWorkflowGrade(ai_id, sectUserID, wa_id) {
        let w_grade = await WorkflowGrade.findOne({
            where: {
                AssignmentInstanceID: ai_id,
                SectionUserID: sectUserID,
                WorkflowActivityID: wa_id
            }
        });

        return w_grade;
    }

    async getTaskGrade(ti_id) {
        let t_grade = await TaskGrade.find({
            where: {
                TaskInstanceID: ti_id
            }
        });

        return t_grade || {};
    }
/*
    async getTaskSimpleGradeCount(ai_id, sectUserID) {
        let t_simple_grades = await TaskSimpleGrade.count({
            where: {
                AssignmentInstanceID: ai_id,
                SectionUserID: sectUserID
            }
        });

        return t_simple_grades;
    }

// 2/10/2021 Updated to only count tasks in the current workflow
    async getTaskSimpleGradeCount(ai_id, sectUserID,wa_id) {
        let t_simple_grades = await TaskSimpleGrade.count({
            where: {
                AssignmentInstanceID: ai_id,
                WorkflowActivityID: wa_id,
                SectionUserID: sectUserID
            }
        });

        return t_simple_grades;
    }
*/



// 2/10/2021 Updated to only count tasks in the current workflow
// 2/15/2021 Updated further to only count tasks in UTIA.timelinessID list
    async getTaskSimpleGradeCount(UTIA, ai_id, sectUserID,wa_id) {
        let t_simple_grades = await TaskSimpleGrade.count({
            where: {
                AssignmentInstanceID: ai_id,
                WorkflowActivityID: wa_id,
                SectionUserID: sectUserID,
                TaskInstanceID: {
                                $in: UTIA.timelinessID
                            }
            }
        });

        return t_simple_grades;
    }


    async getTaskSimpleGrade(ti_id) {
        let timelinessGrade = await TaskSimpleGrade.find({
            where: {
                TaskInstanceID: ti_id
            }
        });

        return timelinessGrade || {};
    }
}

module.exports = Grade;
