// Controlador Editar Productos
import { get, put, post, del } from "../../../../utils/manejo_api_optimizado.js";
import { success, error,confirm,info } from "../../../../utils/alert.js";

export  class EditarProductoController {
  constructor() {
    this.producto = null;
    this.form = null;
    this.categorias = [];
    this.tallas = [];
    this.generos = [];
    this.imagenesSeleccionadas = [];
    this.tallasSeleccionadas = [];
    this.imagenesActuales = [];
  }

  async init() {
    this.producto = JSON.parse(localStorage.getItem("productoEditar"));
    if (!this.producto) {
      error("No se encontró el producto a editar", "error");
      window.location.hash = "#/admin/productos/listar";
      return;
    }

    await this.cargarDatosIniciales();
    this.configurarFormulario();
    this.llenarFormulario();
    this.configurarEventos();
  }

  async cargarDatosIniciales() {
    try {
      const [categorias, tallas, generos] = await Promise.all([
        get("categorias/activas"),
        get("tallas/Activas"),
        get("generos")
      ]);

      this.categorias = categorias;
      this.tallas = tallas;
      this.generos = generos;

      // Cargar tallas del producto
      const tallasProducto = await get(`tallas-productos/producto/${this.producto.id_producto}`);
      this.tallasSeleccionadas = tallasProducto.filter(tp => tp.id_estado === 1 || tp.id_estado === 2);

      // Cargar imágenes del producto
      try {
        this.imagenesActuales = await get(`imagenes/producto/${this.producto.id_producto}`);
      } catch (e) {
        console.warn("No se pudieron cargar las imágenes:", e);
        this.imagenesActuales = [];
      }

    } catch (err) {
      console.error("Error al cargar datos iniciales:", err);
      error("Error al cargar datos del formulario", "error");
    }
  }

  configurarFormulario() {
    this.form = document.getElementById("formEditarProducto");
    if (!this.form) return;

    // Llenar selects
    this.llenarSelects();
  }

  llenarSelects() {
    // Categorías
    const selectCategoria = document.getElementById('categoriaProducto');
    selectCategoria.innerHTML = '<option value="">Seleccione una categoría</option>';
    this.categorias.forEach(cat => {
      const option = document.createElement('option');
      option.value = cat.id_categoria;
      option.textContent = cat.nombre;
      selectCategoria.appendChild(option);
    });

    // Géneros
    const selectGenero = document.getElementById('generoProducto');
    selectGenero.innerHTML = '<option value="">Seleccione un género</option>';
    this.generos.forEach(genero => {
      const option = document.createElement('option');
      option.value = genero.id_genero;
      option.textContent = genero.tipo_genero;
      selectGenero.appendChild(option);
    });
    
  }

  llenarFormulario() {
    // Información básica
    let id_estado;
    console.log(this.producto);
    if (this.producto.estado=='Activo') {
        id_estado=1;
    }else{
        id_estado=2;
    }
    document.getElementById('nombreProducto').value = this.producto.nombre || '';
    document.getElementById('descripcionProducto').value = this.producto.descripcion || '';
    document.getElementById('precioProducto').value = this.producto.precio || '';
    document.getElementById('categoriaProducto').value = this.producto.id_categoria || '';
    document.getElementById('generoProducto').value = this.producto.id_genero || '';
    document.getElementById('estadoProducto').value = id_estado || '';

    // Tallas
    this.llenarTallas();

    // Imágenes
    this.mostrarImagenesActuales();
  }

