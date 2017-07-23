module.exports = function(sequelize, DataTypes) {
    return sequelize.define('CommentsViewed', {
        CommentsViewedID: {
            type: DataTypes.INTEGER.UNSIGNED,
            field: 'CommentsViewedID',
            allowNull: true,
            primaryKey: true,
        },
        CommentsID: {
            //Unique identifier for the user
            type: DataTypes.INTEGER.UNSIGNED,
            field: 'CommentsID',
            allowNull: true,
        },
        UserID: {
            //Unique identifier for the user
            type: DataTypes.INTEGER.UNSIGNED,
            field: 'UserID',
            allowNull: true
        },
        Time: {
            // date and time after which user will be allowed to log in
            type: DataTypes.DATE,
            field: 'Time',
            allowNull: true
        },

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
        tableName: 'CommentsViewed'
    });
};
