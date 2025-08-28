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
      // const item = document.createElement('div');
      // item.classList.add('resultado-item');
      // item.innerHTML = `
      //   <h4>${p.nombre}</h4>
      //   <p>${p.descripcion || 'Sin descripción'}</p>
      // `;
      cont.appendChild(item);
    });
  }

  function addInternalListeners() {
    document.getElementById('favoritesBtn')?.addEventListener('click', (e) => {
      e.preventDefault();
      location.hash = '/cliente/favoritos';
    });
    document.getElementById('cart-toggle')?.addEventListener('click', (e) => {
      e.preventDefault();
      location.hash = '/cliente/carrito';
    });
    document.getElementById('btn-ver-compras')?.addEventListener('click', (e) => {
      e.preventDefault();
      location.hash = '/cliente/compras';
    });
    document.getElementById('logout-btn')?.addEventListener('click', (e) => {
      e.preventDefault();
      localStorage.clear();
      location.hash = '/bienvenida';
    });
    document.querySelector('.home__nav .home__nav-link[href="#perfil"]')?.addEventListener('click', (e) => {
      e.preventDefault();
      location.hash = '/cliente/perfil';
    });
    document.getElementById('nav-home')?.addEventListener('click', (e) => {
      e.preventDefault();
      location.hash = '/cliente/home';
    });
  }
  

  // Mostrar productos en el home
  productosController();
  
  // Sidebar dinámico: solo cargar en /cliente/home
  async function cargarSidebarDinamico() {
    const sidebar = document.querySelector('.home__sidebar .home__menu');
    if (!sidebar) return;
    sidebar.innerHTML = '<li>Cargando menú...</li>';
    try {
      const [generos, categorias] = await Promise.all([
        manejoApi.get('generos'),
        manejoApi.get('categorias/activas')
      ]);
      console.log("generos, categorias:", generos, categorias);
      // Construir HTML del sidebar
      
      sidebar.innerHTML = `
        <li class="sidebar-group">
          <button class="cart-dropdown sidebar-toggle">Géneros</button>
          <ul class="sidebar-list" style="display:block;">
            ${
              Array.isArray(generos) && generos.length
                ? generos
                    .map(
                      (g) => `
              <li class="sidebar-filter-item">
                <label class="sidebar-checkbox-label">
                  <input type="checkbox" class="sidebar-checkbox" name="genero" value="${g.id_genero}">
                  <span>${g.tipo_genero}</span>
                </label>
              </li>`
                    )
                    .join('')
                : '<li  class="text">No hay géneros</li>'
            }
          </ul>
        </li>
        <li class="sidebar-group">
          <button class="cart-dropdown sidebar-toggle">Categorías</button>
          <ul class="sidebar-list" style="display:none;">
            ${
              Array.isArray(categorias) && categorias.length
                ? categorias
                    .map(
                      (c) => `
              <li class="sidebar-filter-item">
                <label class="sidebar-checkbox-label">
                  <input type="checkbox" class="sidebar-checkbox" name="categoria" value="${c.id_categoria}">
                  <span>${c.nombre}</span>
                </label>
              </li>`
                    )
                    .join('')
                : '<li  class="text">No hay categorías</li>'
            }
          </ul>
        </li>
      `;
      sidebar.querySelectorAll('.sidebar-toggle').forEach((btn) => {
        btn.addEventListener('click', function () {
          const ul = this.nextElementSibling;
          if (ul) ul.style.display = ul.style.display === 'none' ? 'block' : 'none';
        });
      });
    } catch (e) {
      sidebar.innerHTML = '<li  class="text">Error cargando menú</li>';
      console.error('[Sidebar dinámico] Error:', e);
    }
  }

  // Solo cargar sidebar dinámico en /cliente/home
  if (window.location.hash === '#/cliente/home') {
    cargarSidebarDinamico();
  }

  // Inicialización
  bindSearch();
  addInternalListeners();

  // Función para actualizar contadores desde la API
  async function actualizarContadores() {
    const idUsuario = localStorage.getItem('id_usuario');
    if (!idUsuario) return;
    try {
      // Obtener cantidad de favoritos
      const favoritosResponse = await manejoApi.get(`favoritos/usuario/${idUsuario}`);
      const favoritosCount = Array.isArray(favoritosResponse) ? favoritosResponse.length : 0;
      // Obtener cantidad de items en carrito
      const carritoResponse = await manejoApi.get(`detalles_carrito/usuario/${idUsuario}`);
      const carritoCount = Array.isArray(carritoResponse) ? carritoResponse.length : 0;
      setFavoritesCount(favoritosCount);
      setCartCount(carritoCount);
      console.log('Contadores actualizados - Favoritos:', favoritosCount, 'Carrito:', carritoCount);
    } catch (error) {
      console.error('Error al actualizar contadores:', error);
    }
  }

  function setFavoritesCount(count) {
    const el = document.querySelector('.home__icon-count');
    if (el) el.textContent = count;
  }
  function setCartCount(count) {
  actualizarContadores();
  // Exponer función global para ser llamada desde otros módulos
  window.actualizarContadores = actualizarContadores;
  window.setFavoritesCount = setFavoritesCount;
  window.setCartCount = setCartCount;
  }
}