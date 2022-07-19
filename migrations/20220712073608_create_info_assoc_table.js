
exports.up = function(knex, Promise) {
    return knex.schema.createTable('info_assoc', function(table){
        table.increments('id')
        table.timestamps(true, true)

        //foreign keys
        table.integer('uid').unsigned().index().references('id').inTable('users')
        table.string( 'address' )
        table.string( 'phone' )
        table.string( 'full_name' )
        table.text('country')
        table.text('postal_code')
        table.date('date_of_birth')
        table.string('sex', 32)
        table.text( 'location' )
        table.boolean('suspended_flag')
        table.string( 'suspended_reason' )
    })  
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('info_assoc')
};
