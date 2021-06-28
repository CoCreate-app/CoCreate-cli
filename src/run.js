const { spawn } = require('child_process');


let ls = spawn('nodejs ./test.js' ,null,{shell: true});

ls.stdout.on('data', (data) => {
  console.log(`stdout: ${data}`);
    ls.stdin.write('aaa\n')
});

ls.stderr.on('data', (data) => {
  console.error(`stderr: ${data}`);
});

// process.stdin.write('hossein/n')
// process.stdin.write('istanbul/n')