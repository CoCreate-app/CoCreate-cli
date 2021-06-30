const fs = require('fs')
const path = require("path")
const { promisify } = require('util');
const spawn = require('../spawn');
const colors = require('colors');
let failed = [];
function complete(repos) {
    return repos.map(repo => {
        let { name, ppath } = repo;



        let packagejson = path.resolve(ppath, 'package.json');
        if (!fs.existsSync(packagejson)) {
            console.error('package json not found for', name);
            failed.push({name, des:'package json not found' })
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

        return { ...repo, name, packageName, ppath, deps }

        return repo;

    })

}
let isLinked = {}
module.exports = async function updateYarnInstall(repos) {

    try {
        repos = complete(repos)

        for (let repo of repos) {

            if(!repo)
                return;
            let res1, res2;

            let { ppath, packageName, deps } = repo;

            console.log(packageName, 'configuring ...')
            for (let dep of deps) {
                let depMeta = repos.find(meta => meta.packageName === dep);
                try {
                    if (!depMeta) {
                        console.error('1error: ', dep, 'component can not be found in repositories.js')
                        continue;
                    }

                    console.log(packageName, 'linking', depMeta.packageName, '...')

                    if (!isLinked[depMeta.packageName]) {
                        isLinked[depMeta.packageName] = true;
                        res1 = await spawn(`yarn link`, null, { cwd: depMeta.ppath, shell: true, stdio: 'inherit', });
                    }


                    res2 = await spawn(`yarn link ${depMeta.packageName}`, null, { cwd: ppath, shell: true, stdio: 'inherit', })


                }
                catch (err) {
                    failed.push({name:packageName, des:err.message })
                    console.error(packageName, 'had error for command', err)
                }

            }
        }
    }
    catch (err) {
               failed.push({name:'GENERAL', des:err.message })
        console.log(err)
    }
    
    
    for(let fail of failed)
    {
        console.error(`${fail.name}: ${fail.des}`.red)
    }
}
