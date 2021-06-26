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

let CoCreateJsPath = path.resolve('../CoCreateJS');
// console.log(syarnInstall);
// process.exit()

const ignore = [
    'CoCreateJS',
    'CoCreate-repositories',
    'CoCreate-charts',
    'CoCreate-codemirror',
    'CoCreate-crdt',
    'CoCreate-croppie',
    'CoCreate-docs',
    'CoCreate-domain',
    'CoCreate-facebook',
    'CoCreate-fullcalendar',
    'CoCreate-google-auth',
    'CoCreate-instagram',
    'CoCreate-lighthouse',
    'CoCreate-linkedin',
    'CoCreate-monaco',
    'CoCreate-pinterest',
    'CoCreate-pickr',
    'CoCreate-progress-bar',
    'CoCreate-quill',
    'CoCreate-s3',
    'CoCreate-sengrid',
    'CoCreate-shipengine',
    'CoCreate-stripe',
    'CoCreate-twilio',
    'CoCreate-twitter',
    'CoCreate-uppy',
];


let doInstall = process.argv[2];




(async() => {
    for (let i = 0; i < ignore.length; i++) {
        ignore[i] = ignore[i].toLowerCase();
    }
    for (let [index, name] of nameList.entries()) {
        if (ignore.includes(name.toLowerCase()))
        {
            if(doInstall == "true")
         await updateYarnInstall(pathList[index], name)
        }
        else
            await updateSymbolic(pathList[index], name)

    }
})()



async function updateSymbolic(dpath, name) {
    // let packageName = path.basename(dpath);
    let res1, res2;
    dpath = path.resolve(dpath);
    if (!fs.existsSync(dpath))
        return console.error(dpath, 'not exist')

    try {
        let dest = path.resolve(dpath, 'node_modules');
        if (fs.existsSync(dest))
            fs.rmdirSync(dest, { recursive: true })
        console.log('copying node_modules to', name);
        res2 = await exec(`ln -sf ${CoCreateJsPath}/node_modules ${dest} `, { cwd: CoCreateJsPath })

        console.log(name, 'is finished')
    }
    catch (err) {
        console.error(name, 'had error for command', err.cmd, 'with response:', res1, res2, err)
    }

}



async function updateYarnInstall(dpath, name) {
    // let packageName = path.basename(dpath);
    let res1, res2;
    dpath = path.resolve(dpath);
    if (!fs.existsSync(dpath))
        return console.error(dpath, 'not exist')

    try {
        let node_modules = path.resolve(dpath, 'node_modules');
        if(fs.existsSync(node_modules))
            fs.rmdirSync(node_modules,{ recursive: true })
        console.log('yarn install inside', name);
        res2 = await exec(`yarn install `, { cwd: dpath })

        console.log(name, 'is finished', '\n')
    }
    catch (err) {
        console.error(name, 'had error for command', err.cmd, 'with response:', res1, res2, err)
    }

}
