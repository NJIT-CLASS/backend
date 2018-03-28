module.exports = function(sequelize, DataTypes) {
    return sequelize.define('User', {
        UserID: {
            //Unique identifier for the user.
            type: DataTypes.INTEGER.UNSIGNED,
            field: 'UserID',
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            unique: true
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
        Instructor: {
            type: DataTypes.BOOLEAN,
            field: 'Instructor',
            allowNull: false,
            defaultValue: false
        },
        Admin: {
            //Indicate whether the user is Admin
            type: DataTypes.BOOLEAN,
            field: 'Admin',
            allowNull: false,
            defaultValue: false
        },
        OrganizationGroup: {
            //Array of organization IDs to which the user is part of
            type: DataTypes.JSON,
            field: 'OrganizationGroup',
            allowTrue: true
        },
        Role: {
            //Official first name of the user
            type: DataTypes.STRING(40),
            field: 'Role',
            allowNull: true
        }
        // Test: {
        //     type: DataTypes.BOOLEAN,
        //     field: 'Test',
        //     allowNull: false,
        //     defaultValue: false
        // },
<<<<<<< HEAD
       
=======
        //Role: {
            //Official first name of the user
        //    type: DataTypes.STRING(40),
        //    field: 'Role',
         //   allowNull: true
        //}
>>>>>>> caton
        //UserType: {
        //    //User type either instructor or student
        //    //Instructor Boolean?????
        //    type: DataTypes.STRING,
        //    allowNull: true,
        //    field: 'UserType',
        //    validate: {
        //        isIn: [
        //            ['Student', 'Instructor']
        //        ]
        //    }
        //},
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
        tableName: 'user',


    });
};
