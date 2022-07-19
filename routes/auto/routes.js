var bluebird = require('bluebird')

var express = require('express')
var router = express.Router()
var auto = require('./auto-endpoints.js')

var common_error = require('../../utils/error')

console.log(auto.registry)

function runIntegrityCheck(integrityCheck, whitelist, from)
{
    // no integrity check
    // just skip it
    if (!integrityCheck)
    {
        return new bluebird.Promise((res, rej) => {
            res(true)
        })
    }

    // need to gather info for
    // whitelist fields
    var fields = {}

    for (var index in whitelist)
    {
        var field_name = whitelist[index]
        fields[field_name] = from[field_name]
    }

    return integrityCheck(fields)
}

function makeModelFromWhitelist(whitelist, from)
{
    var ret = {}

    for (var index in whitelist)
    {
        var fn = whitelist[index]
        ret[ fn ] = from[ fn ]
    }

    return ret
}

function createMiddleware(baseName) {
    return (req, res, next) => {
        var routeInfo = auto.registry[baseName]
        var model = routeInfo.model

        if (model.access.create) {
            req.body.uid = req.jwt.user_id
        }

        runIntegrityCheck(model.integrityCheck.create, routeInfo.model.whitelist.create, req.body)
            .then((result) => {
                if (result === true)
                {
                    return true
                }
                else
                {
                    throw common_error.create(result.error)
                }
            })
            .then((res) => {
            // check if there is an access defined
                if (model.access.create)
                {
                    req.body.uid = req.jwt.user_id
                    return model.access.create(req.body)
                }

                return true
            })
            .then((access) => {
                if (access)
                {
                    var info = makeModelFromWhitelist(model.whitelist.create, req.body)
                    return model.forge(info).save()
                }

                throw common_error.create("You don't own this object")
            })
            .then((model) => {
                if (model) {
                    if (model.publicInfo)
                    {
                        var info = model.publicInfo()
                        res.send({
                            'msg': 'success',
                            'model': info
                        })
                    }
                    else
                    {
                        res.send({'msg': 'success'})
                    }

                    next()
                }
                else {
                    throw common_error.create('There was an error')
                }
            })
            .catch((reason) => {
                if (reason.send_message)
                {
                    res.send({'errors': reason.message})
                    next()
                    return
                }

                console.log(reason)
                res.send({'errors': [{'msg': 'There was an error'}]})
                next()
            })
    }
}

function readMiddleware(baseName) {
    return (req, res, next) => {
        var routeInfo = auto.registry[baseName]
        var model = routeInfo.model

        var access_promise = new bluebird.Promise((res, rej) => {
            if (model.access.read)
            {
                req.body.uid = req.jwt.user_id
                req.body.id = req.params.id
                model.access.read(req.body)
                    .then((result) => {
                        res(result)
                    })
            }
            else
            {
                res(true)
            }
        })

        access_promise.then((access) => {
            if (access)
            {
                return model.forge({id: req.params.id}).fetch()
            }

            throw common_error.create("You don't own this object")
        })
            .then((model) => {
                if (model)
                {
                    res.send(model.publicInfo())
                    next()
                    return
                }

                throw common_error.create('No object with that id')
            })
            .catch((reason) => {
                if (reason.send_message)
                {
                    res.send({'errors': reason.message})
                }
                else
                {
                    console.log(reason)
                    res.send({'errors': [{msg: 'There was an error'}]})
                }

                next()
            })
    }
}

function listMiddleware(baseName) {
    return (req, res, next) => {
        var routeInfo = auto.registry[baseName]
        var model = routeInfo.model

        model.fetchAll()
            .then((collection) => {
                var publicCollection
                try {
                    publicCollection = collection.map((model) => { return model.fullInfo() })
                }
                catch (e) {
                    publicCollection = collection.map((model) => { return model.publicInfo() })
                }
                res.send(publicCollection)
            })
            .catch((reason) => {
                console.log(reason)

                res.send({ errors: [{msg: 'There was an error'}] })
            })
    }
}

function listPaginatedMiddleware(baseName) {
    return (req, res, next) => {
        var routeInfo = auto.registry[baseName]
        var model = routeInfo.model
        var relatedData
        try {
            relatedData = model.relatedModel()
        }
        catch (e) {
            relatedData = []
        }
        model.fetchPage({page: req.params.page, pageSize: req.params.size, withRelated: relatedData})
            .then((collection) => {
                var publicCollection
                try {
                    publicCollection = collection.map((model) => { return model.fullInfo() })
                }
                catch (e) {
                    console.log("No fullInfo available => getting publicInfo")
                    publicCollection = collection.map((model) => { return model.publicInfo() })
                }
                res.send(publicCollection)
            })
            .catch((reason) => {
                console.log(reason)

                res.send({ errors: [{msg: 'There was an error'}] })
            })
    }
}

function tailMiddleware(baseName) {
    return (req, res, next) => {
        var routeInfo = auto.registry[baseName]
        var model = routeInfo.model

        model.query('orderBy', 'id', 'DESC')
            .query('limit', req.params.size)
            .fetchAll()
            .then((collection) => {
                res.send(collection.map((m) => m.publicInfo()))
            })
            .catch((reason) => {
                console.log(reason)

                res.send({errors: [{msg: 'There was an error'}] })
            })
    }
}

