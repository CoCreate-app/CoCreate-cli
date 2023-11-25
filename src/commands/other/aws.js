const AWS = require('aws-sdk');
const { NodeSSH } = require('node-ssh'); // npm install node-ssh
const ssh = new NodeSSH();

AWS.config.update({ region: 'us-west-2' });

const ec2 = new AWS.EC2({ apiVersion: '2016-11-15' });

const instanceParams = {
    ImageId: 'ami-0abcdef1234567890',
    InstanceType: 't2.micro',
    KeyName: 'your-key-pair-name',
    MinCount: 1,
    MaxCount: 1
};

ec2.runInstances(instanceParams, function (err, data) {
    if (err) {
        console.error("Could not create instance", err);
        return;
    }
    const instanceId = data.Instances[0].InstanceId;
    console.log("Created instance", instanceId);

    // Wait for instance to be in running state and get its Public DNS
    waitForInstanceRunning(instanceId, (err, instanceData) => {
        if (err) {
            console.error("Error waiting for instance running", err);
            return;
        }

        // SSH into the instance and install Node.js
        ssh.connect({
            host: instanceData.PublicDnsName,
            username: 'ec2-user', // default username for Amazon AMI
            privateKey: 'path/to/your/key-pair.pem'
        })
            .then(function () {
                // Commands to install Node.js and start your server
                const commands = [
                    'curl -sL https://deb.nodesource.com/setup_14.x | sudo -E bash -',
                    'sudo apt-get install -y nodejs',
                    // additional commands to clone your project, install dependencies, and start the server
                ];

                return ssh.execCommand(commands.join(' && '));
            })
            .then(function (result) {
                console.log('STDOUT: ' + result.stdout);
                console.log('STDERR: ' + result.stderr);
            })
            .catch(function (error) {
                console.error('SSH Connection Error: ' + error);
            });
    });
});

function waitForInstanceRunning(instanceId, callback) {
    ec2.waitFor('instanceRunning', { InstanceIds: [instanceId] }, function (err, data) {
        if (err) {
            callback(err);
            return;
        }
        const instanceData = data.Reservations[0].Instances[0];
        callback(null, instanceData);
    });
}
