const fs = require('fs')
const path = require("path")
const spawn = require('../../spawn');
const addMeta = require('../../addMeta');


module.exports = async function updateYarnLink(repos, args) {
    let failed = [];

    try {
        repos = addMeta(repos, failed)

    }
    catch (err) {
        failed.push({
            name: 'GENERAL',
            des: err.message
        })

    }

    // console.log(repos)
    // return [];
    for (let repo of repos) {
        await reAdd(repo.deps, repo, failed, '')
        await reAdd(repo.devDeps, repo, failed, '-D ')
    }
    return failed;

}


async function reAdd(deps, repo, failed, param = '') {
    try {
        if (!deps.length)
            return;
        deps.unshift("add")
        let packageList = deps;
        let packageListLog = deps.join(' ');
        console.log(color.green + `${repo.name}: ` + color.reset, `yarn ${packageListLog}`);
        // let exitCode = await spawn(`yarn`, ['add', ...param && [param], packageList], {
        let exitCode = await spawn('yarn', packageList, {
            cwd: repo.absolutePath, stdio: 'inherit',
        });
        if (exitCode !== 0) {
            failed.push({
                name: repo.name,
                des: `yarn ${param} ${packageListLog}`
            })
            console.error(color.red + `${repo.name}: yarn ${param} ${packageListLog}` + color.reset)
        }
    }
    catch (err) {
        failed.push({
            name: repo.name,
            des: err.message
        })
        console.error(color.red + `${repo.name}: ${err.message}` + color.reset)
    }
}


