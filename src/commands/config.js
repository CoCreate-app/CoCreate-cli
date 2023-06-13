const config = require('@cocreate/config')

module.exports = async function (repos, args) {
    let object = {}
    for (let arg of args) {
        arg = arg.split('=')
        object[arg[0].substring(2)] = { value: arg[1] }
    }

    await config(object)

}
