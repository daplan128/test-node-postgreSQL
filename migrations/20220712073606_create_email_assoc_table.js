
exports.up = function(knex, Promise) {
    return knex.schema.createTable('email_assoc', function(table){
        table.increments('id')
        table.timestamps(true, true)

        //foreign keys
        table.integer('uid').unsigned().index().references('id').inTable('users')

        table.string('address')
        table.string('password')
    })  
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('email_assoc')
};
