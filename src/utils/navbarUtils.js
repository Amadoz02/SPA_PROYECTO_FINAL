// Utilidad para cargar el navbar según el rol del usuario
export function loadNavbar() {
    const navbarContent = document.getElementById('navbar-content');
    if (!navbarContent) return;
    
    const userRole = localStorage.getItem('nombre_rol');
    let html = '';

    // Set body class based on role for styling
    document.body.className = '';
    if (userRole === 'admin' || userRole === 'SuperAdministrador') {
        document.body.classList.add('role-admin');
        html = `
            <div class="admin-header">
                <h1>Panel de Administración</h1>
                <nav>
                    <ul>
                        <li><a href="#/admin/dashboard" id="nav-admin-dashboard">Dashboard</a></li>
                        <li><a href="#/admin/productos/listar" id="nav-admin-productos">Productos</a></li>
                        <li><a href="#/admin/categorias/listar" id="nav-admin-categorias">Categorías y Tallas</a></li>
                        <li><a href="#/admin/usuarios/listar" id="nav-admin-usuarios">Usuarios</a></li>
                        <li><a href="#/admin/ventas/listar" id="nav-admin-ventas">Ventas</a></li>
                        <li><a href="#/admin/metodos_pago/listar" id="nav-admin-metodos-pago">Métodos de Pago</a></li>
                        <li><a href="#/cliente/perfil" id="nav-admin-perfil">Mi Perfil</a></li>
                        <li><a href="#" id="logoutBtn">Cerrar Sesión</a></li>
                    </ul>
                </nav>
            </div>
        `;
    } else if (userRole === 'cliente' || userRole === 'Cliente') {
        document.body.classList.add('role-cliente');
        html = `
            <div class="home__header">
                <h1 class="home__logo">Urban<span class="home__logo--highlight">Pro</span></h1>
                <form class="home__search" id="home-search-form" style="display:none;">
                    <input type="text" class="home__search-input" placeholder="Buscar productos..." />
                    <button type="submit" class="home__search-btn">
                        <i data-lucide="search" class="home__search-icon"></i>
                    </button>
                </form>
                <nav class="home__nav">
                    <a href="#/cliente/home" id="nav-home" class="home__nav-link">Inicio</a>
                    <a href="#/cliente/compras" id="btn-ver-compras" class="home__nav-link">Mis Compras</a>
                    <a href="#/cliente/perfil" class="home__nav-link">Perfil</a>
                    <a href="#/cliente/favoritos" id="favoritesBtn" class="home__icon-btn" title="Favoritos">
                        <i data-lucide="heart" class="home__icon"></i>
                        <span class="home__icon-count" id="fav-count"></span>
                    </a>
                    <a href="#/cliente/carrito" class="home__icon-btn" id="cart-toggle" title="Carrito">
                        <i data-lucide="shopping-cart" class="home__icon"></i>
                        <span class="home__icon-count" id="cart-count"></span>
                    </a>
                    <a href="#" id="logout-btn" class="home__nav-link">Cerrar Sesión</a>
                </nav>
            </div>
        `;
    } else {
        // Navbar para usuarios no autenticados
        document.body.classList.add('role-public');
        html = `
            <div class="public-header">
                <h1 class="public-logo">Urban<span class="public-logo--highlight">Pro</span></h1>
                <nav class="public-nav">
                    <a href="#/bienvenida" class="public-nav-link">Inicio</a>
                    <a href="#/login" class="public-nav-link">Iniciar Sesión</a>
                    <a href="#/registro" class="public-nav-link">Registrarse</a>
                </nav>
            </div>
        `;
    }

    navbarContent.innerHTML = html;
    // Mostrar barra de búsqueda solo en cliente/home
    if (window.location.hash === '#/cliente/home') {
        document.getElementById('home-search-form').style.display = '';
    }
    // Inicializar iconos de Lucide
    if (window.lucide) {
        window.lucide.createIcons();
    }
    // Actualizar contadores del navbar tras renderizarlo
    setTimeout(() => {
        if (typeof updateNavbarCounters === 'function') {
            updateNavbarCounters();
        } else if (window.updateNavbarCounters) {
            window.updateNavbarCounters();
        }
    }, 1);
    
}

// Función para actualizar contadores en el navbar
import { get } from '../views/cliente/contadoresCliente.js';

// Unificada: Actualiza los contadores de carrito y favoritos en el navbar del cliente
export async function updateNavbarCounters() {
    const userRole = localStorage.getItem('nombre_rol');
    if (userRole !== 'cliente' && userRole !== 'Cliente') return;
    const idUsuario = localStorage.getItem('id_usuario');
    if (!idUsuario) return;
    try {
        // Carrito
        const carrito = await get(`detalles_carrito/usuario/${idUsuario}`);
        const cartCount = Array.isArray(carrito) ? carrito.length : (carrito?.length || 0);
        const cartCountElement = document.getElementById('cart-count');
        if (cartCountElement) cartCountElement.textContent = cartCount;

        // Favoritos
        const favoritos = await get(`favoritos/usuario/${idUsuario}`);
        const favCount = Array.isArray(favoritos) ? favoritos.length : (favoritos?.length || 0);
        const favCountElement = document.getElementById('fav-count');
        if (favCountElement) favCountElement.textContent = favCount;
    } catch (err) {
        console.error('Error actualizando contadores navbar:', err);
    }
}

// Función para manejar logout
export function setupLogoutHandler() {
    document.addEventListener('click', (e) => {
        if (e.target.id === 'logoutBtn' || e.target.closest('#logoutBtn')) {
            e.preventDefault();
            localStorage.clear();
            sessionStorage.clear();
            location.hash = '/bienvenida';
            loadNavbar(); // Recargar navbar para mostrar versión pública
        }
    });
}
