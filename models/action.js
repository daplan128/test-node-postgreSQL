var connection = require('../connections/db-connect')

var Action = connection.orm.Model.extend({
    tableName: 'actions'
})

Action.all = [
    Action.forge({id: 1, name: 'created_account'}),
    Action.forge({id: 2, name: 'created_info_assoc'}),
    Action.forge({id: 3, name: 'created_buy_assoc'}),
    Action.forge({id: 4, name: 'created_admin'}),
    Action.forge({id: 10, name: 'generate_token'})
]

Action.getByName = function (name) {
    return Action.all.find((action) => {
        if (action.get('name') === name)
        {
            return action
        }
    })
}

module.exports = Action
