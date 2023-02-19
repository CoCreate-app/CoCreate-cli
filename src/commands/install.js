const util = require('node:util');
const exec = util.promisify(require('node:child_process').exec);
const spawn = require('../spawn');

module.exports = async function( repos, allRepos,) {
    let failed = [];
    try {
        
        let cloneFailed = await require('./clone.js')(repos)

        let linkFailed = await require('./link.js')( repos, allRepos)
        failed = [...cloneFailed, ...linkFailed];
        
        let packageManager = 'npm'
        const { error } = await exec('yarn --version');
        if (!error)
            packageManager = 'yarn';
    
            
        let exitCode = spawn(packageManager, ['start'], { 
            cwd: '../CoCreateJS',
            shell: true,
            stdio: 'inherit'
        })
        if (exitCode !== 0) {
            failed.push({ name: 'cocreatejs', des: `${packageManager} start failed` })
        }
    } catch (err) {
        console.error(err);
        failed.push({ name: 'general', des: err.message })
    }
    return failed;
}