const { confirmVideoInsideJSON } = window.electronAPIVideos
const { onJSONData, readJSONFile } = window.electronAPI2
let popUpDisplayed = false;

document.addEventListener('DOMContentLoaded', function () {
  readJSONFile('./settins.json');

  onJSONData(data => {
    const jsonData = data.data.content.Company
    const tableBody = document.querySelector('.tbody-log')

    jsonData.forEach(item => {
      const row = document.createElement('tr')
      const keycodeCell = document.createElement('td')
      const filenameCell = document.createElement('td')
      const iconCell = document.createElement('td')

      const contentToShow = `<p class="text-cell">${item.keycode}</p>`

      keycodeCell.innerHTML = contentToShow
      let filenameWithoutExtension = item.filename.replace(/\.mp4$/, '')
      filenameCell.innerHTML = `<p class="text-cell">Video: ${filenameWithoutExtension}</p>`

      if (item.icon) {
        const imgElement = document.createElement('img')
        imgElement.src = item.icon
        imgElement.alt = 'slow'
        imgElement.className = 'icon-joystick'
        imgElement.id = `icon-${item.keycode}`
        imgElement.addEventListener('click', () =>
          handleImageClick(item.keycode, item.icon)
        )

        iconCell.appendChild(imgElement)
      } else {
        const uploadButton = document.createElement('button')
        uploadButton.innerText = 'No icon available'
        uploadButton.classList.add('btn-upload')
        uploadButton.addEventListener('click', () =>
          handleImageClick(item.keycode, item.icon)
        )
        iconCell.appendChild(uploadButton)
      }

      row.appendChild(filenameCell)
      row.appendChild(keycodeCell)
      row.appendChild(iconCell)
      tableBody.appendChild(row)
    })
  })

  function handleImageClick (targetKeycode, iconSrc) {
    console.log('Clicked on image with src:', iconSrc)
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/png'
    input.addEventListener('change', event =>
      handleFileSelection(event, targetKeycode, iconSrc)
    )
    input.click()
  }

  function handleFileSelection(event, targetKeycode, iconSrc) {
    const arrayIcons = [];
    const selectedFiles = event.target.files;
    console.log('selectedFiles:', selectedFiles);

    if (selectedFiles.length > 0) {
        // Converte FileList para um array de Promises de leitura de arquivos
        const fileReadPromises = Array.from(selectedFiles).map(fileInput => {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => {
                    const icon = reader.result;
                    const iconName = fileInput.name;
                    const sendIcons = {
                        Keycode: targetKeycode,
                        name: iconName,
                        src: iconSrc,
                        contentIcon: icon
                    };
                    arrayIcons.push(sendIcons);
                    resolve();
                };
                reader.onerror = reject;
                reader.readAsArrayBuffer(fileInput);
            });
        });

        Promise.all(fileReadPromises)
            .then(() => {
                console.log('arrayIcons:', arrayIcons);

                // Chama a função para atualizar os ícones com callback
                window.electronAPISettings.updateIcon(arrayIcons, (err, response) => {
                    if (err) {
                        console.error("Error updating icons:", err);
                        popUp("Error updating icons.");
                        return;
                    }

                    console.log('response:', response);
                    if (response.success === true) {
                        window.location.reload(true);
                    } else {
                        popUp("Error updating icon.");
                    }
                });
            })
            .catch(error => {
                console.error("Error reading files:", error);
                popUp("Error reading files.");
            });
    }
}



function popUp (errorMessage) {
    const popUp = document.getElementById('pop-up')
    popUp.innerHTML = `
            <section class="container-success">
                <header class="header-alert">
                    <div class="slide-progress-bar">
                        <div class="progress-bar" id="progress-bar"></div>
                    </div>
                </header>
                <main>
                    <div class="text">
                        <p class="text-p">${errorMessage}</p>
                    </div>
                </main>
            </section>
        `

    const progressBar = document.getElementById('progress-bar')
    let width = 100
    popUp.style.display = 'block'

    setTimeout(() => {
      popUp.classList.add('hidden')
      popUpDisplayed = false
    }, 3400)

    setTimeout(() => {
      popUp.classList.remove('hidden')
      popUp.style.display = 'none'
    }, 4000)

    const interval = setInterval(() => {
      if (width > 0) {
        width--
        progressBar.style.width = width + '%'
      } else {
        clearInterval(interval)
      }
    }, 3)
  }
})
