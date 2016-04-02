/**
 * Created by cesarsalazar on 3/30/16.
 */

module.exports = function(sequelize, DataTypes) {
    return sequelize.define('ResetPasswordRequest', {
        UserID: {
            type: DataTypes.INTEGER,
            field: 'UserID', // Will result in an attribute that is firstName when user facing but first_name in the database
            allowNull: false,
            primaryKey: true
        },
        RequestHash: {
            type: DataTypes.STRING,
            field: 'RequestHash',
            allowNull: false,
            primaryKey: true
        }
    },{
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
        tableName: 'ResetPasswordRequest'
    });
};

///var User =

///module.exports = User;