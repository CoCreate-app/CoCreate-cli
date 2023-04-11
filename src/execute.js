const colors = require('colors');
const path = require("path");
const fs = require("fs");
const spawn = require('./spawn');
const util = require('node:util');
const exec = util.promisify(require('node:child_process').exec);


module.exports = async function execute(command, repos, config) {
    let failed = [];
    let predefined = path.resolve(__dirname, 'commands', command + '.js');

    if (fs.existsSync(predefined)) {
        console.warn(`executing a predefined command in ${predefined}`.blue);
   
        if (repos.length == 1)
            console.log(`running on ${repos[0].name} repo`.blue)
        else
            console.log('running on all repos'.blue)

        failed = require(predefined)(repos)

    } else {
        let type = command.split(' ')[0]
        let args = command.replace(type, '').replaceAll("'", '"').trim()

        for (let repo of repos) {
            try {
                if (repo.exclude && repo.exclude.includes(type)) 
                    continue
                console.log(`${repo.name}: `.green, command)
                let exitCode;
                if (config.hideMessage) {
                    const { error } = await exec(command, {
                        cwd: repo.absolutePath,
                    });
                
                    if (error)
                        exitCode = 1
                } else {
                    console.log(`args: `, `${args}`)
                    exitCode = await spawn(type, [`${args}`], {
                        cwd: repo.absolutePath,
                        shell: true,
                        stdio: 'inherit'
                    })
                }

                if (exitCode !== 0)
                    failed.push({
                        name: repo.name,
                        des: 'command failed: ' + command
                    })


            }
            catch (err) {
                console.error(`an error occured executing command in ${repo.name} repository`.red, err.message);;
            }
        }
    }

    return failed;

}
