module.exports = function(sequelize, DataTypes) {
    return sequelize.define('GoalInstance', {
        GoalInstanceID: {
            //Unique identifier for CategoryInstance 
            type: DataTypes.INTEGER.UNSIGNED,
            field: 'GoalInstanceID',
            allowNull: false,
            primaryKey: true,
            autoIncrement: true,
            unique: true
        },
        GoalID: {
            type: DataTypes.INTEGER.UNSIGNED,
            field: 'GoalID',
            allowNull: false,
        },
        CategoryInstanceID: {
            type: DataTypes.INTEGER.UNSIGNED,
            field: 'CategoryInstanceID',
            allowNull: false
        },
        SemesterID: {
            type: DataTypes.INTEGER.UNSIGNED,
            field: 'SemesterID',
            allowNull: false
        },
        SectionID: {
            type: DataTypes.INTEGER.UNSIGNED,
            field: 'SectionID',
            allowNull: false
        },
        CourseID: {
            type: DataTypes.INTEGER.UNSIGNED,
            field: 'CourseID',
            allowNull: false
        },
        ThresholdInstances: {
            type: DataTypes.INTEGER.UNSIGNED,
            field: 'ThresholdInstances',
            allowNull: false
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
        tableName: 'goalinstance'
    });
};