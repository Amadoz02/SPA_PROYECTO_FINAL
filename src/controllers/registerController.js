// registerController.js
import { validarCamposEnTiempoReal, validarFormularioFinal } from '../utils/validar_campos.js';
import { success, info, error } from '../utils/alert.js';
import Choices from 'choices.js';

export default function registerController() {

  // Elementos
  const departamentoSelect = document.getElementById('departamento');
  const ciudadSelect = document.getElementById('ciudad');
  const form = document.querySelector('.form__group');
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
      console.log(departamentos);
      
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
      console.log(municipios);
      
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
  });

  // Validación en tiempo real
  if (!form) return;
  validarCamposEnTiempoReal(form);

  // Envío del formulario
  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const esValido = validarFormularioFinal(form);
    if (!esValido) {
      info("Por favor corrige los errores antes de continuar.");
      return;
    }

    const nombre = form.nombre.value.trim();
    const correo = form.correo.value.trim();
    const contrasenas = form.contrasena.value.trim();
    const id_municipio = idMunicipioSeleccionado;
    const codigo_postal = form.codigo_postal.value.trim();
    const direccion = form.direccion.value.trim();
    const observaciones = form.observaciones.value.trim();

    try {
      const nuevoUsuario = {
        nombre,
        correo,
        contrasena: contrasenas,
        id_rol: 3,
        id_estado: 1
      };

      const resUsuario = await fetch("http://localhost:8080/helder/api/usuarios/Registrarse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(nuevoUsuario)
      });

      if (!resUsuario.ok) throw new Error("No se pudo registrar el usuario.");

      const usuarioCreado = await resUsuario.json();
      const id_usuario_creado = usuarioCreado.id_usuario;

      const nuevaDireccion = {
        id_usuario: id_usuario_creado,
        direccion,
        id_municipio,
        codigo_postal,
        observaciones
      };

      const resDireccion = await fetch("http://localhost:8080/helder/api/direcciones/registro", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(nuevaDireccion)
      });

      if (!resDireccion.ok) {
        throw new Error("El usuario fue creado pero no se pudo registrar la dirección.");
      }

      success("¡Registro exitoso!", "Ahora puedes iniciar sesión.");
      form.reset();
      setTimeout(() => {
        window.location.hash = '#/login';
      }, 1200);
    } catch (err) {
      console.error("Error durante el registro:", err);
      error("No se puede registrar el usuario. ¿El correo ya está en uso?");
    }
  });
}
