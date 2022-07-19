var express = require('express')
var assoc_router = express.Router()

var jwt_guard = require('express-jwt-permissions')({
    requestProperty: 'jwt'
})

var jwt = require('jsonwebtoken')

var TokenGenerator = require('../utils/token-gen')
var NormalError = require('../utils/error')
var Status = require('../models/status')
var User = require('../models/user')
var EmailAssoc = require('../models/email_assoc')
var InfoAssoc = require('../models/info_assoc')

assoc_router.post('/email_assoc', jwt_guard.check('email_assoc:create'), (req, res, next) => {
    req.checkBody('email', 'Invalid email param').isEmail()
    req.checkBody('password', 'Missing password param').notEmpty()

    req.getValidationResult().then((result) => {
        if (!result.isEmpty())
        {
            throw NormalError.create(result.array())
        }
        else
        {
            // check if there's an assoc with this email address
            return EmailAssoc.where('address', req.body.email).count('address')
        }
    })
        .then((number) => {
            if (parseInt(number) !== 0)
            {
                throw NormalError.create('Email address is taken')
            }

            // check if user has an email assoc
            return EmailAssoc.where('uid', req.jwt.user_id).count('id')
        })
        .then((number) => {
            if (parseInt(number) !== 0)
            {
                throw NormalError.create('User already has an email assoc')
            }

            // the email address is ok,
            // let's create the assoc
            return EmailAssoc.forge({address: req.body.email, password: req.body.password, uid: req.jwt.user_id}).save()
        })
        .then((emailAssoc) => {
            if (!emailAssoc) {
                throw NormalError.create('Email and pass not save')
            }
            return TokenGenerator.generate(["infouser_assoc:create"], req.jwt.user_id)
        })
        .then((token) => {
        // save metric here
            // CoreMetrics.EmailAccountCreated(req.jwt.user_id, req.body.email)
            console.log(token)
            res.send({'token': token,
				   'msg': 'Email assoc created'})
        })
        .catch((reason) => {
            console.log('email assoc failed ')
            console.log(reason)

            if (reason.send_message)
            {
                res.send({errors: reason.message})
                return
            }

            res.send({'errors': [{'msg': 'Adding email assoc failed'}] })
        })
})

assoc_router.post('/info_assoc', jwt_guard.check('infouser_assoc:create'), (req, res, next) => {
    /* req.checkBody('phone', 'Missing phone field').notEmpty() */
    var type_id
    var info_id
    // req.checkBody('full_name', 'Missing full_name field').notEmpty()
    req.getValidationResult().then((result) => {
        if (!result.isEmpty())
        {
            throw NormalError.create(result.array())
        }
        else
        {
            return InfoAssoc.where({uid: req.jwt.user_id}).count('id')
        }
    })
        .then((number) => {
            if (parseInt(number) > 0)
            {
                throw NormalError.create('User already has a seller assoc')
            }

            // create the seller assoc
            var info = {}
            info.phone = req.body.phone
            info.uid = req.jwt.user_id
            info.type_document = req.body.type_document
            info.document = req.body.document
            info.suspended_flag = 1
            
            return InfoAssoc.forge(info).save()
        })
        .then((info_assoc) => {
            if (!info_assoc) {
                throw NormalError.create('info assoc not created')
            }

            info_id = info_assoc.get('id')
            return User.forge({id: req.jwt.user_id}).fetch()
        })
        .then((user) => {
            if (user == null) {
                throw NormalError.create('info assoc not created')
            }
            Status.forge({'name': 'no_assoc'}).fetch().then((status) => {
                if (status == null) {
                    throw NormalError.create('Info assoc not created')
                }
                user.set('status_id', status.get('id')).save().then((model) => {
                    if (model == null) {
                        throw NormalError.create('Info assoc not created')
                    }
                    return TokenGenerator.permissions(req.jwt.user_id)
                })
                    .then((permissions) => {
                        return TokenGenerator.generate(permissions.slice(), req.jwt.user_id)
                    })
                    .then((token) => {
                        res.send({'token': token, 'msg': 'info assoc created'})
                    })
            })
        })
        .catch((reason) => {
            console.log('info assoc failed')
            console.log(reason)

            if (reason.send_message)
            {
                res.send({errors: reason.message})
                return
            }

            res.send({'errors': [{'msg': 'Adding info assoc failed'}]})
        })
})

module.exports = assoc_router