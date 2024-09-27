const checkbox = document.querySelector("input[type=checkbox]");
const table = document.querySelector(".custom-table");
const { responseDevices, getDeviceConnectedToApi, getBluetoothJsonData } =
  window.electronApiBluetooth;
const { sendDataToMainSelectedNameBluetooth, requestDeviceByNameDisconnected } =
  window.electronAPI2;

let activeDevices = false;
let storedDevices;
document.addEventListener("DOMContentLoaded", async function () {
  const storedDevices = await getDeviceConnectedToApi();

  if (!storedDevices || !Array.isArray(storedDevices)) {
    return;
  }

  let isDeviceConnected = false;

  storedDevices.forEach((device, index) => {
    if (!device) {
      return;
    }

    const deviceName = device.deviceName;
    const row = document.createElement("tr");
    row.classList.add("list-row");

    const nameCell = document.createElement("td");
    nameCell.classList.add("list-cell-devices", "md-cell-left");
    nameCell.innerHTML = `<label class="device-label-list">Device: <strong>${deviceName}</strong></label>`;

    const actionCell = document.createElement("td");
    actionCell.classList.add("list-cell-devices", "md-cell-right");
    actionCell.innerHTML = `
      <span class="cell-list-square"></span>
      <button class="icon-list-bluetooth">
        <a class="icon-link icon-list-a" href="#">
          <img class="icon-list-img" src="assets/img/gear.png" alt="Engrenagem" />
        </a>
      </button>
    `;

    if (device.active && !isDeviceConnected) {
      const connectedStatus = document.createElement("p");
      connectedStatus.classList.add("text-add-bluetooth");
      connectedStatus.textContent = "Ligado";
      actionCell.insertBefore(connectedStatus, actionCell.firstChild);
      row.classList.add("connected");
      isDeviceConnected = true;
      duplicatioLigation();
    }

    createdRowClickDevice(row, storedDevices);

    row.appendChild(nameCell);
    row.appendChild(actionCell);
    table.appendChild(row);
  });
});


checkbox.addEventListener("change", async function () {

  clearTable();
  localStorage.clear();
  if (checkbox.checked) {

    // loading ....
    showLoadingMessage();

    const result = await responseDevices();
    // result is requesting success false
    if (result.success === false) {
      clearTable();
      showBluetoothDesactiveMessage();
      checkbox.checked = false;
      return false;
    }
    console.log("result ------> ", result)
    // result is requesting return object devices
    getALLDevices(result);
  } else {
    clearTable();
    storedDevices = "";
  }

});

function getALLDevices(deviceList) {
  if (deviceList.length > 0) {
    clearTable();
    deviceList.forEach((device) => {
      craetedElementHTML(device);
    });
  } else {
    console.error("deviceList is not an array.");
  }
}

function craetedElementHTML(device) {
  const row = document.createElement("tr");
  row.classList.add("list-row");
  const nameCell = document.createElement("td");
  nameCell.classList.add("list-cell-devices", "md-cell-left");

  nameCell.innerHTML = `<label class="device-label-list">Device: <strong>${device.deviceName}</strong></label>`;

  createdRowClickDevice(row, device);

  const actionCell = document.createElement("td");
  actionCell.classList.add("list-cell-devices", "md-cell-right");
  actionCell.innerHTML = `
        <span class="cell-list-square"></span>
        <button class="icon-list-bluetooth">
          <a class "icon-link icon-list-a" href="#">
            <img class="icon-list-img" src="assets/img/gear.png" alt="Engrenagem" />
          </a>
        </button>
      `;
  row.appendChild(nameCell);
  row.appendChild(actionCell);
  table.appendChild(row);
}
function createdRowClickDevice(row, device) {
  row.addEventListener("click", () => {
    const connectedDeviceRow = document.querySelector(".connected");
    if (connectedDeviceRow) {
      showDisconnectModal(connectedDeviceRow, device);
    } else {
      showConnectModal(row, device);
    }
  });
}

