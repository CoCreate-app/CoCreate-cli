const fs = require('fs')
const path = require("path")
const util = require('node:util');
const exec = util.promisify(require('node:child_process').exec);
const spawn = require('../spawn');

const cwdPath = path.resolve(process.cwd());
let cwdNodeModulesPath = path.resolve(cwdPath, 'node_modules')


// let doInstall = process.argv[2];
// console.log('doInstall', doInstall)
let reposLength, failed = [];

module.exports = async function symlink(repos) {
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
        failed.push({name: 'createSymlink', des: 'path doesn\'t exist:' + dpath})
        return console.error(dpath, 'not exist')
    }
    let response = ''

    try {
        let dest = path.resolve(dpath, 'node_modules');
        if (dest) {
            if (fs.existsSync(dest)) {
                fs.rm(dest, { recursive: true, force: true }, function (err) {
                    if (err) {
                        console.log('failed');
                    }
                    erSymlink(repo.name, dest)
                });
            } else {
                erSymlink(repo.name, dest)
            }
        }
    }
    catch (err) {
        failed.push({name: 'symlink', des: 'with response:' + response + err})
        console.error(repo.name, 'failed to aquire symlink', 'with response:', response, err)
    }

}

function erSymlink(name, dest){
    fs.symlink( cwdNodeModulesPath, dest, 'dir', (err) => {
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
        failed.push({name: 'install', des: 'path doesn\'t exist:' + dpath})
        return console.error(dpath, 'not exist')
    }
    try {
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
            // ToDo: needs to run on defined repo but stiil require all repos in order to xecute on correct path
            let linkFailed = await require('./link.js')([repo], repos)
            if (linkFailed)
                failed.push(linkFailed)

        }

        // let {error} = await exec(`${repo.packageManager} install `, { cwd: dpath })
        // if (!error) {
        //     console.log(repo.name, 'installed')
        //     let linkFailed = await require('./link.js')([repo])
        //     if (linkFailed)
        //         failed.push(linkFailed)
 
        // } else {
        //     failed.push({name: 'install ', des: error})
        //     console.error(repo.name, 'failed to install', error)
        // }

    }
    catch (err) {
        console.error(repo.name, 'did not install', err)
    }

}
