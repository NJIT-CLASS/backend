/**
 * Created by cesarsalazar on 3/30/16.
 */

//var Sequelize = require("sequelize");
//var sequelize = require("./index.js");


module.exports = function(sequelize, DataTypes) {
    return sequelize.define('AssignmentSection', {
        AssignmentSectionID: {
            type: DataTypes.INTEGER,
            field: 'AssignmentSectionID', // Will result in an attribute that is firstName when user facing but first_name in the database
            allowNull: false,
            primaryKey: true
        },
        AssignmentID: {
            type: DataTypes.INTEGER,
            field: 'AssignmentID', // Will result in an attribute that is firstName when user facing but first_name in the database
            allowNull: false,
            primaryKey: true

        },
        SectionID: {
            type: DataTypes.INTEGER,
            field: 'SectionID',
            allowNull: false,
            primaryKey: true
        }
        ,
        StartDate: {
            type: DataTypes.DATE,
            field: 'Settings',
            allowNull: true
        },
        EndDate: {
            type: DataTypes.DATE,
            field: 'EndDate',
            allowNull: true
        }
        ,
        Title: {
            type: DataTypes.STRING,
            field: 'Title',
            allowNull: false
        },
        UserID: {
            type: DataTypes.INTEGER,
            field: 'UserID',
            allowNull: false
        },
        GroupSize: {
            type: DataTypes.INTEGER,
            field: 'GroupSize',
            allowNull: false
        },
        UseCase: {
            type: DataTypes.INTEGER,
            field: 'UseCase',
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
        tableName: 'AssignmentSection'
    });
};

///var User =

///module.exports = User;