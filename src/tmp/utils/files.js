const { fs, path } = require('./fileSystem')

async function moveDirectory(source, destination) {
  const files = fs.readdirSync(source)
  files.forEach(file => {
    const sourcePath = path.join(source, file)
    const destinationPath = path.join(destination, file)
    fs.renameSync(sourcePath, destinationPath)
    console.log(`Moving ${sourcePath} to ${destinationPath}`)
  })
}

async function createFolder(folderPath) {
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true })
    console.log(`Folder created at ${folderPath}`)
  } else {
    console.log(`Folder already exists at ${folderPath}`)
  }
}

async function deleteFolder(folderPath) {
  if (!fs.existsSync(folderPath)) return;
  function deleteRecursive(dirPath) {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);
      if (entry.isDirectory()) {
        deleteRecursive(fullPath);
        fs.rmdirSync(fullPath);
      } else {
        fs.unlinkSync(fullPath);
      }
    }
  }

  deleteRecursive(folderPath);
  fs.rmdirSync(folderPath);
}

module.exports = { moveDirectory, createFolder, deleteFolder}
