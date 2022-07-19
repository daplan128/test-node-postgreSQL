
exports.up = function(knex, Promise) {
    return knex.schema.createTable( 'actions', function(table){
        table.increments('id')
        table.string( 'name', 45 )
    })
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable( 'actions' )
};
