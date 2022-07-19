var jwt = require('jsonwebtoken')

module.exports = (req, res, next) => {
    try
    {
        // get the token, it could be in the header
        // or in the body or in the authorization header
        var tokenToDecode = null
        if (req.headers.authorization) {
            tokenToDecode = req.headers.authorization
        } else if (req.query && req.query.token !== undefined) {
            tokenToDecode = req.query.token
        } else if (req.body && req.body.token) {
            tokenToDecode = req.body.token
        }
        var decoded = jwt.verify(tokenToDecode, process.env.JWT_SECRET)
        req.jwt = decoded
        next()
    }
    catch (err)
    {
        if (err.name === 'TokenExpiredError')
        {
            res.send({'errors': [{'msg': 'The token expired'}] })
            return
        }

        res.send({'errors': [{'msg': 'There was an error decoding the token'}] })
    }
}
