import manejoApi from '../utils/manejo_api_optimizado';

const idUsuario = parseInt(sessionStorage.getItem('id_usuario'));
export default async function perfilController() {
  // Esperar a que el DOM esté listo
  await new Promise(resolve => {
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
      resolve();
    } else {
      document.addEventListener('DOMContentLoaded', resolve, { once: true });
    }
  });

  const form = document.getElementById('perfilForm');
  const mensaje = document.getElementById('perfilMensaje');
 

  async function cargarDatos() {
    try {
      // Obtener usuario
      const usuario = await manejoApi.get(`usuarios/${idUsuario}`);
      // Obtener dirección (ruta corregida)
      const direccion = await manejoApi.get(`direcciones/usuario/${idUsuario}`);
      // Obtener roles
      const roles = await manejoApi.get(`roles/${usuario.id_rol}`);

      // Rellenar campos usuario
      document.getElementById('nombre').value = usuario.nombre || '';
      document.getElementById('correo').value = usuario.correo || '';
      document.getElementById('rol').value = roles.nombre_rol || '';

      // Rellenar roles
   

      // Rellenar dirección
      document.getElementById('direccion').value = direccion.direccion || '';
      document.getElementById('ciudad').value = direccion.ciudad || '';
      document.getElementById('departamento').value = direccion.departamento || '';
      document.getElementById('codigo_postal').value = direccion.codigo_postal || '';
      document.getElementById('observaciones').value = direccion.observaciones || '';
    } catch (error) {
      mensaje.textContent = 'Error al cargar datos: ' + error.message;
      mensaje.style.color = 'red';
    }
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    mensaje.textContent = '';
    try {
      console.log({
              nombre: form.nombre.value,
        correo: form.correo.value,
        direccion: form.direccion.value,
        ciudad: form.ciudad.value,
        id_usuario: idUsuario,
        departamento: form.departamento.value,
        codigo_postal: form.codigo_postal.value,
        observaciones: form.observaciones.value
      });
      
      // Actualizar usuario
      await manejoApi.patch(`usuarios/${idUsuario}`, {
        nombre: form.nombre.value,
        correo: form.correo.value,
        
      });
      // Actualizar dirección
      await manejoApi.put(`direcciones/${idUsuario}`, {
        direccion: form.direccion.value,
        ciudad: form.ciudad.value,
        id_usuario: idUsuario,
        departamento: form.departamento.value,
        codigo_postal: form.codigo_postal.value,
        observaciones: form.observaciones.value
      });
      mensaje.textContent = 'Datos actualizados correctamente.';
      mensaje.style.color = 'green';
    } catch (error) {
      mensaje.textContent = 'Error al guardar: ' + error.message;
      mensaje.style.color = 'red';
    }
  });

  await cargarDatos();
}
