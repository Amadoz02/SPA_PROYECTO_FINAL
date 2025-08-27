/**
 * Controlador optimizado para el carrito de compras
 * Soluciona el problema de eliminación de productos
 */
  import { info, confirm } from '../utils/alert.js';
  import { PaymentModal } from '../views/js/paymentModal.js';
import { get, del, patch } from '../utils/manejo_api_optimizado.js';

export default async function carritoController() {
  const cartItemsContainer = document.getElementById('cart-grid');
  const cartTotal = document.getElementById('cart-total');
  const checkoutBtn = document.getElementById('checkout-btn');
  const idUsuario = sessionStorage.getItem('id_usuario');
  console.log('ID usuario en carritoController:', idUsuario);
  
  if (!idUsuario) {
    cartItemsContainer.innerHTML = `
      <div class="empty-cart">
        <p>Debes iniciar sesión para ver tu carrito.</p>
        <a href="#login" class="login-link">Iniciar Sesión</a>
      </div>
    `;
    return;
  }

  async function getCartItems() {
    try {
      const response = await get(`detalles_carrito/usuario/${idUsuario}`);
      console.log(response);
      
      return response?.data || response || [];
    } catch (error) {
      console.error('Error al obtener items del carrito:', error);
      return [];
    }
  }

  async function getProductDetails(productId) {
    try {
      return await get(`productos/${productId}`);
    } catch (error) {
      console.error('Error al obtener detalles del producto:', error);
      return null;
    }
  }

  async function renderCartItems() {
    try {
      const cartItems = await getCartItems();
      
      if (cartItems.length === 0) {
        cartItemsContainer.innerHTML = `
          <div class="empty-cart">
            <p class="text">Tu carrito está vacío</p>
            <a href="#home" class="continue-shopping text">Continuar comprando</a>
          </div>
        `;
        updateCartTotals(0);
        return;
      }

      cartItemsContainer.innerHTML = '';
      
      // Obtener productos en paralelo
      const productPromises = cartItems.map(item => getProductDetails(item.id_producto));
      const products = await Promise.all(productPromises);
      
      cartItems.forEach((item, index) => {
        const product = products[index];
        if (!product) return;

        const itemElement = document.createElement('div');
        itemElement.className = 'cart-item';
        
        itemElement.innerHTML = `
          <div class="cart-item__image">
            <img src="${product.imagenes?.[0]?.url_imagen || 'default-product.jpg'}" 
                 alt="${product.nombre}">
          </div>
          <div class="cart-item__details">
            <h3 class="cart-item__title">${product.nombre}</h3>
            <p class="cart-item__size">Talla: ${item.talla || 'N/A'}</p>
            <p class="cart-item__price">$${product.precio.toFixed(2)} c/u</p>
          </div>
          <div class="cart-item__quantity">
            <button class="quantity-btn decrement" 
                    data-detalle-id="${item.id_detalle}">-</button>
            <span class="quantity-value">${item.cantidad}</span>
            <button class="quantity-btn increment" 
                    data-detalle-id="${item.id_detalle}">+</button>
          </div>
          <div class="cart-item__total">
            $${(product.precio * item.cantidad).toFixed(2)}
          </div>
          <button class="cart-item__remove" 
                  data-detalle-id="${item.id_detalle}">
                  
            <svg xmlns="http://www.w3.org/2000/svg" 
            width="24" height="24" viewBox="0 0 24 24" fill="none" 
            stroke="currentColor" stroke-width="2" stroke-linecap="round" 
            stroke-linejoin="round" class="lucide lucide-trash2-icon lucide-trash-2">
            <path d="M10 11v6"/><path d="M14 11v6"/><path d="M19 
            6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M3 6h18"/>
            <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
            </svg>
            
          </button>
        `;
        
        cartItemsContainer.appendChild(itemElement);
      });

      updateCartTotals(cartItems);
      initializeCartEvents();
      
    } catch (error) {
      console.error('Error al renderizar items:', error);
    }
  }

  function updateCartTotals(cartItems) {
    let subtotal = 0;
    
    // Calculate sum from all cart-item__total elements in the DOM
    const cartItemTotals = document.querySelectorAll('.cart-item__total');
    cartItemTotals.forEach(element => {
      const value = parseFloat(element.textContent.replace('$', '').trim());
      if (!isNaN(value)) {
        subtotal += value;
      }
    });

    cartTotal.textContent = `$${subtotal.toFixed(2)}`;
  }

  function initializeCartEvents() {
    // Botones de cantidad
    document.querySelectorAll('.quantity-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const detalleId = e.target.dataset.detalleId;
        const isIncrement = e.target.classList.contains('increment');
        await updateCartItemQuantity(detalleId, isIncrement ? 1 : -1);
      });
    });

    // Botones de eliminar
    document.querySelectorAll('.cart-item__remove').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const detalleId = e.target.closest('button').dataset.detalleId;
        await removeFromCart(detalleId);
        window.actualizarContadores()
      });
    });
  }

  async function updateCartItemQuantity(detalleId, change) {
    try {
      const cartItems = await getCartItems();
      const currentItem = cartItems.find(item => item.id_detalle == detalleId);
      console.log(currentItem);
      
      if (!currentItem) return;

      const newQuantity = currentItem.cantidad + change;
      console.log("nueva cantidad "+newQuantity);
      console.log("detalle id; "+detalleId);
      
      if (newQuantity < 1) {
        await removeFromCart(detalleId);
      } else {
        console.log(currentItem);
        
        // Usar fetch directamente para evitar problemas de CORS o configuración
        await patch(`detalles_carrito/${detalleId}`, {
          cantidad: newQuantity,
          id_talla_producto: currentItem.id_talla_producto
        });


        // Actualizar vista
  await renderCartItems();
  
  // Actualizar contador de carrito después de cargar
  if (window.actualizarContadores) {
    window.actualizarContadores();
  }
}
    } catch (error) {
      await info("no puedes agregar mas a carrito", "ya tienes el limite de stock agregado en tu carrito.")
      console.error('Error al actualizar cantidad:', error);
    }
  }

  async function removeFromCart(detalleId) {
    try {
      console.log('Eliminando producto con ID:', detalleId);
      const response = await del(`detalles_carrito/${detalleId}`);
      
      console.log('Producto eliminado exitosamente:', response);
      
      // Limpiar cache
      // cartCache = null;
      
      // Actualizar vista
      await renderCartItems();
      
    } catch (error) {
      console.error('Error al eliminar del carrito:', error);
      
      // Mostrar mensaje al usuario
      const errorDiv = document.createElement('div');
      errorDiv.className = 'error-message';
      errorDiv.textContent = 'Error al eliminar el producto. Intenta nuevamente.';
      errorDiv.style.cssText = 'color: red; padding: 10px; text-align: center;';
      
      cartItemsContainer.insertBefore(errorDiv, cartItemsContainer.firstChild);
      setTimeout(() => errorDiv.remove(), 500);
    }
  }



  const paymentModal = new PaymentModal();

  checkoutBtn.addEventListener('click', async () => {
    const cartItems = await getCartItems();
    if (cartItems.length === 0) {
      info('No hay productos en el carrito.');
      return;
      }
    const result = await confirm('Confirmar Compra', '¿Deseas proceder a confirmar la compra?');
    if (result.isConfirmed) {
      // Show modal with current total
      const totalText = cartTotal.textContent || '$0.00';
      const totalAmount = parseFloat(totalText.replace('$', '').trim()) || 0;
      await paymentModal.init();
      paymentModal.show(totalAmount);
    }
  });

  await renderCartItems();
}
