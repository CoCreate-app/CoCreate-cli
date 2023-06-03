let glob = require("glob");
let fs = require('fs');
const path = require("path")

function globUpdater(er, files) {
    if (er)
        console.log(files, 'glob resolving issue')
    else
        files.forEach(filename => update(filename))
}




function update(Path) {
    let fileContent = `# ignore
node_modules
dist
.npmrc

`;
    if (fs.existsSync(Path))
        fs.unlinkSync(Path)
    fs.writeFileSync(Path, fileContent) 

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