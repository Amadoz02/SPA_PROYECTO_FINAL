// listAllVentasController.js - Controlador para listar todas las ventas de todos los compradores
import comprasController from './compraController.js';

export default async function listAllVentasController() {
    try {
        // Obtener todos los compradores
        const response = await fetch("http://localhost:8080/helder/api/usuarios/compradores");
        const compradores = await response.json();
        
        if (!compradores || !Array.isArray(compradores)) {
            console.error("No se encontraron compradores");
            return;
        }

        // Crear contenedor principal para todas las ventas
        const $mainContainer = document.getElementById('allVentasContainer');
        if (!$mainContainer) {
            // Si no existe, crearlo
            const container = document.createElement('div');
            container.id = 'allVentasContainer';
            container.className = 'all-ventas-container';
            
            // Limpiar el contenedor original y agregar el nuevo
            const originalContainer = document.getElementById('comprasList')?.parentElement;
            if (originalContainer) {
                originalContainer.innerHTML = '';
                originalContainer.appendChild(container);
            }
        }

        // Limpiar contenedor
        const $container = document.getElementById('allVentasContainer');
        $container.innerHTML = '<h2>Todas las Ventas</h2><div id="ventasList" class="ventas-list-container"></div>';

        // Array para almacenar todas las ventas
        let allVentas = [];
        let loadedCount = 0;

        // Función para combinar todas las ventas
        function combineVentas() {
            if (loadedCount === compradores.length) {
                // Todas las ventas han sido cargadas
                displayAllVentas(allVentas);
            }
        }

        // Función para mostrar todas las ventas combinadas
        function displayAllVentas(ventas) {
            const $ventasList = document.getElementById('ventasList');
            if (!ventas.length) {
                $ventasList.innerHTML = '<p>No hay ventas registradas</p>';
                return;
            }

            // Ordenar por fecha (más reciente primero)
            ventas.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

            // Crear tabla o lista de ventas
            const ventasHTML = ventas.map(venta => createVentaRow(venta)).join('');
            $ventasList.innerHTML = `
                <div class="ventas-table">
                    <div class="table-header">
                        <span>ID Venta</span>
                        <span>Cliente</span>
                        <span>Fecha</span>
                        <span>Total</span>
                        <span>Estado</span>
                        <span>Acciones</span>
                    </div>
                    ${ventasHTML}
                </div>
            `;

            // Agregar event listeners
            addEventListeners();
        }

        // Función para crear fila de venta
        function createVentaRow(venta) {
            const fecha = new Date(venta.fecha).toLocaleDateString('es-CO');
            const total = new Intl.NumberFormat('es-CO', {
                style: 'currency',
                currency: 'COP',
                maximumFractionDigits: 0
            }).format(venta.total);

            return `
                <div class="venta-row">
                    <span>#${venta.id_venta}</span>
                    <span>${venta.usuario?.nombre || 'N/A'}</span>
                    <span>${fecha}</span>
                    <span>${total}</span>
                    <span>${venta.estado || 'Completado'}</span>
                    <span>
                        <button class="btn-ver-detalles" data-id="${venta.id_venta}" data-user="${venta.usuario?.id_usuario}">
                            Ver Detalles
                        </button>
                    </span>
                </div>
            `;
        }

        // Función para agregar event listeners
        function addEventListeners() {
            document.getElementById('ventasList').addEventListener('click', async (e) => {
                const btn = e.target.closest('.btn-ver-detalles');
                if (btn) {
                    const ventaId = btn.dataset.id;
                    const userId = btn.dataset.user;
                    
                    // Usar el comprasController para mostrar detalles
                    if (userId && ventaId) {
                        // Crear un modal temporal para mostrar los detalles
                        showVentaDetails(userId, ventaId);
                    }
                }
            });
        }

        // Función para mostrar detalles de venta usando comprasController
        function showVentaDetails(userId, ventaId) {
            // Crear modal temporal
            const modal = document.createElement('div');
            modal.id = 'tempModal';
            modal.className = 'modal';
            modal.innerHTML = `
                <div class="modal-content">
                    <span class="modal-close"><i class="material-icons">close</i></span>
                    <div id="tempComprasList"></div>
                </div>
            `;
            
            document.body.appendChild(modal);
            
            // Configurar el modal
            const $list = document.getElementById('tempComprasList');
            $list.style.minHeight = '400px';
            
            // Reemplazar temporalmente el DOM
            const originalList = document.getElementById('comprasList');
            if (originalList) {
                originalList.id = 'originalComprasList';
            }
            
            const tempList = document.createElement('div');
            tempList.id = 'comprasList';
            document.getElementById('tempComprasList').appendChild(tempList);
            
            // Llamar al comprasController
            comprasController(userId);
            
            // Event listener para cerrar
            modal.querySelector('.close').addEventListener('click', () => {
                document.body.removeChild(modal);
                // Restaurar el DOM original si es necesario
                if (originalList) {
                    originalList.id = 'comprasList';
                }
            });
            
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    document.body.removeChild(modal);
                }
            });
        }

        // Cargar ventas para cada comprador
        compradores.forEach(comprador => {
            if (comprador.id_usuario) {
                // Crear un contenedor temporal para cada comprador
                const tempContainer = document.createElement('div');
                tempContainer.id = `temp-${comprador.id_usuario}`;
                tempContainer.style.display = 'none';
                document.body.appendChild(tempContainer);
                
                // Modificar temporalmente el DOM para capturar los resultados
                const originalContainer = document.getElementById('comprasList')?.parentElement;
                
                // Usar fetch para obtener las ventas directamente
                fetch(`http://localhost:8080/helder/api/ventas/usuario/${comprador.id_usuario}`)
                    .then(res => res.json())
                    .then(ventas => {
                        if (Array.isArray(ventas)) {
                            // Agregar información del comprador a cada venta
                            const ventasConUsuario = ventas.map(venta => ({
                                ...venta,
                                usuario: comprador
                            }));
                            allVentas = [...allVentas, ...ventasConUsuario];
                        }
                        loadedCount++;
                        combineVentas();
                    })
                    .catch(error => {
                        console.error(`Error al cargar ventas del usuario ${comprador.id_usuario}:`, error);
                        loadedCount++;
                        combineVentas();
                    });
            }
        });

    } catch (error) {
        console.error("Error al obtener todas las ventas:", error);
    }
}
