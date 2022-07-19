
exports.up = function(knex, Promise) {
    return knex.schema.createTable('user_actions', function(table){
        table.increments('id')

        //foreign keys
        table.integer('uid').unsigned().index().references('id').inTable('users')
        table.integer('aid').unsigned().index().references('id').inTable('actions') 

        table.timestamps(true, true)

        table.string('ip', '20')
        table.text('desc', 'mediumtext')

    })  
};

exports.down = function(knex, Promise) {
    return knex.schema.dropTable('user_actions')  
};
