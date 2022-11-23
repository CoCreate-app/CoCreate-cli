const path = require("path");
const fs = require("fs");

module.exports = async function getRepoList(){
    const currentRepoPath = path.resolve(process.cwd(), "./repositories.js");
    const  packageJsonPath = path.resolve(process.cwd(), './package.json');
    
    let repos, repoDir, doAllRepo;
    
    if (fs.existsSync(currentRepoPath)) {
        repos = getRepositories(currentRepoPath);
        repoDir = path.dirname(currentRepoPath);
        doAllRepo = true;
        console.warn(`using ${currentRepoPath} configuration`.yellow);
    }
    else if (fs.existsSync(packageJsonPath)) {
        let repoPath = path.resolve(process.cwd());
        let packageObj = require(packageJsonPath);
        let repoUrl = packageObj.repository.url.substr(12);
        repos = [{
            path: `${repoPath}`,
            repo: `${repoUrl}`
        }];
        repoDir = path.dirname(packageJsonPath);
        doAllRepo = false;
        console.warn(`using ${packageJsonPath} configuration`.yellow);
    }
    else {
        console.error(`a configuration file can not be found`.red);
        process.exit(1);
    }
    
    return repos;
}

function getRepositories(path) {
    try {
        return require(path);
    }
    catch (err) {
        console.error('can not read repository file in'.red, path, 'error:'.red, err.message.red);
        process.exit(1);
    }
}
