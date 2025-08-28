// favoritoscontroller.js
import { get } from '../../../utils/manejo_api_optimizado.js';
import { crearCardProducto } from '../../../utils/productUtils.js';
import { AddProductoAlCarrito } from '../../../utils/cartUtils.js';
import { error, info } from '../../../utils/alert.js';

export default async function favoritoscontroller() {
  const productGrid = document.querySelector('.product-grid');
  if (!productGrid) {
    console.error('No se encontró el contenedor de productos favoritos');
    return;
  }

  async function loadFavoritos() {
    const idUsuario = localStorage.getItem("id_usuario") || sessionStorage.getItem("id_usuario");
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    console.log('ID usuario en favoritoscontroller:', idUsuario);
    if (!idUsuario) {
      productGrid.innerHTML = '<p>Debe iniciar sesión para ver sus favoritos.</p>';
      info('Inicio de sesión requerido', 'Debe iniciar sesión para ver sus favoritos.');
      return;
    }
    try {
      const response = await fetch(`http://localhost:8080/helder/api/favoritos/usuario/${idUsuario}`,
        {
          headers: {
            'Authorization': token ? `Bearer ${token}` : ''
          }
        }
      );
      console.log('Respuesta API favoritos:', response);
      if (!response.ok) {
        throw new Error('Error al obtener favoritos: ' + response.status);
      }
      const favoritos = await response.json();
      console.log('Datos favoritos recibidos:', favoritos);
      productGrid.innerHTML = '';
      if (!favoritos || favoritos.length === 0) {
        productGrid.innerHTML = '<p class="text">No tienes productos favoritos.</p>';
        return;
      }
      for (const favorito of favoritos) {
        try {
          const producto = await get(`productos/${favorito.idProducto || favorito.id_producto}`);
          if (!producto) {
            console.warn('Producto no encontrado para favorito:', favorito);
            continue;
          }
          console.log('Producto obtenido:', producto);
          const card = crearCardProducto(producto, true, idUsuario);
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
      error('Error al cargar los productos favoritos.');
    }
  }

  // Cargar favoritos al iniciar
  await loadFavoritos();
  AddProductoAlCarrito(productGrid, localStorage.getItem("id_usuario") || sessionStorage.getItem("id_usuario"));

  // Actualizar contador de favoritos después de cargar
  if (window.actualizarContadores) {
    window.actualizarContadores();
  }
}