function showConnectModal(row, device) {
  const modalHTML = `
    <dialog class="connected-bluetooth-modal" id="device-connected">
      <div class="modal-content">
        <p id="modalText">Deseja-se conectar ao dispositivo selecionado?</p>
        <div class="modal-buttons" id="modalButtons">
          <button id="btnConnect">Conectar</button>
          <button id="btnCancel">Cancelar</button>
        </div>
      </div>
    </dialog>
  `;

  document.body.insertAdjacentHTML("beforeend", modalHTML);
  const modal = document.getElementById("device-connected");
  const modalText = document.getElementById("modalText");
  const modalButtons = document.getElementById("modalButtons");
  const btnConnect = document.getElementById("btnConnect");

  btnConnect.addEventListener("click", async () => {
    //console.log("Connect");
    modalText.textContent = "Conectando...";
    modalText.classList.add("blinking");
    modalButtons.style.display = "none";
    const response = await sendDeviceNameAPIBluetooth(modal, device, row);
    if (response) {
      //console.log("Conectar ao dispositivo:", device.deviceName);
      removeOtherDevices(row);

      //updateDeviceStateInCache(device, true)
      row.classList.add("connected");

      // Remover qualquer outra linha conectada antes de adicionar a nova
      const existingConnectedRow = document.querySelector(
        ".list-row.connected"
      );
      if (existingConnectedRow && existingConnectedRow !== row) {
        existingConnectedRow.classList.remove("connected");
        const actionCell = existingConnectedRow.querySelector(
          ".list-cell-devices.md-cell-right"
        );
        const connectedStatus = actionCell.querySelector(".text-add-bluetooth");
        if (connectedStatus) {
          actionCell.removeChild(connectedStatus);
        }
      }
      modal.close();
      modal.remove();
      modalText.classList.remove("blinking"); 
    }
  });

  const btnCancel = document.getElementById("btnCancel");
  btnCancel.addEventListener("click", () => {
    modal.close();
    modal.remove();
    return false;
  });

  modal.showModal();

  //console.log("Device selecionado:", device.name);
}

async function sendDeviceNameAPIBluetooth(modal, device, row) {
  const actionCell = row.querySelector(".list-cell-devices.md-cell-right");
  const existingElement = actionCell.querySelector(".text-add-bluetooth");

  const chooseDeviceName = await sendDataToMainSelectedNameBluetooth(
    device.deviceId
  );


  // case receive an error message
  if (!chooseDeviceName || chooseDeviceName.success === false ) {
    const message = "Não foi possível conectar o dispositivo.";
    showMessageNotFound(message);
    modal.close();
    modal.remove();
    return false;
  }

  if (existingElement) {
    existingElement.remove();
  }

  if (!actionCell.classList.contains("text-add-bluetooth")) {
    const connectedStatus = document.createElement("p");
    connectedStatus.classList.add("text-add-bluetooth");
    connectedStatus.textContent = "Ligado";
    actionCell.insertBefore(connectedStatus, actionCell.firstChild);
    duplicatioLigation();
  }
  return true;
  //console.log("connected closed");
  modal.close();
}

function showDisconnectModal(connectedDeviceRow, device) {
  // create element html modal disconnted to show
  const modalHTML = `
    <dialog class="disconnect-bluetooth-modal" id="device-disconnected">
      <div class="modal-content">
        <p>Deseja desconectar o dispositivo atualmente conectado?</p>
        <div class="modal-buttons">
          <button id="btnDisconnect">Desconectar</button>
          <button id="btnCancelDisconnect">Cancelar</button>
        </div>
      </div>
    </dialog>
  `;

  document.body.insertAdjacentHTML("beforeend", modalHTML);
  const modal = document.getElementById("device-disconnected");

  // click button to disconnect
  const btnDisconnect = document.getElementById("btnDisconnect");
  btnDisconnect.addEventListener("click", async () => {
    // console.log(
    //   "Desconectar dispositivo:",
    //   connectedDeviceRow.querySelector(".device-label-list strong").textContent
    // );

    if (!activeDevices) {
      // Remove the element <p> with indicate from device it is connected
      //console.log("Disconnect", device.deviceName);
      const disconnectDevice = disconnectDevices(device.deviceName);

      if (disconnectDevice.success === false) {
        const message = "Não foi possível disconectar o dispostivo.";
        modal.close();
        showMessageNotFound(message);
        return;
      }

      storedDevices = '';
      // Remove it class connected the row
      connectedDeviceRow.classList.remove("connected");
      const actionCell = connectedDeviceRow.querySelector(
        ".list-cell-devices.md-cell-right"
      );
      const connectedStatus = actionCell.querySelector(".text-add-bluetooth");
      if (connectedStatus) {
        actionCell.removeChild(connectedStatus);
      }
    }
    clearTable();
    modal.close();
    // obter todos devices no json data
    const getDevicesJsonBluetooth = await getBluetoothJsonData();
    //console.log("SJON BLUETOOTH: ", getDevicesJsonBluetooth)
    getALLDevices(getDevicesJsonBluetooth);

  });

  const btnCancelDisconnect = document.getElementById("btnCancelDisconnect");
  btnCancelDisconnect.addEventListener("click", () => {
    modal.close();
    return;
  });

  modal.showModal();
}

