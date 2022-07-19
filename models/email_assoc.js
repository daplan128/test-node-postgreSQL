var connection = require('../connections/db-connect')

var User = require('./user.js')

var EmailAssoc = connection.orm.Model.extend({
    tableName: "email_assoc",
    user() {
        return this.belongsTo(User, "uid")
    }
})

module.exports = EmailAssoc
