const spawn = require('../spawn');
module.exports = async function(repos) {
    await require('./clone.js')(repos)
    await require('./install.js')(repos)
    await require('./link.js')(repos)

    spawn('yarn', ['start', '-w'], { cwd: '../CoCreateJS' })
}
