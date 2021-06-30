// const spawn = require('child_process').spawn;
const spawn = require('../spawn');
const colors = require('colors');
const path = require('path');

module.exports = async function gitClone(repos) {
    const failed = [];
    for (let meta of repos) {
        console.log(meta)
        let { repo, path: ppath, name } = meta;
        let usernamePrompt = true;
        let command = `git clone https://${repo}`;
        let dirPath = path.dirname(ppath);
        let exitCode = await spawn(`mkdir -p ${dirPath}`, null, { shell: true, stdio: 'inherit', cwd: process.cwd() })
        if (exitCode !== 0) {
            failed.push({ name, des: `creating directory failed` })

        }
        exitCode = await spawn(command, null, { shell: true, stdio: 'inherit', cwd: dirPath })
        if (exitCode !== 0) {
            failed.push({ name, des: `cloning ${name} failed` })

        }
    }

    return failed;

}
