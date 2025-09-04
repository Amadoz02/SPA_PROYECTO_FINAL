# TODO: Crear módulo de productos

## Tareas Pendientes
- [x] Agregar columna "Estado" a la tabla de tallas en `src/views/admin/productos/editar/index.html`.
- [x] Modificar `llenarTallas()` para incluir select de estado con opciones Activo/Inactivo, pre-seleccionado según `tp.id_estado`.
- [x] Modificar `agregarTalla()` para incluir select de estado con Activo por defecto.
- [x] Actualizar `obtenerTallasSeleccionadas()` para incluir `id_estado` del select.
- [x] Modificar `actualizarTallas()` para usar `tp.id_estado` en lugar de hardcoded 1.
- [x] Crear HTML para crear productos en `src/views/admin/productos/crear/index.html`.
- [x] Crear controlador JS para crear productos en `src/views/admin/productos/crear/crearProductosController.js`.

## Detalles
- El select de estado tiene opciones: <option value="1">Activo</option> <option value="2">Inactivo</option>.
- Para tallas existentes, seleccionar según `tp.id_estado`.
- Para nuevas tallas, seleccionar Activo por defecto.
- En POST, incluir `id_estado` del formulario.
- El módulo de crear productos reutiliza la lógica del editar pero sin cargar datos existentes.

## Próximos pasos
- Probar la funcionalidad de edición de producto, especialmente la adición, modificación y eliminación de tallas con estado.
- Probar la funcionalidad de creación de productos.
- Confirmar que el backend maneja correctamente el `id_estado` en tallas-productos y la creación de productos.
