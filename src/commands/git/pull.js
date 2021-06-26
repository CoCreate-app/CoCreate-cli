const utils_git = require('../utils/git.js');
const shellJs = require('shelljs');
const list_repositories = require('../repositories.js');

const prompt = require('prompt');

prompt.start();

const properties = [
    {
        name: 'user_git',
    },
    {
        name: 'password_git',
        hidden: true
    },
    {
        name: 'pull_branch',
        default: 'master',
    }
];

prompt.get(properties,  async function (err, result) {
    if (err) { return console.error(err); }
    let tmp_pwd = process.cwd()
    for(let i=0; i<list_repositories.length; i++){
        let repo = list_repositories[i];
        shellJs.cd(tmp_pwd);
        await utils_git.pull(repo,result);
    }
});
