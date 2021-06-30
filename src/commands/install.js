const fs = require('fs')
const path = require("path")
const { promisify } = require('util');
const spawn = require('../spawn');
const colors = require('colors');


module.exports = async function updateYarnInstall(repos) {

    for (let meta of repos) {

        let {path: ppath, name } = meta;

        try {
            let node_modules = path.resolve(ppath, 'node_modules');
            if (fs.existsSync(node_modules))
                fs.rmdirSync(node_modules, { recursive: true })
        }
        catch (err) {
            console.error(name, 'had error for command', err.cmd, 'with response:', err)
        }

        let res;


        try {
            console.log('yarn installing ', name)
            res = await spawn(`yarn install`, null, { shell: true, stdio:'inherit', cwd: ppath })


        }
        catch (err) {
            console.error(name, 'had error for command', err.cmd, 'with response:', err)
        }
    }
}
