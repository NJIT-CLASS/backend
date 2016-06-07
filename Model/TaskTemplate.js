/*module.export = function(sequelize, DataType) {
    return sequelize.define('TaskTemplate', {
        TaskTemplateID: {
            type: DataTypes.INTEGER,
            field: 'ID',
            allowNull: true,
            primaryKey: true,
            autoIncrement: true
        }
        CourseID: {
            type: DataTypes.INTEGER,
            field: 'CourseID',
            allowNull: true
        }
        SectionID: {
            type: DataTypes.INTEGER,
            field: 'SectionID',
            allowNull: false
        },
        UserID: {
            type: DataTypes.INTEGER,
            field: 'UserID',
            allowNull: false
        },
        TaskID: {
            type: DataTypes.INTEGER,
            field: 'TaskID',
            allowNull: false
        },
        TaskActivityID: {
            type: DataTypes.INTEGER,
            field: 'TaskActivityID',
            allowNull: false
        },
        TaskActivityType: {
            type: DataTypes.STRING,
            field: 'TaskActivityType',
            allowNull: false
        },
        Task_status: {
            type: DataTypes.STRING,
            field: 'Task_status',
            allowNull: true
        },
        CourseID: {
            type: DataTypes.INTEGER,
            field: 'CourseID',
            allowNull: false
        },
        CourseName: {
            type: DataTypes.INTEGER,
            field: 'CourseName',
            allowNull: false
        },
        CourseNumber: {
            type: DataTypes.INTEGER,
            field: 'CourseNumber',
            allowNull: false
        },
        AssignmentTitle: {
            type: DataTypes.STRING
            field: 'AssignmentTitle'
            allowNull: false
        },
        AssignmentID: {
            type: DataTypes.INTEGER,
            field: 'AssignmentID',
            allowNull: false
        },
        SemesterID: {
            type: DataTypes.INTEGER,
            field: 'SemesterID',
            allowNull: false
        },
        SemesterName: {
            type: DataTypes.STRING,
            field: 'SemesterName',
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
        tableName: 'TaskTemplate'
    });


}*/
