# Tareas para implementar la SPA correctamente

## 1. Estructura y organización
- [x] Crear carpetas y archivos para cada vista y acción (listar, crear, editar) en admin y cliente.
- [x] Separar componentes reutilizables en carpeta `components`.
- [x] Crear carpeta `Router` con archivos `router.js` y `routes.js`.

## 2. Rutas y navegación
- [x] Definir rutas en `routes.js` con path, vista, controlador y rol requerido.
- [x] Refactorizar `router.js` para navegación por hash y carga dinámica de vistas/controladores.
- [x] Validar acceso por rol usando localStorage y mostrar alertas con SweetAlert2.
- [ ] Usar rutas públicas (bienvenida, login, registro{ya estan solo es usarlas}) y lógica para usuarios no autenticados.

## 3. Autenticación y seguridad
- [ ] Implementar login y registro con JWT (guardar token, refresh y rol en localStorage).
- [ ] Validar JWT en cada petición al backend(headers con bearer).
- [ ] Expulsar al usuario si el token es inválido o expirado.

## 4. Controladores y vistas
- [ ] Implementar la lógica de cada controlador JS según la funcionalidad de la vista.
- [ ] Completar los archivos HTML con el diseño y los elementos necesarios.
- [ ] Integrar componentes reutilizables (navbar, footer, etc.) en las vistas.

## 5. Experiencia de usuario
- [ ] Mejorar el diseño y la usabilidad de las vistas.
- [ ] Agregar feedback visual con SweetAlert2 y loaders.
- [ ] Validar formularios y mostrar errores amigables.

## 6. Optimización y mantenimiento
- [ ] Modularizar el código JS y CSS para facilitar el mantenimiento.
- [ ] Documentar funciones y rutas principales.
- [ ] Realizar pruebas de navegación y acceso por rol.
- [ ] Optimizar carga de recursos y vistas.

---

> Actualiza esta lista conforme avances en el desarrollo. Si necesitas ayuda con alguna tarea, indícalo aquí.