function clearTable() {
  while (table.firstChild) {
    table.removeChild(table.firstChild);
  }
}

function showLoadingMessage() {
  const loadingRow = document.createElement("tr");
  loadingRow.classList.add("list-row", "loading-message-row");
  const loadingCell = document.createElement("td");
  loadingCell.classList.add("list-cell-devices", "md-cell-left");
  loadingCell.colSpan = 2;
  let timeCountDown = 30;
  const s = 's'

  loadingCell.innerHTML = `
  <div class="loading-container">
    <div class="lds-ripple"><div></div><div></div></div>
    <p class="text-loading">Carregando dispositivos... <span id="countDown">${timeCountDown}${s} </span></p>
  </div>
  `;
  loadingRow.appendChild(loadingCell);
  table.appendChild(loadingRow);

  // cont down left 
  const timeElementId = document.getElementById('countDown');

  const intervalId = setInterval(() => {
    timeCountDown -= 1;
    timeElementId.textContent = `${timeCountDown}s`;
    if (timeCountDown <= 0) {
      clearInterval(intervalId);
      timeElementId.textContent = "0";
      loadingCell.innerHTML = `
      <div class="loading-container">
        <p class="text-loading">Dispositivos não encontrados.</p>
      </div>
      `;
    }
  }, 1000);

  
}

function showBluetoothDesactiveMessage() {
  const loadingRow = document.createElement("tr");
  loadingRow.classList.add("list-row");
  const loadingCell = document.createElement("td");
  loadingCell.classList.add("list-cell-devices", "md-cell-left");
  loadingCell.colSpan = 2;
  loadingCell.innerHTML = `
    <p class="text-desactive-bluetooth">Dispositivos Bluetooth não estão disponíveis.</p>
  `;
  loadingRow.appendChild(loadingCell);
  table.appendChild(loadingRow);
}

function saveDevicesToLocalStorage(devices) {
  devices.forEach((device, index) => {
    localStorage.setItem(`device_${index}`, JSON.stringify(device));
  });
}

function removeOtherDevices(connectedDevice) {
  const tableRows = document.querySelectorAll(".list-row");
  tableRows.forEach((row) => {
    if (row !== connectedDevice) {
      row.remove();
    }
  });
}

async function disconnectDevices(devicesName) {
  const device = await requestDeviceByNameDisconnected(devicesName);
  //console.log("disconnect render: ", device);
  return device;
}

const showMessageNotFound = async (message) => {
  const modalHTML = `
      <dialog class="disconnect-bluetooth-modal" id="device-not-found">
          <div class="modal-content">
              <p>${message}</p>
          </div>
      </dialog>
  `;
  document.body.insertAdjacentHTML("beforeend", modalHTML);
  const modal = document.getElementById("device-not-found");
  modal.showModal();
  await new Promise((resolve) => setTimeout(resolve, 2000));
  modal.close();
  modal.remove();
};



function duplicatioLigation() {
  const actionCells = document.querySelectorAll('.list-cell-devices.md-cell-right');
  actionCells.forEach(cell => {
    const bluetoothTexts = cell.querySelectorAll('.text-add-bluetooth');
    if (bluetoothTexts.length > 1) {
      bluetoothTexts.forEach((text, index) => {
        if (index > 0) {
          text.remove();
        }
      });
    }
  });
}