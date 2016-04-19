/**
 * Created by cesarsalazar on 4/14/16.
 */

var models = require('../Model');
var User = models.User;
var UserLogin = models.UserLogin;
var UserContact = models.UserContact;
var Course = models.Course;
var Section = models.Section;
var Semester = models.Semester;
var Task = models.Task;
var TaskActivity= models.TaskActivity;
var Assignment= models.Assignment;
var Workflow= models.Workflow;
var WorkflowActivity= models.WorkflowActivity;
var ResetPasswordRequest = models.ResetPasswordRequest;
/**
 *
 * @constructor
 */

function Manager() {

};



Manager.checkTimeoutTasks = function()
{
    Task.findAll(
        { where:
             { $or :
                 [
                     { Status : "not triggered" },
                     { Status : "triggered" } ,
                     { Status : "started" }
                 ]
             }
        }
    ).then(function(tasks)
    {
            tasks.forEach(function(task){
                Manager.checkTimeoutTask(task);

            });
     //   for(var task in tasks)
      //      Manager.checkTimeoutTask(task);

    });
}


Manager.checkTimeoutTask = function(task)
{
  //  console.log("Calling CheckOutTaks Function");
    task.timeOut();
}

module.exports.Manager = Manager;
