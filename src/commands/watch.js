const fs = require('fs');
const path = require('path');
const file = require('@cocreate/file')

module.exports = async function fileWatch(directory, args) {
    if (!directory || Array.isArray(directory))
        directory = process.cwd()

    if (args && args[0]) {
        if (path.isAbsolute(args[0]))
            directory = args[0]
        else
            directory = path.resolve(directory, args[0]);
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

