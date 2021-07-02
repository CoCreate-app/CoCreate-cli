const spawn = require('../spawn');
const execute = require('../execute')
module.exports = async function(repos) {
    try {
        let cloneFailed = await require('./clone.js')(repos)

        let installFailed = await execute('yarn install', repos)

        let linkFailed = await require('./link.js')(repos)
        let failed = [...cloneFailed, ...installFailed, ...linkFailed];

        let exitCode = spawn('yarn', ['start', '-w'], { cwd: '../CoCreateJS' })
        if (exitCode !== 0) {
            failed.push({ name: 'cocreatejs', des: `yarn start failed` })
        }
    } catch (err) {
        console.error(err);
        failed.push({ name: 'general', des: err.message })

    }

}