module.exports = function(sequelize, DataTypes) {
    return sequelize.define('Notification', {
        NotificationID: {
            //Unique identifier for the Notification.
            type: DataTypes.INTEGER.UNSIGNED,
            field: 'NotificationID',
            allowNull: false,
            primaryKey: true,
            autoIncrement: true,
            unique: true
        },
        Flag: {
            type: DataTypes.INTEGER.UNSIGNED,
            field: 'Flag',
            allowNull: true
        },
        UserID: {
            type: DataTypes.INTEGER.UNSIGNED,
            field: 'CommentsID',
            allowNull: true
        },
        CommentsID: {
            type: DataTypes.INTEGER.UNSIGNED,
            field: 'CommentsID',
            allowNull: true
        },
        VolunteerpoolID: {
            type: DataTypes.INTEGER.UNSIGNED,
            field: 'VolunteerpoolID',
            allowNull: true
        },
        Dismiss: {
            type: DataTypes.INTEGER.UNSIGNED,
            field: 'Deleted',
            allowNull: true
        },


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
        tableName: 'WorkflowInstance'
    });
};
