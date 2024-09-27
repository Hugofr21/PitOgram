const UserRepo = require('../repository/userRepository');
const Password  = require('../models/password');
const LogsRepository = require('../repository/logsRepository')
const jwt = require('jsonwebtoken');
require('dotenv').config();
const userRepository = new UserRepo();
const modelPassword = new Password();
const logsRepository = new LogsRepository();
const levels = require('../models/logs/levels');
const { scretToken } = require('../config');

async function loginUser(email, password) {
  try {
    const emailUser = await userRepository.getByEmail(email);
    const userPassword = userRepository.getByPassword(password, email);
    if (!emailUser) {
      return { success: false, message: 'User not found' };
    }
    const passwordMatch = await modelPassword.comparePassword(password, userPassword);
    if (passwordMatch) {
      const jti = generateUniqueTokenIdentifier();
      const tokenOptions = {
        algorithm: 'HS256',
        expiresIn: '1h',
      };
      const payload = {
        userID: 1,
        email: email,
        role: 'admin',
        jti: jti,
      };

      const token = jwt.sign(payload, scretToken, tokenOptions);
      return { success: true, token , };
    } else {
      logsRepository.saveLogs(levels[3], `Attempt login: ${email}` )
      return { success: false, message: 'Incorrect password' };
    }
  } catch (error) {
    throw new Error(`Error: ${error.message}`);
  }
}

function generateUniqueTokenIdentifier() {
  const timestamp = Date.now();
  const randomComponent = Math.floor(Math.random() * 100);
  return `${timestamp}-${randomComponent}`;
}



async function createUser(email, password) {
  try {
    const getEmail = userRepository.verifyEmail(email);
    
    if (getEmail == email) {
      return { success: false, message: 'Email already in use' };
    }
    const modelPassword = new Password();
    const hashedPassword = await modelPassword.hashPassword(password)
    const newUser = userRepository.createUser(email, hashedPassword);

    if (newUser) {
      return { success: true, user: newUser };
    } else {
      return { success: false, message: 'User not found' };
    }
  } catch (error) {
    throw new Error(`Error: ${error.message}`);
  }
}

module.exports = {
  loginUser,
  createUser
};


