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

var Allocator = require('./Allocator.js');
var Promise = require('bluebird');
var moment = require('moment');
var TreeModel = require('tree-model');
var FlatToNested = require('flat-to-nested');
var consts = require('../Util/constant.js');
var Email = require('./Email.js');
var Util = require('./Util.js');
var _ = require('underscore');

var tree = new TreeModel();
var flatToNested = new FlatToNested();
var email = new Email();

const logger = require('./Logger.js');

var execution = consts.EXECUTION_STATUS;
var cancellation = consts.CANCELLATION_STATUS;
var revision = consts.REVISION_STATUS;
var due = consts.DUE_STATUS;
var pageInteraction = consts.PAGE_INTERACTION_STATUS;
var reallocation = consts.REALLOCATION_STATUS;


class Make {


    /**
     * complete the rest of the allocation routine after assignment instance created
     * allocate users to assginment
     * @param  {[type]}  sectionid [description]
     * @param  {[type]}  ai_id     [description]
     * @return {Promise}           [description]
     */
    async allocateUsers(secId, ai_id) {

        if (secId === null || ai_id === null) {
            logger.log('error', 'create workflow instances and task instance failed', {
                ai_id: ai_id
            });
            return;
        }

        logger.log('info', 'creating workflow instances and task instances for', {
            assignment_instance: ai_id
        });

        // var secId = await AssignmentInstance.find({
        //     where:{
        //         AssignmentInstanceID: ai_id
        //     }
        // });

        var x = this;
        var users = await x.getUsersFromSection(secId); //returns users from secId
        var ai_idToSearch;
        if(typeof ai_id == 'string'){
            try{
                var parsedAiID = JSON.parse(ai_id);
                if(parsedAiID[0].id){
                    ai_idToSearch = parsedAiID[0].id;
                } else {
                    ai_idToSearch = ai_id;
                }
            } catch(e){
                ai_idToSearch = ai_id;
            }
        } else {
            if(Array.isArray(ai_id)){
                ai_idToSearch = ai_id[0];
            }
            else {
                ai_idToSearch = ai_id;
            }
        }

        console.log('AIID', ai_idToSearch, ai_id);
        var wf_timing = await x.getWorkflowTiming(ai_idToSearch); //returns workflow timing from the assignment instance
        var workflows = [];
        
        wf_timing = JSON.parse(wf_timing);
        var aiIDArray = ai_id;
        if(!Array.isArray(aiIDArray)){
            aiIDArray = [JSON.parse(ai_id)];
        }
        await Promise.mapSeries(users, async function (u_id, i) {
            await Promise.mapSeries(aiIDArray, async function(assignmentInstanceId){
                var new_wfs = await x.createWorkflowInstances(users, assignmentInstanceId, wf_timing, i); //creates new workflow instances and return the workflow instance ids
                workflows = workflows.concat(new_wfs);
            });
        });

        await x.updateWorkflowCollection(ai_id, workflows);
        //await x.updateNextTasks(workflows);
        logger.log('info', 'update previous and next task done!');

    }

    /**
     * find all users from a section
     * @param  {[type]}  sectionid [description]
     * @return {Promise}           [description]
     */
    async getUsersFromSection(sectionid) {
        logger.log('info', 'collecting users from section', {
            section: sectionid
        });
        console.log('Retrieving all users from section: ', sectionid, '...');
        var users = [];

        var sec_users = await SectionUser.findAll({
            where: {
                SectionID: sectionid
            }
        }).catch(function (err) {
            logger.log('error', 'error has been found /TaskFactory.js/getUsersFromSection(sectionid)');
        });

        await sec_users.forEach(function (user) {
            if (user.Role !== 'Instructor' && user.Role !== 'Observer' && user.Active) {
                users.push(user.UserID);
            }
        });

        return users;
    }


