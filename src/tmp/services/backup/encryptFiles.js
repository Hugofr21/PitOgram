const crypto = require('crypto')
const zipFolder = require('../../utils/archiver')
const { moveDirectory, createFolder, deleteFolder } = require('../../utils/files')
const { fs, path, tmpPath } = require('../../utils/fileSystem')

const algorithm = 'aes-256-gcm'
const password = process.env.ENCRYPTION_PASSWORD
const saltLength = 64;
const ivLength = 12;
const keyLength = 32;
const iterations = 100000;

async function basckupFilesAndZip () {
  const base_backup = path.join(tmpPath, 'Backup')
  const zipFilePath = path.join(base_backup, 'backup.zip')
  const encryptedFilePath = path.join(base_backup, 'backup.enc');
  const json_settings = process.env.TEMP_FILE_PATH

  // directorios
  const directory = [
    process.env.ANIMATIONS_DIRECTORY_PATH,
    process.env.KEYCODE_ICON_DIRECTORY_PATH,
    process.env.BLUETOOTH_DATA_PATH,
    process.env.LOGS_DATA_PATH,
    process.env.VIDEO_DEFAULTS_PATH
  ]

  await createFolder(base_backup)

  for (const dir of directory) {
    const dirName = path.basename(dir)
    const zipDest = path.join(base_backup, `${dirName}.zip`)
    await zipFolder(dir, zipDest)
  }

  console.log(`Creating final zip file ${zipFilePath} from ${base_backup}`)
  await zipFolder(base_backup, zipFilePath)
  console.log(`Final zip file created at ${zipFilePath}`)

  await basckupFilesAndEncrepty(zipFilePath, encryptedFilePath);
  console.log(`Zip file encrypted at ${encryptedFilePath}`);

}

async function basckupFilesAndEncrepty (filePath, encryptedFilePath) {
  return new Promise((resolve, reject) => {
    const salt = crypto.randomBytes(saltLength)
    const iv = crypto.randomBytes(ivLength)
    crypto.pbkdf2(
      password,
      salt,
      iterations,
      keyLength,
      'sha512',
      (err, key) => {
        if (err) return reject(err)
        const cipher = crypto.createCipheriv(algorithm, key, iv)
        const input = fs.createReadStream(filePath)
        const output = fs.createWriteStream(encryptedFilePath)

        output.write(salt)
        output.write(iv)

        input.pipe(cipher).pipe(output)

        output.on('finish', () => {
          fs.appendFileSync(encryptedFilePath, cipher.getAuthTag())
          resolve()
        })
        output.on('error', err => reject(err))
      }
    )
  })
}

async function basckupFilesAndDecrypt () {}

module.exports = {
    basckupFilesAndZip
}
