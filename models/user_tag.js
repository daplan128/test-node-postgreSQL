var connection = require('../connections/db-connect')

var User = require('./user.js')

var UserTag = connection.orm.Model.extend({
    tableName: 'tags',
    user() {
        return this.belongsTo(User)
    },
    publicInfo() {
        var ret = {}

        ret.id = this.get('id')
        ret.uid = this.get('uid')
        ret.name = this.get('name')

        return ret
    }
})

UserTag.validationSchema = {
    'name': {
        in: 'body',
        notEmpty: true
    }
}
UserTag.whitelist = {
    update: ['name'],
    create: ['name','uid']
}

UserTag.integrityCheck = {}

UserTag.integrityCheck.create = function(params)
{
    console.log(User)
    return User.forge({id: params.uid}).fetch()
        .then((user) => {
            if (user == null)
            {
                return {'error': 'No user with that id'}
            }
            else
            {
                return true
            }
        })
}

// access rights
UserTag.access = {}

function checkOwner(params)
{
    return User.forge({id: params.uid}).fetch()
        .then((user) =>
        {
            if (user == null)
            {
                return false
            }

            return true
        })
}

function checkOwnerUD(params)
{
    return UserTag.forge({id: params.id}).fetch()
        .then((user_tag) => {
            if (user_tag == null) {
                return false
            }

            if (user_tag.get('uid') !== params.uid) {
                return false
            }

            params.uid = user_tag.get('uid')

            return checkOwner(params)
        })
}

UserTag.access.create = checkOwner
UserTag.access.read = null
UserTag.access.update = checkOwnerUD
UserTag.access.delete = checkOwnerUD

module.exports = UserTag
