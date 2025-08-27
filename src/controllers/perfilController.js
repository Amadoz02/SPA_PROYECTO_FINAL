import manejoApi from '../utils/manejo_api_optimizado';
import { confirm, success, error } from '../utils/alert';

export default async function perfilController() {
  // Esperar a que el DOM esté listo
  await new Promise(resolve => {
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
      resolve();
    } else {
      document.addEventListener('DOMContentLoaded', resolve, { once: true });
    }
  });
  if (location.hash=="#perfilAdmin"){
    const body=document.querySelector("body");
    body.style.backgroundColor="#838383";
  }

  const form = document.getElementById('perfilForm');
  const mensaje = document.getElementById('perfilMensaje');
  
  // Obtener ID del usuario desde sessionStorage dentro de la función
  const idUsuario = parseInt(sessionStorage.getItem('id_usuario'));
  
  // Validar que el usuario esté autenticado
  if (!idUsuario || isNaN(idUsuario)) {
    console.error('Usuario no autenticado o ID inválido');
    // Redirigir a login si no hay usuario autenticado
    location.hash = 'login';
    return;
  }

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

  // Función para actualizar contraseña
  async function actualizarContrasena() {
    const nuevaContrasena = document.getElementById('nuevaContrasena').value;
    const confirmarContrasena = document.getElementById('confirmarContrasena').value;
  
    if ( !nuevaContrasena || !confirmarContrasena) {
      mensaje.textContent = 'Por favor, completa todos los campos de contraseña.';
      mensaje.style.color = 'red';
      return;
    }
    
    if (nuevaContrasena.length < 6) {
      mensaje.textContent = 'La nueva contraseña debe tener al menos 6 caracteres.';
      mensaje.style.color = 'red';
      return;
    }
    
    if (nuevaContrasena !== confirmarContrasena) {
      mensaje.textContent = 'Las contraseñas nuevas no coinciden.';
      mensaje.style.color = 'red';
      return;
    }
    
    try {
      const result = await confirm('Confirmar cambio de contraseña', '¿Estás seguro de que deseas cambiar tu contraseña?');
      
      if (result.isConfirmed) {
      
        
        
          await manejoApi.patch(`usuarios/${idUsuario}`, {
            contrasena: nuevaContrasena
          });
          mensaje.textContent = 'Contraseña actualizada correctamente.';
          mensaje.style.color = 'green';
          await success('Contraseña actualizada correctamente.')
          
          // Limpiar campos de contraseña
          
          document.getElementById('nuevaContrasena').value = '';
          document.getElementById('confirmarContrasena').value = '';
        } else {
          mensaje.textContent = 'La contraseña actual es incorrecta.';
          mensaje.style.color = 'red';
        }
      
    } catch (error) {
      mensaje.textContent = 'Error al actualizar contraseña: ' + error.message;
      mensaje.style.color = 'red';
    }
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const result = await confirm('Confirmar Actualización', '¿Deseas proceder a actualizar tu perfil?, recuerda que si ingresas datos falsos podrías perder tus compras.');
    if (result.isConfirmed) {
    mensaje.textContent = '';
    try {
      // Validar campos requeridos
      if (!form.nombre.value || !form.correo.value || !form.direccion.value || !form.ciudad.value || !form.departamento.value || !form.codigo_postal.value) {
        mensaje.textContent = 'Por favor, completa todos los campos requeridos.';
        mensaje.style.color = 'red';
        return;
      }else if (!form.codigo_postal.value.match(/^\d{5,7}$/)) {
        mensaje.textContent = 'El código postal debe tener min 5 dígitos.';
        mensaje.style.color = 'red';
        return;
      }else if (!form.correo.value.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
        mensaje.textContent = 'El correo electrónico no es válido.'; 
        mensaje.style.color = 'red';
        return;
      }else if (!form.nombre.value.match(/^[a-zA-Z\s]+$/)) {
        mensaje.textContent = 'El nombre solo puede contener letras y espacios.';
        mensaje.style.color = 'red';
        return;
      }else if (!form.ciudad.value.match(/^[a-zA-Z]+$/)) {
        mensaje.textContent = 'La ciudad solo puede contener letras.';
        mensaje.style.color = 'red';
        return;
      }else if (!form.departamento.value.match(/^[a-zA-Z]+$/)) {
        mensaje.textContent = 'El departamento solo puede contener letras.';
        mensaje.style.color = 'red';
        return;
      }
      const usuarios = await manejoApi.get('usuarios/');
      const correoIngresado = form.correo.value.trim().toLowerCase();
      
      // Filtra los usuarios que no tengan id_usuario de sesion
      const otrosUsuarios = usuarios.filter(usuario => usuario.id_usuario !== idUsuario);

      // Verifica si el correo ya está en uso por otro usuario que no sea el mismo
      const correoDuplicado = otrosUsuarios.some(usuario => usuario.correo.toLowerCase() === correoIngresado);

      if (correoDuplicado) {
        mensaje.textContent = 'El correo ya está en uso por otro usuario.';
        mensaje.style.color = 'red';
        return;
      }

      
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
  }
  });

  // Event listener para el botón de actualizar contraseña
  document.getElementById('btnActualizarContrasena')?.addEventListener('click', actualizarContrasena);

  await cargarDatos();
}
