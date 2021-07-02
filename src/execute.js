const colors = require('colors');
const path = require("path");
const fs = require("fs");
const { promisify } = require('util');
const spawn = require('./spawn');
const exec = promisify(require('child_process').exec);

module.exports = async function execute(command, repos, config = { hideMessage: false }) {

    let failed = [];
    let predefined = path.resolve(__dirname, 'commands', command + '.js');
    if (fs.existsSync(predefined)) {
        console.warn('executing predefined a command'.red, `nodejs ./${command}`, path.dirname(predefined));

        // console.log([repos.find(m => path.resolve(m.path) === path.resolve(process.cwd()))]);
        
        // if (path.basename(process.cwd()) === 'CoCreateJS')
            failed = require(predefined)(repos)
        // else
        
            // failed = require(predefined)([repos.find(m => m.name === 'cocreatejs')])


    }
    else {


        for (let repo of repos) {
            // let repo = {name: 'aa', ppath: '/home/ubuntu/environment/CoCreate-plugins/CoCreate-sendgrid'}
            try {
                const { name } = repo;
                console.log(`running ${name}: ${command} `)
                let exitCode;
                if (config.hideMessage)
                    exitCode = await exec(command, { cwd: repo.ppath, })
                else
                    exitCode = await spawn(command, null, { cwd: repo.ppath, shell: true, stdio: 'inherit' })

                if (exitCode !== 0)
                    failed.push({ name, des: 'command failed: ' + command })


            }
            catch (err) {

                console.error(`an error occured executing command in ${repo.name} repository`.red, err.message);;

            }
        }



    }



    return failed;



}
