// perfilcontroller.js
import manejoApi from '../../../utils/manejo_api_optimizado.js';
import { confirm, success, error } from '../../../utils/alert.js';

export default async function perfilcontroller() {
  const form = document.getElementById('perfilForm');
  const mensaje = document.getElementById('perfilMensaje');
  const idUsuario = parseInt(sessionStorage.getItem('id_usuario'));
  if (!idUsuario || isNaN(idUsuario)) {
    location.hash = 'login';
    return;
  }
  async function cargarDatos() {
    try {
      const usuario = await manejoApi.get(`usuarios/${idUsuario}`);
      const direccion = await manejoApi.get(`direcciones/usuario/${idUsuario}`);
      const roles = await manejoApi.get(`roles/${usuario.id_rol}`);
      document.getElementById('nombre').value = usuario.nombre || '';
      document.getElementById('correo').value = usuario.correo || '';
      document.getElementById('rol').value = roles.nombre_rol || '';
      document.getElementById('direccion').value = direccion.direccion || '';
      document.getElementById('ciudad').value = direccion.ciudad || '';
      document.getElementById('departamento').value = direccion.departamento || '';
      document.getElementById('codigo_postal').value = direccion.codigo_postal || '';
      document.getElementById('observaciones').value = direccion.observaciones || '';
    } catch (err) {
      mensaje.textContent = 'Error al cargar datos: ' + err.message;
      mensaje.style.color = 'red';
    }
  }
  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    // ...validación y guardado de cambios...
    success('Cambios guardados correctamente');
  });
  document.getElementById('btnActualizarContrasena')?.addEventListener('click', async () => {
    // ...validación y actualización de contraseña...
    success('Contraseña actualizada correctamente');
  });
  await cargarDatos();
}
