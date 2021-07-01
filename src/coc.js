#!/usr/bin/env node

const minimist = require('minimist');
const colors = require('colors');
const path = require("path");
const fs = require("fs");
const execute = require('./execute')

const configPath = path.resolve(process.cwd(), "./repositories.js")

const argv = process.argv.slice(2);

if (argv.length < 1) {
    console.error("enter some command to do something");
    process.exit(1);
}


const config = minimist(argv, {
    alias: { config: 'c', absolutePath: 'cf', hideMessage: 'h' },
    default: { config: configPath },
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


if (config['c']) {
    let p = path.resolve(process.cwd(), config['c'])
    repos = getRepositories(p)
}
else
if (fs.existsSync(configPath)) {
    console.warn(`using ${configPath} configuration`.yellow)
    repos = getRepositories(config['c'])

}
else {
    console.error(`a condfiguration file can not be found`.red)
    process.exit(1)
}


let repoFullMeta = repos.map(meta => {
    let name = path.basename(meta.path).toLowerCase();
    let ppath = path.resolve(meta.path);
    try {
        // if (!fs.existsSync(ppath))
        //     throw new Error('path can not be resolve');

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
