# TODO: Mover lógica de usuarios

## Tareas Pendientes
- [x] Crear HTML para listar usuarios (src/views/admin/usuarios/listar/index.html)
- [x] Mover función listUsersController a src/views/admin/usuarios/listar/listarUsuariosController.js
- [x] Mover función deleteUsuario a src/views/admin/usuarios/listar/listarUsuariosController.js
- [x] Crear HTML para editar usuarios (src/views/admin/usuarios/editar/index.html)
- [x] Mover función openUsuarioForm a src/views/admin/usuarios/editar/editarUsuariosController.js
- [x] Crear HTML para crear usuarios (src/views/admin/usuarios/crear/index.html)
- [x] Crear función para crear usuarios en src/views/admin/usuarios/crear/crearUsuariosController.js
- [x] Incluir enlaces a CSS en los HTML
- [ ] Probar la funcionalidad

## Detalles
- Usar clases de admin.css, tablas.css, etc.
- La lógica de openUsuarioForm se usa para crear y editar, así que adaptarla.
- Asegurar que las rutas de import sean correctas.
- Para crear, llamar openUsuarioForm(null).

## Próximos pasos
- Probar la funcionalidad.
- Verificar que las rutas de import funcionen correctamente.
