
exports.up = function(knex, Promise) {
    return knex.schema.withSchema( process.env.RDS_DATABASE ).createTable( 'activity', function(table){
           table.increments('id')
           table.timestamps(true, true)
           //foreign keys
           table.integer('uid').unsigned().index().references('id').inTable('users')
           table.integer('activity_id').unsigned().index().references('id').inTable('activity_type')
           table.json('extra_info').nullable()
       })
   };
   
   exports.down = function(knex, Promise) {
     return knex.schema.withSchema( process.env.RDS_DATABASE ).dropTable( 'activity')
   };
   