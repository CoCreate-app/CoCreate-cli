const addMeta = require('../addMeta');

module.exports = async function(repos) {
    let failed = [];
    try {
        let cloneFailed = await require('./clone.js')(repos)
        repos = await addMeta(repos, failed)

        let symlinkFailed = await require('./symlink.js')(repos)
        let linkFailed = await require('./link.js')(repos)
        failed = [...cloneFailed, ...symlinkFailed, ...linkFailed];
    } catch (err) {
        console.error(err);
        failed.push({ name: 'general', des: err.message })
    }
    return failed;
}