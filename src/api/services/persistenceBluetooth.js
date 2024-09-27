const fs = require('fs');
const path = require('path');

class PersistenceDataBluetthonClient {
    async getBluetoothCurrent() {
        const jsonCurrent = await this.verifyFileDataExists();
        this.cleanUndefinedItems(jsonCurrent);
        if (jsonCurrent.bluetooth && Array.isArray(jsonCurrent.bluetooth)) {
            const deviceCurrent = jsonCurrent.bluetooth.filter(
                item => item.active === true
            );
            return deviceCurrent;
        }
    }

    async getAllDevicesFound() {
        const jsonCurrent = await this.verifyFileDataExists();
        this.cleanUndefinedItems(jsonCurrent);
        return jsonCurrent.bluetooth;
    }

    async verifyFileDataExists() {
        const DIRECTORY_DATA_BLUETOOTH = process.env.BLUETOOTH_DATA_PATH + '/' + 'bluetooth.json';
        if (fs.existsSync(DIRECTORY_DATA_BLUETOOTH)) {
            try {
                const data = fs.readFileSync(DIRECTORY_DATA_BLUETOOTH, 'utf8');
                const parsedData = JSON.parse(data);

                if (parsedData && typeof parsedData === 'object' && parsedData.hasOwnProperty('bluetooth') && parsedData.hasOwnProperty('date')) {
                    return parsedData;
                } else {
                    return createInitialDataFile(DIRECTORY_DATA_BLUETOOTH);
                }
            } catch (error) {
                return createInitialDataFile(DIRECTORY_DATA_BLUETOOTH);
            }
        } else {
            return createInitialDataFile(DIRECTORY_DATA_BLUETOOTH);
        }
    }

    async createInitialDataFile(filePath) {
        const initialData = {
            bluetooth: [],
            date: new Date().toLocaleDateString('pt-PT')
        };
        fs.writeFileSync(filePath, JSON.stringify(initialData, null, 2), 'utf8');
        return JSON.parse(initialData);
    }

    async updateData(deviceCurrentAddress) {
        const DIRECTORY_DATA_BLUETOOTH = process.env.BLUETOOTH_DATA_PATH + '/' + 'bluetooth.json';
        const jsonCurrent = await this.verifyFileDataExists();
        this.cleanUndefinedItems(jsonCurrent);
        jsonCurrent.bluetooth.forEach(device => (device.active = false));
        const existingDeviceIndex = jsonCurrent.bluetooth.findIndex(
            existingDevice => existingDevice.deviceId === deviceCurrentAddress
        );
        if (existingDeviceIndex !== -1) {
            jsonCurrent.bluetooth[existingDeviceIndex].active = true;
        }
        fs.writeFileSync(
            DIRECTORY_DATA_BLUETOOTH,
            JSON.stringify(jsonCurrent, null, 2)
        );
    }

    async updateDeviceTrueForFlase() {
        const DIRECTORY_DATA_BLUETOOTH = process.env.BLUETOOTH_DATA_PATH + '/' + 'bluetooth.json';
        const jsonCurrent = await this.verifyFileDataExists();
        this.cleanUndefinedItems(jsonCurrent);
        if (jsonCurrent.bluetooth && Array.isArray(jsonCurrent.bluetooth)) {
            jsonCurrent.bluetooth.forEach((device, index) => {
                if (device.active === true) {
                    jsonCurrent.bluetooth[index].active = false;
                }
            });
        }
        fs.writeFileSync(
            DIRECTORY_DATA_BLUETOOTH,
            JSON.stringify(jsonCurrent, null, 2)
        );
    }

    async deleteData() {
        const DIRECTORY_DATA_BLUETOOTH = process.env.BLUETOOTH_DATA_PATH + '/' + 'bluetooth.json';
        const jsonCurrent = await this.verifyFileDataExists();
        console.log(JSON.stringify(jsonCurrent));
        jsonCurrent.bluetooth = [];

        const timeElapsed = Date.now();
        const today = new Date(timeElapsed).toLocaleDateString();

        const currentDate = new Date(jsonCurrent.date.split('/').reverse().join('/'));
        const todayDate = new Date(today.split('/').reverse().join('/'));

        if (currentDate < todayDate) {
            jsonCurrent.date = today;
        }

        fs.writeFileSync(
            DIRECTORY_DATA_BLUETOOTH,
            JSON.stringify(jsonCurrent, null, 2)
        );
    }

    async convertDeviceFormat(device) {
        return {
            deviceId: device.address,
            deviceName: device.name,
            active: false
        };
    }

    async saveData(devices) {
        const DIRECTORY_DATA_BLUETOOTH = process.env.BLUETOOTH_DATA_PATH + '/' + 'bluetooth.json';
        try {
            const jsonCurrent = await this.verifyFileDataExists();
            this.cleanUndefinedItems(jsonCurrent);
            for (const device of devices) {

                if (!device.name || !device.address) {
                    console.log('Device does not have name or address defined:', device);
                    continue;
                }

                const formattedDevice = await this.convertDeviceFormat(device);
                const existingDeviceIndex = jsonCurrent.bluetooth.findIndex(
                    existingDevice => existingDevice.deviceId === formattedDevice.deviceId
                );

                if (existingDeviceIndex !== -1) {
                    jsonCurrent.bluetooth[existingDeviceIndex] = formattedDevice;
                } else {
                    jsonCurrent.bluetooth.push(formattedDevice);
                }
            }

            fs.writeFileSync(
                DIRECTORY_DATA_BLUETOOTH,
                JSON.stringify(jsonCurrent, null, 2)
            );
        } catch (error) {
            console.error('Error occurred in saveData:', error);
        }
    }

    cleanUndefinedItems(jsonCurrent) {
        if (jsonCurrent.bluetooth && Array.isArray(jsonCurrent.bluetooth)) {
            jsonCurrent.bluetooth = jsonCurrent.bluetooth.filter(item => item !== undefined);
        }
    }
}

module.exports = PersistenceDataBluetthonClient;
