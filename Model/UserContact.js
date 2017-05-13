module.exports = function(sequelize, DataTypes) {
    return sequelize.define('UserContact', {
        UserID: {
            // unique contact identifier
            type: DataTypes.INTEGER.UNSIGNED,
            field: 'UserID',
            allowNull: false,
            primaryKey: true
        },
        Email: {
            // preferred email for notifications
            type: DataTypes.STRING(70),
            field: 'Email',
            allowNull: true,
            unique: true
        },
        Phone: {
            // preferred phone number for notificationms
            type: DataTypes.STRING(15),
            field: 'Phone',
            allowNull: true
        },
        FirstName: {
            // preferred first name of the user
            type: DataTypes.STRING(40),
            field: 'FirstName',
            allowNull: true
        },
        LastName: {
            // preferred last name of the user
            type: DataTypes.STRING(40),
            field: 'LastName',
            allowNull: true
        },
        Alias: {
            // alias of the user
            type: DataTypes.STRING(40),
            field: 'Alias',
            allowNull: true
        },
        ProfilePicture: {
            // profile picture of user
            type: DataTypes.JSON,
            field: 'ProfilePicture',
            allowNull: true
        },
        Avatar: {
            // graphical avatar of user
            type: DataTypes.JSON,
            field: 'Avatar',
            allowNull: true
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
        tableName: 'UserContact'
    });
};
