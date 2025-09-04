import { get } from "../utils/manejo_api_optimizado.js";
import { renderSimpleTable } from "../utils/tableUtils.js";
import { editarItem, eliminarItem, crearItem } from "../utils/crudUtils.js";

export default async function listCategoriasTallasController() {
  const contCategorias = document.getElementById("categorias-container");
  const contTallas = document.getElementById("tallas-container");
  const contTallasProductos = document.getElementById("tallas-productos-container");
  if (!contCategorias || !contTallas || !contTallasProductos) return;

  const cargarDatos = async () => {
    const [categorias, tallas, tallasProductos] = await Promise.all([
      get("categorias"),
      get("tallas"),
      get("tallas_productos")
    ]);

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
        { key: "estado", label: "Estado" }
      ],
      {
        title: "Categorías",
        idKey: "id_categoria",
        onEdit: async (id) => {
          const categoria = categorias.find(c => c.id_categoria === parseInt(id));
          if (categoria) {
            const result = await editarItem("categorias", categoria);
            if (result) cargarDatos();
          }
        },
        onDelete: async (id) => {
          const categoria = categorias.find(c => c.id_categoria === parseInt(id));
          const result = await eliminarItem("categorias", id, `la categoría "${categoria?.nombre || id}"`);
          if (result) cargarDatos();
        }
      }
    );

    // 🟨 Tallas
    contTallas.innerHTML = `
      <div class="table-container">
      <div class="table-header">
        <button class="btn-agregar" id="btn-agregar">
          <i class="fas fa-plus"></i>  Agregar Talla  
        </button>
      </div>
        <div id="tabla-tallas">
        </div>
      </div>
    `;

    renderSimpleTable(
      document.getElementById("tabla-tallas"),
      tallas,
      [
        { key: "id_talla", label: "ID" },
        { key: "talla", label: "Talla" }
      ],
      {
        title: "Tallas",
        idKey: "id_talla",
        onEdit: async (id) => {
          const talla = tallas.find(t => t.id_talla === parseInt(id));
          if (talla) {
            const result = await editarItem("tallas", talla);
            if (result) cargarDatos();
          }
        },
        onDelete: async (id) => {
          const talla = tallas.find(t => t.id_talla === parseInt(id));
          const result = await eliminarItem("tallas", id, `la talla "${talla?.talla || id}"`);
          if (result) cargarDatos();
        }
      }
    );

// 🟩 Tallas por producto
contTallasProductos.innerHTML = `
  <div class="table-container">
    <div id="filtro-tallas-productos" style="margin-bottom: 10px;"></div>
    <div id="tabla-tallas-productos"></div>
  </div>
`;

// 1. Generar filtro por producto
const productosUnicos = [...new Set(tallasProductos.map(tp => tp.nombre_producto))];
document.getElementById("filtro-tallas-productos").innerHTML = `
  <label for="filtro-producto">Filtrar por producto:</label>
  <select id="filtro-producto" class="filtro-select">
    <option value="">Todos</option>
    ${productosUnicos.map(p => `<option value="${p}">${p}</option>`).join('')}
  </select>
`;

// 2. Función para renderizar tabla con filtro aplicado
function renderTablaFiltrada(productoSeleccionado = "") {
  const datosFiltrados = productoSeleccionado
    ? tallasProductos.filter(tp => tp.nombre_producto === productoSeleccionado)
    : tallasProductos;

  renderSimpleTable(
    document.getElementById("tabla-tallas-productos"),
    datosFiltrados,
    [
      { key: "id_talla_producto", label: "ID" },
      { key: "nombre_producto", label: "Producto" },
      { key: "talla", label: "Talla" },
      { key: "stock", label: "Stock" },
      { key: "estado", label: "Estado" }
    ],
    {
      title: "Tallas por Producto",
      idKey: "id_talla_producto",
      onEdit: async (id) => {
        const tp = datosFiltrados.find(t => t.id_talla_producto === parseInt(id));
        const result = await editarItem("tallas_productos", tp);
        if (result) cargarDatos(); // Puedes mejorar esto para mantener el filtro activo
      },
      onDelete: async (id) => {
        const tp = datosFiltrados.find(t => t.id_talla_producto === parseInt(id));
        const result = await eliminarItem("tallas_productos", id, `la talla "${tp?.talla}" del producto "${tp?.nombre_producto}"`);
        if (result) cargarDatos();
      }
    }
  );
}

// 3. Escuchar cambios en el filtro
document.getElementById("filtro-producto").addEventListener("change", (e) => {
  renderTablaFiltrada(e.target.value);
});

// 4. Render inicial sin filtro
renderTablaFiltrada();



    // Botones agregar
    document.getElementById("btn-agregar-categoria").addEventListener("click", async () => {
      const result = await crearItem("categorias", {
        key: "nombre",
        label: "categoría",
        placeholder: "Nombre de la categoría"
      });
      if (result) cargarDatos();
    });

    document.getElementById("btn-agregar-talla").addEventListener("click", async () => {
      const result = await crearItem("tallas", {
        key: "talla",
        label: "talla",
        placeholder: "Nombre de la talla"
      });
      if (result) cargarDatos();
    });
  };

  await cargarDatos();
}
