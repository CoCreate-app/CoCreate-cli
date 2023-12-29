const { requestCertificate } = require('@cocreate/acme')

module.exports = async function nginx(repos, args) {
    let failed = [];

    try {
        if (args.length) {
            if (args[0] === 'create') {
                args.shift()
                await createServer(args);
            } else if (args[0] === 'delete') {
                args.shift()
                await deleteServer(args);
            } else
                await createServer(args);
        }
    } catch (err) {
        failed.push({ name: 'GENERAL', des: err.message });
        console.error(err.red);
    } finally {
        return failed;
    }

}

