// install nodejs 14 from: https://github.com/nodesource/distributions/blob/master/README.md#installation-instructions
// install yarn from https://classic.yarnpkg.com/en/docs/install/#debian-stable
// -> alternatives -> debian/ununtu -> run the 3 commands there consecutively
// check node and nodejs version and remove old version if any
// both node and nodejs --version should be the same and > then v12
let glob = require("glob");
const fs = require('fs')
const path = require("path")
const { promisify } = require('util');
const exec = promisify(require('child_process').exec)
let list = require('../repositories.js');
const prettier = require("prettier");
// let excludeComponents = ['cocreate-hosting', 'cocreate-docs', 'cocreate-s3'];
// let excludeLinking = ['cocreate-crdt'];
// console.log(list);

let metaYarnLink = list.map(meta => {
    let name = path.basename(meta.path).toLowerCase();
    try {
        let ppath = path.resolve(meta.path);




        let packagejson = path.resolve(ppath, 'package.json');
        if (!fs.existsSync(packagejson)) {
            console.error('package json not found for', name);
            return false;
        }
        let packageObj
        try {
            packageObj = require(packagejson);

        }
        catch (err) {
            console.error(err.message)
            return false;
        }

        let packageName = name.startsWith('cocreate-') ?
            '@cocreate/' + name.substr(9) : packageObj.name;
        let deps = [];
        let devDeps = []
        for (let [name, version] of Object.entries(packageObj['dependencies'] || {})) {
            if (name.startsWith('@cocreate/')) {
                deps.push(name)

            };
        }
        for (let [name, version] of Object.entries(packageObj['devDependencies'] || {})) {
            if (name.startsWith('@cocreate/')) {
                devDeps.push(name)

            };
        }



        return { ...meta, name, packageName, ppath, deps, devDeps }
    }
    catch (err) {
        console.error('error: ', name, err);
        return meta;
    }

})

if (metaYarnLink.some(e => e === false)) {
    console.error('please fix the issue(s) and run again')
}
else
    (async() => {
            for (let meta of metaYarnLink) {
                await updateYarnLink(meta)
        // await updateYarnLink(metaYarnLink[0])
            }
    })();

async function updateYarnLink(param) {

    if (!param) return;
    let { ppath, packageName, deps, devDeps } = param;
    console.log('Component:', packageName)
    for (let dep of deps) {
    console.log('yarn adding', dep)

        try {

            await exec(`yarn add ${dep}`, { cwd: ppath })
        }
        catch (err) {
            console.error(err.message)

        }
    }

    for (let dep of devDeps) {
    console.log('yarn adding to devDependencies', dep)
        try {
            await exec(`yarn add -D ${dep}`, { cwd: ppath })
        }
        catch (err) {
            console.error(err.message)
        }
    }


}
