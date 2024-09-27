const fs = require('fs');
const path = require('path');
const levels = require('./levels');

class LogsModel {
    constructor(level, message) {
        this.level = level;
        this.message = message;
        this.timestamp = new Date().toUTCString();
    }

    async createLog(level, message) {
        try {
            const logsFileData = process.env.LOGS_DATA_PATH + '/' + 'logs.json';

            if (!logsFileData) {
                throw new Error('LOGS_DATA_PATH não está definido nas variáveis de ambiente.');
            }

            // Verificar se o arquivo existe, caso contrário, criar um novo arquivo de logs
            if (!fs.existsSync(logsFileData)) {
                fs.writeFileSync(logsFileData, JSON.stringify({ logs: [] }, null, 2));
            }

            // Ler o conteúdo do arquivo de logs
            const logsJson = fs.readFileSync(logsFileData, 'utf-8');
            const logsData = JSON.parse(logsJson);

            // Validações do nível e tamanho da mensagem
            if (!Object.values(levels).includes(level) ||
                message.length === 0 || JSON.stringify(message).length > 10 * 1024 * 1024) {
                console.error('Ignorando:', level);
                return;
            }

            // Adicionar novo log
            logsData.logs.push({
                timestamp: new Date().toUTCString(),
                level: level,
                message: message,
            });

            // Verificar o tamanho do JSON e escrever no arquivo
            const jsonSize = JSON.stringify(logsData).length;
            if (jsonSize <= 10 * 1024 * 1024) {
                fs.writeFileSync(logsFileData, JSON.stringify(logsData, null, 2));
            } else {
                console.error('O tamanho do JSON excede 10MB. Logs não adicionados.');
            }
        } catch (error) {
            console.error('Erro ao adicionar logs:', error);
        }
    }

    async getAllLogs() {
        try {

            const logsFileData = process.env.LOGS_DATA_PATH + '/' + 'logs.json';

            if (!logsFileData) {
                throw new Error('LOGS_DATA_PATH não está definido nas variáveis de ambiente.');
            }

            if (!fs.existsSync(logsFileData)) {
                throw new Error('Arquivo de log não encontrado.');
            }

            const logsJson = fs.readFileSync(logsFileData, 'utf-8');
            const logsData = JSON.parse(logsJson);
            return logsData;
        } catch (error) {
            console.error('Erro ao obter logs:', error);
            return { success: false, error: error.message };
        }
    }

    async updateDataInJson(newData) {
        try {

            const logsFileData = process.env.LOGS_DATA_PATH + '/' + 'logs.json';

            if (!logsFileData) {
                throw new Error('LOGS_DATA_PATH não está definido nas variáveis de ambiente.');
            }

            if (!fs.existsSync(logsFileData)) {
                throw new Error('Arquivo de log não encontrado.');
            }

            const logsJson = fs.readFileSync(logsFileData, 'utf-8');
            const logsData = JSON.parse(logsJson);

            logsData.data = newData;

            fs.writeFileSync(logsFileData, JSON.stringify(logsData, null, 2));
            // console.log('Dados no JSON atualizados com sucesso!');
        } catch (error) {
            console.error('Erro ao atualizar dados no JSON:', error);
        }
    }
}

module.exports = LogsModel;
