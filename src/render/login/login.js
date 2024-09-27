document.addEventListener('DOMContentLoaded', function() {
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');
  let loginAttempts = 0;

  function validateEmail(email) {
    const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    return emailPattern.test(email);
  }

  function validatePassword(password) {
    return password.length >= 5 && password.length <= 20;
  }

  function handleSubmit(e) {
    e.preventDefault();

    emailInput.classList.remove('invalid');
    passwordInput.classList.remove('invalid');

    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    if (!validateEmail(email)) {
        emailInput.classList.add('invalid');
    }

    if (!validatePassword(password)) {
        passwordInput.classList.add('invalid');
    }

    if (!validateEmail(email) || !validatePassword(password)) {
        return false;
    }

    const userData = {
        email,
        password,
    };

    window.electronAPILogin.sendDataToMain(userData);
    return true;
  }

  window.electronAPILogin.getDataFromMain(
    data => {
      if (data.success) {
        loginAttempts = 0; 
      }
    },
    error => {
      const result = error.result;
      //console.log(result);
      if (!result.success) {
        emailInput.classList.add('invalid');
        passwordInput.classList.add('invalid');
        loginAttempts++;
        if (loginAttempts >= 3) {
          alert('Ascetic attempts again try later!');
          window.history.back(); 
        }
      }
    }
  );

  const submitButton = document.getElementById('submitButton');
  submitButton.addEventListener('click', handleSubmit);
});
