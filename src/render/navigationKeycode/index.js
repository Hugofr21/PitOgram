const { startListeningUpdates } = window.electronApiBluetooth
setInterval(startListeningUpdates, 1000);

let matchingCompany;

const keycodeUpdateEvents = {
  1: 'KEY_KP1',
  2: 'KEY_KP2',
  3: 'KEY_KP3',
  4: 'KEY_KP4',
  5: 'KEY_KP5',
  6: 'KEY_KP6',
  7: 'KEY_KP7',
  8: 'KEY_KP8',
  9: 'KEY_KP9',
  0: 'KEY_KP0',
  Enter: 'enter',
  '/': 'KEY_KPSLASH',
  '-': 'KEY_KPMINUS',
  '.': 'KEY_KPDOT',
  '+': 'KEY_KPPLUS',
  Backspace: 'backspace',
  '*': 'KEY_KPASTERISK',
  NumLock: 'KEY_NUMLOCK'
}

const keycodeEvents = [
  '1',
  '2',
  '3',
  '4',
  '5',
  '6',
  '7',
  '8',
  '9',
  '0',
  'Enter',
  '/',
  '-',
  '.',
  '+',
  'Backspace',
  '*',
  'NumLock'
]

const otherkeycodeEvents = {
  End: '1',
  ArrowDown: '2',
  PageDown: '3',
  ArrowLeft: '4',
  Clear: '5',
  ArrowRight: '6',
  Home: '7',
  ArrowUp: '8',
  PageUp: '9',
  Insert: '0',
  Enter: 'Enter',
  '/': '/',
  Delete: '.',
  '+': '+',
  Backspace: 'Backspace',
  '*': '*',
  NumLock: 'NumLock'
}

function changePagePressKeycodeeResponse(pressedKey, jsonData) {
  if (!jsonData) return;

  const pressedKeyString = String(pressedKey).trim().toLowerCase();;
  const allKeycodes = jsonData.data.content.Company.map(company => String(company.keycode).trim().toLowerCase());

  const currentUrl = window.location.href;

  const matchingKeycodes = allKeycodes.filter(keycode => keycode === pressedKeyString);
  if (!matchingKeycodes.length > 0) {
    const firstCompanyItem = jsonData.data.content.Company[0];
    const serializedCompany = JSON.stringify(firstCompanyItem.path);
    localStorage.setItem('video', serializedCompany);
  }

  if (currentUrl.includes('/src/index.html')) {
    window.location.href = 'page/dashboard/index.html';
  }
}

function videoTransactionBasedOnJson(
  pressedKey,
  keycodeEvents,
  otherkeycodeEvents,
  jsonData
) {
  let matchingCompany
  let pressedKeyCode

  if (keycodeUpdateEvents.hasOwnProperty(pressedKey)) {
    pressedKey = keycodeUpdateEvents[pressedKey]
  }

  if (typeof keycodeEvents === 'object' && !Array.isArray(keycodeEvents)) {
    const keycodeValues = Object.values(keycodeEvents)
    const keycodeKeys = Object.keys(keycodeEvents)

    if (keycodeValues.includes(pressedKey)) {
      const index = keycodeValues.indexOf(pressedKey)
      pressedKeyCode = keycodeKeys[index]
    }
  } else if (Array.isArray(keycodeEvents)) {
    if (keycodeEvents.includes(pressedKey)) {
      pressedKeyCode = pressedKey
    }
  }

  if (Object.keys(otherkeycodeEvents).includes(pressedKey)) {
    pressedKeyCode = otherkeycodeEvents[pressedKey]
  }

  if (pressedKeyCode) {
    matchingCompany = jsonData.data.content.Company.find(
      item => item.keycode === pressedKeyCode
    )
    if (matchingCompany) {
      const serializedCompany = JSON.stringify(matchingCompany.path)
      localStorage.setItem('video', serializedCompany);

    }
  }

  return pressedKeyCode
}

function changePageKeydown(
  pressedKey,
  keycodeEvents,
  otherkeycodeEvents,
  jsonData
) {
  let matchingCompany;
  if (
    keycodeEvents.includes(pressedKey) ||
    Object.keys(otherkeycodeEvents).includes(pressedKey)
  ) {
    const pressedKeyCode = Object.keys(otherkeycodeEvents).includes(pressedKey)
      ? otherkeycodeEvents[pressedKey]
      : pressedKey
    matchingCompany = jsonData.data.content.Company.find(
      item => item.keycode === pressedKeyCode
    )

    if (!matchingCompany) return

    if (matchingCompany) {
      const serializedCompany = JSON.stringify(matchingCompany.path)
      localStorage.setItem('video', serializedCompany)
    }
  }
}

window.electronAPI2.onJSONData(jsonData => {
  matchingCompany = jsonData

  if (
    !matchingCompany ||
    !matchingCompany.data ||
    !matchingCompany.data.content ||
    !matchingCompany.data.content.Company
  ) {
    console.error('Invalid jsonData structure:', matchingCompany)
    return
  }

  document.addEventListener('keydown', function (event) {
    const pressedKey = event.key

    if (pressedKey.startsWith('Numpad')) {
      pressedKey = pressedKey.replace('Numpad', '');
    }

    const ignoredKeys = ['0', 'Insert', '3', "PageDown"];
    const isSaveKey = pressedKey.toLowerCase() === 's' && (event.ctrlKey || !event.ctrlKey);

    if (ignoredKeys.includes(pressedKey)) {
      return;
    }


    if (isSaveKey) {
      setTimeout(() => {
        changePageKeydown(pressedKey, keycodeEvents, otherkeycodeEvents, matchingCompany);
        changePagePressKeycodeeResponse(pressedKey, matchingCompany);
      }, 1000);
    } else {
      changePageKeydown(pressedKey, keycodeEvents, otherkeycodeEvents, matchingCompany);
      changePagePressKeycodeeResponse(pressedKey, matchingCompany);
    }

  });

  window.addEventListener('keycodeUpdate', event => {
    const data = event.detail
    if (!data.success || !data.message) {
      return
    }
    if (data.success) {
      const keycodeMessage = data.message
      const ignoredKeys = ['KEY_KP0' ,'KEY_KP3'];

      if (ignoredKeys.includes(keycodeMessage)) {
        return;
      }

      const pressKeycode = videoTransactionBasedOnJson(
        keycodeMessage,
        keycodeUpdateEvents,
        otherkeycodeEvents,
        matchingCompany
      )
      changePagePressKeycodeeResponse(pressKeycode, matchingCompany)
    }
  })
})
