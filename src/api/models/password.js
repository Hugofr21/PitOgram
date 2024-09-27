const bcrypt = require('bcrypt');
const saltRounds = 10; 

class Password {

  async hashPassword(password) {
    try {
      const salt = await bcrypt.genSalt(saltRounds);
      const hashedPassword = await bcrypt.hash(password, salt);
      return hashedPassword;
    } catch (error) {
      throw new Error('Erro ao criar o hash da senha');
    }
  }
  
  async comparePassword(password, hashedPassword) {
    try {
      const match = await bcrypt.compare(password, hashedPassword);
      return match;
    } catch (error) {
      throw new Error('Erro ao comparar a senha com o hash');
    }
  }
}

module.exports = Password;
