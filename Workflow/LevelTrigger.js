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

let Promise = require('bluebird');
let Grade = require('./Grade.js');
const logger = require('./Logger.js');


let grade = new Grade();

class LevelTrigger {
    async addExp(exp, section_userid) {
        let x = this;
        let record = await SectionUserRecord.find({
            where: {
                SectionUserID: section_userid
            }
        });

        let total = record.Exp + parseInt(exp);
        
        if (record.Level !== 10) {
            if (total >= record.ThresholdPoints) {
                await x.levelUp(record, total);
            } else {
                await record.update({
                    Exp: total
                });
            }
        } else {
            logger.log('info', '/Workflow/LevelTrigger/addExp: Maximum level reached.')
        }

    }

    //Increases a level and update data
    async levelUp(record, exp) {

        var new_level = record.Level + 1;
        var new_exp = exp - record.ThresholdPoints;
        var class_point = record.AvailablePoints;
        var plus_point = 0;

        if ((new_level % 2) === 0) {
            class_point = class_point + 1;
        }
        if (((new_level % 2)-1) === 0) {
            plus_point = 1;
        }

        var level_instances = await LevelInstance.findAll({
            where: {
                SectionID: record.SectionID
            }
        });
        var level = await Level.find({
            where: {
                LevelID: new_level
            }
        });

        //updates the SectionUserRecord with new level, experience, threshold points, and available CLASS points
        await Promise.mapSeries(level_instances, async function (li) {
            if (li.LevelID === new_level) {
                await record.update({
                    Level: new_level,
                    LevelInstanceID: li.LevelInstanceID,
                    ThresholdPoints: li.ThresholdPoints,
                    Exp: new_exp,
                    AvailablePoints: class_point,
                    Title: level.Name,
                    PlusPoint: plus_point
                });
            }
        });
    }

    async createSectionUserRecord(section_userid) {

        var goal_progression = {};
        let sec_user = await SectionUser.find({
            where: {
                SectionUserID: section_userid
            }
        });
        let level_instance = await LevelInstance.find({
            where: {
                SectionID: sec_user.SectionID,
                LevelID:1
            }
        });
        let level = await Level.find({
            where:{
                LevelID:1
            }
        });
        let goal_instances = await GoalInstance.findAll({
            where: {
                SectionID: sec_user.SectionID
            },
            include:[{
                model: Goal 
            }]
        });

        await Promise.mapSeries(goal_instances, async function (goal) {
            let user_point = await UserPointInstances.find({
                where: {
                    UserID: sec_user.UserID,
                    CategoryInstanceID: goal.CategoryInstanceID
                }
            });

            goal_progression[goal.GoalInstanceID] = {
                'UserPointInstanceID': user_point.UserPointInstanceID,
                'Name': goal.Goal.Name,
                'Description': goal.Goal.Description,
                'Logo': goal.Goal.Logo,
                'LogoAchieved': goal.Goal.LogoAchieved,
                'Points': user_point.PointInstances,
                'Threshold' : goal.ThresholdInstances,
                'Claim': false
            };
        });

        await SectionUserRecord.create({
            SectionUserID: section_userid,
            LevelInstanceID: level_instance.LevelInstanceID,
            SectionID: sec_user.SectionID,
            ThresholdPoints: level_instance.ThresholdPoints,
            GoalProgression: goal_progression,
            Title:level.Name
        });


    }
}

module.exports = LevelTrigger;