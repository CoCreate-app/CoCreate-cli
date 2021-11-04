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
    let shortName = name.substr(10);
    let fileContent = `# CoCreate-${shortName}
${description} Take it for a spin in our [playground!](https://cocreate.app/docs/${shortName})

![minified](https://img.badgesize.io/https://cdn.cocreate.app/${shortName}/latest/CoCreate-${shortName}.min.js?style=flat-square&label=minified&color=orange)
![gzip](https://img.badgesize.io/https://cdn.cocreate.app/${shortName}/latest/CoCreate-${shortName}.min.js?compression=gzip&style=flat-square&label=gzip&color=yellow)
![brotli](https://img.badgesize.io/https://cdn.cocreate.app/${shortName}/latest/CoCreate-${shortName}.min.js?compression=brotli&style=flat-square&label=brotli)
![GitHub latest release](https://img.shields.io/github/v/release/CoCreate-app/CoCreate-${shortName}?style=flat-square)
![License](https://img.shields.io/github/license/CoCreate-app/CoCreate-${shortName}?style=flat-square)
![Hiring](https://img.shields.io/static/v1?style=flat-square&label=&message=Hiring&color=blueviolet)

![CoCreate-${shortName}](https://cdn.cocreate.app/docs/CoCreate-${shortName}.gif)

## [Docs & Demo](https://cocreate.app/docs/${shortName})


For a complete guide and working demo refer to the [doumentation](https://cocreate.app/docs/${shortName})

## CDN
\`\`\`html
<script src="https://cdn.cocreate.app/${shortName}/latest/CoCreate-${shortName}.min.js"></script>
\`\`\`
\`\`\`html
<script src="https://cdn.cocreate.app/${shortName}/latest/CoCreate-${shortName}.min.css"></script>
\`\`\`

## NPM
\`\`\`shell
$ npm i @cocreate/${shortName}
\`\`\`

## yarn
\`\`\`shell
$ yarn install @cocreate/${shortName}
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

All updates to this library are documented in our [CHANGELOG](https://github.com/CoCreate-app/CoCreate-${shortName}/blob/master/CHANGELOG.md) and [releases](https://github.com/CoCreate-app/CoCreate-${shortName}/releases). You may also subscribe to email for releases and breaking changes. 

<a name="roadmap"></a>
# Roadmap

If you are interested in the future direction of this project, please take a look at our open [issues](https://github.com/CoCreate-app/CoCreate-${shortName}/issues) and [pull requests](https://github.com/CoCreate-app/CoCreate-${shortName}/pulls). We would love to hear your feedback.


<a name="about"></a>
# About

CoCreate-${shortName} is guided and supported by the CoCreate Developer Experience Team.

Please Email the Developer Experience Team [here](mailto:develop@cocreate.app) in case of any queries.

CoCreate-${shortName} is maintained and funded by CoCreate. The names and logos for CoCreate are trademarks of CoCreate, LLC.

<a name="contribute"></a>
# How to Contribute

We encourage contribution to our libraries (you might even score some nifty swag), please see our [CONTRIBUTING](https://github.com/CoCreate-app/CoCreate-${shortName}/blob/master/CONTRIBUTING.md) guide for details.

We want this library to be community-driven, and CoCreate led. We need your help to realize this goal. To help make sure we are building the right things in the right order, we ask that you create [issues](https://github.com/CoCreate-app/CoCreate-${shortName}/issues) and [pull requests](https://github.com/CoCreate-app/CoCreate-${shortName}/pulls) or merely upvote or comment on existing issues or pull requests.

We appreciate your continued support, thank you!


# License
[The MIT License (MIT)](https://github.com/CoCreate-app/CoCreate-${shortName}/blob/master/LICENSE)


`;

    let MdPath = path.resolve(ppath, 'README.md')
    let formated = prettier.format(fileContent, { semi: false, parser: "markdown" });
    if (fs.existsSync(MdPath))
        fs.unlinkSync(MdPath)
    fs.writeFileSync(MdPath, formated)


}


console.log('finished')
