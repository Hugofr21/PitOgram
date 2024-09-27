const getFileSystemInstance = require('./instanceSystem');
const { fs, path } = require('../utils/fileSystem');
const valuesKeys = require('../../utils/keycode');
class FileManager {
    constructor() {
        if (FileManager.instance) {
            return FileManager.instance;
        }
        FileManager.instance = this;
    }

    static getInstance() {
        if (!FileManager.instance) {
            FileManager.instance = new FileManager();
        }
        return FileManager.instance;
    }

    async getFilePathAbsolute() {
        const fileSystem = getFileSystemInstance();

        const tempFilePath = fileSystem.getTempFilePath().replace(/\\/g, '/');
        const animationsDirectoryPath = fileSystem.getAnimationsDirectoryPath().replace(/\\/g, '/');
        const keycodeIconDirectoryPath = fileSystem.getKeycodeIconDirectoryPath().replace(/\\/g, '/');
        const bluetoothDataPath = fileSystem.getBluetoothDataPath().replace(/\\/g, '/');
        const logsDataPath = fileSystem.getLogsPath().replace(/\\/g, '/');
        const videoDefaults = fileSystem.getVideoDefaultsDirectoryPath().replace(/\\/g, '/');

        process.env.TEMP_FILE_PATH = tempFilePath;
        process.env.ANIMATIONS_DIRECTORY_PATH = animationsDirectoryPath;
        process.env.KEYCODE_ICON_DIRECTORY_PATH = keycodeIconDirectoryPath;
        process.env.BLUETOOTH_DATA_PATH = bluetoothDataPath;
        process.env.LOGS_DATA_PATH = logsDataPath;
        process.env.VIDEO_DEFAULTS_PATH = videoDefaults;

        this.updatePathAnimations();
    }

    updatePathAnimations() {
        const tempFilePath = process.env.TEMP_FILE_PATH;
        const animationsDirectoryPath = process.env.ANIMATIONS_DIRECTORY_PATH;
        const keycodeIconDirectoryPath = process.env.KEYCODE_ICON_DIRECTORY_PATH;

        if (!fs.existsSync(tempFilePath)) {
            console.log('Temp file does not exist:', tempFilePath);
            return;
        }

        const fileContent = fs.readFileSync(tempFilePath, 'utf-8');
        const jsonData = JSON.parse(fileContent);

        if (!jsonData.content || !jsonData.content.Company) {
            console.log('Invalid JSON structure');
            return;
        }

        jsonData.content.Company.forEach(item => {
            const oldPath = item.path;
            const oldPathIcon = item.icon;

            if (this.isValidPath(oldPath) && this.isValidPath(oldPathIcon)) {
                const fileName = path.basename(oldPath).replace(/\\/g, '/');
                const fileNameIcon = path.basename(oldPathIcon).replace(/\\/g, '/');

                const newPath = path.join(animationsDirectoryPath, fileName).replace(/\\/g, '/');
                const newPathIcon = path.join(keycodeIconDirectoryPath, fileNameIcon).replace(/\\/g, '/');

                item.path = newPath;
                item.icon = newPathIcon;
            } else {
                console.log('Invalid path or icon for item:', item);
            }
        });

        fs.writeFileSync(tempFilePath, JSON.stringify(jsonData, null, 2), 'utf-8');
    }

    isValidPath(filePath) {
        if (typeof filePath !== 'string') return false;

        const validExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.bmp', '.svg', '.mp4', '.avi', '.mov'];
        const ext = path.extname(filePath).toLowerCase();

        return validExtensions.includes(ext);
    }

    

}

module.exports = FileManager;
