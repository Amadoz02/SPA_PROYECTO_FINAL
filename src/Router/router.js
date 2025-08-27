// Archivo principal del router SPA
// Se encargará de gestionar la navegación y cargar las rutas
import Swal from 'sweetalert2/dist/sweetalert2.js'

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

    if (route) {
        if (!publicRoutes.includes(route.path)) {
            // Si no es pública, requiere autenticación
            if (!token) {
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
            // Validar rol (case-insensitive y soporta variantes)
            if (route.role && route.role.toLowerCase() !== String(userRole).toLowerCase()) {
                Swal.fire({
                    icon: 'error',
                    title: 'Acceso denegado',
                    text: 'No tienes permisos para acceder a esta sección.',
                    confirmButtonText: 'Volver'
                }).then(() => {
                    if (String(userRole).toLowerCase().includes('admin')) {
                        navigateTo('/admin/dashboard');
                    } else if (String(userRole).toLowerCase().includes('cliente')) {
                        navigateTo('/cliente/home');
                    } else {
                        navigateTo('/bienvenida');
                    }
                });
                return;
            }
        }
        fetch(route.view)
            .then(res => res.text())
            .then(html => {
                document.getElementById('main-content').innerHTML = html;
                if (route.controller) {
                    import(route.controller).then(mod => {
                        if (mod.default) mod.default();
                    });
                }
            });
    } else {
        document.getElementById('main-content').innerHTML = '<h2>404 - Página no encontrada</h2>';
    }
}

window.addEventListener('hashchange', router);
window.addEventListener('DOMContentLoaded', router);
