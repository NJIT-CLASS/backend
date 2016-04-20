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
    /*var roles_ = [];
    var workflows_ = [];
    var role_rules_ = [];
    var pools_ = [];
    var role_queue_ = [];
    var runCount_ = [];
    var taskInstanceStorage_ = [];

    this.getRoles = function(){
        return roles_;
    }

    this.setRoles = function(roles){
        roles_ = roles;
    }

    this.appendRoles = function(role)
    {
        roles_.push(role)
    }

    this.getWorkflows = function(){
        return workflows_;
    }

    this.setWorkflows = function(workflows){
        workflows_ = workflows;
    }*/

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
            if(Users[i].UserType == 'Teacher')
            {
                var instructor = Users[i];
                Users.splice(i,1);
                return  instructor;
            }
        }
    }

    /*function updateUSER($ta_id, $newUser){
        global $link2;

        $sql = "Update pla_task set user_id = '".$newUser."'
        where task_id = '".$ta_id."';";

        mysqli_query($link2, $sql);
    }*/

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
        if(typeof Task.User_history === 'undefined' || Task.User_history == null)
        {
            var user_history;
            var arr;
            arr['regular'] =  newUser;
            newUH.push(arr);

            var content = JSON.parse(newUH);

            /**
             * Updating user_history
             */
            Task.User_history = content;

            /**
             * Saving in the Database
             */
            Task.save().then(function(){
                console.log("Saving user_history in task");
            });
        }
        else
        {
            //var user_history;
            /*$aJson = json_decode($user_history, true);
            foreach ($aJson as $j){
            $newUH[] = $j;
                }
            $reg = array();
            $reg['regular'] = $newUser;
            $newUH[] = $reg;
            //$content = json_encode($aJson);

            $sql = "Update pla_task set user_history = '".json_encode($newUH)."'
            where task_id = '".$ta_id."';";

            mysqli_query($link2, $sql);*/

            var aJon =  JSON.Parse(Task.User_history);

            for(var key in aJson)
            {
                newUH.push(key);
            }

            var reg = [];
            reg['regular'] = newUser;
            newUH.push(newUH);
            Tasks.User_history = JSON.stringify(newUH);

            Tasks.save().then(function(){
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
    var alloc = this;
    for (var  i = 0; i < assignments.length; i++) {
        Promise.all([this.getWorkflows(assignments[i]),this.getStudents(section[i])]).then(function(results){
            console.log(results)

            /**
             * result[0] is the workflows by the assignmentID
             * result[1] is the studetn list based on the section
             */

            var allocation;
            var Reversedallocation;
            var workflows = results[0];
            var Students = results[1];
          //  var

            var tasksP = [];
            for(var w = 0; w < workflows.length;w++)
            {
                allocation[j] = [];
                var Tasks = workflows[w].Tasks;
                /**
                 * Here we will be going through each task
                 */
                var i = 0;
                for(var t = 0; t < Tasks.length; t++)
                {
                    var taskActivity = Tasks[t].TaskActivity;

                    var aJson = JSON.parse(taskActivity.Assigne_Constraints);
                    var aConst = aJson.constraints;
                    var aRole = aJson.role;


                    if(aRole == 'nobody')
                    {
                        /*$allocation[$workflow][$row['TA_visual_id']] = 0;
                        $user = $allocation[$workflow][$row['TA_visual_id']];
                        updateUSER($ta_id,$user);*/

                        allocation[w][taskActivity.Visual_ID] = 0;
                        var user = allocation[w][taskActivity.Visual_ID];
                        this.UpdatUser(Tasks[t],0);

                    }
                    else if(aRole == 'instructor')
                    {
                        /*$allocation[$workflow][$row['TA_visual_id']] = getInstructor();
                        $user = $allocation[$workflow][$row['TA_visual_id']];
                        echo "<td>$user</td>";*/

                        allocation[w][taskActivity.Visual_ID] = this.getInstructorFromUserList(Students);
                        var user = allocation[w][taskActivity.Visual_ID];
                        //Check What happen in here
                    }
                    else
                    {
                        if(typeof aConst['same as'] !== 'undefined')
                        {
                            /*$allocation[$workflow][$row['TA_visual_id']] = $allocation[$workflow][$aConst['same as']];
                            $id = $allocation[$workflow][$aConst['same as']];
                            updateUSER($ta_id,$id);
                            //for printing purposes.

                            echo "<td>$id / $row[TA_id]</td>";
                            $reversedAlloc[$id][$row['TA_visual_id']] = $workflow.'  \ '.$row['TA_visual_id'];
                            updateUH($ta_id,$id);*/

                            allocation[j][taskActivity.Visual_ID] = allocation[j][aConst['same as']];
                            var id = allocation[w][aConst['same as']];
                            this.UpdatUser(Tasks[t],id);

                            Reversedallocation[id][taskActivity.Visual_ID] = w + ' \ ' + taskActivity.Visual_ID;
                            this.UpdateUH(Tasks[t],id);
                        }
                        else if(typeof aConst['not'] !== 'undefined')
                        {
                            /*$notThese = $aConst['not'];
                            $avoidThese = array();
                            $chooseMe = array();
                            foreach ($notThese as $vid){ $avoidThese[] = $allocation[$workflow][$vid];}

                            foreach ($students as $st){
                            if (!in_array($st,$avoidThese)){
                                $chooseMe[] = $st;
                            }
                        }

                            $allocation[$workflow][$row['TA_visual_id']] = $chooseMe[0];
                            $id = $chooseMe[0];
                            updateUSER($ta_id,$id);
                            //for printing purposes.
                            $id = $chooseMe[0];
                            echo "<td>$id / $row[TA_id]</td>";
                            $reversedAlloc[$id][$row['TA_visual_id']] = $workflow.'  \ '.$row['TA_visual_id'];
                            updateUH($ta_id,$id);*/

                            var notThese = aConst['not'];
                            var avoidThese = [];
                            var ChooseMe = [];

                            for(var vid in notThese)
                            {
                                avoidThese.push(allocation[w][vid]);
                            }

                            for(var st in Students)
                            {
                                if(array.indexOf(st.UserID) != -1)
                                    ChooseMe.push(st);
                            }

                            allocation[w][taskActivity.Visual_ID] = ChooseMe[0];
                            var id = ChooseMe[0];

                            this.UpdateUser(Tasks[t].TaskID,id);
                            Reversedallocation[id][taskActivity.Visual_ID] = w + ' \ ' + taskActivity.Visual_ID;
                            this.UpdateUH(Tasks[t],id);

                        }
                        else if(typeof aConst['new to subwf'] !== 'undefined')
                        {
                            /*$allocation[$workflow][$row['TA_visual_id']] = $students[$i];  //here i!=0;
                            $id = $students[$i];
                            updateUSER($ta_id,$id);
                            //for printing purposes.

                            echo "<td>$id/$row[TA_id]</td>";
                            $reversedAlloc[$id][$row['TA_visual_id']] = $workflow.'  \ '.$row['TA_visual_id'];
                            updateUH($ta_id,$id);*/

                            allocation[w][taskActivity.Visual_ID] = Students[i]; //here i!=0
                            var id = Students[i];
                            this.UpdateUser(Tasks[k],id);

                            Reversedallocation[id][taskActivity.Visual_ID] = w + ' \ ' + taskActivity.Visual_ID;
                            this.UpdateUH(Tasks[t],id);

                        }
                        else if(typeof aConst['new to wf'] !== 'undefined')
                        {
                            /*$allocation[$workflow][$row['TA_visual_id']] = $students[$i];  //here i=0;
                            $id = $students[$i];
                            updateUSER($ta_id,$id);
                            //for printing purposes.

                            echo "<td>$id / $row[TA_id]</td>";
                            $reversedAlloc[$id][$row['TA_visual_id']] = $workflow.'  \ '.$row['TA_visual_id'];
                            updateUH($ta_id,$id);*/

                            allocation[w][taskActivity.Visual_ID] = Students[i]; //here i=0
                            var id = Students[i];
                            this.UpdateUser(Tasks[k],id);

                            Reversedallocation[id][taskActivity.Visual_ID] = w + ' \ ' + taskActivity.Visual_ID;
                            this.UpdateUH(Tasks[t],id);
                        }
                        else
                        {
                           /* $allocation[$workflow][$row['TA_visual_id']] = $students[$i];  //here i=0;
                            $id = $students[$i];
                            updateUSER($ta_id,$id);
                            //for printing purposes.

                            echo "<td>$id / $row[TA_id]</td>";
                            $reversedAlloc[$id][$row['TA_visual_id']] = $workflow.'  \ '.$row['TA_visual_id'];
                            updateUH($ta_id,$id);*/

                            allocation[w][taskActivity.Visual_ID] = Students[i]; //here i=0
                            var id = Students[i];
                            this.UpdateUser(Tasks[k],id);

                            Reversedallocation[id][taskActivity.Visual_ID] = w + ' \ ' + taskActivity.Visual_ID;
                            this.UpdateUH(Tasks[t],id);
                        }

                    }

                    i++;
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