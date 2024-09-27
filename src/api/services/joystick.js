const fs = require('fs')
const path = require('path');
const JOSN_JOYSTICK_PATH = path.join(__dirname, '../data/joystick.json');
const ICON_PATH = path.join(__dirname, '../../assets/keypadIcon');
const SETTINGS_PATH = path.join(__dirname, '../../utils/settings.json');

const keycodeEvents = {
  1: 'Digit1',
  2: 'Digit2',
  3: 'Digit3',
  4: 'Digit4',
  5: 'Digit5',
  6: 'Digit6',
  7: 'Digit7',
  8: 'Digit8',
  9: 'Digit9',
  0: 'Digit0',
  Backspace: 'Backspace',
  '/': 'Slash',
  '+': 'Equal',
  '-': 'Minus',
  '*': 'Asterisk',
  Enter: 'Enter',
  '.': 'Period',
  'NumLock': 'Numlock',
}

async function laodPrevViewIconTmP() {
  try {
      const SETTINGS_PATH = process.env.TEMP_FILE_PATH;
      const ICON_PATH = process.env.KEYCODE_ICON_DIRECTORY_PATH;
      const JSON_JOYSTICK_PATH = path.join(SETTINGS_PATH);

      const data = fs.readFileSync(JSON_JOYSTICK_PATH, 'utf8');
      const READ_JSON_JOYSTICK = JSON.parse(data);

      READ_JSON_JOYSTICK.content.Company.forEach((icon) => {
          const iconKeycode = icon.keycode;
          const currentIcon = icon.icon;
          const oldIcon = path.basename(currentIcon);

          if (iconKeycode === '3' || iconKeycode === '0') {
              icon.icon = path.join(ICON_PATH, oldIcon).replace(/\\/g, '/');;
          }
      });

  
     fs.writeFileSync(JSON_JOYSTICK_PATH, JSON.stringify(READ_JSON_JOYSTICK, null, 2), 'utf8');
      console.log('JSON file has been updated and saved.');

  } catch (err) {
      console.error('Error updating JSON file:', err.message);
  }
}



async function checkKeycodeAndIcon() {
  const READ_JSON_JOYSTICK = await JSON.parse(
    fs.readFileSync(JOSN_JOYSTICK_PATH, 'utf8')
  );



  const READ_ICON_PATH = fs.readdirSync(ICON_PATH)
  const READ_JSON_SETTINGS = await JSON.parse(
    fs.readFileSync(SETTINGS_PATH, 'utf8')
  )

  if (!READ_JSON_JOYSTICK || !READ_ICON_PATH || !READ_JSON_SETTINGS)
    throw new Error('Invalid JSON')

  const mappedIcons = {}

  READ_ICON_PATH.forEach((icon, index) => {
    const iconName = path.basename(icon, path.extname(icon));
    const part = iconName.split(/(?=[A-Z])/)[1];
  

    if (part !== null) {
      const matchingKey = Object.keys(keycodeEvents).find(key => {
        return keycodeEvents[key].toLowerCase() === part.toLowerCase();
      });

      if (matchingKey) {
        const iconPath = path.join(ICON_PATH, icon).replace(/\\/g, '/');
        mappedIcons[matchingKey] = iconPath;
      }
    }
  });


  READ_JSON_JOYSTICK.joystick.forEach(item => {
    const keycodeEvent = item.keycodeEvent
    const numberPart = keycodeEvent.match(/\d+/)

    if (numberPart) {
      const number = parseInt(numberPart[0], 10)
      const iconPath = mappedIcons[number]
      if (iconPath) {
        item.icon = iconPath
      }
    } else {
      const specialCases = {
        Enter: 'Enter',
        Equal: '+',
        Minus: '-',
        Slash: '/',
        Backspace: 'Blackscape',
        Asterisk: '*',
        Period: '.',
        NumLock: 'NumLock'
      }

      if (specialCases[keycodeEvent]) {
        const key = specialCases[keycodeEvent]
        const iconPath = mappedIcons[key]
        if (iconPath) {
          item.icon = iconPath
        }
      } else {
        const iconPath = mappedIcons[keycodeEvent]
        if (iconPath) {
          item.icon = iconPath
        }
      }
    }
  })

  fs.writeFileSync(
    JOSN_JOYSTICK_PATH,
    JSON.stringify(READ_JSON_JOYSTICK, null, 2),
    'utf8'
  )

  READ_JSON_SETTINGS.content.Company.forEach(content => {
    const existKey = content.keycode
    const iconPath = mappedIcons[existKey]
    const existeKeyCase = mappedIcons[existKey]

    if (existeKeyCase !== null) {
      content.icon = iconPath
    }

    const VIDEO_DIRECTORY = path.resolve(__dirname, '../../assets/animations/')
    if (fs.existsSync(VIDEO_DIRECTORY)) {
      const existKeyFilename = content.filename
      const files = fs.readdirSync(VIDEO_DIRECTORY)
      const matchingFile = files.find(file => file.includes(existKeyFilename))

      if (matchingFile) {
        const absolutePath = path
          .join(VIDEO_DIRECTORY, matchingFile)
          .replace(/\\/g, '/')
        content.path = absolutePath
      }
    }
  })

  fs.writeFileSync(
    SETTINGS_PATH,
    JSON.stringify(READ_JSON_SETTINGS, null, 2),
    'utf8'
  )
}

