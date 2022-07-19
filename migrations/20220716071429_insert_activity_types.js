
exports.up = function(knex, Promise) {
    return knex('activity_type').insert( [{name:'created_account'}] 
                                )  
};

exports.down = function(knex, Promise) {
    return knex('activity_type').where( {name:'created_account'} ).del() 
};