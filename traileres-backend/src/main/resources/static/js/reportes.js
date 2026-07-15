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

async function cargarResumen() {
    const res = await fetch('/api/reportes/resumen', {
        headers: { 'Authorization': 'Bearer ' + token }
    });

    if (res.status === 401) {
        sessionStorage.clear();
        window.location.href = '/login.html';
        return;
    }

    const data = await res.json();
    const grid = document.getElementById('reportesGrid');

    const tarjetas = [
        { numero: data.totalTraileres, etiqueta: 'Total Tráileres', link: '/traileres.html' },
        { numero: data.traileresDisponibles, etiqueta: 'Tráileres Disponibles', link: '/traileres.html' },
        { numero: data.totalConductores, etiqueta: 'Total Conductores', link: '/conductores.html' },
        { numero: data.conductoresDisponibles, etiqueta: 'Conductores Disponibles', link: '/conductores.html' },
        { numero: data.rutasActivas, etiqueta: 'Rutas Activas', link: '/rutas.html' },
        { numero: data.rutasFinalizadas, etiqueta: 'Rutas Finalizadas', link: '/rutas.html' },
        { numero: data.rutasCanceladas, etiqueta: 'Rutas Canceladas', link: '/rutas.html' },
        { numero: data.totalCargas, etiqueta: 'Total Cargas Registradas', link: '/carga.html' }
    ];

    grid.innerHTML = tarjetas.map(t => `
        <a href="${t.link}" class="reporte-card-link">
            <div class="reporte-card">
                <div class="numero">${t.numero}</div>
                <div class="etiqueta">${t.etiqueta}</div>
            </div>
        </a>
    `).join('');
}

cargarResumen();