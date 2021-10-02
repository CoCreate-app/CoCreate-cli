const getRepoList = require('../repoList');
let fs = require('fs');
const path = require("path");
let list = getRepoList()
console.log(list)

const prompt = require('prompt');

prompt.start();

const properties = [
    {
        name: 'email',
    },
    {
        name: 'name',
    },
    {
        name: 'username',
    },
    {
        name: 'password',
        hidden: true
    }
];

prompt.get(properties, async function (err, result) {
    if (err) { return console.error(err); }
    await updateConfig(result);
});


let metaYarnLink = list.map(meta => {
    let repoName = path.basename(meta.path);
    try {
        let ppath = path.resolve(meta.path);
        return { ...meta, repoName, ppath,  };
    }
    catch (err) {
        console.error('error: ', repoName, err.message);
        return meta;
    }

});

async function updateConfig(result){
    (async() => {
        for (let meta of metaYarnLink) {
            await update(meta, result);
        }
        console.log('finished');
    })();
}

function update(param, result) {
    if (!param) return;
    let { ppath, repoName } = param;
    let fileContent = `[core]
	repositoryformatversion = 0
	filemode = true
	bare = false
	logallrefupdates = true
[user]
	name = ${result.name}
	email = ${result.email}	
[remote "origin"]
	url = https://${result.username}:${result.password}@github.com/CoCreate-app/${repoName}.git
	fetch = +refs/heads/*:refs/remotes/origin/*
[branch "master"]
	remote = origin
	merge = refs/heads/master

`;

    let MdPath = path.resolve(ppath, '.git/config');
    if (fs.existsSync(MdPath))
        fs.unlinkSync(MdPath);
    fs.writeFileSync(MdPath, fileContent);
}
