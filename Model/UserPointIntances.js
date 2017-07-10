module.exports = function(sequelize, DataTypes) {
    return sequelize.define('UserPointIntances', {
        UserID: {
            //The User
            //Foreign Key
            type: DataTypes.INTEGER.UNSIGNED,
            field: 'UserID',
            allowNull: false,
            primaryKey: true
        },
        BadgeCategoryID: {
            //The Semester 
            //Foreign Key
            type: DataTypes.INTEGER.UNSIGNED,
            field: 'BadgeCategoryID',
            allowNull: false,
            primaryKey: true
        },
        TaskInstanceID: {
            type: DataTypes.INTEGER.UNSIGNED,
            field: 'TaskInstanceID',
            allowNull: true
        },
        QuestionsPointInstance: {
            type: DataTypes.INTEGER.UNSIGNED,
            field: 'QuestionsPointInstance',
            allowNull: true
        },
        HighGradesPointInstance: {
            type: DataTypes.INTEGER.UNSIGNED,
            field: 'HighGradesPointInstance',
            allowNull: true
        },
        SolutionsPointInstance: {
            type: DataTypes.INTEGER.UNSIGNED,
            field: 'SolutionsPointInstance',
            allowNull: true
        },
        GraderPointInstance: {
            type: DataTypes.INTEGER.UNSIGNED,
            field: 'GraderPointInstance',
            allowNull: true
        },
        EarlySubmissionPointInstance: {
            type: DataTypes.INTEGER.UNSIGNED,
            field: 'EarlySubmissionPointInstance',
            allowNull: true
        },
        ParticipationPointInstance: {
            type: DataTypes.INTEGER.UNSIGNED,
            field: 'ParticipationPointInstance',
            allowNull: true
        },
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
        tableName: 'userPointInstances'
    });
};