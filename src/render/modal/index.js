const openModalButton = document.getElementById('openModalButton');
const openModalKeycoddeMap = document.getElementById('openModalkeyboardMap');
const modal = document.getElementById('modal-bluetooth');
const modalKeycodeMap = document.getElementById('modalkeyboard');

const closeButton = document.querySelector('.close-button');
const closeButtonKeycode = document.querySelector('.close-button-keycode');

const { shutdownAction, restartAction } = window.SystemShutdown;

openModalButton.addEventListener('click', function () {
  modal.style.display = 'flex';
  modal.querySelector('.modal-bluetooth-section').classList.add('modalAnimationopen');
});

openModalKeycoddeMap.addEventListener('click', function () {
  modalKeycodeMap.style.display = 'flex';
  modalKeycodeMap.querySelector('.modal-keycode-section').classList.add('modalAnimationopen');
});

closeButton.addEventListener('click', function () {
  const bluetoothSection = modal.querySelector('.modal-bluetooth-section');
  bluetoothSection.classList.add('modalAnimationclose');

  setTimeout(function () {
    modal.style.display = 'none';
    bluetoothSection.classList.remove('modalAnimationclose');
    bluetoothSection.classList.remove('modalAnimationopen');
  }, 1000);
});

closeButtonKeycode.addEventListener('click', function () {
  const keycodeSection = modalKeycodeMap.querySelector('.modal-keycode-section');
  keycodeSection.classList.add('modalAnimationclose');

  setTimeout(function () {
    modalKeycodeMap.style.display = 'none';
    keycodeSection.classList.remove('modalAnimationclose');
    keycodeSection.classList.remove('modalAnimationopen');
  }, 1000);
});

window.addEventListener('click', function (event) {
  if (event.target === modal) {
    modal.style.display = 'none';
  }
  if (event.target === modalKeycodeMap) {
    modalKeycodeMap.style.display = 'none'
  }

});


document.getElementById('shutdownButton').addEventListener('click', function () {
  var menu = document.querySelector('.dropdown-menu');
  menu.classList.toggle('show');
});

document.getElementById('shutdownAction').addEventListener('click', function () {
  shutdownAction();
});


document.getElementById('restartAction').addEventListener('click', function () {
  console.log('Restarting application !');
  restartAction();

});




