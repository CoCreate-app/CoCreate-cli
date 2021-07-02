const fs = require('fs')
const path = require("path")

module.exports = function addMeta(repos, failed) {
    return repos.map(repo => {
        let {
            name,
            ppath
        } = repo;



        let packagejson = path.resolve(ppath, 'package.json');
        if (!fs.existsSync(packagejson)) {
            console.error('package json not found for', name);
            failed.push({
                name,
                des: 'package json not found'
            })
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

        let deps = Object.keys(packageObj['dependencies'] || {})
            .filter(packageName => packageName.startsWith('@cocreate/'));
        let devDeps = Object.keys(packageObj['devDependencies'] || {})
            .filter(packageName => packageName.startsWith('@cocreate/'));

        // let nodeModulePath = path.resolve(ppath, './node_modules/@cocreate');

        // let deps  = fs.existsSync(nodeModulePath) ?
        // fs.readdirSync(nodeModulePath).map(name => '@cocreate/' + name):
        // [];

        return { ...repo,
            name,
            packageName,
            ppath,
            deps,
            devDeps

        }



    })

} 