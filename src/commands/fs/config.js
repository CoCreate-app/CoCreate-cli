let glob = require("glob");
let fs = require('fs');
const prettier = require("prettier");
const path = require("path");

function globUpdater(er, files) {
    if(er)
        console.log(files, 'glob resolving issue');
    else
        files.forEach(filename => update(filename));
}




function update(MdPath) {
    let name = path.basename(path.resolve(path.dirname(MdPath), './')).substr(9);
    let document_id = '';
    let replaceContent = fs.readFileSync(MdPath).toString();


    let content_source = replaceContent.substr(replaceContent.indexOf("sources"));
    let content1 = content_source.substr(content_source.indexOf("document_id"));
    let content2 = content1.substr(content1.indexOf(':'));
    document_id = content2.substr(3, content2.indexOf(',') - 4);


    let fileContent = `module.exports = {
    "config": {
        "apiKey": "2061acef-0451-4545-f754-60cf8160",
        "organization_id": "5ff747727005da1c272740ab",
        "host": "general.cocreate.app"
    },
    
    "sources": [{
            "entry": "./docs/index.html",
            "collection": "files",
            "document_id": "${document_id}",
            "key": "src",
            "data":{
                "name": "index.html",
                "path": "/docs/${name}/index.html",
                "domains": [
                    "general.cocreate.app"
                ],
                "directory": "/docs/${name}",
                "content-type": "text/html",
                "public": "true",
                "website_id": "5ffbceb7f11d2d00103c4535"
            }
        }
    ],

	"extract": {
		"directory": "./src/",
		"extensions": [
			"js",
			"css",
			"html"
		],
		"ignores": [
			"node_modules",
			"vendor",
			"bower_components",
			"archive"
		]
	}
}

`;

    if(!document_id.length)
        console.log("Document_id Undefined: ", MdPath);
    if (document_id.length != 24 && document_id.length != 0 )
        console.log("Document_id not valid! please check your config: ", MdPath);
    else {
        console.log(MdPath, " -> document_id : ", document_id);
        if(fs.existsSync(MdPath))
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
