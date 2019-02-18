module.exports = function(sequelize, DataTypes) {
    return sequelize.define('UserBadgeInstances', {
        UserBadgeInstanceID: {
            //The User
            //Foreign Key
            type: DataTypes.INTEGER.UNSIGNED,
            field: 'UserBadgeInstanceID',
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            unique: true
        },
        UserID: {
            //The User
            //Foreign Key
            type: DataTypes.INTEGER.UNSIGNED,
            field: 'UserID',
            allowNull: false,
        },
        BadgeInstanceID: {
            //The BadgeInstance 
            //Foreign Key
            type: DataTypes.INTEGER.UNSIGNED,
            field: 'BadgeInstanceID',
            allowNull: false,
        },
        SemesterID: {
            //The Semester 
            //Foreign Key
            type: DataTypes.INTEGER.UNSIGNED,
            field: 'SemesterID',
            allowNull: false,
            primaryKey: true
        },
        CourseID: {
            //The Course 
            //Foreign Key
            type: DataTypes.INTEGER.UNSIGNED,
            field: 'CourseID',
            allowNull: false,
            primaryKey: true
        },
        SectionID: {
            //The Section 
            //Foreign Key
            type: DataTypes.INTEGER.UNSIGNED,
            field: 'SectionID',
            allowNull: false,
            primaryKey: true
        },
        BadgeAwarded: {
            type: DataTypes.ENUM,
            field: 'BadgeAwarded',
            values: ['yes', 'no']
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
        tableName: 'userbadgeinstances'
    });
};