#!/usr/bin/env node
const { exec } = require("child_process");
const minimist = require('minimist');
const colors = require('colors');

const commandsToBeUsed = {};
const configPath ="/repositories.js";

switch(require("os").platform()){
    case 'win32':
        commandsToBeUsed['currentDirectory']='cd';
        commandsToBeUsed['cmdJoiner']='&';
        break;
    case 'linux':
        commandsToBeUsed['currentDirectory']='pwd'
        commandsToBeUsed['cmdJoiner']='&&';
        break;
    case 'darwin':
        commandsToBeUsed['currentDirectory']='pwd'
        commandsToBeUsed['cmdJoiner']='&&';
        break;
    default:
        commandsToBeUsed['currentDirectory']='pwd'
        commandsToBeUsed['cmdJoiner']='&&';
        break;
}

const argv = process.argv.slice(2);

if (argv.length < 1) {
    console.error("enter some command to do something");
    process.exit(1);
}


const args = minimist(argv, {
    alias: { config: 'c', absolutePath: 'cf' },
    default: { config: configPath },
    stopEarly:true
});
exec(`${commandsToBeUsed['currentDirectory']}`, (error, stdout, stderr) => {
    if (error) {
        console.log(`error: ${error.message}`);
        return;
    }
    if (stderr) {
        console.log(`stderr: ${stderr}`);
        return;
    }
    let repos;
    if(args['cf']) 
        repos = require(args['cf']);
    else
        repos = require(`${stdout.trim()}/${args['config']}`);

    const command = args['_'].join(" ");
    repos.forEach(specificRepo => {
        exec(`cd ${specificRepo.path} ${commandsToBeUsed['cmdJoiner']} ${command}`, (err, stdo, stde) => {
            if (err) {
                if(err.message.startsWith('Command failed'))
                    console.log(`error: ${err.message}`);
                return;
            }
            if (stde) {
                console.log(`stderr: ${stde}`);
                return;
            }
            console.log(stdo);
        });
    })
})
