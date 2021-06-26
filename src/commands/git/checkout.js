const utils_git = require('../utils/git.js');
const shellJs = require('shelljs');
const list_repositories = require('../repositories.js');

const prompt = require('prompt');

prompt.start();

const properties = [
    {
        name: 'checkout_branch',
        default: 'master',
    }
];

prompt.get(properties,  function (err, result) {
    if (err) { return console.error(err); }
    let tmp_pwd = process.cwd()
    let checkout_branch = result.checkout_branch
   // list_repositories.forEach(repo=>{
    for(let i=0; i<list_repositories.length; i++){
        let repo = list_repositories[i];
        shellJs.cd(tmp_pwd)
        shellJs.cd(repo.path);
        shellJs.echo(' \nRepo ' + repo.path);
        if (shellJs.exec('git checkout '+checkout_branch).code !== 0) {
          shellJs.echo('Error: Git checkout '+checkout_branch+' failed');
          shellJs.echo('creating ... ->  '+checkout_branch);
           if (shellJs.exec('git checkout -b'+checkout_branch).code !== 0) {
               shellJs.echo('Error: Git checkout creating -> '+checkout_branch+' failed');
               shellJs.exit(1);
           }
        }
    }//end for
});
