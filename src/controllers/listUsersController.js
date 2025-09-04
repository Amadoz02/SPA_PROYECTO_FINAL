import { get } from "../utils/manejo_api_optimizado.js";
import { renderSimpleTable } from "../utils/tableUtils.js";
import {validarFormularioFinal, validarCamposEnTiempoReal} from "../utils/validar_campos.js";
import manejoApi from '../utils/manejo_api_optimizado';
import { confirm, success, error } from '../utils/alert';





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
