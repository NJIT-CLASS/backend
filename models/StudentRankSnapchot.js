module.exports = function(sequelize, DataTypes) {
    return sequelize.define('StudentRankSnapchot', {

        StudentRankSnapchotID: {
            type: DataTypes.INTEGER.UNSIGNED,
            field: 'StudentRankSnapchotID',
            allowNull: false,
            primaryKey: true,
            autoIncrement: true,
            unique: true
        },
        SemesterID: {
            type: DataTypes.INTEGER.UNSIGNED,
            field: 'SemesterID',
            allowNull: true
        },
        SemesterName: {
            type: DataTypes.STRING(50),
            field: 'SemesterName',
            allowNull: true
        },
        CourseID: {
            type: DataTypes.INTEGER.UNSIGNED,
            field: 'CourseID',
            allowNull: true
        },
        CourseName: {
            type: DataTypes.STRING(50),
            field: 'CourseName',
            allowNull: true
        },
        CourseNumber: {
            type: DataTypes.STRING(50),
            field: 'CourseNumber',
            allowNull: true
        },
        SectionID: {
            type: DataTypes.INTEGER.UNSIGNED,
            field: 'SectionID',
            allowNull: true
        },
        SectionName: {
            type: DataTypes.STRING(50),
            field: 'SectionName',
            allowNull: true
        },
        UserID: {
            type: DataTypes.INTEGER.UNSIGNED,
            field: 'UserID',
            allowNull: true
        },
        FirstName: {
            type: DataTypes.STRING(50),
            field: 'FirstName',
            allowNull: true
        },
        LastName: {
            type: DataTypes.STRING(50),
            field: 'LastName',
            allowNull: true
        },
        TotalPoints: {
            type: DataTypes.INTEGER.UNSIGNED,
            field: 'TotalPoints',
            allowNull: true
        },
        PointsMovement: {
            type: DataTypes.STRING(50),
            field: 'PointsMovement',
            allowNull: true
        },
        Rank: {
            type: DataTypes.INTEGER,
            field: 'Rank',
            allowNull: true
        },
        UpdateDate: {
            type: DataTypes.DATEONLY,
            field: 'UpdateDate',
            allowNull: false
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
        tableName: 'studentranksnapchot'
    });
};