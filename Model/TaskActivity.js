/**
 * Created by cesarsalazar on 3/29/16.
 */
module.exports = function(sequelize, DataTypes) {
    return sequelize.define('TaskActivity', {
            TaskActivityID: {
                type: DataTypes.INTEGER,
                field: 'TaskID', // Will result in an attribute that is firstName when user facing but first_name in the database
                allowNull: false,
                primaryKey: true
            },
            Name: {
                type: DataTypes.STRING,
                field: 'UserID',
                allowNull: false
            },
            Type: {
                type: DataTypes.STRING,
                field: 'TaskActivityID', // Will result in an attribute that is firstName when user facing but first_name in the database
                allowNull: false
            },
            MaximumDuration: {
                type: DataTypes.INTEGER,
                field: 'WorlkflowID',
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