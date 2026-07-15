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

const API_RUTAS = '/api/rutas';
const API_TRAILERES = '/api/traileres';
const API_CONDUCTORES = '/api/conductores';

const tablaBody = document.getElementById('tablaBody');
const modal = document.getElementById('modal');
const mensaje = document.getElementById('mensaje');
const form = document.getElementById('rutaForm');
const selectTrailer = document.getElementById('idTrailer');
const selectConductor = document.getElementById('idConductor');

let traileresMap = {};
let conductoresMap = {};

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

// Carga tráileres y conductores DISPONIBLES para llenar los selects del formulario
async function cargarSelects() {
    const [resTrailer, resConductor] = await Promise.all([
        fetch(API_TRAILERES, { headers: headers() }),
        fetch(API_CONDUCTORES, { headers: headers() })
    ]);

    const traileres = await resTrailer.json();
    const conductores = await resConductor.json();

    // Guardamos mapas id -> texto, para mostrarlos despues en la tabla
    traileres.forEach(t => traileresMap[t.idTrailer] = t.placa + ' - ' + t.marca);
    conductores.forEach(c => conductoresMap[c.idConductor] = c.nombres + ' ' + c.apellidos);

    selectTrailer.innerHTML = traileres
        .filter(t => t.estado === 'DISPONIBLE')
        .map(t => `<option value="${t.idTrailer}">${t.placa} - ${t.marca} ${t.modelo}</option>`)
        .join('');

    selectConductor.innerHTML = conductores
        .filter(c => c.estado === 'DISPONIBLE')
        .map(c => `<option value="${c.idConductor}">${c.nombres} ${c.apellidos}</option>`)
        .join('');
}

async function cargarRutas() {
    const res = await fetch(API_RUTAS, { headers: headers() });

    if (res.status === 401) {
        sessionStorage.clear();
        window.location.href = '/login.html';
        return;
    }

    const data = await res.json();
    tablaBody.innerHTML = '';

    data.forEach(r => {
        const fila = document.createElement('tr');
        const nombreTrailer = traileresMap[r.idTrailer] || ('Trailer #' + r.idTrailer);
        const nombreConductor = conductoresMap[r.idConductor] || ('Conductor #' + r.idConductor);

        let acciones = '';
        if (r.estado === 'ACTIVA') {
            acciones = `
                <button class="btn-icon" onclick="finalizarRuta(${r.idRuta})" title="Finalizar">✅</button>
                <button class="btn-icon" onclick="cancelarRuta(${r.idRuta})" title="Cancelar">❌</button>
            `;
        } else {
            acciones = '-';
        }

        fila.innerHTML = `
            <td>${nombreTrailer}</td>
            <td>${nombreConductor}</td>
            <td>${r.origen}</td>
            <td>${r.destino}</td>
            <td><span class="badge ${r.estado}">${r.estado}</span></td>
            <td>${acciones}</td>
        `;
        tablaBody.appendChild(fila);
    });
}

document.getElementById('btnNuevo').addEventListener('click', async () => {
    form.reset();
    await cargarSelects(); // recarga disponibles cada vez que se abre el formulario
    modal.classList.add('activo');
});

document.getElementById('btnCancelar').addEventListener('click', () => {
    modal.classList.remove('activo');
});

async function finalizarRuta(id) {
    if (!confirm('¿Finalizar esta ruta?')) return;

    const res = await fetch(`${API_RUTAS}/${id}/finalizar`, { method: 'PUT', headers: headers() });
    const data = await res.text();

    if (!res.ok) {
        mostrarMensaje(data, 'error');
        return;
    }

    mostrarMensaje('Ruta finalizada correctamente', 'exito');
    await cargarSelects();
    cargarRutas();
}

async function cancelarRuta(id) {
    if (!confirm('¿Cancelar esta ruta?')) return;

    const res = await fetch(`${API_RUTAS}/${id}/cancelar`, { method: 'PUT', headers: headers() });
    const data = await res.text();

    if (!res.ok) {
        mostrarMensaje(data, 'error');
        return;
    }

    mostrarMensaje('Ruta cancelada correctamente', 'exito');
    await cargarSelects();
    cargarRutas();
}

form.addEventListener('submit', async function (e) {
    e.preventDefault();

    const body = {
        idTrailer: parseInt(selectTrailer.value),
        idConductor: parseInt(selectConductor.value),
        origen: document.getElementById('origen').value,
        destino: document.getElementById('destino').value
    };

    const res = await fetch(API_RUTAS, { method: 'POST', headers: headers(), body: JSON.stringify(body) });

    if (!res.ok) {
        const errorTexto = await res.text();
        mostrarMensaje(errorTexto, 'error');
        return;
    }

    mostrarMensaje('Ruta creada correctamente', 'exito');
    modal.classList.remove('activo');
    await cargarSelects();
    cargarRutas();
});

// Carga inicial
(async () => {
    await cargarSelects();
    cargarRutas();
})();