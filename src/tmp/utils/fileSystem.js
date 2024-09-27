const fs = require('fs');
const path = require('path');
const { app } = require('electron');
const DIRECT_JSON_KEYCODE = path.join(__dirname,'..', '..', 'utils', 'settings.json');
const DIRECT_ASSETS_ANIMATIONS = path.join(__dirname,'..', '..','assets', 'animations');
const DIRECT_ASSETS_VIDEO_DEFAULTS = path.join(__dirname,'..', '..','assets', 'video');
const DIRECT_ASSETS_KEYCODEICON = path.join(__dirname,'..', '..','assets', 'keypadIcon');
const DIRECT_DATA_BLUETOOTH = path.join(__dirname,'..', '..','api', 'data','bluetooth.json');
const DIRECT_DATA_LOGS = path.join(__dirname,'..', '..','api', 'data','logs.json');
const tmpPath = path.join(app.getPath('temp'), 'pitogram');




module.exports = {
    fs,
    path,
    app,
    tmpPath,
    DIRECT_JSON_KEYCODE,
    DIRECT_ASSETS_ANIMATIONS,
    DIRECT_ASSETS_KEYCODEICON,
    DIRECT_ASSETS_VIDEO_DEFAULTS,
    DIRECT_DATA_BLUETOOTH,
    DIRECT_DATA_LOGS,
};