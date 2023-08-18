const config = require('@cocreate/config')

module.exports = async function (repos, args) {
    let object = {}
    for (let arg of args) {
        arg = arg.split('=')
        if (arg[0].startsWith('--'))
            arg[0] = arg[0].substring(2)

        object[arg[0]] = { value: arg[1] }
    }

    await config(object)

}
