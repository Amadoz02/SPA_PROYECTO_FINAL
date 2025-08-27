import { get } from "../utils/manejo_api_optimizado.js";
import { renderSimpleTable } from "../utils/tableUtils.js";
import {validarFormularioFinal, validarCamposEnTiempoReal} from "../utils/validar_campos.js";
import manejoApi from '../utils/manejo_api_optimizado';
import { confirm, success, error } from '../utils/alert';

export async function openUsuarioForm(idUsuario = null) {
  const form = document.getElementById('perfilForm');
  const mensaje = document.getElementById('perfilMensaje');
  const container = document.getElementById('perfilContainer');
  const grupoContrasena = document.getElementById('grupoContrasena');
  validarCamposEnTiempoReal(form);

  const idUsuarioActual = parseInt(sessionStorage.getItem('id_usuario'));
  const usuarioActual = await manejoApi.get(`usuarios/${idUsuarioActual}`);

  // Mostrar u ocultar campo contraseña
  grupoContrasena.style.display = idUsuario ? 'none' : 'block';

  // Mostrar el formulario
  container.classList.remove('hidden');
  form.reset();
  mensaje.textContent = '';

  // Cargar roles disponibles según el rol del usuario actual
  const rolesDisponibles = await manejoApi.get('roles/');
  const rolSelect = document.getElementById('rol');
  const rolesFiltrados = usuarioActual.id_rol === 2
    ? rolesDisponibles.filter(rol => rol.id_rol !== 1)
    : rolesDisponibles;

  rolSelect.innerHTML = rolesFiltrados.map(rol =>
    `<option value="${rol.id_rol}">${rol.nombre_rol}</option>`
  ).join('');

  let esEdicionPropia = false;

  // Si es edición, cargar datos
  if (idUsuario) {
    try {
      const usuarioEditado = await manejoApi.get(`usuarios/${idUsuario}`);
      const direccion = await manejoApi.get(`direcciones/usuario/${idUsuario}`);

      if (usuarioActual.id_rol === 2 && usuarioEditado.id_rol === 1) {
        error('No tienes permisos para editar un Super-Admin');
        return;
      }

      form.estado.value = usuarioEditado.estado || 'Activo';
      form.nombre.value = usuarioEditado.nombre || '';
      form.correo.value = usuarioEditado.correo || '';
      form.rol.value = usuarioEditado.id_rol || '';
      form.direccion.value = direccion.direccion || '';
      form.ciudad.value = direccion.ciudad || '';
      form.departamento.value = direccion.departamento || '';
      form.codigo_postal.value = direccion.codigo_postal || '';
      form.observaciones.value = direccion.observaciones || '';

      // Si el usuario edita su propio perfil
      if (idUsuario === idUsuarioActual) {
        esEdicionPropia = true;
        form.rol.disabled = true;
        form.estado.disabled = true;
      }

    } catch (err) {
      mensaje.textContent = 'Error al cargar datos: ' + err.message;
      mensaje.style.color = 'red';
    }
  }

  // Submit del formulario
  form.onsubmit = async (e) => {
    e.preventDefault();
    if (!validarFormularioFinal(form)) return;

    const result = await confirm('Confirmar', idUsuario ? '¿Actualizar usuario?' : '¿Crear nuevo usuario?');
    if (!result.isConfirmed) return;

    try {
      const payloadUsuario = {
        nombre: form.nombre.value,
        correo: form.correo.value
      };

      // Solo incluir estado si NO es edición propia
      if (!esEdicionPropia) {
        payloadUsuario.estado = form.estado.value;
      }

      // Solo incluir rol si NO es edición propia
      if (!esEdicionPropia) {
        payloadUsuario.id_rol = parseInt(form.rol.value);
      }

      // Validación adicional para Admin creando Super-Admin
      if (!idUsuario && usuarioActual.id_rol === 2 && payloadUsuario.id_rol === 1) {
        error('No puedes crear un usuario con rol Super-Admin');
        return;
      }

      if (!idUsuario) {
        const contrasena = form.contrasena.value.trim();
        if (contrasena.length < 6) {
          mensaje.textContent = 'La contraseña debe tener al menos 6 caracteres.';
          mensaje.style.color = 'red';
          return;
        }
        payloadUsuario.contrasena = contrasena;
      }

      const payloadDireccion = {
        direccion: form.direccion.value,
        ciudad: form.ciudad.value,
        departamento: form.departamento.value,
        codigo_postal: form.codigo_postal.value,
        observaciones: form.observaciones.value
      };

      if (idUsuario) {
        await manejoApi.patch(`usuarios/${idUsuario}`, payloadUsuario);
        await manejoApi.put(`direcciones/${idUsuario}`, { ...payloadDireccion, id_usuario: idUsuario });
      } else {
        const nuevoUsuario = await manejoApi.post('usuarios/', payloadUsuario);
        await manejoApi.post('direcciones/', { ...payloadDireccion, id_usuario: nuevoUsuario.id_usuario });
        success('Usuario creado correctamente');
      }

      success('Usuario guardado correctamente');
      listUsersController();
      container.classList.add('hidden');
    } catch (err) {
      error('Coreo en uso '+err.message);
    }
  };
}



