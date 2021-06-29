const fs = require('fs')
const path = require("path")
const { promisify } = require('util');
const exec = promisify(require('child_process').exec)
const colors = require('colors');
function complete(repos) {
    repos.map(repo => {
        let { name, ppath } = repos;
        try {



            let packagejson = path.resolve(ppath, 'package.json');
            if (!fs.existsSync(packagejson)) {
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

            return { ...repo, name, packageName, ppath, deps }
        }
        catch (err) {
            console.error('error: ', name, err.message);
            return repo;
        }
    })

}
let isLinked = {}
module.exports = async function updateYarnInstall(repos) {


    repos = complete(repos)

    for (let repo of repos) {


        let res1, res2;

        let { ppath, packageName, deps } = repo;

        console.log(packageName, 'configuring ...')
        for (let dep of deps) {
            let depMeta = repos.find(meta => meta.packageName === dep);
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


                res2 = await exec(`yarn link ${depMeta.packageName}`, { cwd: ppath })


            }
            catch (err) {
                console.error(packageName, 'had error for command', err)
            }

        }
    }
}
