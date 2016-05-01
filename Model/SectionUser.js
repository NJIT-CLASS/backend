/**
 * Created by cesarsalazar on 3/29/16.
 */
module.exports = function(sequelize, DataTypes) {
    return sequelize.define('SectionUser', {
            SectionUserID: {
                type: DataTypes.INTEGER,
                field: 'SectionUserID', // Will result in an attribute that is firstName when user facing but first_name in the database
                allowNull: false,
                autoIncrement: true,
                primaryKey: true
            },
            SectionID: {
                type: DataTypes.INTEGER,
                field: 'SectionID',
                allowNull: false
            },
            UserID: {
                type: DataTypes.INTEGER,
                field: 'UserID', // Will result in an attribute that is firstName when user facing but first_name in the database
                allowNull: false
            },
            UserRole: {
                type: DataTypes.STRING,
                field: 'UserRole',
                validate: {
                    isIn: [['Student', 'Instructor']]
                }
            },
            UserStatus: {
                type: DataTypes.STRING,
                field: 'UserStatus', // Will result in an attribute that is firstName when user facing but first_name in the database
                allowNull: false,
                validate: {
                    isIn: [['Active', 'Inactive']]
                }
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
            tableName: 'SectionUser'
        });
};

///var User =

///module.exports = User;
