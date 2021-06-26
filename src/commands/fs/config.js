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




function update(MdPath) {
    // component name
    let name = path.basename(path.resolve(path.dirname(MdPath), './')).substr(9);
    let document_id = '';
    let replaceContent = fs.readFileSync(MdPath).toString();

   
let content_source = replaceContent.substr(replaceContent.indexOf("sources"))
let content1 = content_source.substr(content_source.indexOf("document_id"))
let content2 = content1.substr(content1.indexOf(':'))
document_id = content2.substr(3,content2.indexOf(',')-4)


 let fileContent = `module.exports = {
	"config": {
		"apiKey": "c2b08663-06e3-440c-ef6f-13978b42883a",
		"securityKey": "f26baf68-e3a9-45fc-effe-502e47116265",
		"organization_Id": "5de0387b12e200ea63204d6c",
		"host": "server.cocreate.app:8088"
	},

    "sources": [{
            "entry": "./docs/index.html",
            "collection": "files",
            "document_id": "${document_id}",
            "key": "src",
            "data":{
                "name": "${name} Doc",
                "domains": ["cocreate.app", "server.cocreate.app", "ws.cocreate.app"],
                "path": "/docs/${name}"
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

if(document_id.length< 24)
    console.log("Document_id not valid !!! please check your config : " , MdPath)
else{
    console.log(MdPath," -> document_id : ",document_id)
   if (fs.existsSync(MdPath))
        fs.unlinkSync(MdPath)
    fs.writeFileSync(MdPath, fileContent)
    
}

}



// glob("../CoCreate-components/CoCreate-floating-label/CoCreate.config.js", globUpdater)
// glob("../CoCreate-test/CoCreate.config.js", globUpdater)
// glob("../CoCreate-adminUI/CoCreate.config.js", globUpdater)
// glob("../CoCreate-docs/CoCreate.config.js", globUpdater)
glob("../CoCreate-components/*/CoCreate.config.js", globUpdater)
glob("../CoCreate-modules/*/CoCreate.config.js", globUpdater)
glob("../CoCreate-plugins/*/CoCreate.config.js", globUpdater)
// glob("../CoCreate-website/CoCreate.config.js", globUpdater)
// glob("../CoCreate-website-template/CoCreate.config.js", globUpdater)
// glob("../CoCreateCSS/CoCreate.config.js", globUpdater)
// glob("../CoCreateJS/CoCreate.config.js", globUpdater)

console.log('finished')