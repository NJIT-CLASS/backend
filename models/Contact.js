module.exports = function(sequelize, DataTypes) {
    return sequelize.define('Contact', {
        UserID: {
            //Unique identifier for the user
            type: DataTypes.INTEGER.UNSIGNED,
            field: 'UserID',
            allowNull: false
        },
        Email: {
            // preferred email for notifications
            type: DataTypes.STRING(70),
            field: 'Email',
            allowNull: true,
            unique: true
        },
        FirstName: {
            //Official first name of the user
            type: DataTypes.STRING(40),
            field: 'FirstName',
            allowNull: true
        },
        LastName: {
            //Official last name of the user
            type: DataTypes.STRING(40),
            field: 'LastName',
            allowNull: true
        },
        Global: {
            type: DataTypes.INTEGER.UNSIGNED,
            field: 'Global',
            allowNull: true
        },
        OrganizationGroup: {
            //Array of organization IDs to which the user is part of
            type: DataTypes.JSON,
            field: 'OrganizationGroup',
            allowTrue: true
        }

    }, {
      /*
      indexes: [
          // Create a unique index
          {
            name: 'uniqueContact',
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
        tableName: 'contact'
    });
};
