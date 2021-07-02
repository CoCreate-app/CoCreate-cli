const fs = require('fs')
const path = require("path")
const {
    promisify
} = require('util');
const spawn = require('../spawn');
const colors = require('colors');
const addMeta = require('../addMeta');





module.exports = async function updateYarnInstall(repos, allrepo) {

    const failed = [],
        isLinked = {};
    try {
        repos = addMeta(repos, failed)
        allrepo = addMeta(allrepo, failed)

    }
    catch (err) {
        failed.push({
            name: 'GENERAL',
            des: err.message
        })
        console.log(err)
    }

    try {
        //   console.log(repos)

        for (let repo of repos) {

            if (!repo)
                continue;


            let {
                ppath,
                packageName,
                deps,
                devDeps,
                name
            } = repo;

            console.log(packageName, 'configuring ...')
            await doLink(deps, repo, allrepo, failed, isLinked)
            await doLink(devDeps, repo, allrepo, failed, isLinked)
        }
    }
    catch (err) {
        failed.push({ name: 'GENERAL', des: err.message })
        console.error(err.red)
    }

    return failed;
}


async function doLink(deps, repo, allrepo, failed, isLinked) {
    for (let dep of deps) {
        let depMeta = allrepo.find(meta => meta.packageName === dep);
        //                 console.log(depMeta)
        // return failed;
        try {
            if (!depMeta) {
                failed.push({
                    name: repo.name,
                    des: `"${depMeta.packageName}" component can not be found in repositories.js`
                })
                console.error(`${repo.name}: "${depMeta.packageName}" component can not be found in repositories.js`.red)
                continue;
            }



            if (!isLinked[depMeta.packageName]) {
                isLinked[depMeta.packageName] = true;
                let exitCode = await spawn('yarn', ['link'], {
                    cwd: depMeta.ppath,
                    stdio: 'inherit',
                });
                if (exitCode !== 0) {
                    failed.push({
                        name: depMeta.name,
                        des: `yarn link failed`
                    })
                    console.error(`${depMeta.name}: yarn link failed`.red)
                }
            }
            console.log(repo.packageName, 'linking', depMeta.packageName, '...')

            let exitCode = await spawn('yarn', ['link', depMeta.packageName], {
                cwd: repo.ppath,
                stdio: 'inherit',
            })
            if (exitCode !== 0) {
                failed.push({
                    name: repo.name,
                    des: `yarn link ${depMeta.packageName} failed`
                });
                console.error(`${repo.name}: yarn link ${depMeta.packageName} failed`.red)
            }

        }
        catch (err) {
            failed.push({ name: repo.packageName, des: err.message })
            console.error(err.red)
        }

    }
}
