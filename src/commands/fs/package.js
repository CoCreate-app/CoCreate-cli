
let fs = require('fs');
const prettier = require("prettier");
let list = require('../repositories.js');
const path = require("path")

let CoCreateJsPath = path.resolve('../CoCreateJS');

let pathList = list.map(o => o.path)
let nameList = pathList.map(fn => path.basename(fn).toLowerCase());



(async() => {

    for (let [index, name] of nameList.entries()) {
        await addPackage(pathList[index] + '/package.json', name)
    }


})()
function addPackage(path, name) {
   

    if (!fs.existsSync(path))
        return console.error('path doesn\'t exist:', path)
    let object = require(name)

    // console.log(object)
    if (!object.dependencies)
        return console.log(name, 'not updated')
    else
        Object.assign(object.dependencies, {
           "@cocreate/hosting": "^1.0.0",
        })

    let str = JSON.stringify(object)
    // console.log(str)
    let formated = prettier.format(str, { semi: false, parser: "json" });
    // process.exit()
    fs.writeFileSync(name, formated)
    console.log(name)
}
