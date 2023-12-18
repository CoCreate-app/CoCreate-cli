const file = require('@cocreate/file')
const path = require('path');
const fs = require('fs');

module.exports = async function upload(directory, args) {
    if (args && !Array.isArray(args))
        args = [args]

    let isWatch = false
    if (directory && typeof directory === 'string') {
        if (['-w', '--watch'].includes(directory)) {
            isWatch = true
            directory = process.cwd()
        }
    } else
        directory = process.cwd()

    if (isWatch || args.includes('-w') || args.includes('--watch')) {
        for (let i = 0; i < args.length; i++) {
            if (args[i].startsWith('-'))
                continue
            else if (path.isAbsolute(args[i]))
                directory = args[i]
            else
                directory = path.resolve(directory, args[i]);
        }

        console.log('Watching: ', directory)
        fs.watch(directory, { recursive: true }, async (eventType, filename) => {
            if (!filename.includes('CoCreate.config.js')) {
                const { config, configPath, filePath } = await getConfig(directory, filename);
                if (config) {
                    await file(config, configPath, filePath)
                } else {
                    console.log('Failed to read or parse CoCreate.config.js.');
                }
            }
        });

    } else {
        if (!args.length) {
            directory = process.cwd()
            const { config, configPath, filePath } = await getConfig(directory);
            if (config) {
                await file(config, configPath, filePath)
            } else {
                console.log('Failed to read or parse CoCreate.config.js.');
            }

        } else {
            for (let arg of args) {
                let CoCreateConfig

                try {
                    CoCreateConfig = JSON.parse(arg)
                } catch (error) { }


                if (!CoCreateConfig) {
                    const { config, configPath, filePath } = await getConfig(arg);
                    if (config) {
                        await file(config, configPath, filePath)
                    } else {
                        console.log('Failed to read or parse CoCreate.config.js.');
                    }
                }
            }
        }
    }

    async function getConfig(directory, filename = '') {
        const filePath = path.resolve(directory, filename);
        if (!filePath.includes('node_modules')) {
            const configPath = findClosestConfig(filePath)
            if (configPath) {
                return { config: require(configPath), configPath, filePath };

            } else {
                console.log('No CoCreate.config file found in parent directories.');
            }
        }

    }

    function findClosestConfig(filePath) {
        let currentDir = filePath;

        while (currentDir !== '/' && currentDir !== '.') {
            let configFile = path.join(currentDir, 'CoCreate.config.js');

            if (fs.existsSync(configFile)) {
                return configFile;
            }

            currentDir = path.dirname(currentDir);
        }

        return null;
    }

}