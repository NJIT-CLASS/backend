module.exports = function(sequelize, DataTypes) {
    return sequelize.define('Organization', {
        OrganizationID: {
            //Unique identifier for the organization
            type: DataTypes.INTEGER.UNSIGNED,
            field: 'OrganizationID',
            allowNull: false,
            primaryKey: true,
            autoIncrement: true,
            unique: true
        },
        Name: {
            //Name of the organization
            type: DataTypes.STRING(40),
            field: 'Name',
            allowNull: true,
        },
        Logo: {
            type: DataTypes.JSON,
            field: 'Logo',
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
        tableName: 'organization'
    });
};
