// Verifica que haya sesión activa; si no, redirige al login
const token = sessionStorage.getItem('token');
const username = sessionStorage.getItem('username');
const rol = sessionStorage.getItem('rol');

if (!token) {
    window.location.href = '/login.html';
}

document.getElementById('userLabel').textContent = `${username} (${rol})`;

document.getElementById('logoutBtn').addEventListener('click', function () {
    sessionStorage.clear();
    window.location.href = '/login.html';
});