//se puede listar(visualizar) y eliminar categorias

import { confirm, error, info, success } from "../../../../utils/alert.js";
import { get, put, del, post  } from "../../../../utils/manejo_api_optimizado.js";
import { renderSimpleTable } from "../../../../utils/tableUtils.js";

export default async function listCategoriasTallasController() {
  const contCategorias = document.getElementById("categorias-container");

  const cargarDatos = async () => {
    const [categorias] = await Promise.all([
      get("categorias"),

      
    ]);
    console.log(categorias);

    // 🟦 Categorías
    contCategorias.innerHTML = `
    <div class="table-container">
    <div class="table-header">
      <button class="btn-agregar" id="btn-agregar-categoria">
        <i class="fas fa-plus"></i> Agregar Categoría
      </button>
    </div>
        <div id="tabla-categorias"></div>
      </div>
    `;

    renderSimpleTable(
      document.getElementById("tabla-categorias"),
      categorias,
      [
        { key: "id_categoria", label: "ID" },
        { key: "nombre", label: "Nombre" },
        { key: "id_estado", label: "Estado", render: (value) => {
          const estadoTexto = value == 1 ? 'Activo' : 'Inactivo';
          return `<span class="estado-badge ${estadoTexto.toLowerCase()}">${estadoTexto}</span>`;
        }}
      ],
      {
        title: "Categorías",
        idKey: "id_categoria",
        onEdit: (id) => {
          localStorage.setItem("categoriaEditar", id);
          window.location.hash = "#/admin/categorias/editar";
        },
        onDelete: async (id) => {

          let res= await confirm("estas seguro de eliminar la categoria");
          if (res.isConfirmed) {
            
            try {
              
              await del(`categorias/${id}`);
              await success("Categoria eliminada exitosamente")
              
            } catch (err) {
              await error("No se puede eliminar categoria", "tiene productos asociados")
              
            }
          }
            cargarDatos();
          }
        }
      );






    // Botones agregar
    document.getElementById("btn-agregar-categoria").addEventListener("click", () => {
      window.location.hash = "#/admin/categorias/crear";
    });
    document.querySelector("table").classList.add("admin-table--aux");

  };

  await cargarDatos();
}
