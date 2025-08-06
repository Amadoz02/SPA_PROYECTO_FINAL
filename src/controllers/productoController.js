import { get, post } from '../utils/manejo_api.js';
import { crearCardProducto } from '../utils/productUtils.js'; // Importar funciones reutilizables
import {createInfoButton} from '../utils/modalUtils.js';
export default function initProductoController() {
  const productGrid = document.getElementById('product-grid');
  const idUsuario = sessionStorage.getItem("id_usuario"); // Obtén el ID del usuario desde sessionStorage

  function AddProductoAlCarrito() {
    productGrid.addEventListener("click", async (e) => {
      // Verifica si se hizo click en un botón con la clase 'product-card__btn'
      if (e.target.closest(".product-card__btn")) {
        const boton = e.target.closest(".product-card__btn");
        // Obtener cantidad seleccionada
        const productCard = boton.closest('.product-card');
        const cantidad = parseInt(productCard.querySelector('.quantity-input')?.value) || 1;
        
        // Extrae el ID del producto desde data-id
        const idProducto = boton.dataset.id;
        
        console.log(`ID del usuario: ${idUsuario}, ID del producto: ${idProducto}`);
        if (!idUsuario) {
          alert("Debes iniciar sesión para agregar productos al carrito.");
          return;
        }
        
        const detalle = {
          id_producto: parseInt(idProducto),
          cantidad: cantidad
           // Este valor se calculará en el backend
        };
        console.log("detalle del carrito:", detalle, "idUsuario:", parseInt(idUsuario));
        
        try {
          const res = await post("detalles_carrito", detalle);
          alert("Producto agregado al carrito.");
          console.log("Respuesta del servidor:", res);
        } catch (error) {
          console.error("Error al agregar al carrito:", error);
          alert("Error de conexión con el servidor.");
        }
      }
    });
  }

  // Función para obtener los favoritos de un usuario
  async function obtenerFavoritosUsuario(idUsuario) {
    try {
      const response = await get(`favoritos/usuario/${idUsuario}`);
      return response || []; // Asegurarse de que siempre se retorne un array
    } catch (error) {
      console.error("Error cargando favoritos del usuario:", error);
      return []; // Para que la app no se rompa
    }
  }

  async function cargarProductos() {
    try {
      const productos = await get('productos');
      console.log("productos:", productos);
      
      const favoritosUsuario = idUsuario
        ? await obtenerFavoritosUsuario(idUsuario)
        : [];

      // Mapear favoritosUsuario a array de ids de productos
      const favoritosIds = favoritosUsuario.map(fav => fav.idProducto || fav.id_producto);

      productGrid.innerHTML = '';
      for (const producto of productos) {
        const esFavorito = favoritosIds.includes(producto.id_producto);
        productGrid.appendChild(crearCardProducto(producto, esFavorito, idUsuario)); // Usar la función reutilizable
      }

      if (window.lucide) lucide.createIcons();
    } catch (e) {
      console.error('Error al cargar productos:', e);
      productGrid.innerHTML = '<p class="text">Error al cargar productos.</p>';
    }
  }

  // Botón del header
  document.getElementById('favoritesBtn')?.addEventListener('click', () => {
    window.location.href = '#favoritos';
  });

  // Inicializar carga
  AddProductoAlCarrito();
  cargarProductos();
}
