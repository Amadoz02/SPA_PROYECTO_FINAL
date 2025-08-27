// Definición de rutas SPA
// Cada ruta tiene un path, vista y controlador opcional

export const routes = [
    // Rutas ADMIN
    {
        path: '/admin/categorias/listar',
        view: '/src/views/admin/categorias/listar/index.html',
        controller: '/src/views/admin/categorias/listar/listarcategoriascontroller.js',
        role: 'admin'
    },
    {
        path: '/admin/categorias/crear',
        view: '/src/views/admin/categorias/crear/index.html',
        controller: '/src/views/admin/categorias/crear/crearCategoriasController.js',
        role: 'admin'
    },
    {
        path: '/admin/categorias/editar',
        view: '/src/views/admin/categorias/editar/index.html',
        controller: '/src/views/admin/categorias/editar/editarCategoriasController.js',
        role: 'admin'
    },
    {
        path: '/admin/dashboard',
        view: '/src/views/admin/dashboard/index.html',
        controller: '/src/views/admin/dashboard/dashboardController.js',
        role: 'admin'
    },
    {
        path: '/admin/metodos_pago/listar',
        view: '/src/views/admin/metodos_pago/listar/index.html',
        controller: '/src/views/admin/metodos_pago/listar/listarMetodosPagoController.js',
        role: 'admin'
    },
    {
        path: '/admin/metodos_pago/crear',
        view: '/src/views/admin/metodos_pago/crear/index.html',
        controller: '/src/views/admin/metodos_pago/crear/crearMetodosPagoController.js',
        role: 'admin'
    },
    {
        path: '/admin/metodos_pago/editar',
        view: '/src/views/admin/metodos_pago/editar/index.html',
        controller: '/src/views/admin/metodos_pago/editar/editarMetodosPagoController.js',
        role: 'admin'
    },
    {
        path: '/admin/productos/listar',
        view: '/src/views/admin/productos/listar/index.html',
        controller: '/src/views/admin/productos/listar/listarProductosController.js',
        role: 'admin'
    },
    {
        path: '/admin/productos/crear',
        view: '/src/views/admin/productos/crear/index.html',
        controller: '/src/views/admin/productos/crear/crearProductosController.js',
        role: 'admin'
    },
    {
        path: '/admin/productos/editar',
        view: '/src/views/admin/productos/editar/index.html',
        controller: '/src/views/admin/productos/editar/editarProductosController.js',
        role: 'admin'
    },
    {
        path: '/admin/usuarios/listar',
        view: '/src/views/admin/usuarios/listar/index.html',
        controller: '/src/views/admin/usuarios/listar/listarUsuariosController.js',
        role: 'admin'
    },
    {
        path: '/admin/usuarios/crear',
        view: '/src/views/admin/usuarios/crear/index.html',
        controller: '/src/views/admin/usuarios/crear/crearUsuariosController.js',
        role: 'admin'
    },
    {
        path: '/admin/usuarios/editar',
        view: '/src/views/admin/usuarios/editar/index.html',
        controller: '/src/views/admin/usuarios/editar/editarUsuariosController.js',
        role: 'admin'
    },
    {
        path: '/admin/ventas/listar',
        view: '/src/views/admin/ventas/listar/index.html',
        controller: '/src/views/admin/ventas/listar/listarVentasController.js',
        role: 'admin'
    },
    {
        path: '/admin/ventas/crear',
        view: '/src/views/admin/ventas/crear/index.html',
        controller: '/src/views/admin/ventas/crear/crearVentasController.js',
        role: 'admin'
    },
    {
        path: '/admin/ventas/editar',
        view: '/src/views/admin/ventas/editar/index.html',
        controller: '/src/views/admin/ventas/editar/editarVentasController.js',
        role: 'admin'
    },
    // Rutas CLIENTE
    {
        path: '/cliente/home',
        view: '/src/views/cliente/home/index.html',
        controller: '/src/views/cliente/home/homeController.js',
        role: 'cliente'
    },
    // Rutas PUBLICAS
    {
        path: '/bienvenida',
        view: '/public/views/public/bienvenida.html',
        controller: null,
        role: null
    },
    {
        path: '/login',
        view: '/public/views/public/login.html',
        controller: '/src/controllers/loginController.js',
        role: null
    },
    {
        path: '/registro',
        view: '/public/views/public/register.html',
        controller: '/src/controllers/registerController.js',
        role: null
    },
    {
        path: '/cliente/carrito',
        view: '/src/views/cliente/carrito/index.html',
        controller: '/src/views/cliente/carrito/carritocontroller.js',
        role: 'cliente'
    },
    {
        path: '/cliente/favoritos',
        view: '/src/views/cliente/favoritos/index.html',
        controller: '/src/views/cliente/favoritos/favoritoscontroller.js',
        role: 'cliente'
    },
    {
        path: '/cliente/compras',
        view: '/src/views/cliente/compras/index.html',
        controller: '/src/views/cliente/compras/comprascontroller.js',
        role: 'cliente'
    },
    {
        path: '/cliente/perfil',
        view: '/src/views/cliente/perfil/index.html',
        controller: '/src/views/cliente/perfil/perfilcontroller.js',
        role: 'cliente'
    }
];
