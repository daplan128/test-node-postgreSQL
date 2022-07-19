var connection = require('../connections/db-connect')

var Action = require('./action.js')
var User = require('./user.js')

var UserAction = connection.orm.Model.extend({
    tableName: 'user_actions',
    action() {
        return this.belongsTo(Action, 'aid')
    },
    user() {
        return this.belongsTo(User, 'uid')
    },
    publicInfo() {
        var ret = {}

        ret.uid = this.get('uid')
        ret.aid = this.get('aid')
        ret.desc = this.get('desc')
        ret.ip = this.get('ip')

        return ret
    }
})

module.exports = UserAction
