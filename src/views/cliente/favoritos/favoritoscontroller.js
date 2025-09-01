// favoritoscontroller.js
import { get, tokenExpirado, refreshToken } from '../../../utils/manejo_api_optimizado.js';
import { crearCardProducto } from '../../../utils/productUtils.js';
import { AddProductoAlCarrito } from '../../../utils/cartUtils.js';
import { error, info } from '../../../utils/alert.js';
import { updateNavbarCounters } from '../../../utils/navbarUtils.js';

// Bandera global para evitar duplicidad en la carga de favoritos
window._loadingFavoritos = false;

export default async function favoritoscontroller() {
  const productGrid = document.querySelector('.product-grid');
  if (!productGrid) {
    console.error('No se encontró el contenedor de productos favoritos');
    return;
  }
  const token = localStorage.getItem('token');

  // Función para cargar productos favoritos
  async function loadFavoritos() {
    if (window._loadingFavoritos) return;
    window._loadingFavoritos = true;
    const idUsuario = localStorage.getItem("id_usuario");
    console.log('ID usuario en favoritosController:', idUsuario);
    if (!idUsuario) {
      productGrid.innerHTML = '<p>Debe iniciar sesión para ver sus favoritos.</p>';
      await info('Inicio de sesión requerido', 'Debe iniciar sesión para ver sus favoritos.');
      window._loadingFavoritos = false;
      return;
    }
    try {
      const favoritos = await get(`favoritos/usuario/${idUsuario}`);
      console.log('Datos favoritos recibidos:', favoritos);
      productGrid.innerHTML = '';
      if (!favoritos || favoritos.length === 0) {
        productGrid.innerHTML = '<p class="text">No tienes productos favoritos.</p>';
        window._loadingFavoritos = false;
        return;
      }
      for (const favorito of favoritos) {
        try {
          console.log('Obteniendo producto para favorito:', favorito);
          
          const producto = await get(`productos/${favorito.idProducto}` );
          if (!producto) {
            console.warn('Producto no encontrado para favorito:', favorito);
            continue;
          }
          console.log('Producto obtenido:', producto);
          const card = crearCardProducto(producto, true, idUsuario); // Usar la función reutilizable
          productGrid.appendChild(card);
        } catch (error) {
          console.error('Error al obtener producto favorito:', error);
        }
      }
      if (window.lucide) {
        lucide.createIcons();
      }
    } catch (error) {
      console.error('Error cargando favoritos:', error);
      productGrid.innerHTML = '<p class="text">Error al cargar los productos favoritos.</p>';
      await error({ message: 'Error al cargar los productos favoritos.' });
    }
    window._loadingFavoritos = false;
  }

  // Cargar favoritos al iniciar
  loadFavoritos();
  AddProductoAlCarrito(productGrid, localStorage.getItem("id_usuario")); // Inicializar funcionalidad de agregar al carrito
  
  // Actualizar contador de favoritos después de cargar
  updateNavbarCounters();

}
