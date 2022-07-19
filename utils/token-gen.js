var jwt = require('jsonwebtoken')

var bluebird = require('bluebird')

var EmailAssoc = require('../models/email_assoc')

var InfoAssoc = require('../models/info_assoc')

function generate (permissions, user_id, exp_time) {
    exp_time = exp_time || "45d"

    // generate a new token
    var payload = {}
    payload.permissions = permissions
    payload.user_id = user_id

    var options = {}
    options.expiresIn = exp_time

    console.log('generating user token with data ' + JSON.stringify(payload))

    return jwt.sign(payload, process.env.JWT_SECRET, options)
}

function verifyEmail(redirectURL, user_id) {
    var exp_time = "30d"

    var payload = {}
    payload.user_id = user_id
    payload.redirect = redirectURL

    var options = {}
    options.expiresIn = exp_time

    console.log('Generating verify email token with: ' + JSON.stringify(payload))

    return jwt.sign(payload, process.env.JWT_SECRET, options)
}

function getPermissions(user_id) {
    var perms = ["email_assoc:create"]
    console.log('try to get permission')
    var ret = EmailAssoc.forge({uid: user_id}).fetch()
        .then((response) => {
            if (response != null)
            {
                console.log('add info assoc permission')
                perms.push('info_assoc:create')
            }

            return InfoAssoc.forge({uid: user_id}).fetch()
        })
        .then((info_assoc) => {
            if (info_assoc)
            {
                //add permision
            }
            return new bluebird.Promise((res, rej) => {
                res(perms)
            })
        })

    return ret
}

module.exports.generate = generate
module.exports.permissions = getPermissions
module.exports.verifyEmail = verifyEmail
