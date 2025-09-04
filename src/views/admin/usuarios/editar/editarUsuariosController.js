import { get, put, patch } from '../../../../utils/manejo_api_optimizado.js';
import { success, error, info } from '../../../../utils/alert.js';
import { validarCamposEnTiempoReal, validarFormularioFinal } from '../../../../utils/validar_campos.js';


export default async function initEditarUsuario() {
  let esEdicionPropia = false;
  const idUsuarioStr = localStorage.getItem('usuarioEditar');
  const idUsuario = parseInt(idUsuarioStr);
  const form = document.getElementById('editarPerfilForm');
  const mensaje = document.getElementById('editarPerfilMensaje');

  let id_departamento_actual = null;
  let id_municipio_actual = null;
  let id_direccion = null;
  const idUsuarioActual = parseInt(localStorage.getItem('id_usuario'));
  const usuarioActual = localStorage.getItem("id_rol");

  try {
    const usuario = await get(`usuarios/${idUsuario}`);
    if (usuarioActual.id_rol === 2 && usuario.id_rol === 3) {
      error('No tienes permisos para editar un Super-Admin');
      window.location.hash = "#/admin/usuarios/listar";
      return;
    }
    const direcciones = await get(`direcciones/usuario/${idUsuario}`);
    id_direccion = direcciones.length > 0 ? direcciones[0].id_direccion : null;
    const direccion = direcciones.length > 0 ? direcciones[0] : {};
    const rolesDisponibles = await get('roles/');
    const rolSelect = document.getElementById('rol');
    const rolesFiltrados = usuarioActual.id_rol === 2 ? rolesDisponibles.filter(rol => rol.id_rol !== 1) : rolesDisponibles;
    rolSelect.innerHTML = rolesFiltrados.map(rol => `<option value="${rol.id_rol}">${rol.nombre_rol}</option>`).join('');
    document.getElementById('nombre').value = usuario.nombre || '';
    document.getElementById('correo').value = usuario.correo || '';
    document.getElementById('estado').value = usuario.estado || 'Activo';
    document.getElementById('rol').value = usuario.id_rol || '';
    document.getElementById('direccion').value = direccion.direccion || '';
    document.getElementById('codigo_postal').value = direccion.codigo_postal || '';
    document.getElementById('observaciones').value = direccion.observaciones || '';
    id_departamento_actual = direccion.id_departamento || null;
    id_municipio_actual = direccion.id_municipio || null;

    
    if (idUsuario == idUsuarioActual) {
      esEdicionPropia = true;
      info("no puedes editarte", "ve al apartado de perfil y gestiona tu perfil")
      window.location.replace("#/admin/dashboard")
    }
  } catch (err) {
    mensaje.textContent = 'Error al cargar datos: ' + err.message;
    mensaje.style.color = 'red';
    mensaje.hidden = false;
  }

  // Elementos
  const departamentoSelect = document.getElementById('departamento');
  const ciudadSelect = document.getElementById('ciudad');

  // Crear input de búsqueda para departamento
  const departamentoSearch = document.createElement('input');
  departamentoSearch.type = 'text';
  departamentoSearch.placeholder = 'Buscar departamento...';
  departamentoSearch.className = 'register__input';
  departamentoSelect.parentNode.insertBefore(departamentoSearch, departamentoSelect);

  // Crear input de búsqueda para ciudad
  const ciudadSearch = document.createElement('input');
  ciudadSearch.type = 'text';
  ciudadSearch.placeholder = 'Buscar ciudad...';
  ciudadSearch.className = 'register__input';
  ciudadSelect.parentNode.insertBefore(ciudadSearch, ciudadSelect);

  let departamentos = [];
  let municipios = [];
  let idMunicipioSeleccionado = '';

  // Cargar departamentos
  async function fetchDepartamentos() {
    try {
      const res = await fetch('http://localhost:8080/helder/api/departamentos/listarRegistro');
      departamentos = await res.json();
    } catch (err) {
      error('Error al cargar departamentos.');
      console.error(err);
    }
  }

  // Mostrar coincidencias en el select de departamento
  function mostrarDepartamentos(filtro) {
    departamentoSelect.innerHTML = '';
    const opciones = departamentos
      .filter(dep => dep.nombre.toLowerCase().includes(filtro.toLowerCase()))
      .slice(0, 10);
    opciones.forEach(dep => {
      const opt = document.createElement('option');
      opt.value = dep.id_departamento;
      opt.textContent = dep.nombre;
      departamentoSelect.appendChild(opt);
    });
    departamentoSelect.size = opciones.length > 0 ? opciones.length : 1;
    departamentoSelect.style.display = filtro ? 'block' : 'none';

    // Selección con click
    departamentoSelect.onclick = function(e) {
      if (e.target && e.target.nodeName === 'OPTION') {
        departamentoSelect.value = e.target.value;
        departamentoSearch.value = e.target.textContent;
        departamentoSelect.style.display = 'none';
        departamentoSelect.dispatchEvent(new Event('change'));
      }
    };
  }

  // Cargar municipios según departamento
  async function fetchMunicipios(idDepartamento) {
    if (!idDepartamento) {
      ciudadSelect.innerHTML = '';
      ciudadSelect.style.display = 'none';
      return;
    }
    try {
      const res = await fetch(`http://localhost:8080/helder/api/municipios/departamento/${idDepartamento}`);
      municipios = await res.json();
    } catch (err) {
      error('Error al cargar municipios.');
      console.error(err);
    }
  }

  // Mostrar coincidencias en el select de ciudad
  function mostrarMunicipios(filtro) {
    ciudadSelect.innerHTML = '';
    const opciones = municipios
      .filter(mun => mun.nombre_municipio.toLowerCase().includes(filtro.toLowerCase()))
      .slice(0, 10);
    opciones.forEach(mun => {
      const opt = document.createElement('option');
      opt.value = mun.id_municipio;
      opt.textContent = mun.nombre_municipio;
      ciudadSelect.appendChild(opt);
    });
    ciudadSelect.size = opciones.length > 0 ? opciones.length : 1;
    ciudadSelect.style.display = filtro ? 'block' : 'none';

    // Selección con click
    ciudadSelect.onclick = function(e) {
      if (e.target && e.target.nodeName === 'OPTION') {
        ciudadSelect.value = e.target.value;
        ciudadSearch.value = e.target.textContent;
        ciudadSelect.style.display = 'none';
        idMunicipioSeleccionado = e.target.value;
        ciudadSelect.dispatchEvent(new Event('change'));
      }
    };
  }

  // Eventos de búsqueda y selección
  departamentoSearch.addEventListener('input', e => {
    mostrarDepartamentos(e.target.value);
  });
  departamentoSelect.addEventListener('change', async () => {
    departamentoSelect.style.display = 'none';
    departamentoSearch.value = departamentoSelect.options[departamentoSelect.selectedIndex]?.text || '';
    await fetchMunicipios(departamentoSelect.value);
    ciudadSearch.value = '';
    mostrarMunicipios('');
    ciudadSearch.focus();
  });
  ciudadSearch.addEventListener('input', e => {
    mostrarMunicipios(e.target.value);
  });
  ciudadSelect.addEventListener('change', () => {
    ciudadSelect.style.display = 'none';
    ciudadSearch.value = ciudadSelect.options[ciudadSelect.selectedIndex]?.text || '';
    idMunicipioSeleccionado = ciudadSelect.value;
  });

  // Inicializar departamentos al cargar
  fetchDepartamentos().then(() => {
    mostrarDepartamentos('');
    // Seleccionar el departamento actual si existe
    if (id_departamento_actual) {
      departamentoSelect.value = id_departamento_actual;
      departamentoSearch.value = departamentos.find(dep => dep.id_departamento === id_departamento_actual)?.nombre || '';
      // Cargar municipios del departamento seleccionado
      fetchMunicipios(id_departamento_actual).then(() => {
        mostrarMunicipios('');
        // Seleccionar el municipio actual si existe
        if (id_municipio_actual) {
          ciudadSelect.value = id_municipio_actual;
          ciudadSearch.value = municipios.find(mun => mun.id_municipio === id_municipio_actual)?.nombre_municipio || '';
        }
      });
    }
  });

  // Validación en tiempo real
  if (form) validarCamposEnTiempoReal(form);

  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    mensaje.hidden = true;
    if (!validarFormularioFinal(form)) {
      mensaje.textContent = 'Por favor corrige los errores antes de guardar.';
      mensaje.style.color = 'red';
      mensaje.hidden = false;
      return;
    }

    // Usar los selects correctos
    if (!departamentoSelect.value || !ciudadSelect.value) {
      mensaje.textContent = 'Debes seleccionar departamento y municipio.';
      mensaje.style.color = 'red';
      mensaje.hidden = false;
      return;
    }
    try {
      const payloadUsuario = {
        nombre: form.nombre.value.trim(),
        correo: form.correo.value.trim()
      };
      if (!esEdicionPropia) {
        payloadUsuario.estado = form.estado.value;
        payloadUsuario.id_rol = parseInt(form.rol.value);
      }
      // Actualizar usuario
      await patch(`usuarios/${idUsuario}`, payloadUsuario);
      // Actualizar dirección
      await put(`direcciones/${id_direccion}`, {
        direccion: form.direccion.value.trim(),
        id_municipio: ciudadSelect.value,
        id_usuario: idUsuario,
        codigo_postal: form.codigo_postal.value.trim(),
        observaciones: form.observaciones.value.trim() ? form.observaciones.value.trim() : null
      });
      success('Usuario actualizado correctamente');
      localStorage.removeItem('usuarioEditar');
      location.hash = '#/admin/usuarios/listar';
    } catch (err) {
      error('Error al actualizar usuario: ' + err.message);
    }
  });
}

