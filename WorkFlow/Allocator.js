/**
 * Created by cesarsalazar on 4/17/16.
 */
var models = require('../Model');
var User = models.User;
var UserLogin = models.UserLogin;
var UserContact = models.UserContact;
var Course = models.Course;
var Section = models.Section;
var SectionUser = models.SectionUser;

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
function Allocator()
{
    /**
     * Get the workflows base in the asignment ID.
     * It pulls also the Tasks, and TaskActivities..
     * @param assignment
     * @returns {*}
     */
    this.getWorkflows = function(assignment)
    {

        return Workflow.findAll({ where : { AssignmentID : assignment},  include : [  { model : Task , as: 'Tasks', include :[ { model : TaskActivity }]}]}).then(function(workflows)
        {
            return workflows;
        });

    }

    /**
     * Get the workflows base in the asignment ID.
     * It pulls also the Tasks, and TaskActivities..
     * @param assignment
     * @returns {*}
     */
    this.getWorkflowActivities = function(assignment)
    {

        return WorkflowActivity.findAll({ where : { WA_A_id : assignment}, include :[{ model : Workflow, as : 'Workflows', include :[{ model : Task , as: 'Tasks', include :[ { model : TaskActivity }]}]}]/*,  include : [  { model : Workflow, as: 'Workflows'}]*/}).then(function(workflows)
        {
            return workflows;
        });/*.catch(function (e)
        {
            console.log(e);
        });*/

    }
    /**
     * this method gets the list of sectionUsers with the User object
     * base on the section ID.
     * @param sectionID
     * @returns {*}
     */
    this.getStudents = function (sectionID)
    {
        //var options = {include : [User], where : ['User.UserType = ?','Student']};
        return SectionUser.findAll({ where : { SectionID : sectionID},  include : [  { model : User }] }).then(function(users){
            return users;
        });
    }

    /**
     *
     * @param workflow
     * @param binding
     * @returns {*}
     */
    this.getTasks = function (workflow, binding)
    {
        return Task.findAll({ where : { WorkflowID : workflow}}).bind(binding).then(function(tasks){
            return [this,tasks];
        });;
    }


    /**
     * This function returns the Instructor in the students list
     * The instructor will be deleted from the list
     * Make sure this is correct
     * TEST IT!!!!!!!!!!!!!!
     * @param Users
     * @returns {*}
     */
    this.getInstructorFromUserList = function(Users)
    {
        for(var i = 0; i < Users.length; i++)
        {
            if(Users[i].UserRole == 'Instructor')
            {
                var instructor = Users[i];
                Users.splice(i,1);
                return  instructor.UserID;
            }
        }
    }

    /**
     * Assigning the User ID to the given task
     * @param Task
     * @param userID
     * @constructor
     */
    this.UpdateUser = function(Task, userID)
    {
        Task.UserID = userID;
        Task.save().then(function()
        {
            console.log('User ID assigned to task');
        }).catch(function(e)
        {
            console.log(e);
        });

    }

    //updateUH($ta_id, $newUser)

    /**
     * This method will update the history for the given task
     * @param Task current Task
     * @param newUser User ID to add to the history
     * @constructor
     */
    this.UpdateUH = function(Task, newUser){

        var newUH = [];
        /**
         * Checking if the user_history exists or not.
         */
        if(typeof Task.user_history === 'undefined' || Task.user_history == null)
        {
            var user_history;
            var arr = {'regular' : newUser};
            //arr['regular'] =  newUser;
            newUH.push(arr);

            //var content = JSON.parse(newUH);

            /**
             * Updating user_history
             */
            Task.user_history = JSON.stringify(newUH);

            /**
             * Saving in the Database
             */
            Task.save().then(function(){
                console.log("Saving user_history in task");
            });
        }
        else
        {
            var aJson =  JSON.parse(Task.user_history.toString());

            for(var i = 0; i < aJson.length; i++)
            {
                newUH.push(aJson[i]);
            }

            var arr = {'regular' : newUser};

            newUH.push(arr);
            Task.user_history = JSON.stringify(newUH);

            Task.save().then(function(){
                console.log("Saving user_history in task");
            });


        }
    }
}


