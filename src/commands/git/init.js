const utils_git = require('../utils/git.js');
const shellJs = require('shelljs');
const list_repositories = require('../list_repositories_init');

const prompt = require('prompt');

prompt.start();

const properties = [
    {
        name: 'commit_git',
    },
    {
        name: 'config_email_git',
    },
    {
        name: 'config_name_git',
    },
    {
        name: 'user_git',
    },
    {
        name: 'password_git',
        hidden: true
    }
];

prompt.get(properties,  function (err, result) {
    if (err) { return console.error(err); }
    let tmp_pwd = process.cwd()
    list_repositories.forEach(repo=>{
        shellJs.cd(tmp_pwd);
        utils_git.initRepository(repo,result);
    });
});