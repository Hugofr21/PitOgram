const inputElement = document.getElementById('OPT-cifra');
const submitButton = document.getElementById('submit-button');
var attempts = 0;
var MAX_ATTEMPTS = 3;

document.addEventListener('DOMContentLoaded', function () {
    submitButton.addEventListener('click', function () {
      const inputValue = inputElement.value;
  
      if (!validateStringLength(inputValue) || inputValue.trim() === '') {
        inputElement.classList.add('invalid');
        return false;
      }
  
      window.electronAPILogin.sendCifraDataToMain(
        inputValue,
        data => {
          if (data.success) {
            inputElement.classList.remove('invalid');
            attempts = 0;
          }
        },
        error => {
          inputElement.classList.add('invalid');
          attempts++;
          if (attempts > MAX_ATTEMPTS) {
            window.history.back();
          }
        }
      );
  
      return true;
    });
  
    inputElement.addEventListener('input', function () {
      inputElement.classList.remove('invalid');
    });
});
  

function validateStringLength (value) {
  return value.length >= 1 && value.length <= 25
}

let inactivityTimeout
let lastActivityTime = Date.now()
const inactivityThreshold = 30

function resetInactivity () {
  lastActivityTime = Date.now()
  clearTimeout(inactivityTimeout)
  startInactivityCheck()
}

function startInactivityCheck () {
  inactivityTimeout = setTimeout(() => {
    window.location.href = '../../index.html'
  }, inactivityThreshold * 1000)
}

startInactivityCheck()

document.addEventListener('keydown', event => {
  const currentPage = window.location.href
  if (currentPage.includes('/index.html')) {
    resetInactivity()
  }
  if (event.key === '0' || event.key === 'Insert') {
    window.history.back();
  }
})
