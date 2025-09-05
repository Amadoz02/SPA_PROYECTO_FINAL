// Controlador Editar Categoría
import { get, put } from "../../../../utils/manejo_api_optimizado.js";
import { success, error } from "../../../../utils/alert.js";

export default async function editarCategoriasController() {
  const container = document.getElementById("editar-categoria-container");
  if (!container) return;

  // Obtener el ID de la categoría a editar desde localStorage
  const categoriaId = localStorage.getItem("categoriaEditar");
  if (!categoriaId) {
    error("No se encontró la categoría a editar", "error");
    window.location.hash = "#/admin/categorias/listar";
    return;
  }

  try {
    // Cargar datos de la categoría
    const categorias = await get("categorias");
    const categoria = categorias.find(c => c.id_categoria == categoriaId);

    if (!categoria) {
      error("Categoría no encontrada", "error");
      window.location.hash = "#/admin/categorias/listar";
      return;
    }

    container.innerHTML = `
      <h2>Editar Categoría</h2>
      <form id="editarCategoriaForm" class="form-producto" novalidate>
        <div class="form-grid">
          <div class="form-section">
            <h4>Información de la Categoría</h4>
            <div class="form-group">
              <label for="nombre">Nombre de la Categoría:</label>
              <input type="text" id="nombre" name="nombre" required value="${categoria.nombre || ''}" placeholder="Nombre de la categoría">
            </div>

            <div class="form-group">
              <label for="estado">Estado:</label>
              <select id="estado" name="estado" required>
                <option value="1" ${categoria.id_estado == 1 ? 'selected' : ''}>Activo</option>
                <option value="2" ${categoria.id_estado == 2 ? 'selected' : ''}>Inactivo</option>
              </select>
            </div>
          </div>
        </div>

        <div class="form-actions">
          <button type="button" id="btnCancelar" class="btn-cancelar">Cancelar</button>
          <button type="submit" class="btn-agregar">Actualizar Categoría</button>
        </div>
      </form>
    `;

    // Event listeners
    const form = document.getElementById("editarCategoriaForm");
    const btnCancelar = document.getElementById("btnCancelar");

    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const nombre = document.getElementById("nombre").value.trim();
      const id_estado = document.getElementById("estado").value;
        console.log("nombre categoria",nombre, "estado",id_estado);
        
      if (!nombre) {
        error("El nombre de la categoría es obligatorio", "error");
        return;
      }

      try {
        await put(`categorias/${categoriaId}`, { nombre, id_estado });
        success("Categoría actualizada correctamente", "success");

        // Limpiar localStorage y redirigir
        localStorage.removeItem("categoriaEditar");
        setTimeout(() => {
          window.location.hash = "#/admin/categorias/listar";
        }, 1500);

      } catch (err) {
        console.error("Error al actualizar categoría:", err);
        error("Error al actualizar la categoría", "error");
      }
    });

    btnCancelar.addEventListener("click", () => {
      localStorage.removeItem("categoriaEditar");
      window.location.hash = "#/admin/categorias/listar";
    });

  } catch (err) {
    console.error("Error al cargar categoría:", err);
    error("Error al cargar los datos de la categoría", "error");
    window.location.hash = "#/admin/categorias/listar";
  }
}
