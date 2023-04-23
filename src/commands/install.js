const addMeta = require('../addMeta');

module.exports = async function(repos, args) {
    let failed = [];
    try {
        let cloneFailed = await require('./clone.js')(repos, args)
        if (cloneFailed)
            failed.push(cloneFailed)

        repos = await addMeta(repos, failed)

        let symlinkFailed = await require('./symlink.js')(repos, args)
        if (symlinkFailed)
           failed.push(symlinkFailed)
    } catch (err) {
        console.error(err);
        failed.push({ name: 'general', des: err.message })
    }
    return failed;
}