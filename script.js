/* ==========================================
   CRM PREMIUM V2 - JS FINAL CORREGIDO
========================================== */

/* ---------- STORAGE ---------- */
let clientes =
    JSON.parse(localStorage.getItem("crm_clientes")) || [];

let ventas =
    JSON.parse(localStorage.getItem("crm_ventas")) || [];

/* ---------- VARIABLES ---------- */
let clienteActual = null;
let grafica = null;

/* ==========================================
   GUARDAR DATOS
========================================== */
function guardarDatos() {
    localStorage.setItem(
        "crm_clientes",
        JSON.stringify(clientes)
    );

    localStorage.setItem(
        "crm_ventas",
        JSON.stringify(ventas)
    );
}

/* ==========================================
   CAMBIAR VISTA
========================================== */
function cambiarVista(idVista) {

    const vistas =
        document.querySelectorAll(".vista");

    vistas.forEach(vista => {
        vista.classList.remove("activa");
    });

    document
        .getElementById(idVista)
        .classList.add("activa");
}

/* ==========================================
   TOAST
========================================== */
function mostrarToast(texto) {

    const toast =
        document.getElementById("toast");

    toast.textContent = texto;
    toast.classList.add("show");

    setTimeout(() => {
        toast.classList.remove("show");
    }, 2200);
}

/* ==========================================
   VALIDACIONES
========================================== */
function emailValido(email) {
    return /\S+@\S+\.\S+/.test(email);
}

function telefonoValido(telefono) {
    return /^\d{10}$/.test(telefono);
}

/* ==========================================
   CLIENTES
========================================== */
function agregarCliente() {

    const nombre =
        document.getElementById("nombre")
        .value.trim();

    const apellidos =
        document.getElementById("apellidos")
        .value.trim();

    const telefono =
        document.getElementById("telefono")
        .value.trim();

    const email =
        document.getElementById("email")
        .value.trim();

    /* obligatorios */
    if (
        !nombre ||
        !apellidos ||
        !telefono ||
        !email
    ) {
        mostrarToast("Completa todos los campos");
        return;
    }

    /* validar telefono */
    if (!telefonoValido(telefono)) {
        mostrarToast("Teléfono inválido");
        return;
    }

    /* validar email */
    if (!emailValido(email)) {
        mostrarToast("Correo inválido");
        return;
    }

    /* duplicados */
    const existe = clientes.some(cliente =>
        cliente.telefono === telefono ||
        cliente.email.toLowerCase() ===
        email.toLowerCase()
    );

    if (existe) {
        mostrarToast("Cliente ya registrado");
        return;
    }

    /* guardar */
    clientes.push({
        id: Date.now(),
        nombre,
        apellidos,
        telefono,
        email
    });

    guardarDatos();
    limpiarFormulario();
    renderClientes();
    actualizarDashboard();

    mostrarToast("Cliente agregado");
}

/* ---------- limpiar ---------- */
function limpiarFormulario() {

    document.getElementById("nombre").value = "";
    document.getElementById("apellidos").value = "";
    document.getElementById("telefono").value = "";
    document.getElementById("email").value = "";
}

/* ---------- render ---------- */
function renderClientes() {

    const lista =
        document.getElementById("listaClientes");

    const texto =
        document.getElementById("buscarCliente")
        .value
        .toLowerCase();

    lista.innerHTML = "";

    const filtrados = clientes.filter(cliente => {

        const nombreCompleto =
            `${cliente.nombre} ${cliente.apellidos}`
            .toLowerCase();

        return nombreCompleto.includes(texto);
    });

    if (filtrados.length === 0) {
        lista.innerHTML =
            `<p class="mensaje-vacio">
                No hay clientes
             </p>`;
        return;
    }

    filtrados.forEach(cliente => {

        const card =
            document.createElement("div");

        card.classList.add("cliente-card");

        card.innerHTML = `
            <h3>
                ${cliente.nombre}
                ${cliente.apellidos}
            </h3>

            <p>📞 ${cliente.telefono}</p>
            <p>📧 ${cliente.email}</p>

            <div class="acciones">

                <button
                    onclick="editarCliente(${cliente.id})">
                    Editar
                </button>

                <button
                    onclick="eliminarCliente(${cliente.id})">
                    Eliminar
                </button>

            </div>
        `;

        lista.appendChild(card);
    });
}

/* ---------- editar ---------- */
function editarCliente(id) {

    const cliente =
        clientes.find(c => c.id === id);

    const nuevoNombre =
        prompt(
            "Nuevo nombre:",
            cliente.nombre
        );

    if (!nuevoNombre) return;

    cliente.nombre = nuevoNombre.trim();

    guardarDatos();
    renderClientes();

    mostrarToast("Cliente actualizado");
}

/* ---------- eliminar ---------- */
function eliminarCliente(id) {

    if (!confirm("¿Eliminar cliente?")) return;

    clientes = clientes.filter(
        c => c.id !== id
    );

    ventas = ventas.filter(
        v => v.clienteId !== id
    );

    guardarDatos();

    renderClientes();
    renderVentas();
    actualizarDashboard();

    mostrarToast("Cliente eliminado");
}

