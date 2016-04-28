/**
 * Created by cesarsalazar on 3/29/16.
 */
module.exports = function(sequelize, DataTypes) {
    return sequelize.define('WorkflowActivity', {
            WorkflowActivityID: {
                type: DataTypes.INTEGER,
                field: 'WorkflowActivityID', // Will result in an attribute that is firstName when user facing but first_name in the database
                allowNull: false,
                primaryKey: true,
                autoIncrement: true
            },
            TaskActivityCollection: {
                type: DataTypes.JSON,
                field: 'TaskActivityCollection',
                allowNull: true
            },
            Name: {
                type: DataTypes.STRING,
                field: 'Name', // Will result in an attribute that is firstName when user facing but first_name in the database
                allowNull: false
            },
            Description: {
                type: DataTypes.STRING,
                field: 'Description',
                allowNull:false
            },
            WA_A_id :{
                type : DataTypes.INTEGER,
                field: 'WA_A_id',
                allowNull:false
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
            tableName: 'WorkflowActivity'
        });
};

///var User =

///module.exports = User;