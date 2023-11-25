const fs = require('fs');
const { exec } = require('child_process');

const haproxyConfigPath = '/etc/haproxy/haproxy.cfg';

// Function to add a new configuration to HAProxy and restart it
const addHAProxyConfig = (frontendName, backendName, backendServers) => {
    fs.readFile(haproxyConfigPath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading HAProxy config:', err);
            return;
        }

        // Append new frontend and backend configuration
        const newConfig = `
# Frontend Configuration
frontend ${frontendName}
    bind *:80
    mode http
    default_backend ${backendName}

# Backend Configuration
backend ${backendName}
    mode http
    balance roundrobin`;

        // Add server entries
        backendServers.forEach((server, index) => {
            newConfig += `\n    server server${index} ${server.address} check`;
        });

        // Write updated configuration
        fs.writeFile(haproxyConfigPath, data + newConfig, 'utf8', (err) => {
            if (err) {
                console.error('Error writing updated HAProxy config:', err);
                return;
            }

            restartHAProxy();
        });
    });
};

// Function to restart HAProxy
const restartHAProxy = () => {
    exec('systemctl restart haproxy', (err, stdout, stderr) => {
        if (err) {
            console.error('Error restarting HAProxy:', err);
            return;
        }
        console.log('HAProxy restarted successfully');
    });
};

// Example usage
const frontendName = 'my_frontend';
const backendName = 'my_backend';
const backendServers = [
    { address: '10.0.0.1:80' },
    { address: '10.0.0.2:80' }
];

addHAProxyConfig(frontendName, backendName, backendServers);
