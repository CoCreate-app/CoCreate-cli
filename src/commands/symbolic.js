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
                    des: `"${dep}" component can not be found in repositories.js`
                })
                console.error(`${repo.name}: "${dep}" component can not be found in repositories.js`.red)
                continue;
            }


            let exitCode;
            if (depMeta.packageName === '@cocreate/crdt') {

                console.log('creating symbolic link')
                let linkPath = path.resolve(repo.ppath, 'node_modules/@cocreate', depMeta.plainName)
                if (fs.existsSync(linkPath))
                    fs.unlinkSync(linkPath)
                exitCode = await spawn('ln', ['-s', '-f', depMeta.ppath, linkPath], {
                    cwd: repo.ppath,
                    stdio: 'inherit',
                })
                if (exitCode !== 0) {
                    failed.push({
                        name: repo.name,
                        des: `ln failed`
                    });
                    console.error(`${repo.name}:ln failed`.red)
                }

            }


        }
        catch (err) {
            failed.push({ name: repo.packageName, des: err.message })
            console.error(err)
        }

    }
}
