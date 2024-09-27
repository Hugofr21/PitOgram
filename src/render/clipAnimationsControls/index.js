const videoPlayerSection = document.getElementById('video-clip-animations-dashboard');
const videoPlayerSection2 = document.getElementById('video-2');
let currentVideoPlayer = videoPlayerSection;
let inactivityThreshold = 60;
let baseTime = 60;
window.electronAPI2.readJSONFile('./settings.json');
const { startListeningUpdates } = window.electronApiBluetooth;

 // custom event get keycode
 setInterval(startListeningUpdates, 1000);

const otherkeycodeEvents = {
  'End': '1',
  'ArrowDown': '2',
  'PageDown': '3',
  'ArrowLeft': '4',
  'Clear': '5',
  'ArrowRight': '6',
  'Home': '7',
  'ArrowUp': '8',
  'PageUp': '9',
  'Insert': '0',
  'Enter': 'Enter',
  '/': '/',
  '-': '-',
  'Delete': '.',
  '+': '+',
  'Backspace': 'Backspace',
  '*': '*',
  'NumLock': 'NumLock',
  'Numlock': 'Numlock'
};

const KeyCodeCustomBluetooth = {
  'KEY_KP1': '1',
  'KEY_KP2': '2',
  'KEY_KP3': '3',
  'KEY_KP4': '4',
  'KEY_KP5': '5',
  'KEY_KP6': '6',
  'KEY_KP7': '7',
  'KEY_KP8': '8',
  'KEY_KP9': '9',
  'KEY_KP0': '0',
  'enter': 'Enter',
  'KEY_KPSLASH': '/',
  'KEY_KPMINUS': '-',
  'KEY_KPDOT': '.',
  'KEY_KPPLUS': '+',
  'backspace': 'Backspace',
  'KEY_KPASTERISK': '*',
  'KEY_NUMLOCK': 'NumLock'
};

// preload animations: transitions page index for transition dashboards animations
// return @src
// import transition
document.addEventListener('DOMContentLoaded', function () {
  const storedCompanyString = localStorage.getItem('video');
  if (storedCompanyString !== null && storedCompanyString !== undefined) {
    const storedCompany = JSON.parse(storedCompanyString);
    currentVideoPlayer.querySelector('source').src = storedCompany;
    currentVideoPlayer.addEventListener('canplaythrough', function () {
      currentVideoPlayer.play();
    });
    currentVideoPlayer.load();
    localStorage.removeItem('video');
  }

  var video = document.getElementById('video-clip-animations-dashboard')
  video.muted = true
  video.style.opacity = 0
  video.controls = false;

  video.addEventListener('loadedmetadata', function () {
    video.controls = false
    video.animate([{ opacity: 0 }, { opacity: 1 }], {
      duration: 0.5,
      easing: 'ease'
    })
    video.style.opacity = 1
  })
})

//  data path to video
let videoCache = {}

// read json settings manipulate transitions animations with key event
window.electronAPI2.onJSONData(jsonData => {

  // Preload all videos into the cache
  jsonData.data.content.Company.forEach(item => {
    videoCache[item.keycode] = item.path
  })

  let isTransitioning = false
  let isPaused = false;

  document.addEventListener('keydown', event => {
    const desiredKeyCode = event.key;

    if (desiredKeyCode === '3' || desiredKeyCode === 'PageDown') {
      if (isPaused) {
        currentVideoPlayer.play();
        isPaused = false;
      } else {
        currentVideoPlayer.pause();
        isPaused = true;
      }
    } else {
      currentVideoPlayer.play();
      isPaused = false;
      videoTransactionBasedOnJson(desiredKeyCode, isTransitioning, otherkeycodeEvents)
    }
  });

  window.addEventListener('keycodeUpdate', event => {
    const desiredKeyCode = event.detail;
    const data = desiredKeyCode.message;
    if (!desiredKeyCode.success || !data) {
      return;
    }
    if (data === 'KEY_KP3') {
      if (isPaused) {
        currentVideoPlayer.play();
        isPaused = false;
      } else {
        currentVideoPlayer.pause();
        isPaused = true;
      }
      resetInactivity(); 
    } else {
      currentVideoPlayer.play();
      isPaused = false;
      videoTransactionBasedOnJson(data, isTransitioning, KeyCodeCustomBluetooth);
      resetInactivity(); 
    }

    // change page
    const currentPage = window.location.href
    if (data === 'KEY_KP0') {
      window.history.back()
    }
    if (currentPage.includes('/index.html')) {
      resetInactivity()
    }
  });
})

