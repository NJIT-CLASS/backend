//taskInstance ID have to be given
//-------------------------------------------------------
var models = require('../Model');
var Promise = require('bluebird');

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



//Constructor for Allocator3
function reallocation() {

};

//-------------------------------------------------------
// get taskActivityID linked to this task
reallocation.prototype.getTaskActivityID = function(task) {



    return new Promise(function(resolve, reject){

      //console.log('Finding the taskActivityID...');

      var taskActivityID = [];


      TaskInstance.findAll({
          where: {
              TaskInstanceID: task
          }
      }).then(function(results) {

          //taskActivityID.push(results.TaskActivityID);
          results.forEach(function(task) {
              //tasks.push(task.TaskActivityID);
              taskActivityID.push(task.TaskActivityID);
          }, this);

          //console.log('taskActivityID was found!');

          resolve(taskActivityID);

      }).catch(function(err) {
          console.log('Find taskActivityID failed!');
          console.log(err);
      });

    });

}

// get AssigneeConstraints linked to this taskActivityID
reallocation.prototype.getConstraints = function(ta_id){

  return new Promise(function(resolve, reject){
    var constraints;
    return TaskActivity.find({
      where: {
        TaskActivityID: ta_id
      }
    }).then(function(result){
        constraints = JSON.parse(result.AssigneeConstraints);
        //console.log(constraints);
        //console.log('All constraints were saved!');

        resolve(constraints);
      }).catch(function(err) {
          console.log('Find constraints failed!');
          reject(err);
      });
  });
}

//get user that will be removed from workflow instance
reallocation.prototype.getLateUser = function(task) {


    return new Promise(function(resolve, reject){

      //console.log('Finding the late user...');

      var lateUser;


      TaskInstance.findAll({
          where: {
              TaskInstanceID: task
          }
      }).then(function(results) {

          results.forEach(function(task) {
              lateUser = task.UserID;
          }, this);

          //console.log('lateUser was found!');

          resolve(lateUser);

      }).catch(function(err) {
          console.log('Find workflowInstanceID failed!');
          console.log(err);
      });
    });
}





// get workflowInstanceID linked to this task
reallocation.prototype.getWorkflowInstanceID = function(task) {


    return new Promise(function(resolve, reject){

      //console.log('Finding the workflowInstanceID...');

      var workflowInstanceID = [];


      TaskInstance.findAll({
          where: {
              TaskInstanceID: task
          }
      }).then(function(results) {

          //workflowInstanceID.push(results.WorkflowInstanceID);
          results.forEach(function(workflow) {
              workflowInstanceID.push(workflow.WorkflowInstanceID);
          }, this);

          //console.log('workflowInstanceID was found!');

          resolve(workflowInstanceID);

      }).catch(function(err) {
          console.log('Find workflowInstanceID failed!');
          console.log(err);
      });
    });
}

//get students in the workflowInstanceID - this students will be avoided
reallocation.prototype.getUsersFromWorkflowInstance = function(wi_id) {



    return new Promise(function(resolve, reject){

      //console.log('Finding the users in the workflowInstanceID...');

      var avoid_users = [];

      TaskInstance.findAll({
          where: {
              WorkflowInstanceID: wi_id
          }
      }).then(function(results) {

          results.forEach(function(user) {
            avoid_users.push(user.UserID);
          }, this);


          //console.log('users in workflowInstanceID were found!');

          resolve(avoid_users);

      }).catch(function(err) {
          console.log('Find users in workflowInstanceID failed!');
          console.log(err);
      });
    });
}

//get ti_id where user is allocated within a wi_id
reallocation.prototype.getTaskInstancesWhereUserAlloc = function (user,wi_id,ti_id){
  //console.log('Finding the TaskInstances...');


  return new Promise(function(resolve, reject){

    var tempAllocRecord = [];
    tempAllocRecord.push(ti_id);

    TaskInstance.findAll({
        where: {
            WorkflowInstanceID: wi_id,
            UserID: user
        }
    }).then(function(results) {

        results.forEach(function(result) {
          if (result.TaskInstanceID > ti_id){
            tempAllocRecord.push(result.TaskInstanceID);
          }
        }, this);

        resolve(tempAllocRecord);
        //console.log('TaskInstances were found!');
        //tempAllocRecord.push(ti_id);


    }).catch(function(err) {
        console.log('Find TaskInstances failed!');
        console.log(err);
    });
  });
}

//get newUser
reallocation.prototype.getUser = function (avoid_users, users){
  var new_user;
  users.forEach(function(user){
    //console.log(user);
    if (avoid_users.indexOf(user)===0){
          users.shift();
    }

  });
  new_user = users[0];
  //console.log(new_user);
  return new_user;

}


//updateDB
reallocation.prototype.updateUSER = function(taskid, newUser) {

    console.log('Updating task instance...')

    TaskInstance.update({
        UserID: newUser
    }, {
        where: {
            TaskInstanceID: taskid
        }
    }).then(function(result) {
        console.log('User updated! ', result.UserID)
    }).catch(function(err) {
        console.log('Cannot update user!');
        console.log(err);
    });

}

module.exports.reallocation = reallocation;
