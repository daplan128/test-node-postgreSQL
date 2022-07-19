// Update with your config settings.
console.log('creando migraciones')
module.exports = {

    client: 'postgres',  
    connection: {
      user: process.env.USERNAME,
      password: process.env.PASSWORD,
      database: process.env.DB_NAME
    },
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: 'knex_migrations'
    }

};
