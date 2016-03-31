/**
 * Created by cesarsalazar on 3/29/16.
 */
module.exports = function(sequelize, DataTypes) {
    return sequelize.define('Task', {
            TaskID: {
                type: DataTypes.INTEGER,
                field: 'TaskID', // Will result in an attribute that is firstName when user facing but first_name in the database
                allowNull: false,
                primaryKey: true
            },
            UserID: {
                type: DataTypes.INTEGER,
                field: 'UserID',
                allowNull: false
            },
            TaskActivityID: {
                type: DataTypes.INTEGER,
                field: 'TaskActivityID', // Will result in an attribute that is firstName when user facing but first_name in the database
                allowNull: false
            },
            WorlkflowID: {
                type: DataTypes.INTEGER,
                field: 'WorlkflowID',
                allowNull:false
            },
            AssignmentID: {
                type: DataTypes.INTEGER,
                field: 'AssignmentID', // Will result in an attribute that is firstName when user facing but first_name in the database
                allowNull: false
            },
            Status: {
                type: DataTypes.STRING,
                field: 'Status', // Will result in an attribute that is firstName when user facing but first_name in the database
                allowNull: true
            },
            StartDate: {
                type: DataTypes.DATE,
                field: 'StartDate',
                allowNull:false
            },
            EndDate: {
                type: DataTypes.DATE,
                field: 'EndDate', // Will result in an attribute that is firstName when user facing but first_name in the database
                allowNull: false
            },
            Data: {
                type: DataTypes.JSON,
                field: 'Data', // Will result in an attribute that is firstName when user facing but first_name in the database
                allowNull: false
            },
            Settings: {
                type: DataTypes.JSON,
                field: 'Settings',
                allowNull:false
            },
            GroupID: {
                type: DataTypes.INTEGER,
                field: 'GroupID', // Will result in an attribute that is firstName when user facing but first_name in the database
                allowNull: true
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
            tableName: 'Task'
        });
};

///var User =

///module.exports = User;