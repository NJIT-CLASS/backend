module.exports = function(sequelize, DataTypes) {
    return sequelize.define('UserLogin', {
        UserID: {
            type: DataTypes.INTEGER.UNSIGNED,
            field: 'UserID',
            allowNull: false,
            primaryKey: true
        },
        Email: {
            // official email of user
            type: DataTypes.STRING(70),
            field: 'Email',
            allowNull: false,
            unique: true
        },
        Password: {
            // hashed and salted password of user
            type: DataTypes.STRING,
            field: 'Password',
            allowNull: false
        },
        Pending: {
            // denotes a user who has yet to create a password
            type: DataTypes.BOOLEAN,
            field: 'Pending',
            allowNull: false,
            defaultValue: true
        },
        Attempts: {
            // number of incorrect password attempts since last successful login
            type: DataTypes.INTEGER.UNSIGNED,
            field: 'Attempts',
            allowNull: false,
            defaultValue: 0
        },
        Timeout: {
            // date and time after which user will be allowed to log in
            type: DataTypes.DATE,
            field: 'Timeout',
            allowNull: true
        },
        Blocked: {
            // denotes a user who has been manually blocked (only by administrator)
            type: DataTypes.BOOLEAN,
            field: 'Blocked',
            allowNull: false,
            defaultValue: false
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
        tableName: 'UserLogin'
    });
};
