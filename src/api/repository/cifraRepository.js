const CifraModel = require('../models/cifra');

class CifraRepository {
    constructor(){
        this.cifraModel = new CifraModel();
    }
    createCifra2FA(message, secretKey) {
        const encryptedData = this.cifraModel.encryptMessage(message, secretKey);
        this.cifraModel.setCifra(encryptedData);
        return encryptedData;
    }

    getByCifra2FA(secretKey) {
        const encryptedData = this.cifraModel.getCifra();
        if (encryptedData) {
            return this.cifraModel.decryptMessage(encryptedData, secretKey);
        }
        return "Cifra not found";
    }
}

module.exports = CifraRepository;