  llenarTallas() {
    const tallasBody = document.getElementById('tallasBody');
    tallasBody.innerHTML = '';

    this.tallasSeleccionadas.forEach(tp => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>
          <select class="talla-select" required>
            <option value="">Seleccione talla</option>
            ${this.tallas.map(talla => `<option value="${talla.id_talla}" ${talla.id_talla === tp.id_talla ? 'selected' : ''}>${talla.talla}</option>`).join('')}
          </select>
        </td>
        <td>
          <input type="number" class="talla-stock" min="0" required value="${tp.stock}" placeholder="Stock">
        </td>
        <td>
          <select class="talla-estado talla-select" required>
            <option value="1" ${tp.id_estado === 1 ? 'selected' : ''}>Activo </option>
            <option value="2" ${tp.id_estado === 2 ? 'selected' : ''}>Inactivo</option>
          </select>
        </td>
        <td>
          <button type="button" class="btn-eliminar-talla btn-eliminar" data-id-talla-producto="${tp.id_talla_producto}">Eliminar</button>
        </td>
      `;
      tallasBody.appendChild(row);
    });
  }

  mostrarImagenesActuales() {
    const container = document.getElementById('imagenesActuales');
    container.innerHTML = '';

    this.imagenesActuales.forEach(img => {
      const imgElement = document.createElement('img');
      imgElement.src = `${img.url_imagen}`;
      imgElement.alt = img.descripcion || 'Imagen del producto';
      imgElement.style.width = '100px';
      imgElement.style.height = '100px';
      imgElement.style.objectFit = 'cover';
      imgElement.style.margin = '5px';

      const deleteBtn = document.createElement('button');
      deleteBtn.textContent = 'Eliminar';
      deleteBtn.classList.add('btn-eliminar');
      deleteBtn.onclick = () => this.eliminarImagen(img.id_imagen);

      const div = document.createElement('div');
      div.appendChild(imgElement);
      div.appendChild(deleteBtn);
      container.appendChild(div);
    });
  }

  async eliminarImagen(idImagen) {
    if (await confirm('¿Estás seguro de que deseas eliminar esta imagen?')) {
      try {
        await del(`imagenes/${idImagen}`);
        this.imagenesActuales = this.imagenesActuales.filter(img => img.id_imagen !== idImagen);
        this.mostrarImagenesActuales();
        success("Imagen eliminada correctamente");
      } catch (err) {
        error("Error al eliminar la imagen: " + (err.message || "Error desconocido"));
      }
    }
  }

  configurarEventos() {
    // Submit del formulario
    this.form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.actualizarProducto();
    });

    // Cancelar
    document.getElementById('cancelarEditarProducto').addEventListener('click', () => {
      window.location.hash = "#/admin/productos/listar";
    });

    // Agregar talla
    document.getElementById('agregarTallaBtn').addEventListener('click', () => {
      this.agregarTalla();
    });

    // Eliminar talla
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('btn-eliminar-talla')) {
         this.eliminarTalla(e.target);
      }
    });

    // Cambio en imágenes
    document.getElementById('imagenesProducto').addEventListener('change', (e) => {
      this.previsualizarImagenes(e.target.files);
    });

    // Validaciones en tiempo real
    this.form.addEventListener('input', (e) => {
      this.validarCampoEnTiempoReal(e);
    });
  }

  agregarTalla() {
    // Obtener tallas ya seleccionadas en el DOM (existentes y nuevas)
    const tallasSeleccionadasEnDOM = Array.from(document.querySelectorAll('#tallasBody .talla-select'))
      .map(select => parseInt(select.value))
      .filter(id => id > 0);

    // Filtrar tallas disponibles (no seleccionadas)
    const tallasDisponibles = this.tallas.filter(talla =>
      !tallasSeleccionadasEnDOM.includes(talla.id_talla)
    );

    if (tallasDisponibles.length === 0) {
      error("No hay tallas disponibles para agregar", "warning");
      return;
    }

    const tallasBody = document.getElementById('tallasBody');
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>
        <select class="talla-select" required>
          <option value="">Seleccione talla</option>
          ${tallasDisponibles.map(talla => `<option value="${talla.id_talla}">${talla.talla}</option>`).join('')}
        </select>
      </td>
      <td>
        <input type="number" class="talla-stock" min="0" required placeholder="Stock">
      </td>
      <td>
        <select class="talla-estado talla-select" required>
          <option value="1" selected>Activo</option>
          <option value="2">Inactivo</option>
        </select>
      </td>
      <td>
        <button type="button" class="btn-eliminar-talla btn-eliminar">Eliminar</button>
      </td>
    `;
    tallasBody.appendChild(row);
  }

  async eliminarTalla(button) {
    const idTallaProducto = button.getAttribute('data-id-talla-producto');
    const row = button.closest('tr');

    if (idTallaProducto) {
      // Es una talla existente, confirmar y eliminar de DB
      if (await confirm('¿Estás seguro de que deseas eliminar esta talla?')) {
        try {
          await del(`tallas-productos/${idTallaProducto}`);
          if (row) {
            row.remove();
          }
          success("Talla eliminada correctamente");
        } catch (err) {
          error("Error al eliminar la talla: " + (err.message || "Error desconocido"));
        }
      }
    } else {
      // Es una talla nueva, solo remover del DOM
      if (row) {
        row.remove();
      }
    }
  }

  previsualizarImagenes(files) {
    const previewContainer = document.getElementById('previewImagenes');
    previewContainer.innerHTML = '';
    this.imagenesSeleccionadas = [];

    Array.from(files).slice(0, 5 - this.imagenesActuales.length).forEach(file => {
      if (file.type.startsWith('image/')) {
        this.imagenesSeleccionadas.push(file);

        const img = document.createElement('img');
        img.src = URL.createObjectURL(file);
        img.alt = file.name;
        img.style.width = '100px';
        img.style.height = '100px';
        img.style.objectFit = 'cover';
        img.style.margin = '5px';
        previewContainer.appendChild(img);
      }
    });
  }

  validarCampoEnTiempoReal(e) {
    const campo = e.target;

    if (campo.id === 'nombreProducto' || campo.id === 'descripcionProducto') {
      campo.value = campo.value.replace(/[^a-zA-Z0-9\s]/g, '');
    }

    if (campo.id === 'precioProducto') {
      campo.value = campo.value.replace(/[^0-9.]/g, '');
      if (campo.value.includes('.')) {
        const parts = campo.value.split('.');
        if (parts[1].length > 2) {
          campo.value = parts[0] + '.' + parts[1].substring(0, 2);
        }
      }
    }

    if (campo.classList.contains('talla-stock')) {
      campo.value = campo.value.replace(/[^0-9]/g, '');
    }
  }

  async actualizarProducto() {
    const formData = new FormData(this.form);

    const tallasSeleccionadas = this.obtenerTallasSeleccionadas();
    if (tallasSeleccionadas.length === 0) {
      error("Debe tener al menos una talla con stock", "warning");
      return;
    }

    const productoActualizado = {
      nombre: formData.get('nombre'),
      descripcion: formData.get('descripcion'),
      precio: parseFloat(formData.get('precio')),
      id_estado: parseInt(formData.get('estado')),//el estado activo es 1 y inactivo es 2
      id_categoria: parseInt(formData.get('id_categoria')),
      id_genero: parseInt(formData.get('id_genero'))
    };
    console.log(productoActualizado);
    

    if (!productoActualizado.nombre || !productoActualizado.descripcion || !productoActualizado.precio) {
      error("Por favor complete todos los campos requeridos", "warning");
      return;
    }

    try {
      // Actualizar producto
      await put(`productos/${this.producto.id_producto}`, productoActualizado);

      // Actualizar tallas
      await this.actualizarTallas(tallasSeleccionadas);

      // Subir nuevas imágenes
      if (this.imagenesSeleccionadas.length > 0) {
        await this.subirImagenes();
      }

      success("Producto actualizado correctamente");
      localStorage.removeItem("productoEditar");
      window.location.hash = "#/admin/productos/listar";

    } catch (err) {
      console.error("Error al actualizar producto:", err);
      error("Error al actualizar el producto: " + (err.message || "Error desconocido"), "error");
    }
  }

  obtenerTallasSeleccionadas() {
    const tallas = [];
    const tallaRows = document.querySelectorAll('#tallasBody tr');
    const tallasIds = new Set();

    tallaRows.forEach(row => {
      const selectTalla = row.querySelector('.talla-select');
      const inputStock = row.querySelector('.talla-stock');
      const selectEstado = row.querySelector('.talla-estado');

      if (selectTalla && inputStock && selectEstado && selectTalla.value && inputStock.value && selectEstado.value) {
        const idTalla = parseInt(selectTalla.value);

        if (tallasIds.has(idTalla)) {
          error("No se pueden seleccionar tallas duplicadas", "warning");
          return [];
        }

        tallasIds.add(idTalla);
        tallas.push({
          id_talla: idTalla,
          stock: parseInt(inputStock.value),
          id_estado: parseInt(selectEstado.value)
        });
      }
    });

    return tallas;
  }

  async actualizarTallas(nuevasTallas) {
    for (const tp of nuevasTallas) {
        await post('tallas-productos', {
            id_producto: this.producto.id_producto,
            id_talla: tp.id_talla,
            stock: tp.stock,
            id_estado: tp.id_estado
        });
    }
  }

  async subirImagenes() {
    for (const file of this.imagenesSeleccionadas) {
      const formData = new FormData();
      formData.append('imagen', file);
      formData.append('id_producto', this.producto.id_producto);
      formData.append('descripcion', `Imagen del producto ${this.producto.id_producto}`);

      console.log('Enviando imagen:', file.name, 'Tamaño:', file.size, 'Tipo:', file.type);
      console.log('ID producto:', this.producto.id_producto);

      try {
        const res = await post('imagenes/subir', formData);
        console.log('Respuesta del servidor:', res);
        success(`Imagen ${file.name} subida correctamente`);
      } catch (err) {
        console.error(`Error al subir ${file.name}:`, err);
        error(`Error al subir ${file.name}: ${err.message}`, "error");
      }
    }
  }
}

// Inicializar el controlador
const controller = new EditarProductoController();
controller.init();