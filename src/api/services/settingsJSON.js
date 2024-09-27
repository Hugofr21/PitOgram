const fs = require('fs');
const path = require('path');

// const JSON_DIRECTORY = path.resolve(__dirname, '../../utils');
async function addSaveJSON(nameJSON) {
  /*   {"name":"settings.json","size":1235,"type":"application/json","lastModified":1698757846573} */
  try {

    // If a file exists with the same name, delete it.
    //const filePath = path.join(JSON_DIRECTORY, nameJSON.name);
    
    const filePath = process.env.TEMP_FILE_PATH;
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    //save file
    fs.writeFile(filePath, JSON.stringify(nameJSON), function (err) {
      if (err) {
        console.error(`Erro ao salvar o vídeo "${nameJSON.name}": ${err}`);
      } else {
        console.log(`Vídeo "${nameJSON.name}" salvo com sucesso em "${filePath}".`);
      }
    });

    console.log(`JSON ${nameJSON} salvo com sucesso em ${filePath}.`);
  } catch (error) {
    console.error(`Error while saving the JSON"${nameJSON}": ${error.message}`);
  }
}





module.exports = {
  addSaveJSON,
};


