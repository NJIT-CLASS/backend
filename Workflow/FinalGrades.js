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

class FinalGrades{

  x = this;
  ////////////////////////////////////////////////////////////
  ////////////Collect grades for individual users/////////////
  ////////////////////////////////////////////////////////////

  collectGradesForEachAssignment(u_id, ai_id){
    //Use section users to collect the sections the user was in
    //go through each section find all the assignments relates to the user
    //sum up the grades for each assignment
    //put into a json object along its name {name_of_assignment: grade}

    SectionUser.findAll({
      where:{
        UserID: userID
      }
    }).then(function(sections){
      x.findSections(sections)
    });

  }

  //Iterate through the sections
  findSections(sections){
    return Promise.map(sections, function(section){
      x.findAssignments(section);
    });
  }

  //for each section, find the assignments
  findAssignments(section){
    Assignment.find({
      where:{
        SectionID: section.SectionID
      }
    }).then(function(assignments){
        findGrades()
    })
  }

  findSectionUsers()

  ////////////////////////////////////////////////////////////
  //////////////Collect grades for the section////////////////
  ////////////////////////////////////////////////////////////

  collectGradesFromSection(sectionID){


  }



}

module.exports = FinalGrades;
