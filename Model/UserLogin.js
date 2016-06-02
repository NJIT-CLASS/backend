/**
 * Created by cesarsalazar on 3/30/16.
 */
/**
 * Created by cesarsalazar on 3/29/16.
 */
//var Sequelize = require("sequelize");
//var sequelize = require("./index.js");


module.exports = function(sequelize, DataTypes) {
    return sequelize.define('UserLogin', {
        UserID: {
            type: DataTypes.INTEGER,
            field: 'UserID', // Will result in an attribute that is firstName when user facing but first_name in the database
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        Email: {
            type: DataTypes.STRING,
            field: 'Email',
            allowNull: true
        },

        Password: {
            type: DataTypes.STRING,
            field: 'Password',
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
        tableName: 'UserLogin'
    });
};

///var User =

///module.exports = User;
