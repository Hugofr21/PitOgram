var fileInput = document.querySelector('.file-selector-input')

const listSection = document.querySelector('.list-section')
const listContainer = document.querySelector('.list')
const submitButton = document.getElementById('submit-button')



let selectedFile = [];
submitButton.disabled = true
submitButton.style.opacity = "0.5"
let selectedFileVideo = [];

// verify file format, only check mp4 and json
function typeValidationJsonAndMp4(type, filename) {
  const regex = /^[a-zA-Z0-9_-]+\.(json|mp4)$/g
  if (type === 'application/json' || type === 'video/mp4') {
    if (!regex.test(filename)) {
      const message = 'The file name format does not comply with standards.'
      createdElementErro(message)
      return false
    } else {
      return true
    }
  } else {
    return false
  }
}
function validateTypeJsonStruct(json) {
  console.log('Type of json:', json);

  if (typeof json !== 'object' || json === null || Array.isArray(json)) {
    return false;
  }

  if (!json.hasOwnProperty("Company") || !Array.isArray(json.Company)) {
    return false;
  }

  const validEntries = [];

  for (const entry of json.Company) {
    const required = ['filename', 'keycode', 'path'];
    const allowedRequired = [...required];

    if (
      typeof entry !== 'object' ||
      entry === null ||
      Array.isArray(entry)
    ) {
      return false;
    }

    for (const key of required) {
      if (!entry.hasOwnProperty(key)) {
        return false;
      }
    }

    for (const includesKey in entry) {
      if (!allowedRequired.includes(includesKey)) {
        return false;
      }
    }

    if (
      typeof entry.filename !== 'string' ||
      typeof entry.keycode !== 'string' ||
      typeof entry.path !== 'string'
    ) {
      return false;
    }

    if (!entry.path.endsWith('.mp4')) {
      console.log('Removing entry with invalid path:', entry.path);
      continue; 
    }

    if (!isValidateNoBase64(entry)) {
      console.log("base64: ", index);
      continue; // Skip this entry
    }

    // Add valid entry to validEntries array
    validEntries.push(entry);
  }

  // Replace the Company array with valid entries
  json.Company = validEntries;

  return true;
}


function handleJSON(file) {
  const reader = new FileReader();
  reader.onload = function () {
    try {
      const json = JSON.parse(reader.result);
      if (validateTypeJsonStruct(json)) {
        const li = createListViewFiles(file);
        deleteItemListFiles(li, selectedFile);
        return true;
      }
      return false;
    } catch (e) {
      console.log('Error parsing JSON: ' + e.message);
    }
  };

  reader.readAsText(file);
  return true;
}




function isValidateNoBase64(entry) {
  const regexBase64 = /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/;
  if (regexBase64.test(entry.filename) ||
    regexBase64.test(entry.keycode) ||
    regexBase64.test(entry.path)
  ) {
    return false;
  }
  return true;

}

// submit settings json and videos animations
document.addEventListener('DOMContentLoaded', function () {

  fileInput.addEventListener('change', function (e) {
    var files = Array.from(e.target.files)
    files.forEach(function (file, index) {
      if (files.length > 0) {
        var firstFile = files[0]
        //console.log("array files: ", files)
        if (typeValidationJsonAndMp4(firstFile.type, firstFile.name)) {
          if (firstFile.type === 'application/json') {
            if (handleJSON(file)) {
              selectedFile.push(file);
              //console.log("selected file: ", selectedFile);
            } else {
              return;
            }

          } else {
            selectedFileVideo.push(file)
            const li = createListViewFiles(file)
            deleteItemListFilesVideos(li, selectedFileVideo, file);
          }
          submitButton.disabled = false;
          submitButton.style.opacity = "1"
        } else {
          const message = `The file name format does not comply with standards`
          createdElementErro(message)
          submitButton.disabled = true;
          submitButton.style.opacity = "0.5"
          selectedFile = [];
          selectedFileVideo = [];
        }
      }

    });
    updateSubmitButtonState();
  });

  submitButton.addEventListener('click', function (event) {
    event.preventDefault();
    // Send the `selectedFile` JSON.~
    console.log(selectedFile);
    if (selectedFile.length > 0) {

      readFileJson(selectedFile);
    }

    // Send the `selectedFileVideo` VIDEOS.
    if (selectedFileVideo.length > 0) {
      readVideosAnimations(selectedFileVideo);
    }


    // clear file json data
    selectedFile = [];
    // clear files videos data
    selectedFileVideo = [];
    // disable submit button
    submitButton.disabled = true;
    // clear list of files
    listContainer.innerHTML = ''
    popUp();
  })
})

