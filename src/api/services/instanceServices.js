const { port_Socket } = require('../config');
const ClientSocket = require('./bluetooth/clientSocket');
const getLocalIPAddress = require('../utils/ipLocal');

let instance;
const initMs = 1000;
const waitSocketDestroyMs = 5000;
const delayBeforeRetryingMS = 10000;
const fgYellow = '\x1b[33m';
const reset = '\x1b[0m';

async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function getInstance() {
    if (instance) {

        if (instance.socket && !instance.socket.destroyed && !instance.socket.connecting) {
            console.log('Returning existing instance');
            return instance;
        }
    }


    while (true) {
        const localIP = getLocalIPAddress();
        console.log(`Attempting to connect to server at IP: ${localIP}`);

        try {

            instance = new ClientSocket(localIP, port_Socket);

            await sleep(waitSocketDestroyMs);

            if (instance.socket.destroyed || instance.socket.readyState  !== 'open') {
                console.log(`${fgYellow} Connection failed, retrying in 10 seconds...${reset}`);
                instance = null; 
                await sleep(delayBeforeRetryingMS); 
            } else {
                //console.log(`Connected to server at ${localIP}:${poreadyStatert_Socket}`);
                //console.log(`Instance: ${JSON.stringify(instance, null, 2)}`);
                return instance;
            }
        } catch (error) {
            console.error(`${fgYellow} Error creating instance: ${error.message}${reset}`);
            instance = null; 
            await sleep(delayBeforeRetryingMS); 
        }
    }
}

module.exports = {
    getInstance
};
