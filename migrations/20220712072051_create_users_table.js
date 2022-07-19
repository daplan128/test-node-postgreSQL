
exports.up = function(knex, Promise) {
    return knex.schema.withSchema( process.env.RDS_DATABASE ).createTable( 'users', function(table){
        table.increments('id')
        table.timestamps(true, true)

        //foreign keys
        table.integer('status_id').unsigned().index().references('id').inTable('status')

        table.integer('pid').unsigned().index().references('id').inTable('users')

        table.string( 'stagename', 45)
        table.string( 'profile_picture', 100)
    })  
};

exports.down = function(knex, Promise) {
    return knex.schema.withSchema( process.env.RDS_DATABASE ).dropTable( 'users' )
};
