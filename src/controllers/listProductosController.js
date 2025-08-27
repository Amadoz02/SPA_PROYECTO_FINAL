// listProductosController.js
import { error, success, confirm} from "../utils/alert.js";
import { get, patch, del, put, post } from "../utils/manejo_api_optimizado.js";
import { renderTable, renderEditableRow } from "../utils/tableUtils.js";
import { initNuevoProductoController } from "./nuevoProductoController.js";

const columns = [
  { key: "id_producto", label: "ID" },
  { key: "imagenes", label: "Imagen" },
  { key: "nombre", label: "Nombre", editable: true },
  { key: "descripcion", label: "Descripción", editable: true },
  { key: "precio", label: "Precio", editable: true },
  { key: "estado", label: "Estado", editable: true },
  { key: "categoria", label: "Categoría" },
  { key: "genero", label: "Género" },
  { key: "tallas", label: "Tallas (Stock)", editable: true }
];

// Función para agregar nueva talla a un producto
async function agregarNuevaTalla(producto) {
  try {
    // Obtener todas las tallas disponibles
    const [tallasDisponibles, tallasProducto] = await Promise.all([
      get("tallas"),
      get(`tallas_productos/producto/${producto.id_producto}`)
    ]);

    // Filtrar tallas que no están asignadas al producto
    const tallasAsignadasIds = tallasProducto.map(tp => tp.id_talla);
    const tallasNoAsignadas = tallasDisponibles.filter(t => 
      !tallasAsignadasIds.includes(t.id_talla)
    );

    if (tallasNoAsignadas.length === 0) {
      error("No hay tallas disponibles para agregar a este producto", "info");
      return;
    }

    // Crear modal para seleccionar talla y stock
    const modal = document.createElement('div');
    modal.innerHTML = `
      <div style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 1000; display: flex; justify-content: center; align-items: center;">
        <div style="background: white; padding: 20px; border-radius: 8px; width: 400px; max-width: 90%;">
          <h3>Agregar Nueva Talla a ${producto.nombre}</h3>
          <div style="margin: 15px 0;">
            <label>Talla:</label>
            <select id="tallaSelect" style="width: 100%; padding: 8px; margin: 5px 0;">
              <option value="">Seleccione una talla</option>
              ${tallasNoAsignadas.map(t => `<option value="${t.id_talla}">${t.talla}</option>`).join('')}
            </select>
          </div>
          <div style="margin: 15px 0;">
            <label>Stock:</label>
            <input type="number" id="stockInput" min="0" value="0" style="width: 100%; padding: 8px; margin: 5px 0;">
          </div>
          <div style="display: flex; gap: 10px; justify-content: flex-end; margin-top: 20px;">
            <button id="cancelarBtn" style="padding: 8px 16px; background: #ccc; border: none; border-radius: 4px; cursor: pointer;">Cancelar</button>
            <button id="agregarBtn" style="padding: 8px 16px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer;">Agregar</button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    // Manejar eventos del modal
    const cancelarBtn = modal.querySelector('#cancelarBtn');
    const agregarBtn = modal.querySelector('#agregarBtn');
    const tallaSelect = modal.querySelector('#tallaSelect');
    const stockInput = modal.querySelector('#stockInput');

    cancelarBtn.onclick = () => {
      document.body.removeChild(modal);
    };

    agregarBtn.onclick = async () => {
      const id_talla = parseInt(tallaSelect.value);
      const stock = parseInt(stockInput.value);

      if (!id_talla) {
        error("Por favor seleccione una talla", "warning");
        return;
      }

      if (stock < 0) {
        error("El stock debe ser mayor o igual a 0", "warning");
        return;
      }

      try {
        await post('tallas_productos', {
          id_producto: producto.id_producto,
          id_talla: id_talla,
          stock: stock,
          estado: 'Activo'
        });

        success("Talla agregada correctamente", "success");
        document.body.removeChild(modal);
        listProductosController(); // Recargar la tabla
      } catch (err) {
        console.error("Error al agregar talla:", err);
        error("Error al agregar la talla: " + (err.message || "Error desconocido"), "error");
      }
    };

    // Cerrar modal al hacer clic fuera
    modal.onclick = (e) => {
      if (e.target === modal) {
        document.body.removeChild(modal);
      }
    };
  } catch (err) {
    console.error("Error al cargar datos para agregar talla:", err);
    error("Error al cargar las tallas disponibles", "error");
  }
}

export default async function listProductosController() {
  const container = document.getElementById("productos-container"); 
  if (!container) return;
  console.log("container desde el controller:", container);//indefinido

  try {
    const productos = await get("productos");
    console.log("productos obtenbidos:",productos);
    
    const productosEnriquecidos = await Promise.all(productos.map(async (p) => {
      try {
        const tallasProducto = await get(`tallas_productos/producto/${p.id_producto}`);
        const activas = Array.isArray(tallasProducto)
          ? tallasProducto.filter(tp => tp.estado === 'Activo')
          : [];

        const tallasTexto = activas.map(tp => `${tp.talla} (${tp.stock})`).join(', ');

        return {
          ...p,
          tallas: tallasTexto,
          tallas_detalle: activas
        };
        
      } catch (e) {
        console.warn(`Error al cargar tallas para producto ${p.id_producto}`, e);
        return {
          ...p,
          tallas: '—',
          tallas_detalle: []
        };
      }
    }));

    renderTable(container, productosEnriquecidos, columns, {
      title: "Lista de Productos",
      container,
      data: productosEnriquecidos,
      onAddNew: () => initNuevoProductoController(),
      onEdit: async (producto) => {
        const row = container.querySelector(`tr[data-id="${producto.id_producto}"]`);
        if (row) {
          renderEditableRow(producto, columns, row, {
            container,
            data: productosEnriquecidos,
            categorias: await get("categorias"),
            generos: await get("generos"),
            onSave: async (original, updated) => {
              try {
                await put(`productos/${original.id_producto}`, updated);

                for (const tp of updated.tallas_actualizadas || []) {
                  await put(`tallas_productos/${tp.id_talla_producto}`, { stock: tp.stock });
                }

                success("Producto actualizado correctamente", "success");
                listProductosController(); // recarga
              } catch (err) {
                console.error("Error al guardar cambios:", err);
                error("Error al actualizar producto", "error");
              }
            }
          });
        }
      },
      onDelete: async (producto) => {
        const confirmDelete = await confirm(
          `¿Estás seguro de que deseas eliminar el producto "${producto.nombre}"? Esta acción no se puede deshacer.`
        );

        if (confirmDelete) {
          try {
            await del(`productos/${producto.id_producto}`);
            success("Producto eliminado correctamente", "success");
            listProductosController(); // recargar la tabla
          } catch (err) {
            console.error("Error al eliminar producto:", err);
            if (err.message && err.message.includes("ventas asociadas")) {
              error("No se puede eliminar el producto porque tiene ventas asociadas", "warning");
            } else {
              error("Error al eliminar el producto: " + (err.message || "Error desconocido"), "error");
            }
          }
        }
      },
      onAddTalla: async (producto) => {
        await agregarNuevaTalla(producto);
      }
    });

  } catch (error) {
    console.error("Error al cargar productos:", error);
    error("No se pudo cargar la lista de productos", "error");
  }
}
