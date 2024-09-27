const CifraRepository = require('../repository/cifraRepository');
const cifraRepository = new CifraRepository();
const { cifra ,salt } = require('../config');
const crypto = require('crypto');
const LogsRepository = require('../repository/logsRepository')
const logsRepository = new LogsRepository();
const levels = require('../models/logs/levels');

const secretKey = generateKeyFromPassword(cifra, salt, 32);
function generateKeyFromPassword(password, salt, keyLength) {
    return crypto.pbkdf2Sync(password, salt, 100000, keyLength, 'sha256');
}

async function createCifra2FA(cifra) {
    try {
        const newCifra = cifraRepository.createCifra2FA(cifra, secretKey);
        return { success: true, cifra: newCifra };
    } catch (error) {
        throw new Error(`Error: ${error.message}`);
    }
}

async function getCifra2FA(data) {
    try {
        const decryptedData = cifraRepository.getByCifra2FA(secretKey);
        const result = decryptedData.localeCompare(data);
        if (result === 0) {
            logsRepository.saveLogs(levels[1], "Alert unblocked with success")
            return { success: true, message: ' Decrypted data was successfully' };
        } else {
            logsRepository.saveLogs(levels[3], `Attempt cifra: ${data}`)
            return { success: false, message: 'Cifra not found' };
        }
    } catch (error) {
        throw new Error(`Error: ${error.message}`);
    }
}

module.exports = {
    createCifra2FA,
    getCifra2FA
};
