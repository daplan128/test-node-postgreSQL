//  knex
var knex = require('knex')({
    client: 'postgresql',
    connection: {
        host: process.env.HOSTNAME,
        user: process.env.USERNAME,
        password: process.env.PASSWORD,
        database: process.env.DB_NAME,
        charset: 'utf8mb4'
    }
})
//  knex end

//  testing mysql connection at the start of the app
knex.raw("SELECT 1+1 AS solution")
    .then(() => {
        console.log("CONNECTION TO DATABASE OK")
    })
    .catch(() => {
        console.log("CANNOT CONNECT TO DATABASE")
    }).toString()

//  loading bookshelf

var bookshelf = require('bookshelf')(knex)

//  enable soft-delete
bookshelf.plugin(require('bookshelf-paranoia'))

//  enable pagination
bookshelf.plugin('pagination')

module.exports.db = knex
module.exports.orm = bookshelf
