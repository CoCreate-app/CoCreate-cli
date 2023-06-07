const readline = require('readline');
const { promises: fs } = require("fs");
const os = require('os');
const path = require('path');


module.exports = async function CoCreateConfig(config = {}) {

    async function promptForInput(question) {
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        return new Promise((resolve) => {
            rl.question(question, (answer) => {
                rl.close();
                resolve(answer.trim());
            });
        });
    }

    // Check if the config file exists
    const configFilePath = path.join(os.homedir(), 'CoCreateConfig.json');
    try {
        const configFileContent = await fs.readFile(configFilePath, 'utf8');
        config = JSON.parse(configFileContent);
    } catch (error) {
        // Ignore error if the file doesn't exist
    }

    // Prompt user for organization ID if not already stored
    if (!config.organization_id)
        config.organization_id = await promptForInput('Enter your organization_id: ');

    if (!config.host)
        config.host = await promptForInput('Enter the host: ');


    async function promptForSignInOrKey() {
        const option = await promptForInput('Choose an option:\n1. Sign In\n2. Enter Key\n');

        if (option === '1') {
            if (!config.email)
                config.email = await promptForInput('Enter your email: ');

            if (!config.password)
                config.password = await promptForInput('Enter your password: ');

        } else if (option === '2') {
            if (!config.key)
                config.key = await promptForInput('Enter the key: ');
        } else {
            console.log('Invalid option. Please try again.');
            await promptForSignInOrKey();
        }
    }
    if (!config.key && (!config.email || !config.password))
        await promptForSignInOrKey();


    // Save the config to the file
    await fs.writeFile(configFilePath, JSON.stringify(config, null, 2));

    return config
}
