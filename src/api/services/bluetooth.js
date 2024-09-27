const fs = require('fs');
const path = require('path');
const { transformDevicesData, removeDuplicateAddresses } = require('../utils/devices');
const clientSocketSingleton = require('./instanceServices');
const PersistenceDataBluetthonClient = require('./persistenceBluetooth');
const ptDataBlueServices = new PersistenceDataBluetthonClient();
const { isLinux, checkAndRunCommand } = require('../utils/system');
let clientSocket;

async function initializeClientSocket() {
  try {
    clientSocket = await clientSocketSingleton.getInstance();
    return clientSocket;
  } catch (error) {
    console.error(`Error initializing clientSocket: ${error.message}`);
    throw error;
  }
}
(async () => {
  try {
    await initializeClientSocket();
    console.log('Client socket initialized and ready to use');

  } catch (error) {
    console.error('Failed to initialize client socket:', error);
  }
})();

// get devices json 
async function getDeviceDataConnectedToApi() {
  try {
    const deviceConnectedToApi = await ptDataBlueServices.getBluetoothCurrent();
    if (!deviceConnectedToApi || deviceConnectedToApi.length === 0) {
      return { success: false, message: 'Bluetooth not found!' }
    }
    return { success: true, device: deviceConnectedToApi }
  } catch (error) {
    return { success: false, error: error.toString() };
  }
}

// scarn get the devices
async function getDevices() {
  let dataListener;
  const timeoutDuration = 30000;

  try {

    await clientSocket.scarnHCIDevices();

    const stopSearch = async () => {
      await clientSocket.stopSocketSendDevices();
    };

    const responsePromise = new Promise((resolve, reject) => {
      const devices = [];
      let timeoutReached = false;

      const onDataListener = async (data) => {
        if (data) {

          // Collect devices data
          const devicesArray = Array.isArray(data) ? data : [data];
          const filteredDevices = devicesArray.filter(device => device.name !== "Unknown");
          const newArrayDevices = removeDuplicateAddresses(filteredDevices);
          devices.push(...newArrayDevices);
          //console.log("Added devices array to device: ", devices)
          await ptDataBlueServices.saveData(newArrayDevices);
        }
      };

      dataListener = onDataListener;
      clientSocket.onData(dataListener);

      const timer = setTimeout(async () => {
        if (timeoutReached) return;

        timeoutReached = true;
        const transformedData = transformDevicesData(devices);
        resolve(transformedData);
      }, timeoutDuration);

      const handleError = (error) => {
        clearTimeout(timer);
        clientSocket.offData(dataListener);
        reject(error);
      };
    });

    const transformedData = await responsePromise;

    // Stop searching for devices
    await stopSearch();

    if (transformedData.length === 0) {
      return { success: false, message: 'Bluetooth devices are not available' };
    }
    // console.log("transformedData ---> ", transformedData);
    const uniqueData = removeDuplicateAddresses(transformedData);
    // console.log("transformedData ---> ", uniqueData);
    return { success: true, devices: uniqueData };
  } catch (error) {
    return { success: false, message: `Error Listing devices: ${error.message}` };
  }
}

// connect to device by name
// Connect to a device by its name
async function connectToDevicesByName(deviceName) {
  if (!deviceName) {
    console.error("Device name is required");
    return { success: false, message: 'Device name is required.' };
  }

  try {


    // Attempt to connect to the device using its name
    await clientSocket.connectDeviceByAddress(deviceName);

    // Wait for 5 seconds before proceeding
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Notify that the device is connected
    await clientSocket.deviceConnected();

    // Wait for the device connection confirmation
    const connectionSuccessful = await waitForDeviceConnection(deviceName);

    if (connectionSuccessful) {
      await ptDataBlueServices.updateData(deviceName);
      return { success: true, message: `Successfully connected to device ${deviceName}.` };
    } else {
      return { success: false, message: `Failed to confirm connection for device ${deviceName}.` };
    }
  } catch (error) {
    console.error(`Error connecting to device ${deviceName}:`, error.message);
    return { success: false, message: `Error connecting to device ${deviceName}: ${error.message}` };
  }
}

