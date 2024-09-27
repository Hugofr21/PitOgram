const { getSystemLogs, filterLogs } = window.electronAPISystemLogs;

document.addEventListener('DOMContentLoaded', async event => {
  try {
    await clickClearFilter();
    filterDataTarget();
  } catch (error) {
    console.error('Error loading log settings:', error.message);
  }
});

function filterDataTarget() {
  const btnLevels = document.querySelectorAll('.filter-button');

  btnLevels.forEach(function (button) {
    button.addEventListener('click', e => {
      const target = button.getAttribute('data-severity');

      if (!target) {
        console.error('Invalid target:', target);
        return;
      }

      btnValueLevels(target);
      createBtnAllLogs();
    });
  });
}

async function btnValueLevels(level) {
  let value = '';
  switch (level) {
    case '1':
      value = 'DEBUG';
      await logsFilterAPI(value);
      break;
    case '2':
      value = 'INFO';
      await logsFilterAPI(value);
      break;
    case '3':
      value = 'WARNING';
      await logsFilterAPI(value);
      break;
    case '4':
      value = 'ERROR';
      await logsFilterAPI(value);
      break;
    default:
      console.error('Invalid level:', level);
      return;
  }
}

async function logsFilterAPI(level) {
  try {
    const logsFilter = await filterLogs(level);
    if (logsFilter.message) {
      popUp('#40a6ce', "This operation cannot be performed as there may be no data.");
      return;
    }
    clearTable();
    createElementHTML(logsFilter);
  } catch (error) {
    console.error('Error applying filters:', error.message);
    popUp('#cc3300', 'An error occurred. Please try again.');
  }
}

function clearTable() {
  const tbody = document.querySelector('.tbody-log');
  while (tbody.firstChild) {
    tbody.removeChild(tbody.firstChild);
  }
}

function createElementHTML(data) {
  if (!data) {
    popUp('#cc3300', 'Invalid data!');
    return;
  }

  clearTable();

  if (data.logs) {
    data.logs.forEach(log => {
      createTableRow(log);
    });
  } else {
    data.forEach(log => {
      createTableRow(log);
    });
  }
}

function createTableRow(log) {
  const tbody = document.querySelector('.tbody-log');

  const tr = document.createElement('tr');
  const levelLowerCase = log.level.toLowerCase();
  tr.classList.add(levelLowerCase);
  tr.innerHTML = `
    <td class="timestamp ${levelLowerCase}"><time>${log.timestamp}</time></td>
    <td class="severity ${levelLowerCase}"><strong>${log.level}</strong></td>
    <td class="message ${levelLowerCase}"><p>${log.message}</p></td>
  `;
  tbody.appendChild(tr);
}

function popUp(color, message) {
  const popUp = document.getElementById('pop-up');
  const text = document.querySelector('.text-p');
  popUp.style.display = 'block';
  popUp.style.backgroundColor = color;
  text.textContent = message;

  resetProgressBar();

  setTimeout(() => {
    popUp.classList.add('hidden');
  }, 3000);

  const progressBar = document.getElementById('progress-bar');
  let width = 100;
  const interval = setInterval(() => {
    if (width > 0) {
      width--;
      progressBar.style.width = width + '%';
    } else {
      clearInterval(interval);
    }
  }, 1);

  popUp.classList.remove('hidden');
}

function resetProgressBar() {
  const progressBar = document.getElementById('progress-bar');
  progressBar.style.width = '100%';
}


function createBtnAllLogs() {
  const filterButtonsRight = document.querySelector('.filter-buttons-right');

  if (!filterButtonsRight.querySelector('.clear-filter')) {
    const btn = document.createElement('button');
    btn.classList.add('filter-button', 'clear-filter');
    btn.setAttribute('data-severity', '5');
    btn.textContent = 'Clear filter';
    btn.addEventListener('click', clickClearFilter);
    filterButtonsRight.insertBefore(btn, filterButtonsRight.firstChild);
  }
}

async function clickClearFilter() {
  const logs = await getSystemLogs();
  if (logs) {
    clearTable();
    createElementHTML(logs);
    removeClearFilterButton();
  } else {
    console.error('Error getting logs:', logs.error);
  }
}

function removeClearFilterButton() {
  const filterButtonsRight = document.querySelector('.filter-buttons-right');
  const clearFilterButton = filterButtonsRight.querySelector('.clear-filter');

  if (clearFilterButton) {
    clearFilterButton.remove();
  }
}
