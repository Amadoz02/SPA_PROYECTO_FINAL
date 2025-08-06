/**
 * Módulo optimizado para manejo de peticiones API
 * Incluye manejo robusto de errores y respuestas vacías
 */

const url = 'http://localhost:8080/helder/api/';
const idUsuario = parseInt(sessionStorage.getItem("id_usuario"));

/**
 * Función auxiliar para manejar respuestas HTTP de forma robusta
 * @param {Response} response - Objeto Response de fetch
 * @returns {Promise<Object>} - Datos parseados o mensaje de éxito
 */
const handleResponse = async (response) => {
  // Manejar respuestas exitosas sin contenido (204)
  if (response.status === 204) {
    return { success: true, message: 'Operación exitosa', status: 204 };
  }
  
  // Manejar respuestas exitosas con contenido
  if (response.ok) {
    const contentType = response.headers.get('content-type');
    
    // Verificar si la respuesta es JSON
    if (contentType && contentType.includes('application/json')) {
      try {
        return await response.json();
      } catch (jsonError) {
        // Si hay error al parsear JSON, devolver éxito
        console.warn('Respuesta no es JSON válido:', jsonError);
        return { success: true, message: 'Operación completada' };
      }
    }
    
    // Si no es JSON, devolver éxito
    return { success: true, message: 'Operación completada' };
  }
  
  // Manejar errores HTTP
  let errorMessage = 'Error en la operación';
  try {
    const errorData = await response.json();
    errorMessage = errorData.message || errorData.error || errorMessage;
  } catch {
    errorMessage = `Error ${response.status}: ${response.statusText}`;
  }
  
  throw new Error(errorMessage);
};

/**
 * Realiza una petición GET
 * @param {string} endpoint - Endpoint de la API
 * @returns {Promise<Object>} - Datos obtenidos
 */
export const get = async (endpoint) => {
  try {
    const response = await fetch(url + endpoint);
    return await handleResponse(response);
  } catch (error) {
    console.error('Error en GET:', error);
    throw error;
  }
};

/**
 * Realiza una petición POST
 * @param {string} endpoint - Endpoint de la API
 * @param {Object} objeto - Datos a enviar
 * @returns {Promise<Object>} - Respuesta del servidor
 */
export const post = async (endpoint, objeto) => {
  try {
    const response = await fetch(url + endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'usuarioId': idUsuario ? idUsuario : ''
      },
      body: JSON.stringify(objeto)
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('Error en POST:', error);
    throw error;
  }
};

/**
 * Realiza una petición PATCH
 * @param {string} endpoint - Endpoint de la API
 * @param {Object} data - Datos a actualizar
 * @returns {Promise<Object>} - Respuesta del servidor
 */
export const patch = async (endpoint, data) => {
  try {
    const response = await fetch(url + endpoint, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'usuarioId': idUsuario ? idUsuario : ''
      },
      body: JSON.stringify(data)
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('Error en PATCH:', error);
    throw error;
  }
};

/**
 * Realiza una petición PUT
 * @param {string} endpoint - Endpoint de la API
 * @param {Object} objeto - Datos a actualizar
 * @returns {Promise<Object>} - Respuesta del servidor
 */
export const put = async (endpoint, objeto) => {
  try {
    const response = await fetch(url + endpoint, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(objeto)
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('Error en PUT:', error);
    throw error;
  }
};

/**
 * Realiza una petición DELETE
 * @param {string} endpoint - Endpoint de la API
 * @returns {Promise<Object>} - Respuesta del servidor
 */
export const del = async (endpoint) => {
  try {
    const response = await fetch(url + endpoint, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('Error en DELETE:', error);
    throw error;
  }
};

// Exportar todo como objeto por defecto también
export default {
  get,
  post,
  patch,
  put,
  del
};
