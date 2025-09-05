// Controlador Listar Productos
import { error, success, confirm} from "../../../../utils/alert.js";
import { get, patch, del, put, post } from "../../../../utils/manejo_api_optimizado.js";
import { renderTable, renderEditableRow } from "../../../../utils/tableUtils.js";
import { initNuevoProductoController } from "../../../../controllers/nuevoProductoController.js";


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


export default async function listProductosController() {
  const container = document.getElementById("productos-container"); 
  if (!container) return;
  console.log("container desde el controller:", container);//indefinido

  try {
    const productos = await get("productos");
    console.log("productos obtenbidos:",productos);
    
    // Cache tallas and categorias to avoid multiple calls
    const tallasCache = {};
    const categoriasCache = {};
    const generosCache = {};

    // Fetch all tallas-productos once
    const allTallasProductos = await get("tallas-productos/");
    allTallasProductos.forEach(tp => {
      if (!tallasCache[tp.id_producto]) {
        tallasCache[tp.id_producto] = [];
      }
      tallasCache[tp.id_producto].push(tp);
    });

    // Fetch all categorias once
    const allCategorias = await get("categorias/");
    allCategorias.forEach(cat => {
      categoriasCache[cat.id_categoria] = cat.nombre;
    });

    // Fetch all generos once
    const allGeneros = await get("generos/");
    allGeneros.forEach(gen => {
      generosCache[gen.id_genero] = gen.tipo_genero;
    });

    // Enriquecer productos con datos cacheados
    const productosEnriquecidos = productos.map(p => {
      const tallasProducto = tallasCache[p.id_producto] || [];
      const activas = tallasProducto.filter(tp => tp.id_estado === 1 || tp.id_estado === 2);
      const tallasTexto = activas.map(tp => `${tp.talla} (${tp.stock})`).join(', ');

      return {
        ...p,
        tallas: tallasTexto || '—',
        tallas_detalle: activas,
        categoria: categoriasCache[p.id_categoria] || 'Sin categoría',
        genero: generosCache[p.id_genero] || 'Sin género'
      };
    });
    
    renderTable(container, productosEnriquecidos, columns, {
      title: "Gestión de Productos",
      container,
      data: productosEnriquecidos,
      onAddNew: () => {
         // Navegar a la ruta de edición SPA
        window.location.hash = "#/admin/productos/crear";
      },
      onEdit: async (producto) => {
        // Guardar el producto seleccionado en localStorage
        localStorage.setItem("productoEditar", JSON.stringify(producto));
        // Navegar a la ruta de edición SPA
        window.location.hash = "#/admin/productos/editar";
        location.reload();
      },
      onDelete: async (producto) => {
        const confirmDelete = await confirm(
          `¿Estás seguro de que deseas eliminar el producto "${producto.nombre}"? Esta acción no se puede deshacer.`
        );

        if (confirmDelete) {
          
          try{
            await del(`productos/${producto.id_producto}`);
            success("Producto eliminado correctamente", "success");
            listProductosController(); 
          } catch (err) {
            console.error("Error al eliminar producto:", err);
            console.error("Detalles del error:", err);

            // Manejar errores específicos del backend
            if (err.message) {
              if (err.message.includes("ventas asociadas") || err.message.includes("foreign key")) {
                error("No se puede eliminar el producto porque tiene ventas o registros relacionados", "Hey");
              } else if (err.message.includes("Error interno")) {
                error("Error interno del servidor al eliminar el producto. Revisa los logs del backend.", "error");
              } else {
                error(`Error al eliminar el producto: ${err.message}`, "error");
              }
            } else {
              error("Error desconocido al eliminar el producto", "error");
            }
          }
        }
      }
    });

  } catch (error) {
    console.error("Error al cargar productos:", error);
    error("No se pudo cargar la lista de productos", "error");
  }
}