function tailPaginatedMiddleware(baseName) {
    return (req, res, next) => {
        var routeInfo = auto.registry[baseName]
        var model = routeInfo.model
        var relatedData
        try {
            relatedData = model.relatedModel()
        }
        catch (e) {
            relatedData = []
        }
        model.query('orderBy', 'id', 'DESC')
            .fetchPage({page: req.params.page, pageSize: req.params.size, withRelated: relatedData})
            .then((collection) => {
                var publicCollection
                try {
                    publicCollection = collection.map((model) => { return model.fullInfo() })
                }
                catch (e) {
                    console.log("No fullInfo available => getting publicInfo")
                    publicCollection = collection.map((model) => { return model.publicInfo() })
                }
                res.send(publicCollection)
            })
            .catch((reason) => {
                console.log(reason)

                res.send({ errors: [{msg: 'There was an error'}] })
            })
    }
}

function updateMiddleware (baseName) {
    return (req, res, next) => {
        var routeInfo = auto.registry[baseName]
        var model = routeInfo.model

        runIntegrityCheck(model.integrityCheck.update, model.whitelist.update, req.body)
            .then((result) => {
                if (result === true)
                {
                    if (model.access.update)
                    {
                        req.body.uid = req.jwt.user_id
                        req.body.id = req.params.id
                        return model.access.update(req.body)
                    }

                    return true
                }
                else
                {
                    throw common_error.create(result.error)
                }
            })
            .then((access) => {
                if (access)
                {
                    return model.forge({id: req.params.id}).fetch()
                }

                throw common_error.create("You don't own this object")
            })
            .then((m) => {
                if (m) {
                    var info = makeModelFromWhitelist(model.whitelist.update, req.body)
                    m.set(info)

                    return m.save()
                }

                throw common_error.create('There was an error')
            })
            .then((m) => {
                if (m) {
                    if (m.publicInfo) {
                        res.send({
                            'msg': 'success',
                            'model': m.publicInfo()
                        })
                    }
                    else {
                        res.send({'msg': 'success'})
                    }
                    next()
                    return
                }

                throw common_error.create('There was an error')
            })
            .catch((reason) => {
                if (reason.send_message)
                {
                    res.send({errors: reason.message})
                }
                else
                {
                    console.log(reason)
                    res.send({errors: [{msg: 'There was an error'}]})
                }

                next()
            })
    }
}

function deleteMiddleware(baseName) {
    return (req, res, next) => {
        var routeInfo = auto.registry[baseName]
        var model = routeInfo.model

        var access_promise = new bluebird.Promise((res, rej) => {
            if (model.access.delete)
            {
                req.body.uid = req.jwt.user_id
                req.body.id = req.params.id
                model.access.delete(req.body)
                    .then((result) => {
                        res(result)
                    })
            }
            else
            {
                res(true)
            }
        })

        access_promise.then((access) => {
            if (access)
            {
                return model.forge({id: req.params.id}).destroy()
            }

            throw common_error.create("You don't own this object")
        })
            .then((result) => {
                if (result)
                {
                    res.send({'msg': 'Object deleted'})
                    next()
                    return
                }

                throw common_error.create('There was an error')
            })
            .catch((reason) => {
                if (reason.send_message)
                {
                    res.send({'error': reason.message})
                }
                else
                {
                    console.log(reason)
                    res.send({'error': [{msg: 'There as an error'}]})
                }

                next()
            })
    }
}

// going thru all the entire registry
for (var baseName in auto.registry)
{
    var routeInfo = auto.registry[baseName]
    var types = routeInfo.types
    var middle

    console.log('Generating routes for ' + baseName)
    console.log('Type of operations for ' + baseName + ' ' + types)

    // generate route for each type of route
    if (types.indexOf('c') !== -1)
    {
        console.log('added post route for ' + baseName)

        middle = auto.getMiddleware(baseName, 'c', createMiddleware(baseName))

        router.post(baseName, middle)
    }

    if (types.indexOf('r') !== -1)
    {
        console.log('added get route for ' + baseName)

        middle = auto.getMiddleware(baseName, 'r', readMiddleware(baseName))

        router.get(baseName + '/:id', middle)
    }

    if (types.indexOf('t') !== -1)
    {
        // add a route for getting the tail list of object
        console.log('added tail route for ' + baseName)

        var tailMiddle = auto.getMiddleware(baseName, 't', tailMiddleware(baseName))

        router.get(baseName + '/tail/:size', tailMiddle)

        // add a route for getting a paginated list of object
        console.log('added paginated tail route for ' + baseName)

        var tailPaginatedMiddle = auto.getMiddleware(baseName, 'l', tailPaginatedMiddleware(baseName))

        router.get(baseName + '/tail/:page/:size', tailPaginatedMiddle)
    }

    if (types.indexOf('l') !== -1)
    {
        // add a route for getting a list of object
        console.log('added list route for ' + baseName)

        var listMiddle = auto.getMiddleware(baseName, 'l', listMiddleware(baseName))

        router.get(baseName, listMiddle)

        // add a route for getting a paginated list of object
        console.log('added paginated list route for ' + baseName)

        var listPaginatedMiddle = auto.getMiddleware(baseName, 'l', listPaginatedMiddleware(baseName))

        router.get(baseName + '/:page/:size', listPaginatedMiddle)
    }

    if (types.indexOf('u') !== -1)
    {
        console.log('added update route for ' + baseName)

        middle = auto.getMiddleware(baseName, 'u', updateMiddleware(baseName))

        router.post(baseName + '/:id', middle)
    }

    if (types.indexOf('d') !== -1)
    {
        console.log('added delete route for ' + baseName)

        middle = auto.getMiddleware(baseName, 'd', deleteMiddleware(baseName))

        router.delete(baseName + '/:id', middle)
    }
}

module.exports = router
