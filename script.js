// Variables principales
let materias = ["Castellano","Gallego","Inglés","Filosofía","Matemáticas","Historia de España","Geografía","Historia del Arte","Economía","Música","Métodos","Religión","Refuerzo"];
let votosFav = {};
let votosEliminar = {};
let favSeleccionada = '';
let historialSemanas = JSON.parse(localStorage.getItem('historialSemanas')) || [];
let eliminadas = JSON.parse(localStorage.getItem('eliminadas')) || [];
let ultimaFecha = localStorage.getItem('ultimaFecha') || null;

// Determinar la semana actual
let semanaActual = historialSemanas.length; // 0 = primera semana

// Mostrar pantalla
function mostrarPantalla(id) {
    document.querySelectorAll('.pantalla').forEach(p => p.classList.remove('activo'));
    document.getElementById(id).classList.add('activo');
}

// Limitar voto diario
function votoPermitido() {
    const hoy = new Date().toISOString().split('T')[0];
    if (ultimaFecha === hoy) return false;
    localStorage.setItem('ultimaFecha', hoy);
    return true;
}

// Pantalla origen
document.getElementById('origen-ciencias').addEventListener('click', ()=>{ guardarOrigen('Ciencias'); });
document.getElementById('origen-sociales').addEventListener('click', ()=>{ guardarOrigen('Sociales/Latín'); });

function guardarOrigen(opcion) {
    if (!votoPermitido()) return alert("Ya has votado hoy");
    mostrarPantalla('pantalla-fav');
    mostrarOpcionesFav();
}

// Mostrar opciones de "Vota por tu fav de la semana"
function mostrarOpcionesFav() {
    const div = document.getElementById('opciones-fav');
    div.innerHTML = '';

    materias.forEach(m => {
        if (eliminadas.includes(m)) return; // no mostrar eliminadas
        const btn = document.createElement('button');
        btn.textContent = m;
        btn.addEventListener('click', ()=>{
            if (!votoPermitido()) return alert("Ya has votado hoy");
            favSeleccionada = m;
            votosFav[m] = (votosFav[m] || 0) + 1;
            mostrarPantalla('pantalla-eliminar');
            mostrarOpcionesEliminar();
        });
        div.appendChild(btn);
    });
}

// Mostrar opciones de "Vota para eliminar"
function mostrarOpcionesEliminar() {
    const div = document.getElementById('opciones-eliminar');
    div.innerHTML = '';

    materias.filter(m => m !== favSeleccionada && !eliminadas.includes(m))
        .forEach(m => {
            const btn = document.createElement('button');
            btn.textContent = m;
            btn.addEventListener('click', ()=>{
                if (!votoPermitido()) return alert("Ya has votado hoy");
                votosEliminar[m] = (votosEliminar[m] || 0) + 1;

                if (semanaActual === 0) {
                    // Primera semana: Salvar y Resumen no aparecen
                    historialSemanas.push({fav: favSeleccionada, votosEliminar: votosEliminar});
                    localStorage.setItem('historialSemanas', JSON.stringify(historialSemanas));
                    votosFav = {};
                    votosEliminar = {};
                    favSeleccionada = '';
                    semanaActual++;
                    mostrarPantalla('pantalla-fav'); // espera a la siguiente semana
                } else {
                    mostrarPantalla('pantalla-salvar');
                    mostrarOpcionesSalvar();
                }
            });
            div.appendChild(btn);
        });
}

// Mostrar opciones de "Salvar"
function mostrarOpcionesSalvar() {
    const div = document.getElementById('opciones-salvar');
    div.innerHTML = '';

    // Tomamos las 2 opciones más votadas de "Vota para eliminar" de la semana anterior
    let ultimaSemana = historialSemanas[historialSemanas.length - 1];
    let votos = ultimaSemana.votosEliminar;
    let top2 = Object.entries(votos).sort((a,b)=>b[1]-a[1]).slice(0,2).map(e=>e[0]);

    top2.forEach(m => {
        const btn = document.createElement('button');
        btn.textContent = m;
        btn.addEventListener('click', ()=>{
            // Más votado se salva, menos votado se elimina
            let otra = top2.find(x => x !== m);
            if (otra) eliminadas.push(otra);

            historialSemanas.push({fav: null, salvada: m, eliminado: otra});
            localStorage.setItem('historialSemanas', JSON.stringify(historialSemanas));
            localStorage.setItem('eliminadas', JSON.stringify(eliminadas));

            votosFav = {};
            votosEliminar = {};
            favSeleccionada = '';
            mostrarPantalla('pantalla-final');
            mostrarResumenSemana(m, otra);
        });
        div.appendChild(btn);
    });
}

// Mostrar resumen de la semana
function mostrarResumenSemana(fav, eliminado) {
    document.getElementById('fav-semana').textContent = fav || 'N/A';
    document.getElementById('eliminado-semana').textContent = eliminado || 'N/A';
}
