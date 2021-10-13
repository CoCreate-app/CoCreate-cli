const fs = require('fs');
const path = require("path");
const spawn = require('../spawn');
const colors = require('colors');
const addMeta = require('../addMeta');


module.exports = async function updateYarnLink(repos) {
    let failed = [];

    try {
        repos = addMeta(repos, failed);

    }
    catch (err) {
        failed.push({
            name: 'GENERAL',
            des: err.message
        });

    }

    for (let repo of repos) {
        await yarnInstall(repo, failed, '');
    }
    return failed;

};


async function yarnInstall(repo, failed, param = '') {
        try {
            console.log(`${repo.name}: `.green, `yarn install`);
            let exitCode = await spawn(  'yarn', ['install'], {
                cwd: repo.ppath, stdio: 'inherit',
            });
            if (exitCode !== 0) {
                failed.push({
                    name: repo.name,
                    des: `yarn ${param}`
                })
                console.error(`${repo.name}: yarn ${param}`.red)
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


