#!/usr/bin/env node

const minimist = require('minimist');

const path = require("path");
const fs = require("fs");
const execute = require('./execute');
const argv = process.argv.slice(2);
console.log('bumper')

if (argv.length < 1) {
    console.error("enter some command to do something");
    process.exit(1);
}


let config = minimist(argv, {
    alias: { config: 'c', absolutePath: 'cf', hideMessage: 'h' },
    stopEarly: true
});


let repos, command;

command = config['_']
    .map((part) => part.match(/ |'|"/) ? `'${part.replace(/'/,'\\\'')}'` : part)
    .join(" ");


function getRepositories(path) {
    try {
        return require(path);
    }
    catch (err) {
        console.error('can not read repository file in'.red, path, 'error:'.red, err.message.red);
        process.exit(1);
    }
}

const currentRepoPath = path.resolve(process.cwd(), "./repositories.js");
// let cliRepoPath = path.resolve(__dirname, '..', 'repositories.js');
let packageJsonPath = path.resolve(process.cwd(), './package.json');
let repoDir, doAllRepo;

if (fs.existsSync(config['c'])) {
    repos = getRepositories(config['c']);
        repoDir = path.dirname(config['c']);
        doAllRepo = false;
      console.warn(`using ${config['c']} configuration`.yellow);
}
else if(fs.existsSync(currentRepoPath)) {
    repos = getRepositories(currentRepoPath);
    repoDir = path.dirname(currentRepoPath);
    doAllRepo = true;
    console.warn(`using ${currentRepoPath} configuration`.yellow);
}
else if (fs.existsSync(packageJsonPath)) {
    let repoPath = path.resolve(process.cwd());
    let packageObj = require(packageJsonPath);
    let repoUrl = packageObj.repository.url.substr(12);
    repos = [{
        path: `${repoPath}`,
        repo: `${repoUrl}`
    }];
    repoDir = path.dirname(packageJsonPath);
    doAllRepo = false;
    console.warn(`using ${packageJsonPath} configuration`.yellow);
}
// else if (fs.existsSync(cliRepoPath)) {
  
//     repos = getRepositories(cliRepoPath)
//         repoDir = path.dirname(cliRepoPath);
//         doAllRepo = false;
//       console.warn(`using ${cliRepoPath} configuration`.yellow)

// }
else {
    console.error(`a configuration file can not be found`.red);
    process.exit(1);
}
config = {hideMessage: false, ...config, repoDir, doAllRepo };

let repoFullMeta = repos.map(meta => {
    let name = path.basename(meta.path).toLowerCase();
    let plainName = name.substr(9);
    let ppath = path.resolve(repoDir, meta.path);
    try {
        if (!fs.existsSync(ppath))
            console.error(`${ppath} not found`.red);

        return { ...meta, name, ppath, plainName };
    }
    catch (err) {
        console.error(name.red, err.message.red, ppath);
        // process.exit(1)
    }

});

(async() => {
    if(command == 'bump'){
       console.log('bumping')
    }
    if(command == 'gitConfig'){
        let predefined = path.resolve(__dirname, 'commands', command + '.js');
        require(predefined)(repos, repos )
    }
    else {
        let failed = await execute(command, repoFullMeta, config);
        if (failed.length === 0)
            process.exit(0);
        else {
            console.log(' **************** failures **************** '.red);
            for (let failure of failed)
                console.log(`${failure.name}: ${failure.des}`.red);

        }
    }
    // console.log(`success: ${report.success}`.green, `failed: ${report.fail}`.red);
})();
