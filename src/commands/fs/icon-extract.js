let glob = require("glob");
let fs = require('fs');
const path = require("path")

function globUpdater(er, files) {
    console.log('ggggggggggggggggggg', files, er)
    if (er)
        console.log(files, 'glob resolving issue')
    else
        files.forEach(filename => {
            console.log(filename, 'glob resolving issue')
            // update(filename + '/automated.yml')
        })

}

function update(YmlPath) {
    let name = path.basename(path.resolve(path.dirname(YmlPath), '../..')).substring(9);
    let fileContent = ``;
    // process.exit()
    if (fs.existsSync(YmlPath))
        fs.unlinkSync(YmlPath)
    fs.writeFileSync(YmlPath, fileContent)

}

let pathSrc = "../../CoCreate-admin/src/**/*.html"
if (!fs.existsSync(pathSrc))
    console.log('does not exist')
    
glob(pathSrc, globUpdater)