    /**
     * find WorkflowTiming form assginment instance
     * @param  {[type]}  ai_id [description]
     * @return {Promise}       [description]
     */
    async getWorkflowTiming(ai_id) {
        logger.log('info', 'Finding WorkflowTiming from ', {
            AssignmentInstance: ai_id
        });

        console.log(ai_id);
        var ais = await AssignmentInstance.find({
            where: {
                AssignmentInstanceID: ai_id
            }
        }).catch(function (err) {
            logger.log('error', 'error has been found /TaskFactory.js/getWorkflowTiming(ai_id)');
        });

        return ais.WorkflowTiming;
    }

    /**
     * Wrapper around createWorkflowInstance to distribute workflow timing and users
     * @param  {[type]}  users     [description]
     * @param  {[type]}  ai_id     [description]
     * @param  {[type]}  wf_timing [description]
     * @param  {[type]}  i         [location of the current user pointing to in the list of users]
     * @return {Promise}           [description]
     */
    async createWorkflowInstances(users, ai_id, wf_timing, i) {
        var x = this;
        var j = i; //copies the index
        var wfs = [];

        logger.log('info', 'creating new workflows instances begin with', {
            userid: users[i]
        });
        await Promise.mapSeries(wf_timing.workflows, async function (wf) {
            await Promise.mapSeries(await x.getNumSet(wf.id), async function () {
                var new_wi_id = await x.createWorkflowInstance(wf, ai_id); //creates new workflow instance and return the workflow instance id
                wfs.push(new_wi_id);

                j = await x.createTaskInstances(wf, ai_id, new_wi_id, users, i, j); //creates the new task instances and returns new index of pointer
            });
        });

        return wfs;
    }

    /**
     * return NumberOfSets associate to the workflow activity and reutrns an array
     * 
     * @param {any} wa_id 
     * @returns 
     * @memberof Make
     */
    async getNumSet(wa_id) {
        //console.log('wa_id', wa_id);
        var wa = await WorkflowActivity.find({
            where: {
                WorkflowActivityID: wa_id
            }
        });

        return new Array(wa.NumberOfSets);
    }

    /**
     * create workflow instance base on the section of workflow timing passed in
     * @param  {[type]}  workflow [description]
     * @param  {[type]}  ai_id    [description]
     * @return {Promise}          [description]
     */
    async createWorkflowInstance(workflow, ai_id) {
        var wi = await WorkflowInstance.create({
            //create attributes.
            WorkflowActivityID: workflow.id,
            AssignmentInstanceID: ai_id,
            StartTime: workflow.startDate
        }).catch(function (err) {
            logger.log('error', 'cannot create workflow instance', {
                error: err
            });
            return;
        });

        return wi.WorkflowInstanceID;
    }

    /**
     * Wrapper around createTaskInstance function to correctly identify the tasks needs to be created
     * TaskInstance has to following attributes:
     * TaskInstanceID, UserID, TaskActivityID, WorkflowInstanceID,
     * AssignmentInstanceID, GroupID, Status, StartDate, EndDate,
     * ActualEndDate, Data, UserHistory, FinalGrade, ReferencedTask,
     * isSubWorkflow PreviousTask, NextTask, and EmailLastSent
     *
     * @param  {[type]}  wf        [description]
     * @param  {[type]}  ai_id     [description]
     * @param  {[type]}  new_wi_id [description]
     * @param  {[type]}  users     [description]
     * @param  {[type]}  i         [description]
     * @param  {[type]}  j         [description]
     * @return {Promise}           [description]
     */

