import listProductosController from './listProductosController.js';
import listUsersController from './listUsersController.js';
import listVentasController from './listVentasController.js';
import listCategoriasTallasController from './listCategoriasTallasController.js';
import perfilController from './perfilController.js';
export default function adminDashboardController() {
  const main = document.getElementById("admin-main");
  const header = document.querySelector(".admin-header");

  if (!main || !header) {
    console.error("No se encontró el contenedor principal del dashboard.");
    return;
  }

  // Cargar vista inicial
  cargarVistaAdmin(location.hash.replace("#", "") || "adminDashboard");

  // Escuchar cambios de hash
  window.addEventListener("hashchange", () => {
    const hash = location.hash.replace("#", "");
    cargarVistaAdmin(hash);
  });

  function cargarVistaAdmin(vista) {
    const rutasAdmin = {
      listProductos: {
        ruta: "/src/views/admin/productos.html",
        controlador: listProductosController
      },
      listUsers: {
        ruta: "/src/views/admin/usuarios.html",
        controlador: listUsersController
      },
      listVentas: {
        ruta: "/src/views/admin/ventas.html",
        controlador: listVentasController
      },
      listCategorias_Tallas: {
        ruta: "/src/views/admin/categorias_tallas.html",
        controlador: listCategoriasTallasController
      },
      adminDashboard: {
        ruta: "/src/views/admin/dashboard_wecolme.html",
        controlador: null
      },
      perfilAdmin:{
        ruta: "/src/views/cliente/perfil.html",
        controlador: perfilController
      },
    };

    const rutaObj = rutasAdmin[vista];

    if (!rutaObj) {
      main.innerHTML = "<h2>Sección no encontrada.</h2>";
      return;
    }

    fetch(rutaObj.ruta)
      .then(res => {
        if (!res.ok) throw new Error("Vista no encontrada");
        return res.text();
      })
      .then(html => {
        main.innerHTML = html;
        if (typeof rutaObj.controlador === "function") {
          rutaObj.controlador();
        }
      })
      .catch(err => {
        console.error(err);
        main.innerHTML = "<h2>Error cargando la sección.</h2>";
      });
  }

  // Cerrar sesión
  document.getElementById("logoutBtn")?.addEventListener("click", () => {
    sessionStorage.clear();
    localStorage.clear();
    location.hash = "#";
  });
}

