// what does this script do?
// removing ./dist from git and in real dirctory
// adding /dist to ignore and commit


// both node and nodejs --version should be the same and > then v12
const fs = require('fs')
const path = require("path")
const { promisify } = require('util');
const exec = promisify(require('child_process').exec)
let list = require('../repositories.js');

let pathList = list.map(o => o.path);
let nameList = pathList.map(fn => path.basename(fn).toLowerCase());





// console.log(syarnInstall);
// process.exit()




(async() => {
    for (let [index, name] of nameList.entries()) {
        await sleep(100)
        await updateYarnInstall(pathList[index], name)
    }
})()
// console.log(path.existsSync)
// process.exit();

async function sleep(time) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve()
        }, time)
    })
}



async function updateYarnInstall(dpath, name) {

    dpath = path.resolve(dpath);
    if (!fs.existsSync(dpath))
        return console.error(dpath, 'not exist')

    let res;


    try {

        let gitignore = path.resolve(dpath, '.gitignore')



        console.log('doing action on ', name)
        // res = await exec(`git stash -a "all"`, { cwd: dpath })

        res = await exec(`git rm --cached -r ./dist`, { cwd: dpath })
        res = await exec(`rm -rf ./dist`, { cwd: dpath })


        let file = fs.readFileSync(gitignore, 'utf8')

        if (!file.match(/\/?dist\/?/)) {

            fs.appendFileSync(gitignore, '\n/dist/\n', 'utf8')
        }

        res = await exec(`git add .gitignore`, { cwd: dpath })
        // res = await exec(`git commit -am "remove dist"`, { cwd: dpath })
        // res = await exec(`git stash pop`, { cwd: dpath })
        console.log(name, 'is finished')

    }
    catch (err) {
        console.error(name, 'had error for command', err.cmd, 'with response:', err)
    }
}
