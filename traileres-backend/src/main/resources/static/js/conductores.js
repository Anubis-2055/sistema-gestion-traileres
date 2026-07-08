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

const API_URL = '/api/conductores';
const tablaBody = document.getElementById('tablaBody');
const modal = document.getElementById('modal');
const modalTitulo = document.getElementById('modalTitulo');
const mensaje = document.getElementById('mensaje');
const form = document.getElementById('conductorForm');

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

async function cargarConductores() {
    const res = await fetch(API_URL, { headers: headers() });

    if (res.status === 401) {
        sessionStorage.clear();
        window.location.href = '/login.html';
        return;
    }

    const data = await res.json();
    tablaBody.innerHTML = '';

    data.forEach(c => {
        const fila = document.createElement('tr');
        fila.innerHTML = `
            <td>${c.cedula}</td>
            <td>${c.nombres}</td>
            <td>${c.apellidos}</td>
            <td>${c.licencia}</td>
            <td>${c.telefono || '-'}</td>
            <td><span class="badge ${c.estado}">${c.estado}</span></td>
            <td>
                <button class="btn-icon" onclick="editarConductor(${c.idConductor})" title="Editar">✏️</button>
                <button class="btn-icon" onclick="eliminarConductor(${c.idConductor})" title="Eliminar">🗑️</button>
            </td>
        `;
        tablaBody.appendChild(fila);
    });
}

document.getElementById('btnNuevo').addEventListener('click', () => {
    form.reset();
    document.getElementById('idConductor').value = '';
    modalTitulo.textContent = 'Nuevo Conductor';
    modal.classList.add('activo');
});

document.getElementById('btnCancelar').addEventListener('click', () => {
    modal.classList.remove('activo');
});

async function editarConductor(id) {
    const res = await fetch(`${API_URL}/${id}`, { headers: headers() });
    const c = await res.json();

    document.getElementById('idConductor').value = c.idConductor;
    document.getElementById('cedula').value = c.cedula;
    document.getElementById('nombres').value = c.nombres;
    document.getElementById('apellidos').value = c.apellidos;
    document.getElementById('licencia').value = c.licencia;
    document.getElementById('telefono').value = c.telefono || '';
    document.getElementById('estado').value = c.estado;

    modalTitulo.textContent = 'Editar Conductor';
    modal.classList.add('activo');
}

async function eliminarConductor(id) {
    if (!confirm('¿Seguro que quieres eliminar este conductor?')) return;

    const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE', headers: headers() });
    const texto = await res.text();

    if (!res.ok) {
        mostrarMensaje(texto, 'error');
        return;
    }

    mostrarMensaje(texto, 'exito');
    cargarConductores();
}

form.addEventListener('submit', async function (e) {
    e.preventDefault();

    const id = document.getElementById('idConductor').value;
    const body = {
        cedula: document.getElementById('cedula').value,
        nombres: document.getElementById('nombres').value,
        apellidos: document.getElementById('apellidos').value,
        licencia: document.getElementById('licencia').value,
        telefono: document.getElementById('telefono').value,
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

    mostrarMensaje(id ? 'Conductor actualizado correctamente' : 'Conductor creado correctamente', 'exito');
    modal.classList.remove('activo');
    cargarConductores();
});

cargarConductores();