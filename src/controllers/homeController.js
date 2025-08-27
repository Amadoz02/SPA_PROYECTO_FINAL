// // homeController.js
// import initProductoController from './productoController.js';
// import mostrarFavoritos from './favoritosController.js';
// import carritoController from './carrito_fixed.js';
// import perfilController from './perfilController.js';
// import comprasController from './compraController.js';
// import manejoApi from '../utils/manejo_api_optimizado.js';

// export default function homeController() {

//   // Vincula el buscador cuando el form exista (después de cargar la vista)
//   function bindSearch() {
//     const form = document.querySelector('.home__search');
//     if (!form) return;

//     form.addEventListener('submit', async (e) => {
//       e.preventDefault();
//       const input = document.querySelector('.home__search-input');
//       const termino = (input?.value || '').trim().toLowerCase();
//       if (!termino) return;

//       try {
//         const productos = await manejoApi.get('productos/activos'); // unificado
//         const coincidencias = productos.filter(p =>
//           String(p.nombre || '').toLowerCase().includes(termino)
//         );
//         mostrarResultados(coincidencias);
//       } catch (err) {
//         console.error('Error al buscar productos:', err);
//       }
//     });
//   }

//   function mostrarResultados(productos) {
//     const cont = document.querySelector('#resultados-busqueda');
//     if (!cont) return; // Evita romper si no existe el contenedor

//     cont.innerHTML = '';
//     if (!Array.isArray(productos) || productos.length === 0) {
//       cont.innerHTML = '<p  class="text">No se encontraron productos.</p>';
//       return;
//     }

//     productos.forEach(p => {
//       const item = document.createElement('div');
//       item.classList.add('resultado-item');
//       item.innerHTML = `
//         <h4>${p.nombre}</h4>
//         <p>${p.descripcion || 'Sin descripción'}</p>
//       `;
//       cont.appendChild(item);
//     });
//   }

//   function addInternalListeners() {
//     document.getElementById('favoritesBtn')?.addEventListener('click', (e) => {
//       e.preventDefault();
//       location.hash = 'favoritos';
//     });
//     document.getElementById('cart-toggle')?.addEventListener('click', (e) => {
//       e.preventDefault();
//       location.hash = 'carrito';
//     });
//     document.getElementById('nav-home')?.addEventListener('click', (e) => {
//       e.preventDefault();
//       location.hash = 'home';
//     });
//     document.getElementById('btn-ver-compras')?.addEventListener('click', (e) => {
//       e.preventDefault();
//       location.hash = 'compras'; // coherente con el router
//     });
    
//     // Agregar listener para logout
//     document.getElementById('logout-btn')?.addEventListener('click', (e) => {
//       e.preventDefault();
//       logout();
//     });
//   }

//   // Sidebar dinámico: cárgalo SOLO cuando la vista productos esté en el DOM
//   async function cargarSidebarDinamico() {
//     const sidebar = document.querySelector('.home__sidebar .home__menu');
//     if (!sidebar) return;

//     sidebar.innerHTML = '<li>Cargando menú...</li>';
//     try {
//       const [generos, categorias] = await Promise.all([
//         manejoApi.get('generos'),
//         manejoApi.get('categorias/activas')
//       ]);

//       sidebar.innerHTML = `
//         <li class="sidebar-group">
//           <button class="cart-dropdown sidebar-toggle">Géneros</button>
//           <ul class="sidebar-list" style="display:block;">
//             ${
//               Array.isArray(generos) && generos.length
//                 ? generos
//                     .map(
//                       (g) => `
//               <li class="sidebar-filter-item">
//                 <label class="sidebar-checkbox-label">
//                   <input type="checkbox" class="sidebar-checkbox" name="genero" value="${g.id_genero}">
//                   <span>${g.tipo_genero}</span>
//                 </label>
//               </li>`
//                     )
//                     .join('')
//                 : '<li  class="text">No hay géneros</li>'
//             }
//           </ul>
//         </li>

//         <li class="sidebar-group">
//           <button class="cart-dropdown sidebar-toggle">Categorías</button>
//           <ul class="sidebar-list" style="display:none;">
//             ${
//               Array.isArray(categorias) && categorias.length
//                 ? categorias
//                     .map(
//                       (c) => `
//               <li class="sidebar-filter-item">
//                 <label class="sidebar-checkbox-label">
//                   <input type="checkbox" class="sidebar-checkbox" name="categoria" value="${c.id_categoria}">
//                   <span>${c.nombre}</span>
//                 </label>
//               </li>`
//                     )
//                     .join('')
//                 : '<li  class="text">No hay categorías</li>'
//             }
//           </ul>
//         </li>
//       `;

