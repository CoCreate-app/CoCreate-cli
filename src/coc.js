#!/usr/bin/env node

const minimist = require('minimist');
const colors = require('colors');
const path = require("path");
const fs = require("fs");
const { promisify } = require('util');
const spawn = require('./spawn');
const exec = promisify(require('child_process').exec);

// (async() => {

//     let p = await spawn('node --version', { shell: true, stdio: 'inherit' })

// })();
// process.exit(0);



const commandsToBeUsed = {};

const configPath = path.resolve(process.cwd(), "./repositories.js")

switch (require("os").platform()) {
    case 'win32':
        commandsToBeUsed['currentDirectory'] = 'cd';
        commandsToBeUsed['cmdJoiner'] = '&';
        break;
    case 'linux':
        commandsToBeUsed['currentDirectory'] = 'pwd'
        commandsToBeUsed['cmdJoiner'] = '&&';
        break;
    case 'darwin':
        commandsToBeUsed['currentDirectory'] = 'pwd'
        commandsToBeUsed['cmdJoiner'] = '&&';
        break;
    default:
        commandsToBeUsed['currentDirectory'] = 'pwd'
        commandsToBeUsed['cmdJoiner'] = '&&';
        break;
}

const argv = process.argv.slice(2);

if (argv.length < 1) {
    console.error("enter some command to do something");
    process.exit(1);
}


const args = minimist(argv, {
    alias: { config: 'c', absolutePath: 'cf', showMessage: 's' },
    default: { config: configPath },
    stopEarly: true
});

let repos, command, report = { success: 0, fail: 0 };

command = args['_'].join(" ");




function getRepositories(path) {
    try {
        return require(path);
    }
    catch (err) {
        console.error('can not read repository file in'.red, path, 'error:'.red, err.message.red);
        process.exit(1)
    }
}


if (args['cf']) {
    let p = path.resolve(process.cwd(), args['cf'])
    repos = getRepositories(p)
}
else
if (fs.existsSync(configPath)) {
    console.warn(`using ${configPath} configuration`.yellow)
    repos = getRepositories(args['c'])

}
else {
    console.error(`a condfiguration file can not be found`.red)
    process.exit(1)
}


let reposMeta = repos.map(meta => {
    let name = path.basename(meta.path).toLowerCase();
    let ppath = path.resolve(meta.path);
    try {
        if (!fs.existsSync(ppath))
            throw new Error('path can not be resolve');

        return { ...meta, name, ppath }
    }
    catch (err) {
        console.error(name.red, err.message.red, ppath);
        process.exit(1)
    }

});






(async() => {

    let predefined = path.resolve(__dirname, 'commands', command + '.js');
    if (fs.existsSync(predefined)) {
        console.warn('executing predefined a command'.red, `nodejs ./${command}`, path.dirname(predefined));
        require(predefined)(reposMeta)
        process.exit()


    } else {
        for (let repo of reposMeta) {
            // let repo = {name: 'aa', ppath: '/home/ubuntu/environment/CoCreate-plugins/CoCreate-sendgrid'}
            try {

                console.log(`running ${repo.name}: ${command} `)
                let p;
                if (args.showMessage)
                    p = await spawn(command, null, { cwd: repo.ppath, shell: true, stdio: 'inherit' })
                else
                    p = await exec(command, { cwd: repo.ppath, })

                report.success++;

            }
            catch (err) {
                report.fail++;
                console.error(`an error occured executing command in ${repo.name} repository`.red, err.message);;

            }
        }
        console.log(`success: ${report.success}`.green, `failed: ${report.fail}`.red);
    }





})();
