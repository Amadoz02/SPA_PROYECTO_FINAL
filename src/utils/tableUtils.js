import abrirGaleriaModal from "./galeriaImagenes.js";
/**
 * Crea una tabla HTML dinámica con encabezados, datos y acciones
 * @param {HTMLElement} container - Elemento donde se insertará la tabla
 * @param {Array<Object>} data - Array de objetos con los datos
 * @param {Array<string>} columns - Claves del objeto que se mostrarán como columnas
 * @param {Object} options - Opciones de configuración
 * @param {Function} options.onEdit - Función callback para editar
 * @param {Function} options.onDelete - Función callback para eliminar
 * @param {Function} options.onAddNew - Función callback para agregar nuevo
 * @param {string} options.title - Título opcional para la sección
 */
// tableUtils.js
export function renderTable(container, data, columns, options = {}) {
  console.log("hola render table");
  console.log("container:", container);

  if (!container || !Array.isArray(data)) return;
  console.log("hola render table2");//ya no se muestra

  container.innerHTML = "";

  if (options.title) {
    const title = document.createElement("h3");
    title.textContent = options.title;
    container.appendChild(title);
  }

  const addBtn = document.createElement("button");
  addBtn.textContent = "➕ Agregar nuevo";
  addBtn.className = "btn-agregar";
  addBtn.addEventListener("click", () => options.onAddNew && options.onAddNew());
  container.appendChild(addBtn);

  const table = document.createElement("table");
  table.className = "admin-table";

  // encabezado
  const thead = document.createElement("thead");
  const headerRow = document.createElement("tr");
  columns.forEach(col => {
    const th = document.createElement("th");
    th.textContent = col.label;
    headerRow.appendChild(th);
  });
  const thAcciones = document.createElement("th");
  thAcciones.textContent = "Acciones";
  headerRow.appendChild(thAcciones);
  thead.appendChild(headerRow);
  table.appendChild(thead);

  // cuerpo
  const tbody = document.createElement("tbody");
  data.forEach(item => {
    const row = document.createElement("tr");
    row.setAttribute("data-id", item.id_producto);

    columns.forEach(col => {
      const td = document.createElement("td");

      if (col.key === "imagenes") {
        td.innerHTML = ""; // Limpia el contenido previo

        const imagenes = Array.isArray(item.imagenes) ? item.imagenes : [];

        imagenes.forEach(imgObj => {
          if (imgObj && imgObj.url_imagen) {
            const img = document.createElement("img");
            img.src = imgObj.url_imagen;
            img.alt = imgObj.descripcion || "Imagen de producto";
            img.style.width = "50px";
            img.style.height = "50px";
            img.style.objectFit = "cover";
            img.style.marginRight = "5px";
            img.style.borderRadius = "4px";
            td.appendChild(img);
            img.style.cursor = "pointer";
            img.addEventListener("click", () => {
            window.open(imgObj.url_imagen, "_blank");
            });

          }
        });

        if (td.childNodes.length === 0) {
          td.textContent = "Sin imágenes";
        }

      } else if (col.key === "tallas") {
      const tallas = Array.isArray(item.tallas_detalle) ? item.tallas_detalle : [];

      if (tallas.length === 0) {
        td.textContent = "—";
      } else {
        tallas.forEach(tp => {
          const div = document.createElement("div");
          div.className = "talla-item";
          div.textContent = `${tp.talla} (${tp.stock})`;
          td.appendChild(div);
        });
      }
    } else {
      td.textContent = item[col.key] ?? "";
    }

      row.appendChild(td);
    });


    // botones de acción SOLO en modo listado (no edición)
    const tdAcciones = document.createElement("td");
    const editBtn = document.createElement("button");
    editBtn.textContent = "✏️";
    editBtn.className = "btn-editar";
    editBtn.addEventListener("click", () => {
      options.onEdit && options.onEdit(item);
    });
    tdAcciones.appendChild(editBtn);

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "🗑️";
    deleteBtn.className = "btn-eliminar";
    deleteBtn.addEventListener("click", () => {
      options.onDelete && options.onDelete(item);
    });
    tdAcciones.appendChild(deleteBtn);

    row.appendChild(tdAcciones);
    tbody.appendChild(row);
  });

  table.appendChild(tbody);
  container.appendChild(table);
}
// tableUtils.js (añade al mismo archivo, tras renderTable)

