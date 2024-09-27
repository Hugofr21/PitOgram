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
const valuesKeys = Object.values(keycodeUpdateEvents);

module.exports = valuesKeys;