const spawn = require('child_process').spawn;
module.exports = async function spawnPromise() {
    let proc = spawn.apply(this, arguments);
    return new Promise((resolve, reject) => {
        proc.on('error', (err) => reject(err))
        proc.on('close', (code) => resolve(code));
    })
}
