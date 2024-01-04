const { exec } = require("child_process");

// Define the commands
const commands = [
    "sudo apt-get update",
    "sudo apt-get install -y nfs-common",
    `sudo mkdir /mnt/efs`,
    // Replace fs-12345678 with your actual file system ID and us-west-2 with your EFS region
    "sudo mount -t nfs4 -o nfsvers=4.1,rsize=1048576,wsize=1048576,hard,timeo=600,retrans=2 fs-060287caeafac2302.efs.us-east-1.amazonaws.com:/ /mnt/efs"
];

// Function to execute each command
const executeCommand = (command) => {
    return new Promise((resolve, reject) => {
        exec(command, (error, stdout, stderr) => {
            if (error) {
                console.warn(error);
                reject();
            }
            console.log(stdout);
            resolve();
        });
    });
};

// Execute all commands in sequence
const runCommands = async () => {
    for (const command of commands) {
        console.log(`Running: ${command}`);
        try {
            await executeCommand(command);
        } catch (error) {
            console.error(`Error executing ${command}`);
            break; // Exit if any command fails
        }
    }
    console.log("All commands executed successfully.");
};

runCommands();
