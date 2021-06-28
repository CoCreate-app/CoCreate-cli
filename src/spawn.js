const spawn = require('child_process').spawn;
module.exports = async function spawnPromise() {


    let ls = spawn.apply(this, arguments);
    await new Promise((resolve, reject) => {
        ls.on('error', (err) => reject(err))
        ls.on('close', () =>
            resolve()
        );
    })

}
