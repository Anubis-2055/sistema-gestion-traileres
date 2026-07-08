document.getElementById('loginForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const errorMsg = document.getElementById('errorMsg');

    errorMsg.textContent = '';

    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        if (!response.ok) {
            const errorText = await response.text();
            errorMsg.textContent = errorText || 'Usuario o contraseña incorrectos';
            return;
        }

        const data = await response.json();

        // Guardamos el token y datos del usuario para usarlos en el menú
        sessionStorage.setItem('token', data.token);
        sessionStorage.setItem('username', data.username);
        sessionStorage.setItem('rol', data.rol);

        window.location.href = '/menu.html';

    } catch (err) {
        errorMsg.textContent = 'No se pudo conectar con el servidor';
        console.error(err);
    }
});