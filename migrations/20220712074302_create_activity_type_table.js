
exports.up = function(knex, Promise) {
    return knex.schema.withSchema( process.env.RDS_DATABASE ).createTable( 'activity_type', function(table){
           table.timestamps(true, true)
           table.increments('id')
           table.string( 'name', 45 )
       })
   };
   
   exports.down = function(knex, Promise) {
     return knex.schema.withSchema( process.env.RDS_DATABASE ).dropTable( 'activity_type')
   };
   