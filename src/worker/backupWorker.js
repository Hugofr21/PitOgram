const { parentPort } = require('worker_threads');
const { basckupFilesAndZip } = require('../tmp/services/backup/encryptFiles');

parentPort.on('message', async () => {
    try {
        await basckupFilesAndZip();
        parentPort.postMessage('Backup completed successfully');
    } catch (error) {
        parentPort.postMessage(`Error: ${error.message}`);
    }
});
