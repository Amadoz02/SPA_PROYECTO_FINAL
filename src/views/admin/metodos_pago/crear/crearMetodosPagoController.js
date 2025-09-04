// Controlador Crear Métodos de Pago
import { post } from "../../../../utils/manejo_api_optimizado.js";
import { success, error } from "../../../../utils/alert.js";

export default async function crearMetodosPagoController() {
  const container = document.getElementById("crear-metodo-container");
  if (!container) return;

  container.innerHTML = `
    <h2>Crear Nuevo Método de Pago</h2>
    <form id="crearMetodoForm" class="admin-form">
      <div class="form-group">
        <label for="nombre">Nombre del Método:</label>
        <input type="text" id="nombre" name="nombre" required placeholder="Ej: Tarjeta de Crédito, Transferencia Bancaria">
      </div>

      <div class="form-group">
        <label for="estado">Estado:</label>
        <select id="estado" name="estado" required>
          <option value="Activo">Activo</option>
          <option value="Inactivo">Inactivo</option>
        </select>
      </div>

      <div class="form-actions">
        <button type="submit" class="btn-primary">Crear Método</button>
        <button type="button" id="btnCancelar" class="btn-secondary">Cancelar</button>
      </div>
    </form>
  `;

  // Event listeners
  const form = document.getElementById("crearMetodoForm");
  const btnCancelar = document.getElementById("btnCancelar");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const nombre = document.getElementById("nombre").value.trim();
    const estado = document.getElementById("estado").value;

    if (!nombre) {
      error("El nombre del método es obligatorio", "error");
      return;
    }

    try {
      await post("metodos", { nombre, estado });
      success("Método de pago creado correctamente", "success");

      // Limpiar formulario
      form.reset();

      // Opcional: redirigir a la lista
      setTimeout(() => {
        window.location.hash = "#/admin/metodos_pago/listar";
      }, 1500);

    } catch (err) {
      console.error("Error al crear método de pago:", err);
      error("Error al crear el método de pago", "error");
    }
  });

  btnCancelar.addEventListener("click", () => {
    window.location.hash = "#/admin/metodos_pago/listar";
  });
}
