const fs = require('fs');
const path = require('path');
const userData = require('../config.json');
const User = require('../models/user');

class UserRepository {
  constructor() {
    this.users = userData;
  }

  createUser(email, password) {
    if (this.users[email]) {
      return "Email already in use";
    }
    const newUser = new User(email, password);
    this.users[newUser.email] = newUser;
    const configPath = path.resolve(__dirname, '../config.json');
    fs.writeFileSync(configPath, JSON.stringify(this.users, null, 2));
    return newUser;
  }
  getByEmail(email) {
    if (this.users.hasOwnProperty(email)) {
      return this.users[email];
    }
    return "User not found for email " + email;
  }

  verifyEmail(email) {
    if (this.users.hasOwnProperty(email)) {
      return this.users[email];
    } else {
      return "Email não foi encontrado";
    }
  }

  getByPassword(password, email) {
    const user = this.users[email];
    if (user) {
      return user.password;
    } else {
      return "User not found for email " + email;
    }
  }

}

module.exports = UserRepository;
