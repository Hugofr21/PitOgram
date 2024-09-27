var fileInputMP4Company = document.getElementById('file-selector-input-mp4-company');
const submitButtonCompany = document.getElementById('submit-button-company');
const listSectionCompany = document.querySelector('.list-section-company');
const listContainerCompany = document.querySelector('.list-company')

function typeValidationMp4 (type, filename) {
  const regex = /^[a-zA-Z0-9_-]+\.mp4$/g
  if (type === 'application/json' || type === 'video/mp4') {
    if (!regex.test(filename)) {
      const message = "The file name format does not comply with standards"
      createdElementErro(message);
      return false
    } else {
      return true
    }
  } else {
    return false
  }
}

// submit video company
document.addEventListener('DOMContentLoaded', function () {
  let selectedFileCompany = null
  submitButtonCompany.disabled = true
  submitButtonCompany.style.opacity = '0.5'

  fileInputMP4Company.addEventListener('change', function (e) {
    var files = e.target.files
    if (files.length > 0) {
      var firstFile = files[0]
      const formData = new FormData()
      if (typeValidationMp4(firstFile.type, firstFile.name)) {

        if (selectedFileCompany !== null) {
          const message = "Please remove the existing file before adding a new one."
          createdElementErro(message);
          e.target.value = ''
          return
        }

        var li = document.createElement('li')
        listSectionCompany.style.display = 'block'
        li.classList.add('in-prog')
        var fileSize = (firstFile.size / (1024 * 1024)).toFixed(2)
        li.innerHTML = `
            <div class="col">
              <img class="icon-file" src="../../assets/icon/mp4.png" alt="">
            </div>
            <div class="col col-file-choose">
              <div class="file-name">
                <div class="name">${firstFile.name}</div>
              </div>
              <div class="file-size">${fileSize} MB</div>
              <button class="delete-file">X</button>
            </div>
          `
        listContainerCompany.prepend(li)

        const deleteButton = li.querySelector('.delete-file')
        deleteButton.addEventListener('click', function () {
          li.remove()
          e.target.value = ''
          selectedFileCompany = null
          submitButtonCompany.disabled = true
          submitButtonCompany.style.opacity = '0.5'
        })

        formData.append('video', firstFile)
        selectedFileCompany = formData
        submitButtonCompany.disabled = false
        submitButtonCompany.style.opacity = '1'
      } else {
        e.target.value = ''
      }
    }
  })

  submitButtonCompany.addEventListener('click', function () {
    if (selectedFileCompany !== null) {
     
      const videoFile = selectedFileCompany.get('video')
      const reader = new FileReader()
      reader.onload = function () {
        const content = reader.result
        const arrayBuffer = {
          name: videoFile.name,
          size: videoFile.size,
          type: videoFile.type,
          lastModified: videoFile.lastModified,
          content: content
        }
        console.log("arrayBuffer ", arrayBuffer);
        window.electronAPISettings.sendDataToDashboardDefaultVideo(arrayBuffer)
      }

      reader.readAsArrayBuffer(videoFile)

      window.electronAPISettings.getDataToMainSettingsVideo(result => {
        if (result.success === true) {
          popUp();
        } 
      })
    } else {
      const message = 'Please select a valid file before submitting.'
      createdElementErro(message)
    }
  })
})

function popUp() {
  const popUp = document.getElementById('pop-up');
  popUp.style.display = 'block';
  setTimeout(() => {
      popUp.classList.add('hidden');
      window.location.reload(); 
  }, 3400);
  const progressBar = document.getElementById('progress-bar');
  let width = 100;
  const interval = setInterval(() => {
      if (width > 0) {
          width--;
          progressBar.style.width = width + '%';
      } else {
          clearInterval(interval);
      }
  }, 3);
}

function createdElementErro(message) {
  const p = document.createElement ('p');
  p.style.color = 'red';
  p.innerHTML = message;
  const spanP = document.querySelector('.erro-file');

  spanP.appendChild(p);
  setTimeout(() => {
    spanP.removeChild(p);
  }, 4000);
}