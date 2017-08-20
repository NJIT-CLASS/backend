module.exports = function(sequelize, DataTypes) {
    return sequelize.define('LevelInstance', {
        LevelInstanceID: {
            //Unique identifier for CategoryInstance 
            type: DataTypes.INTEGER.UNSIGNED,
            field: 'LevelInstanceID',
            allowNull: false,
            primaryKey: true,
            autoIncrement: true,
            unique: true
        },
        LevelID: {
            type: DataTypes.INTEGER.UNSIGNED,
            field: 'LevelID',
            allowNull: false,
        },
        SemesterID: {
            type: DataTypes.INTEGER.UNSIGNED,
            field: 'SemesterID',
            allowNull: false
        },
        SectionID: {
            type: DataTypes.INTEGER.UNSIGNED,
            field: 'SectionID',
            allowNull: false
        },
        CourseID: {
            type: DataTypes.INTEGER.UNSIGNED,
            field: 'CourseID',
            allowNull: false
        },
        ThresholdPoints: {
            type: DataTypes.INTEGER.UNSIGNED,
            field: 'ThresholdPoints',
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
        tableName: 'levelinstance'
    });
};