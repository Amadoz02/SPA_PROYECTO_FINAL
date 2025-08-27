import { crearItem, editarItem, eliminarItem } from '../utils/crudUtils.js';

let metodosPago = [];
let currentPage = 1;
const itemsPerPage = 10;

export default async function metodosPagoController() {
    const mainContent = document.getElementById('main-content');
    
    if (!mainContent) {
        console.error('No se encontró el contenedor principal');
        return;
    }

    // HTML de la vista de métodos de pago
    mainContent.innerHTML = `
        <div class="admin-container">
            <header class="admin-header">
                <h1>Panel de Administración - Métodos de Pago</h1>
                <nav>
                    <ul>
                        <li><a href="#listProductos">Gestionar Productos</a></li>
                        <li><a href="#listCategorias_Tallas">Categorías y Tallas</a></li>
                        <li><a href="#listUsers">Usuarios</a></li>
                        <li><a href="#listVentas">Ventas y Métodos de Pago</a></li>
                        <li><a href="#logout" id="logoutBtn">Cerrar Sesión</a></li>
                    </ul>
                </nav>
            </header>
            
            <section class="admin-section">
                <div class="section-header">
                    <h2>Gestión de Métodos de Pago</h2>
                    <button id="btnAgregarMetodo" class="btn-agregar">
                        <i class="fas fa-plus"></i> Agregar Método
                    </button>
                </div>
                
                <div class="table-container">
                    <table id="tablaMetodosPago" class="admin-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Nombre</th>
                        
                                <th>Estado</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody id="tbodyMetodosPago">
                            <!-- Los datos se cargarán dinámicamente -->
                        </tbody>
                    </table>
                </div>
                
                <div id="loadingSpinner" class="spinner" style="display: none;">Cargando...</div>
                <div id="noMetodos" class="no-compras" style="display: none;">
                    No hay métodos de pago registrados.
                </div>
                
                <div id="pagination" class="pagination" style="display: none;">
                    <button id="prevPage">Anterior</button>
                    <span id="pageInfo">Página 1 de 1</span>
                    <button id="nextPage">Siguiente</button>
                </div>
            </section>
        </div>
    `;

    // Cargar métodos de pago
    await cargarMetodosPago();

    // Event listeners
    document.getElementById('btnAgregarMetodo')?.addEventListener('click', agregarMetodoPago);
    document.getElementById('prevPage')?.addEventListener('click', () => cambiarPagina(-1));
    document.getElementById('nextPage')?.addEventListener('click', () => cambiarPagina(1));
}

async function cargarMetodosPago() {
    const loadingSpinner = document.getElementById('loadingSpinner');
    const noMetodos = document.getElementById('noMetodos');
    
    try {
        if (loadingSpinner) loadingSpinner.style.display = 'block';
        
        const response = await fetch('http://localhost:8080/helder/api/metodos/todos');
        
        if (!response.ok) {
            throw new Error('Error al cargar métodos de pago');
        }
        
        metodosPago = await response.json();
        console.log(metodosPago);
        
        if (loadingSpinner) loadingSpinner.style.display = 'none';
        
        if (metodosPago && metodosPago.length > 0) {
            renderTablaMetodosPago();
            const tabla = document.getElementById('tablaMetodosPago');
            if (tabla) tabla.style.display = 'table';
            if (noMetodos) noMetodos.style.display = 'none';
        } else {
            const tabla = document.getElementById('tablaMetodosPago');
            if (tabla) tabla.style.display = 'none';
            if (noMetodos) {
                noMetodos.style.display = 'block';
                noMetodos.textContent = 'No hay métodos de pago registrados.';
            }
        }
        
    } catch (error) {
        console.error('Error:', error);
        if (loadingSpinner) loadingSpinner.style.display = 'none';
        if (noMetodos) {
            noMetodos.style.display = 'block';
            noMetodos.textContent = 'Error al cargar métodos de pago';
        }
    }
}

function renderTablaMetodosPago() {
    const tbody = document.getElementById('tbodyMetodosPago');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedMetodos = metodosPago.slice(startIndex, endIndex);
    
    paginatedMetodos.forEach(metodo => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${metodo.id_metodo}</td>
            <td>${metodo.nombre}</td>
            
            <td>
                <span class="estado-badge ${metodo.estado === 'Activo' ? 'activo' : 'inactivo'}">
                    ${metodo.estado}
                </span>
            </td>
            <td>
                <button class=" btn-editar" onclick="editarMetodoPago(${metodo.id_metodo})">
                    ✏️
                </button>
                <button class=" btn-eliminar" onclick="eliminarMetodoPago(${metodo.id_metodo}, '${metodo.nombre}')">
                    🗑️
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
    
    actualizarPaginacion();
}

function actualizarPaginacion() {
    const pagination = document.getElementById('pagination');
    const pageInfo = document.getElementById('pageInfo');
    
    if (!pagination || !pageInfo) return;
    
    const totalPages = Math.ceil(metodosPago.length / itemsPerPage);
    
    if (totalPages > 1) {
        pagination.style.display = 'flex';
        pageInfo.textContent = `Página ${currentPage} de ${totalPages}`;
        
        const prevBtn = document.getElementById('prevPage');
        const nextBtn = document.getElementById('nextPage');
        
        if (prevBtn) prevBtn.disabled = currentPage === 1;
        if (nextBtn) nextBtn.disabled = currentPage === totalPages;
    } else {
        pagination.style.display = 'none';
    }
}

function cambiarPagina(direccion) {
    const totalPages = Math.ceil(metodosPago.length / itemsPerPage);
    const newPage = currentPage + direccion;
    
    if (newPage >= 1 && newPage <= totalPages) {
        currentPage = newPage;
        renderTablaMetodosPago();
    }
}

async function agregarMetodoPago() {
    const campos = {
        label: 'Método de Pago',
        placeholder: 'Ej: Tarjeta de Crédito, Transferencia Bancaria'
    };
    
    const success = await crearItem('metodos', campos);
    if (success) {
        await cargarMetodosPago();
    }
}

async function editarMetodoPago(id) {
    const metodo = metodosPago.find(m => m.id_metodo === id);
    if (!metodo) return;
    console.log("obj de metodos:",metodo);
    
    const success = await editarItem('metodos', metodo);
    if (success) {
        await cargarMetodosPago();
    }
}

async function eliminarMetodoPago(id, nombre) {
    const success = await eliminarItem('metodos', id, `el método de pago "${nombre}"`);
    if (success) {
        await cargarMetodosPago();
    }
}

// Exponer funciones al scope global para los event listeners onclick
window.editarMetodoPago = editarMetodoPago;
window.eliminarMetodoPago = eliminarMetodoPago;
