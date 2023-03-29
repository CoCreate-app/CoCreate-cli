const spawn = require('../spawn');
const colors = require('colors');

module.exports = async function linkPackages(repos, repoList) {
    const failed = [], isLinked = {};

    try {
        for (let repo of repos) {
            if (!repo) continue;
            if (repo.exclude && repo.exclude.includes('link')) 
                continue

            console.log(repo.packageName, 'configuring ...')
            if (!repoList)
                repoList = repos
            await doLink(repo.deps, repo, repoList, failed, isLinked)
            await doLink(repo.devDeps, repo, repoList, failed, isLinked)
        }
    }
    catch (err) {
        failed.push({ name: 'GENERAL', des: err.message })
        console.error(`${err}`.red)
    }

    return failed;
}


async function doLink(deps, repo, repos, failed, isLinked) {
    let { packageManager } = repo;

    for (let dep of deps) {
        let depMeta = repos.find(meta => meta.packageName === dep);
        try {
            // if (!depMeta) {
            //     // ToDo: search file system for a package.json containing the package.name

            //     failed.push({
            //         name: repo.name,
            //         des: `"${dep}" component can not be found in repositories.js`
            //     })
            //     console.error(`${repo.name}: "${dep}" component can not be found in repositories.js`.red)
            //     continue;
            // }



            if (depMeta && !isLinked[depMeta.packageName]) {

                isLinked[depMeta.packageName] = true;
                let exitCode = await spawn(packageManager, ['link'], {
                    cwd: depMeta.absolutePath,
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

            if (!depMeta)
                depMeta = {packageName: dep}
            console.log(repo.packageName, 'linking', depMeta.packageName, '...')

            let exitCode = await spawn(packageManager, ['link', depMeta.packageName], {
                cwd: repo.absolutePath,
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
