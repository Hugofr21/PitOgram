const dotenv = require('dotenv')
const path = require('path')
const result = dotenv.config({ path: path.resolve(__dirname, '../.env') })

if (result.error) {
  throw result.error
}

module.exports = {
  scretToken: process.env.SECRET_HASH,
  cifra: process.env.SECRET_CIFRA,
  salt: process.env.SECRET_SALT,
  port_Socket: process.env.PORT_SOCKET_BLUETOOTH,
  host_Socket: process.env.LOCALHOST_SOCKET_BLUETOOTH
}
