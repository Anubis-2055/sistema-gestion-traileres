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
let rutasData = [];
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
    rutasData = data;
    tablaBody.innerHTML = '';

    data.forEach(r => {
        const fila = document.createElement('tr');
        const nombreTrailer = traileresMap[r.idTrailer] || ('Trailer #' + r.idTrailer);
        const nombreConductor = conductoresMap[r.idConductor] || ('Conductor #' + r.idConductor);

        let acciones = `
            <button class="btn-icon" onclick="verMapa('${r.origen}', '${r.destino}')" title="Ver mapa">🗺️</button>
            <button class="btn-icon" onclick="generarInforme(${r.idRuta})" title="Generar informe">📄</button>
        `;
        if (r.estado === 'ACTIVA') {
            acciones += `
                <button class="btn-icon" onclick="finalizarRuta(${r.idRuta})" title="Finalizar">✅</button>
                <button class="btn-icon" onclick="cancelarRuta(${r.idRuta})" title="Cancelar">❌</button>
            `;
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
let mapaInstancia = null;

async function geocodificar(lugar) {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(lugar)}&limit=1`;
    const res = await fetch(url, { headers: { 'Accept-Language': 'es' } });
    const data = await res.json();

    if (data.length === 0) {
        throw new Error(`No se encontró la ubicación: ${lugar}`);
    }

    return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon), nombre: data[0].display_name };
}

async function verMapa(origen, destino) {
    const modalMapa = document.getElementById('modalMapa');
    const info = document.getElementById('mapaInfo');
    const contenedor = document.getElementById('mapaContenedor');

    modalMapa.classList.add('activo');
    info.textContent = 'Calculando ruta...';

    // Si ya habia un mapa dibujado antes, lo destruimos para crear uno limpio
    if (mapaInstancia) {
        mapaInstancia.remove();
        mapaInstancia = null;
    }

    try {
        // 1. Convertir los nombres de texto en coordenadas
        const puntoOrigen = await geocodificar(origen);
        const puntoDestino = await geocodificar(destino);

        // 2. Pedir la ruta real entre esos 2 puntos (servidor gratuito OSRM)
        const urlRuta = `https://router.project-osrm.org/route/v1/driving/${puntoOrigen.lon},${puntoOrigen.lat};${puntoDestino.lon},${puntoDestino.lat}?overview=full&geometries=geojson`;
        const resRuta = await fetch(urlRuta);
        const dataRuta = await resRuta.json();

        if (!dataRuta.routes || dataRuta.routes.length === 0) {
            throw new Error('No se pudo calcular una ruta por carretera entre esos puntos');
        }

        const ruta = dataRuta.routes[0];
        const distanciaKm = (ruta.distance / 1000).toFixed(1);
        const horas = Math.floor(ruta.duration / 3600);
        const minutos = Math.round((ruta.duration % 3600) / 60);

        info.textContent = `📏 Distancia: ${distanciaKm} km  —  ⏱️ Tiempo estimado: ${horas > 0 ? horas + 'h ' : ''}${minutos} min`;

        // 3. Dibujar el mapa
        mapaInstancia = L.map(contenedor).setView([puntoOrigen.lat, puntoOrigen.lon], 7);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(mapaInstancia);

        // Convertir las coordenadas de la ruta (vienen como [lon, lat]) al formato de Leaflet [lat, lon]
        const coordenadas = ruta.geometry.coordinates.map(c => [c[1], c[0]]);
        L.polyline(coordenadas, { color: '#14b8a6', weight: 4 }).addTo(mapaInstancia);

        L.marker([puntoOrigen.lat, puntoOrigen.lon]).addTo(mapaInstancia).bindPopup('Origen: ' + origen);
        L.marker([puntoDestino.lat, puntoDestino.lon]).addTo(mapaInstancia).bindPopup('Destino: ' + destino);

        mapaInstancia.fitBounds(coordenadas);

    } catch (err) {
        info.textContent = '⚠️ ' + err.message;
        console.error(err);
    }
}

document.getElementById('btnCerrarMapa').addEventListener('click', () => {
    document.getElementById('modalMapa').classList.remove('activo');
});
async function generarInforme(idRuta) {
    const ruta = rutasData.find(r => r.idRuta === idRuta);
    if (!ruta) return;

    const nombreTrailer = traileresMap[ruta.idTrailer] || ('Trailer #' + ruta.idTrailer);
    const nombreConductor = conductoresMap[ruta.idConductor] || ('Conductor #' + ruta.idConductor);

    try {
        const puntoOrigen = await geocodificar(ruta.origen);
        const puntoDestino = await geocodificar(ruta.destino);

        const urlRutaCalc = `https://router.project-osrm.org/route/v1/driving/${puntoOrigen.lon},${puntoOrigen.lat};${puntoDestino.lon},${puntoDestino.lat}?overview=full&geometries=geojson`;
        const resRuta = await fetch(urlRutaCalc);
        const dataRuta = await resRuta.json();
        const rutaCalc = dataRuta.routes[0];

        const distanciaKm = (rutaCalc.distance / 1000).toFixed(1);
        const horas = Math.floor(rutaCalc.duration / 3600);
        const minutos = Math.round((rutaCalc.duration % 3600) / 60);
        const tiempoTexto = `${horas > 0 ? horas + 'h ' : ''}${minutos} min`;
        const fechaHoy = new Date().toLocaleDateString('es-EC', { year: 'numeric', month: 'long', day: 'numeric' });

        // Coordenadas de la ruta dibujada, en formato [lat, lon] para Leaflet
        const coordenadas = rutaCalc.geometry.coordinates.map(c => [c[1], c[0]]);

        const ventana = window.open('', '_blank');
        ventana.document.write(`
            <html><head><title>Informe de Viaje - Ruta #${ruta.idRuta}</title>
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css">
            <script src="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js"></script>
            <style>
                body { font-family: Arial, sans-serif; padding: 30px; color:#0f1729; }
                h1 { font-size: 20px; border-bottom: 3px solid #14b8a6; padding-bottom: 10px; }
                .contenedor { display:flex; gap:24px; margin-top:20px; }
                .datos { flex:1; }
                .mapa { flex:1; }
                #mapaInforme { width:100%; height:350px; border-radius:8px; border:1px solid #ccc; }
                table { width:100%; border-collapse: collapse; margin-top:10px; }
                td { padding:8px; border-bottom:1px solid #eee; font-size:14px; }
                td.label { font-weight:bold; width:40%; color:#333; }
                .footer { margin-top:30px; font-size:12px; color:#888; text-align:center; }
                .btn-imprimir {
                    background: #14b8a6; color: white; border: none;
                    padding: 12px 20px; border-radius: 6px; font-size: 15px;
                    font-weight: 600; cursor: pointer; margin-top: 20px;
                }
                .btn-imprimir:hover { background: #0f9488; }
                @media print {
                    .btn-imprimir { display: none; }
                }
            </style>
            </head><body>
                <h1>🚛 Informe de Viaje — Ruta #${ruta.idRuta}</h1>
                <p>Sistema de Gestión de Tráileres — Generado el ${fechaHoy}</p>
                <div class="contenedor">
                    <div class="datos">
                        <table>
                            <tr><td class="label">Conductor</td><td>${nombreConductor}</td></tr>
                            <tr><td class="label">Tráiler</td><td>${nombreTrailer}</td></tr>
                            <tr><td class="label">Origen</td><td>${ruta.origen}</td></tr>
                            <tr><td class="label">Destino</td><td>${ruta.destino}</td></tr>
                            <tr><td class="label">Distancia</td><td>${distanciaKm} km</td></tr>
                            <tr><td class="label">Tiempo estimado</td><td>${tiempoTexto}</td></tr>
                            <tr><td class="label">Estado</td><td>${ruta.estado}</td></tr>
                        </table>
                    </div>
                    <div class="mapa">
                        <div id="mapaInforme"></div>
                    </div>
                </div>
                <button onclick="window.print()" class="btn-imprimir">🖨️ Imprimir / Guardar como PDF</button>
                <div class="footer">Documento generado automáticamente — Sistema de Gestión de Tráileres, UTEQ</div>
                <script>
                    window.onload = () => {
                        const mapa = L.map('mapaInforme');
                        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                            attribution: '© OpenStreetMap contributors'
                        }).addTo(mapa);

                        const coords = ${JSON.stringify(coordenadas)};
                        L.polyline(coords, { color: '#14b8a6', weight: 4 }).addTo(mapa);
                        L.marker(coords[0]).addTo(mapa).bindPopup('Origen: ${ruta.origen}');
                        L.marker(coords[coords.length - 1]).addTo(mapa).bindPopup('Destino: ${ruta.destino}');
                        mapa.fitBounds(coords);

                        
                    };
                </script>
            </body></html>
        `);
        ventana.document.close();

    } catch (err) {
        alert('No se pudo generar el informe: ' + err.message);
        console.error(err);
    }
}
