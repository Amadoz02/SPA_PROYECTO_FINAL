import { get, put, del, post } from './manejo_api_optimizado.js';
import { success, error, confirm } from './alert.js';
import Swal from 'sweetalert2/dist/sweetalert2.js';

export async function editarItem(endpoint, itemOriginal) {
  let formData = {};

  // 1. Mostrar modal según entidad
  if (endpoint === 'categorias') {
    const { value: formValues } = await Swal.fire({
      title: 'Editar Categoría',
      html: `
        <div style="text-align: left; margin: 20px 0;">
          <label>Nombre:</label>
          <input id="swal-input-nombre" class="swal2-input" value="${itemOriginal.nombre || ''}" placeholder="Nombre de la categoría">
        </div>
        <div style="text-align: left; margin: 20px 0;">
          <label>Estado:</label>
          <select id="swal-input-estado" class="swal2-input">
            <option value="Activo" ${itemOriginal.estado === 'Activo' ? 'selected' : ''}>Activo</option>
            <option value="Inactivo" ${itemOriginal.estado === 'Inactivo' ? 'selected' : ''}>Inactivo</option>
          </select>
        </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Guardar',
      cancelButtonText: 'Cancelar',
      preConfirm: () => {
        const nombre = document.getElementById('swal-input-nombre').value.trim();
        const estado = document.getElementById('swal-input-estado').value;
        if (!nombre) {
          Swal.showValidationMessage('El nombre es obligatorio');
          return false;
        }
        return { nombre, estado };
      }
    });

    if (!formValues) return;
    formData = { ...itemOriginal, ...formValues };

  } else if (endpoint === 'tallas') {
    const { value: nuevoNombre } = await Swal.fire({
      title: 'Editar Talla',
      input: 'text',
      inputLabel: 'Nuevo nombre de la talla',
      inputValue: itemOriginal.talla || '',
      showCancelButton: true,
      confirmButtonText: 'Guardar',
      cancelButtonText: 'Cancelar',
      inputValidator: (value) => {
        if (!value.trim()) return 'Este campo es obligatorio';
      }
    });

    if (!nuevoNombre) return;
    formData = { ...itemOriginal, talla: nuevoNombre.trim() };

  } else if (endpoint === 'tallas_productos') {
    const { value: estadoSeleccionado } = await Swal.fire({
      title: 'Editar Estado',
      html: `
        <div style="text-align: left; margin: 20px 0;">
          <label>Estado:</label>
          <select id="swal-input-estado" class="swal2-input">
            <option value="Activo" ${itemOriginal.estado === 'Activo' ? 'selected' : ''}>Activo</option>
            <option value="Inactivo" ${itemOriginal.estado === 'Inactivo' ? 'selected' : ''}>Inactivo</option>
          </select>
        </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Guardar',
      cancelButtonText: 'Cancelar',
      preConfirm: () => {
        const estado = document.getElementById('swal-input-estado').value;
        if (!estado) {
          Swal.showValidationMessage('Debes seleccionar un estado');
          return false;
        }
        return { estado };
      }
    });

    if (!estadoSeleccionado) return;
    formData = { ...itemOriginal, ...estadoSeleccionado };
  } else if (endpoint === 'metodos') {
    const { value: formValues } = await Swal.fire({
      title: 'Editar Método de Pago',
      html: `
        <div style="text-align: left; margin: 20px 0;">
          <label style="display: block; margin-bottom: 5px;">Nombre:</label>
          <input id="swal-input-nombre" class="swal2-input" value="${itemOriginal.nombre || ''}" placeholder="Nombre del método">
        </div>
        
        <div style="text-align: left; margin: 20px 0;">
          <label style="display: block; margin-bottom: 5px;">Estado:</label>
          <select id="swal-input-estado" class="swal2-input">
            <option value="Activo" ${itemOriginal.estado === 'Activo' ? 'selected' : ''}>Activo</option>
            <option value="Inactivo" ${itemOriginal.estado === 'Inactivo' ? 'selected' : ''}>Inactivo</option>
          </select>
        </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Guardar',
      cancelButtonText: 'Cancelar',
      preConfirm: () => {
        const nombre = document.getElementById('swal-input-nombre').value.trim();
     
        const estado = document.getElementById('swal-input-estado').value;
        
        if (!nombre) {
          Swal.showValidationMessage('El nombre es obligatorio');
          return false;
        }
        
        return { nombre, estado };
      }
    });

    if (!formValues) return;
    formData = { ...itemOriginal, ...formValues };
  }

  // 2. Enviar PUT con objeto completo
  try {
    let idKey;
    switch (endpoint) {
      case 'categorias':
        idKey = 'id_categoria';
        break;
      case 'tallas':
        idKey = 'id_talla';
        break;
      case 'metodos':
        idKey = 'id_metodo';
        break;
      case 'tallas_productos':
        idKey = 'id_talla_producto';
        break;
      default:
        idKey = 'id';
    }
    await put(`${endpoint}/${itemOriginal[idKey]}`, formData);

    success("Actualizado correctamente");
    return true;
  } catch (err) {
    console.error(err);
    error("Error al actualizar, el elemento ya existe o hubo un problema");
    return false;
  }
}

export async function eliminarItem(endpoint, id, nombre = "el ítem") {
  const rta = await confirm('¿Estás seguro?', `¿Eliminar ${nombre}?`);
  if (!rta.isConfirmed) return false;

  try {
    await del(`${endpoint}/${id}`);
    success("Eliminado correctamente");
    return true;
  } catch (err) {
    console.error(err);

    const msg = err?.message || "";

    if (endpoint === 'categorias') {
      if (msg.includes("asociada") || msg.includes("productos")) {
        error("No se pudo eliminar: la categoría tiene productos o consultas asociadas.");
      } else if (msg.includes("no encontrada")) {
        error("No se pudo eliminar: la categoría tiene productos o consultas asociadas.");
      } else {
        error("Error al eliminar la categoría.");
      }
    } else if (endpoint === 'tallas') {
      if (msg.includes("en uso") || msg.includes("asociada")) {
        error("No se pudo eliminar: la talla está en uso en productos.");
      } else if (msg.includes("no encontrada")) {
        error("La talla ya fue eliminada o no existe.");
      } else {
        error("Error al eliminar la talla.");
      }
    } else {
      error("No se pudo eliminar el elemento, esta en uso.");
    }

    return false;
  }
}

export async function crearItem(endpoint, campos) {
  let formData = {};
  
  if (endpoint === 'categorias') {
    const { value: formValues } = await Swal.fire({
      title: `Agregar ${campos.label}`,
      html: `
        <div style="text-align: left; margin: 20px 0;">
          <label style="display: block; margin-bottom: 5px;">Nombre de la ${campos.label}:</label>
          <input id="swal-input-nombre" class="swal2-input" placeholder="${campos.placeholder || campos.label}">
        </div>
        <div style="text-align: left; margin: 20px 0;">
          <label style="display: block; margin-bottom: 5px;">Estado:</label>
          <select id="swal-input-estado" class="swal2-input">
            <option value="Activo">Activo</option>
            <option value="Inactivo">Inactivo</option>
          </select>
        </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Agregar',
      cancelButtonText: 'Cancelar',
      preConfirm: () => {
        const nombre = document.getElementById('swal-input-nombre').value;
        const estado = document.getElementById('swal-input-estado').value;
        
        if (!nombre) {
          Swal.showValidationMessage('El nombre es obligatorio');
          return false;
        }
        
        return { nombre, estado };
      }
    });

    if (!formValues) return;
    formData = formValues;
  } else if (endpoint === 'metodos') {
    const { value: formValues } = await Swal.fire({
      title: `Agregar ${campos.label}`,
      html: `
        <div style="text-align: left; margin: 20px 0;">
          <label style="display: block; margin-bottom: 5px;">Nombre del método:</label>
          <input id="swal-input-nombre" class="swal2-input" placeholder="Ej: Tarjeta de Crédito">
        </div>
       
        <div style="text-align: left; margin: 20px 0;">
          <label style="display: block; margin-bottom: 5px;">Estado:</label>
          <select id="swal-input-estado" class="swal2-input">
            <option value="Activo">Activo</option>
            <option value="Inactivo">Inactivo</option>
          </select>
        </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Agregar',
      cancelButtonText: 'Cancelar',
      preConfirm: () => {
        const nombre = document.getElementById('swal-input-nombre').value.trim();
        
        const estado = document.getElementById('swal-input-estado').value;
        
        if (!nombre) {
          Swal.showValidationMessage('El nombre es obligatorio');
          return false;
        }
        
        return { nombre, estado };
      }
    });

    if (!formValues) return;
    formData = formValues;
  } else {
    // Para tallas
    const { value: nuevoValor } = await Swal.fire({
      title: `Agregar ${campos.label}`,
      input: 'text',
      inputLabel: `Nuevo valor para ${campos.label}`,
      inputPlaceholder: campos.placeholder || campos.label,
      showCancelButton: true,
      confirmButtonText: 'Agregar',
      cancelButtonText: 'Cancelar',
      inputValidator: (value) => {
        if (!value) return 'Este campo es obligatorio';
      }
    });

    if (!nuevoValor) return;
    formData = { [campos.key]: nuevoValor };
  }

  try {
    await post(endpoint, formData);
    success(`${campos.label} agregada correctamente`);
    return true;
  } catch (err) {
    console.error(err);
    
      error("Error al agregar, el elemto parece ya existir");
    
    return false;
  }
}
