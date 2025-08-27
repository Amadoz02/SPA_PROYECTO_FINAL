import manejoApi from '../../../utils/manejo_api_optimizado.js';
import productosController from '../../../controllers/productoController.js';

export default function homecontroller() {
  // Vincula el buscador cuando el form exista (después de cargar la vista)
  function bindSearch() {
    const form = document.querySelector('.home__search');
    if (!form) return;
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const input = document.querySelector('.home__search-input');
      const termino = (input?.value || '').trim().toLowerCase();
      if (!termino) return;
      try {
        const productos = await manejoApi.get('productos/activos');
        const coincidencias = productos.filter(p =>
          String(p.nombre || '').toLowerCase().includes(termino)
        );
        mostrarResultados(coincidencias);
      } catch (err) {
        console.error('Error al buscar productos:', err);
      }
    });
  }

  function mostrarResultados(productos) {
    let cont = document.querySelector('#resultados-busqueda');
    if (!cont) {
      // Si no existe, lo creamos en el main
      const main = document.querySelector('#home-main-content');
      if (!main) return;
      cont = document.createElement('div');
      cont.id = 'resultados-busqueda';
      main.prepend(cont);
    }
    cont.innerHTML = '';
    if (!Array.isArray(productos) || productos.length === 0) {
      cont.innerHTML = '<p class="text">No se encontraron productos.</p>';
      return;
    }
    productos.forEach(p => {
      const item = document.createElement('div');
      item.classList.add('resultado-item');
      item.innerHTML = `
        <h4>${p.nombre}</h4>
        <p>${p.descripcion || 'Sin descripción'}</p>
      `;
      cont.appendChild(item);
    });
  }

  function addInternalListeners() {
    document.getElementById('favoritesBtn')?.addEventListener('click', (e) => {
      e.preventDefault();
      location.hash = 'favoritos';
    });
    document.getElementById('cart-toggle')?.addEventListener('click', (e) => {
      e.preventDefault();
      location.hash = 'carrito';
    });
    document.getElementById('btn-ver-compras')?.addEventListener('click', (e) => {
      e.preventDefault();
      location.hash = 'compra';
    });
    document.getElementById('logout-btn')?.addEventListener('click', (e) => {
      e.preventDefault();
      localStorage.clear();
      location.hash = 'bienvenida';
    });
    document.getElementById('nav-home')?.addEventListener('click', (e) => {
      e.preventDefault();
      location.hash = 'home';
    });
    document.getElementById('filtrarBtn')?.addEventListener('click', (e) => {
      e.preventDefault();
      // Aquí puedes abrir el modal de filtros si existe
      alert('Funcionalidad de filtro pendiente');
    });
  }

  // Mostrar productos en el home
  productosController();

  // Inicialización
  bindSearch();
  addInternalListeners();
}
