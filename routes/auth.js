var express = require('express')
var router = express.Router()

var NormalError = require('../utils/error')

// models
var User = require('../models/user')

var UserUtil = require('../utils/user')

var user_routes = require('./user')

var auth_middleware = require('./auth_middle')

var info_routes = require('./info')

// check for jwt token
router.use(auth_middleware)

//add info and email routes
router.use(info_routes)

// add user routes
router.use(user_routes)


module.exports = router
