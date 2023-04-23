const util = require('node:util');
const exec = require('node:child_process').exec;
const dns = require('dns');
const child_process = require('child_process');
const spawn = child_process.spawn;

const localip = '3.231.17.247'
const certificates = new Map()


async function checkDns(host) {
    return new Promise((resolve, reject) => {

        try {
            dns.resolve(host, 'A', (err, records) => {
                if (records && records[0] === localip) {
                    resolve(true)
                } else {
                    console.log('host A record need to point to', localip)
                    resolve(false)
                }
                if (err)
                    console.log(host, err);
            });   
        } catch(err) {
            console.log('certificate', err)
        }
    });
}

async function createCert(host) {
    try {
        // let hosts = await exec(`sudo openssl x509 -dates -noout -in /etc/letsencrypt/live/${host}/fullchain.pem`);
        // console.log('hostst check', hosts)
        let test = await checkDns(host)
        console.log('checked dns from creatCert', test)
        if (test) {
            await exec(`sudo certbot certonly --manual -d *.${host} -d  ${host} --agree-tos --preferred-challenges dns-01 --server https://acme-v02.api.letsencrypt.org/directory`);
            let exitCode = await spawn('sudo', ['certbot', 'certonly', '--manual', '-d', `*.${host}`, '-d', host, '--agree-tos', '--preferred-challenges', 'dns-01', '--server', 'https://acme-v02.api.letsencrypt.org/directory'], { stdio: 'inherit', cwd: process.cwd() })
            if (exitCode !== 0) {
                failed.push({ name: false, des: `creating directory failed` })
            } else 
                console.log(true)

            // return true
        } else 
            return false
    } catch(err) {
       return false
    }
}

async function deleteCert(host) {
    try {
        await exec(`sudo certbot delete --cert-name ${host}`);
        return true
    } catch(err) {
       return false
    }
}

async function checkCert(host) {
    try {
        let hosts = await exec(`host ${host}`);
        console.log('hostst check', hosts)

        if (certificates.has(host))
            return true
        else {
            let certs = await exec(`sudo openssl x509 -dates -noout -in /etc/letsencrypt/live/${host}/fullchain.pem`);
            let cert = certs.stdout.split('\n')
            let issued = Date.parse(cert[0].replace('notBefore=', ''))
            let expires = Date.parse(cert[1].replace('notAfter=', ''))
            let currentDate = new Date()

            if (!issued || !expires)
                console.log('not defined', {issued, expires})
            else if (!isNaN(expires)) {
                if (currentDate < expires) {
                    certificates.set(host, {issued, expires})
                    return true
                } else {
                    let cert = await createCert(host)
                    return cert
                }
            } else {
                let cert = await createCert(host)
                return cert
            }
        }
    } catch(err) {
        let cert = await createCert(host)
        if (cert)
            certificates.set(host, {issued, expires})
        return cert
    }
}

async function test(host) {
    try {
        

        await exec(`sudo certbot certonly --manual --test-cert -d *.${host} -d  ${host} --agree-tos --preferred-challenges dns-01 --server https://acme-v02.api.letsencrypt.org/directory`);
        let exitCode = await spawn('sudo', ['certbot', 'certonly', '--manual', '--test-cert', '-d', `*.${host}`, '-d', host, '--agree-tos', '--preferred-challenges', 'dns-01', '--server', 'https://acme-v02.api.letsencrypt.org/directory'], { stdio: 'inherit', cwd: process.cwd() })
        if (exitCode !== 0) {
            failed.push({ name: false, des: `creating directory failed` })
        } else 
            console.log(true)

        // let child = exec('su -')
        // child.stdin.write("testserver\n");

        // child.stdout.on('data', (data) => {
        //     console.log(`stdout: "${data}"`);
        // });
        
        // child.stdin.end(); // EOF
        
        // child.on('close', (code) => {
        //     console.log(`Child process exited with code ${code}.`);
        // });

        // exitCode.on("data", data => {
        //     console.log('test')
        // })
        // let test = exitCode
        // if (exitCode !== 0) {
        //     exitCode.write('test', (err) => {
        //         if (err) throw Error(err.message)
        //     })
        // } else {
        //     exitCode.write('test', (err) => {
        //         if (err) throw Error(err.message)
        //     })
        // }

        // return true
        // return false
    } catch(err) {
        process.exit(1)
    //    return false
    }
}


test('cocreate.app')

module.exports = {checkDns, checkCert, createCert, deleteCert}