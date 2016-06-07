/**
 * Created by cesarsalazar on 3/29/16.
 */
module.exports = function(sequelize, DataTypes) {
    return sequelize.define('Semester', {
            SemesterID: {
                type: DataTypes.INTEGER,
                field: 'SemesterID', // Will result in an attribute that is firstName when user facing but first_name in the database
                allowNull: true,
                primaryKey: true,
                autoIncrement: true
            },
            Name: {
                type: DataTypes.STRING,
                field: 'Name',
                allowNull: false
            },
            StartDate: {
                type: DataTypes.DATE,
                field: 'StartDate', // Will result in an attribute that is firstName when user facing but first_name in the database
                allowNull: true
            },
            EndDate: {
                type: DataTypes.DATE,
                field: 'EndDate',
                allowNull:true
            },
            OrganizationID: {
                type: DataTypes.STRING,
                field: 'OrganizationID', // Will result in an attribute that is firstName when user facing but first_name in the database
                allowNull: true
            }

        },
        {
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
            tableName: 'Semester'
        });
};

///var User =

///module.exports = User;
