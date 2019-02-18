module.exports = function(sequelize, DataTypes) {
    return sequelize.define('APIStatistics', {
        StatID: {
            //Unique identifier for the section
            type: DataTypes.INTEGER.UNSIGNED,
            field: 'StatID',
            allowNull: false,
            primaryKey: true,
            autoIncrement: true,
            unique: true
        },
        StartTime: {
            //Unique identifier for the semester
            //Foreign Key
            type: DataTypes.DATE(6),
            field: 'StartTime',
            allowNull: true,
        },
        EndTime: {
            //Unique identifier for the course
            //Foreign Key
            type: DataTypes.DATE(6),
            field: 'EndTime',
            allowNull: true
        },
        Route: {
            type: DataTypes.STRING(2000),
            field: 'Route',
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
        tableName: 'apistatistics'
    });
};
