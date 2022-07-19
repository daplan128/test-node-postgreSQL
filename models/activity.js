var connection = require('../connections/db-connect')

var User = require('./user.js')
var ActivityType = require('./activity_type.js')

var Activity = connection.orm.Model.extend({
    tableName: 'activity',
    user() {
        return this.belongsTo(User, 'uid')
    },
    activity_type() {
        return this.belongsTo(ActivityType, 'activity_id')
    },
    publicInfo() {
        var ret = {}

        ret.id = this.get('id')
        ret.user_id = this.get('uid')
        ret.activity_id = this.get('activity_id')
        ret.stagename = this.related('user').get('stagename')
        ret.profile_picture = this.related('user').get('profile_picture')
        ret.data = this.get('extra_info')
        ret.name = this.related('activity_type').get('name')
        return ret
    }
})

Activity.relatedModel = function() {
    var ret = []
    ret.push('user')
    ret.push('activity_type')
    return ret
}

module.exports = Activity
