module.exports = function(sequelize, DataTypes) {
    return sequelize.define('TestUser', {
        X: {
            //Unique identifier for the user.
            type: DataTypes.INTEGER.UNSIGNED,
            field: 'X',
            allowNull: false,
            autoIncrement: true
        },
        FirstName: {
            //Official first name of the user
            type: DataTypes.STRING(40),
            field: 'FirstName',
            allowNull: true
        },
        LastName: {
            //Official last name of the user
            type: DataTypes.STRING(40),
            field: 'LastName',
            allowNull: true
        },
        Email: {
            type: DataTypes.STRING(60),
            field: 'LastName',
            allowNull: true
        },
        Test: {
            type: DataTypes.BOOLEAN,
            field: 'Test',
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
        tableName: 'TestUser',


    });
};
