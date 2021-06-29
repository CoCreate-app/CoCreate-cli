const prompt = require('prompt');
const spawn = require('child_process').spawn;
const colors = require('colors');
prompt.start();

const properties = [{
        name: 'gitUser',
    },
    {
        name: 'gitPassword',
        hidden: true
    }
];




modules.exports = function gitClone(repos) {
    prompt.get(properties, async function(err, prompt) {
        if (err) { return console.error(err); }
        for (let meta of repos) {
            let { repo } = meta;
            let usernamePrompt = true;
            let p = spawn('git clone ' + repo, null, { shell: true })
            p.stdout.on('data', (data) => {
                if (data.endsWith('github.com\':')) {
                    if (usernamePrompt) {
                        usernamePrompt = false;
                        p.stdin.write(prompt.gitUser + '\n')
                    }
                    else
                        p.stdin.write(prompt.gitPassword + '\n')


                }
                console.log(data)

            })

            p.stderr.on('data', (data) => {
                console.error(data.red)

            })
            await new Promise((resolve,reject)=>)
        }
 
     
    });
}
