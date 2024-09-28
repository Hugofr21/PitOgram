const {
  app,
  BrowserWindow,
  ipcMain,
  session,
  ipcRenderer,
  remote
} = require('electron')
const { Console, error } = require('node:console')
const path = require('node:path')
const fs = require('fs')
const localShortcut = require('electron-localshortcut')
const { loginUser, createUser } = require('./api/services/user')
const { json } = require('body-parser')
const { addSaveJSON } = require('./api/services/settingsJSON')
const {
  checkKeycodeAndIcon,
  updateIcon,
  laodPrevViewIconTmP
} = require('./api/services/joystick')
const {
  saveVideo,
  confirmVideoInsideJSON,
  saveVideoDefatlts,
  getVideoDefatlts
} = require('./api/services/video')
const {
  getDeviceDataConnectedToApi,
  getDevices,
  deleteJsonData,
  connectToDevicesByName,
  disconnectDeviceByName,
  getDevicesSearchJsonBluetooth,
  getKeycodeFromDevice
} = require('./api/services/bluetooth')
const { getCifra2FA } = require('./api/services/cifra')
const { getLogs, getFilterByLevels } = require('./api/services/logs')
const { checkAndRemoveLogs } = require('./api/services/logs')
const { verifyTokenAndPermissions } = require('./api/middleware/verifyToken')
const { systemOperation } = require('./api/middleware/os')
const getFileSystemInstance = require('./tmp/services/instanceSystem')
const FileManager = require('./tmp/services/fileManger')
const {
  basckupFilesAndEncrepty
} = require('./tmp/services/backup/encryptFiles')
const {
  restartAction,
  shutdownAction
} = require('./api/services/system/shutdown')
require('dotenv').config()
const {
  getCpuUsage,
  getMemoryUsage,
  getDiskUsage,
  getCpuInfo,
  getTemperatureCpu
} = require('./api/services/monitoring/monitoring')


let isAppClosing = false



