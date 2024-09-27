function transformDevicesData (devices) {
  return devices.map(device => ({
    deviceId: device.address,
    deviceName: device.name
  }))
}

function removeDuplicateAddresses(devices) {
  const seenAddresses = new Set();
  const seenDeviceIds = new Set();

  return devices.filter(device => {
    const hasDuplicateAddress = seenAddresses.has(device.address);
    const hasDuplicateDeviceId = seenDeviceIds.has(device.deviceId);

    if (hasDuplicateAddress || hasDuplicateDeviceId) {
      return false;
    }

    if (device.address) {
      seenAddresses.add(device.address);
    }
    
    if (device.deviceId) {
      seenDeviceIds.add(device.deviceId);
    }
    
    return true;
  });
}


module.exports = {
  transformDevicesData,
  removeDuplicateAddresses,
}
