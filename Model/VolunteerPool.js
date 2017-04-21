module.exports = function(sequelize, DataTypes) {
    return sequelize.define('VolunteerPool', {
        VolunteerPoolID: {
            //Unique identifier for the user
            type: DataTypes.INTEGER.UNSIGNED,
            field: 'VolunteerPoolID',
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
        SectionID: {
            //Unique identifier for the section
            type: DataTypes.INTEGER.UNSIGNED,
            field: 'SectionID',
            allowNull: false
        },
        AssignmentInstanceID: {
            //Unique identifier for assignment instance ID
            type: DataTypes.INTEGER.UNSIGNED,
            field: 'AssignmentInstanceID',
            allowNull: true
        },
        status: {
            //Unique identifier for assignment instance ID
            type: DataTypes.STRING(25),
            field: 'status',
            allowNull: true
        }

    }, {
      indexes: [
          // Create a unique index
          {
            name: 'uniqueVolunteer',
            unique: true,
            fields: ['UserID','SectionID', 'AssignmentInstanceID']
          }],

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
        tableName: 'VolunteerPool'
    });
};
