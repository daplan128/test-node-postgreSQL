
exports.up = function(knex, Promise) {
    return knex.schema.createTable( 'tags', function(table){
        table.increments( 'id' )
        table.timestamps( true, true )
        
        //foreign keys
        table.integer( 'uid' ).unsigned().index().references('id').inTable('users')

        table.string( 'name', 100 )
    })  
};

exports.down = function(knex, Promise) {
    return kenx.schema.dropTable( 'tags' )
};
