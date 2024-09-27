const { exec } = require('child_process');
const os = require('os');
const LogsRepository = require('../repository/logsRepository');
const logsRepository = new LogsRepository();
const path = require('path');
const levels = require('../models/logs/levels')

const systemOperation = async () => {
    try {
        console.log('Operational system:', os.platform());
        console.log('Version:', os.version());
        console.log('Architecture:', os.arch());
        console.log('Endianness:', os.endianness());
        console.log('Tipo:', os.type());
        console.log('Release:', os.release());
        console.log('Hostname:', os.hostname());
        console.log('Tempo de atividade:', os.uptime(), 'segundos');

        if (os.platform() === 'linux') {
            const commandStatus = path.join(__dirname, '..', 'script', 'statusBluetooth.sh').replace(/\\/g, '/');
            const bluetoothDisabledScript = path.join(__dirname, '..', 'script', 'deactivating_Bluetooth.sh').replace(/\\/g, '/');

            const runCommand = (command, description) => {
                return new Promise((resolve, reject) => {
                    exec(command, (error, stdout, stderr) => {
                        if (error) {
                            console.error(`Erro ao ${description}: ${error.message}`);
                            reject(error);
                            return;
                        }

                        console.log(`Saída do comando ${description}: ${stdout}`);
                        if (stderr) {
                            console.error(`Erro padrão do comando ${description}: ${stderr}`);
                        }
                        resolve(stdout);
                    });
                });
            };
            setTimeout(async () => {
                try {
                    const status = await runCommand(commandStatus, 'verificar o status do Bluetooth');
                    if (status.includes('Bluetooth is off')) {
                        console.log('Bluetooth is inactive..');
                        logsRepository.saveLogs(levels[2], 'Bluetooth is inactive.');
                    } else if (status.includes('Bluetooth is active')) {
                        console.log('Bluetooth is active. Trying to disable...');
                        logsRepository.saveLogs(levels[2], 'Bluetooth is active. Trying to disable...');
                    } else {
                        console.log('Unable to determine Bluetooth status.');
                        logsRepository.saveLogs(levels[3], 'Unable to determine Bluetooth status.');
                    }
                } catch (error) {
                    console.error('Erro ao executar comandos do Bluetooth:', error.message);
                    logsRepository.saveLogs(levels[2], `Erro ao verificar o status do Bluetooth: ${error.message}`);
                }
            }, 7000);
        }

        return {
            systemOperaction: os.platform(),
            architecture: os.arch(),
        };

    } catch (error) {
        console.error('Error retrieving system information:', error.message);
    }
};

module.exports = { systemOperation };
