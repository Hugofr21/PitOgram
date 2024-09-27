const jwt = require('jsonwebtoken')
const { scretToken } = require('../config')
const PermissionRepository = require('../repository/permission')

const verifyTokenAndPermissions = async token => {
  try {
    const decodedToken = jwt.verify(token, scretToken, {
      algorithms: ['HS256']
    })

    const currentTimestamp = Math.floor(Date.now() / 1000)
    if (decodedToken.exp && decodedToken.exp < currentTimestamp) {
      return { success: false, message: 'Token has expired' }
    }

    const userRole = decodedToken ? decodedToken.role : 'anonymous'

    const userPermissions = await new PermissionRepository().getPermission(
      userRole
    )

    if (!decodedToken.jti) {
        return { success: false, message: 'Token does not have a unique identifier' };
      }
      
    if (
      decodedToken &&
      decodedToken.email &&
      userPermissions &&
      userPermissions.permissions === decodedToken.role
    ) {
      return { success: true, message: 'Valid token and required permissions' }
    } else {
      return {
        success: false,
        message: 'Invalid token or missing required data'
      }
    }
  } catch (error) {
    return { success: false, message: error.message }
  }
}

module.exports = { verifyTokenAndPermissions }
