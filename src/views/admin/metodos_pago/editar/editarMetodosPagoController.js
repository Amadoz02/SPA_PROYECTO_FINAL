// Controlador Editar Métodos de Pago
import { get, put } from "../../../../utils/manejo_api_optimizado.js";
import { success, error } from "../../../../utils/alert.js";

export default async function editarMetodosPagoController() {
  const container = document.getElementById("editar-metodo-container");
  if (!container) return;

  // Obtener el ID del método a editar desde localStorage
  const metodoId = localStorage.getItem("metodoPagoEditar");
  if (!metodoId) {
    error("No se encontró el método de pago a editar", "error");
    window.location.hash = "#/admin/metodos_pago/listar";
    return;
  }

  try {
    // Cargar datos del método
    const metodos = await get("metodos");
    const metodo = metodos.find(m => m.id_metodo == metodoId);

    if (!metodo) {
      error("Método de pago no encontrado", "error");
      window.location.hash = "#/admin/metodos_pago/listar";
      return;
    }

    container.innerHTML = `
      <h2>Editar Método de Pago</h2>
      <form id="editarMetodoForm" class="form-producto" novalidate>
        <div class="form-grid">
          <div class="form-section">
            <h4>Información del Método</h4>
            <div class="form-group">
              <label for="nombre">Nombre del Método:</label>
              <input type="text" id="nombre" name="nombre" required value="${metodo.nombre || ''}" placeholder="Ej: Tarjeta de Crédito, Transferencia Bancaria">
            </div>

            <div class="form-group">
              <label for="estado">Estado:</label>
              <select id="estado" name="estado" required>
                <option value="1" ${metodo.nombre_estado === 'Activo' ? 'selected' : ''}>Activo</option>
                <option value="2" ${metodo.nombre_estado === 'Inactivo' ? 'selected' : ''}>Inactivo</option>
              </select>
            </div>
          </div>
        </div>

        <div class="form-actions">
          <button type="button" id="btnCancelar" class="btn-cancelar">Cancelar</button>
          <button type="submit" class="btn-agregar">Actualizar Método</button>
        </div>
      </form>
    `;

    // Event listeners
    const form = document.getElementById("editarMetodoForm");
    const btnCancelar = document.getElementById("btnCancelar");

    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const nombre = document.getElementById("nombre").value.trim();
      const id_estado = document.getElementById("estado").value;

      if (!nombre) {
        error("El nombre del método es obligatorio", "error");
        return;
      }

      try {
        await put(`metodos/${metodoId}`, { nombre, id_estado });
        success("Método de pago actualizado correctamente", "success");

        // Limpiar localStorage y redirigir
        localStorage.removeItem("metodoPagoEditar");
        setTimeout(() => {
          window.location.hash = "#/admin/metodos_pago/listar";
        }, 1500);

      } catch (err) {
        console.error("Error al actualizar método de pago:", err);
        error("Error al actualizar el método de pago", "error");
      }
    });

    btnCancelar.addEventListener("click", () => {
      localStorage.removeItem("metodoPagoEditar");
      window.location.hash = "#/admin/metodos_pago/listar";
    });

  } catch (err) {
    console.error("Error al cargar método de pago:", err);
    error("Error al cargar los datos del método de pago", "error");
    window.location.hash = "#/admin/metodos_pago/listar";
  }
}
