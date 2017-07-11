module.exports = function(sequelize, DataTypes) {
    return sequelize.define('Comments', {
        CommentsID: {
            //Unique identifier for the user
            type: DataTypes.INTEGER.UNSIGNED,
            field: 'CommentsID',
            allowNull: false,
            primaryKey: true,
            autoIncrement: true,
            unique: true
        },
        UserID: {
            //Unique identifier for the user
            type: DataTypes.INTEGER.UNSIGNED,
            field: 'UserID',
            allowNull: false
        },
        AssignmentInstanceID: {
            //Unique identifier for assignment instance
            //Foreign Key
            type: DataTypes.INTEGER.UNSIGNED,
            field: 'AssignmentInstanceID',
            allowNull: true
        },
        TaskInstanceID: {
            //Unique identifier for assignment instance
            //Foreign Key
            type: DataTypes.INTEGER.UNSIGNED,
            field: 'TaskInstanceID',
            allowNull: true
        },
        Type: {
            type: DataTypes.STRING,
            field: 'Type',
            allowNull: true
        },
        CommentsText: {
            type: DataTypes.STRING,
            field: 'CommentsText',
            allowNull: true
        },
        Rating: {
            type: DataTypes.INTEGER.UNSIGNED,
            field: 'Rating',
            allowNull: true
        },
        Flag: {
            type: DataTypes.INTEGER.UNSIGNED,
            field: 'Flag',
            allowNull: true
        },
        Status: {
            type: DataTypes.STRING(255),
            field: 'Status',
            allowNull: true
        },
        Label: {
            type: DataTypes.STRING(255),
            field: 'Label',
            allowNull: true
        },
        ReplyLevel: {
            type: DataTypes.INTEGER.UNSIGNED,
            field: 'ReplyLevel',
            allowNull: true
        },
        Parents: {
            type: DataTypes.INTEGER.UNSIGNED,
            field: 'Parents',
            allowNull: true
        },
        Delete: {
            type: DataTypes.INTEGER.UNSIGNED,
            field: 'Delete',
            allowNull: true
        }

    }, {
      /*
      indexes: [
          // Create a unique index
          {
            name: 'uniqueComments',
            unique: true,
            fields: ['UserID','SectionID', 'AssignmentInstanceID']
          }],
*/
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
        tableName: 'Comments'
    });
};
