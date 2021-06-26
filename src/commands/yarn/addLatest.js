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

let excludeComponents = ['cocreate-hosting', 'cocreate-docs', 'cocreate-s3'];
let excludeLinking = ['cocreate-crdt'];
// console.log(list);

let metaYarnLink = list.map(meta => {
    let name = path.basename(meta.path).toLowerCase();
    try {
        let ppath = path.resolve(meta.path);


        let packagejson = path.resolve(ppath, 'package.json');
        if (!fs.existsSync(packagejson))
            throw new Error('package json not found');
        let packageObj = require(packagejson);

        let packageName = name.startsWith('cocreate-') ?
            '@cocreate/' + name.substr(9) : packageObj.name;

        for (let [name, version] of Object.entries(packageObj['dependencies'] || {})) {
            if (name.startsWith('@cocreate/')) {
                packageObj['dependencies'][name] = 'latest';
            };
        }
        for (let [name, version] of Object.entries(packageObj['devDependencies'] || {})) {
            if (name.startsWith('@cocreate/')) {
                packageObj['dependencies'][name] = 'latest';
            };
        }

        let formated = prettier.format(JSON.stringify(packageObj), { semi: false, parser: "json" });


        fs.writeFileSync(packagejson, formated)

        let yarnlock = path.resolve(ppath, './yarn.lock');
        try {
            fs.unlinkSync(yarnlock);

        }
        catch (err) {}
        return { ...meta, name, packageName, ppath }
    }
    catch (err) {
        console.error('error: ', name, err);
        return meta;
    }

}).filter(meta => !excludeComponents.includes(meta.name));

// console.log(metaYarnLink);
