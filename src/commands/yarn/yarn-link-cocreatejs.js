// install nodejs 14 from: https://github.com/nodesource/distributions/blob/master/README.md#installation-instructions
// install yarn from https://classic.yarnpkg.com/en/docs/install/#debian-stable
// -> alternatives -> debian/ununtu -> run the 3 commands there consecutively

// both node and nodejs --version should be the same and > then v12
let glob = require("glob");
const fs = require('fs')
const path = require("path")
const { promisify } = require('util');
const exec = promisify(require('child_process').exec)
let list = require('../repositories.js');
let CoCreateJsPath = path.resolve('../CoCreateJS');
let yarnLink = list.map(o => o.path)
let syarnlink = yarnLink.map(fn => path.basename(fn).toLowerCase());

// console.log(syarnInstall);
// process.exit()
(async() => {
    for (let [index, dep] of syarnlink.entries()) {
        await updateYarnLink(yarnLink[index], dep)
    }
})();

async function updateYarnLink(dpath, name) {
    // let packageName = path.basename(dpath);
    let res1, res2;
    dpath = path.resolve(dpath);
    if (!fs.existsSync(dpath))
        return console.error(dpath, 'not exist')

    try {
        console.log('linking', name);
        res1 = await exec(`yarn link`, { cwd: dpath })

        let packagejson = path.resolve(dpath, 'package.json');
        if (!fs.existsSync(packagejson)) throw new Error('package json can not be found');
        let packageName = require(packagejson).name;
        res2 = await exec(`yarn link ${packageName}`, { cwd: CoCreateJsPath })
        // res2 = await exec(`ln -sf ${CoCreateJsPath}/node_modules ${dpath}/node_modules `, { cwd: CoCreateJsPath })

        console.log(packageName, '   ', name, 'packageName is finished')
    }
    catch (err) {
        console.error(name, 'had error for command', err.cmd, 'with response:', res1, res2, err)
    }

}