export function renderEditableRow(item, columns, row, options) {
  row.innerHTML = "";
  columns.forEach(col => {
    const td = document.createElement("td");

    switch (col.key) {
      case "id_producto":
        td.textContent = item.id_producto;
        break;

      case "imagenes":
        td.innerHTML = "";
        const imagenes = Array.isArray(item.imagenes) ? item.imagenes : [];
        imagenes.forEach(imgObj => {
          if (imgObj?.url_imagen) {
            const img = document.createElement("img");
            img.src = imgObj.url_imagen;
            img.alt = imgObj.descripcion || "Imagen de producto";
            Object.assign(img.style, {
              width: "50px",
              height: "50px",
              objectFit: "cover",
              marginRight: "5px",
              borderRadius: "4px"
            });
            td.appendChild(img);
          }
        });
        if (td.childNodes.length === 0) td.textContent = "Sin imágenes";
        break;

      case "estado":
        const estadoSelect = document.createElement("select");
        ["Activo", "Inactivo"].forEach(val => {
          const opt = document.createElement("option");
          opt.value = val;
          opt.textContent = val;
          if (item.estado === val) opt.selected = true;
          estadoSelect.appendChild(opt);
        });
        td.appendChild(estadoSelect);
        break;

      case "categoria":
        const catSelect = document.createElement("select");
        options.categorias.forEach(cat => {
          const opt = document.createElement("option");
          opt.value = cat.id_categoria;
          opt.textContent = cat.nombre;
          if (item.id_categoria === cat.id_categoria) opt.selected = true;
          catSelect.appendChild(opt);
        });
        td.appendChild(catSelect);
        break;

      case "genero":
        const genSelect = document.createElement("select");
        options.generos.forEach(g => {
          const opt = document.createElement("option");
          opt.value = g.id_genero;
          opt.textContent = g.tipo_genero;
          if (item.id_genero === g.id_genero) opt.selected = true;
          genSelect.appendChild(opt);
        });
        td.appendChild(genSelect);
        break;

      case "precio":
      case "stock":
        const numInput = document.createElement("input");
        numInput.type = "number";
        numInput.value = item[col.key];
        td.appendChild(numInput);
        break;

      case "tallas":
        const tallas = Array.isArray(item.tallas_detalle) ? item.tallas_detalle : [];
        if (tallas.length === 0) {
          td.textContent = "Sin tallas activas";
        } else {
          tallas.forEach(tp => {
            const wrapper = document.createElement("div");
            Object.assign(wrapper.style, {
              display: "flex",
              alignItems: "center",
              gap: "6px",
              marginBottom: "4px"
            });

            const label = document.createElement("span");
            label.textContent = tp.talla;
            label.style.minWidth = "30px";

            const input = document.createElement("input");
            input.type = "number";
            input.value = tp.stock;
            input.min = "0";
            input.setAttribute("data-id-talla-producto", tp.id_talla_producto);
            input.setAttribute("data-talla", tp.talla);
            input.style.width = "60px";

            wrapper.appendChild(label);
            wrapper.appendChild(input);
            td.appendChild(wrapper);
          });
        }
        break;

      default:
        const textInput = document.createElement("input");
        textInput.type = "text";
        textInput.value = item[col.key] || "";
        td.appendChild(textInput);
        break;
    }

    row.appendChild(td);
  });

  // Acciones Guardar / Cancelar + Imagenes/Tallas SOLO en edición
  const tdAcciones = document.createElement("td");

  // Botón Imagen
  const btnImagenes = document.createElement("button");
  btnImagenes.textContent = "🖼️ Imagen";
  btnImagenes.className = "btn-imagenes";
  btnImagenes.addEventListener("click", () => abrirGaleriaModal(item));
  tdAcciones.appendChild(btnImagenes);

  // Botón Talla
  if (options.onAddTalla) {
    const addTallaBtn = document.createElement("button");
    addTallaBtn.textContent = "👕Talla";
    addTallaBtn.className = "btn-agregar";
    addTallaBtn.addEventListener("click", () => {
      options.onAddTalla(item);
    });
    tdAcciones.appendChild(addTallaBtn);
  }

  // Guardar
  const saveBtn = document.createElement("button");
  saveBtn.textContent = "💾 Guardar";
  saveBtn.className = "btn-editar";
  saveBtn.addEventListener("click", () => {
    const updated = {};

    // Captura de campos normales
    columns.forEach((col, i) => {
      if (["id_producto", "imagenes", "tallas"].includes(col.key)) return;

      const cell = row.children[i];
      const control = cell.querySelector("input, select");
      if (!control) return;

      let value = control.value;
      if (["precio", "stock", "categoria", "genero"].includes(col.key)) {
        value = Number(value);
      }

      if (col.key === "categoria") {
        updated.id_categoria = value;
      } else if (col.key === "genero") {
        updated.id_genero = value;
      } else {
        updated[col.key] = value;
      }
    });

    // Captura de tallas
    const tallasInputs = row.querySelectorAll('input[data-id-talla-producto]');
    const tallasActualizadas = [];

    tallasInputs.forEach(input => {
      const idTallaProducto = Number(input.getAttribute("data-id-talla-producto"));
      const talla = input.getAttribute("data-talla");
      const stock = Number(input.value);
      tallasActualizadas.push({ id_talla_producto: idTallaProducto, talla, stock });
    });

    updated.tallas_actualizadas = tallasActualizadas;

    options.onSave && options.onSave(item, updated);
  });
  tdAcciones.appendChild(saveBtn);

  // Cancelar
  const cancelBtn = document.createElement("button");
  cancelBtn.textContent = "❌ Cancelar";
  cancelBtn.className = "btn-eliminar";
  cancelBtn.addEventListener("click", () => {
    renderTable(options.container, options.data, columns, options);
  });
  tdAcciones.appendChild(cancelBtn);

  row.appendChild(tdAcciones);
}