/* ==========================================
   BUSCAR CLIENTE EN VENTAS
========================================== */
function buscarClienteVenta() {

    const texto =
        document
        .getElementById("buscarVentaCliente")
        .value
        .toLowerCase();

    const resultados =
        document
        .getElementById("resultadosBusqueda");

    resultados.innerHTML = "";

    if (texto === "") return;

    const encontrados =
        clientes.filter(cliente => {

            const nombreCompleto =
                `${cliente.nombre}
                 ${cliente.apellidos}`
                .toLowerCase();

            return nombreCompleto.includes(texto);
        });

    encontrados.forEach(cliente => {

        const div =
            document.createElement("div");

        div.classList.add("resultado-item");

        div.textContent =
            `${cliente.nombre}
             ${cliente.apellidos}`;

        div.onclick = () =>
            seleccionarCliente(cliente);

        resultados.appendChild(div);
    });
}

/* ---------- seleccionar ---------- */
function seleccionarCliente(cliente) {

    clienteActual = cliente;

    document
        .getElementById("clienteBadge")
        .textContent =
        `Cliente: ${cliente.nombre} ${cliente.apellidos}`;

    document
        .getElementById("buscarVentaCliente")
        .value = "";

    document
        .getElementById("resultadosBusqueda")
        .innerHTML = "";
}

/* ==========================================
   REGISTRAR VENTA
========================================== */
function registrarVenta() {

    const monto =
        Number(
            document
            .getElementById("montoVenta")
            .value
        );

    if (!clienteActual) {
        mostrarToast("Selecciona cliente");
        return;
    }

    if (!monto || monto <= 0) {
        mostrarToast("Monto inválido");
        return;
    }

    ventas.push({
        id: Date.now(),
        clienteId: clienteActual.id,
        monto,
        fecha: new Date().toISOString()
    });

    guardarDatos();

    document
        .getElementById("montoVenta")
        .value = "";

    document
        .getElementById("clienteBadge")
        .textContent =
        "Ningún cliente seleccionado";

    clienteActual = null;

    renderVentas();
    actualizarDashboard();

    mostrarToast("Venta registrada");
}

/* ==========================================
   RENDER VENTAS
========================================== */
function renderVentas() {

    const lista =
        document.getElementById("listaVentas");

    lista.innerHTML = "";

    if (ventas.length === 0) {
        lista.innerHTML =
            `<p class="mensaje-vacio">
                No hay ventas
             </p>`;
        return;
    }

    const ordenadas =
        [...ventas].reverse();

    ordenadas.forEach(venta => {

        const cliente =
            clientes.find(
                c => c.id === venta.clienteId
            );

        const card =
            document.createElement("div");

        card.classList.add("venta-card");

        card.innerHTML = `
            <h3>
                ${
                    cliente
                    ? cliente.nombre +
                      " " +
                      cliente.apellidos
                    : "Cliente eliminado"
                }
            </h3>

            <p>
                Venta:
                $${venta.monto.toLocaleString()}
            </p>

            <small>
                ${
                    new Date(
                        venta.fecha
                    ).toLocaleDateString()
                }
            </small>
        `;

        lista.appendChild(card);
    });
}

/* ==========================================
   DASHBOARD
========================================== */
function actualizarDashboard() {

    const total =
        ventas.reduce(
            (acc, venta) =>
                acc + venta.monto,
            0
        );

    const promedio =
        ventas.length > 0
        ? total / ventas.length
        : 0;

    const ultima =
        ventas.length > 0
        ? ventas[ventas.length - 1].monto
        : 0;

    document
        .getElementById("totalVentas")
        .textContent =
        "$" + total.toLocaleString();

    document
        .getElementById("totalClientes")
        .textContent =
        clientes.length;

    document
        .getElementById("ticketPromedio")
        .textContent =
        "$" + promedio.toFixed(0);

    document
        .getElementById("ultimaVenta")
        .textContent =
        "$" + ultima.toLocaleString();

    actualizarGrafica();
}

/* ==========================================
   GRAFICA POR MES
========================================== */
function actualizarGrafica() {

    const meses = {
        Ene:0, Feb:0, Mar:0,
        Abr:0, May:0, Jun:0,
        Jul:0, Ago:0, Sep:0,
        Oct:0, Nov:0, Dic:0
    };

    ventas.forEach(venta => {

        const fecha =
            new Date(venta.fecha);

        const mes =
            fecha.getMonth();

        const nombres =
            Object.keys(meses);

        meses[nombres[mes]] +=
            venta.monto;
    });

    const ctx =
        document.getElementById(
            "graficaVentas"
        );

    if (grafica) grafica.destroy();

    grafica = new Chart(ctx, {

        type: "bar",

        data: {
            labels:
                Object.keys(meses),

            datasets: [{
                label: "Ventas",
                data:
                    Object.values(meses),
                borderWidth: 1
            }]
        },

        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });
}

/* ==========================================
   INICIO
========================================== */
renderClientes();
renderVentas();
actualizarDashboard();