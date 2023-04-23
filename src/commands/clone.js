// const spawn = require('child_process').spawn;
const spawn = require('../spawn');
const colors = require('colors');
const path = require('path');

module.exports = async function gitClone(repos, args) {
    const failed = [];
    const cwdPath = path.resolve(process.cwd());

    for (let i = 0; i < repos.length; i++) {
        // ToDo: Check if path exist and if git.config or package.json  exist continue
        if (cwdPath !== repos[i].absolutePath) {
            let exitCode = await spawn('mkdir', ['-p', repos[i].directory], { stdio: 'inherit', cwd: process.cwd() })
            if (exitCode !== 0) {
                failed.push({ name: repos[i].name, des: `creating directory failed` })
            }
    
            exitCode = await spawn('git', ['clone', `https://${repos[i].repo}`], { stdio: 'inherit', cwd: repos[i].directory })
            if (exitCode !== 0) {
                failed.push({ name: repos[i].name, des: `cloning failed` })
    
            }
    
        }
    }

    return failed;

}