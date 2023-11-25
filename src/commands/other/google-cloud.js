const { Compute } = require('@google-cloud/compute');
const path = require('path');
const { NodeSSH } = require('node-ssh');
const ssh = new NodeSSH();

// Set GCP Project ID and path to your service account key
const projectId = 'your-project-id';
const keyFilename = path.join(__dirname, 'path-to-your-service-account-key.json');

// Initialize Google Compute Engine API
const compute = new Compute({ projectId, keyFilename });

// Configuration for the VM instance
const zone = compute.zone('us-central1-a'); // change as per your requirement
const config = {
    os: 'ubuntu',
    machineType: 'n1-standard-1', // change as per your requirement
    http: true,
    https: true
};

async function createVM() {
    try {
        const vmName = 'your-vm-name'; // choose a name for your VM
        const [, operation] = await zone.createVM(vmName, config);
        await operation.promise();

        // Retrieve the newly created VM metadata
        const vm = zone.vm(vmName);
        const [metadata] = await vm.getMetadata();

        // Connect to the VM via SSH and install Node.js
        // This assumes you have set up SSH keys for GCP VMs
        const externalIP = metadata.networkInterfaces[0].accessConfigs[0].natIP;
        await ssh.connect({
            host: externalIP,
            username: 'your-ssh-username', // default is often 'ubuntu' for Ubuntu VMs
            privateKey: 'path/to/your/private/ssh/key'
        });

        const commands = [
            'curl -sL https://deb.nodesource.com/setup_14.x | sudo -E bash -',
            'sudo apt-get install -y nodejs',
            // Additional commands as needed
        ];

        const result = await ssh.execCommand(commands.join(' && '));
        console.log('STDOUT:', result.stdout);
        console.log('STDERR:', result.stderr);

    } catch (err) {
        console.error('Error during VM creation:', err);
    }
}

createVM();
