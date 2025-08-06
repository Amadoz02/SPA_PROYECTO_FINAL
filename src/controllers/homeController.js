
import  initProductoController  from './productoController.js';
import  mostrarFavoritos  from './favoritosController.js';
// Importar el nuevo controlador
import carritoController from './carrito_fixed.js';




export default function homeController() {
  // Función para cargar contenido dinámico en el main interno
  function addInternalListeners() {
    document.getElementById("favoritesBtn")?.addEventListener("click", e => {
      e.preventDefault();
      location.hash = "favoritos";
    });
    document.getElementById("cart-toggle")?.addEventListener("click", e => {
      e.preventDefault();
      location.hash = "carrito";
    });
    document.getElementById("nav-home")?.addEventListener("click", e => {
      e.preventDefault();
      location.hash = "home";
    });
  }

  function loadHomeSection(section) {
    const main = document.getElementById("home-main-content");

    if (!main) {
      console.error("No se encontró el main interno con id 'home-main-content'");
      return;
    }
    const url = `/src/views/cliente/${section}.html`;

    fetch(url)
      .then(res => {

        if (!res.ok) throw new Error("Vista no encontrada");
        return res.text();
      })
      .then(async html => {
        main.innerHTML = html;
        if (window.lucide) lucide.createIcons();
         addInternalListeners();
        console.log(`Sección '${section}' cargada correctamente.`);
        if (section === "productos") {
          initProductoController();
        }else if (section === "favoritos") {
          mostrarFavoritos();
        }else if (section === "carrito") {
          await carritoController();
        }
      })
      .catch(err => {
        main.innerHTML = `<h2>Error cargando la sección: ${section}</h2>`;
        console.error("Error al cargar sección:", err);
      });
  }

  // Funciones para actualizar los contadores
  function setFavoritesCount(count) {
    const favCount = document.querySelector("#favoritesBtn .home__icon-count");
    if (favCount) favCount.textContent = count;
  }
  function setCartCount(count) {
    const cartCount = document.getElementById("cart-count");
    if (cartCount) cartCount.textContent = count;
  }


  // Sidebar dinámico: cargar géneros, categorías y tallas desde la API y hacerlos desplegables
  async function cargarSidebarDinamico() {
    const sidebar = document.querySelector(".home__sidebar .home__menu");
    if (!sidebar) {
      console.error("[Sidebar dinámico] No se encontró el elemento .home__sidebar .home__menu. Revisa la estructura de tu home.html");
      return;
    }

    sidebar.innerHTML = '<li>Cargando menú...</li>';
    try {
      // Peticiones paralelas
      const [generosRes, categoriasRes, tallasRes] = await Promise.all([
        fetch("http://localhost:8080/helder/api/generos"),
        fetch("http://localhost:8080/helder/api/categorias"),
        fetch("http://localhost:8080/helder/api/tallas")
      ]);
      const [generos, categorias, tallas] = await Promise.all([
        generosRes.ok ? generosRes.json() : [],
        categoriasRes.ok ? categoriasRes.json() : [],
        tallasRes.ok ? tallasRes.json() : []
      ]);
      console.log('Géneros:', generos);
      console.log('Categorías:', categorias);
      console.log('Tallas:', tallas);

      // Construir acordeón con las propiedades correctas
      sidebar.innerHTML = `
        <li class="sidebar-group">
          <button class="sidebar-toggle">Géneros</button>
          <ul class="sidebar-list" style="display:block;">
            ${Array.isArray(generos) && generos.length ? generos.map(g => `
              <li class="sidebar-filter-item">
                <label class="sidebar-checkbox-label">
                  <input type="checkbox" class="sidebar-checkbox" name="genero" value="${g.id_genero}">
                  <span>${g.tipo_genero}</span>
                </label>
              </li>
            `).join("") : '<li>No hay géneros</li>'}
          </ul>
        </li>
        <li class="sidebar-group">
          <button class="sidebar-toggle">Categorías</button>
          <ul class="sidebar-list" style="display:none;">
            ${Array.isArray(categorias) && categorias.length ? categorias.map(c => `
              <li class="sidebar-filter-item">
                <label class="sidebar-checkbox-label">
                  <input type="checkbox" class="sidebar-checkbox" name="categoria" value="${c.id_categoria}">
                  <span>${c.nombre}</span>
                </label>
              </li>
            `).join("") : '<li>No hay categorías</li>'}
          </ul>
        </li>
        <li class="sidebar-group">
          <button class="sidebar-toggle">Tallas</button>
          <ul class="sidebar-list" style="display:none;">
            ${Array.isArray(tallas) && tallas.length ? tallas.map(t => `
              <li class="sidebar-filter-item">
                <label class="sidebar-checkbox-label">
                  <input type="checkbox" class="sidebar-checkbox" name="talla" value="${t.id_talla}">
                  <span>${t.talla}</span>
                </label>
              </li>
            `).join("") : '<li>No hay tallas</li>'}
          </ul>
        </li>
      `;

      // Listeners para desplegar/ocultar
      sidebar.querySelectorAll('.sidebar-toggle').forEach(btn => {
        btn.addEventListener('click', function() {
          const ul = this.nextElementSibling;
          ul.style.display = ul.style.display === 'none' ? 'block' : 'none';
        });
      });
    } catch (e) {
      sidebar.innerHTML = '<li>Error cargando menú</li>';
      console.error('Error cargando sidebar dinámico:', e);
    }
  }

  // Llamar al cargar la vista home
  cargarSidebarDinamico();

  // Listeners iniciales (por si el home ya tiene los botones al cargar)
  addInternalListeners();

  // Función para manejar el hash y cargar la sección correspondiente
  function handleInternalHash() {
    const hash = location.hash.replace('#', '');
    if (hash === "favoritos" || hash === "carrito") {
      loadHomeSection(hash);
    } else {
      // Por defecto, siempre cargar productos
      loadHomeSection("productos");
    }
  }

  // Escuchar cambios de hash solo para rutas internas
  window.addEventListener("hashchange", handleInternalHash);

  // Cargar la sección correspondiente al hash actual al entrar
  handleInternalHash();

  // Exponer funciones globalmente si necesitas actualizar los contadores desde otras vistas
  window.setFavoritesCount = setFavoritesCount;
  window.setCartCount = setCartCount;
}

