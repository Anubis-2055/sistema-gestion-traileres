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

const API_CARGAS = '/api/cargas';
const API_RUTAS = '/api/rutas';

const tablaBody = document.getElementById('tablaBody');
const modal = document.getElementById('modal');
const modalEstado = document.getElementById('modalEstado');
const mensaje = document.getElementById('mensaje');
const form = document.getElementById('cargaForm');
const estadoForm = document.getElementById('estadoForm');
const selectRuta = document.getElementById('idRuta');

let rutaIdActual = null;

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

async function cargarRutasSelect() {
    const res = await fetch(API_RUTAS, { headers: headers() });
    const rutas = await res.json();

    selectRuta.innerHTML = rutas
        .filter(r => r.estado === 'ACTIVA')
        .map(r => `<option value="${r.idRuta}">Ruta #${r.idRuta} (${r.origen} → ${r.destino})</option>`)
        .join('');
}

async function cargarCargas() {
    const res = await fetch(API_CARGAS, { headers: headers() });

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
            <td>Ruta #${c.idRuta}</td>
            <td>${c.descripcion || '-'}</td>
            <td>${c.peso}</td>
            <td><span class="badge ${c.estado}">${c.estado}</span></td>
            <td>
                <button class="btn-icon" onclick="abrirCambioEstado(${c.idCarga})" title="Actualizar estado">🔄</button>
                <button class="btn-icon" onclick="eliminarCarga(${c.idCarga})" title="Eliminar">🗑️</button>
            </td>
        `;
        tablaBody.appendChild(fila);
    });
}

document.getElementById('btnNuevo').addEventListener('click', async () => {
    form.reset();
    await cargarRutasSelect();
    modal.classList.add('activo');
});

document.getElementById('btnCancelar').addEventListener('click', () => {
    modal.classList.remove('activo');
});

document.getElementById('btnCancelarEstado').addEventListener('click', () => {
    modalEstado.classList.remove('activo');
});

function abrirCambioEstado(id) {
    rutaIdActual = id;
    modalEstado.classList.add('activo');
}

async function eliminarCarga(id) {
    if (!confirm('¿Seguro que quieres eliminar esta carga?')) return;

    const res = await fetch(`${API_CARGAS}/${id}`, { method: 'DELETE', headers: headers() });
    const texto = await res.text();

    if (!res.ok) {
        mostrarMensaje(texto, 'error');
        return;
    }

    mostrarMensaje(texto, 'exito');
    cargarCargas();
}

form.addEventListener('submit', async function (e) {
    e.preventDefault();

    const body = {
        idRuta: parseInt(selectRuta.value),
        descripcion: document.getElementById('descripcion').value,
        peso: parseFloat(document.getElementById('peso').value)
    };

    const res = await fetch(API_CARGAS, { method: 'POST', headers: headers(), body: JSON.stringify(body) });

    if (!res.ok) {
        const errorTexto = await res.text();
        mostrarMensaje(errorTexto, 'error');
        return;
    }

    mostrarMensaje('Carga registrada correctamente', 'exito');
    modal.classList.remove('activo');
    cargarCargas();
});

estadoForm.addEventListener('submit', async function (e) {
    e.preventDefault();

    const nuevoEstado = document.getElementById('nuevoEstado').value;

    const res = await fetch(`${API_CARGAS}/${rutaIdActual}/estado`, {
        method: 'PUT',
        headers: headers(),
        body: JSON.stringify({ estado: nuevoEstado })
    });

    if (!res.ok) {
        const errorTexto = await res.text();
        mostrarMensaje(errorTexto, 'error');
        return;
    }

    mostrarMensaje('Estado actualizado correctamente', 'exito');
    modalEstado.classList.remove('activo');
    cargarCargas();
});

// Carga inicial
cargarCargas();