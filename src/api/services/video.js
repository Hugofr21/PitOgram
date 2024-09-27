const fs = require('fs')
const path = require('path')
const LogsRepository = require('../repository/logsRepository')
const logsRepository = new LogsRepository()
const levels = require('../models/logs/levels')

// const VIDEO_DIRECTORY = path.resolve(__dirname, '../../assets/animations/');
// const JSON_DIRECTORY = path.resolve(__dirname, '../../utils/settings.json');
// const DEDAULTS_VIDEO_DIRECTORY = path.resolve(__dirname, '../../assets/video');

// save the video that show page clip animations inspections
async function saveVideo(name, size, type, content, lastModified) {
  try {

    const VIDEO_DIRECTORY = process.env.ANIMATIONS_DIRECTORY_PATH;
    const existingVideoPath = path.join(VIDEO_DIRECTORY, name);
    if (fs.existsSync(existingVideoPath)) {
      fs.unlinkSync(existingVideoPath)
    }

    if (!fs.existsSync(VIDEO_DIRECTORY)) {
      fs.mkdirSync(VIDEO_DIRECTORY, { recursive: true })
    }
    const videoPath = path.join(VIDEO_DIRECTORY, name)

    const contentBuffer = Buffer.from(content)
    fs.writeFileSync(videoPath, contentBuffer)
    return { success: true, video: `Video saved with success in: ${videoPath}` }
  } catch (error) {
    throw new Error(`Error saving video: ${error.message}`)
  }
}

async function getAllVideos() {
  try {
    const VIDEO_DIRECTORY = process.env.ANIMATIONS_DIRECTORY_PATH;
    const files = fs.readdirSync(VIDEO_DIRECTORY)
    const videoFiles = files.filter(
      file => path.extname(file).toLowerCase() === '.mp4'
    )
    const videos = videoFiles.map(file => {
      const filePath = path.join(VIDEO_DIRECTORY, file)
      const content = fs.readFileSync(filePath, 'base64')
      return { name: file, content }
    })

    return { videos }
  } catch (error) {
    throw new Error(`Error saving video: ${error.message}`)
  }
}

async function confirmVideoInsideJSON() {
  try {
    const VIDEO_DIRECTORY = process.env.ANIMATIONS_DIRECTORY_PATH;
    const JSON_DIRECTORY = process.env.TEMP_FILE_PATH;
    if (!fs.existsSync(VIDEO_DIRECTORY)) {
      logsRepository.saveLogs(levels[1], `Videos directory does not exist: ${VIDEO_DIRECTORY}`)
      return { success: false, message: 'Diretório de vídeos não existe.' }
    }
    if (!fs.existsSync(JSON_DIRECTORY)) {
      logsRepository.saveLogs(levels[1], `JSON file does not exist: ${JSON_DIRECTORY}`)
      return { success: false, message: 'Arquivo JSON não existe.' }
    }

    const jsonContent = fs.readFileSync(JSON_DIRECTORY)
    const jsonData = JSON.parse(jsonContent)

    if (!jsonData || !jsonData.content || !jsonData.content.Company) {
      logsRepository.saveLogs(levels[4], `Invalid JSON structure.`)
      return { success: false, message: 'Invalid JSON structure.' }
    }

    for (const company of jsonData.content.Company) {
      if (!company.filename || !company.path) {
        logsRepository.saveLogs(levels[4], `Invalid data structure for the company: ${company}`)
        return {
          success: false,
          message: 'Invalid data structure for the company.'
        }
      }

      const videoPath = path.join(VIDEO_DIRECTORY, company.filename)

      if (!fs.existsSync(videoPath)) {
        logsRepository.saveLogs(levels[3], `Video not found: ${company.filename}`)
        return {
          success: false,
          message: `Video not found ${company.filename}`
        }
      }
    }

    logsRepository.saveLogs(levels[1], 'All videos are JSON compliant.')

    return { success: true, message: 'All videos are JSON compliant.' }
  } catch (error) {
    logsRepository.saveLogs(levels[4], `Error while checking videos and JSON:  ${error.message}`)
    return { success: false, message: 'Error while checking videos and JSON' }
  }
}


async function saveVideoDefatlts(name, size, type, content, lastModified) {
  try {
    const DEDAULTS_VIDEO_DIRECTORY = process.env.VIDEO_DEFAULTS_PATH;
    console.log('Saving video directory:   ', DEDAULTS_VIDEO_DIRECTORY);
    if (!fs.existsSync(DEDAULTS_VIDEO_DIRECTORY)) {
      fs.mkdirSync(DEDAULTS_VIDEO_DIRECTORY, { recursive: true });
    }

    fs.readdirSync(DEDAULTS_VIDEO_DIRECTORY).forEach(file => {
      fs.unlinkSync(path.join(DEDAULTS_VIDEO_DIRECTORY, file));
    });


    const videoPath = path.join(DEDAULTS_VIDEO_DIRECTORY, name);
    console.log('videoPath:   ', videoPath);
    const contentBuffer = Buffer.from(content);
    fs.writeFileSync(videoPath, contentBuffer);

    return { success: true, video: `Video saved successfully in: ${videoPath}` };
  } catch (error) {
    throw new Error(`Error saving video: ${error.message}`);
  }
}
// show path to video defaults directory
async function getVideoDefatlts() {
  try {
    console.log('getVideoDefatlts');
    const videoFormat = '.mp4'
    const DEDAULTS_VIDEO_DIRECTORY = process.env.VIDEO_DEFAULTS_PATH;

    if (!fs.existsSync(DEDAULTS_VIDEO_DIRECTORY)) {
      console.error(
        `Could not find video directory: ${DEDAULTS_VIDEO_DIRECTORY}`
      )
      return { success: false, message: 'Video directory not found' }
    }

    const videoFiles = fs
      .readdirSync(DEDAULTS_VIDEO_DIRECTORY)
      .filter(file => path.extname(file).toLowerCase() === videoFormat)

    console.log('videoFiles: ' + videoFiles);
    if (!videoFiles.length) {
      return { success: false, message: 'No mp4 file found' }
    }

    const videoName = videoFiles[0]
    console.log('videoName: ' + videoName);
    const videoPath = path.join(DEDAULTS_VIDEO_DIRECTORY, videoName).replace(/\\/g, '/');
    console.log('Video defaults path: ' + videoPath);
    // const part = videoPath.split('assets')[1].replace(/\\/g, '/');
    // const relativePath = 'assets' + part;

    logsRepository.saveLogs(levels[2], 'Video default successfully completed.')
    return { success: true, videoPath }
  } catch (error) {
    console.error('Error loading video settings:', error.message)
    throw new Error(`Error saving video: ${error.message}`)
  }
}
module.exports = {
  saveVideo,
  getAllVideos,
  confirmVideoInsideJSON,
  saveVideoDefatlts,
  getVideoDefatlts
}
