module.exports = function(sequelize, DataTypes) {
    return sequelize.define('Assignment', {
        AssignmentID: {
            //Unique identifier for Assignment (activity)
            type: DataTypes.INTEGER.UNSIGNED,
            field: 'AssignmentID',
            allowNull: false,
            primaryKey: true,
            autoIncrement: true,
            unique: true
        },
        UserID: {
            //The assignment’s owner.
            //Foreign Key
            type: DataTypes.INTEGER.UNSIGNED,
            field: 'OwnerID',
            allowNull: false
        },
        WorkflowActivityIDs: { //*
            //WorkflowActivity_Assignment_ID
            //BLOB of Foreign Keys
            type: DataTypes.BLOB,
            field: 'WorkflowActivityID',
            allowNull: false
        },
        Description: {
            //Description of the Assignment
            type: DataTypes.TEXT,
            field: 'Description',
            allowNull: true
        },
        GradeDistribution: {
            //Describes the percentage given for every workflow and distribution of grade for every task
            type: DataTypes.JSON,
            field: 'GradeDistribution',
            allowNull: true
        },
        Title: {
            //Name of the assignment.
            type: DataTypes.STRING,
            field: 'Title',
            allowNull: true
        },
        Type:{
          type: DataTypes.STRING,
          field: 'Type',
          allowNull: true
        },
        DisplayName: {
          type: DataTypes.STRING,
          field: 'DisplayName',
          allowNull: true
        },
        Section: {
          type: DataTypes.STRING,
          field: 'Section',
          allowNull: true
        },
        Semester: {
          type: DataTypes.STRING,
          field: 'Semester',
          allowNull: true
        },
        VersionHistory: {
          type: DataTypes.JSON,
          field: 'VersionHistory',
          allowNull: true
        }
    }, {
        timestamps: false,

        // don't delete database entries but set the newly added attribute deletedAt
        // to the current date (when deletion was done). paranoid will only work if
        // timestamps are enabled
        paranoid: true,

        // don't use camelcase for automatically added attributes but underscore style
        // so updatedAt will be updated_at
        underscored: true,

        // disable the modification of table names; By default, sequelize will automatically
        // transform all passed model names (first parameter of define) into plural.
        // if you don't want that, set the following
        freezeTableName: true,

        // define the table's name
        tableName: 'Assignment'
    });
};
