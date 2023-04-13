let glob = require("glob");
let fs = require('fs');
const prettier = require("prettier");
const path = require("path")

function globUpdater(er, files) {
    if (er)
        console.log(files, 'glob resolving issue')
    else
        files.forEach(filename => update(filename))
}


function update(mdPath) {
    // component name
        // console.log(mdPath);
    let nameDir = mdPath;
    do{
        nameDir = path.dirname(nameDir);
    }while(! path.basename(nameDir).startsWith('CoCreate-'))
    let name = path.basename(nameDir).substring(9);
    // console.log(name);
    // process.exit();
    let replaceContent = fs.readFileSync(mdPath).toString()

    console.log(replaceContent, name);
    let replaced = replaceContent.replace(/boilerplate/ig, name)


    if (fs.existsSync(mdPath))
        fs.unlinkSync(mdPath)
    fs.writeFileSync(mdPath, replaced)


}


glob("./docs/", globUpdater)
// glob("../CoCreate-docs/docs/*.html", globUpdater)
// glob("../CoCreate-components/*/docs/*.html", globUpdater)
// glob("../CoCreate-apps/*/docs/*.html", globUpdater)
// glob("../CoCreate-plugins/*/docs/*.html", globUpdater)

console.log('finished')