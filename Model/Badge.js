module.exports = function(sequelize, DataTypes) {
    return sequelize.define('Badge', {
        BadgeID: {
            //Unique identifier for Badge 
            type: DataTypes.INTEGER.UNSIGNED,
            field: 'BadgeID',
            allowNull: false,
            primaryKey: true,
            autoIncrement: true,
            unique: true
        },
        CategoryID: {
            //The Badge Category
            //Foreign Key
            type: DataTypes.INTEGER.UNSIGNED,
            field: 'CategoryID',
            allowNull: false
        },
        Name: {
            //Name of the Badge.
            type: DataTypes.STRING,
            field: 'Name',
            allowNull: false
        },
        Description: {
            //Description of the Badge
            type: DataTypes.TEXT,
            field: 'Description',
            allowNull: true
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
        tableName: 'Badges'
    });
};