    async createTaskInstances(wf, ai_id, new_wi_id, users, i, j) {
        var x = this;
        var index = j;
        var tis = [];
        var ta_to_u_id = {};
        var ti_to_ta = {};
        var flat_tree = await x.getTreeRoot(wf.id);
        //var graph = await x.getGraph(flat_tree);

        logger.log('info', 'creating new task instances ', {
            workflow: new_wi_id,
            users: users,
            index: j
        });

        await Promise.mapSeries(flat_tree, async function (ta, t_index) {
            if (ta.id !== -1) {

                var obj = {
                    'ta': ta,
                    'new_wi_id': new_wi_id,
                    'ai_id': ai_id,
                    'tis': tis,
                    'ti_to_ta': ti_to_ta,
                    'flat_tree': flat_tree,
                    'ta_to_u_id': ta_to_u_id,
                    'i': i,
                    'index': index,
                    'users': users
                };

                var ti = await x.createTaskInstance(obj); //creates a task instance and returns the instance id
                tis = ti[0];
                ti_to_ta = ti[1];
                ta_to_u_id = ti[2];
                index = ti[3];


                if (!ta.hasOwnProperty('parent')) {
                    await x.beginFirstTask(wf.tasks[0], tis, wf.startDate); //starts a task
                }
            }
        });

        await x.updateTaskCollection(new_wi_id, tis);

        return index;
    }


    /**
     * returns the tree in flattened form
     * @param  {[type]}  wa_id [description]
     * @return {Promise}       [description]
     */
    async getTreeRoot(wa_id) {
        try {

            var wa = await WorkflowActivity.find({
                where: {
                    WorkflowActivityID: wa_id
                }
            }).catch(function (err) {
                console.log(err);
                console.log('getTree(wa_id, callback) failed retrieving tree');
            });

            //let treeRoot = await tree.parse(flatToNested.convert(JSON.parse(wa.WorkflowStructure)));
            let treeRoot = JSON.parse(wa.WorkflowStructure);
            return treeRoot;

        } catch (err) {
            console.log(err);
            logger.log('error', 'getTree(wa_id, callback) failed retrieving tree', {
                wa_id: wa_id,
                error: err
            });
        }

    }


    // async getGraph(flat_tree) {
    //     var x = this;
    //     var graph = [];
    //     var count = 1;

    //     await Promise.mapSeries(flat_tree, async function (node) {
    //         if (node.isSubWorkflow === 0 && node.id !== 0) {
    //             var ta = await TaskActivity.find({
    //                 where: {
    //                     TaskActivityID: node.id
    //                 }
    //             });

    //             if (_.isEmpty(graph)) {
    //                 await Promise.mapSeries(Array(ta.NumberParticipants), async function (zero) {
    //                     graph.push({
    //                         'id': count,
    //                         'ta_id': node.id,
    //                         'isSubWorkflow': node.isSubWorkflow
    //                     });
    //                     count++;
    //                 });

    //                 var types = await x.whatsNext(node);

    //                 if((types.hasOwnProperty('needs_consolidation') && types.needs_consolidation.type === 'diff') && (types.hasOwnProperty('solve_problem') && types.needs_consolidation.type === 'same')){
    //                     var graph = await x.merge(node, types, graph);
    //                 }

    //             } else {
    //                 var types = await x.whatsNext(node);

    //                 if((types.hasOwnProperty('needs_consolidation') && types.needs_consolidation.type === 'diff') && (types.hasOwnProperty('solve_problem') && types.needs_consolidation.type === 'same')){

    //                 }

    //                 await Promise.mapSeries(Array(ta.NumberParticipants), async function (zero) {
    //                     var subworkflow = await x.getSubWorkflow(graph, flat_tree, count);
    //                 });

    //                 graph = subworkflow[0];
    //                 count = subworkflow[1];
    //             }
    //         }
    //     });
    // }

    async merge(root, types, graph) {
        var x = this;

    }

    async whatsNext(root, flat_tree) {
        var types = {};

        await Promise.mapSeries(flat_tree, async function (node) {
            if (node.parent === root.id) {
                var ta = await TaskActivity.find({
                    where: {
                        TaskActivityID: node.id
                    }
                });

                if (root.isSubWorkflow === node.isSubWorkflow) {
                    types[ta.Type] = {
                        'type': 'same',
                        'node': node
                    };
                } else {
                    types[ta.Type] = {
                        'type': 'diff',
                        'node': node
                    };
                }

            }

        });

        return types;
    }


