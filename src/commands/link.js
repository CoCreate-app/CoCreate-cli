const spawn = require('../spawn');
const colors = require('colors');
const addMeta = require('../addMeta');

const util = require('node:util');
const exec = util.promisify(require('node:child_process').exec);

module.exports = async function linkPackages(repos, allrepo) {
    let packageManager = 'npm'
    const { error } = await exec('yarn --version');
    if (!error)
        packageManager = 'yarn';

    const failed = [], isLinked = {};
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
        for (let repo of repos) {

            if (!repo)
                continue;

            let {
                packageName,
                deps,
                devDeps,
            } = repo;

            console.log(packageName, 'configuring ...')
            await doLink(deps, repo, allrepo, failed, isLinked, packageManager)
            await doLink(devDeps, repo, allrepo, failed, isLinked, packageManager)
        }
    }
    catch (err) {
        failed.push({ name: 'GENERAL', des: err.message })
        console.error(`${err}`.red)
    }

    return failed;
}


async function doLink(deps, repo, allrepo, failed, isLinked, packageManager) {
    for (let dep of deps) {
        let depMeta = allrepo.find(meta => meta.packageName === dep);
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
                let exitCode = await spawn(packageManager, ['link'], {
                    cwd: depMeta.ppath,
                    shell: true,
                    stdio: 'inherit'
                });
                
                if (exitCode !== 0) {
                    failed.push({
                        name: depMeta.name,
                        des: `${packageManager} link failed`
                    })
                    console.error(`${depMeta.name}: ${packageManager} link failed`.red)
                }
            }
            console.log(repo.packageName, 'linking', depMeta.packageName, '...')

            let exitCode = await spawn(packageManager, ['link', depMeta.packageName], {
                cwd: repo.ppath,
                shell: true,
                stdio: 'inherit'
            })
            if (exitCode !== 0) {
                failed.push({
                    name: repo.name,
                    des: `${packageManager} link ${depMeta.packageName} failed`
                });
                console.error(`${repo.name}: ${packageManager} link ${depMeta.packageName} failed`.red)
            }

        }
        catch (err) {
            failed.push({ name: repo.packageName, des: err.message })
            console.error(`${err}`.red)
        }

    }
}