window.openUsuarioForm = openUsuarioForm;



export default async function listUsersController() {
  const container = document.getElementById("usuarios-container");
  if (!container) return;

  try {
    const usuarios = await get("usuarios");
    const roles = await get("roles");

    // Crear un mapa de roles por ID
    const rolesMap = {};
    roles.forEach(rol => {
      rolesMap[rol.id_rol] = rol.nombre_rol;
    });

    // Enriquecer cada usuario con su dirección y nombre de rol
    const usuariosEnriquecidos = await Promise.all(
      usuarios.map(async (usuario) => {
        let direccion = null;
        try {
          direccion = await get(`direcciones/usuario/${usuario.id_usuario}`);
        } catch (err) {
          console.warn(`No se pudo obtener dirección de usuario ${usuario.id_usuario}`);
        }

        return {
          ...usuario,
          direccion,
          rol: rolesMap[usuario.id_rol] || 'Sin rol'
        };
      })
    );

    const columns = [
      { key: "id_usuario", label: "ID" },
      { key: "nombre", label: "Nombre" },
      { key: "correo", label: "Correo" },
      { key: "estado", label: "Estado" },
      { key: "rol", label: "Rol" },
      {
        key: "direccion",
        label: "Dirección",
        render: (dir) => {
          if (!dir) return "—";
          return `${dir.direccion}, ${dir.ciudad}, ${dir.departamento} (${dir.codigo_postal})`;
        }
      }
    ];

    renderSimpleTable(container, usuariosEnriquecidos, columns, {
      title: "Usuarios con Dirección",
      idKey: "id_usuario",
      onEdit: (id) => openUsuarioForm(id),
      onDelete: (id) => deleteUsuario(id)
    });

  } catch (err) {
    console.error("Error al cargar usuarios:", err);
  }
}
async function deleteUsuario(idUsuario) {
  const idUsuarioActual = parseInt(sessionStorage.getItem('id_usuario'));
  const usuarioAEliminar = await manejoApi.get(`usuarios/${idUsuario}`);

  // ❌ No puede eliminarse a sí mismo
  if (idUsuario === idUsuarioActual) {
    error('No puedes eliminar tu propio usuario mientras estás logueado');
    return;
  }

  // ❌ No puede eliminar a un Super-Admin si no lo es
  if (usuarioAEliminar.id_rol === 1) {
  error('No se permite eliminar usuarios con rol Super-Admin');
  return;
}


  const confirmacion = await confirm('Eliminar usuario', '¿Estás seguro de que deseas eliminar este usuario? Esta acción no se puede deshacer.');
  if (!confirmacion.isConfirmed) return;

  try {
    await manejoApi.del(`usuarios/${idUsuario}`);
    success('Usuario eliminado correctamente');
    listUsersController(); // Recargar la lista
  } catch (err) {
    error('Error: ' + "El usuario tiene ventas asociadas, solo puedes cambiarlo de estado.", "Usuario no se puede eliminar");
  }
}
