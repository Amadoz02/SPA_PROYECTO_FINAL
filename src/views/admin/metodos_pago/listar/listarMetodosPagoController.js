// Controlador Listar Métodos de Pago
import { get, del } from "../../../../utils/manejo_api_optimizado.js";
import { renderSimpleTable } from "../../../../utils/tableUtils.js";
import { error, success, confirm } from "../../../../utils/alert.js";

const columns = [
  { key: "id_metodo", label: "ID" },
  { key: "nombre", label: "Nombre" },
  { key: "nombre_estado", label: "Estado", render: (value) => `<span class="estado-badge ${value === 'Activo' ? 'activo' : 'inactivo'}">${value}</span>` }
];

export default async function listarMetodosPagoController() {
  const container = document.getElementById("metodos-pago-container");
  if (!container) return;

  try {
    const metodosPago = await get("metodos");

    console.log(metodosPago);

    // Agregar botón de crear nuevo
    const addBtn = document.createElement("button");
    addBtn.textContent = "➕ Agregar Nuevo Método";
    addBtn.className = "btn-agregar";
    addBtn.addEventListener("click", () => {
      window.location.hash = "#/admin/metodos_pago/crear";
    });
    container.appendChild(addBtn);

    renderSimpleTable(container, metodosPago, columns, {
      title: "Métodos de Pago",
      onEdit: (id) => {
        // Guardar el ID en localStorage para el controlador de edición
        localStorage.setItem("metodoPagoEditar", id);
        // Navegar a la ruta de edición
        window.location.hash = "#/admin/metodos_pago/editar";
      },
      onDelete: async (id) => {
        const metodo = metodosPago.find(m => m.id_metodo == id);
        const confirmDelete = await confirm(`¿Estás seguro de que deseas eliminar el método de pago "${metodo.nombre}"?`);

        if (confirmDelete) {
          try {
            await del(`metodos/${id}`);
            success("Método de pago eliminado correctamente", "success");
            listarMetodosPagoController(); // Recargar la tabla
          } catch (err) {
            console.error("Error al eliminar método de pago:", err);
            error(" método de pago esta siendo usado", "no se puede eliminar");
          }
        }
      },
      idKey: "id_metodo"
    });

  } catch (error) {
    console.error("Error al cargar métodos de pago:", error);
    error("No se pudo cargar la lista de métodos de pago", "error");
  }
}
