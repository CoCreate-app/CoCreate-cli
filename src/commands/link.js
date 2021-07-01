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
            failed.push({ name, des: 'package json not found' })
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

        return {...repo, name, packageName, ppath, deps }

        return repo;

    })

}
let isLinked = {}
module.exports = async function updateYarnInstall(repos) {
    const failed = [];
    try {
        repos = complete(repos)

    } catch (err) {
        failed.push({ name: 'GENERAL', des: err.message })
        console.log(err)
    }
    // console.log(repos)
    // return failed;
    try {


        for (let repo of repos) {

            if (!repo)
                continue;


            let { ppath, packageName, deps, name } = repo;

            console.log(packageName, 'configuring ...')
            for (let dep of deps) {
                let depMeta = repos.find(meta => meta.packageName === dep);
                try {
                    if (!depMeta) {
                        failed.push({ name, des: `"${depMeta.packageName}" component can not be found in repositories.js` })
                        console.error(`${name}: "${depMeta.packageName}" component can not be found in repositories.js`.red)
                        continue;
                    }

                    console.log(packageName, 'linking', depMeta.packageName, '...')

                    if (!isLinked[depMeta.packageName]) {
                        isLinked[depMeta.packageName] = true;
                        let exitCode = await spawn('yarn', 'link', { cwd: depMeta.ppath, stdio: 'inherit', });
                        if (exitCode !== 0) {
                            failed.push({ name: depMeta.name, des: `yarn link failed` })
                            console.error(`${depMeta.name}: yarn link failed`.red)
                        }
                    }


                    let exitCode = await spawn('yarn', ['link', depMeta.packageName], { cwd: ppath, stdio: 'inherit', })
                    if (exitCode !== 0) {
                        failed.push({ name, des: `yarn link ${depMeta.packageName} failed` });
                        console.error(`${name}: yarn link ${depMeta.packageName} failed`.red)
                    }

                } catch (err) {
                    // failed.push({ name: packageName, des: err.message })
                    // console.error(packageName, err.message)
                    console.error(err)
                }

            }
        }
    } catch (err) {
        // failed.push({ name: 'GENERAL', des: err.message })
        console.log(err)
    }

    return failed;
}