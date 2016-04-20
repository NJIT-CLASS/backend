/**
 * Created by cesarsalazar on 3/29/16.
 */
module.exports = function(sequelize, DataTypes) {
    return sequelize.define('TaskActivity', {
            TaskActivityID: {
                type: DataTypes.INTEGER,
                field: 'TaskActivityID', // Will result in an attribute that is firstName when user facing but first_name in the database
                allowNull: false,
                primaryKey: true
            },
            Name: {
                type: DataTypes.STRING,
                field: 'Name',
                allowNull: false
            },
            Type: {
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
            Assigne_Constraints: {
                type: DataTypes.JSON,
                field: 'Assignee_constraints',
                allowNull:false
            },
            Visual_ID: {
            type: DataTypes.INTEGER,
                field: 'Visual_ID',
                allowNull:true
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