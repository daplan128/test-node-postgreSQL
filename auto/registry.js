// registry that holds all the
// auto generated routes that
// we need
var registry = {}

// base template for options
var baseTemplate = {
    auth: false,
    before: null,
    after: null,
    perms: null,
    admin: false
}

var auth = require('../routes/auth_middle')

var user_util = require('../utils/user.js')

// baseName for the route, eg: tags
// typeOfRoutes any characters from the CRUD list
// based on those we'll generate express routes
function add(baseName, typeOfRoutes, model)
{
    registry[baseName] = registry[baseName] || {}
    registry[baseName].types = typeOfRoutes
    registry[baseName].model = model

    var verbs = {'c': '', 'r': '', 'u': '', 'd': '', 'l': '', 't': ''}

    for (var v in verbs)
    {
        // object with info for create
        var info = Object.assign({}, baseTemplate)
        info.before = []
        info.after = []
        info.perms = []
        registry[baseName][v] = info
    }
}

function setAuth(baseName, verb, auth)
{
    registry[ baseName ][verb].auth = auth
}

function setAdmin(baseName, verb, admin)
{
    registry[ baseName ][verb].admin = admin

    if (admin === true)
    {
        setAuth(baseName, verb, true)
    }
}

function beforeHook(baseName, verb, handler)
{
    registry[ baseName ][verb].before.push(handler)
}

function afterHook(baseName, verb, handler)
{
    registry[ baseName ][verb].after.push(handler)
}

function getMiddleware(baseName, verb, handler)
{
    var routeInfo = registry[baseName]

    var middle = []

    if (routeInfo[verb].auth)
    {
        middle.push(auth)
    }

    // push admin check
    if (routeInfo[verb].admin)
    {
        middle.push((req, res, next) => {
            user_util.isAdmin(req.jwt.user_id)
                .then((is_admin) =>
                {
                    if (is_admin)
                    {
                        next()
                        return
                    }

                    // end the middleware chain here
                    res.send({errors: [{msg: 'Must be admin'}]})
                })
        })
    }

    // before hooks
    middle = middle.concat(routeInfo[verb].before)

    // add validation if needed
    if ((verb === 'c' || verb === 'u') && routeInfo.model.validationSchema)
    {
        // we need to create a middlewere here
        // we need to wait for the validation schema
        // and then decide if we'll continue to follow the routes or not
        var validator = (req, res, next) =>
        {
            // need to check if it's an update or create
            if (verb === 'c')
            {
                req.check(routeInfo.model.validationSchema)
            }
            else
            {
                // filter out the fields we can't update
                var updateSchema = {}
                var wlUpdate = routeInfo.model.whitelist.update

                for (var index in wlUpdate)
                {
                    var fn = wlUpdate[index]
                    updateSchema[ fn ] = routeInfo.model.validationSchema[ fn ]
                }

                req.check(updateSchema)
            }

            req.getValidationResult().then((result) => {
                if (!result.isEmpty())
                {
                    res.send({'errors': result.array()})
                    return
                }
                handler(req, res, next)
            })
        }

        middle.push(validator)
    }
    else
    {
        // current route
        middle.push(handler)
    }

    // after hooks
    middle = middle.concat(routeInfo[verb].after)
    // need to stop the middleware chain
    middle.push((req, res) => {})

    return middle
}

module.exports.add = add
module.exports.setAuth = setAuth
module.exports.setAdmin = setAdmin
module.exports.beforeHook = beforeHook
module.exports.afterHook = afterHook
module.exports.getMiddleware = getMiddleware
