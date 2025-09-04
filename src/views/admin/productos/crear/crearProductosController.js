// Controlador Crear Productos
import { get, post } from "../../../../utils/manejo_api_optimizado.js";
import { success, error, confirm, info } from "../../../../utils/alert.js";

export class CrearProductoController {
  constructor() {
    this.form = null;
    this.categorias = [];
    this.tallas = [];
    this.generos = [];
    this.imagenesSeleccionadas = [];
    this.tallasSeleccionadas = [];
  }

  async init() {
    await this.cargarDatosIniciales();
    this.configurarFormulario();
    this.configurarEventos();
  }

  async cargarDatosIniciales() {
    try {
      const [categorias, tallas, generos] = await Promise.all([
        get("categorias/activas"),
        get("tallas"),
        get("generos")
      ]);

      this.categorias = categorias;
      this.tallas = tallas;
      this.generos = generos;
    } catch (err) {
      console.error("Error al cargar datos iniciales:", err);
      error("Error al cargar datos del formulario", "error");
    }
  }

  configurarFormulario() {
    this.form = document.getElementById("formCrearProducto");
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

  configurarEventos() {
    // Submit del formulario
    this.form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.crearProducto();
    });

    // Cancelar
    document.getElementById('cancelarCrearProducto').addEventListener('click', () => {
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
    const tallasBody = document.getElementById('tallasBody');
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>
        <select class="talla-select" required>
          <option value="">Seleccione talla</option>
          ${this.tallas.map(talla => `<option value="${talla.id_talla}">${talla.talla}</option>`).join('')}
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
    const row = button.closest('tr');
    if (row) {
      row.remove();
    }
  }

  previsualizarImagenes(files) {
    const previewContainer = document.getElementById('previewImagenes');
    previewContainer.innerHTML = '';
    this.imagenesSeleccionadas = [];

    Array.from(files).slice(0, 5).forEach(file => {
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

  async crearProducto() {
    const formData = new FormData(this.form);

    const tallasSeleccionadas = this.obtenerTallasSeleccionadas();
    if (tallasSeleccionadas.length === 0) {
      error("Debe tener al menos una talla con stock", "warning");
      return;
    }

    const nuevoProducto = {
      nombre: formData.get('nombre'),
      descripcion: formData.get('descripcion'),
      precio: parseFloat(formData.get('precio')),
      id_estado: parseInt(formData.get('estado')),
      id_categoria: parseInt(formData.get('id_categoria')),
      id_genero: parseInt(formData.get('id_genero'))
    };

    console.log('Datos del producto a crear:', nuevoProducto);

    if (!nuevoProducto.nombre || !nuevoProducto.descripcion || !nuevoProducto.precio) {
      error("Por favor complete todos los campos requeridos", "warning");
      return;
    }

    try {
      // Crear producto
      const productoCreado = await post('productos', nuevoProducto);
      console.log('Respuesta completa del servidor:', productoCreado);
      console.log('Producto creado:', productoCreado);

      // Verificar que tenemos el ID del producto
      let idProducto;
      if (typeof productoCreado === 'number') {
        // El backend retorna solo el ID como número
        idProducto = productoCreado;
        console.log('ID del producto creado (número):', idProducto);
      } else if (productoCreado && productoCreado.id_producto) {
        // El backend retorna un objeto con id_producto
        idProducto = productoCreado.id_producto;
        console.log('ID del producto creado (objeto):', idProducto);
      } else {
        throw new Error('El servidor no retornó el ID del producto creado en el formato esperado');
      }

      // Crear tallas
      await this.crearTallas(idProducto, tallasSeleccionadas);

      // Subir imágenes
      if (this.imagenesSeleccionadas.length > 0) {
        await this.subirImagenes(idProducto);
      }

      success("Producto creado correctamente");
      window.location.hash = "#/admin/productos/listar";

    } catch (err) {
      console.error("Error al crear producto:", err);
      error("Error al crear el producto: " + (err.message || "Error desconocido"), "error");
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

  async crearTallas(idProducto, tallasSeleccionadas) {
    for (const tp of tallasSeleccionadas) {
      await post('tallas-productos', {
        id_producto: idProducto,
        id_talla: tp.id_talla,
        stock: tp.stock,
        id_estado: tp.id_estado
      });
    }
  }

  async subirImagenes(idProducto) {
    for (const file of this.imagenesSeleccionadas) {
      const formData = new FormData();
      formData.append('imagen', file);
      formData.append('id_producto', idProducto);
      formData.append('descripcion', `Imagen del producto ${idProducto}`);

      console.log('Enviando imagen:', file.name, 'Tamaño:', file.size, 'Tipo:', file.type);

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
const controller = new CrearProductoController();
controller.init();
