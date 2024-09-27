const net = require('net')
const EventEmitter = require('events');
const { base_keys } = require('../../utils/keycode')

class ClientSocket extends EventEmitter {
    constructor(host, port, handleKeyCode) {
        super();
        this.host = host
        this.port = port
        this.socket = new net.Socket();
        this.responsePromise = null
        this.resolveResponse = null
        this.rejectResponse = null
        this.dataCallback = null;
        this.handleKeyCode = handleKeyCode;
        this.currentDevice = null;
        this.connect();
    }

    connect() {
        if (this.socket.connecting || this.socket.destroyed) {
            console.log("🔥 ###################################### \r\n");
            console.log(
                '🔥 Socket is already connecting or destroyed. Skipping connection attempt.'
            );
            console.log("🔥 ###################################### \r\n");
            return
        }

        this.socket.connect(this.port, this.host, () => {
            console.log(`Connected to server at ${this.host}:${this.port}`)
            this.sendData('CLIENT_CONNECTED_TO_SERVER')
        })

        this.socket.on('data', data => {
            const decodedData = data.toString('utf8').trim()
            console.log('Received data from server:', decodedData)
            this.handleResponseServerBluetooth(decodedData)
        })

        this.socket.on('error', err => {
            console.error('Socket error:', err.message)
            if (this.rejectResponse) {
                this.rejectResponse(err)
            }

            if (err.message.includes('ECONNREFUSED')) {
                console.error(`ECONNREFUSED: Unable to connect to ${this.host}:${this.port}`);
                this.socket.destroy();
            }
        })

        this.socket.on('close', () => {
            console.log('Connection closed')
        })

        this.on('keycode', async (keycodeMessage) => {
            console.log(`Keycode event received: ${keycodeMessage}`);
        });

    }

    sendData(data) {
        this.socket.write(data + '\n', 'utf8', () => {
            console.log(`Sent data to server: ${data}`)
        })
    }

    disconnect() {
        this.socket.end()
    }

    async interpretKeyCode(keyCode) {
        const mappedKey = Object.keys(base_keys).find(
            key => base_keys[key] === keyCode
        )
        const result = mappedKey ? base_keys[mappedKey] : `Unknown key: ${keyCode}`
        return result
    }

    async handleBluetoothMessageSuccess(message) {

        if (message.startsWith('DEVICE_CONNECTED|')) {
            const deviceAddress = message.split('|')[1].trim();
            console.log(`Device connected successfully: ${deviceAddress}`);
            this.emit('deviceConnected', deviceAddress);
            return;
        }
    }

    async handleResponseServerBluetooth(data) {
        try {
            let jsonData
            let trimmedData = data.trim()

            if (trimmedData === '') return

            const interpretKeyCodeMessage = await this.interpretKeyCode(data);
            if (
                Object.values(trimmedData).includes(interpretKeyCodeMessage) ||
                interpretKeyCodeMessage !== `Unknown key: ${trimmedData}`
            ) {
                this.emit('keycode', interpretKeyCodeMessage);
            } else {
                this.handleBluetoothMessageSuccess(trimmedData);

                if (data.startsWith('{') || data.startsWith('[')) {
                    const fixedData = data.replace(/'/g, '"')
                    jsonData = JSON.parse(fixedData)
                } else {
                    jsonData = { message: data.trim() }
                }



                if (this.resolveResponse) {
                    this.resolveResponse(jsonData)
                }

                if (this.dataCallback) {
                    this.dataCallback(jsonData)
                }
            }
        } catch (error) {
            console.error('Error parsing server response:', error.message)
            if (this.rejectResponse) {
                this.rejectResponse(error)
            }
        } finally {
            this.clearPromises()
        }
    }

    clearPromises() {
        this.responsePromise = null
        this.resolveResponse = null
        this.rejectResponse = null
    }

    createPromiseWithTimeout(timeout = 30000) {
        this.clearPromises()
        return new Promise((resolve, reject) => {
            this.resolveResponse = resolve
            this.rejectResponse = reject
            setTimeout(() => {
                reject(new Error('Timeout: No response from server'))
            }, timeout)
        })
    }

    async scarnHCIDevices() {
        this.sendData('GET_DEVICES|START\r\n')
        console.log("GET_DEVICES|START GET_DEVICES|START GET_DEVICES|START GET_DEVICES|START");
    }

    async connectDeviceByAddress(deviceAddress) {
        this.sendData(`CONNECT|${deviceAddress}\r\n`)
        this.currentDevice = {
            address: deviceAddress
        };
        console.log('Connecting device with address: ' + deviceAddress);

        return this.createPromiseWithTimeout()
    }

    async stopSocketSendDevices() {
        this.sendData('GET_DEVICES|STOP\r\n')
    }

    async disconnectDevice() {
        this.sendData('DISCONNECT\r\n')
    }

    async deviceConnected() {
        console.log('DEVICE_CONNECTED\r\n')
        this.sendData('DEVICE_CONNECTED\r\n')
    }

    async onData(callback) {
        this.dataCallback = callback
    }

}

module.exports = ClientSocket
