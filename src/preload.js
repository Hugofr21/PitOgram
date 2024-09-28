const { contextBridge, ipcRenderer } = require('electron')
const path = require('path')
const preloadPath = path.dirname(__filename)
const filePath = process.env.TEMP_FILE_PATH
const filePathBluetooth = path.join(preloadPath, 'utils/bluetooth-list.json')
const valuesKeys = require('./utils/keycode')
let lastKeycode = null;
let lastUpdateTimestamp = 0;
const DEBOUNCE_INTERVAL = 1000;

// bluetooth api browser
contextBridge.exposeInMainWorld('electronAPI', {
  cancelBluetoothRequest: (callback, data) =>
    ipcRenderer.send('cancel-bluetooth-request', callback),
  bluetoothPairingRequest: callback =>
    ipcRenderer.on('bluetooth-pairing-request', callback),
  bluetoothPairingResponse: response =>
    ipcRenderer.send('bluetooth-pairing-response', response),

  sendListBluetoothDataToRender: (event, serializedData) => {
    const data = serializedData
    ipcRenderer.send('bluetooth-response', data)
  },
  readListBluetoothDataToRender: () => {
    ipcRenderer.send('read-list-bluetooth', deviceList)
  }
})

// api read json response
contextBridge.exposeInMainWorld('electronAPI2', {
  readJSONFile: () => {
    ipcRenderer.send('read-json-file', filePath)
  },

  onJSONData: callback => {
    ipcRenderer.on('json-data', (event, data) => {
      callback(data)
    })
  },
  readJSONBluetooth: () => {
    ipcRenderer.send('read-json-list-bluetooth', filePathBluetooth)
  },

  onJSONBluetooth: callback => {
    ipcRenderer.on('json-data-list-bluetooth', (event, data) => {
      const parsedData = new Set()
      if (data && Array.isArray(data.data)) {
        data.data.forEach(item => {
          item.forEach(obj => {
            if (obj.deviceName) {
              parsedData.add(obj.deviceName)
            }
          })
        })
        //console.log('preload set: ', parsedData)
        if (parsedData.size > 0) {
          callback(parsedData)
        }
      }
    })
  },
  sendDataToMainSelectedNameBluetooth: async data => {
    return new Promise((resolve, reject) => {
      ipcRenderer.once('connected-device-name', (event, response) => {
        //console.log('preload set: ', response);
        resolve(response)
      })

      ipcRenderer.send('send-data-to-main-seleted-bluetooth', data)
    })
  },
  requestDeviceByNameDisconnected: async data => {
    //console.log("preload", data);
    return new Promise((resolve, reject) => {
      ipcRenderer.once(
        'response-disconnected-device-name',
        (event, response) => {
          console.log('preload disconnected: ', response)
          resolve(response)
        }
      )

      ipcRenderer.send('disconnected-device-name', data)
    })
  }
})

// authentication
contextBridge.exposeInMainWorld('electronAPILogin', {
  sendDataToMain: data => {
    ipcRenderer.send('send-data-to-main', data)
  },
  sendDataToMainCreateUser: data => {
    ipcRenderer.send('send-data-to-main-create-user', data)
  },
  getDataFromMain: (callback, errorCallback) => {
    ipcRenderer.on('login-response-token', (event, data) => {
      if (data.success) {
        callback(data)
      } else {
        errorCallback(data)
      }
    })

    ipcRenderer.on('login-response-error', (event, data) => {
      //console.log("preload auth error: ", data);
      errorCallback(data)
    })
  },

  sendCifraDataToMain: (data, callback, errorCallback) => {
    ipcRenderer.send('cifra-response', data)

    ipcRenderer.on('cifra-response-error', (event, data) => {
      errorCallback(data)
    })
  }
})

// settings
contextBridge.exposeInMainWorld('electronAPISettings', {
  updateIcon: (data, callback) => {
    console.log('preload updateIcon: ', data)

    // Adiciona o handler de resposta
    const responseHandler = (event, responseData) => {
      console.log('Received response: ', responseData)
      // Remove o listener para evitar múltiplas execuções
      ipcRenderer.removeListener('response-update-Icon', responseHandler)
      // Chama o callback com a resposta
      callback(null, responseData)
    }

    // Adiciona o listener
    ipcRenderer.on('response-update-Icon', responseHandler)

    // Envia os dados
    data.forEach(icon => {
      console.log('Sending icon data:', {
        keycode: icon.Keycode,
        name: icon.name,
        src: icon.src,
        content: icon.contentIcon
      })
      ipcRenderer.send('send-update-Icon', {
        keycode: icon.Keycode,
        name: icon.name,
        src: icon.src,
        content: icon.contentIcon
      })
    })

    // Timeout para lidar com falta de resposta
    setTimeout(() => {
      console.log('Timeout reached')
      ipcRenderer.removeListener('response-update-Icon', responseHandler)
      // Chama o callback com um erro
      callback(new Error('Timeout: No response from main process'))
    }, 10000) // Timeout de 10 segundos
  },

  // updateIcon : async (data) => {
  //   const promises = data.map(async (icon) => {
  //     return new Promise(async (resolve, reject) => {
  //       console.log('preload updateIcon: ', icon);
  //       const { contentIcon, Keycode, name, src } = icon;

  //       // Envia a mensagem de atualização de ícone
  //       const result = await updateIcon(Keycode, name, src, contentIcon);
  //       console.log('result:   ', result);
  //       resolve(result);

  //       // Adiciona um timeout para rejeitar a Promise se não houver resposta em um tempo razoável
  //       setTimeout(() => {
  //         reject(new Error(`Timeout: No response for icon with keycode ${Keycode}`));
  //       }, 5000); // Tempo de timeout em milissegundos (ajuste conforme necessário)
  //     });
  //   });
  // },

  sendDataToMainSettings: data => {
    ipcRenderer.send('send-data-to-main-settings', {
      name: data.name,
      size: data.size,
      type: data.type,
      lastModified: new Date(data.lastModified).toString(),
      content: data.content
    })
  },
  sendDataToMainSettingsVideo: data => {
    ipcRenderer.send('send-data-to-main-settings-video', {
      name: data.name,
      size: data.size,
      type: data.type,
      lastModified: new Date(data.lastModified).toString(),
      content: data.content
    })
  },
  sendDataToDashboardDefaultVideo: data => {
    ipcRenderer.send('send-data-to-dashboard-defatlts-video', {
      name: data.name,
      size: data.size,
      type: data.type,
      lastModified: new Date(data.lastModified).toString(),
      content: data.content
    })
  },
  getDataToMainSettingsVideo: callback => {
    ipcRenderer.on('video-save-success', (event, data) => {
      callback(data)
    })
  },
  getDataFromMainSettings: callback => {
    ipcRenderer.on('settings-response', (event, data) => {
      callback(data)
    })
  },
  // get video defaults from index
  getDataToVideoDefaults: async (callback, errorCallback) => {
    try {
      const videoResponse = await ipcRenderer.invoke('get-videos-default')
      if (videoResponse.success) {
        callback(videoResponse)
      } else {
        errorCallback(videoResponse.error)
      }
    } catch (error) {
      errorCallback(error.message)
    }
  },
  videoPathIndex: async (callback, errorCallback) => {
    ipcRenderer.send('sendEventKeyToPreload', eventKey)
    //console.log('sendEventKeyToPreload' + eventKey);
  }
})