    async getSubWorkflow(node, flat_tree, count) {
        var x = this;

    }

    /**
     * Create task instances
     * @param  {[type]}  obj [
     * var obj = {
         'ta': ta,
         'new_wi_id': new_wi_id,
         'ai_id': ai_id,
         'tis': tis,
         'ti_to_ta': ti_to_ta,
         'flat_tree': flat_tree,
         'ta_to_u_id':ta_to_u_id,
         'i': i,
         'index': index,
         'users': users
     };]
     * @return {Promise}     [description]
     */
    async createTaskInstance(obj) {

        var x = this;
        var isSubWorkflow = await x.getIsSubWorkflow(obj.flat_tree, obj.ta);
        var num_participants = await x.getNumParticipants(obj.ta.id); //returns number of participants of a task and whether the task has subworkflow
        var u_id_and_index = await x.getAllocUser(obj.ta, obj.ta_to_u_id, obj.users, obj.i, obj.index, num_participants); //returns users id and new index of the pointer
        var user_ids = u_id_and_index[0];
        obj.index = u_id_and_index[1];

        await Promise.mapSeries(u_id_and_index[0], async function (u_id) {
            obj.ta_to_u_id[obj.ta.id] = u_id;
        });

        var ta = await TaskActivity.find({
            where: {
                TaskActivityID: obj.ta.id
            }
        });

        // logger.log('debug', {
        //     ta: obj.ta,
        //     isSubWorkflow: isSubWorkflow,
        //     num_participants: num_participants,
        //     u_id_and_index: u_id_and_index,
        //     ta_to_u_id: obj.ta_to_u_id
        // });

        if (_.isEmpty(obj.ti_to_ta)) { //assume if this is true then this will be first task and can never be needs_consolidation
            await Promise.mapSeries(user_ids, async function (userid) {

                var ti_u_hist = [{
                    time: new Date(),
                    user_id: userid,
                    is_extra_credit: false,
                }];

                var ti = await TaskInstance.create({
                    UserID: userid,
                    TaskActivityID: obj.ta.id,
                    WorkflowInstanceID: obj.new_wi_id,
                    AssignmentInstanceID: obj.ai_id,
                    Status: JSON.stringify([execution.NOT_YET_STARTED, cancellation.NORMAL, revision.NOT_AVAILABLE, due.BEFORE_END_TIME, pageInteraction.NOT_OPENED, reallocation.ORIGINAL_USER]),
                    UserHistory: ti_u_hist,
                    NextTask: [],
                    IsSubWorkflow: obj.ta.isSubWorkflow
                }).catch(function (err) {
                    console.log(err);
                });

                obj.tis.push(ti.TaskInstanceID);
                obj.ti_to_ta[ti.TaskInstanceID] = obj.ta.id;
            });

            return [obj.tis, obj.ti_to_ta, obj.ta_to_u_id, obj.index];
        } else {

            let parents = []; // find parents to this task

            await Promise.mapSeries(obj.tis, function (ti) { //collects all parents and create edit for each of the parent
                if (obj.ti_to_ta[ti] === obj.ta.parent) {
                    parents.push({
                        'id': ti,
                        'isSubWorkflow': isSubWorkflow
                    });
                }
            });

            // logger.log('debug', {
            //     'tis': obj.tis,
            //     'parents': parents
            // });

            if ((ta.Type === 'needs_consolidation' || obj.ta.isSubWorkflow === isSubWorkflow) && !(ta.Type === 'edit' || ta.Type === 'comment')) { //assume needs_consolidation's NumberParticipants always = 1
                let stat;
                if (ta.Type === 'needs_consolidation') {
                    stat = await JSON.stringify([execution.AUTOMATIC, cancellation.NORMAL, revision.NOT_AVAILABLE, due.BEFORE_END_TIME, pageInteraction.NOT_OPENED, reallocation.ORIGINAL_USER]);
                } else {
                    stat = await JSON.stringify([execution.NOT_YET_STARTED, cancellation.NORMAL, revision.NOT_AVAILABLE, due.BEFORE_END_TIME, pageInteraction.NOT_OPENED, reallocation.ORIGINAL_USER]);
                }

                await Promise.mapSeries(user_ids, async function (userid) {

                    var ti_u_hist = [{
                        time: new Date(),
                        user_id: userid,
                        is_extra_credit: false,
                    }];

                    var ti = await TaskInstance.create({
                        UserID: userid,
                        TaskActivityID: obj.ta.id,
                        WorkflowInstanceID: obj.new_wi_id,
                        AssignmentInstanceID: obj.ai_id,
                        Status: stat,
                        UserHistory: ti_u_hist,
                        NextTask: [],
                        PreviousTask: parents,
                        IsSubWorkflow: obj.ta.isSubWorkflow
                    });

                    await x.updateNextTasks(parents, {
                        'id': ti.TaskInstanceID,
                        'isSubWorkflow': obj.ta.isSubWorkflow
                    });

                    obj.tis.push(ti.TaskInstanceID);
                    obj.ti_to_ta[ti.TaskInstanceID] = obj.ta.id;
                });

                return [obj.tis, obj.ti_to_ta, obj.ta_to_u_id, obj.index];

            } else {

                await Promise.mapSeries(parents, async function (parent) { //collects all parents and create edit for each of the parent
                    await Promise.mapSeries(user_ids, async function (userid) {
                        var ti_u_hist = [{
                            time: new Date(),
                            user_id: userid,
                            is_extra_credit: false,
                        }];

                        var ti = await TaskInstance.create({
                            UserID: userid,
                            TaskActivityID: obj.ta.id,
                            WorkflowInstanceID: obj.new_wi_id,
                            AssignmentInstanceID: obj.ai_id,
                            Status: JSON.stringify([execution.NOT_YET_STARTED, cancellation.NORMAL, revision.NOT_AVAILABLE, due.BEFORE_END_TIME, pageInteraction.NOT_OPENED, reallocation.ORIGINAL_USER]),
                            UserHistory: ti_u_hist,
                            NextTask: [],
                            PreviousTask: [parent],
                            IsSubWorkflow: obj.ta.isSubWorkflow
                        });

                        await x.updateNextTasks([parent], {
                            'id': ti.TaskInstanceID,
                            'isSubWorkflow': obj.ta.isSubWorkflow
                        });

                        obj.tis.push(ti.TaskInstanceID);
                        obj.ti_to_ta[ti.TaskInstanceID] = obj.ta.id;
                    });
                });

                return [obj.tis, obj.ti_to_ta, obj.ta_to_u_id, obj.index];
            }
        }


    }

