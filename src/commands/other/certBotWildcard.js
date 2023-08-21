#!/usr/bin/env node

const { spawn } = require('child_process');

function runCertbot() {
    return new Promise((resolve, reject) => {
        const certbotProcess = spawn('sudo', [
            'certbot',
            'certonly',
            '--manual',
            '-d', '*.cocreate.zone',
            '-d', 'cocreate.zone',
            '--agree-tos',
            '-m', 'admin@cocreate.zone',
            '--preferred-challenges', 'dns-01',
            '--server', 'https://acme-v02.api.letsencrypt.org/directory'
        ]);

        // let promptsCount = 0;

        certbotProcess.stdout.on('data', (data) => {
            const output = data.toString();
            if (output.includes('Please deploy a DNS TXT record under the name:')) {
                const namePattern = /Please deploy a DNS TXT record under the name:\s+([\w\.-]+)\./;
                const valuePattern = /with the following value:\s+([\w\d]+)\s+/;

                const nameMatch = output.match(namePattern);
                const valueMatch = output.match(valuePattern);

                if (nameMatch && valueMatch) {
                    const name = nameMatch[1];
                    const value = valueMatch[1];

                    console.log("Name:", name);
                    console.log("Value:", value);
                } else {
                    console.log("Name or value not found in the text.");
                }
                // TODO: send name and value to client and wait for clients response before continuing
                certbotProcess.stdin.write('\n');
            } else if (output.includes('Press Enter to Continue')) {
                certbotProcess.stdin.write('\n');
            }
        });

        certbotProcess.stderr.on('data', (data) => {
            reject(data.toString());
        });

        certbotProcess.on('close', (code) => {
            if (code === 0) {
                resolve('Certbot process completed successfully.');
            } else {
                reject(`Certbot process exited with code ${code}`);
            }
        });
    });
}

async function executeCertbot() {
    try {
        const result = await runCertbot();
        console.log(result);
    } catch (error) {
        console.error('An error occurred:', error);
    }
}

executeCertbot();