/**
 *
 * @param assignments array with all the assignments
 * @constructor
 */
Allocator.prototype.Allocate = function(assignments, section)
{
    //var allocation = {};

    var allocator = this;
    for (var  i = 0; i < assignments.length; i++) {
        Promise.all([this.getWorkflowActivities(assignments[i]),this.getStudents(section[i])]).then(function(results){
            console.log(results)

            /**
             * result[0] is the workflows by the assignmentID
             * result[1] is the studetn list based on the section
             */

            var workflowsActivities = results[0];
            var Students = results[1];

            /**
             * Removing the instructor from the list and
             * keeping instructor ID
             */
            var instructorID = allocator.getInstructorFromUserList(Students);

            for (var i = 0; i < workflowsActivities.length; i++)
            {

                /**
                 * Holding the list of workflows for the current WorkflowActivity
                 */
                var workflows = workflowsActivities[i].Workflows;

                /*
                 * Holding the allocation for the current workflowActivity
                 */
                var allocation = new Array(workflows.length);
                for(var w = 0; w < workflows.length;w++)
                {
                    var w_id = workflows[w].WorkflowID;
                    var Tasks = workflows[w].Tasks;

                    //for each workflow instance, the last student in the array will be move all the way up to
                    // be at index = 0. This way students will get the same amount of tasks per assignment.
                    var s = Students.length;
                    var tempStudent = Students[s-1];
                    Students.splice(s - 1,1);
                    Students.unshift(tempStudent);


                    if(typeof allocation[w] === 'undefined')
                        allocation[w] = {};


                    /**
                     * Here we will be going through each task
                     */
                    var stCounter = 0;
                    for(var t = 0; t < Tasks.length; t++)
                    {

                        var taskActivity = Tasks[t].TaskActivity;

                        /**
                         * Retrieving constrains information
                         */
                        var aJson = JSON.parse(taskActivity.Assignee_constraints.toString());
                        var aConst = aJson.constraints;
                        var aRole = aJson.role;


                        if(aRole == 'nobody')
                        {
                            /**
                             * User ID : 8 is nobody by default in the current users table
                             */
                            allocation[w][taskActivity.Visual_ID] = 8;
                            var user = allocation[w][taskActivity.Visual_ID];
                            allocator.UpdateUser(Tasks[t],8);

                        }
                        else if(aRole == 'instructor')
                        {
                            allocation[w][taskActivity.Visual_ID] = instructorID;

                            var user = allocation[w][taskActivity.Visual_ID]
                            allocator.UpdateUser(Tasks[t],user);
                        }
                        else
                        {
                            if(typeof aConst !== 'undefined' && aConst != null && typeof aConst['same as'] !== 'undefined')
                            {

                                allocation[w][taskActivity.Visual_ID] = allocation[w][aConst['same as']];
                                var id = allocation[w][aConst['same as']];

                                allocator.UpdateUser(Tasks[t],id);
                                allocator.UpdateUH(Tasks[t],id);
                            }
                            else if(typeof aConst !== 'undefined' && aConst != null &&  typeof aConst['not'] !== 'undefined')
                            {
                                var notThese = aConst['not'];
                                var avoidThese = [];
                                var ChooseMe = [];


                                var visual = {};
                                var alloc = {};

                                for(var i = 0 ; i < notThese.length;i++)
                                {
                                    var vid = notThese[i];
                                    avoidThese.push(allocation[w][vid]);
                                }


                                for(var i = 0 ; i < Students.length;i++)
                                {
                                    var st = Students[i].UserID;
                                    if(avoidThese.indexOf(st) == -1)
                                        ChooseMe.push(st);
                                }

                                allocation[w][taskActivity.Visual_ID] = ChooseMe[0];
                                var id = ChooseMe[0];

                                allocator.UpdateUser(Tasks[t],id);
                                allocator.UpdateUH(Tasks[t],id);

                            }
                            else if(typeof aConst !== 'undefined' && aConst != null &&  typeof aConst['new to subwf'] !== 'undefined')
                            {
                                allocation[w][taskActivity.Visual_ID] = Students[stCounter].UserID;
                                var id = Students[stCounter].UserID;;

                                allocator.UpdateUser(Tasks[t],id);
                                allocator.UpdateUH(Tasks[t],id);

                            }
                            else if(typeof aConst !== 'undefined' && aConst != null && typeof aConst['new to wf'] !== 'undefined')
                            {
                                allocation[w][taskActivity.Visual_ID] = Students[stCounter].UserID;
                                var id = Students[stCounter].UserID;;

                                allocator.UpdateUser(Tasks[t],id);
                                alloc.UpdateUH(Tasks[t],id);
                            }
                            else
                            {
                                allocation[w][taskActivity.Visual_ID] = Students[stCounter].UserID;
                                var id = Students[stCounter].UserID;

                                allocator.UpdateUser(Tasks[t],id);
                                allocator.UpdateUH(Tasks[t],id);
                            }

                        }


                    }
                    stCounter++;
                }
            }

            /**
             * Executing All Promises for each task
             */
            /*Promise.all(tasksP).then(function(result) {
                console.log(result);
                /!**
                 * Now we have all the information together
                 * we can now loop through each task to allocate
                 * result[][0] workflows
                 * result[][1] Students
                 * result[][2] index
                 *!/


            });*/
        });
    }
    /*var allocation = [];
 for (var  i = 0; i < assignments.length; i++)
 {
 this.getWorkflows(assignments[i], function(assignment,workflows)
 {
 this.getStudents(assignment, workflows,function(assignment, workflows,users)
 {
 for(var i = 0; i < workflows.length; i++)
 {
 this.getTasks(assignment, workflows[i],users,function(assignment, workflows,users,tasks){
 var i = users.length
 while (--i !== 0) {
 users[0].unshift(users[i])
 }

 var taskActiit

 });
 }
 });

 });
 }*/
}

