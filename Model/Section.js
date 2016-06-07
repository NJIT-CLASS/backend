/**
 * Created by cesarsalazar on 3/30/16.
 */

//var Sequelize = require("sequelize");
//var sequelize = require("./index.js");


module.exports = function(sequelize, DataTypes) {
    return sequelize.define('Section', {
        SectionID: {
            type: DataTypes.INTEGER,
            field: 'SectionID', // Will result in an attribute that is firstName when user facing but first_name in the database
            allowNull: true,
            primaryKey: true,
            autoIncrement: true
        },
        SemesterID: {
            type: DataTypes.INTEGER,
            field: 'SemesterID', // Will result in an attribute that is firstName when user facing but first_name in the database
            allowNull: false,
        },
        CourseID: {
            type: DataTypes.INTEGER,
            field: 'CourseID',
            allowNull: false
        },
        Name: {
            type: DataTypes.STRING,
            field: 'Name',
            allowNull: false
        },
        StartDate: {
            type: DataTypes.DATE,
            field: 'StartDate',
            allowNull: true
        }
        ,
        EndDate: {
            type: DataTypes.DATE,
            field: 'EndDate',
            allowNull: true
        },
        Description: {
            type: DataTypes.STRING,
            field: 'Description',
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
        tableName: 'Section'
    });
};

///var User =

///module.exports = User;
