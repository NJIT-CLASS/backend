module.exports = function(sequelize, DataTypes) {
    return sequelize.define('PartialAssignments', {
        PartialAssignmentID: {
            //Unique identifier for the organization
            type: DataTypes.INTEGER.UNSIGNED,
            field: 'PartialAssignmentID',
            allowNull: false,
            primaryKey: true,
            autoIncrement: true,
            unique: true
        },
        UserID: {
            //Unique identifier for the user.
            type: DataTypes.INTEGER.UNSIGNED,
            field: 'UserID',
            allowNull: false
        },
        CourseID:{
            type: DataTypes.INTEGER.UNSIGNED,
            field: 'CourseID',
            allowNull: false,
        },
        PartialAssignmentName: {
            type: DataTypes.STRING(255),
            field: 'PartialAssignmentName',
            allowNull: true,
        },
        Data: {
            type: DataTypes.JSON,
            field: 'Data',
            allowNull: false
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
        tableName: 'partialassignments'
    });
};
