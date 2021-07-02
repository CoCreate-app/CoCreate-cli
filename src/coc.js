#!/usr/bin/env node

const minimist = require('minimist');
const colors = require('colors');
const path = require("path");
const fs = require("fs");
const execute = require('./execute')



const argv = process.argv.slice(2);

if (argv.length < 1) {
    console.error("enter some command to do something");
    process.exit(1);
}


const config = minimist(argv, {
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
        process.exit(1)
    }
}

const currentRepoPath = path.resolve(process.cwd(), "./repositories.js")
let cliRepoPath = path.resolve(__dirname, '..', 'repositories.js');
let repoDir;
console.log(cliRepoPath)
if (fs.existsSync(config['c'])) {
    repos = getRepositories(config['c']);
        repoDir = path.dirname(config['c']);
      console.warn(`using ${config['c']} configuration`.yellow)
}
else if(fs.existsSync(currentRepoPath))
{
        repos = getRepositories(currentRepoPath);
        repoDir = path.dirname(currentRepoPath);
          console.warn(`using ${currentRepoPath} configuration`.yellow);
}
else if (fs.existsSync(cliRepoPath)) {
  
    repos = getRepositories(cliRepoPath)
        repoDir = path.dirname(cliRepoPath);
      console.warn(`using ${cliRepoPath} configuration`.yellow)

}
else {
    console.error(`a condfiguration file can not be found`.red)
    process.exit(1)
}
config.repoDir = repoDir;

let repoFullMeta = repos.map(meta => {
    let name = path.basename(meta.path).toLowerCase();
    if (name === 'cocreate-calculation')
        console.log(repoDir, meta.path)
    let ppath = path.resolve(repoDir, meta.path);
    try {
        if (!fs.existsSync(ppath))
            console.error(`${ppath} not found`.red)

        return { ...meta, name, ppath }
    }
    catch (err) {
        console.error(name.red, err.message.red, ppath);
        // process.exit(1)
    }

});

(async() => {

    let failed = await execute(command, repoFullMeta, config)
    if (failed.length === 0)
        process.exit(0);
    else {
        console.log(' **************** failures **************** '.red)
        for (let failure of failed)
            console.log(`${failure.name}: ${failure.des}`.red)

    }
    // console.log(`success: ${report.success}`.green, `failed: ${report.fail}`.red);
})();
