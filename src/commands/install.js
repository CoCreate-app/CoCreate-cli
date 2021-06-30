const spawn = require('../spawn');
const execute = require('../execute')
module.exports = async function(repos) {
    let cloneFailed = await require('./clone.js')(repos)

    let installFailed = await execute('yarn install', repos)

    let linkFailed = await require('./link.js')(repos)
    let failed = [...cloneFailed, ...installFailed, ...linkFailed];

    let exitCode = spawn('yarn', ['start', '-w'], { cwd: '../CoCreateJS' })
    if (exitCode !== 0) {
        failed.push({ name: 'cocreatejs', des: `yarn start failed` })
    }
}
