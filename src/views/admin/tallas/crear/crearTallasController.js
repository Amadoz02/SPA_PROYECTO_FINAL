// Controlador Crear talla
import { post } from "../../../../utils/manejo_api_optimizado.js";
import { success, error } from "../../../../utils/alert.js";

export default async function creartallasController() {
  const container = document.getElementById("crear-talla-container");
  if (!container) return;

  container.innerHTML = `
    <h2>Crear Nueva talla</h2>
    <form id="creartallaForm" class="form-producto" novalidate>
      <div class="form-grid">
        <div class="form-section">
          <h4>Información de la talla</h4>
          <div class="form-group">
            <label for="nombre">Nombre de la talla:</label>
            <input type="text" id="nombre" name="nombre" required placeholder="Ej: Ropa, Accesorios, Calzado">
          </div>

          <div class="form-group">
            <label for="estado">Estado:</label>
            <select id="estado" name="estado" required>
              <option value="1">Activo</option>
              <option value="2">Inactivo</option>
            </select>
          </div>
        </div>
      </div>

      <div class="form-actions">
        <button type="button" id="btnCancelar" class="btn-cancelar">Cancelar</button>
        <button type="submit" class="btn-agregar">Crear talla</button>
      </div>
    </form>
  `;

  // Event listeners
  const form = document.getElementById("creartallaForm");
  const btnCancelar = document.getElementById("btnCancelar");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const talla = document.getElementById("nombre").value.trim();
    const id_estado = document.getElementById("estado").value;

    if (!talla) {
      error("El nombre de la talla es obligatorio", "error");
      return;
    }

    try {
      await post("tallas", { talla, id_estado });
      success("talla creada correctamente", "success");

      // Limpiar formulario
      form.reset();

      // Opcional: redirigir a la lista
      setTimeout(() => {
        window.location.hash = "#/admin/tallas/listar";
      }, 1500);

    } catch (err) {
      console.error("Error al crear talla:", err);
      error("EL nombre de la talla ya existe", "Talla repetida");
    }
  });

  btnCancelar.addEventListener("click", () => {
    window.location.hash = "#/admin/tallas/listar";
  });
}
