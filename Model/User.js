/**
 * Created by cesarsalazar on 3/29/16.
 */
//var Sequelize = require("sequelize");
//var sequelize = require("./index.js");


module.exports = function(sequelize, DataTypes) {
    return sequelize.define('User', {
        UserID: {
            type: DataTypes.INTEGER,
            field: 'UserID', // Will result in an attribute that is firstName when user facing but first_name in the database
            allowNull: false,
            primaryKey: true
        },
        FirstName: {
            type: DataTypes.STRING,
            field: 'FirstName',
            allowNull: false
        },
        LastName: {
            type: DataTypes.STRING,
            field: 'LastName', // Will result in an attribute that is firstName when user facing but first_name in the database
            allowNull: false
        },
        MiddleInitial: {
            type: DataTypes.STRING,
            field: 'MiddleInitial',
            validate: { len: [1,1] }
        },
        OrganizationGroup: {
            type: DataTypes.JSON,
            field: 'OrganizationGroup', // Will result in an attribute that is firstName when user facing but first_name in the database
            allowNull: false
        },
        UserContactID: {
            type: DataTypes.INTEGER,
            field: 'UserContactID',
            allowNull: false
        },
        UserType: {
            type: DataTypes.STRING,
            allowNull: false,
            field: 'UserType', // Will result in an attribute that is firstName when user facing but first_name in the database
            validate: {
                isIn: [['Student', 'Teacher']]
            }
        },
        Admin: {
            type: DataTypes.BOOLEAN,
            field: 'Admin'
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
        tableName: 'User'
    });
};

///var User =

///module.exports = User;