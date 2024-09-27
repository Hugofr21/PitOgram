const { fs, tmpPath } = require('./fileSystem');
const archiver = require('archiver');


function zipFolder(sourceFolder, zipFilePath) {
    return new Promise((resolve, reject) => {
        const output = fs.createWriteStream(zipFilePath);
        const archive = archiver('zip', {
            zlib: { level: 9 }
        });

        output.on('close', () => {
            console.log(`${archive.pointer()} total bytes`);
            console.log('Zip file has been created');
            resolve();
        });

        archive.on('warning', err => {
            if (err.code === 'ENOENT') {
                console.warn('File not found:', err);
            } else {
                reject(err);
            }
        });

        archive.on('error', err => {
            reject(err);
        });

        archive.pipe(output);
        archive.directory(sourceFolder, false);
        archive.finalize();
    });
}

module.exports = zipFolder;