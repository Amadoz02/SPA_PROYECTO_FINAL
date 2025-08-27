// import homeController from './controllers/homeController.js';
// import carritoController from './controllers/carrito_fixed.js';
// import favoritosController from './controllers/favoritosController.js';
// import perfilController from './controllers/perfilController.js';
// import compraController from './controllers/compraController.js';
// import listProductosController from './controllers/listProductosController.js';
// import listUsersController from './controllers/listUsersController.js';
// import listVentasController from './controllers/listVentasController.js';
// import listCategoriasTallasController from './controllers/listCategoriasTallasController.js';
// import bienvenidaController from './controllers/bienvenidaController.js';
// import loginController from './controllers/loginController.js';
// import registerController from './controllers/registerController.js';
// import adminDashboardController from './controllers/adminDashboardController.js';
// import metodosPagoController from './controllers/metodosPagoController.js';

// // Importa aquí los controladores de cada vista



// const mainContent = document.getElementById("main-content");

// // Define las rutas y sus controladores
// const rutas = [
//   // Públicas 
//   { nombre: "bienvenida", ruta: "/views/public/bienvenida.html", controlador: bienvenidaController, private: false },
//   { nombre: "login", ruta: "/views/public/login.html", controlador: loginController, private: false },
//   { nombre: "registro", ruta: "/views/public/register.html", controlador: registerController, private: false },

//   // Cliente (rol == 'Cliente')
//   { nombre: "home", ruta: "/src/views/cliente/home.html", controlador: homeController, private: true, roles: ["Cliente"] },
//   { nombre: "carrito", ruta: "/src/views/cliente/carrito.html", controlador: carritoController, private: true, roles: ["Cliente"] },
//   { nombre: "favoritos", ruta: "/src/views/cliente/favoritos.html", controlador: favoritosController, private: true, roles: ["Cliente"] },
//   { nombre: "perfil", ruta: "/src/views/cliente/perfil.html", controlador: perfilController, private: true, roles: ["Cliente"] },
//   { nombre: "compras", ruta: "/src/views/cliente/compras.html", controlador: compraController, private: true, roles: ["Cliente"] },

//   // Admin y Superadmin (rol == 'Admin' o 'Super-Admin')
//   { nombre: "adminDashboard", ruta: "/src/views/admin/dashboard.html", controlador: adminDashboardController, private: true, roles: ["Admin", "Super-Admin"] },
//   { nombre: "listProductos", ruta: "/src/views/admin/productos.html", controlador: listProductosController, private: true, roles: ["Admin", "Super-Admin"] },
//   { nombre: "listUsers", ruta: "/src/views/admin/usuarios.html", controlador: listUsersController, private: true, roles: ["Admin", "Super-Admin"] },
//   { nombre: "listVentas", ruta: "/src/views/admin/ventas.html", controlador: listVentasController, private: true, roles: ["Admin", "Super-Admin"] },
//   { nombre: "listCategorias_Tallas", ruta: "/src/views/admin/categorias_tallas.html", controlador: listCategoriasTallasController, private: true, roles: ["Admin", "Super-Admin"] },
//   { nombre: "metodosPago", ruta: "/src/views/admin/metodos_pago.html", controlador: metodosPagoController, private: true, roles: ["Admin", "Super-Admin"] },
//   { nombre: "perfilAdmin", ruta: "/src/views/cliente/perfil.html", controlador: perfilController, private: true, roles: ["Admin", "Super-Admin"] },
// ];

// export function cargarVistaDesdeHash() {
//   const hash = location.hash.replace("#", "") || "bienvenida";
//   const usuarioRaw = sessionStorage.getItem("usuario");
//   const usuario = usuarioRaw ? JSON.parse(usuarioRaw) : null;
//   const rol = usuario?.rol || null;

//   const rutasInternasHome = ["carrito", "favoritos", "perfil", "compras"];
//   const rutasAdmin = ["adminDashboard", "listProductos", "listUsers", "listVentas", "listCategorias_Tallas"];

//   const rutaObj = rutas.find(r => r.nombre === hash);

//   // Si es una subruta del cliente
//   if (rutasInternasHome.includes(hash)) {
//     const contenedorInterno = document.getElementById("home-main-content");

//     if (contenedorInterno) {
//       // Ya se cargó el layout de home, solo carga la sección
//       const subRuta = rutas.find(r => r.nombre === hash);
//       if (!subRuta || !subRuta.roles.includes(rol)) {
//         contenedorInterno.innerHTML = `<h2>Acceso denegado para el rol: ${rol || "desconocido"}</h2>`;
//         return;
//       }

//       fetch(subRuta.ruta)
//         .then(res => res.ok ? res.text() : Promise.reject("Vista no encontrada"))
//         .then(html => {
//           contenedorInterno.innerHTML = html;
//           if (typeof subRuta.controlador === "function") {
//             subRuta.controlador();
//           }
//         })
//         .catch(err => {
//           console.error(err);
//           contenedorInterno.innerHTML = "<h2>Error cargando la sección.</h2>";
//         });

//       return;
//     } else {
//       // No se ha cargado aún el layout de home, redirige
//       location.hash = "home";
//       return;
//     }
//   }

//   // Si no existe la ruta
//   if (!rutaObj) {
//     mainContent.innerHTML = "<h2>Ruta no encontrada.</h2>";
//     return;
//   }

//   // Verificar acceso privado
//   if (rutaObj.private && (!rol || !rutaObj.roles.includes(rol))) {
//     mainContent.innerHTML = `<h2>Acceso denegado para el rol: ${rol || "desconocido"}</h2>`;
//     return;
//   }

//   // Cargar vista principal
//   fetch(rutaObj.ruta)
//     .then(res => res.ok ? res.text() : Promise.reject("Vista no encontrada"))
//     .then(html => {
//       mainContent.innerHTML = html;
//       if (typeof rutaObj.controlador === "function") {
//         rutaObj.controlador();
//       }
//     })
//     .catch(err => {
//       console.error(err);
//       mainContent.innerHTML = "<h2>Error cargando la vista.</h2>";
//     });
// }


// window.addEventListener("hashchange", cargarVistaDesdeHash);
// window.addEventListener("DOMContentLoaded", cargarVistaDesdeHash);
