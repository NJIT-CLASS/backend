const Sequelize = require('sequelize');
// const cls = require('continuation-local-storage'),
//     namespace = cls.createNamespace('my-very-own-namespace');
// const NAMESPACE = 'my-very-own-namespace';
// //Sequelize.useCLS(namespace);
// Sequelize.cls = namespace;
var models = require('../Model');
var Promise = require('bluebird');
var nodemailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');
var sequelize = require('../Model/index.js').sequelize;
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

/*
 Constructor
 For other (miscellaneous) utilities
 */
class Util {

    /*
     Add uploaded files' references
     */
    addFileRefs(file_infos, user_id) {
        logger.log('info', 'add file references', {
            user_id: user_id,
            file_infos: file_infos
        });
        var me = this;
        return Promise.all(file_infos.map(function(file_info) {
            return me.addFileRef(user_id, file_info);
        })).then(function(file_refs) {
            logger.log('info', 'file references added', {
                file_refs: file_refs.map(function(it) {
                    return it.toJSON();
                })
            });
            return file_refs;
        });
    }

    /*
    Add a new file reference
     */
    addFileRef(user_id, file_info) {
        logger.log('info', 'add file', {
            user_id: user_id,
            file_info: file_info
        });

        return FileReference.create({
            UserID: user_id,
            Info: file_info,
            LastUpdated: new Date(),
        }).then(function(file_ref) {
            logger.log('debug', 'file reference added', file_ref.toJSON());
            return file_ref;
        }).catch(function(err) {
            logger.log('error', 'add file reference failed', err);
            return err;
        });
    }

    async findWorkflowActivityID(wi_id){
        try{
            console.log('wi_id',wi_id);
            var wi = await WorkflowInstance.find({
                where:{
                    WorkflowInstanceID: wi_id
                }
            });
            console.log('WorkflowInstanceID', wi.WorkflowActivityID);
            return wi.WorkflowActivityID;
        } catch (err){

            logger.log('error', 'cannot find workflow activity from workflow instance', {
                wi_id: wi_id,
                error:err
            });
        }

    }

    async findSectionUserID(ai_id, user_id){
        try{
            var ai_id = await AssignmentInstance.find({
                where:{
                    AssignmentInstanceID: ai_id
                }
            });

            var sec_user = await SectionUser.find({
                where:{
                    SectionID: ai_id.SectionID,
                    UserID: user_id
                }
            });

            return sec_user.SectionUserID;
        } catch (err){
            logger.log('error', 'cannot find section user id ', {
                ai_id:ai_id,
                user_id: user_id,
                error: err
            });
        }
    }

    // transaction(task) {
    //     return cls.getNamespace(NAMESPACE).get('transaction') ? task() : sequelize.transaction(task);
    // };

}

module.exports = Util;
