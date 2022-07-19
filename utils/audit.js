var Action = require('../models/action.js')
var UserAction = require('../models/user_action.js')

function log(id, action, req, desc)
{
    if (!desc)
    {
        desc = ''
    }

    if (typeof(action) === 'string' || action instanceof String)
    {
        action = Action.getByName(action)
    }

    var uaObject = {}
    uaObject.uid = id
    uaObject.aid = action.get('id')
    uaObject.ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress
    uaObject.desc = desc

    UserAction.forge(uaObject).save()
}

module.exports.log = log
