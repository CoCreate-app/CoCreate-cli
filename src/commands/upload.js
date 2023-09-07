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
                const filePath = path.resolve(directory, filename);
                if (!filePath.includes('node_modules')) {
                    const configPath = findClosestConfig(filePath);
                    if (configPath) {
                        const config = require(configPath);

                        if (config) {
                            await file(config, configPath, filePath)
                        } else {
                            console.log('Failed to read or parse CoCreate.config.js.');
                        }
                    } else {
                        console.log('No CoCreate.config file found in parent directories.');
                    }
                }
            }
        });

    } else {
        let CoCreateConfig
        if (!args.length) {
            let configPath = path.resolve(process.cwd(), 'CoCreate.config.js');
            if (!CoCreateConfig && fs.existsSync(configPath)) {
                CoCreateConfig = require(configPath);
            } else {
                console.log('CoCreate.config.js could not be found.')
                process.exit()
            }

            await file(CoCreateConfig, configPath)

        } else {
            for (let arg of args) {
                try {
                    CoCreateConfig = JSON.parse(arg)
                } catch (error) { }


                if (!CoCreateConfig) {
                    try {
                        let configPath = path.resolve(process.cwd(), arg)
                        if (fs.existsSync(configPath)) {
                            CoCreateConfig = require(configPath);
                            if (CoCreateConfig)
                                await file(CoCreateConfig, configPath)

                        } else {
                            console.log(arg + ' could not be found.')
                            process.exit()
                        }

                    } catch (error) { }
                }
            }
        }
    }

    function findClosestConfig(filePath) {
        let currentDir = path.dirname(filePath);

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