/*
Allocator.prototype.shift = function(a)
{
    if(count(a) == 1)
        return a;

    var rememberMe = a[0];

    for( i = 0; i < count(a) - 1; i++)
    {
        a[i] = a[i+1];
    }

    a[count(a) - 1] = rememberMe;

    return a;
}

/!**
 * Grunt work to assign users
 *
 * It'd be best to run `assignmentRun()` as that method automatically detects errors
 * and fixes them. This is a helper processor.
 *
 * @return void
 *!/

Allocator.prototype.runAssignment = function()
{
    if(count(this.getRoles()) == 0)
        throw new Error("Allocator: Roles are not defined for Allocator ");

    if(count(this.getWorkflows()) == 0)
        throw Error("Allocator: No Workflows to allocate to");


    //ONLY GOOD FOR USE CASE 1A (is it?)
    var randomizedPool = null;

    var roles = this.getRoles();

    for(var i = 0; i < roles.length; i++)
    {
        var rolePool = this.getPool();

    }

}

Allocator.prototype.count = function(a)
{
    var t = this.getRoles();
    console.log();
}



/!**
 * Add a user role (problem creator, solver, etc)
 *
 * @param string Name of the role
 * @param array
 *!/
Allocator.prototype.createRole = function(name, rules)
{
    var rules = {};
    rules['pool'] = {};
    rules['pool']['test'] = 'Testing';
    rules['pool']['key'] = 'value';
    if(typeof rules === 'undefined')
    {
        rules = [];
        var temp = this.defaultPool();
        rules.push({'pool' : temp})
    }
    else
    {
        var temp = this.defaultPool();
        for (var key in rules['pool']) {
            if (!temp.hasOwnProperty(key)) {
                temp[key] = rules['pool'][key];
            }
        }
        rules['pool'] = temp;

    }

    var roles = {};
    roles['name'] = name;
    roles['rules'] = rules;
    this.appendRoles(roles);

}

/!**
 * Default Pool Settings for a role
 *
 * @return array
 *!/
Allocator.prototype.defaultPool = function()
{
    var defaultpool = {};
    defaultpool['name'] = 'student';
    defaultpool['pull after'] = true;

    return defaultpool;
}

/!**
 * Get the Workflows
 *
 * @return array
 *!/

Allocator.prototype.getWorkflows = function ()
{
    return this.getWorkflows();
}
*/

module.exports.Allocator = Allocator;