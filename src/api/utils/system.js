const os = require('os');
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);


function isLinux() {
    return os.platform() === 'linux';
}


async function runCommand(command) {
    try {
        const { stdout, stderr } = await execPromise(command);
        if (stderr) {
            console.error('Error executing command:', stderr);
        } else {
            console.log('Command output:', stdout);
        }
    } catch (err) {
        console.error('Command execution failed:', err);
    }
}

async function checkAndRunCommand() {
    const commandDown = 'sudo hciconfig hci0 down';
    console.log('Running command:', commandDown);
    await runCommand(commandDown);
}

module.exports = {
    isLinux,
    runCommand,
    checkAndRunCommand
};