//       sidebar.querySelectorAll('.sidebar-toggle').forEach((btn) => {
//         btn.addEventListener('click', function () {
//           const ul = this.nextElementSibling;
//           if (ul) ul.style.display = ul.style.display === 'none' ? 'block' : 'none';
//         });
//       });
//     } catch (e) {
//       sidebar.innerHTML = '<li  class="text">Error cargando menú</li>';
//       console.error('[Sidebar dinámico] Error:', e);
//     }
//   }

//   function loadHomeSection(section) {
//     const main = document.getElementById('home-main-content');
//     if (!main) {
//       console.error("No se encontró el main con id 'home-main-content'");
//       return;
//     }

//     const url = `/src/views/cliente/${section}.html`;

//     fetch(url)
//       .then((res) => {
//         if (!res.ok) throw new Error('Vista no encontrada');
//         return res.text();
//       })
//       .then(async (html) => {
//         main.innerHTML = html;
//         if (window.lucide) lucide.createIcons();
//         addInternalListeners();
//         console.log(`Sección '${section}' cargada correctamente.`);

//         if (section === 'productos') {
//           // Importante: primero pintar vista, luego controllers que dependen del DOM
//           initProductoController();
//           await cargarSidebarDinamico();
//           bindSearch();
//         } else if (section === 'favoritos') {
//           mostrarFavoritos();
//         } else if (section === 'carrito') {
//           await carritoController();
//         } else if (section === 'perfil') {
//           await perfilController();
//         } else if (section === 'compras') {
//           comprasController();
//         }
//       })
//       .catch((err) => {
//         main.innerHTML = `<h2 class="text">Error cargando la sección: ${section}</h2>`;
//         console.error('Error al cargar sección:', err);
//       });
//   }

//   function setFavoritesCount(count) {
//     const favCount = document.querySelector('#favoritesBtn .home__icon-count');
//     if (favCount) favCount.textContent = count;
//   }
//   function setCartCount(count) {
//     const cartCount = document.getElementById('cart-count');
//     if (cartCount) cartCount.textContent = count;
//   }

//   function handleInternalHash() {
//     const hash = location.hash.replace('#', '');
//     // Incluye 'compras' (plural) para que haga match con tus botones
//     const secciones = ['favoritos', 'carrito', 'perfil', 'productos', 'compras', 'home'];
//     if (secciones.includes(hash)) {
//       // Normaliza 'home' a 'productos' si así lo deseas
//       loadHomeSection(hash === 'home' ? 'productos' : hash);
//     } else {
//       loadHomeSection('productos');
//     }
//   }

//   // Bootstrap
//   window.addEventListener('hashchange', handleInternalHash);
//   handleInternalHash();

//   // Función para cerrar sesión
//   async function logout() {
//     try {
//       // Intentar cerrar sesión en el servidor (si hay endpoint disponible)
//       const token = sessionStorage.getItem('token');
//       if (token) {
//         try {
//           await manejoApi.post('auth/logout', {}, {
//             headers: {
//               'Authorization': `Bearer ${token}`
//             }
//           });
//         } catch (error) {
//           console.log('No se pudo cerrar sesión en el servidor, continuando...');
//         }
//       }
      
//       // Limpiar todo el sessionStorage
//       sessionStorage.clear();
      
//       // Forzar recarga completa de la página para limpiar cualquier estado
//       window.location.href = '/index.html';
      
//     } catch (error) {
//       console.error('Error al cerrar sesión:', error);
//       // Si hay error, limpiar sessionStorage y redirigir de todas formas
//       sessionStorage.clear();
//       window.location.href = '/index.html';
//     }
//   }

//   // Función para actualizar contadores desde la API
//   async function actualizarContadores() {
//     const idUsuario = sessionStorage.getItem('id_usuario');
//     if (!idUsuario) return;

//     try {
//       // Obtener cantidad de favoritos
//       const favoritosResponse = await manejoApi.get(`favoritos/usuario/${idUsuario}`);
//       const favoritosCount = Array.isArray(favoritosResponse) ? favoritosResponse.length : 0;
      
//       // Obtener cantidad de items en carrito
//       const carritoResponse = await manejoApi.get(`detalles_carrito/usuario/${idUsuario}`);
//       const carritoCount = Array.isArray(carritoResponse) ? carritoResponse.length : 0;

//       // Actualizar UI
//       setFavoritesCount(favoritosCount);
//       setCartCount(carritoCount);
      
//       console.log('Contadores actualizados - Favoritos:', favoritosCount, 'Carrito:', carritoCount);
//     } catch (error) {
//       console.error('Error al actualizar contadores:', error);
//     }
//   }

//   // Ejecutar actualización al cargar la vista
//   actualizarContadores();

//   // Exponer función global para ser llamada desde otros módulos
//   window.actualizarContadores = actualizarContadores;
//   window.setFavoritesCount = setFavoritesCount;
//   window.setCartCount = setCartCount;
//   window.logout = logout;
// }
