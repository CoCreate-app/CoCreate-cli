let fs = require('fs');
const path = require("path")
const util = require('node:util');
const exec = util.promisify(require('node:child_process').exec);
const { color } = require('../fonts');

let pathList, nameList, item = {}, failed = [];

module.exports = async function bump(repos, args) {
    pathList = repos.map(o => o.absolutePath)
    if (repos.length === 1) {
        let packageJsonPath = path.resolve(process.cwd(), './package.json');

        if (fs.existsSync(packageJsonPath)) {
            let object = require(packageJsonPath)
            if (object.dependencies) {
                for (let key of Object.keys(object.dependencies)) {
                    if (key.startsWith("@cocreate/")) {
                        const version = await exec(`npm view ${key} version`);
                        item[key] = `^${version.stdout}`.trim()
                    }
                }
                console.log('bump versions', item)

                for (let name of Object.keys(item)) {
                    bumpVersion(packageJsonPath, name)
                }
            }
        }

    } else {
        nameList = pathList.map(fn => path.basename(fn).toLowerCase());

        for (let [index, name] of nameList.entries()) {
            getVersions(pathList[index] + '/package.json', `@${name}`)
        }

        console.log('bump versions', item)

        for (let [index, name] of nameList.entries()) {
            bumpVersion(pathList[index] + '/package.json', name)
        }

    }

    console.log('completed')
    return failed;
}

function getVersions(filePath) {
    if (fs.existsSync(filePath)) {
        let object = require(filePath)
        if (object.name && object.version) {
            item[object.name] = `^${object.version}`
        }
    } else {
        failed.push({ name: 'get version', des: 'path doesn\'t exist:' + filePath })
    }
}

function bumpVersion(filePath, name) {
    let object = require(filePath)
    if (object) {
        let newObject = { ...object }

        if (!object.dependencies)
            return console.log(name, 'not updated')
        else {
            for (const name of Object.keys(object.dependencies)) {
                if (item[name]) {
                    newObject.dependencies[name] = item[name]
                }
            }

            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath)
            }

            fs.writeFileSync(filePath, JSON.stringify(object, null, 2))
        }
    } else {
        failed.push({ name: 'bump version', des: 'path doesn\'t exist:' + filePath })
    }
}
