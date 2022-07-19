var connection = require('../connections/db-connect')

var Status = connection.orm.Model.extend({
    tableName: 'status'
})

Status.prototype.toPublic = function() {
    return {name: this.get("name"), id: this.get("id")}
}

module.exports = Status
