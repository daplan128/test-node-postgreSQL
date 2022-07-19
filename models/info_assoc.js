var connection = require('../connections/db-connect')

var User = require('./user')

var SellerAssoc = connection.orm.Model.extend({
    tableName: 'info_assoc',
    user() {
        return this.hasOne(User, 'id', 'uid')
    },
    publicInfo() {
    	var ret = {}
    	ret.address = this.get('address')
    	ret.full_name = this.get('full_name')
        ret.phone = this.get('phone')
        ret.country = this.get('country')
        ret.type_document = this.get('type_document')
        ret.document = this.get('document')
        ret.postal_code = this.get('postal_code')
        ret.date_of_birth = this.get('date_of_birth')
        ret.sex = this.get('sex')
        ret.location = this.get('location')
        ret.suspended_flag = this.get('suspended_flag')
        ret.suspended_reason = this.get('suspended_reason')
    	return ret
    }
})

module.exports = SellerAssoc
