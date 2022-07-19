var connection = require('../connections/db-connect')

var ActivityType = connection.orm.Model.extend({
    tableName: 'activity_type'
})

ActivityType.prototype.toPublic = function() {
    return {name: this.get("name"), id: this.get("id")}
}

module.exports = ActivityType