function updateSubmitButtonState() {
  submitButton.disabled = selectedFile.length === 0 && selectedFileVideo.length === 0;
  submitButton.style.opacity = submitButton.disabled ? "0.5" : "1";
}

function createListViewFiles(firstFile) {
  let fileType = firstFile.type
  let iconFile;
  let currentFileSize;
  var fileSize = (firstFile.size / 1024).toFixed(2) // format KB
  var fileSizeMP4 = (firstFile.size / (1024 * 1024)).toFixed(2) // format MB
  let lenghtFile = "KB";

  if (fileType === 'application/json') {
    iconFile = '../../assets/icon/json.png'
    currentFileSize = fileSize;
    lenghtFile = "KB"

  } else if (fileType === 'video/mp4') {
    iconFile = '../../assets/icon/mp4.png'
    currentFileSize = fileSizeMP4;
    lenghtFile = "MB"

  } else {
    iconFile = '../../assets/icon/json.png'
    currentFileSize = fileSize;
    lenghtFile = "KB"
  }

  listSection.style.display = 'block'
  var li = document.createElement('li')
  li.classList.add('in-prog')

  li.innerHTML = `
              <div class="col">
                  <img class ="icon-file" src="${iconFile}" alt="">
              </div>
              <div class="col col-file-choose">
                  <div class="file-name">
                      <div class="name">${firstFile.name}</div>
                  </div>
                  <div class="file-size">${currentFileSize} ${lenghtFile}</div>
                  <button class="delete-file">X</button>
              </div>
          `
  listContainer.prepend(li)

  return li
}

function deleteItemListFiles(li, selectedFile) {
  const deleteButton = li.querySelector('.delete-file')
  deleteButton.addEventListener('click', function () {
    li.remove()
    fileInput.value = ''
    selectedFile.pop();
    submitButton.disabled = true
  })
}

// if it`s list videos delete
function deleteItemListFilesVideos(li, selectedFileVideo, file) {
  const deleteButton = li.querySelector('.delete-file')
  deleteButton.addEventListener('click', function () {
    li.remove()
    const index = selectedFileVideo.indexOf(file)
    if (index !== -1) {
      selectedFileVideo.splice(index, 1)
    }
    if (selectedFileVideo.length === 0) {
      submitButton.disabled = true
    }
  })
}

// read the file json verify conditions
function readFileJson(selectedFiles) {
  // each file has its own properties
  // @String {filename, String: keycode, String: path}
  selectedFiles.forEach(function (file) {
    const reader = new FileReader();
    reader.onload = function () {
      const content = JSON.parse(reader.result);
      const newFile = {
        name: file.name,
        size: file.size,
        type: file.type,
        lastModified: file.lastModified,
        content: content
      };
      console.log("send", newFile);
      window.electronAPISettings.sendDataToMainSettings(newFile);
    };

    // read file contents
    reader.readAsText(file);
  });
}


// submit video animations
function readVideosAnimations(selectedFileVideo) {
  if (selectedFileVideo.length > 0) {
    //console.log('selected file:', selectedFileVideo.length);

    const promises = selectedFileVideo.map(async videoFile => {
      return new Promise((resolve, reject) => {
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
          //console.log("buffer: ", arrayBuffer.name); 
          window.electronAPISettings.sendDataToMainSettingsVideo(arrayBuffer)
          resolve();
        }
        reader.readAsArrayBuffer(videoFile)
      })
    })

    Promise.all(promises)
    window.electronAPISettings.getDataToMainSettingsVideo(result => {
      if (result.success === true) {
        window.location.reload()
      }
    });

  } else {
    const message = 'Please select a valid file before submitting.'
    createdElementErro(message)
  }
}

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