const createWindow = () => {
  const mainWindow = new BrowserWindow({
    width: '100%',
    height: '100%',
    zoomToPageWidth: true,
    // fullscreen: true,
    autoHideMenuBar: true,
    frameName: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true,
      devTools: false
    }
  })

  // desible menu default
  mainWindow.removeMenu(); 

  // and load the index.html of the app.
  mainWindow.loadFile(path.join(__dirname, './index.html'))

  mainWindow.on('ready-to-show', () => {
    disableShortcuts(mainWindow);
    localShortcut.unregisterAll(mainWindow)
    localShortcut.register(mainWindow, 'Ctrl+S', () => {
      if (mainWindow.webContents.getURL().includes('src/index.html')) {
        mainWindow.loadFile(path.join(__dirname, '/page/alert/index.html'))
      }
    });
  })

  mainWindow.webContents.on('did-navigate', (event, url) => {
    if (url.includes('src/page/dashboard/index.html')) {
      localShortcut.unregisterAll(mainWindow)
    } else {
      localShortcut.unregisterAll(mainWindow)
      disableShortcuts(mainWindow);
      localShortcut.register(mainWindow, 'Ctrl+S', () => {
        if (mainWindow.webContents.getURL().includes('src/index.html')) {
          mainWindow.loadFile(path.join(__dirname, '/page/alert/index.html'))
        }
      })
    }
  })

  // disable or override the default Ctrl+Shift+I
  mainWindow.webContents.on('before-input-event', (event, input) => {
    if (
      input.control &&
      input.shift &&
      (input.key === 'I' || input.key === 'i')
    ) {
      event.preventDefault()
    }
  })


  // Open the DevTools.
  if (process.env.NODE_ENV === 'developmentOpenDev') {
    mainWindow.webContents.openDevTools()
  }

  // read json settings modal
  ipcMain.on('read-json-file', async (event, filePath) => {
    fs.readFile(filePath, 'utf-8', (err, data) => {
      if (err) {
        event.sender.send('json-data', { error: err })
      } else {
        event.sender.send('json-data', { data: JSON.parse(data) })
      }
    })
  })

  // read list bluetooth json
  ipcMain.on('read-json-list-bluetooth', (event, filePath) => {
    if (!filePath) {
      event.sender.send('json-data-list-bluetooth', {
        error: 'File path is empty or undefined'
      })
      return
    }
    fs.readFile(filePath, 'utf-8', (err, data) => {
      if (err) {
        event.sender.send('json-data-list-bluetooth', { error: err })
      } else {
        try {
          const jsonData = JSON.parse(data)
          event.sender.send('json-data-list-bluetooth', { data: jsonData })
        } catch (parseError) {
          event.sender.send('json-data-list-bluetooth', {
            error: 'Failed to parse JSON data'
          })
        }
      }
    })
  })

  // filter device name bluetooth serial port
  ipcMain.on('send-data-to-main-seleted-bluetooth', async (event, data) => {
    const deviceName = await connectToDevicesByName(data);

    //console.log('index receber connected: ', deviceName)
    event.sender.send('connected-device-name', deviceName)
  })

  // disconnect it is device
  ipcMain.on('disconnected-device-name', async (event, data) => {
    console.log('disconnected data index main: ' + data)
    const disconnectDeviceName = await disconnectDeviceByName(data)
    //console.log('disconnected to device ' + disconnectDeviceName)
    event.sender.send('response-disconnected-device-name', disconnectDeviceName)
  })

  // authentication
  ipcMain.on('send-data-to-main', async (event, data) => {
    const { email, password } = data
    try {
      const result = await loginUser(email, password)
      const verifyLogin = await verifyTokenAndPermissions(result.token)
      if (result.success && verifyLogin.success) {
        event.sender.send('login-response-token', result)
        mainWindow.loadFile(
          path.join(__dirname, '/page/confSettingsPathVideo/index.html')
        )
      } else {
        event.sender.send('login-response-error', { result })
      }
    } catch (error) {
      console.error('auth eror: ', error)
      event.sender.send('login-response-error', {
        error: 'Internal server error'
      })
    }
  })

  // alert
  ipcMain.on('cifra-response', async (event, data) => {
    try {
      //console.log("index cifra: ", data);
      const result = await getCifra2FA(data)
      if (result.success) {
        mainWindow.loadFile(path.join(__dirname, '/page/login/index.html'))
      } else {
        event.sender.send('cifra-response-error', {
          success: false,
          error: 'Invalid cifra'
        })
      }
    } catch (error) {
      console.error(error)
      event.sender.send('cifra-response-error', {
        success: false,
        error: 'Internal server error'
      })
    }
  })

  // create user
  ipcMain.on('send-data-to-main-create-user', async (event, data) => {
    const { email, password } = data
    try {
      //console.log('create data')
      const newUserResult = await createUser(email, password)
      //console.log('create user: ', newUserResult)
    } catch (error) {
      console.error(error)
    }
  })

  // save settings json animations
  ipcMain.on('send-data-to-main-settings', async (event, fileData) => {
    try {
      const resultJSON = await addSaveJSON(fileData)
      //console.log('save result JSON: ', resultJSON)
    } catch (error) {
      console.error('Err json: ', error.message)
    }
  })

  // upload icon
  ipcMain.on('send-update-Icon', async (event, data) => {
    const { keycode, name, src, content } = data
    const result = await updateIcon(keycode, name, src, content)
    console.log('update icon: ', result)
    event.sender.send('response-update-Icon', result)
  })

  // upload video animations mp4
  ipcMain.on('send-data-to-main-settings-video', async (event, video) => {
    const { name, size, type, content, lastModified } = video
    const result = await saveVideo(name, size, type, content, lastModified)
    event.sender.send('video-save-success', result)
  })

  ipcMain.on('send-data-to-dashboard-defatlts-video', async (event, video) => {
    const { name, size, type, content, lastModified } = video
    const result = await saveVideoDefatlts(
      name,
      size,
      type,
      content,
      lastModified
    )
    event.sender.send('video-save-success', result)
  })

  // API Video preload invoke preload callback
  // Confirme if video is already loaded the json
  ipcMain.handle('get-all-videos-confirme-Json', async () => {
    try {
      const videos = await confirmVideoInsideJSON()
      return { success: true, videos }
    } catch (error) {
      return { success: false, error: error.message }
    }
  })

  // get video default from index.html
  ipcMain.handle('get-videos-default', async () => {
    try {
      const videos = await getVideoDefatlts()
      return { success: true, videos }
    } catch (error) {
      return { success: false, error: error.message }
    }
  })

  // resposnse the device disconnecte bluetooth
  // @return message json object
  ipcMain.on('', async () => { })

  // API Logs
  // @return object
  // get all logs
  ipcMain.handle('get-response-logs', async () => {
    try {
      const logs = await getLogs()
      return logs
    } catch (error) {
      console.error('Error getting logs:', error.message)
      return { success: false, error: error.message }
    }
  })

  // @ return object filtered results
  // filtering results
  ipcMain.on('send-filter-logs', async (event, data) => {
    try {
      const { filter } = data
      const logs = await getFilterByLevels(filter)
      event.sender.send('filter-logs-response', logs)
    } catch (error) {
      console.error('Error getting filtered logs:', error.message)
      event.sender.send('filter-logs-response', {
        success: false,
        error: error.message
      })
    }
  })

  // get devices socket client
  ipcMain.handle('devices-bluetooth-request', async (event, arg) => {
    const jsonData = await getDevices()
    return jsonData
  })

  ipcMain.handle('device-connected-to-api', async event => {
    const device = await getDeviceDataConnectedToApi()
    if (device.success) {
      return device
    }
  })

  ipcMain.handle('get-bluetooth-json-data', async event => {
    const devices = await getDevicesSearchJsonBluetooth()
    if (devices.success) {
      return devices
    }
  })

  ipcMain.on('system-shutdown', () => {
    shutdownAction()
  })

  ipcMain.on('system-restart', () => {
    restartAction()
  })

  ipcMain.on('system-cpu', event => {
    console.clear()
    getCpuUsage(cpuUsage => {
      const cpuInfo = getCpuInfo();

      // console.log('\nInformações do CPU:');
      // console.log(`CPU Model: ${cpuInfo.model}`);
      // console.log(`CPU Speed: ${cpuInfo.speed} MHz`);
      // console.log(`CPU Cores: ${cpuInfo.cores}`);
      // console.log(`Uso da CPU: ${cpuUsage}%`);

      const cpuData = {
        model: cpuInfo.model,
        speed: cpuInfo.speed,
        cores: cpuInfo.cores,
        usage: cpuUsage
      };

      event.reply('cpu-data', cpuData);
    });
  })

  ipcMain.on('system-memory', event => {
    console.clear()
    const memoryData = getMemoryUsage()
    // console.log('\nInformações do Memory:')
    // console.log('Memory Total: ' + memoryData.total)
    // console.log('Memory Livre: ' + memoryData.free)
    // console.log('Memory Usada: ' + memoryData.used)

    event.reply('memory-data', memoryData)
  })

  ipcMain.on('system-disk', event => {
    console.clear()
    const diskData = getDiskUsage((err, disks) => {
      if (err) {
        console.error('Erro ao obter uso do disco:', err.message)
        return
      }
      // console.log('\nInformações do Disco:')
      // disks.forEach(disk => {
      //   console.log(`Disco: ${disk.filesystem || disk.drive}`)
      //   console.log(`  Tamanho: ${disk.size}`)
      //   console.log(`  Usado: ${disk.used}`)
      //   console.log(`  Disponível: ${disk.available}`)
      //   console.log(`  Percentual Usado: ${disk.percent}`)
      //   console.log(`  Montado em: ${disk.mount}`)
      // });
      event.reply('disk-data', disks)
    });
  });

  ipcMain.handle('request-keycode', async () => {
    const keycode = await getKeycodeFromDevice();
    return keycode;
  });

}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', async () => {
  getFileSystemInstance()
  await checkKeycodeAndIcon()
  await systemOperation()

  // this method build environment variables
  const fileManager = FileManager.getInstance()
  fileManager.getFilePathAbsolute()
  await laodPrevViewIconTmP()
  // build browser window
  createWindow()
})
// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', async () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

