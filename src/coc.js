#!/usr/bin/env node
const path = require("path");
const fs = require("fs");
const execute = require('./execute');
const argv = process.argv.slice(2);
const addMeta = require('./addMeta');
const { color } = require('./fonts');


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
        const config = require(path);
        return config.repositories;
    }
    catch (err) {
        console.error(color.red + 'can not read repository file in' + color.reset, path, color.red + 'error:' + color.reset, err.message);
        process.exit(1);
    }
}

// TODO: handle getting closest config
async function getConfig(directory, filename = '') {
    const filePath = path.resolve(directory, filename);
    if (!filePath.includes('node_modules')) {
        const configPath = findClosestConfig(filePath)
        if (configPath) {
            return { config: require(configPath), configPath, filePath };

        } else {
            console.log('No CoCreate.config file found in parent directories.');
        }
    }

}

function findClosestConfig(filePath) {
    let currentDir = filePath;

    while (currentDir !== '/' && currentDir !== '.') {
        let configFile = path.join(currentDir, 'CoCreate.config.js');

        if (fs.existsSync(configFile)) {
            return configFile;
        }

        currentDir = path.dirname(currentDir);
    }

    return null;
}


const currentRepoPath = path.resolve(process.cwd(), "CoCreate.config.js");
let packageJsonPath = path.resolve(process.cwd(), 'package.json');
let directory

if (config['c'] && fs.existsSync(config['c'])) {
    repos = getRepositories(config['c']);
    directory = path.dirname(config['c']);
    console.warn(color.yellow + `using ${config['c']} configuration` + color.reset);
} else if (!config['self'] && fs.existsSync(currentRepoPath)) {
    repos = getRepositories(currentRepoPath);
    directory = path.dirname(currentRepoPath);
    console.warn(color.yellow + `using ${currentRepoPath} configuration` + color.reset);
} else if (fs.existsSync(packageJsonPath)) {
    let repoPath = path.resolve(process.cwd());
    let packageObj = require(packageJsonPath);
    let repoUrl = packageObj.repository.url.substring(12);
    repos = [{
        path: `${repoPath}`,
        repo: `${repoUrl}`
    }];
    directory = path.dirname(packageJsonPath);
    console.warn(color.yellow + `using ${packageJsonPath} configuration` + color.reset);
}
// else {
//     console.error(color.red + `a configuration file can not be found` + color.reset);
//     process.exit(1);
// }
config = { hideMessage: false, ...config };

(async () => {
    if (repos && repos.length)
        repos = await addMeta(repos, [], directory)
    let failed = await execute(command, repos, config);
    if (failed) {
        if (failed.length === 0)
            process.exit(0);
        else {
            console.log(color.red + ' **************** failures **************** ' + color.reset);
            for (let failure of failed)
                console.log(color.red + `${failure.name}: ${failure.des}` + color.reset);

        }
    }
})();
