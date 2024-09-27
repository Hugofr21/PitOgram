
function handleSubmit() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const userData = {
        email,
        password,
    };
    window.electronAPILogin.sendDataToMainCreateUser(userData);
    alert('Create new user');
}
