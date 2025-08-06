const carritoKey = 'carritoUsuario';

function obtenerCarrito() {
  const carritoJSON = localStorage.getItem(carritoKey);
  return carritoJSON ? JSON.parse(carritoJSON) : [];
}

function guardarCarrito(carrito) {
  localStorage.setItem(carritoKey, JSON.stringify(carrito));
}

function agregarProductoAlCarrito(producto) {
  const carrito = obtenerCarrito();
  const productoExistente = carrito.find(item => item.id_producto === producto.id_producto);
  if (productoExistente) {
    if (productoExistente.cantidad < producto.stock) {
      productoExistente.cantidad += 1;
    }
  } else {
    carrito.push({...producto, cantidad: 1});
  }
  guardarCarrito(carrito);
  actualizarContadorCarrito();
}

function eliminarProductoDelCarrito(id_producto) {
  let carrito = obtenerCarrito();
  carrito = carrito.filter(item => item.id_producto !== id_producto);
  guardarCarrito(carrito);
  actualizarContadorCarrito();
}

function actualizarCantidadProducto(id_producto, cantidad, stock) {
  const carrito = obtenerCarrito();
  const producto = carrito.find(item => item.id_producto === id_producto);
  if (producto) {
    producto.cantidad = Math.min(Math.max(cantidad, 1), stock);
    guardarCarrito(carrito);
    actualizarContadorCarrito();
  }
}

function calcularTotal() {
  const carrito = obtenerCarrito();
  return carrito.reduce((total, item) => total + item.precio * item.cantidad, 0);
}

function actualizarContadorCarrito() {
  const carrito = obtenerCarrito();
  const totalCantidad = carrito.reduce((sum, item) => sum + item.cantidad, 0);
  const contador = document.getElementById('cart-count');
  if (contador) {
    contador.textContent = totalCantidad;
  }
}

function limpiarCarrito() {
  localStorage.removeItem(carritoKey);
  actualizarContadorCarrito();
}

export {
  obtenerCarrito,
  guardarCarrito,
  agregarProductoAlCarrito,
  eliminarProductoDelCarrito,
  actualizarCantidadProducto,
  calcularTotal,
  actualizarContadorCarrito,
  limpiarCarrito
};
