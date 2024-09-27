const net = require('net');

class ServerSocket {
    constructor(port) {
        this.port = port;
        this.server = net.createServer(this.onClientConnected.bind(this));
        this.clients = [];
        this.deviceIndex = 0;
        this.uniqueDevices = [];
        this.generateDevices(); 
    }

    start() {
        this.server.listen(this.port, () => {
            console.log(`######################################################`);
            console.log(`Server listening on port ${this.port}`);
            console.log(`######################################################`);
        });

        this.server.on('error', (err) => {
            console.error('Server error:', err.message);
        });

        this.server.on('close', () => {
            console.log('Server closed');
        });

        this.sendUniqueDeviceToAllClients.bind(this)
        setInterval(this.sendKeyKP9ToAllClients.bind(this), 500);
    }

    onClientConnected(socket) {
        console.log(`Client connected: ${socket.remoteAddress}:${socket.remotePort}`);
        this.clients.push(socket);

        socket.on('data', (data) => {
            const decodeData = data.toString('utf8').trim();
            console.log(`Received data from ${socket.remoteAddress}:${socket.remotePort}: ${decodeData}`);
            this.handleReceivedData(socket, decodeData);
        });

        socket.on('error', (err) => {
            console.error(`Error with client ${socket.remoteAddress}:${socket.remotePort}:`, err.message);
        });

        socket.on('close', () => {
            console.log(`Client disconnected: ${socket.remoteAddress}:${socket.remotePort}`);
            this.clients = this.clients.filter(client => client !== socket);
        });

        socket.on('readable', () => {
            this.checkSocketData(socket);
        });
    }

    checkSocketData(socket) {
        let chunk;
        while ((chunk = socket.read()) !== null) {
            const decodeData = chunk.toString('utf8').trim();
            console.log(`Received data from ${socket.remoteAddress}:${socket.remotePort}: ${decodeData}`);
            this.handleReceivedData(socket, decodeData);
        }
    }

    handleReceivedData(socket, data) {
        const parts = data.split(' ');
        let command = parts[0].trim();
        const remainingData = parts.slice(1).join(' ');
        let deviceAddress = '';
        // console.log(`parts: ${parts}`);
        // console.log(`command: ${command}`);

        if (command.startsWith('CONNECT|')) {
            const connectParts = command.split('|');
            if (connectParts.length === 2) {
                command = connectParts[0] + '|';
                deviceAddress = connectParts[1].trim();
                //console.log(`Connecting to ${deviceAddress}`)
            }
        }

        switch (command) {
            case 'GET_DEVICES|START':
                this.sendEncodedMessage(socket, JSON.stringify(this.uniqueDevices));
                break;
            case 'START':
                this.sendEncodedMessage(socket, 'START');
                break;
            case 'GET_DEVICES|STOP':
                this.sendEncodedMessage(socket, "Device stopped!! \n");
                break;
            case `CONNECT|`:
                if (deviceAddress) {
                    const message = `Connection established with device at address ${deviceAddress}`;
                    this.sendEncodedMessage(socket, message);
                } else {
                    this.sendEncodedMessage(socket, 'Missing device address');
                }
                break;
            default:
                console.log(`Unknown command received from ${socket.remoteAddress}:${socket.remotePort}:`, data);
                break;
        }
    }

    sendEncodedMessage(socket, message) {
        socket.write(message + "\n", 'utf8', () => {
            console.log(`Sent encoded message to ${socket.remoteAddress}:${socket.remotePort} -> ${message}`);
        });
    }

    generateDevices() {
        const baseDevices = [
            { name: 'Hive', address: '01:23:45:67:89:AB' },
            { name: 'Beetle', address: 'A1:B2:C3:D4:E5:F6' },
            { name: 'Bumble', address: 'F0:F1:F2:F3:F4:F5' }
        ];
        this.uniqueDevices = baseDevices.map((device, index) => ({
            name: `${device.name}${index + 1}`,
            address: `${device.address.replace(/.{2}(?=.)/g, () => Math.random().toString(16).slice(-2))}`
        }));
    }

    sendUniqueDeviceToAllClients() {
        if (this.uniqueDevices.length === 0) return;

        const device = this.uniqueDevices[this.deviceIndex];
        this.clients.forEach(client => {
            this.sendEncodedMessage(client, JSON.stringify(device));
        });

        this.generateDevices();

        this.deviceIndex = (this.deviceIndex + 1) % this.uniqueDevices.length;
    }

    sendKeyKP9ToAllClients() {
        //const keyKP9 = 'CONNECTED_SUCCESS | 28df2bd6ca311258B ';
        const keyKP3 = 'KEY_KP3';
        const keyKP9 = 'KEY_KP9';
        this.clients.forEach(client => {
            this.sendEncodedMessage(client, keyKP3);
        });
    }
}

const server = new ServerSocket(8888);
server.start();