export function renderSimpleTable(container, data, columns, { title, onEdit, onDelete, idKey = "id" }) {
  container.innerHTML = `
    <h3>${title || "Tabla Simple"}</h3>
    <table class="admin-table">
      <thead>
        <tr>
          ${columns.map(col => `<th>${col.label}</th>`).join('')}
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        ${data.map(item => `
          <tr data-id="${item[idKey]}">
            ${columns.map(col => {
              const value = item[col.key];
              return `<td>${col.render ? col.render(value, item) : value}</td>`;
            }).join('')}
            <td>
              <button class="btn-editar" data-id="${item[idKey]}">✏️</button>
              <button class="btn-eliminar" data-id="${item[idKey]}">🗑️</button>
            </td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;

  container.querySelectorAll('.btn-editar').forEach(btn => {
    btn.addEventListener('click', () => onEdit(btn.dataset.id));
  });

  container.querySelectorAll('.btn-eliminar').forEach(btn => {
    btn.addEventListener('click', () => onDelete(btn.dataset.id));
  });
}

// Optimized table with pagination for large datasets
export function renderPaginatedTable(container, data, columns, options = {}) {
  const {
    title = "Tabla Paginada",
    onEdit,
    onDelete,
    idKey = "id",
    pageSize = 20,
    currentPage = 1
  } = options;

  const totalPages = Math.ceil(data.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const currentData = data.slice(startIndex, endIndex);

  container.innerHTML = `
    <h3>${title}</h3>
    <div class="table-controls">
      <div class="table-info">
        Mostrando ${startIndex + 1}-${Math.min(endIndex, data.length)} de ${data.length} registros
      </div>
      <div class="pagination-controls">
        <button class="btn-page" data-page="${currentPage - 1}" ${currentPage === 1 ? 'disabled' : ''}>← Anterior</button>
        <span class="page-info">Página ${currentPage} de ${totalPages}</span>
        <button class="btn-page" data-page="${currentPage + 1}" ${currentPage === totalPages ? 'disabled' : ''}>Siguiente →</button>
      </div>
    </div>
    <table class="admin-table">
      <thead>
        <tr>
          ${columns.map(col => `<th>${col.label}</th>`).join('')}
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        ${currentData.map(item => `
          <tr data-id="${item[idKey]}">
            ${columns.map(col => {
              const value = item[col.key];
              return `<td>${col.render ? col.render(value, item) : value}</td>`;
            }).join('')}
            <td>
              <button class="btn-editar" data-id="${item[idKey]}">✏️</button>
              <button class="btn-eliminar" data-id="${item[idKey]}">🗑️</button>
            </td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;

  // Add event listeners for pagination
  container.querySelectorAll('.btn-page').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const newPage = parseInt(e.target.dataset.page);
      if (newPage >= 1 && newPage <= totalPages) {
        renderPaginatedTable(container, data, columns, { ...options, currentPage: newPage });
      }
    });
  });

  container.querySelectorAll('.btn-editar').forEach(btn => {
    btn.addEventListener('click', () => onEdit(btn.dataset.id));
  });

  container.querySelectorAll('.btn-eliminar').forEach(btn => {
    btn.addEventListener('click', () => onDelete(btn.dataset.id));
  });
}


