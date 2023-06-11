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
            '-m', 'admin@cocreate.app',
            '--preferred-challenges', 'dns-01',
            '--server', 'https://acme-v02.api.letsencrypt.org/directory'
        ]);

        let promptsCount = 0;

        certbotProcess.stdout.on('data', (data) => {
            const output = data.toString();
            if (output.includes('Enter your response here')) {
                promptsCount++;
                if (promptsCount === 1) {
                    certbotProcess.stdin.write('Your first response\n');
                } else if (promptsCount === 2) {
                    certbotProcess.stdin.write('Your second response\n');
                } else if (promptsCount === 3) {
                    certbotProcess.stdin.write('Your third response\n');
                }
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
