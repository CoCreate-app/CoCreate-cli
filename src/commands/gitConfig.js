let fs = require('fs');
const path = require('path');
const failed = [];

module.exports = async function gitConfig(repos) {
    try {
      await getPrompts(repos);
    }
    catch (err) {
        failed.push({ name: 'GENERAL', des: err.message });
        console.error(err.red);
    }
}

async function getPrompts(repos){
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
        await updateConfig(repos, result);
    });
    
}

async function updateConfig(repos, result){
    for (let meta of repos) {
        if (!meta) return;
        let fileContent = `[core]
    	repositoryformatversion = 0
    	filemode = true
    	bare = false
    	logallrefupdates = true
    [user]
    	name = ${result.name}
    	email = ${result.email}	
    [remote "origin"]
    	url = https://${result.username}:${result.password}@${meta.repo}
    	fetch = +refs/heads/*:refs/remotes/origin/*
    [branch "master"]
    	remote = origin
    	merge = refs/heads/master
    
    `;
    
        let MdPath = path.resolve(meta.path, '.git/config');
        if (fs.existsSync(MdPath))
            fs.unlinkSync(MdPath);
        fs.writeFileSync(MdPath, fileContent);
        console.log('configured: ', meta.repo);
    }
    console.log('finished');
    return failed

}
