/**
 * Created by cesarsalazar on 3/29/16.
 */

var Sequelize = require("sequelize");

var sequelize = new Sequelize('class', 'class', '', {
    host: '',
    dialect: '',

    pool: {
        max: 5,
        min: 0,
        idle: 10000
    },
});

var models = ['User','UserLogin','UserContact','Assignment','AssignmentSection','Section'];



models.forEach(function(model) {
    module.exports[model] = sequelize.import(__dirname + '/' + model);
});


// describe relationships
(function(m) {
   // m.PhoneNumber.belongsTo(m.User);
   // m.Task.belongsTo(m.User);
    m.User.belongsTo(m.UserLogin, {foreignKey: 'UserID'});
    m.User.belongsTo(m.UserContact, {foreignKey: 'UserContactID'});
    m.Assignment.belongsTo(m.User, {foreignKey: 'UserID'});
    m.AssignmentSection.belongsTo(m.Section, {foreignKey: 'SectionID'});
    //m.User.hasMany(m.PhoneNumber);
})(module.exports);


module.exports.sequelize = sequelize;