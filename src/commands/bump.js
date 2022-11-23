
let fs = require('fs');
const prettier = require("prettier");
let list = require('../../../repositories.js');
const path = require("path")

const spawn = require('../spawn');
const colors = require('colors');
const addMeta = require('../addMeta');

let pathList = list.map(o => o.path)
let nameList = pathList.map(fn => path.basename(fn).toLowerCase());
console.log('pathList', pathList)
console.log('pathList', nameList)
let item = {}

// ToDo: excute using command coc bump. when executed it will check for a repository.js file. same as other commands/
// (async() => {

//     for (let [index, name] of nameList.entries()) {
//         getVersions(pathList[index] + '/package.json', name).
//     }
//     // console.log('bump versions', item)
//     // for (let [index, name] of nameList.entries()) {
//     //     await bumpVersion(pathList[index] + '/package.json', name)
//     // }


// })();

async function run() {
//     let failed = [];

//     try {
//         repos = addMeta(repos, failed)

//     }
//     catch (err) {
//         failed.push({
//             name: 'GENERAL',
//             des: err.message
//         })

//     }

//     // console.log(repos)
//     // return [];
//     for (let repo of repos) {
//         await reAdd(repo.deps, repo, failed, '')
//         await reAdd(repo.devDeps, repo, failed, '-D ')
//     }
//     return failed;

// }

    for (let [index, name] of nameList.entries()) {
       getVersions(pathList[index] + '/package.json', `@${name}`)
    }
    console.log('bump versions', item)

    for (let [index, name] of nameList.entries()) {
        await bumpVersion(pathList[index] + '/package.json', name)
    }

    console.log('completed')
    // process.exit()  
}

function getVersions(path, name) {
    if (!fs.existsSync(path))
        return console.error('path doesn\'t exist:', path)
    let object = require(path)
    if (object.name && object.version) {
        item[object.name] = `^${object.version}`
    }
}

function bumpVersion(filePath, name) {
    if (!fs.existsSync(filePath))
        return console.error('path doesn\'t exist:', path)
    let object = require(filePath)
    let newObject = {...object}

    if (!object.dependencies)
        return console.log(name, 'not updated')
    else {
        for (const name of Object.keys(object.dependencies)) {
            if (item[name]) {
                newObject.dependencies[name] = item[name]
            }
        }

        let str = JSON.stringify(object)
        let formated = prettier.format(str, { semi: false, parser: "json" });

        filePath = filePath.replace('/package.json', '')
        let Path = path.resolve(filePath, 'package.json')
        if (fs.existsSync(Path)){
            fs.unlinkSync(Path)
        }

        fs.writeFileSync(Path, formated)
    }
}

// run()