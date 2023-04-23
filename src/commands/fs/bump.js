
let fs = require('fs');
let list = require('../../../repositories.js');
const path = require("path")

let CoCreateJsPath = path.resolve('../CoCreateJS');

let pathList = list.map(o => o.path)
let nameList = pathList.map(fn => path.basename(fn).toLowerCase());
let item = {}


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

        let fileContent = JSON.stringify(object, null, 4)

        filePath = filePath.replace('/package.json', '')
        let Path = path.resolve(filePath, 'package.json')
        if (fs.existsSync(Path))
            fs.unlinkSync(Path)

        fs.writeFileSync(Path, fileContent)
    }
}

run()