module.exports = function(sequelize, DataTypes) {
    return sequelize.define('SectionUserRecord', {
        SectionUserID: {
            type: DataTypes.INTEGER.UNSIGNED,
            field: 'SectionUserID',
            allowNull: false,
            primaryKey: true,
            unique: true
        },
        LevelInstanceID:{
            type: DataTypes.INTEGER.UNSIGNED,
            field: 'LevelInstanceID',
            allowNull: false
        },
        SectionID:{
            type: DataTypes.INTEGER.UNSIGNED,
            field: 'SectionID',
            allowNull: false
        },
        Title:{
            type: DataTypes.STRING,
            field: 'Title',
            allowNull: false
        },
        Level:{
            type: DataTypes.INTEGER.UNSIGNED,
            field: 'Level',
            defaultValue: 1,
        },
        Exp:{
            type: DataTypes.INTEGER.UNSIGNED,
            field: 'Exp',
            defaultValue: 0,
        },
        ThresholdPoints:{
            type: DataTypes.INTEGER.UNSIGNED,
            field: 'ThresholdPoints',
            allowNull: false
        },
        AvailablePoints:{
            type: DataTypes.INTEGER.UNSIGNED,
            field: 'AvailablePoints',
            allowNull: false,
            defaultValue: 0
        },
        UsedPoints:{
            type: DataTypes.INTEGER.UNSIGNED,
            field: 'UsedPoints',
            defaultValue: 0
        },
        PlusPoint: {
            type: DataTypes.INTEGER.UNSIGNED,
            field: 'PlusPoint',
            defaultValue: 0
        },
        GoalProgression:{
            type: DataTypes.JSON,
            field: 'GoalInstances',
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
        tableName: 'SectionUserRecord'
    });
};