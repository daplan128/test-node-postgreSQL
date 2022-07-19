
exports.up = function(knex, Promise) {
    return knex('status').insert( [{name:'no_assoc'}, 
                                  {name:'has_assoc'}, 
                                  {name:'pending'},
                                  {name: 'approved'}] 
                                )  
};

exports.down = function(knex, Promise) {
    return knex('status').where( 'name', 'no_assoc').orWhere( {name:'has_assoc'} ).orWhere( {name:'pending'} ).orWhere({name: 'approved'}).del() 
};