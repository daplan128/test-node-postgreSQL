var express = require('express')
var router = express.Router()
var jwt = require('jsonwebtoken')

var NormalError = require('../utils/error')

var Status = require('../models/status')

var TokenGenerator = require('../utils/token-gen')
var User = require('../models/user')

var InfoAssoc = require('../models/info_assoc')
var EmailAssoc = require('../models/email_assoc')

var ActivityType = require('../models/activity_type')

var Activity = require('../models/activity')

router.get('/', function(req, res){
    res.send('/api/v1')
})

router.get('/document/check', (req, res) => {
    InfoAssoc.forge({document: decodeURIComponent(req.query.document), type_document: decodeURIComponent(req.query.type)}).fetch()
        .then((document) => {
            if (document) {
                res.send({'msg': 'The provided document is already in use', 'code': 0})
            } else {
                res.send({'msg': 'The document is valid', 'code': 1})
            }
        })
})

router.get('/nickname/check', (req, res) => {
    User.where('stagename', decodeURIComponent(req.query.nickname)).count('stagename')
        .then((stagename_count) => {
            if(parseInt(stagename_count) !== 0) {
                res.send({'msg': 'The provided nickname is already in use', 'code': 0})
            } else {
                res.send({'msg': 'The nickname is valid', 'code': 1})
            }
        })
})

router.get('/phone/check', (req, res) => {
    InfoAssoc.where('phone', decodeURIComponent(req.query.phone)).count('phone')
        .then((phone_count) => {
            if(parseInt(phone_count) !== 0) {
                res.send({'msg': 'The provided phone is already in use', 'code': 0})
            } else {
                res.send({'msg': 'The phone is valid', 'code': 1})
            }
        })
})

router.get('/email/check', (req, res) => {
    EmailAssoc.where('address', decodeURIComponent(req.query.email)).count('address')
        .then((phone_count) => {
            if(parseInt(phone_count) !== 0) {
                res.send({'msg': 'The provided email is already in use', 'code': 0})
            } else {
                res.send({'msg': 'The email is valid', 'code': 1})
            }
        })
})

function register(req, res) {
    var new_uid
    var activity_id

    return req.getValidationResult().then((result) => {
        if (!result.isEmpty())
        {
            res.send({'errors': result.array()})
            throw new Error('validation error')
        }
        else
        {
            console.log('creating new user')
            // check if the user name is taken or not
            return ActivityType.forge({name: "created_account"}).fetch()
        }
    })
        .then((activity) => {
            if (!activity) {
                throw NormalError.create('No activity with that name')
            }
            activity_id = activity.get("id")
            return User.where('stagename', req.body.stagename).count('stagename')
        })
        .then((number) => {
            if (parseInt(number) !== 0)
            {
                res.send({'errors': [ {'msg': 'The stagename is taken'} ] })
                throw new Error('validation error')
            }

            return new Status({name: 'no_assoc'}).fetch()
        })
        .then((status) => {
        // generate a user
            var user_attr = {}
            user_attr.stagename = req.body.stagename

            //  studio account
            if (req.body.pid !== undefined) {
                user_attr.pid = req.body.pid
            }

            var newUser = new User(user_attr)

            return newUser.set('status_id', status.id).save()
        })
        .then((user) => {
            new_uid = user.get('id')
            var data = {"stagename": user.get("stagename")}
            var info = {}
            info.uid = user.get("id")
            info.activity_id = activity_id
            info.extra_info = JSON.stringify(data)
            return Activity.forge(info).save()
        })
}

router.post('/register', (req, res) => {
    req.checkBody('stagename', 'Missing stagename param').notEmpty()

    var new_uid
    
    register(req, res)
        .then((activity) => {
            if (activity == null) {
                throw NormalError.create('Activity Log not created')
            }

            new_uid = activity.get('uid')
            return User.forge({id: new_uid}).fetch()
        })
        .then((user) => {
            if (!user) {
                throw new Error('User no register')
            }
            return TokenGenerator.generate(["email_assoc:create"], new_uid)
        })
        .then((token) => {
            console.log(token)
            if(!token) {
                throw new Error('No generate token')
            }
            res.send({'token': token, 'id': new_uid})
        })
        .catch((reason) => {
            if (reason.message === 'validation error')
            {
                console.log('validation error')
                console.log(reason)
            }
            else
            {
                console.log('registration error ' + reason)
                res.send({'errors': [ {'msg': 'There was an error generating the token'} ] })
            }
        })
})

router.all('/register', (req, res) => {
    res.sendStatus(405)
})

module.exports = router
