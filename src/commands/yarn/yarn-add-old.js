// install nodejs 14 from: https://github.com/nodesource/distributions/blob/master/README.md#installation-instructions
// install yarn from https://classic.yarnpkg.com/en/docs/install/#debian-stable
// -> alternatives -> debian/ununtu -> run the 3 commands there consecutively

// both node and nodejs --version should be the same and > then v12
const fs = require('fs')
const path = require("path")
const { promisify } = require('util');
const exec = promisify(require('child_process').exec)
let list = require('../repositories.js');

let pathList = list.map(o => o.path);
let nameList = pathList.map(fn => path.basename(fn).toLowerCase());


// console.log(syarnInstall);
// process.exit()
let yarnAddOptions = process.argv.slice(2);



(async() => {
    for (let [index, name] of nameList.entries()) {
        await updateYarnInstall(pathList[index], name)
    }
})()



async function updateYarnInstall(dpath, name) {
    
        dpath = path.resolve(dpath);
    if(!fs.existsSync(dpath))
        return console.error(dpath, 'not exist')
    
    let res;
    // we have a file called yarn-add.js can we do there?
    
    
    try {
        console.log('yarn adding '  + yarnAddOptions.join(' '), 'on package:', name)
        res = await exec(`yarn add `  + yarnAddOptions.join(' '), { cwd:dpath })
        console.log(name, 'is finished')

    }
    catch (err) {
        console.error(name, 'had error for command', err.cmd, 'with response:', err)
    }
}
