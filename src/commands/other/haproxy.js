const fs = require('fs');
const { exec } = require('child_process');

const haproxyConfigPath = '/etc/haproxy/haproxy.cfg';
const backendSectionName = 'backend app_backend';

// Function to update HAProxy config with new servers
const updateHAProxyConfig = (newServers) => {
    fs.readFile(haproxyConfigPath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading HAProxy config:', err);
            return;
        }

        const updatedConfig = updateBackendServers(data, newServers);
        fs.writeFile(haproxyConfigPath, updatedConfig, 'utf8', (err) => {
            if (err) {
                console.error('Error writing updated HAProxy config:', err);
                return;
            }

            reloadHAProxy();
        });
    });
};

// Function to replace backend server entries in the config
const updateBackendServers = (configData, newServers) => {
    const lines = configData.split('\n');
    let backendSectionStart = -1;
    let backendSectionEnd = -1;

    // Find the start and end of the backend section
    lines.forEach((line, index) => {
        if (line.trim() === backendSectionName) {
            backendSectionStart = index;
        }
        if (backendSectionStart !== -1 && backendSectionEnd === -1 && line.trim() === '') {
            backendSectionEnd = index;
        }
    });

    if (backendSectionStart === -1 || backendSectionEnd === -1) {
        console.error('Backend section not found in HAProxy config');
        return configData;
    }

    // Replace the server list in the backend section
    const newServerLines = newServers.map(server => `    server ${server.name} ${server.address} check`);
    const updatedLines = [
        ...lines.slice(0, backendSectionStart + 1),
        ...newServerLines,
        ...lines.slice(backendSectionEnd)
    ];

    return updatedLines.join('\n');
};

// Function to reload HAProxy
const reloadHAProxy = () => {
    exec('systemctl reload haproxy', (err, stdout, stderr) => {
        if (err) {
            console.error('Error reloading HAProxy:', err);
            return;
        }
        console.log('HAProxy reloaded successfully');
    });
};

// Example usage
const newServers = [
    { name: 'app1', address: '10.0.0.1:80' },
    { name: 'app2', address: '10.0.0.2:80' }
];

updateHAProxyConfig(newServers);
