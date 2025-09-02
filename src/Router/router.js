// Archivo principal del router SPA
// Se encargará de gestionar la navegación y cargar las rutas
import Swal from 'sweetalert2/dist/sweetalert2.js'
import { loadNavbar } from '../utils/navbarUtils.js';

import { routes } from './routes.js';

// Asegúrate de tener SweetAlert2 incluido en tu index.html
// <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>


export function navigateTo(path) {
    window.location.hash = path;
    router();
}


export function router() {
    const path = window.location.hash.replace('#', '') || '/bienvenida';
    const route = routes.find(r => r.path === path);
    const userRole = localStorage.getItem('nombre_rol');
    const token = localStorage.getItem('token');

    // Rutas públicas
    const publicRoutes = ['/bienvenida', '/login', '/registro'];

    // Si la ruta no es pública y no hay token, redirigir a bienvenida
    if (route && !publicRoutes.includes(route.path) && !token) {
        Swal.fire({
            icon: 'info',
            title: 'Acceso restringido',
            text: 'Debes iniciar sesión para acceder a esta sección.',
            confirmButtonText: 'Ir a bienvenida'
        }).then(() => {
            navigateTo('/bienvenida');
        });
        return;
    }
     
    
    // Cargar navbar según el rol solo si hay sesión
    const navbar = document.getElementById('main-navbar');
    const mainContent = document.getElementById('main-content');
    
    if (token) {
        loadNavbar();
        
        if (navbar) navbar.style.display = 'block';
        if (mainContent) mainContent.style.gridColumn = '';
    } else {
        // Si no hay sesión, ocultar navbar para vistas públicas y hacer main full width
        if (navbar) navbar.style.display = 'none';
        if (mainContent) mainContent.style.gridColumn = '1 / -1';
    }
    
    if (route) {
        // Validar rol (case-insensitive y soporta variantes)
        if (route.role && route.role.toLowerCase() !== String(userRole).toLowerCase()) {
            Swal.fire({
                icon: 'error',
                title: 'Acceso denegado',
                text: 'No tienes permisos para acceder a esta sección.',
                confirmButtonText: 'Volver'
            }).then(() => {
                if (String(userRole).toLowerCase().includes('admin' || 'SuperAdministrador')) {
                    navigateTo('/admin/dashboard');
                } else if (String(userRole).toLowerCase().includes('cliente')) {
                    navigateTo('/cliente/home');
                } else {
                    console.log("Rol no reconocido, redirigiendo a bienvenida.");
                    navigateTo('/bienvenida');
                }
            });
            return;
        }
        fetch(route.view)
        .then(res => res.text())
        .then(html => {
            if (mainContent) {
                mainContent.innerHTML = html;
            }
            if (route.controller) {
                import(route.controller).then(mod => {
                    if (mod.default) mod.default();
                });
            }
        });
    } else {
        if (mainContent) {
            mainContent.innerHTML = '<h2>404 - Página no encontrada</h2>';
        }
    }
    if (publicRoutes.includes(route.path)){
        navbar.style.display = 'none';
         mainContent.style.gridColumn = '1 / -1';
    }
}

window.addEventListener('hashchange', router);
window.addEventListener('DOMContentLoaded', router);
