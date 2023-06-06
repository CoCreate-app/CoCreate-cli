const crud = require('@cocreate/crud-client')
const mime = require('mime-types')
const fs = require('fs');
const path = require('path');


module.exports = async function upload(repos, args) {

    let CoCreateConfig;
    let configFile = path.resolve(process.cwd(), 'CoCreate.config.js');
    if (fs.existsSync(configFile)) {
        CoCreateConfig = require(configFile);
    } else {
        console.log('CoCreate.config.js could not be found.')
        process.exit()
    }

    let { config, directories, sources } = CoCreateConfig;

    if (!config)
        config = process.env.config || {}
    if (!config.organization_id)
        config.organization_id = process.env.organization_id
    if (!config.key)
        config.key = process.env.key
    if (!config.host)
        config.host = process.env.host

    if (!config.organization_id || !config.key || !config.host) {
        config = await require('./config.js')(config)
    }

    if (!config.organization_id || !config.host || !config.key && (!config.password || config.email)) {
        console.log('One or more required config params could not be found')
        process.exit()
    }


    crud.socket.create(config)
    config.broadcast = false

    if (config.email && config.password) {
        let request = {
            collection: 'users',
            filter: {
                query: [
                    { name: 'email', value: config.email, operator: '$eq' },
                    { name: 'password', value: config.password, operator: '$eq' }
                ]
            }
        }

        let response = await crud.socket.send('signIn', request)
        let { success, token } = response;

        if (success) {
            console.log('succesful sign in')
            // apply token to socket
        } else {
            console.log('The email or password you entered is incorrect')
            process.exit()

        }

    }

    console.log('Uploading files...')

    /**
     * Store files by config directories
     **/
    let errorLog = [];

    async function runDirectories() {
        for (const directory of directories) {
            const entry = directory.entry
            const exclude = directory.exclude
            await runFiles(directory, entry, exclude)
        }
        return
    }

    async function runFiles(directory, entry, exclude, parentDirectory = '') {
        let files = fs.readdirSync(entry);

        for (let file of files) {
            if (exclude && exclude.includes(file)) continue

            let isDirectory = fs.existsSync(`${entry}/${file}`) && fs.lstatSync(`${entry}/${file}`).isDirectory();
            let name = file
            let source = ''
            let directoryName = parentDirectory || '';
            let parentDirectoryOnly = parentDirectory || '';
            let index = parentDirectoryOnly.lastIndexOf('/') + 1
            if (parentDirectoryOnly && index) {
                parentDirectoryOnly = parentDirectoryOnly.substring(index)
            }
            let mimeType = mime.lookup(`${file}`)
            let pathName = '';

            if (!directoryName && directory.document && directory.document.directory)
                directoryName = directory.document.directory.replace('{{directory}}', '').trim()
            else if (!directoryName)
                directoryName = '/'

            if (exclude && exclude.includes(directoryName)) continue

            if (directoryName.endsWith("/"))
                pathName = directoryName + name
            else if (directoryName)
                pathName = directoryName + '/' + name
            else
                pathName = '/' + name

            if (exclude && exclude.includes(pathName)) continue

            if (isDirectory)
                mimeType = "text/directory"
            else
                source = getSource(`${entry}/${file}`, mimeType)

            let values = {
                '{{name}}': name,
                '{{source}}': source,
                '{{directory}}': directoryName,
                '{{parentDirectory}}': parentDirectoryOnly,
                '{{path}}': pathName,
                '{{content-type}}': mimeType
            }

            let document = { ...directory.document }
            if (!document.name)
                document.name = "{{name}}"
            if (!document.src)
                document.src = "{{source}}"
            if (!document.directory)
                document.directory = "/{{directory}}"
            if (!document.parentDirectory)
                document.parentDirectory = "{{parentDirectory}}"
            if (!document.path)
                document.path = "{{path}}"
            if (!document["content-type"])
                document["content-type"] = '{{content-type}}'
            if (!document.public && document.public != false && document.public != 'false')
                document.public = 'true'

            let object = {
                collection: directory.collection || 'files',
                document
            }
            for (const key of Object.keys(directory.document)) {
                if (typeof directory.document[key] == 'string') {

                    let variables = directory.document[key].match(/{{([A-Za-z0-9_.,\[\]\-\/ ]*)}}/g);
                    if (variables) {
                        for (let variable of variables) {
                            if (variable == '{{directory}}') {
                                if (parentDirectory)
                                    object.document[key] = values[variable]
                                else
                                    object.document[key] = object.document[key].replace(variable, '');
                            }
                            else if (isDirectory && variable == '{{source}}')
                                delete object.document[key]
                            else
                                object.document[key] = object.document[key].replace(variable, values[variable]);
                        }
                    }

                }
            }

            if (!object.document._id)
                object.filter = {
                    query: [{ name: 'path', value: pathName, operator: '$eq' }]
                }

            response = await runStore(object);
            if (response.error)
                errorLog.push(response.error)

            if (isDirectory && pathName) {
                let newEntry
                if (entry.endsWith("/"))
                    newEntry = entry + name
                else
                    newEntry = entry + '/' + name

                await runFiles(directory, newEntry, exclude, pathName)
            }
        }
        if (errorLog.length)
            console.log(...errorLog)

    }


    function getSource(path, mimeType) {
        let readType = 'utf8'
        if (/^(image|audio|video)\/[-+.\w]+/.test(mimeType))
            readType = 'base64'

        let binary = fs.readFileSync(path);
        let content = new Buffer.from(binary).toString(readType);

        return content
    }

    /**
     * Store files by config sources
     **/
    async function runSources() {
        let updatedSources = [];

        for (let i = 0; i < sources.length; i++) {
            const { collection, document } = sources[i];

            let source = { ...sources[i] };
            let keys = new Map()
            let response = {};

            try {
                if (collection) {
                    if (!document)
                        document = {};
                    else
                        for (const key of Object.keys(document)) {
                            if (typeof document[key] != 'string')
                                continue

                            let variables = document[key].match(/{{([A-Za-z0-9_.,\[\]\-\/ ]*)}}/g);
                            if (variables) {
                                keys.set(key, `${document[key]}`)
                                let value = ""
                                for (let variable of variables) {
                                    let entry = /{{\s*([\w\W]+)\s*}}/g.exec(variable);
                                    entry = entry[1].trim()
                                    if (entry) {
                                        if (!fs.existsSync(entry))
                                            continue

                                        let read_type = 'utf8'
                                        let mime_type = mime.lookup(entry) || 'text/html';
                                        if (/^(image|audio|video)\/[-+.\w]+/.test(mime_type)) {
                                            read_type = 'base64'
                                        }

                                        let binary = fs.readFileSync(entry);
                                        let content = new Buffer.from(binary).toString(read_type);
                                        if (content)
                                            value += content
                                        // document[key] = document[key].replace(variable, content);
                                    }
                                }
                                document[key] = value
                            }

                        }

                    let data = { collection, document }
                    if (!document._id && document.path)
                        data.filter = {
                            query: [{ name: 'path', value: document.path, operator: '$eq' }]
                        }

                    response = await runStore(data);
                }
            } catch (err) {
                console.log(err)
                process.exit()
            }
            if (response.document && response.document[0] && response.document[0]._id) {
                for (const [key, value] of keys) {
                    source.document[key] = value
                }
                source.document._id = response.document[0]._id
            } else {
                console.log('_id could not be found')
                process.exit()
            }

            updatedSources.push(source)
        }

        return updatedSources
    }


    async function runStore(data) {
        try {
            let response;
            if (!data.document._id && !data.filter) {
                response = await crud.createDocument({
                    ...config,
                    ...data
                })
            } else {
                response = await crud.updateDocument({
                    ...config,
                    ...data,
                    upsert: true
                })
            }
            if (response) {
                return response;
            }
        } catch (err) {
            console.log(err);
            return null;
        }
    }

    async function run() {
        if (directories)
            await runDirectories()

        if (sources) {
            let sources = await runSources()
            let newConfig = { ...CoCreateConfig }
            if (directories)
                newConfig.directories = directories

            newConfig.sources = sources

            delete newConfig.config.url
            delete newConfig.config.broadcast
            let write_str = JSON.stringify(newConfig, null, 4)
            write_str = "module.exports = " + write_str;

            fs.writeFileSync(configFile, write_str);
        }

        console.log('upload complete!');

        setTimeout(function () {
            process.exit()
        }, 2000)
    }

    run()
}