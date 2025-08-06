import homeController from './controllers/homeController.js';
import carritoController from './controllers/carrito_fixed.js';
import favoritosController from './controllers/favoritosController.js';
import perfilController from './controllers/perfilController.js';
import compraController from './controllers/compraController.js';
import listProductosController from './controllers/listProductosController.js';
import listUsersController from './controllers/listUsersController.js';
import listVentasController from './controllers/listVentasController.js';
import listCategoriasTallasController from './controllers/listCategoriasTallasController.js';
import bienvenidaController from './controllers/bienvenidaController.js';
import loginController from './controllers/loginController.js';
import registerController from './controllers/registerController.js';

// Importa aquí los controladores de cada vista



const mainContent = document.getElementById("main-content");

// Define las rutas y sus controladores
const rutas = [
  // Públicas
  { nombre: "bienvenida", ruta: "/views/public/bienvenida.html", controlador: bienvenidaController, private: false },
  { nombre: "login", ruta: "/views/public/login.html", controlador: loginController, private: false },
  { nombre: "registro", ruta: "/views/public/register.html", controlador: registerController, private: false },

  // Cliente (rol == 'Cliente')
  { nombre: "home", ruta: "/src/views/cliente/home.html", controlador: homeController, private: true, roles: ["Cliente"] },
  { nombre: "carrito", ruta: "/src/views/cliente/carrito.html", controlador: carritoController, private: true, roles: ["Cliente"] },
  { nombre: "favoritos", ruta: "/src/views/cliente/favoritos.html", controlador: favoritosController, private: true, roles: ["Cliente"] },
  { nombre: "perfil", ruta: "/src/views/cliente/perfil.html", controlador: perfilController, private: true, roles: ["Cliente"] },
  { nombre: "compra", ruta: "/src/views/cliente/compra.html", controlador: compraController, private: true, roles: ["Cliente"] },

  // Admin y Superadmin (rol == 'Admin' o 'Super-Admin')
  { nombre: "listProductos", ruta: "/src/views/admin/productos.html", controlador: listProductosController, private: true, roles: ["Admin", "Super-Admin"] },
  { nombre: "listUsers", ruta: "/src/views/admin/usuarios.html", controlador: listUsersController, private: true, roles: ["Admin", "Super-Admin"] },
  { nombre: "listVentas", ruta: "/src/views/admin/ventas.html", controlador: listVentasController, private: true, roles: ["Admin", "Super-Admin"] },
  { nombre: "listCategorias_Tallas", ruta: "/src/views/admin/categorias_tallas.html", controlador: listCategoriasTallasController, private: true, roles: ["Admin", "Super-Admin"] },
];


export function cargarVistaDesdeHash() {
  const hash = location.hash.replace("#", "") || "bienvenida";
  const rol = sessionStorage.getItem("rol");

  // Si es una subruta interna del home, siempre cargar home.html y homeController
  const rutasInternasHome = ["home", "favoritos", "carrito", "perfil", "compra", "productos"];
  if (rutasInternasHome.includes(hash)) {
    // Buscar la ruta home
    let rutaObj = rutas.find(r => r.nombre === "home");
    if (!rutaObj) {
      mainContent.innerHTML = "<h2>Ruta no encontrada.</h2>";
      return;
    }
    // Verificar autenticación y rol
    if (rutaObj.private) {
      if (!rol || !rutaObj.roles.includes(rol)) {
        if (rol === "Cliente") {
          location.hash = "home";
        } else if (rol === "Admin" || rol === "Super-Admin") {
          location.hash = "listProductos";
        } else {
          location.hash = "bienvenida";
        }
        return;
      }
    }
    // Cargar home.html y ejecutar homeController
    fetch(rutaObj.ruta)
      .then(res => {
        if (!res.ok) throw new Error("Vista no encontrada");
        return res.text();
      })
      .then(html => {
        mainContent.innerHTML = html;
        if (typeof rutaObj.controlador === "function") {
          rutaObj.controlador();
        }
      })
      .catch(err => {
        console.error(err);
        mainContent.innerHTML = "<h2>Error cargando la vista.</h2>";
      });
    return;
  }

  // Buscar la ruta correspondiente
  let rutaObj = rutas.find(r => r.nombre === hash);

  // Si no existe la ruta, mostrar error
  if (!rutaObj) {
    mainContent.innerHTML = "<h2>Ruta no encontrada.</h2>";
    return;
  }

  // Si es privada, verificar autenticación y rol
  if (rutaObj.private) {
    if (!rol || !rutaObj.roles.includes(rol)) {
      // Redirigir según el rol o al login
      if (rol === "Cliente") {
        location.hash = "home";
      } else if (rol === "Admin" || rol === "Super-Admin") {
        location.hash = "listProductos";
      } else {
        location.hash = "bienvenida";
      }
      return;
    }
  }

  // Cargar la vista
  fetch(rutaObj.ruta)
    .then(res => {
      if (!res.ok) throw new Error("Vista no encontrada");
      return res.text();
    })
    .then(html => {
      mainContent.innerHTML = html;
      // Ejecutar el controlador si existe
      if (typeof rutaObj.controlador === "function") {
        rutaObj.controlador();
      }
    })
    .catch(err => {
      console.error(err);
      mainContent.innerHTML = "<h2>Error cargando la vista.</h2>";
    });
}

window.addEventListener("hashchange", cargarVistaDesdeHash);
window.addEventListener("DOMContentLoaded", cargarVistaDesdeHash);