// API videos cache
contextBridge.exposeInMainWorld('electronAPIVideos', {
  confirmVideoInsideJSON: async () => {
    try {
      const videosResponse = await ipcRenderer.invoke(
        'get-all-videos-confirme-Json'
      )
      if (videosResponse.success) {
        return { success: true, messages: 'The videos saved successfully' }
      } else {
        console.error(
          'Error while checking videos and JSON:',
          videosResponse.error
        )
        return
      }
    } catch (error) {
      console.error('Error getting videos:', error.message)
      return []
    }
  }
})

// bluetooth api serial port, use of child processes because ipc main is slow request
// @return {Object} JSON serial port
// get all devices
contextBridge.exposeInMainWorld('electronApiBluetooth', {
  responseDevices: () => {
    return new Promise(async (resolve, reject) => {
      try {
        const response = await ipcRenderer.invoke(
          'devices-bluetooth-request',
          'some argument'
        )

        if (response.success === false) {
          reject(new Error('Device error'))
        } else if (response.success) {
          console.log('device preload: ', response.devices)
          resolve(response.devices)
        }
      } catch (error) {
        console.error('Error getting bluetooth:', error.message)
        reject(error)
      }
    })
  },
  startListeningUpdates: async () => {
    const newKeycode = await ipcRenderer.invoke('request-keycode');
    console.log('Current keycode:', newKeycode)

    if (!newKeycode || newKeycode === undefined || newKeycode === null) {
      throw new Error('The response does not contain a valid message.')
    }

    const currentTime = Date.now();
    if (newKeycode !== lastKeycode && (currentTime - lastUpdateTimestamp) > DEBOUNCE_INTERVAL) {
      lastKeycode = newKeycode;
      lastUpdateTimestamp = currentTime;
      window.dispatchEvent(
        new CustomEvent('keycodeUpdate', { detail: newKeycode })
      );
    }
  },
  getDeviceConnectedToApi: async () => {
    const response = await ipcRenderer.invoke('device-connected-to-api')
    return response.device
  },
  getBluetoothJsonData: async () => {
    const response = await ipcRenderer.invoke('get-bluetooth-json-data')
    return response.message
  }
})

// System logs
contextBridge.exposeInMainWorld('electronAPISystemLogs', {
  // get all logs init without filtering
  getSystemLogs: async () => {
    try {
      const logsResponse = await ipcRenderer.invoke('get-response-logs')
      if (logsResponse) {
        return logsResponse
      } else {
        console.error('Error while getting logs:', logsResponse.error)
        return { success: false, error: logsResponse.error }
      }
    } catch (error) {
      console.error('Error getting logs:', error.message)
      return { success: false, error: error.message }
    }
  },
  // get all logs will be applied to when filtering
  filterLogs: async data => {
    return new Promise((resolve, reject) => {
      ipcRenderer.once('filter-logs-response', (event, response) => {
        resolve(response)
      })

      ipcRenderer.send('send-filter-logs', {
        filter: data
      })
    })
  }
})

contextBridge.exposeInMainWorld('SystemShutdown', {

  shutdownAction: () => {
    ipcRenderer.send('system-shutdown');
  },
  restartAction: () => {
    ipcRenderer.send('system-restart');
  }
})

contextBridge.exposeInMainWorld('SystemMonitoring', {
  cpuAction: () => {
    ipcRenderer.send('system-cpu');
  },
  memoryAction: () => {
    ipcRenderer.send('system-memory');
  },
  diskAction: () => {
    ipcRenderer.send('system-disk');
  },
  temperatureAction: () => {
    ipcRenderer.send('system-temperature');
  },
  onCpuData: (callback) => {
    ipcRenderer.on('cpu-data', (event, data) => callback(data));
  },
  onMemoryData: (callback) => {
    ipcRenderer.on('memory-data', (event, data) => callback(data));
  },
  onDiskData: (callback) => {
    ipcRenderer.on('disk-data', (event, data) => callback(data));
  },
  onTemperatureData: (callback) => {
    ipcRenderer.on('temperature-data', (event, data) => callback(data));
  },
});