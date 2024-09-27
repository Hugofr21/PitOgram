const LogsModel = require('../models/logs/logs');

class LogsRepository {
    constructor(){
        this.lgModel = new LogsModel();
    }

    saveLogs(level, message) {
        if (!level || !message) { console.error('Invalid log: level ' + level + 'message ' + message); }
        this.lgModel.createLog(level, message);
    }

    async getLogs() {
        const currentSystem = new Date().toUTCString();
        await this.lgModel.updateDataInJson(currentSystem)
        return this.lgModel.getAllLogs();
    }

    async filterLogsBuyLevels(filter) {
        const logsJson = await this.lgModel.getAllLogs();

        if (!logsJson || !logsJson.logs || logsJson.logs.length === 0) {
            return console.error("Logs empty or not found");
        }

        if (filter && filter.length > 0) {
            const filteredLogs = logsJson.logs.filter(log => filter.includes(log.level));
            if (filteredLogs.length > 0) {
                return filteredLogs;
            } else {
                return { message: "No logs found for the specified filter levels" };
            }
        } else {
            return { message: "Filter not provided or is empty" };
        }
    }

}

module.exports = LogsRepository;
