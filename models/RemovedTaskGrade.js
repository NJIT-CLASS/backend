module.exports = function (sequelize, DataTypes) {
    return sequelize.define('RemovedTaskGrade', {
        TaskGradeID: {
            //Task grade ID
            type: DataTypes.INTEGER.UNSIGNED,
            field: 'TaskGradeID',
            allowNull: false,
            primaryKey: true,
            autoIncrement: true,
            unique: true
        },
        TaskInstanceID: {
            //Unique with SectionUserID.
            //Foreign Key
            type: DataTypes.INTEGER.UNSIGNED,
            field: 'TaskInstanceID',
            allowNull: false,
            unique: 'ti_sectionUserId_unq_idx'
        },
        SectionUserID: {
            //Unique with TaskInstanceID
            //Foreign Key
            type: DataTypes.INTEGER.UNSIGNED,
            field: 'SectionUserID',
            allowNull: false,
            unique: 'ti_sectionUserId_unq_idx'
        },
        WorkflowInstanceID: {
            //Foreign Key
            type: DataTypes.INTEGER.UNSIGNED,
            field: 'WorkflowInstanceID',
            allowNull: false
        },
        AssignmentInstanceID: {
         //Foreign Key
            type: DataTypes.INTEGER.UNSIGNED,
            field: 'AssignmentInstanceID',
            allowNull: false
        },
        WorkflowActivityID: {
            //Foreign Key
            type: DataTypes.INTEGER.UNSIGNED,
            field: 'WorkflowActivityID',
            allowNull: false
        },
        TaskActivityID: {
            //Foreign Key
            type: DataTypes.INTEGER.UNSIGNED,
            field: 'TaskActivityID',
            allowNull: false
        },
        TADisplayName: {
            // The default should be a name that makes sense to the user and also conveys our intent, such as “Optionally decide to dispute” for the dispute task.  (*See Notes document)
            type: DataTypes.STRING,
            field: 'TADisplayName',
            allowNull: true
        },
        WADisplayName: {
            // The default should be a name that makes sense to the user and also conveys our intent, such as “Optionally decide to dispute” for the dispute task.  (*See Notes document)
            type: DataTypes.STRING,
            field: 'WADisplayName',
            allowNull: true
        },
        Grade: {
            type: DataTypes.FLOAT.UNSIGNED,
            field: 'Grade',
            allowNull: false
        },
        TIExtraCredit: {
            type: DataTypes.INTEGER.UNSIGNED,
            field: 'TIExtraCredit',
            allowNull: false,
        },
        WAWeight: {
           type: DataTypes.FLOAT.UNSIGNED,
           field: 'WAWeight',
           allowNull:true 
        },
        WANumberOfSets:{
            type: DataTypes.INTEGER.UNSIGNED,
           field: 'WANumberOfSets',
           allowNull:true 
        },
        TAGradeWeight: {
            type: DataTypes.FLOAT.UNSIGNED,
            field: 'TAGradeWeight',
            allowNull:true 
        },
        TAGradeWeightInAssignment: {
            type: DataTypes.FLOAT.UNSIGNED,
            field: 'TAGradeWeightInAssignment',
            allowNull:true 
        },
        TIScaledGrade: {
            type: DataTypes.FLOAT,
            field: 'TIScaledGrade',
            allowNull:true 
        },
        Comments: {
            type: DataTypes.STRING,
            field: 'Comments',
            allowNull: true,
        },
        TIFields: {
            type: DataTypes.JSON,
            field: 'TIFields',
            allowNull: true,
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
        tableName: 'removedtaskgrade'
    });
};
