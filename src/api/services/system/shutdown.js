const { exec } = require('child_process');
const os = require('os');

function isLinux() {
    return os.platform() === 'linux';
}

function restartAction() {
    if (isLinux()) {
        const command = 'sudo reboot';
        exec(command, (error, stdout, stderr) => {
            if (error) {
                console.error(`Error when restarting: ${error.message}`);
                return;
            }
            if (stderr) {
                console.error(`Error when restarting:${stderr}`);
                return;
            }
            console.log(`Restarting the system: ${stdout}`);
        });
    } else {
        console.log('Restarting the application on Windows...');
        require('electron').app.relaunch();
        require('electron').app.exit(0);
    }
}

function shutdownAction() {
    if (isLinux()) {
        const command = 'sudo shutdown -h now';
        exec(command, (error, stdout, stderr) => {
            if (error) {
                console.error(`Error when shutting down: ${error.message}`);
                return;
            }
            if (stderr) {
                console.error(`Error when shutting down: ${stderr}`);
                return;
            }
            console.log(`Shutting down the system:${stdout}`);
        });
    } else {
        console.log('Shutting down the application in Windows...');
        require('electron').app.quit();
    }
}

module.exports = {
    restartAction,
    shutdownAction
};
