export function validarCamposEnTiempoReal(form) {
  const reglas = {
    nombre: {
      regex: /^[a-zA-Z\s]{2,25}$/,
      mensaje: 'Solo letras y espacios, de 3 a 25 caracteres',
      bloquear: /[^a-zA-Z\s]/g
    },
    correo: {
      regex: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      mensaje: 'Correo electrónico inválido.'
    },
    codigo_postal: {
      regex: /^\d{5,7}$/,
      mensaje: 'Debe tener entre 5 y 7 dígitos.',
      bloquear: /[^\d]/g
    },
    contrasena: {
      regex: /^.[a-zA-Z\S\d]{6,}$/,
      mensaje: 'Mínimo 6 caracteres, debe tener numeros y letras'
    }
  };

  Object.keys(reglas).forEach(campo => {
    const input = form[campo];
    const errorSpan = document.getElementById(`error-${campo}`);
    const regla = reglas[campo];

    if (!input || !errorSpan) return;

    // Validación en tiempo real
    input.addEventListener('input', () => {
      if (regla.bloquear) {
        input.value = input.value.replace(regla.bloquear, '');
      }

      if (!input.value.trim()) {
        errorSpan.textContent = 'Este campo es obligatorio.';
      } else if (!regla.regex.test(input.value.trim())) {
        errorSpan.textContent = regla.mensaje;
      } else {
        errorSpan.textContent = '';
      }
    });

    // Validación al salir del campo
    input.addEventListener('blur', () => {
      if (!input.value.trim()) {
        errorSpan.textContent = 'Este campo es obligatorio.';
      } else if (!regla.regex.test(input.value.trim())) {
        errorSpan.textContent = regla.mensaje;
      } else {
        errorSpan.textContent = '';
      }
    });
  });
}


export function validarFormularioFinal(form) {
  const reglas = {
    nombre: { regex: /^[a-zA-Z\s]{2,25}$/, mensaje: 'Solo letras y espacios.' },

    correo: { regex: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, mensaje: 'Correo inválido.' },
    codigo_postal: { regex: /^\d{5,7}$/, mensaje: 'Entre 5 y 7 dígitos.' },
    contrasena: { regex: /^.{6,18}$/, mensaje: 'Mínimo 6 caracteres.' }
  };

  let esValido = true;

  Object.keys(reglas).forEach(campo => {
    const input = form[campo];
    const errorSpan = document.getElementById(`error-${campo}`);
    const regla = reglas[campo];

    if (!input || !errorSpan) return;

    // 👇 Ignorar si el campo está oculto
    if (input.offsetParent === null) return;

    const valor = input.value.trim();
    
    if (!valor) {
      errorSpan.textContent = 'Este campo es obligatorio.';
      esValido = false;
    } else if (!regla.regex.test(valor)) {
      errorSpan.textContent = regla.mensaje;
      esValido = false;
    } else {
      errorSpan.textContent = '';
    }
  });

  return esValido;
}
