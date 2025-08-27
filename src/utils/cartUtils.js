import { post } from './manejo_api_optimizado.js';
import { success, error,info } from './alert.js';

/**
 * Función para agregar productos al carrito desde cualquier vista
 * @param {HTMLElement} container - Contenedor donde se encuentran los productos
 * @param {string} idUsuario - ID del usuario actual
 */
export function AddProductoAlCarrito(container, idUsuario) {
  if (!container) return;

  container.addEventListener("click", async (e) => {
    // Verifica si se hizo click en un botón con la clase 'product-card__btn'
    if (e.target.closest(".product-card__btn")) {
      const boton = e.target.closest(".product-card__btn");
      
      
      // Obtener cantidad seleccionada
      const productCard = boton.closest('.product-card');
      const cantidad = parseInt(productCard.querySelector('.quantity-input')?.value) || 1;
      
      // Extrae el ID del producto desde data-id
      const idProducto = boton.dataset.id;
      
      // Obtener la talla seleccionada
      const tallaSeleccionada = productCard.querySelector('input[type="radio"][name^="talla-"]:checked');
      
     // Cambiar la forma de acceder a data_talla
        const idTalla = tallaSeleccionada ? parseInt(tallaSeleccionada.dataset.talla) : null;
      
      console.log(`ID del usuario: ${idUsuario}, ID del producto: ${idProducto}, ID de talla: ${idTalla}`);
      
      if (!idUsuario) {
        await error({ message: "Debes iniciar sesión para agregar productos al carrito." });
        return;
      }
      
      if (!idProducto) {
        await error({ message: "Error: No se pudo obtener el ID del producto." });
        return;
      }
      
      if (!idTalla) {
        await error({ message: "Por favor selecciona una talla antes de agregar al carrito." });
        return;
      }
      
      const detalle = {
        id_producto: parseInt(idProducto),
        id_talla_producto: idTalla,
        cantidad: cantidad
      };
      
      console.log("detalle del carrito:", detalle, "idUsuario:", parseInt(idUsuario));
      
      try {
        const res = await post("detalles_carrito", detalle, parseInt(idUsuario));
        await success("Producto agregado al carrito.");
        window.actualizarContadores()
        console.log("Respuesta del servidor:", res);
      } catch (error) {
        console.error("Error al agregar al carrito:", error);

        await info("no puedes agregar mas a carrito", "ya tienes el limite de stock agregado en tu carrito.")
       
      }
    }
  });
}

/**
 * Inicializa la funcionalidad de agregar al carrito para una vista específica
 * @param {string} containerSelector - Selector CSS del contenedor de productos
 */
export function initAddToCart(containerSelector) {
  const container = document.querySelector(containerSelector);
  const idUsuario = sessionStorage.getItem("id_usuario");
  
  if (container && idUsuario) {
    AddProductoAlCarrito(container, idUsuario);
  }
}
