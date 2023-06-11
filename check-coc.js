const { execSync } = require('child_process');

try {
    // Try to run "coc" command
    execSync('coc --version', { stdio: 'ignore' });
    console.log('"coc" is already installed globally.');
} catch (error) {
    // If "coc" command does not exist, install it globally
    console.log('"coc" command not found. Installing globally...');
    try {
        execSync('npm install -g @cocreate/cli', { stdio: 'inherit' });
        console.log('"coc" has been installed globally.');
    } catch (error) {
        console.error('Failed to install "coc" globally:', error);
    }
}