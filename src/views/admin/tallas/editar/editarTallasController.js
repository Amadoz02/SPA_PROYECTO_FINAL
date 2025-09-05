// Controlador Editar talla
import { get, put } from "../../../../utils/manejo_api_optimizado.js";
import { success, error } from "../../../../utils/alert.js";

export default async function editartallasController() {
  const container = document.getElementById("editar-talla-container");
  if (!container) return;

  // Obtener el ID de la talla a editar desde localStorage
  const tallaId = localStorage.getItem("tallaEditar");
  if (!tallaId) {
    error("No se encontró la talla a editar", "error");
    window.location.hash = "#/admin/tallas/listar";
    return;
  }

  try {
    // Cargar datos de la talla
    const tallas = await get("tallas");
    const talla = tallas.find(c => c.id_talla == tallaId);

    if (!talla) {
      error("talla no encontrada", "error");
      window.location.hash = "#/admin/tallas/listar";
      return;
    }

    container.innerHTML = `
      <h2>Editar talla</h2>
      <form id="editartallaForm" class="form-producto" novalidate>
        <div class="form-grid">
          <div class="form-section">
            <h4>Información de la talla</h4>
            <div class="form-group">
              <label for="nombre">Nombre de la talla:</label>
              <input type="text" id="nombre" name="nombre" required value="${talla.talla || ''}" placeholder="Nombre de la talla">
            </div>

            <div class="form-group">
              <label for="estado">Estado:</label>
              <select id="estado" name="estado" required>
                <option value="1" ${talla.id_estado == 1 ? 'selected' : ''}>Activo</option>
                <option value="2" ${talla.id_estado == 2 ? 'selected' : ''}>Inactivo</option>
              </select>
            </div>
          </div>
        </div>

        <div class="form-actions">
          <button type="button" id="btnCancelar" class="btn-cancelar">Cancelar</button>
          <button type="submit" class="btn-agregar">Actualizar talla</button>
        </div>
      </form>
    `;

    // Event listeners
    const form = document.getElementById("editartallaForm");
    const btnCancelar = document.getElementById("btnCancelar");

    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const talla = document.getElementById("nombre").value.trim();
      const id_estado = document.getElementById("estado").value;
        console.log("nombre talla",talla, "estado",id_estado);
        
      if (!talla) {
        error("El nombre de la talla es obligatorio", "error");
        return;
      }

      try {
        await put(`tallas/${tallaId}`, { talla, id_estado });
        success("talla actualizada correctamente", "success");

        // Limpiar localStorage y redirigir
        localStorage.removeItem("tallaEditar");
        setTimeout(() => {
          window.location.hash = "#/admin/tallas/listar";
        }, 1500);

      } catch (err) {
        console.error("Error al actualizar talla:", err);
        error("Error al actualizar la talla", "error");
      }
    });

    btnCancelar.addEventListener("click", () => {
      localStorage.removeItem("tallaEditar");
      window.location.hash = "#/admin/tallas/listar";
    });

  } catch (err) {
    console.error("Error al cargar talla:", err);
    error("Error al cargar los datos de la talla", "error");
    window.location.hash = "#/admin/tallas/listar";
  }
}
