var express = require('express')
var router = express.Router()
var conn = require('../../connections/db-connect')
var User = require('../../models/user')
var InfoAssoc = require('../../models/info_assoc')

var NormalError = require('../../utils/error')


router.get('/me', (req, res, next) => {
    User.forge({id: req.jwt.user_id}).fetch().then((user) => {
        if (user == null)
        {
            console.log('getting a me request with a user id that doesn\'t exist anymore')
            res.send({'errors': [ {'msg': 'No user with that id'} ] })
        }
        else
        {
            var ret = user.toPublic()
            ret.id = user.get('id')


            EmailAssoc.forge({uid: ret.id}).fetch()
                .then((email) => {
                    if (email) {
                        ret.email = email.get("address")
                    }
                    return TwitterAssoc.forge({uid: ret.id}).fetch()
                })
        }
    })
})

router.post('/reset_password', (req, res) => {
    req.checkBody('old_password', 'Missing old password param').notEmpty()
    req.checkBody('new_password', 'Missing new password param').notEmpty()
    req.getValidationResult().then((result) => {
        if (!result.isEmpty())
        {
            throw NormalError.create(result.array())
        }
        else
        {
            // check if there's an assoc with this email address
            return EmailAssoc.forge({uid: req.jwt.user_id}).fetch()
        }
    })
        .then((user) => {
            if (user) {
                console.log(user)
                if (user.get("password") === req.body.old_password) {
                    return EmailAssoc.where({uid: req.jwt.user_id}).save({password: req.body.new_password}, {method: 'update'})
                }
                else {
                    throw NormalError.create("Current password is incorrect")
                }
            } else {
                throw NormalError.create("No user with this email")
            }
        })
        .then((user) => {
            res.send({'msg': 'Password changed'})
        })
        .catch((reason) => {
            console.log(reason)
            console.log("Change password error" + reason.message[0].msg)
            res.send({'errors': [{'msg': 'An error occured: ' + reason.message[0].msg}]})
        })
})

router.post('/save/personal/info', (req, res) => {
    InfoAssoc.forge(req.jwt.user_id).fetch()
        .then((user) => {
            if (!user) {
                throw NormalError.create('Not user with that id')
            }
            var info = {
                full_name: req.body.name,
                country: req.body.country,
                postal_code: req.body.postal_code,
                date_of_birth: req.body.date_of_birth,
                sex: req.body.sex,
                location: req.body.location + '/' + req.body.city
            }
            return InfoAssoc.where({uid: user.get('id')}).save({info}, {method: 'update'})
        })
        .then((info)=> {
            if(!info) {
                throw NormalError.create('it was not possible to update the information')
            }
            res.send('ok')
        })
        .catch((reason) => {
            console.log(reason)
            res.send({'errors': [{'msg': 'An error occured: ' + reason.message[0].msg}]})
        })
})

module.exports = router