const file = require('@cocreate/file')
const path = require('path');
const fs = require('fs');

module.exports = async function upload(repos, args) {
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