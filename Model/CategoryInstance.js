module.exports = function(sequelize, DataTypes) {
    return sequelize.define('CategoryInstance', {
        CategoryInstanceID: {
            //Unique identifier for CategoryInstance 
            type: DataTypes.INTEGER.UNSIGNED,
            field: 'CategoryInstanceID',
            allowNull: false,
            primaryKey: true,
            autoIncrement: true,
            unique: true
        },
        CategoryID: {
            type: DataTypes.INTEGER.UNSIGNED,
            field: 'CategoryID',
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
        Tier1Instances: {
            type: DataTypes.INTEGER.UNSIGNED,
            field: 'Tier1Instances',
            allowNull: false
        },
        Tier2Instances: {
            type: DataTypes.INTEGER.UNSIGNED,
            field: 'Tier2Instances',
            allowNull: false
        },
        Tier3Instances: {
            type: DataTypes.INTEGER.UNSIGNED,
            field: 'Tier3Instances',
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
        tableName: 'categoryinstance'
    });
};