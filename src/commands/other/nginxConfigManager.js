const util = require('node:util');
const exec = util.promisify(require('node:child_process').exec);
let fs = require('fs');

const available = "/etc/nginx/sites-available/"
const enabled = "/etc/nginx/sites-enabled/"

async function createServer(hosts) {
    const response = {}
    if (!Array.isArray(hosts))
        hosts = [hosts]

    for (let host of hosts) {
        const hostParts = host.split('.')
        const domain = hostParts[0];
        const tld =  hostParts[1];
        const server = `
server {
    server_name  ~^(?<sub>.+)\.${domain}\.${tld} ${host};
  
    location / {
            proxy_pass http://localhost:3000;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            fastcgi_buffers 16 16k;
            fastcgi_buffer_size 32k;
            proxy_buffer_size 128k;
            proxy_buffers 4 256k;
            proxy_busy_buffers_size 256k;

    }

    location /ws/ {
            proxy_pass http://localhost:3000;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection "Upgrade";
            fastcgi_buffers 16 16k;
            fastcgi_buffer_size 32k;
            proxy_buffer_size 128k;
            proxy_buffers 4 256k;
            proxy_busy_buffers_size 256k;

    }

    location /api/ {
            proxy_pass http://localhost:3002;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection "Upgrade";
            fastcgi_buffers 16 16k;
            fastcgi_buffer_size 32k;
            proxy_buffer_size 128k;
            proxy_buffers 4 256k;
            proxy_busy_buffers_size 256k;
    }

    listen 443 ssl http2;
    ssl_certificate /etc/letsencrypt/live/${host}/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/${host}/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;
  
}

`;
        fs.writeFileSync(`${available}${host}`, server)
      
        if (!fs.existsSync(`${enabled}${host}`))
            await exec(`sudo ln -s ${available}${host} ${enabled}`);
        
        let test = await exec(`sudo nginx -t`);
        if (test.stderr.includes('test is successful')) {
            await exec(`sudo systemctl reload nginx`);
            console.log('test passed reloading nginx', host)
            response[host] = true
        } else {
            console.log('test failed', host)
            response[host] = false
        }
    }
    return response
}

async function deleteServer(hosts) {
    const response = {}
    if (!Array.isArray(hosts))
        hosts = [hosts]
    for (let host of hosts) {
        fs.unlinkSync(`${available}${host}`)
        response[host] = true
    }
    return response
}

// createServer(['cocreate.app'])
// deleteServer(['cocreate.app'])

module.exports = {createServer, deleteServer}