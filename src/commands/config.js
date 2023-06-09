const readline = require('readline');
const os = require('os');
const path = require('path');
const fs = require('fs');

module.exports = async function CoCreateConfig(items, processEnv = true, updateGlobal = true) {
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

    const filterEmptyValues = (obj) => {
        return Object.fromEntries(
            Object.entries(obj).filter(([_, value]) => {
                if (typeof value === 'object' && !Array.isArray(value)) {
                    return Object.keys(value).length > 0;
                } else if (Array.isArray(value)) {
                    return value.length > 0;
                } else {
                    return value !== '';
                }
            })
        );
    };

    let config = {};
    let update = false;

    async function getConfig(items) {
        if (!Array.isArray(items)) {
            items = [items];
        }
        for (let i = 0; i < items.length; i++) {
            const { key, prompt, choices } = items[i];
            if (!key) {
                if (!prompt && prompt !== '' || !choices) continue;
                const answer = await promptForInput(prompt || `${key}: `);
                const choice = choices[answer];
                if (choice) {
                    await getConfig(choice);
                }
            } else {

                if (process.env[key]) {
                    config[key] = process.env[key];
                } else if (localConfig[key]) {
                    config[key] = localConfig[key];
                } else if (globalConfig[key]) {
                    config[key] = globalConfig[key];
                } else if (prompt || prompt === '') {
                    config[key] = await promptForInput(prompt || `${key}: `);
                    if (processEnv) process.env[key] = config[key];
                    if (updateGlobal) update = true;
                }
            }
        }
    }

    let localConfig = {};
    const localConfigPath = path.resolve(process.cwd(), 'CoCreate.config.js');
    if (fs.existsSync(localConfigPath)) {
        localConfig = require(localConfigPath);
    }

    let globalConfig = {};
    const globalConfigPath = path.resolve(os.homedir(), 'CoCreate.config.js');
    if (fs.existsSync(globalConfigPath)) {
        globalConfig = require(globalConfigPath);
    }

    if (items) {
        await getConfig(items);

        if (update) {
            const updatedGlobalConfig = {
                ...filterEmptyValues(globalConfig),
                ...filterEmptyValues(config)
            };

            const globalConfigString = `module.exports = ${JSON.stringify(updatedGlobalConfig, null, 2)};`;
            fs.writeFileSync(globalConfigPath, globalConfigString);
        }
    } else {
        config = {
            ...filterEmptyValues(globalConfig),
            ...filterEmptyValues(localConfig)
        };
    }

    return config;
}
