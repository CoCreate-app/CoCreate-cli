const fs = require('fs');
const { exec } = require('child_process');

const nginxConfigPath = '/etc/nginx/conf.d/myapp.conf';
const upstreamBlockName = 'upstream app_backend';

// Function to update NGINX config with new servers
const updateNginxConfig = (newServers) => {
    fs.readFile(nginxConfigPath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading NGINX config:', err);
            return;
        }

        const updatedConfig = updateUpstreamServers(data, newServers);
        fs.writeFile(nginxConfigPath, updatedConfig, 'utf8', (err) => {
            if (err) {
                console.error('Error writing updated NGINX config:', err);
                return;
            }

            reloadNginx();
        });
    });
};

// Function to replace upstream server entries in the config
const updateUpstreamServers = (configData, newServers) => {
    const lines = configData.split('\n');
    let upstreamSectionStart = -1;
    let upstreamSectionEnd = -1;

    // Find the start and end of the upstream section
    lines.forEach((line, index) => {
        if (line.trim().startsWith(upstreamBlockName)) {
            upstreamSectionStart = index;
        }
        if (upstreamSectionStart !== -1 && upstreamSectionEnd === -1 && line.trim() === '}') {
            upstreamSectionEnd = index;
        }
    });

    if (upstreamSectionStart === -1 || upstreamSectionEnd === -1) {
        console.error('Upstream section not found in NGINX config');
        return configData;
    }

    // Replace the server list in the upstream section
    const newServerLines = newServers.map(server => `    server ${server.address};`);
    const updatedLines = [
        ...lines.slice(0, upstreamSectionStart + 1),
        ...newServerLines,
        ...lines.slice(upstreamSectionEnd)
    ];

    return updatedLines.join('\n');
};

// Function to reload NGINX
const reloadNginx = () => {
    exec('systemctl reload nginx', (err, stdout, stderr) => {
        if (err) {
            console.error('Error reloading NGINX:', err);
            return;
        }
        console.log('NGINX reloaded successfully');
    });
};

// Example usage
const newServers = [
    { address: '10.0.0.1:80' },
    { address: '10.0.0.2:80' }
];

updateNginxConfig(newServers);
