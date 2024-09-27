const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const jsonData = require('../config.json');

class CifraModel {
    constructor() {
        this.data = jsonData;
    }

    getCifra() {
        return this.data.cifra || null;
    }

    setCifra(cifra) {
        this.data.cifra = cifra;
        this.saveData();
    }

    saveData() {
        const configPath = path.resolve(__dirname, '../config.json');
        fs.writeFileSync(configPath, JSON.stringify(this.data, null, 2));
    }

    encryptMessage(message, secretKey) {
        const iv = crypto.randomBytes(16);
        const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(secretKey), iv);
        let encryptedMessage = cipher.update(message);
        encryptedMessage = Buffer.concat([encryptedMessage, cipher.final()]);
        return { iv: iv.toString('hex'), encryptedMessage: encryptedMessage.toString('hex') };
    }

    decryptMessage(encryptedData, secretKey) {
        const iv = Buffer.from(encryptedData.iv, 'hex');
        const encryptedMessage = Buffer.from(encryptedData.encryptedMessage, 'hex');
        const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(secretKey), iv);
        let decryptedMessage = decipher.update(encryptedMessage);
        decryptedMessage = Buffer.concat([decryptedMessage, decipher.final()]);
        return decryptedMessage.toString();
    }
}

module.exports = CifraModel;