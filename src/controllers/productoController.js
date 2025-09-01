import { get } from '../utils/manejo_api_optimizado.js';
import { crearCardProducto } from '../utils/productUtils.js';
import {createInfoButton} from '../utils/modalUtils.js';
import obtenerProductosFiltrados from '../utils/manejo_filter.js';
import { AddProductoAlCarrito } from '../utils/cartUtils.js';
import { error, info } from '../utils/alert.js';

export default function initProductoController() {
  const productGrid = document.getElementById('product-grid');
  const idUsuario = localStorage.getItem("id_usuario");
  console.log("id de usuario: ", idUsuario);
  

  // Función para obtener los favoritos de un usuario
  async function obtenerFavoritosUsuario(idUsuario) {
    try {
      const response = await get(`favoritos/usuario/${idUsuario}`);
      return response || [];
    } catch (error) {
      console.error("Error cargando favoritos del usuario:", error);
      return [];
    }
  }

  async function cargarProductos() {
    try {
      const productos = await get('productos/activos');
      console.log("productos:", productos);
      
      const favoritosUsuario = idUsuario
        ? await obtenerFavoritosUsuario(idUsuario)
        : [];

      // Mapear favoritosUsuario a array de ids de productos
      const favoritosIds = favoritosUsuario.map(fav => fav.idProducto || fav.id_producto);

      productGrid.innerHTML = '';
      for (const producto of productos) {
        const esFavorito = favoritosIds.includes(producto.id_producto);
        productGrid.appendChild(crearCardProducto(producto, esFavorito, idUsuario));
      }

      if (window.lucide) lucide.createIcons();
    } catch (e) {
      console.error('Error al cargar productos:', e);
      productGrid.innerHTML = '<p class="text">Error al cargar productos.</p>';
      await error({ message: 'Error al cargar productos.' });
    }
  }

  // Botón del header
  document.getElementById('favoritesBtn')?.addEventListener('click', () => {
    window.location.href = '#favoritos';
  });

  // Inicializar carga
  AddProductoAlCarrito(productGrid, idUsuario);
  document.getElementById('refreshfiltrarBtn')?.addEventListener('click', async () => {
    await info('Refrescando productos', 'Cargando los productos más recientes...');
    //des chekear filtros si los hay
    const checkboxes = document.querySelectorAll('.home__sidebar input[type="checkbox"]');
    checkboxes.forEach(checkbox => checkbox.checked = false);
    //limpiar barra de búsqueda si los hay
    let searchInput = document.querySelector('.home__search-input');
    searchInput.value = '';

    await cargarProductos();
  });
  document.getElementById('filtrarBtn')?.addEventListener('click', async () => {
    const getSeleccionados = (name) => {
      return Array.from(document.querySelectorAll(`input[name="${name}"]:checked`))
        .map(input => parseInt(input.value));
    };
    if (getSeleccionados('genero').length === 0 && getSeleccionados('categoria').length === 0) {
        await info('Elige algun fitro', 'Por favor, selecciona al menos un filtro para continuar.');
        return;
    }

    const id_genero = getSeleccionados('genero');
    const id_categoria = getSeleccionados('categoria');
  

    const filtros = {
      id_genero,
      id_categoria,
    };

    try {
      const productos = await obtenerProductosFiltrados(filtros);

      if (!Array.isArray(productos) || productos.length === 0) {
        await info('Sin resultados', 'No hay productos que coincidan con el filtro. Se mostrarán todos los productos.');
        await cargarProductos();
        return;
      }

      const favoritosUsuario = idUsuario
        ? await obtenerFavoritosUsuario(idUsuario)
        : [];

      const favoritosIds = favoritosUsuario.map(fav => fav.idProducto || fav.id_producto);

      productGrid.innerHTML = '';
      for (const producto of productos) {
        const esFavorito = favoritosIds.includes(producto.id_producto);
        productGrid.appendChild(crearCardProducto(producto, esFavorito, idUsuario));
      }

      if (window.lucide) lucide.createIcons();

    } catch (error) {
      console.error('Error al filtrar productos:', error);
      productGrid.innerHTML = '<p class="text">No se pudieron cargar los productos filtrados.</p>';
      await error({ message: 'No se pudieron cargar los productos filtrados.' });
    }
  });

  const searchForm = document.querySelector('.home__search');
  const searchInput = document.querySelector('.home__search-input');

  //cargar cuando le de al boton de búsqueda
  searchForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const termino = searchInput.value.trim().toLowerCase();

    if (!termino) {
      cargarProductos(); // Si no hay búsqueda, carga todo
      return;
    }

    try {
      const productos = await get('productos/activos');
      const favoritosUsuario = idUsuario
        ? await obtenerFavoritosUsuario(idUsuario)
        : [];

      const favoritosIds = favoritosUsuario.map(fav => fav.idProducto || fav.id_producto);

      // Filtrar productos por coincidencia en el nombre
      const coincidencias = productos.filter(p =>
        p.nombre.toLowerCase().includes(termino)
      );

      if (coincidencias.length === 0) {
        await info('Sin resultados', 'No hay productos como el que estás buscando en este momento.');
        cargarProductos(); // Volver a mostrar todos
        return;
      }

      productGrid.innerHTML = '';
      for (const producto of coincidencias) {
        const esFavorito = favoritosIds.includes(producto.id_producto);
        productGrid.appendChild(crearCardProducto(producto, esFavorito, idUsuario));
      }

      if (window.lucide) lucide.createIcons();
    } catch (error) {
      console.error('Error en la búsqueda de productos:', error);
      productGrid.innerHTML = '<p class="text">Error al buscar productos.</p>';
      await error({ message: 'Error al buscar productos.' });
    }
  });

  cargarProductos();
}
