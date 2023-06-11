let fs = require('fs');
const path = require("path")
const util = require('node:util');
const exec = util.promisify(require('node:child_process').exec);
const { color } = require('../fonts');

let pathList, nameList, item = {}, failed = [];

module.exports = async function bump(repos, args) {
    pathList = repos.map(o => o.absolutePath)
    if (repos.length <= 1) {
        let packageJsonPath = path.resolve(process.cwd(), 'package.json');

        if (fs.existsSync(packageJsonPath)) {
            let json = require(packageJsonPath)
            if (json) {
                let dependencies = json.dependencies || {}
                let devDependencies = json.devDependencies || {}
                let object = { ...dependencies, ...devDependencies }
                for (let key of Object.keys(object)) {
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
            getVersions(path.resolve(pathList[index], 'package.json'), `@${name}`)
        }

        console.log('bump versions', item)

        for (let [index, name] of nameList.entries()) {
            bumpVersion(path.resolve(pathList[index], 'package.json'), name)
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
    if (fs.existsSync(filePath)) {

        let object = require(filePath)
        if (object) {
            let newObject = { ...object }
            let dependencies = object.dependencies || {}
            let devDependencies = object.devDependencies || {}
            for (const name of Object.keys(dependencies)) {
                if (item[name]) {
                    newObject.dependencies[name] = item[name]
                }
            }

            for (const name of Object.keys(devDependencies)) {
                if (item[name]) {
                    newObject.devDependencies[name] = item[name]
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
