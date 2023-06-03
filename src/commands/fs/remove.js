let glob = require("glob");
let fs = require('fs');

function globUpdater(er, files) {
    if (er)
        console.log(files, 'glob resolving issue')
    else
        files.forEach(filename => update(filename))
}


function update(YmlPath) {
    if (fs.existsSync(YmlPath))
        fs.unlinkSync(YmlPath)
}


glob("../CoCreate-components/CoCreate-action/dist", globUpdater)
// glob("../CoCreate-components/*/.github/workflows/automation.yml", globUpdater)
// glob("../CoCreate-apps/*/.github/workflows/automation.yml", globUpdater)
// glob("../CoCreate-plugins/*/.github/workflows/automation.yml", globUpdater)

// substrin (9) removes CoCreateC leving namme as SS
// glob("../CoCreateCSS/.github/workflows/automation.yml", globUpdater)

// does not need to add name... will require for name to be removed from destination
// glob("../CoCreateJS/.github/workflows/automation.yml", globUpdater)

console.log('finished')