    /**
     * returns an array 0's based on the number of participants in the task activity
     * @param  {[type]}  taskActivityID [description]
     * @return {Promise}                [description]
     */
    async getNumParticipants(taskActivityID) {
        // logger.log('debug', 'finding number of participants', {
        //     taskActivityID: taskActivityID
        // });
        try {
            var x = this;
            var numParticipants;
            var ta = await TaskActivity.find({
                where: {
                    TaskActivityID: taskActivityID
                }
            });
            let num = new Array(ta.NumberParticipants);
            num.fill(0);
            //let bool = x.hasSubWorkflow(taskActivityID,ta.WorkflowActivityID);
            return num;
        } catch (err) {
            logger.log('error', 'cannot find number of participants', {
                TaskActivity: taskActivityID,
                error: err
            });
        }
    }

    /**
     * [getAllocUser description]
     * @param  {[type]}  ta               [description]
     * @param  {[type]}  ta_to_u_id       [description]
     * @param  {[type]}  users            [description]
     * @param  {[type]}  i                [description]
     * @param  {[type]}  j                [description]
     * @param  {[type]}  num_participants [description]
     * @return {Promise}                  [description]
     */
    async getAllocUser(ta, ta_to_u_id, users, i, j, num_participants) {

        // logger.log('debug', 'finding user to allocate',{
        //     ta:ta,
        //     ta_to_u_id:ta_to_u_id,
        //     users:users,
        //     i:i,
        //     j:j,
        //     num_participants:num_participants
        // });

        var x = this;
        var index = j;
        var alloc_users = [];
        var assign_constr = await x.getAssigneeConstraints(ta.id); //get assignee constraints

        await Promise.mapSeries(num_participants, async function (q, place) {
            if (index === users.length) { // check if user index is beyond length
                index = 0;
            }

            if (assign_constr[0] === 'instructor') { //if the first index is 'instructor', find the owner. TODO: Future, allocate to instructor in the section User table
                var owner = await x.getOwnerID(ta.id);
                alloc_users.push(owner);
            } else if (Object.keys(ta_to_u_id).length === 0) { //if nothing is inside ta_to_u_id return the current user pointing to and index add 1
                alloc_users.push(users[index]);
                index = index + 1;
            } else {
                if (_.isEmpty(assign_constr[2]) || (!assign_constr[2].hasOwnProperty('same_as') && !assign_constr[2].hasOwnProperty('not'))) {
                    alloc_users.push(users[index]);
                    index++;
                } else if (assign_constr[2].hasOwnProperty('same_as') && place === 0) { // check if assignee constraints has "same_as", if there is more than 1 participants only the first user is same as
                    alloc_users.push(ta_to_u_id[assign_constr[2].same_as[0]]);
                } else if (assign_constr[2].hasOwnProperty('not')) {
                    var void_users = await x.getVoidUsers(assign_constr[2].not, ta_to_u_id); //*
                    //console.log('void_users', void_users);
                    if (void_users.length >= users.length) {
                        logger.log('error', 'Fatal! No user to allocate! Reallocate to instructor');
                        var owner = await x.getOwnerID(ta.id);
                        alloc_users.push(owner);
                    } else {
                        if (void_users.length > 0) {
                            if (_.contains(void_users, users[index])) { //check if the void users contains the user
                                index++;
                            } else {
                                alloc_users.push(users[index]);
                                index++;
                            }
                        }
                    }
                } else {
                    logger.log('error', 'Fatal! No user to allocate! ');
                }
            }
        });

        return [alloc_users, index];
    }

