const fs = require('fs')
const path = require('path')

const LogsRepository = require('../repository/logsRepository')
const lgRepository = new LogsRepository();


// get filter levels via ipc render
async function getFilterByLevels(filter) {
    try {
        if (!filter) throw new Error("Filter must be an array or an object with levels");
        const logs = lgRepository.filterLogsBuyLevels(filter);
        if (!logs) return { success: false, message: 'Logs file not found' };
        return logs;
    } catch (error) {

        throw new Error(`Error filter logs: ${error.message}`);
    }
}

// send request logs
async function getLogs() {
    try {
        const logs = lgRepository.getLogs();
        if (!logs) return { success: false, message: 'Logs file not found' };
        return logs;
    } catch (error) {
        throw new Error(`Error: ${error.message}`);
    }
}

// show logs with current data
async function checkAndRemoveLogs() {
    // const JSON_LOGS_PATH = path.join(__dirname, '../data/logs.json');
    const JSON_LOGS_PATH = process.env.LOGS_DATA_PATH + '/' + 'logs.json';

    try {
        const logsContent = fs.readFileSync(JSON_LOGS_PATH, 'utf-8');
        const logsData = JSON.parse(logsContent);

        const currentSystem = new Date();

        logsData.logs = logsData.logs.filter(entry => {
            const logTimestamp = new Date(entry.timestamp);
            const differenceInDays = Math.floor((currentSystem - logTimestamp) / (1000 * 60 * 60 * 24));
            return differenceInDays <= 15;
        });

        const updatedJSON = JSON.stringify(logsData, null, 2);
        fs.writeFileSync(JSON_LOGS_PATH, updatedJSON);

    } catch (error) {
        console.error('Error updating Logs JSON:', error);
    }
}




module.exports = {
    getLogs,
    getFilterByLevels,
    checkAndRemoveLogs
};


