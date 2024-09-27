const {
  fs,
  path,
  app,
  tmpPath,
  DIRECT_JSON_KEYCODE,
  DIRECT_ASSETS_ANIMATIONS,
  DIRECT_ASSETS_KEYCODEICON,
  DIRECT_DATA_BLUETOOTH,
  DIRECT_ASSETS_VIDEO_DEFAULTS,
  DIRECT_DATA_LOGS
} = require('../utils/fileSystem');

class FileSystem {
  constructor() {
    this.files = [];
    this.directories = [];
    this.createFileInTempDir();
  }

  async createDirectory(directoryPath) {
    if (!fs.existsSync(directoryPath)) {
      fs.mkdirSync(directoryPath, { recursive: true });
      this.directories.push(directoryPath);
    }
  }

  async createFileInTempDir() {
    await this.createDirectory(tmpPath);
    const fileName = 'settings.json';
    const tmpFilePath = path.join(tmpPath, fileName);

    if (!fs.existsSync(tmpFilePath)) {
      const fileContent = fs.readFileSync(DIRECT_JSON_KEYCODE, 'utf-8');
      fs.writeFileSync(tmpFilePath, fileContent, 'utf-8');
      this.files.push(tmpFilePath);
      await this.copyAssets();
    } else {
      console.log(`File ${tmpFilePath} already exists. Skipping creation.`);
    }

    this.files.push(tmpFilePath);
  }

  async copyDirectory(src, dest) {
    if (!fs.existsSync(src)) {
      console.log('Source directory does not exist:', src);
      return;
    }
    await this.createDirectory(dest);
    const entries = fs.readdirSync(src, { withFileTypes: true });

    for (let entry of entries) {
      const srcPath = path.join(src, entry.name);
      const destPath = path.join(dest, entry.name);

      if (entry.isDirectory()) {
        await this.copyDirectory(srcPath, destPath);
      } else {
        fs.copyFileSync(srcPath, destPath);
      }
    }
    console.log('Directory copied from', src, 'to', dest);
  }

  async copyAssets() {
    const destAnimationsPath = path.join(tmpPath, 'animations');
    const destKeycodeIconPath = path.join(tmpPath, 'keypadIcon');
    const destVideoPath = path.join(tmpPath, 'video');
    const dataBluetoothPath = path.join(tmpPath, 'data');
    const logsPath = path.join(tmpPath, 'logs');

    // Função auxiliar para cópia com tentativas e tolerância a falhas
    const safeCopy = async (source, dest, isDirectory = false) => {
      const maxRetries = 5;
      let attempt = 0;
      while (attempt < maxRetries) {
        try {
          if (isDirectory) {
            await this.copyDirectory(source, dest);
          } else {
            fs.copyFileSync(source, dest);
          }
          console.log(`Successfully copied ${source} to ${dest}`);
          return;
        } catch (error) {
          attempt++;
          console.error(`Failed to copy ${source} to ${dest} (Attempt ${attempt}/${maxRetries})`, error);
          await new Promise(res => setTimeout(res, 1000)); // Aguarde 1 segundo antes de tentar novamente
        }
      }
      throw new Error(`Failed to copy ${source} to ${dest} after ${maxRetries} attempts`);
    };

    // Diretórios de cópia
    await safeCopy(DIRECT_ASSETS_ANIMATIONS, destAnimationsPath, true);
    await safeCopy(DIRECT_ASSETS_KEYCODEICON, destKeycodeIconPath, true);
    await safeCopy(DIRECT_ASSETS_VIDEO_DEFAULTS, destVideoPath, true);

    // Cópia do Bluetooth
    if (fs.existsSync(DIRECT_DATA_BLUETOOTH)) {
      if (fs.lstatSync(DIRECT_DATA_BLUETOOTH).isDirectory()) {
        await safeCopy(DIRECT_DATA_BLUETOOTH, dataBluetoothPath, true);
      } else {
        await this.createDirectory(dataBluetoothPath);
        const destBluetoothFile = path.join(dataBluetoothPath, path.basename(DIRECT_DATA_BLUETOOTH));
        await safeCopy(DIRECT_DATA_BLUETOOTH, destBluetoothFile);
      }
    } else {
      console.warn(`Source path ${DIRECT_DATA_BLUETOOTH} does not exist, skipping Bluetooth data copy`);
    }
    // Cópia dos logs
    if (fs.existsSync(DIRECT_DATA_LOGS)) {
      if (fs.lstatSync(DIRECT_DATA_LOGS).isDirectory()) {
        await safeCopy(DIRECT_DATA_LOGS, logsPath, true);
      } else {
        await this.createDirectory(logsPath);
        const destLogsFile = path.join(logsPath, path.basename(DIRECT_DATA_LOGS));
        await safeCopy(DIRECT_DATA_LOGS, destLogsFile);
      }
    } else {
      console.warn(`Source path ${DIRECT_DATA_LOGS} does not exist, skipping logs data copy`);
    }

  }

  async readFile(filePath) {
    if (fs.existsSync(filePath)) {
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      return fileContent;
    } else {
      console.log('File does not exist:', filePath);
      return null;
    }
  }

  async deleteFile(filePath) {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log('File deleted successfully:', filePath);
      const index = this.files.indexOf(filePath);
      if (index > -1) {
        this.files.splice(index, 1);
      }
    } else {
      console.log('File does not exist:', filePath);
    }
  }

  

  getStoredDirectories() {
    return this.directories;
  }

  getStoredFiles() {
    return this.files;
  }

  getTempFilePath() {
    return path.join(tmpPath, 'settings.json');
  }

  getAnimationsDirectoryPath() {
    return path.join(tmpPath, 'animations');
  }

  getVideoDefaultsDirectoryPath() {
    return path.join(tmpPath, 'video');
  }

  getKeycodeIconDirectoryPath() {
    return path.join(tmpPath, 'keypadIcon');
  }

  getBluetoothDataPath() {
    return path.join(tmpPath, 'data');
  }

  getLogsPath() {
    return path.join(tmpPath, 'logs');
  }
}

module.exports = FileSystem;
