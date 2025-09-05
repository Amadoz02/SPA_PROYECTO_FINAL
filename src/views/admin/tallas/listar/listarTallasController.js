//se puede listar(visualizar) y eliminar tallas

import { confirm, error, info, success } from "../../../../utils/alert.js";
import { get, put, del, post  } from "../../../../utils/manejo_api_optimizado.js";
import { renderSimpleTable } from "../../../../utils/tableUtils.js";
localStorage.removeItem("tallaEditar");
export default async function listTallasController() {
  const conttallas = document.getElementById("tallas-container");

  const cargarDatos = async () => {
    const [tallas] = await Promise.all([
      get("tallas"),

      
    ]);
    console.log(tallas);

    // 🟦 Categorías
    conttallas.innerHTML = `
    <div class="table-container">
    <div class="table-header">
      <button class="btn-agregar" id="btn-agregar-talla">
        <i class="fas fa-plus"></i> Agregar Categoría
      </button>
    </div>
        <div id="tabla-tallas"></div>
      </div>
    `;

    renderSimpleTable(
      document.getElementById("tabla-tallas"),
      tallas,
      [
        { key: "id_talla", label: "ID" },
        { key: "talla", label: "Talla" },
        { key: "id_estado", label: "Estado", render: (value) => {
          const estadoTexto = value == 1 ? 'Activo' : 'Inactivo';
          return `<span class="estado-badge ${estadoTexto.toLowerCase()}">${estadoTexto}</span>`;
        }}
      ],
      {
        title: "Tallas",
        idKey: "id_talla",
        onEdit: (id) => {
          localStorage.setItem("tallaEditar", id);
          window.location.hash = "#/admin/tallas/editar";
        },
        onDelete: async (id) => {

          let res= await confirm("estas seguro de eliminar la talla");
          if (res.isConfirmed) {
            
            try {
              
              await del(`tallas/${id}`);
              await success("talla eliminada exitosamente")
              
            } catch (err) {
              await error("No se puede eliminar talla", "tiene productos asociados")
              
            }
          }
            cargarDatos();
          }
        }
      );






    // Botones agregar
    document.getElementById("btn-agregar-talla").addEventListener("click", () => {
      window.location.hash = "#/admin/tallas/crear";
    });

  };

  await cargarDatos();
}
