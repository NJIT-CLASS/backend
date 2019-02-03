module.exports = function (sequelize, DataTypes) {
    return sequelize.define('TaskGradePrep', {
        TaskActivityID: {
            //Unique with SectionUserID.
            //Foreign Key
            type: DataTypes.INTEGER.UNSIGNED,
            field: 'TaskActivityID',
            allowNull: false
        },
        WorkflowActivityID: {
            //Unique with SectionUserID.
            //Foreign Key
            type: DataTypes.INTEGER.UNSIGNED,
            field: 'WorkflowActivityID',
            allowNull: false
        },
        AssignmentID: {
            //Unique with SectionUserID.
            //Foreign Key
            type: DataTypes.INTEGER.UNSIGNED,
            field: 'AssignmentID',
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
        TAGradingInputFieldParms: {
            type: DataTypes.JSON,
            field: 'TAGradingInputFieldParms',
            allowNull:true 
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
        tableName: 'taskgradeprep'
    });
};
