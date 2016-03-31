/**
 * Created by cesarsalazar on 3/29/16.
 */

var Sequelize = require("sequelize");

var sequelize = new Sequelize('class', 'class', 'LC,m%HNpMsVqqNCHH7WAa6P7n', {
    host: 'njit-class-system.cofdnjjki73o.us-east-1.rds.amazonaws.com',
    dialect: 'mysql',

    pool: {
        max: 5,
        min: 0,
        idle: 10000
    },
});

var models = ['User','UserLogin','UserContact','Course'];



models.forEach(function(model) {
    module.exports[model] = sequelize.import(__dirname + '/' + model);
});


// describe relationships
(function(m) {
   // m.PhoneNumber.belongsTo(m.User);
   // m.Task.belongsTo(m.User);
    m.User.belongsTo(m.UserLogin, {foreignKey: 'UserID'});
    m.User.belongsTo(m.UserContact, {foreignKey: 'UserContactID'});
    m.Course.belongsTo(m.User,{foreignKey: 'CreatorID'});
    // m.Assignment.belongsTo(m.User, {foreignKey: 'UserID'});
  //  m.AssignmentSection.belongsTo(m.Section, {foreignKey: 'SectionID'});
    //m.User.hasMany(m.PhoneNumber);
})(module.exports);


module.exports.sequelize = sequelize;