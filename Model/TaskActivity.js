/**
 * Created by cesarsalazar on 3/29/16.
 */
module.exports = function(sequelize, DataTypes) {
    return sequelize.define('TaskActivity', {
            TaskActivityID: {
                type: DataTypes.INTEGER,
                field: 'TaskActivityID', // Will result in an attribute that is firstName when user facing but first_name in the database
                allowNull: false,
                primaryKey: true,
                autoIncrement: true
            },
            Name: {
                type: DataTypes.STRING,
                field: 'Name',
                allowNull: false
            },
            TaskActivityType: {
                type: DataTypes.STRING,
                field: 'Type', // Will result in an attribute that is firstName when user facing but first_name in the database
                allowNull: false
            },
            MaximumDuration: {
                type: DataTypes.INTEGER,
                field: 'MaximumDuration',
                allowNull:false
            },
            EarliestStartTime: {
                type: DataTypes.DATE,
                field: 'EarliestStartTime', // Will result in an attribute that is firstName when user facing but first_name in the database
                allowNull: true
            },
            Instructions: {
                type: DataTypes.STRING,
                field: 'Instructions', // Will result in an attribute that is firstName when user facing but first_name in the database
                allowNull: false
            },
            Visual_ID: {
                type: DataTypes.INTEGER,
                field: 'Visual_ID',
                allowNull:true
            },
            TA_WA_id: {
                type: DataTypes.INTEGER,
                field: 'TA_WA_id',
                allowNull:true
            },
            TA_AA_id: {
                type: DataTypes.INTEGER,
                field: 'TA_AA_id',
                allowNull:true
            },
            Assignee_constraints: {
                type: DataTypes.BLOB,
                field: 'Assignee_constraints',
                allowNull:true
            },
            TA_version_history: {
                type: DataTypes.BLOB,
                field: 'TA_version_history',
                allowNull:true
            },
            TA_trigger_condition: {
                type: DataTypes.BLOB,
                field: 'TA_trigger_condition',
                allowNull:true
            },
            TA_next_task: {
                type: DataTypes.STRING,
                field: 'TA_next_task',
                allowNull:true
            },
            Task_grade_type :{
                type: DataTypes.STRING,
                allowNull : true,
                field : 'Task_grade_type',
                validate: {
                    isIn: [['Points', 'Percentage']]
                }
            }
        },
        {
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
            tableName: 'TaskActivity'
        });
};

///var User =

///module.exports = User;
