var connection = require('../connections/db-connect')

var User = connection.orm.Model.extend({
    tableName: 'users',
    status() {
        return this.belongsTo(require('./status.js'), 'status_id')
    },
    parent() {
        return this.belongsTo(User, 'pid')
    },
    photos() {
        return this.hasMany(Photo, 'uid')
    },  
    fullInfo() {
        var ret = {}
        ret.admin_flag = this.get("admin_flag")
        ret.id = this.get("id")
        ret.stagename = this.get("stagename")
        ret.status = this.related("status").get("name")
        ret.profile_picture = this.get("profile_picture")
        ret.pib = this.get("pib")
        return ret
    }
})

User.relatedModel = function() {
    var ret = []
    ret.push('status')
    return ret
}

User.prototype.toPublic = function () {
    return { id: this.get("id"), stagename: this.get("stagename"), profile_picture: this.get("profile_picture"), admin_flag: this.get("admin_flag"), pib: this.get("pib")}
}

User.validationSchema = {
    'id': {
        in: 'body',
        notEmpty: true,
        isInt: { errorMessage: 'Invalid user id' }
    },
    'stagename': {
        in: 'body',
        notEmpty: false
    },
    'profile_picture': {
        in: 'body',
        notEmpty: false
    }
}

User.whitelist = {
    update: ['stagename', 'profile_picture']
}

User.integrityCheck = {}

// access rights
User.access = {}

function checkOwner(params)
{
    var stagenameTaken = 0
    return User.forge({stagename: params.stagename}).fetch()
        .then((user) => {
            if (user != null && user.get('id') !== params.uid)
            {
                stagenameTaken = 1
            }
            return User.forge({id: params.id}).fetch()
        })
        .then((response) => {
            if (response == null)
            {
                return false
            }
            if (response.get('id') !== params.uid)
            {
                return false
            }
            if (stagenameTaken === 1)
            {
                return false
            }

            return true
        })
}

User.access.update = checkOwner

module.exports = User
