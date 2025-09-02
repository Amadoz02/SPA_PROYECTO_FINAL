// editarPerfilController.js
import { get,put, patch } from '../../../../utils/manejo_api_optimizado.js';
import { success, error } from '../../../../utils/alert.js';
import { validarCamposEnTiempoReal, validarFormularioFinal } from '../../../../utils/validar_campos.js';

export default async function editarPerfilController() {
  const form = document.getElementById('editarPerfilForm');
  const mensaje = document.getElementById('editarPerfilMensaje');
  const idUsuario = parseInt(localStorage.getItem('id_usuario'));
  if (!idUsuario || isNaN(idUsuario)) {
    location.hash = 'login';
    return;
  }

  // Elementos selects
  const $departamento = document.getElementById('departamento');
  const $municipio = document.getElementById('ciudad');

  // Cargar datos actuales y selects
  let departamentos = [];
  let municipios = [];
  let id_departamento_actual = null;
  let id_municipio_actual = null;
  let id_direccion = null;
  try {
    const usuario = await get(`usuarios/${idUsuario}`);
    const direcciones = await get(`direcciones/usuario/${idUsuario}`);
    id_direccion = direcciones.length > 0 ? direcciones[0].id_direccion : null;
    const direccion = direcciones.length > 0 ? direcciones[0] : {};
    const roles = await get(`roles/${usuario.id_rol}`);
    document.getElementById('nombre').value = usuario.nombre || '';
    document.getElementById('correo').value = usuario.correo || '';
    document.getElementById('rol').value = roles.nombre_rol || '';
    document.getElementById('direccion').value = direccion.direccion || '';
    document.getElementById('codigo_postal').value = direccion.codigo_postal || '';
    document.getElementById('observaciones').value = direccion.observaciones || '';
    id_departamento_actual = direccion.id_departamento || null;
    id_municipio_actual = direccion.id_municipio || null;
    await cargarDepartamentosYMunicipios(id_departamento_actual, id_municipio_actual);
  } catch (err) {
    mensaje.textContent = 'Error al cargar datos: ' + err.message;
    mensaje.style.color = 'red';
    mensaje.hidden = false;
  }

  // Cargar departamentos y municipio con Select2 robusto
  async function cargarDepartamentosYMunicipios(idDepartamentoActual, idMunicipioActual) {
    // Cargar departamentos
    const departamentos = await get('departamentos/listarRegistro');
    $departamento.innerHTML = '<option value="">Seleccione departamento</option>' +
      departamentos.map(dep => `<option value="${dep.id_departamento}">${dep.nombre}</option>`).join('');
    // Inicializar Select2 después de cargar departamentos
    if (window.$ && $.fn.select2) {
      $('#departamento').select2('destroy');
      $('#departamento').select2({
        width: 'resolve',
        dropdownAutoWidth: true,
        theme: 'classic',
        placeholder: 'Seleccione departamento',
        allowClear: true,
        dropdownParent: $('#departamento').closest('.perfil__group')
      });
      if (idDepartamentoActual) {
        $('#departamento').val(idDepartamentoActual).trigger('change');
      }
    }
    if (idDepartamentoActual) {
      await cargarMunicipios(idDepartamentoActual, idMunicipioActual);
    } else {
      await cargarMunicipios('', '');
    }
  }

  async function cargarMunicipios(idDep, idMunicipioActual) {
    if (!idDep) {
      $municipio.innerHTML = '<option value="">Seleccione municipio</option>';
      if (window.$ && $.fn.select2) {
        $('#ciudad').select2('destroy');
        $('#ciudad').select2({
          width: 'resolve',
          dropdownAutoWidth: true,
          theme: 'classic',
          placeholder: 'Seleccione municipio',
          allowClear: true,
          dropdownParent: $('#ciudad').closest('.perfil__group')
        });
      }
      return;
    }
    const municipios = await get(`municipios/departamento/${idDep}`);
    $municipio.innerHTML = '<option value="">Seleccione municipio</option>' +
      municipios.map(mun => `<option value="${mun.id_municipio}">${mun.nombre_municipio}</option>`).join('');
    // Reinicializar Select2 después de cargar las opciones
    if (window.$ && $.fn.select2) {
      $('#ciudad').select2('destroy');
      $('#ciudad').select2({
        width: 'resolve',
        dropdownAutoWidth: true,
        theme: 'classic',
        placeholder: 'Seleccione municipio',
        allowClear: true,
        dropdownParent: $('#ciudad').closest('.perfil__group')
      });
      if (idMunicipioActual) {
        $('#ciudad').val(idMunicipioActual).trigger('change');
      }
    }
  }

  // Evento para cargar municipios al cambiar departamento
  $departamento.addEventListener('change', async (e) => {
    const idDep = e.target.value;
    await cargarMunicipios(idDep, '');
    $municipio.value = '';
    $('#ciudad').val('').trigger('change');
  });

  // Validación en tiempo real
  setTimeout(() => {
    validarCamposEnTiempoReal(form);
  }, 100);

  // Listener para actualizar contraseña (fuera del submit)
  const $btnActualizarContrasena = document.getElementById('btnActualizarContrasena');
  const $nuevaContrasena = document.getElementById('nuevaContrasena');
  const $confirmarContrasena = document.getElementById('confirmarContrasena');
  $btnActualizarContrasena?.addEventListener('click', async () => {
    mensaje.hidden = true;
    const nueva = $nuevaContrasena.value.trim();
    const confirmar = $confirmarContrasena.value.trim();
    if (!nueva || !confirmar) {
      mensaje.textContent = 'Debes ingresar y confirmar la nueva contraseña.';
      mensaje.style.color = 'red';
      mensaje.hidden = false;
      return;
    }
    if (nueva.length < 6) {
      mensaje.textContent = 'La contraseña debe tener al menos 6 caracteres.';
      mensaje.style.color = 'red';
      mensaje.hidden = false;
      return;
    }
    if (nueva !== confirmar) {
      mensaje.textContent = 'Las contraseñas no coinciden.';
      mensaje.style.color = 'red';
      mensaje.hidden = false;
      return;
    }
    try {
      await patch(`usuarios/${idUsuario}`, { contrasena: nueva });
      success('Contraseña actualizada correctamente');
      $nuevaContrasena.value = '';
      $confirmarContrasena.value = '';
    } catch (err) {
      error('Error al actualizar la contraseña: ' + err.message);
    }
  });

  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    mensaje.hidden = true;
    if (!validarFormularioFinal(form)) {
      mensaje.textContent = 'Por favor corrige los errores antes de guardar.';
      mensaje.style.color = 'red';
      mensaje.hidden = false;
      return;
    }
    if (!$departamento.value || !$municipio.value) {
      mensaje.textContent = 'Debes seleccionar departamento y municipio.';
      mensaje.style.color = 'red';
      mensaje.hidden = false;
      return;
    }
    try {
      // Actualizar usuario
      await patch(`usuarios/${idUsuario}`, {
        nombre: form.nombre.value.trim(),
        correo: form.correo.value.trim()
      });
      // Actualizar dirección
      console.log( "direccion: ",form.direccion.value.trim(),
        "id_municipio: ",$municipio.value,
        "codigo_postal: ",form.codigo_postal.value.trim(),
        "observaciones:" ,form.observaciones.value.trim());
    
      await put(`direcciones/${id_direccion}`, {
        direccion: form.direccion.value.trim(),
        id_municipio: $municipio.value,
        id_usuario: idUsuario,
        codigo_postal: form.codigo_postal.value.trim(),
        observaciones: form.observaciones.value.trim() ? form.observaciones.value.trim() : null
      });
      success('Perfil actualizado correctamente');
      location.hash = '#/cliente/perfil';
    } catch (err) {
      error('Error al actualizar perfil: ' + err.message);
    }
  });

  // Inicializar Select2 en los selects después de cargar los datos
  setTimeout(() => {
    if (window.$ && $.fn.select2) {
      $('#departamento').select2({
        width: 'resolve',
        dropdownAutoWidth: true,
        theme: 'classic',
        placeholder: 'Seleccione departamento',
        allowClear: true,
        dropdownParent: $('#departamento').closest('.perfil__group')
      });
      $('#ciudad').select2({
        width: 'resolve',
        dropdownAutoWidth: true,
        theme: 'classic',
        placeholder: 'Seleccione municipio',
        allowClear: true,
        dropdownParent: $('#ciudad').closest('.perfil__group')
      });
    }
  }, 300);
}
