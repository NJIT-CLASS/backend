module.exports = function(sequelize, DataTypes) {
    return sequelize.define('Notifications', {
        NotificationsID: {
            //Unique identifier for the Notification.
            type: DataTypes.INTEGER.UNSIGNED,
            field: 'NotificationsID',
            allowNull: false,
            primaryKey: true,
            autoIncrement: true,
            unique: true
        },
        NotificationTarget: {
            type: DataTypes.STRING(40),
            field: 'NotificationTarget',
            allowNull: true
        },
        UserID: {
            type: DataTypes.INTEGER.UNSIGNED,
            field: 'UserID',
            allowNull: true
        },
        TargetID: {
            type: DataTypes.INTEGER.UNSIGNED,
            field: 'TargetID',
            allowNull: true
        },
        OriginTaskInstanceID: {
            type: DataTypes.INTEGER.UNSIGNED,
            field: 'OriginTaskInstanceID',
            allowNull: true
        },
        Info: {
            type: DataTypes.STRING(40),
            field: 'Info',
            allowNull: true
        },
        Dismiss: {
            type: DataTypes.INTEGER.UNSIGNED,
            field: 'Dismiss',
            allowNull: true
        },
        Time: {
            // date and time after which user will be allowed to log in
            type: DataTypes.DATE,
            field: 'Time',
            allowNull: true
        },
        DismissType: {
          type: DataTypes.STRING(45),
          field: 'DismissType',
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
        tableName: 'Notifications'
    });
};