async function laodPrevViewVideo(eventKeyCode) {
  if (typeof eventKeyCode !== 'string') {
    throw new Error('Invalid event key type. Must be a string.')
  }

  const videoPath = SETTINGS_PATH.content.Company.find(
    v => v.keycode === eventKeyCode
  )

  if (videoPath) {
    const matchingSetting = SETTINGS_PATH.content.find(
      setting => setting.keyCode === eventKeyCode
    )

    if (matchingSetting) {
      console.log('Path of the video:', videoPath.path)
      return videoPath.path
    } else {
      throw new Error(
        'Could not find matching setting for event key: ' + eventKeyCode
      )
    }
  } else {
    throw new Error('Could not find video path for event key: ' + eventKeyCode)
  }
}

async function updateIcon(targetKeycode, newName, oldIconSRC, content) {
  const SETTINGS_PATH = process.env.TEMP_FILE_PATH;
  const ICON_PATH = process.env.KEYCODE_ICON_DIRECTORY_PATH;
  if (newName && content instanceof ArrayBuffer) {

    const READ_JSON_SETTINGS = JSON.parse(
      fs.readFileSync(SETTINGS_PATH, 'utf8')
    );

    const keycodeName = keycodeEvents[targetKeycode];

    if (!keycodeName) {
      return {
        success: false,
        message: `Invalid targetKeycode ${targetKeycode}`
      };
    }

    const iconBuffer = Buffer.from(content);
    const existingIconPath = path.join(ICON_PATH, newName);
    if (fs.existsSync(existingIconPath)) {
      fs.unlinkSync(existingIconPath);
    }

    const matchingContent = READ_JSON_SETTINGS.content.Company.find(
      contentItem => contentItem.keycode === targetKeycode
    );

    if (matchingContent) {
      if (matchingContent.icon) {
        const oldIcon = path.basename(matchingContent.icon);
        const oldFileExist = path.join(ICON_PATH, oldIcon);
        if (fs.existsSync(oldFileExist)) {
          fs.unlinkSync(oldFileExist);
        }
      }

      const newIconName = generateNewIconName(matchingContent, keycodeName);
      const newIconPath = path.join(ICON_PATH, newIconName);
      fs.writeFileSync(newIconPath, iconBuffer);

      const absolutePath = newIconPath.replace(/\\/g, '/');

      matchingContent.icon = absolutePath;

      fs.writeFileSync(
        SETTINGS_PATH,
        JSON.stringify(READ_JSON_SETTINGS, null, 2),
        'utf8'
      );
      return { success: true, message: 'Object add success!' };
    } else {

      return {
        success: false,
        message: `Content not found for targetKeycode ${targetKeycode}`
      };
    }
  } else {
    return { success: false, message: `Object not found: ${newName}` };
  }
}

function generateNewIconName(action, keycode) {
  const lowercaseAction = action.filename.replace(/\.mp4$/g, '').toLowerCase();
  const newName = `${lowercaseAction}${keycode}.png`;
  return newName
}

module.exports = {
  checkKeycodeAndIcon,
  updateIcon,
  laodPrevViewIconTmP
}
