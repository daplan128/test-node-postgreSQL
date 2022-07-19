exports.up = function(knex, Promise) {
    return knex.schema.table('info_assoc', function (table) {
        table.string('type_document')
        table.text('document')
    })
}

exports.down = function(knex, Promise) {
    return knex.schema.table('info_assoc', function (table) {
        table.dropColumn('type_document')
        table.dropColumn('document')
    })
}
