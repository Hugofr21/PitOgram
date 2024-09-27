const fs = require('fs');
const path = require('path');
const PATH_CONFIG = path.resolve(__dirname,'..', 'config.json'); 

class Permissions {
  constructor() {
    this.permissions = [];
  }

  async readPermissions() {
    try {
      const fileData = await fs.promises.readFile(PATH_CONFIG, 'utf-8');
      const jsonData = JSON.parse(fileData);
      if (typeof jsonData.roles === 'object' && jsonData.roles !== null) {
        this.permissions = jsonData.roles;
        return this.permissions;
      } else {
        console.error('Invalid JSON structure: "roles" property is not an array.');
      }
    } catch (error) {
      console.error('Error reading permissions:', error.message);
    }
  }
}

module.exports = Permissions;
