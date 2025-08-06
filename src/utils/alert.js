import Swal from 'sweetalert2/dist/sweetalert2.js'
import 'sweetalert2/src/sweetalert2.scss'

// Configuración base
const configuracionBase = {
  background: '#F6F6F6',
  customClass: {
    confirmButton: 'button',
  },
  buttonsStyling: false,
};

// Alerta de éxito
export const success = (mensaje = 'Operación realizada con éxito') => {
  return Swal.fire({
    ...configuracionBase,
    icon: 'success',
    title: mensaje,
    confirmButtonText: 'Aceptar',
    allowOutsideClick: false
  });
};

export const info = (titulo, mensaje) => {
  return Swal.fire({
    ...configuracionBase,
    icon: 'info',
    title: titulo,
    text: mensaje,
  });
}

// Alerta de error que recibe tu respuesta del backend
export const error = (respuesta) => {
  let mensaje = 'Error desconocido.';

  if (respuesta.hasOwnProperty('errors') && Array.isArray(respuesta.errors) && respuesta.errors.length > 0) {
    mensaje = respuesta.errors.map(err => `${err}`).join('<br>');
  } else if (respuesta.message) {
    mensaje = `${respuesta.message}`;
  }

  return Swal.fire({
    ...configuracionBase,
    icon: 'error',
    title: 'Se produjo un error',
    html: mensaje,
    confirmButtonText: 'Cerrar',
  });

  console.warn('Respuesta del servidor:', respuesta);
};
