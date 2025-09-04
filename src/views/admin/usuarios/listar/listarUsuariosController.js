import { get } from "../../../../utils/manejo_api_optimizado.js";
import { renderSimpleTable } from "../../../../utils/tableUtils.js";
import manejoApi from '../../../../utils/manejo_api_optimizado';
import { getCached } from "../../../../utils/cache.js";
import { confirm, success, error } from '../../../../utils/alert';

export default async function listUsersController() {
  const container = document.getElementById("usuarios-container");
  if (!container) return;

  try {
    const usuarios = await get("usuarios");
    console.log(usuarios);

    // Cache roles and addresses to avoid multiple calls
    const rolesCache = {};
    const direccionesCache = {};

    // Fetch all roles once (cached)
    const allRoles = await getCached("roles/", 10 * 60 * 1000); // 10 minutes cache
    allRoles.forEach(role => {
      rolesCache[role.id_rol] = role.nombre_rol;
    });

    // Fetch all addresses once (cached)
    const allDirecciones = await getCached("direcciones/", 5 * 60 * 1000); // 5 minutes cache
    allDirecciones.forEach(dir => {
      if (!direccionesCache[dir.id_usuario]) {
        direccionesCache[dir.id_usuario] = [];
      }
      direccionesCache[dir.id_usuario].push(dir);
    });

    // Enriquecer usuarios con datos cacheados
    const usuariosEnriquecidos = usuarios.map(usuario => {
      return {
        ...usuario,
        direccion: direccionesCache[usuario.id_usuario] || null,
        rol: rolesCache[usuario.id_rol] || 'Sin rol',
        estado: (usuario.id_estado === 1) ? "Activo" : "Inactivo"
      };
    });

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
          return `${dir[0].direccion}, ${dir[0].nombre_municipio}, (${dir[0].codigo_postal})`;
        }
      }
    ];

    renderSimpleTable(container, usuariosEnriquecidos, columns, {
      title: "Usuarios con Dirección",
      idKey: "id_usuario",
      onEdit: (id) => { 
        localStorage.setItem('usuarioEditar', id); 
        window.location.hash = "#/admin/usuarios/editar";
      },
      onDelete: (id) => deleteUsuario(id)
    });

  } catch (err) {
    console.error("Error al cargar usuarios:", err);
  }
}

async function deleteUsuario(idUsuario) {
  const idUsuarioActual = parseInt(sessionStorage.getItem('id_usuario'));
  const usuarioAEliminar = await get(`usuarios/${idUsuario}`);

  // ❌ No puede eliminarse a sí mismo
  if (idUsuario === idUsuarioActual) {
    error('No puedes eliminar tu propio usuario mientras estás logueado');
    return;
  }

  // ❌ No puede eliminar a un Super-Admin si no lo es
  if (usuarioAEliminar.id_rol === 3) {
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