// Wait for device connection confirmation
function waitForDeviceConnection(deviceName) {
  return new Promise((resolve) => {
    const timeoutDuration = 10000; // Timeout after 10 seconds
    const pollInterval = 500; // Poll every 500 milliseconds
    let startTime = Date.now();

    // Function to handle the deviceConnected event
    const handleDeviceConnected = (deviceAddress) => {
      if (deviceAddress === deviceName) {
        console.log(`Service received connection event for device: ${deviceAddress}`);
        clientSocket.off('deviceConnected', handleDeviceConnected); // Remove listener
        resolve(true); // Resolve with success
      }
    };

    // Listen for the deviceConnected event
    clientSocket.on('deviceConnected', handleDeviceConnected);

    // Polling function to check for timeout
    const checkTimeout = setInterval(() => {
      if (Date.now() - startTime > timeoutDuration) {
        clearInterval(checkTimeout);
        clientSocket.off('deviceConnected', handleDeviceConnected); // Remove listener
        resolve(false); // Resolve with failure after timeout
      }
    }, pollInterval);
  });
}


// disconnect to device
async function disconnectDeviceByName(deviceName) {

  try {

    await ptDataBlueServices.updateDeviceTrueForFlase();
    const disconnectionResult = await clientSocket.disconnectDevice();

    if (disconnectionResult === true) {
      console.log(`Device ${deviceName} disconnected successfully`);
      return { success: true, message: "Device disconnected successfully!" };
    } else {
      console.warn(`Unexpected result when disconnecting device ${deviceName}`);
      return { success: false, message: "Unexpected disconnection result" };
    }

  } catch (error) {
    console.error(`Error disconnecting device ${deviceName}:`, error.message);
    return { success: false, message: `Error disconnecting device: ${error.message}` };
  }
}


async function getDevicesSearchJsonBluetooth() {
  try {
    const devices = await ptDataBlueServices.getAllDevicesFound();
    console.log('devices services: ', devices);
    return { success: true, message: devices }
  } catch (error) {
    throw new Error(`Error disconnect device: ${error.message}`)
  }
}


// import: get keycode by socket
// get key code on socket in windows operating system
async function getKeycodeFromDevice() {
  try {
    const devices = await ptDataBlueServices.getBluetoothCurrent();
    const device = devices.length > 0 ? devices[0] : null;

    if (!device || !device.active) return null;

    return new Promise((resolve, reject) => {
      console.log('Waiting for keycode from clientSocket...');
      const keycodeListener = (keycodeMessage) => {
        console.log('Received keycode from clientSocket:', keycodeMessage);
        clientSocket.off('keycode', keycodeListener);
        resolve({ success: true, message: keycodeMessage });
      };

      clientSocket.on('keycode', keycodeListener);

      setTimeout(() => {
        clientSocket.off('keycode', keycodeListener);
        reject(new Error('Timeout: No keycode received from clientSocket'));
      }, 10000);

      const cleanup = () => {
        clearTimeout(timeout);
        clientSocket.off('keycode', keycodeListener);
      };
      keycodeListener.cleanup = cleanup;
    });
  } catch (error) {
    console.error('Error retrieving keycode:', error);
    throw error;
  }
}




async function deleteJsonData() {
  try {
    // delete data bluetooth device
    await ptDataBlueServices.deleteData();
  } catch (error) {
    console.error('Error cleaning JSON:', error);
  }
}


module.exports = {
  getDeviceDataConnectedToApi,
  getDevices,
  connectToDevicesByName,
  disconnectDeviceByName,
  getDevicesSearchJsonBluetooth,
  deleteJsonData,
  getKeycodeFromDevice
}