async function videoTransactionBasedOnJson(desiredKeyCode, isTransitioning, otherkeycodeEvents) {
  // Check if the key is mapped to a video path
  if (isKeyMappedToVideo(desiredKeyCode)) {
    const keycodeOther = otherkeycodeEvents[desiredKeyCode]
    const selectedVideoPath = Object.keys(otherkeycodeEvents).includes(desiredKeyCode) ? videoCache[keycodeOther] : videoCache[desiredKeyCode]
    if (selectedVideoPath === undefined) return;
    // If a transition is in progress or the same video is being chosen, do nothing
    if (
      isTransitioning ||
      currentVideoPlayer.querySelector('source').src ===
      selectedVideoPath
    ) {
      return
    }

    // Start the transition
    isTransitioning = true

    // New player for transition
    const newVideoPlayer = document.createElement('video')
    newVideoPlayer.className = 'video-play-dashboard'
    newVideoPlayer.autoplay = true
    newVideoPlayer.loop = true
    newVideoPlayer.preload = 'auto'

    const newSource = document.createElement('source')
    newSource.src = selectedVideoPath
    newSource.type = 'video/mp4'

    newVideoPlayer.appendChild(newSource)

    // Adds an HSL style to improve the transition
    newVideoPlayer.style.transition = 'background 1s ease-in-out'
    newVideoPlayer.style.backgroundColor = ' #2C4C85'

    // Bring the new player forward
    newVideoPlayer.style.zIndex = '1'
    currentVideoPlayer.style.zIndex = '-1'

    // Add the new player to the DOM
    document
      .querySelector('.section-video-dashboard')
      .appendChild(newVideoPlayer)

    // Wait for the new stream to load Metadata
    await newVideoPlayer.load()

    // Wait until the new video starts playing
    await new Promise(resolve => {
      newVideoPlayer.onplaying = resolve
    })

    // Pause the previous player and remove the previous DOM Element
    currentVideoPlayer.pause()
    currentVideoPlayer.parentNode.removeChild(currentVideoPlayer)

    // Remove o estilo HSL após a transição
    newVideoPlayer.style.transition = ''

    // Completes the transition
    isTransitioning = false

    // Update the reference to the current player
    currentVideoPlayer = newVideoPlayer
    const videoDuration = newVideoPlayer.duration;
 

    if ( videoDuration >= 40 ) {
      console.log('Video duration has: ' + videoDuration)
      inactivityThreshold = baseTime + (videoDuration / 2); 
    } else {
      inactivityThreshold = 60;
    }
    resetInactivity();
  }
}

function isKeyMappedToVideo(desiredKeyCode) {
  return videoCache.hasOwnProperty(desiredKeyCode) || Object.keys(otherkeycodeEvents).includes(desiredKeyCode)
    || Object.keys(KeyCodeCustomBluetooth).includes(desiredKeyCode);
}

// not make clickable in screen mouse coordinates
currentVideoPlayer.addEventListener('mousemove', function (event) {
  const mouseX = event.clientX - currentVideoPlayer.getBoundingClientRect().left
  const mouseY = event.clientY - currentVideoPlayer.getBoundingClientRect().top
  if (
    mouseX >= 0 &&
    mouseX <= currentVideoPlayer.clientWidth &&
    mouseY >= 0 &&
    mouseY <= currentVideoPlayer.clientHeight
  ) {
    currentVideoPlayer.controls = false
  } else {
    currentVideoPlayer.controls = true
  }
})

currentVideoPlayer.addEventListener('mouseout', function () {
  currentVideoPlayer.controls = true
})

//downtime when clicking updates the time
let inactivityTimeout
let lastActivityTime = Date.now()

function resetInactivity() {
  lastActivityTime = Date.now()
  clearTimeout(inactivityTimeout)
  startInactivityCheck()
}

function startInactivityCheck() {
  inactivityTimeout = setTimeout(() => {
    window.location.href = '../../index.html'
  }, inactivityThreshold * 1000)
}

startInactivityCheck()

document.addEventListener('keydown', event => {
  const currentPage = window.location.href
  if (event.key === '0' || event.key === 'Insert') {
    window.history.back()
  }
  if (currentPage.includes('/index.html')) {
    resetInactivity();
  }
})
