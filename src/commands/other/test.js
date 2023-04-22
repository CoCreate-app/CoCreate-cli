const { spawn, exec } = require('child_process');
var child = spawn('npm', ['login'], {stdio: [ 'pipe', 'pipe', 'pipe' ], shell: true });
// var child = exec('npm login');

process.stdout.pipe(child.stdout);
process.stderr.pipe(child.stderr);
process.stdin.pipe(child.stdin);


child.stdout.on('data', function (data) {
    // exec('\n')
    // console.log('stdout: ' + data, '\n\n\n\n\n\n\n');
    child.stdin.write('newwrite\n'); //my command takes a markdown string...
    child.stdin.end('newend\n');
    // process.stdout.pipe(child.stdout);
    // process.stderr.pipe(child.stderr);
    // process.stdin.pipe(child.stdin);
    process.stdin.write('test\n');
    process.stdin.end('test\n');

});
// console.log(child)
// child.stdout.pipe(process.stdout);
// child.stderr.pipe(process.stderr);
// process.stdin.pipe(child.stdin);

child.on('exit', () => {
    console.log('exiting')
    process.exit()
})

child.on('close', (code) => {
    console.log(`Child process exited with code ${code}.`);
});
child.on('spawn', (code) => {
    console.log(`Child process spawn with code ${code}.`);
});
child.on('message', (code) => {
    console.log(`Child process message with code ${code}.`);
});
child.on('disconnect', (code) => {
    console.log(`Child process disconnect with code ${code}.`);
});