app.on('before-quit', async event => {
  isAppClosing = true
  await checkAndRemoveLogs()
  await deleteJsonData()
})

app.on('quit', () => {
  if (isAppClosing) {
    console.log(
      'Application is being closed. Final functions can be performed.'
    )
  }
})


function disableShortcuts(mainWindow) {
  // disable shortcuts F1 to F12 
  for (let index = 1; index <= 12; index++) {
    localShortcut.register(mainWindow, `F${index}`, () => { });
  }
  
  const shortcutsToDisable = [
    'Shift', 'Alt', 'Shift+Alt', 'Shift+Ctrl',
    'Alt+Ctrl', 'Shift+Alt+Ctrl', 'Shift+Alt+Delete'
  ];

  // disable shortcuts
  shortcutsToDisable.forEach(shortcut => {
    localShortcut.register(mainWindow, shortcut, () => { });
  });

  mainWindow.webContents.on('before-input-event', (event, input) => {
    const blockedKeys = [
      { key: 'F11' },
      { key: 'F5' },
      { key: 'r', control: true },
      { key: 'F12' },
      { key: 'Delete', control: true, alt: true }, 
      { key: 'q', control: true },  
      { key: 'F4', alt: true },   
      { key: 'i', control: true, shift: true }, 
    ];

    const isBlocked = blockedKeys.some(block =>
      input.key === block.key &&
      (!block.control || input.control) &&
      (!block.alt || input.alt) &&
      (!block.shift || input.shift)
    );


    if (isBlocked) {
      event.preventDefault();
    }

  });
}


