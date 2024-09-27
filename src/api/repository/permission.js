const Permissions = require('../models/permissions');

class PermissionRepository {
  constructor() {
    this.mlPermissions = new Permissions();
  }

  async getPermission(roleName) {
    const getPermission = await this.mlPermissions.readPermissions();
    if (getPermission.name === roleName) {
      return { success: true, message: `Permissions for role ${roleName} retrieved successfully.`, permissions: getPermission.name };
    }
    return { success: false, message: `Role ${roleName} not found.`, permissions: null };
  }
}

module.exports = PermissionRepository;