    /**
     * get Assignee constraints base on task activity
     * @param  {[type]}  ta_id [description]
     * @return {Promise}       [description]
     */
    async getAssigneeConstraints(ta_id) {

        try {
            var ta = await TaskActivity.find({
                where: {
                    TaskActivityID: ta_id
                }
            }).catch(function (err) {
                logger.log('error', 'cannot find assignee constraints');
                return;
            });

            return JSON.parse(ta.AssigneeConstraints);
        } catch (err) {
            logger.log('error', 'cannot get assignee constraints', {
                error: err
            });
        }

    }

    /**
     * get the owner id of the assignment. Future: this is should be get instructor
     * @param  {[type]}  ta_id [description]
     * @return {Promise}       [description]
     */
    async getOwnerID(ta_id) {

        try {
            var ta = await TaskActivity.find({
                where: {
                    TaskActivityID: ta_id
                }
            }).catch(function (err) {
                logger.log('error', 'cannot find task activity for a owner');
            });

            var a = await Assignment.find({
                where: {
                    AssignmentID: ta.AssignmentID
                }
            }).catch(function (err) {
                logger.log('error', 'cannot find assignment for a owner');
            });

            return a.OwnerID;
        } catch (err) {
            logger.log('error', 'cannot find owner ID', {
                error: err,
                task_activity: ta_id
            });
        }

    }

