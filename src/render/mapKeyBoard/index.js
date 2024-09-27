const { confirmVideoInsideJSON } = window.electronAPIVideos;
const { onJSONData, readJSONFile } = window.electronAPI2;

// logs videos
confirmVideoInsideJSON();

// json joystick
readJSONFile('./settins.json');

onJSONData(data => {

    const jsonData = data.data.content.Company
    const tableBody = document.querySelector('.custom-table-keycode tbody')

    jsonData.forEach(item => {
      const row = document.createElement('tr')
      const keycodeCell = document.createElement('td')
      const filenameCell = document.createElement('td')
      row.classList.add('row-mapKeypad')

      const contentToShow =
        item.icon !== null && item.icon !== undefined
          ? `<p class="text-cell">Tecla: <img class="keypad-img-icon" src="${item.icon}" alt="Icon"></p>`
          : `<p class="text-cell">Tecla: ${item.keycode}</p>`

      keycodeCell.innerHTML = contentToShow
      let filenameWithoutExtension = item.filename.replace(/\.mp4$/, '')
      filenameCell.innerHTML = `<p class="text-cell padding-left-filename">Video: ${filenameWithoutExtension}</p>`

      row.appendChild(keycodeCell)
      row.appendChild(filenameCell)
      tableBody.appendChild(row)
    });
});
