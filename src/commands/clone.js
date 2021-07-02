// const spawn = require('child_process').spawn;
const spawn = require('../spawn');
const colors = require('colors');
const path = require('path');

module.exports = async function gitClone(repos) {
    const failed = [];
    for (let meta of repos) {

        let { repo, path: ppath, name } = meta;
        let usernamePrompt = true;

        let dirPath = path.dirname(ppath);
        let exitCode = await spawn('mkdir', ['-p', dirPath], { stdio: 'inherit', cwd: process.cwd() })
        if (exitCode !== 0) {
            failed.push({ name, des: `creating directory failed` })

        }

        exitCode = await spawn('git', ['clone', `https://${repo}`], { stdio: 'inherit', cwd: dirPath })
        if (exitCode !== 0) {
            failed.push({ name, des: `cloning ${name} failed` })

        }
    }

    return failed;

}