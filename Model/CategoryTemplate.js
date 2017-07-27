module.exports = function(sequelize, DataTypes) {
    return sequelize.define('CategoryTemplate', {
        CategoryTemplateID: {
            //Unique identifier for CategoryTemplate 
            type: DataTypes.INTEGER.UNSIGNED,
            field: 'CategoryTemplateID',
            allowNull: false,
            primaryKey: true,
            autoIncrement: true,
            unique: true
        },
        Name: {
            //Name of the Categorty.
            type: DataTypes.STRING,
            field: 'Name',
            allowNull: true
        },
        Description: {
            //Description of the Category
            type: DataTypes.TEXT,
            field: 'Description',
            allowNull: true
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
        tableName: 'categorytemplate'
    });
};