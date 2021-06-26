const utils_git = require('../utils/git.js');
const shellJs = require('shelljs');
const list_repositories = require('../repositories.js');

const prompt = require('prompt');

prompt.start();

const properties = [
    {
        name: 'commit',
        default: 'Clean Tree',
    }
];

prompt.get(properties,  function (err, result) {
    if (err) { return console.error(err); }
    let tmp_pwd = process.cwd()
   // list_repositories.forEach(repo=>{
    for(let i=0; i<list_repositories.length; i++){
        let repo = list_repositories[i];
        shellJs.echo(' \nRepo ' + repo.path);
        shellJs.cd(tmp_pwd);
        shellJs.cd(repo.path);
        //utils_git.commit(repo,result);
        shellJs.exec('git add .')
        if (shellJs.exec('git commit -am "'+result.commit+'"').code !== 0) {
               //shellJs.echo('Error: Git commit creating -> failed');
               //shellJs.exit(1);
           }
    }
    //});
});
