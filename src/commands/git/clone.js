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
    }
];

prompt.get(properties, async  function (err, result) {
    if (err) { return console.error(err); }
    let tmp_pwd = process.cwd()
   // (async() => {
        for(let i=0; i<list_repositories.length; i++){
            let repo = list_repositories[i];
             shellJs.cd(tmp_pwd);
            var path_repo = repo.path.split('/');
            path_repo.pop()
            path_repo = path_repo.join('/')
            console.log("Init path_repo ",path_repo)
            shellJs.mkdir('-p', path_repo)
            shellJs.cd(path_repo);
            //console.log("Cd actual ",process.cwd())
             await utils_git.cloneRepository(repo,result);
             //await new Promise(r => setTimeout(r, 2000));
      
        }
   // })()
        /*
    list_repositories.forEach( async repo=>{
       
    });*/
});


