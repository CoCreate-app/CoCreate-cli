let fs = require('fs');
const prettier = require("prettier");
const path = require("path")
const { promisify } = require('util');
const exec = promisify(require('child_process').exec)
let list = require('../repositories.js');



let metaYarnLink = list.map(meta => {
    let name = path.basename(meta.path).toLowerCase();
    try {
        let ppath = path.resolve(meta.path);


        let packagejson = path.resolve(ppath, 'package.json');
        if (!fs.existsSync(packagejson)) {
            console.error('package json not found for', name);
            return false;
        }
        let packageObj = require(packagejson);

        let packageName = name.startsWith('cocreate-') ?
            '@cocreate/' + name.substr(9) : packageObj.name;

        return { ...meta, name, packageName, ppath, packageObj }
    }
    catch (err) {
        console.error('error: ', name, err.message);
        return meta;
    }

});

(async() => {
    for (let meta of metaYarnLink) {
        await update(meta)
        // await updateYarnLink(metaYarnLink[0])
    }
})();


function update(param) {
    // component name
    if (!param) return;
    let { packageObj, ppath } = param;
    let { name, description } = packageObj;
    let fileContent = `# CoCreate-${name}
    ${name} ${description} 
A simple ${name} component in vanilla javascript. Easily configured using HTML5 data-attributes and/or JavaScript API. Take it for a spin in our [playground!](https://cocreate.app/docs/${name})

![GitHub file size in bytes](https://img.shields.io/github/size/CoCreate-app/CoCreate-${name}/dist/CoCreate-${name}.min.js?label=minified%20size&style=for-the-badge) 
![GitHub latest release](https://img.shields.io/github/v/release/CoCreate-app/CoCreate-${name}?style=for-the-badge)
![GitHub](https://img.shields.io/github/license/CoCreate-app/CoCreate-${name}?style=for-the-badge) 
![GitHub labels](https://img.shields.io/github/labels/CoCreate-app/CoCreate-${name}/help%20wanted?style=for-the-badge)

![CoCreate-${name}](https://cdn.cocreate.app/docs/CoCreate-${name}.gif)

## [Docs & Demo](https://cocreate.app/docs/${name})


For a complete guide and working demo refer to the [doumentation](https://cocreate.app/docs/${name})

## CDN
\`\`\`html
<script src="https://cdn.cocreate.app/${name}/latest/CoCreate-${name}.min.js"></script>
\`\`\`
\`\`\`html
<script src="https://cdn.cocreate.app/${name}/latest/CoCreate-${name}.min.css"></script>
\`\`\`

## NPM
\`\`\`shell
$ npm install @cocreate/${name}
\`\`\`

# Table of Contents

- [Table of Contents](#table-of-contents)
- [Announcements](#announcements)
- [Roadmap](#roadmap)
- [How to Contribute](#how-to-contribute)
- [About](#about)
- [License](#license)

<a name="announcements"></a>
# Announcements

All updates to this library are documented in our [CHANGELOG](https://github.com/CoCreate-app/CoCreate-${name}/blob/master/CHANGELOG.md) and [releases](https://github.com/CoCreate-app/CoCreate-${name}/releases). You may also subscribe to email for releases and breaking changes. 

<a name="roadmap"></a>
# Roadmap

If you are interested in the future direction of this project, please take a look at our open [issues](https://github.com/CoCreate-app/CoCreate-${name}/issues) and [pull requests](https://github.com/CoCreate-app/CoCreate-${name}/pulls). We would love to hear your feedback.


<a name="about"></a>
# About

CoCreate-${name} is guided and supported by the CoCreate Developer Experience Team.

Please Email the Developer Experience Team [here](mailto:develop@cocreate.app) in case of any queries.

CoCreate-${name} is maintained and funded by CoCreate. The names and logos for CoCreate are trademarks of CoCreate, LLC.

<a name="contribute"></a>
# How to Contribute

We encourage contribution to our libraries (you might even score some nifty swag), please see our [CONTRIBUTING](https://github.com/CoCreate-app/CoCreate-${name}/blob/master/CONTRIBUTING.md) guide for details.

We want this library to be community-driven, and CoCreate led. We need your help to realize this goal. To help make sure we are building the right things in the right order, we ask that you create [issues](https://github.com/CoCreate-app/CoCreate-${name}/issues) and [pull requests](https://github.com/CoCreate-app/CoCreate-${name}/pulls) or merely upvote or comment on existing issues or pull requests.

We appreciate your continued support, thank you!

# License
[The MIT License (MIT)](https://github.com/CoCreate-app/CoCreate-${name}/blob/master/LICENSE)



`;

    let MdPath = path.resolve(ppath, 'README.md')
    let formated = prettier.format(fileContent, { semi: false, parser: "markdown" });
    if (fs.existsSync(MdPath))
        fs.unlinkSync(MdPath)
    fs.writeFileSync(MdPath, formated)


}





console.log('finished')