    /**
     * get a list of users need to be avoid in the allocation
     * @param  {[type]}  void_ta    [description]
     * @param  {[type]}  ta_to_u_id [description]
     * @return {Promise}            [description]
     */
    async getVoidUsers(void_ta, ta_to_u_id) {
        try {
            var void_users = [];

            await Promise.mapSeries(void_ta, function (ta_id) {
                if (ta_to_u_id.hasOwnProperty(ta_id)) {
                    void_users.push(ta_to_u_id[ta_id]);
                }
            });

            // logger.log('debug', 'void users', {
            //     void_users: void_users
            // });

            return void_users;
        } catch (err) {
            logger.log('error', 'cannot find void users', {
                void_tasks: void_tasks,
                ta_ti: ta_to_u_id,
                error: err
            });
        }

    }

    /**
     * Match the current task activity with the tree to find its parent's isSubWorkflow
     * @param  {[type]}  flat_tree [description]
     * @param  {[type]}  ta        [description]
     * @return {Promise}           [description]
     */
    async getIsSubWorkflow(flat_tree, ta) {
        var isSubWorkflow = 0; //in case of the first task in the workflow

        await Promise.mapSeries(flat_tree, function (node) {
            if (node.id === ta.parent) {
                isSubWorkflow = node.isSubWorkflow;
            }
        });

        return isSubWorkflow;
    }

    /**
     * Starts the first task of the Workflow Instance
     * @param  {[type]}  wf_task   [description]
     * @param  {[type]}  tasks     [description]
     * @param  {[type]}  startDate [description]
     * @return {Promise}           [description]
     */
    async beginFirstTask(wf_task, tasks, startDate) {
        var endDate = moment(startDate);

        if (wf_task.DueType[0] === 'duration') {
            //endDate.add(wf_task.DueType[1], 'minutes');
            endDate.add(1, 'minutes');
        } else if (wf_task.DueType[0] === 'specific time') {
            endDate = wf_task.DueType[1];
        }

        await Promise.mapSeries(tasks, async function (task) {
            await TaskInstance.find({
                where: {
                    TaskInstanceID: task
                }
            }).then(async function (ti) {
                var newStatus = JSON.parse(ti.Status);
                newStatus[0] = 'started';
                await TaskInstance.update({
                    StartDate: startDate,
                    EndDate: endDate,
                    Status: JSON.stringify(newStatus)
                }, {
                    where: {
                        TaskInstanceID: task
                    }
                });
                email.sendNow(ti.UserID, 'new task');
            });
        });

    }

    /**
     * update task collection inside the workflow instance
     * @param  {[type]}  wi_id [description]
     * @param  {[type]}  tis   [description]
     * @return {Promise}       [description]
     */
    async updateTaskCollection(wi_id, tis) {
        try {
            await WorkflowInstance.update({
                TaskCollection: tis.sort(function (a, b) {
                    return a - b;
                })
            }, {
                where: {
                    WorkflowInstanceID: wi_id
                }
            });
        } catch (err) {
            logger.log('error', 'cannot update task collection', {
                error: err
            });
        }
    }

    /**
     * update workflow collection of an assignment instance
     * @param  {[type]}  ai_id [description]
     * @param  {[type]}  wfs   [description]
     * @return {Promise}       [description]
     */
    async updateWorkflowCollection(ai_id, wfs) {
        try {
            await AssignmentInstance.update({
                WorkflowCollection: wfs.sort(function (a, b) {
                    return a - b;
                })
            }, {
                where: {
                    AssignmentInstanceID: ai_id
                }
            });
        } catch (err) {
            logger.log('error', 'cannot update workflow collection', {
                error: err
            });
        }

    }

    /**
     * Update the next task attributes
     * @param  {[type]}  tis [description]
     * @return {Promise}     [description]
     */
    async updateNextTasks(parents, next_task) {
        let x = this;

        await Promise.mapSeries(parents, async function (parent) {
            var ti = await TaskInstance.find({
                where: {
                    TaskInstanceID: parent.id
                }
            });

            var next_tasks = JSON.parse(ti.NextTask);
            next_tasks.push(next_task);

            var ti = await TaskInstance.update({
                NextTask: next_tasks
            }, {
                where: {
                    TaskInstanceID: parent.id
                }
            });

        });

    }



}

module.exports = Make;