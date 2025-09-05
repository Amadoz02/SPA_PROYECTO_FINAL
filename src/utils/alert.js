import Swal from 'sweetalert2/dist/sweetalert2.js'
import 'sweetalert2/src/sweetalert2.scss'

// Configuración base
// const configuracionBase = {
//   background: '#F6F6F6',
//   customClass: {
//     confirmButton: 'button',
//   },
//   buttonsStyling: false,
// };

// Alerta de éxito
export const success = (mensaje = 'Operación realizada con éxito') => {
  return Swal.fire({
   
    icon: 'success',
    title: mensaje,
    confirmButtonText: 'Aceptar',
    // customClass: {
    //   confirmButton: 'btn--Yesalert',
    //   cancelButton: 'btn--Notalert',
    //   title: 'text-primary'
    // },
    allowOutsideClick: false
    
  });
};

export const info = (titulo, mensaje) => {
  return Swal.fire({
   
    icon: 'info',
    title: titulo,
    text: mensaje,
    // customClass: {
    //   confirmButton: 'btn--Yesalert',
    //   cancelButton: 'btn--Notalert',
    //   title: 'text-primary'
    // },
  });
}

export const error = (respuesta, titulo='Se produjo un error') => {
  let mensaje = 'Error desconocido.';

  if (typeof respuesta === 'string') {
    mensaje = respuesta;
  } else if (respuesta?.errors?.length > 0) {
    mensaje = respuesta.errors.map(err => `${err}`).join('<br>');
  } else if (respuesta?.message) {
    mensaje = `${respuesta.message}`;
  }

  return Swal.fire({
   
    icon: 'error',
    title: titulo,
    html: mensaje,
    confirmButtonText: 'Cerrar',
    // customClass: {
    //   confirmButton: 'btn--Yesalert',
    //   cancelButton: 'btn--Notalert',
    //   title: 'text-primary'
    // },
  });
};


// Alerta de confirmación con colores del aplicativo
export const confirm = (titulo, mensaje) => {
  return Swal.fire({
   
    title: titulo,
    text: mensaje,
    icon: 'warning',
    showCancelButton: true,
    // confirmButtonColor: '#007bff',
    // cancelButtonColor: '#dc3545',
    // confirmButtonText: 'continuar',
    // cancelButtonText: 'Cancelar',
    // reverseButtons: true,
    // customClass: {
    //    confirmButton: 'btn--Yesalert',
    //   cancelButton: 'btn--Notalert',
    //   title: 'text-primary',
    //   icon: 'text-warning'
    // },
    // buttonsStyling: false,
    // allowOutsideClick: false
  });
};
