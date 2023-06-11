const fs = require('fs')
const path = require("path")
const util = require('node:util');
const spawn = require('../spawn');

const cwdPath = path.resolve(process.cwd());
let cwdNodeModulesPath = path.resolve(cwdPath, 'node_modules')


let reposLength, failed = [];

module.exports = async function symlink(repos, args) {
    reposLength = repos.length

    for (let i = 0; i < repos.length; i++) {

        if (cwdPath === repos[i].absolutePath && !fs.existsSync(cwdNodeModulesPath)) {
            await install(repos[i], repos)
            reposLength -= 1
        } else if (repos[i].install == true) {
            reposLength -= 1
            await install(repos[i], repos)
        } else if (cwdPath !== repos[i].absolutePath) {
            await createSymlink(repos[i])
        }

    }
}


async function createSymlink(repo) {
    let dpath = path.resolve(repo.absolutePath);
    if (!fs.existsSync(dpath)) {
        failed.push({ name: 'createSymlink', des: 'path doesn\'t exist:' + dpath })
        return console.error(dpath, 'not exist')
    }
    let response = ''

    try {
        let dest = path.resolve(dpath, 'node_modules');
        if (dest) {
            // let exists = await fs.promises.access(filePath, fs.constants.F_OK);

            if (fs.existsSync(dest)) {

                if (!cwdNodeModulesPath.includes('/CoCreateJS')) {
                    let isSymlink = await isSymlinkDirectory(dest)
                    if (isSymlink) {
                        const targetPath = await getSymlinkTargetPath(dest);
                        if (targetPath.includes('/CoCreateJS')) {
                            console.warn('symlink already exists with CoCreateJS')
                            return
                        }
                    }
                }

                fs.rm(dest, { recursive: true, force: true }, function (err) {
                    if (err) {
                        failed.push({ name: 'symlink', des: 'with response:' + response, err })
                        console.error(repo.name, 'failed to aquire symlink', 'with response:', response, err)

                    } else
                        runSymlink(repo.name, dest)
                });
            } else {
                runSymlink(repo.name, dest)
            }
        }
    }
    catch (err) {
        failed.push({ name: 'symlink', des: 'with response:' + response + err })
        console.error(repo.name, 'failed to aquire symlink', 'with response:', response, err)
    }

}

function runSymlink(name, dest) {
    fs.symlink(cwdNodeModulesPath, dest, 'dir', (err) => {
        reposLength -= 1

        if (err)
            console.log(err);
        else {
            console.log(name, "node_modules symlink added");
        }

        if (!reposLength) {
            console.log('symlink complete')
            return failed
        }

    })

}


async function install(repo, repos) {
    let dpath = repo.absolutePath
    if (!fs.existsSync(dpath)) {
        failed.push({ name: 'install', des: 'path doesn\'t exist:' + dpath })
        return console.error(dpath, 'not exist')
    }
    try {
        console.log('installing', repo.name)
        let exitCode = await spawn(repo.packageManager, ['install'], {
            cwd: repo.absolutePath,
            shell: true,
            stdio: 'inherit'
        });

        if (exitCode !== 0) {
            failed.push({
                name: repo.name,
                des: `${repo.packageManager} install failed`
            })
            console.error(`${repo.name}: ${repo.packageManager} install failed`.red)
        } else {
            console.log(`${repo.name}: ${repo.packageManager} install succesful`.green)

        }

    }
    catch (err) {
        console.error(repo.name, 'did not install', err)
    }

}

async function isSymlinkDirectory(path) {
    try {
        const stats = await fs.promises.lstat(path);
        return stats.isSymbolicLink();
    } catch (err) {
        throw err;
    }
}

async function getSymlinkTargetPath(symlinkPath) {
    try {
        const target = await fs.promises.readlink(symlinkPath);
        const targetPath = fs.realpathSync(target);
        return targetPath;
    } catch (err) {
        throw err;
    }
}

