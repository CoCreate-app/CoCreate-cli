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




function update(YmlPath) {
    // component name
    let name = path.basename(path.resolve(path.dirname(YmlPath), '../..')).substr(9);
    let fileContent = `# ignore
node_modules
dist
.npmrc

`;
    let formated = prettier.format(fileContent, { semi: false, parser: "yaml" });
    // console.log(fileContent);
    // process.exit()
    if (fs.existsSync(YmlPath))
        fs.unlinkSync(YmlPath)
    fs.writeFileSync(YmlPath, formated)
    

}



// glob("../CoCreate-components/CoCreate-action/.gitignore", globUpdater)
// glob("./.gitignore", globUpdater)
// glob("../CoCreate-adminUI/.gitignore", globUpdater)
glob("../CoCreate-components/*/.gitignore", globUpdater)
glob("../CoCreate-apps/*/.gitignore", globUpdater)
glob("../CoCreate-plugins/*/.gitignore", globUpdater)
// glob("../CoCreate-website/.gitignore", globUpdater)
// glob("../CoCreate-website-template/.gitignore", globUpdater)
glob("../CoCreateCSS/.gitignore", globUpdater)
// glob("../CoCreateJS/.gitignore", globUpdater)

console.log('finished')