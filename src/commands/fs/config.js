let glob = require("glob");
let fs = require('fs');
const path = require("path");

function globUpdater(er, files) {
    if (er)
        console.log(files, 'glob resolving issue');
    else
        files.forEach(filename => update(filename));
}




function update(MdPath) {
    let name = path.basename(path.resolve(path.dirname(MdPath), './')).substring(9);
    let object = '';
    let replaceContent = fs.readFileSync(MdPath).toString();


    let content_source = replaceContent.substring(replaceContent.indexOf("sources"));
    let content1 = content_source.substring(content_source.indexOf("object"));
    let content2 = content1.substring(content1.indexOf(':'));
    object = content2.substring(3, content2.indexOf(',') - 4);


    let fileContent = `module.exports = {
    "config": {
        "organization_id": "5ff747727005da1c272740ab",
        "key": "2061acef-0451-4545-f754-60cf8160",
        "host": "general.cocreate.app"
    },
    
    "sources": [
        {
            "array": "files",
            "object": {
                "_id": "${object}",
                "name": "index.html",
                "path": "/docs/${name}/index.html",
                "src": "{{./docs/index.html}}",
                "host": [
                    "general.cocreate.app"
                ],
                "directory": "/docs/${name}",
                "parentDirectory": "{{parentDirectory}}",
                "content-type": "{{content-type}}",
                "public": "true",
                "website_id": "644d4bff8036fb9d1d1fd69c"
            }
        }
    ]
}

`;

    if (!object.length)
        console.log("object Undefined: ", MdPath);
    if (object.length != 24 && object.length != 0)
        console.log("object not valid! please check your config: ", MdPath);
    else {
        console.log(MdPath, " -> object : ", object);
        if (fs.existsSync(MdPath))
            fs.unlinkSync(MdPath);
        fs.writeFileSync(MdPath, fileContent);

    }

}

// glob("../../CoCreate-components/CoCreate-filter/CoCreate.config.js", globUpdater);
glob("../../CoCreate-components/*/CoCreate.config.js", globUpdater);
glob("../../CoCreate-apps/*/CoCreate.config.js", globUpdater);
glob("../../CoCreate-plugins/*/CoCreate.config.js", globUpdater);
// glob("../CoCreateCSS/CoCreate.config.js", globUpdater);
// glob("../CoCreateJS/CoCreate.config.js", globUpdater);

console.log('finished');
