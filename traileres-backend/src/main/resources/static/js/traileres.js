// Verifica sesión
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

const API_URL = '/api/traileres';
const tablaBody = document.getElementById('tablaBody');
const modal = document.getElementById('modal');
const modalTitulo = document.getElementById('modalTitulo');
const mensaje = document.getElementById('mensaje');
const form = document.getElementById('trailerForm');

// Headers con token para todas las peticiones
function headers() {
    return {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
    };
}

function mostrarMensaje(texto, tipo) {
    mensaje.textContent = texto;
    mensaje.className = 'mensaje ' + tipo;
    setTimeout(() => { mensaje.className = 'mensaje'; }, 4000);
}

// Cargar y pintar la tabla
async function cargarTraileres() {
    const res = await fetch(API_URL, { headers: headers() });

    if (res.status === 401) {
        sessionStorage.clear();
        window.location.href = '/login.html';
        return;
    }

    const data = await res.json();
    tablaBody.innerHTML = '';

    data.forEach(t => {
        const fila = document.createElement('tr');
        fila.innerHTML = `
            <td>${t.placa}</td>
            <td>${t.marca}</td>
            <td>${t.modelo}</td>
            <td>${t.capacidad}</td>
            <td><span class="badge ${t.estado}">${t.estado}</span></td>
            <td>
                <button class="btn-icon" onclick="editarTrailer(${t.idTrailer})" title="Editar">✏️</button>
                <button class="btn-icon" onclick="eliminarTrailer(${t.idTrailer})" title="Eliminar">🗑️</button>
            </td>
        `;
        tablaBody.appendChild(fila);
    });
}

// Abrir modal para nuevo tráiler
document.getElementById('btnNuevo').addEventListener('click', () => {
    form.reset();
    document.getElementById('idTrailer').value = '';
    modalTitulo.textContent = 'Nuevo Tráiler';
    modal.classList.add('activo');
});

document.getElementById('btnCancelar').addEventListener('click', () => {
    modal.classList.remove('activo');
});

// Editar: carga los datos del trailer en el formulario
async function editarTrailer(id) {
    const res = await fetch(`${API_URL}/${id}`, { headers: headers() });
    const t = await res.json();

    document.getElementById('idTrailer').value = t.idTrailer;
    document.getElementById('placa').value = t.placa;
    document.getElementById('marca').value = t.marca;
    document.getElementById('modelo').value = t.modelo;
    document.getElementById('capacidad').value = t.capacidad;
    document.getElementById('toneladas').value = t.toneladas || '';
    document.getElementById('estado').value = t.estado;

    modalTitulo.textContent = 'Editar Tráiler';
    modal.classList.add('activo');
}

// Eliminar
async function eliminarTrailer(id) {
    if (!confirm('¿Seguro que quieres eliminar este tráiler?')) return;

    const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE', headers: headers() });
    const texto = await res.text();

    if (!res.ok) {
        mostrarMensaje(texto, 'error');
        return;
    }

    mostrarMensaje(texto, 'exito');
    cargarTraileres();
}

// Guardar (crear o actualizar según si hay id)
form.addEventListener('submit', async function (e) {
    e.preventDefault();

    const id = document.getElementById('idTrailer').value;
    const body = {
        placa: document.getElementById('placa').value,
        marca: document.getElementById('marca').value,
        modelo: document.getElementById('modelo').value,
        capacidad: parseFloat(document.getElementById('capacidad').value),
        toneladas: parseFloat(document.getElementById('toneladas').value) || null,
        estado: document.getElementById('estado').value
    };

    const url = id ? `${API_URL}/${id}` : API_URL;
    const method = id ? 'PUT' : 'POST';

    const res = await fetch(url, { method, headers: headers(), body: JSON.stringify(body) });

    if (!res.ok) {
        const errorTexto = await res.text();
        mostrarMensaje(errorTexto, 'error');
        return;
    }

    mostrarMensaje(id ? 'Tráiler actualizado correctamente' : 'Tráiler creado correctamente', 'exito');
    modal.classList.remove('activo');
    cargarTraileres();
});

// Carga inicial
cargarTraileres();