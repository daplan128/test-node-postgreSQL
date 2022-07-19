
exports.up = function(knex, Promise) {
    return knex.schema.withSchema( process.env.RDS_DATABASE ).createTable( 'status', function(table){
           table.increments('id')
           table.string( 'name', 45 )
       })
   };
   
   exports.down = function(knex, Promise) {
     return knex.schema.withSchema( process.env.RDS_DATABASE ).dropTable( 'status')
   };
   