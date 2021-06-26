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


let metaYarnLink = list.map(meta => {
    let name = path.basename(meta.path).toLowerCase();
    try {
        let ppath = path.resolve(meta.path);
        

        let packagejson = path.resolve(ppath, 'package.json');
        if (!fs.existsSync(packagejson))
        {
            console.error('package json not found for', name);
            return false;
        }
        let packageObj = require(packagejson);

        let packageName = name.startsWith('cocreate-') ?
            '@cocreate/' + name.substr(9) : packageObj.name;

        let deps = Object.keys(packageObj['dependencies'] || {})
            .concat(Object.keys(packageObj['devDependencies'] || {}))
            .filter(packageName => packageName.startsWith('@cocreate/'))
        // let nodeModulePath = path.resolve(ppath, './node_modules/@cocreate');
        
        // let deps  = fs.existsSync(nodeModulePath) ?
        // fs.readdirSync(nodeModulePath).map(name => '@cocreate/' + name):
        // [];

        return { ...meta, name, packageName, ppath, deps }
    }
    catch (err) {
        console.error('error: ', name, err.message);
        return meta;
    }

});



let isLinked = {};
(async() => {
    for (let meta of metaYarnLink) {
        await updateYarnLink(meta)
        // await updateYarnLink(metaYarnLink[0])
    }
})();

async function updateYarnLink(param) {
    // let packageName = path.basename(dpath);
    let res1, res2;
    if(!param) return;
    let { ppath, packageName, deps } = param;

    console.log(packageName, 'configuring ...')
    for (let dep of deps) {
        let depMeta = metaYarnLink.find(meta => meta.packageName === dep);
        try {
            if (!depMeta) {
                console.error('error: ', dep, 'component can not be found in repositories.js')
                continue;
            }

                console.log(packageName, 'linking', depMeta.packageName, '...')

                if (!isLinked[depMeta.packageName]) {
                    isLinked[depMeta.packageName] = true;
                    res1 = await exec(`yarn link`, { cwd: depMeta.ppath });
                }

                //     if (res1.stderr.indexOf('There is already a package called ') === -1)
                //        throw err;



                res2 = await exec(`yarn link ${depMeta.packageName}`, { cwd: ppath })


                // await exec(`yarn add ${depMeta.packageName}`, { cwd: ppath })
                //     console.log(packageName, 'installing', depMeta.packageName, '...')





        }
        catch (err) {

            console.error(packageName, 'had error for command', err)
            // console.error('**********',packageName, 'had error for command', err, 'with response:', res1, res2, err,depMeta,  '**********')
        }

    }

}
