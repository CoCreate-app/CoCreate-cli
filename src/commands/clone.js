// const spawn = require('child_process').spawn;
const spawn = require('../spawn');
const colors = require('colors');
const path = require('path');


module.exports = async function gitClone(repos) {

    for (let meta of repos) {
        console.log(meta)
        let { repo, path:ppath } = meta;
        let usernamePrompt = true;
        let command = `git clone https://${repo}`;
        let dirPath = path.dirname(ppath);
        let p = await spawn(`mkdir -p ${dirPath}`, null, { shell: true, stdio:'inherit', cwd: process.cwd() })
        p =  await spawn(command, null, { shell: true, stdio:'inherit', cwd: dirPath })
      
    }



}
