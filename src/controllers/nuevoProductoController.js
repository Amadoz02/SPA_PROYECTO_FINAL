import { get, post } from "../utils/manejo_api_optimizado.js";
import { success, error } from "../utils/alert.js";
import { showProductModal } from "../utils/modalUtils.js";
import listProductosController from "./listProductosController.js";

export default class NuevoProductoController {
  constructor() {
    this.modal = null;
    this.form = null;
    this.categorias = [];
    this.tallas = [];
    this.generos = [];
    this.imagenesSeleccionadas = [];
    this.tallasSeleccionadas = [];
  }

  async init() {
    await this.cargarDatosIniciales();
    this.crearModal();
    this.configurarEventos();
    this.tallasSeleccionadas = []; // Asegurarse de que se reinicie al iniciar
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
      console.log("Datos iniciales cargados:", {
        categorias: this.categorias,
        tallas: this.tallas,
        generos: this.generos
      });
    } catch (err) {
      console.error("Error al cargar datos iniciales:", err);
      error({ message: "Error al cargar datos del formulario" });
    }
  }

  crearModal() {
  if (document.getElementById('modalNuevoProducto')) {
    this.modal = document.getElementById('modalNuevoProducto');
    this.form = document.getElementById('formNuevoProducto');
    this.llenarSelects(); // <-- Asegura que los selects se llenen incluso si el modal ya existe
    return;
  }

}



  llenarSelects() {
    // Llenar categorías
    const selectCategoria = document.getElementById('categoriaProducto');
    if (!selectCategoria) return;
    selectCategoria.innerHTML = '<option value="">Seleccione una categoría</option>';
    console.log("Categorías disponibles:", this.categorias);
    
    this.categorias.forEach(cat => {
      if (cat && cat.id_categoria !== undefined && cat.nombre) {
        const option = document.createElement('option');
        option.value = cat.id_categoria;
        option.textContent = cat.nombre;
        selectCategoria.appendChild(option);
      }
    });



    // Llenar géneros
    const selectGenero = document.getElementById('generoProducto');
    if (!selectGenero) return;
    selectGenero.innerHTML = '<option value="">Seleccione un género</option>';
    this.generos.forEach(genero => {
      if (genero && genero.id_genero !== undefined && genero.tipo_genero) {
        const option = document.createElement('option');
        option.value = genero.id_genero;
        option.textContent = genero.tipo_genero;
        selectGenero.appendChild(option);
      }
    });
  }

  configurarEventos() {
    if (this.eventosConfigurados) return;
    this.eventosConfigurados = true;

    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('btn-agregar')) {
        this.abrirModal();
      }
    });

    document.addEventListener('click', (e) => {
      if (e.target.id === 'cerrarModalNuevoProducto' || 
          e.target.classList.contains('btn-cancelar') ||
          e.target === this.modal) {
        this.cerrarModal();
      }
    });

    document.addEventListener('change', (e) => {
      if (e.target.id === 'imagenesProducto') {
        this.previsualizarImagenes(e.target.files);
      }
    });

    document.addEventListener('submit', (e) => {
      if (e.target.id === 'formNuevoProducto') {
        e.preventDefault();
        if (this.isSubmitting) return;
        this.isSubmitting = true;
        this.guardarProducto().finally(() => {
          this.isSubmitting = false;
        });
      }
    });

    document.addEventListener('input', (e) => {
      this.validarCampoEnTiempoReal(e);
    });

    document.addEventListener('keydown', (e) => {
      this.validarTeclado(e);
    });

    document.addEventListener('click', (e) => {
      if (e.target.id === 'agregarTallaBtn') {
        this.agregarTalla();
      }
      if (e.target.classList.contains('btn-eliminar-talla')) {
        this.eliminarTalla(e.target);
      }
    });

    // Agregar event listeners para selects de tallas existentes
    document.addEventListener('change', (e) => {
      if (e.target.classList.contains('talla-select')) {
        const row = e.target.closest('tr');
        if (row) {
          this.validarTallaEnTiempoReal(e.target, row);
        }
      }
    });
  }

  validarCampoEnTiempoReal(e) {
    const campo = e.target;
    
    if (campo.id === 'nombreProducto' || campo.id === 'descripcionProducto') {
      // Solo permitir letras, números y espacios
      campo.value = campo.value.replace(/[^a-zA-Z0-9\s]/g, '');
    }
    
    if (campo.id === 'precioProducto') {
      // Solo permitir números y punto decimal
      campo.value = campo.value.replace(/[^0-9.]/g, '');
      // Limitar a 2 decimales
      if (campo.value.includes('.')) {
        const parts = campo.value.split('.');
        if (parts[1].length > 2) {
          campo.value = parts[0] + '.' + parts[1].substring(0, 2);
        }
      }
    }
    
    // Validar tallas dinámicas
    if (campo.classList.contains('talla-stock')) {
      campo.value = campo.value.replace(/[^0-9]/g, '');
    }
  }

  validarTeclado(e) {
    const campo = e.target;
    
    // Validar nombre y descripción
    if (campo.id === 'nombreProducto' || campo.id === 'descripcionProducto') {
      const permitido = /^[a-zA-Z0-9\s]$/.test(e.key) || 
                       e.key === 'Backspace' || 
                       e.key === 'Delete' || 
                       e.key === 'ArrowLeft' || 
                       e.key === 'ArrowRight' || 
                       e.key === 'Tab';
      
      if (!permitido) {
        e.preventDefault();
      }
    }
    
    // Validar precio
    if (campo.id === 'precioProducto') {
      const permitido = /^[0-9.]$/.test(e.key) || 
                       e.key === 'Backspace' || 
                       e.key === 'Delete' || 
                       e.key === 'ArrowLeft' || 
                       e.key === 'ArrowRight' || 
                       e.key === 'Tab';
      
      if (!permitido) {
        e.preventDefault();
      }
      
      // Prevenir múltiples puntos decimales
      if (e.key === '.' && campo.value.includes('.')) {
        e.preventDefault();
      }
    }
    
    // Validar stock
    if (campo.id === 'stockProducto') {
      const permitido = /^[0-9]$/.test(e.key) || 
                       e.key === 'Backspace' || 
                       e.key === 'Delete' || 
                       e.key === 'ArrowLeft' || 
                       e.key === 'ArrowRight' || 
                       e.key === 'Tab';
      
      if (!permitido) {
        e.preventDefault();
      }
    }
  }

  abrirModal() {
  if (!this.modal) {
    this.crearModal(); // Si no existe, se carga y se llena dentro de crearModal()
  } else {
    this.llenarSelects(); // <-- Asegura que los selects se llenen si el modal ya está cargado
  }

  // Resetear formulario
  if (this.form) {
    this.form.reset();
    document.getElementById('previewImagenes').innerHTML = '';
    this.imagenesSeleccionadas = [];
  }

  this.modal.style.display = 'block';
}


  cerrarModal() {
    if (this.modal) {
      this.modal.style.display = 'none';
      this.form.reset(); // Resetear el formulario al cerrar el modal
      document.getElementById('previewImagenes').innerHTML = '';
      this.imagenesSeleccionadas = [];
      this.tallasSeleccionadas = []; // Limpiar tallas seleccionadas
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
        previewContainer.appendChild(img);
      }
    });
  }

  async guardarProducto() {
    const formData = new FormData(this.form);
    
    // Obtener tallas seleccionadas
    const tallasSeleccionadas = this.obtenerTallasSeleccionadas();
    
    if (tallasSeleccionadas.length === 0) {
      error({ message: "Debe agregar al menos una talla con stock" });
      return;
    }

    const producto = {
      nombre: formData.get('nombre'),
      descripcion: formData.get('descripcion'),
      precio: parseFloat(formData.get('precio')),
      estado: formData.get('estado'),
      id_categoria: parseInt(formData.get('id_categoria')),
      id_genero: parseInt(formData.get('id_genero'))
    };

    // Validar campos requeridos
    if (!producto.nombre || !producto.descripcion || !producto.precio) {
      error({ message: "Por favor complete todos los campos requeridos" });
      return;
    }

    try {
      // Primero guardar el producto
      console.log("Guardando producto:", producto);
      
      const response = await post('productos', producto);
      const idProducto = typeof response === 'number' ? response : response.id_producto;

      if (!idProducto) {
        throw new Error('No se pudo obtener el ID del producto');
      }

      // Guardar tallas y stocks
      console.log("Guardando tallas y stocks:", tallasSeleccionadas);
      
      for (const talla of tallasSeleccionadas) {
        await post('tallas_productos', {
          id_producto: idProducto,
          id_talla: talla.id_talla,
          stock: talla.stock,
          estado: 'Activo'
        });
      }

      // Subir imágenes si las hay
      if (idProducto && this.imagenesSeleccionadas.length > 0) {
        console.log("subir img");
        await this.subirImagenes(idProducto);
      }

      success('Producto creado exitosamente');
      this.cerrarModal();
      
      // Recargar la lista de productos
      listProductosController();
      
    } catch (err) {
      console.error("Error al guardar producto:", err);
      error(err);
    }
  }

  obtenerTallasSeleccionadas() {
    const tallas = [];
    const tallaRows = document.querySelectorAll('#tallasBody tr');
    const tallasIds = new Set(); // Para verificar duplicados
    
    // Primera pasada: recolectar todas las tallas y verificar duplicados
    let hayDuplicados = false;
    
    tallaRows.forEach(row => {
      const selectTalla = row.querySelector('.talla-select');
      const inputStock = row.querySelector('.talla-stock');
      
      if (selectTalla && inputStock && selectTalla.value && inputStock.value) {
        const idTalla = parseInt(selectTalla.value);
        
        // Verificar si ya existe esta talla
        if (tallasIds.has(idTalla)) {
          hayDuplicados = true;
          // Resaltar el select duplicado
          selectTalla.style.borderColor = '#dc3545';
        } else {
          tallasIds.add(idTalla);
          tallas.push({
            id_talla: idTalla,
            stock: parseInt(inputStock.value)
          });
        }
      }
    });
    
    // Si hay duplicados, mostrar error y retornar array vacío
    if (hayDuplicados) {
      error({ message: "No se pueden seleccionar tallas duplicadas. Por favor revise las tallas ingresadas." });
      return [];
    }
    
    return tallas;
  }

  agregarTalla() {
    const tallasBody = document.getElementById('tallasBody');
    if (!tallasBody) return;

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
        <button type="button" class="btn-eliminar-talla">Eliminar</button>
      </td>
    `;
    
    tallasBody.appendChild(row);
    
    // Agregar event listener para validación en tiempo real
    const selectTalla = row.querySelector('.talla-select');
    selectTalla.addEventListener('change', (e) => {
      this.validarTallaEnTiempoReal(e.target, row);
    });
  }

  validarTallaEnTiempoReal(selectElement, filaActual) {
    const tallaId = selectElement.value;
    
    // Limpiar mensajes anteriores
    this.limpiarMensajesError();
    
    if (tallaId && !this.validarTallaUnica(tallaId, filaActual)) {
      this.mostrarErrorTallaDuplicada(selectElement);
      selectElement.value = ''; // Resetear la selección
    }
  }

  eliminarTalla(button) {
    const row = button.closest('tr');
    if (row) {
      row.remove();
      // Limpiar mensajes de error después de eliminar una talla
      this.limpiarMensajesError();
    }
  }

  validarTallaUnica(tallaId, filaActual) {
    if (!tallaId) return true; // Permitir selección vacía
    
    const tallaRows = document.querySelectorAll('#tallasBody tr');
    for (const row of tallaRows) {
      if (row !== filaActual) { // No comparar con la fila actual
        const selectTalla = row.querySelector('.talla-select');
        if (selectTalla && selectTalla.value === tallaId) {
          return false; // Talla duplicada encontrada
        }
      }
    }
    return true; // Talla única
  }

  mostrarErrorTallaDuplicada(selectElement) {
    // Limpiar mensajes anteriores
    this.limpiarMensajesError();
    
    // Crear mensaje de error
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.style.color = '#dc3545';
    errorDiv.style.fontSize = '14px';
    errorDiv.style.marginTop = '5px';
    errorDiv.textContent = '❌ Esta talla ya ha sido seleccionada. Por favor elija otra.';
    
    // Insertar después del select
    selectElement.parentNode.appendChild(errorDiv);
    
    // Resaltar el select con error
    selectElement.style.borderColor = '#dc3545';
  }

  limpiarMensajesError() {
    // Eliminar todos los mensajes de error
    const errores = document.querySelectorAll('.error-message');
    errores.forEach(error => error.remove());
    
    // Restaurar bordes de todos los selects
    const selects = document.querySelectorAll('.talla-select');
    selects.forEach(select => {
      select.style.borderColor = '';
    });
  }

async subirImagenes(idProducto) {
  for (const file of this.imagenesSeleccionadas) {
    const formData = new FormData();
    formData.append('imagen', file);
    formData.append('id_producto', idProducto);
    formData.append('descripcion', `Imagen de ${file.name}`);

    try {
      const res = await fetch('http://localhost:8080/helder/api/imagenes/subir', {
        method: 'POST',
        body: formData
      });

      if (!res.ok) {
        const errorMsg = await res.text();
        console.error(`Error al subir ${file.name}:`, errorMsg);
        error({ message: `Error al subir ${file.name}` });
      } else {
        const result = await res.json();
        console.log(`Imagen ${file.name} subida:`, result);
      }
    } catch (err) {
      console.error(`Error al subir ${file.name}:`, err);
      error({ message: `Error al subir ${file.name}` });
    }
  }
}

}

// Singleton para evitar múltiples instancias
let controllerInstance = null;

export function initNuevoProductoController() {
  if (!controllerInstance) {
    controllerInstance = new NuevoProductoController();
    controllerInstance.init();
  }
  return controllerInstance;
}
