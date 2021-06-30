const spawn = require('../spawn');
module.exports = async function(repos) {
    let cloneFailed = await require('./clone.js')(repos)
    let installFailed = await require('./install.js')(repos)
    let linkFailed = await require('./link.js')(repos)
    let failed = [...cloneFailed, ...installFailed, ...linkFailed];
    
    let exitCode = spawn('yarn', ['start', '-w'], { cwd: '../CoCreateJS' })
}
