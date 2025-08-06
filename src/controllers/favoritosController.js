import { get } from '../utils/manejo_api.js';
import { crearCardProducto } from '../utils/productUtils.js'; // Importar funciones reutilizables

export default async function favoritosController() {
  const productGrid = document.querySelector('.product-grid');
  if (!productGrid) {
    console.error('No se encontró el contenedor de productos favoritos');
    return;
  }

  // Función para cargar productos favoritos
  async function loadFavoritos() {
    const idUsuario = sessionStorage.getItem("id_usuario");
    console.log('ID usuario en favoritosController:', idUsuario);
    if (!idUsuario) {
      productGrid.innerHTML = '<p>Debe iniciar sesión para ver sus favoritos.</p>';
      return;
    }

    try {
      const response = await fetch(`http://localhost:8080/helder/api/favoritos/usuario/${idUsuario}`);
      console.log('Respuesta API favoritos:', response);
      if (!response.ok) {
        throw new Error('Error al obtener favoritos: ' + response.status);
      }
      const favoritos = await response.json();
      console.log('Datos favoritos recibidos:', favoritos);

      productGrid.innerHTML = '';

      if (!favoritos || favoritos.length === 0) {
        productGrid.innerHTML = '<p>No tienes productos favoritos.</p>';
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
      productGrid.innerHTML = '<p>Error al cargar los productos favoritos.</p>';
    }
  }

  // Cargar favoritos al iniciar
  loadFavoritos();
}
