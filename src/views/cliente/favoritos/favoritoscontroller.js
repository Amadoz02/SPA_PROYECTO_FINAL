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
    const idUsuario = sessionStorage.getItem("id_usuario");
    if (!idUsuario) {
      productGrid.innerHTML = '<p>Debe iniciar sesión para ver sus favoritos.</p>';
      await info('Inicio de sesión requerido', 'Debe iniciar sesión para ver sus favoritos.');
      return;
    }
    try {
      const response = await fetch(`http://localhost:8080/helder/api/favoritos/usuario/${idUsuario}`);
      if (!response.ok) {
        throw new Error('Error al obtener favoritos: ' + response.status);
      }
      const favoritos = await response.json();
      productGrid.innerHTML = '';
      if (!favoritos || favoritos.length === 0) {
        productGrid.innerHTML = '<p class="text">No tienes productos favoritos.</p>';
        return;
      }
      for (const favorito of favoritos) {
        try {
          const producto = await get(`productos/${favorito.idProducto || favorito.id_producto}`);
          if (!producto) {
            continue;
          }
          const card = crearCardProducto(producto, true, idUsuario);
          productGrid.appendChild(card);
        } catch (error) {
          // Silenciar error individual de producto
        }
      }
      if (window.lucide) {
        lucide.createIcons();
      }
    } catch (error) {
      productGrid.innerHTML = '<p>Error al cargar favoritos.</p>';
    }
  }
  await loadFavoritos();
}
