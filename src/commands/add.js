const fs = require('fs')
const path = require("path")
const spawn = require('../spawn');
const colors = require('colors');
const addMeta = require('../addMeta');


module.exports = async function updateYarnLink(repos) {
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
            if(!deps.length)
            return;
            deps.unshift("add")
            let packageList = deps;
            console.log('add ', deps.join(' '))
            console.log(`running: ${repo.name}`)
            // let exitCode = await spawn(`yarn`, ['add', ...param && [param], packageList], {
            let exitCode = await spawn(  'yarn', packageList, {
                cwd: repo.ppath, stdio: 'inherit',
            });
            if (exitCode !== 0) {
                failed.push({
                    name: repo.name,
                    des: `yarn add ${param} ${packageList}`
                })
                console.error(`${repo.name}: yarn add ${param} ${packageList}`.red)
            }
        }
        catch (err) {
            failed.push({
                name: repo.name,
                des: err.message
            })
            console.error(`${repo.name}: ${err.message}`.red)
        }
    }


