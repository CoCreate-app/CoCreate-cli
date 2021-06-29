const fs = require('fs')
const path = require("path")
const { promisify } = require('util');
const exec = promisify(require('child_process').exec)



module.exports = async function updateYarnInstall(repos) {

    for (let meta of repos) {

        let {ppath, packageName } = meta;

        try {
            let node_modules = path.resolve(ppath, 'node_modules');
            if (fs.existsSync(node_modules))
                fs.rmdirSync(node_modules, { recursive: true })
        }
        catch (err) {
            console.error(packageName, 'had error for command', err.cmd, 'with response:', err)
        }

        let res;


        try {
            console.log('yarn installing ', packageName)
            res = await exec(`yarn install`, { cwd: ppath })


        }
        catch (err) {
            console.error(packageName, 'had error for command', err.cmd, 'with response:', err)
        }
    }
}
