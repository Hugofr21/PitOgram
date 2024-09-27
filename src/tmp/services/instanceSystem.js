const FileSystem = require('./fileSystem');

let fileSystemInstance = null;

function getFileSystemInstance() {
    if (!fileSystemInstance) {
        fileSystemInstance = new FileSystem();
    }
    return fileSystemInstance;
}

module.exports = getFileSystemInstance;