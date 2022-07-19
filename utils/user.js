var User = require('../models/user.js')
const iplocation = require("iplocation").default
const lookup = require('country-code-lookup')
var conn = require('../connections/db-connect')

var NormalError = require('./error')

function isAdmin(uid)
{
    return User.forge({id: uid}).fetch()
        .then((user) => {
            if (!user) {
                return false
            }
            console.log("got admin")
            return user.get('admin_flag')
        })
}

function isAdminOrOwner(uid, token_uid)
{
    return User.forge({id: token_uid}).fetch()
        .then((user) => {
            if (!user) {
                return false
            }
            if (uid === token_uid) {
                return true
            }

            return user.get('admin_flag')
        })
}

function isAdminOrOwnerMiddleware (req, res, next)
{
    isAdminOrOwner(parseInt(req.params.id), parseInt(req.jwt.user_id))
        .then((is_admin) => {
            if (is_admin)
            {
                next()
                return
            }

            throw NormalError.create('Admin or Owner only')
        })
        .catch((reason) => {
            if (reason.send_message) {
                res.send({errors: reason.message})
                return
            }

            console.log(reason)
            res.send({errors: [{msg: 'An error happened'}]})
        })
}

function isAdminMiddleware (req, res, next)
{
    isAdmin(req.jwt.user_id)
        .then((is_admin) => {
            if (is_admin)
            {
                console.log("calling next")
                next()
                return
            }

            throw NormalError.create('Admin only')
        })
        .catch((reason) => {
            if (reason.send_message) {
                res.send({errors: reason.message})
                return
            }

            console.log(reason)
            res.send({errors: [{msg: 'An error happened'}]})
        })
}

module.exports.isAdmin = isAdmin
module.exports.isAdminMiddleware = isAdminMiddleware
module.exports.isAdminOrOwnerMiddleware = isAdminOrOwnerMiddleware
