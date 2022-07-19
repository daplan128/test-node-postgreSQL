function generateError(message) {
    var err = new Error()
    err.message = [{'msg': message}]
    err.send_message = true
    return err
}

module.exports.create = generateError
