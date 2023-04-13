#!/usr/bin/env node
const path = require("path");
const fs = require("fs");
const execute = require('./execute');
const argv = process.argv.slice(2);
const addMeta = require('./addMeta');


if (argv.length < 1) {
    console.error("enter some command to do something");
    process.exit(1);
}
let repos, command, config = {};

const options = ['-self']
for (let option of options) {
    if (argv.includes(option)) {
        config.self = true
        const index = argv.indexOf(option);
        delete argv[index];
    }
}

command = argv
    .map((part) => part.match(/ |'|"/) ? `'${part.replace(/'/, '\\\'')}'` : part)
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
let packageJsonPath = path.resolve(process.cwd(), './package.json');
let directory

if (config['c'] && fs.existsSync(config['c'])) {
    repos = getRepositories(config['c']);
    directory = path.dirname(config['c']);
    console.warn(`using ${config['c']} configuration`.yellow);
} else if (!config['self'] && fs.existsSync(currentRepoPath)) {
    repos = getRepositories(currentRepoPath);
    directory = path.dirname(currentRepoPath);
    console.warn(`using ${currentRepoPath} configuration`.yellow);
} else if (fs.existsSync(packageJsonPath)) {
    let repoPath = path.resolve(process.cwd());
    let packageObj = require(packageJsonPath);
    let repoUrl = packageObj.repository.url.substring(12);
    repos = [{
        path: `${repoPath}`,
        repo: `${repoUrl}`
    }];
    directory = path.dirname(packageJsonPath);
    console.warn(`using ${packageJsonPath} configuration`.yellow);
} else {
    console.error(`a configuration file can not be found`.red);
    process.exit(1);
}
config = { hideMessage: false, ...config };

(async () => {
    repos = await addMeta(repos, [], directory)
    let failed = await execute(command, repos, config);
    if (failed) {
        if (failed.length === 0)
            process.exit(0);
        else {
            console.log(' **************** failures **************** '.red);
            for (let failure of failed)
                console.log(`${failure.name}: ${failure.des}`.red);

        }
    }
})();
