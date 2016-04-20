/**
 * Created by cesarsalazar on 4/14/16.
 */

var models = require('../Model');
var TaskFactory = require('./TaskFactory.js');

var User = models.User;
var UserLogin = models.UserLogin;
var UserContact = models.UserContact;
var Course = models.Course;
var Section = models.Section;
var Semester = models.Semester;
var Task = models.Task;
var TaskActivity= models.TaskActivity;
var Assignment= models.Assignment;
var AssignmentSection= models.AssignmentSection;

var Workflow= models.Workflow;
var WorkflowActivity= models.WorkflowActivity;
var ResetPasswordRequest = models.ResetPasswordRequest;


/**
 *
 * @constructor
 */

function Manager() {

};

//   for(var task in tasks)
//      Manager.checkTimeoutTask(task);
//     test = Task.queryByStatus(1);

Manager.checkTimeoutTasks = function()
{
    Task.findAll(
        { where:
             { $or :
                 [
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


    });
}


Manager.checkTimeoutTask = function(task)
{


    task.timeoutTime(function(date){

        var now = new Date();
        if(date < now)
        {
            task.timeOut();
        }
    })
  /*//  console.log("Calling CheckOutTaks Function");
    //task.timeOut();
    test = {type: "task status", 'task type' : "create problem" , "task status" : "triggered"};
   // task.addTriggerCondition(test);


     //       task.complete();*/
}


Manager.checkTaskInstances = function()
{
    Task.findAll(
        { where:
        { $or :
            [
                { Status : "not triggered" } ,
                { Status : "triggered" } ,
                { Status : "started" }
            ]
        }
        }
    ).then(function(tasks)
    {
        tasks.forEach(function(task){
            Manager.checkTaskInstance(task);
        });


    });
}

Manager.checkTaskInstance = function(task)
{
    task.triggerConditionsAreMet(function(result)
    {
        if(result)
            task.trigger();
    });

    task.expireConditionsAreMet(function(result){
        if(result)
            task.expire();
    });
}

Manager.checkAsignments = function()
{
    AssignmentSection.findAll(
        { where:
            { EndDate : null }
        }
    ).then(function(assignmentSections)
    {
        assignmentSections.forEach(function(assignmentSection){
            Manager.checkAssginment(assignmentSection);
        });


    });

}

Manager.checkAssginment = function(assignmentSection)
{
    var startDate = assignmentSection.StartDate;

    var now = new Date();

    if(startDate < now)
    {
        Manager.isStarted(assignmentSection, function(result){
            if(result)
                Manager.trigger(assignmentSection);
        });
    }

}
 Manager.isStarted = function(assignmentSection,callback)
{
    Workflow.count(
        {
            where :
            {
                AssignmentID : assignmentSection.AssignmentID
            }
        }).then(function(count)
        {
            callback(count > 0 ? true: false);
        });
}
Manager.trigger = function(){

}

Manager.notifyUser = function(event, task)
{
    //Waiting for email sending piece from Christian
}


Manager.triggerTaskCreation = function(workflow,assignment, users, tasks)
{
    var factory = new TaskFactory.TaskFactory(workflow,tasks);
    factory.createTasks();
}


/**
 * Get the workflow tasks
 *
 * @return array
 */
Manager.getTasks= function(assignmentSection)
{
    return Task.findAll({ where : { AssignmentID : assignmentSection.AssignmentID}}).then(function(tasks){
        return tasks;
    } );
}

/**
 * Resolve a Human Task Name
 *
 * @return string The Human Version of the Type
 * @param string The type
 */
Manager.humanTask = function(type)
{
    var action_human = '';
    switch (type)
    {
        case 'create problem' :
            action_human = 'Create a Problem';
            break;
        case 'edit problem' :
            action_human = 'Edit a Problem';
            break;

        case 'grade solution' :
            action_human = 'Grade a Solution';
            break;

        case 'create solution' :
            action_human = 'Create a Solution';
            break;

        case 'resolution grader' :
            action_human = 'Resolve Grades';
            break;
        case 'dispute' :
            action_human = 'Decide Whether to Dispute';
            break;
        case 'resolve dispute' :
            action_human = 'Resolve Dispute';
            break;
        default :
            action_human = 'Unknown Action';
    }
    return action_human;
}

/**
 * Retrieve the roles a user can have in a section
 *
 * @return Array
 */
Manager.getUserRoles = function()
{
    return ['student', 'instructor'];
}

module.exports.Manager = Manager;
