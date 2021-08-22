const colors = require('colors');
const path = require("path");
const fs = require("fs");
const {
    promisify
} = require('util');
const spawn = require('./spawn');
const exec = promisify(require('child_process').exec);

module.exports = async function execute(command, repos, config) {

    let failed = [];
    let predefined = path.resolve(__dirname, 'commands', command + '.js');
    if (fs.existsSync(predefined)) {
        console.warn(`executing a predefined command in ${predefined}`.blue);

        if (config.doAllRepo) {
            console.log('running on all repos'.blue)
            failed = require(predefined)(repos, repos )
        }
        else {
            let currentRepoConfig = repos.find(m => m.name === path.basename(process.cwd()).toLowerCase());
            if (currentRepoConfig && currentRepoConfig.ppath == path.resolve(process.cwd())) {
                console.log(`running on ${currentRepoConfig.name} repo`.blue)
                failed = require(predefined)([currentRepoConfig], repos )
            }
            else {
                console.error(`${currentRepoConfig.name} can not be found or have diferent path`.red)
            }
        }


    }
    else {


        for (let repo of repos) {
            // let repo = {name: 'aa', ppath: '/home/ubuntu/environment/CoCreate-plugins/CoCreate-sendgrid'}
            try {
                const {
                    name
                } = repo;
                console.log(`running ${name}: ${command} `.green)
                let exitCode;
                if (config.hideMessage)
                    exitCode = await exec(command, {
                        cwd: repo.ppath,
                    })
                else
                    exitCode = await spawn(command, null, {
                        cwd: repo.ppath,
                        shell: true,
                        stdio: 'inherit'
                    })

                if (exitCode !== 0)
                    failed.push({
                        name,
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
