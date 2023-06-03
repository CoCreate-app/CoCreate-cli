const child_process = require('child_process');
const spawn = child_process.spawn;
module.exports = async function spawnPromise() {
    let proc = spawn.apply(child_process, arguments);
    return new Promise((resolve, reject) => {
        proc.on('error', (err) => reject(err))
        proc.on('close', (code) => resolve(code));
    })
}
