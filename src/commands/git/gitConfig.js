let fs = require('fs');
const path = require("path");

module.exports = async function linkPackages(repos) {
    const failed = []
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
        if (err) 
            return [{
                name: 'gitConfig',
                des: err
            }]

        await updateConfig(result);
    });

    async function updateConfig(result){
        (async() => {
            for (let repo of repos) {
                await update(repo, result);
            }
            console.log('finished');
            return failed
        })();
    }

    function update(param, result) {
        if (!param) return;
        let { absoutePath, name } = param;
        let fileContent = `[core]
        repositoryformatversion = 0
        filemode = true
        bare = false
        logallrefupdates = true
    [user]
        name = ${result.name}
        email = ${result.email}	
    [remote "origin"]
        url = https://${result.username}:${result.password}@github.com/CoCreate-app/${name}.git
        fetch = +refs/heads/*:refs/remotes/origin/*
    [branch "master"]
        remote = origin
        merge = refs/heads/master

    `;

        let MdPath = path.resolve(absoutePath, '.git/config');
        if (fs.existsSync(MdPath))
            fs.unlinkSync(MdPath);
        fs.writeFileSync(MdPath, fileContent);
    }
}