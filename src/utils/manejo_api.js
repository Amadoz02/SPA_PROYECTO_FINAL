const url = 'http://localhost:8080/helder/api/';
const idUsuario = parseInt(sessionStorage.getItem("id_usuario"));
export const get = async (endpoint) => {
  
  const respuesta = await fetch(url + endpoint);  
  if (respuesta.status == 204) 
    return {success: true, data: null};
  
  const datos = await respuesta.json();  
  return datos;

}


export const post = async (endpoint, objeto) => {
  const respuesta = await fetch(url + endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'usuarioId': idUsuario ? idUsuario : '' // Asegura que el usuarioId se envíe si está disponible
    },
    body: JSON.stringify(objeto)
  });
  const datos = await respuesta.json();  
  return datos;
}

export async function patch(endpoint, data) {
  const response = await fetch(url+endpoint, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'usuarioId': idUsuario ? idUsuario : '' // Asegura que el usuarioId se envíe si está disponible
    },
    body: JSON.stringify(data)
  });

  const result = await response.json();
  return result;
}


export const put = async (endpoint, objeto) => {
  const respuesta = await fetch(url + endpoint, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(objeto)
  });
  const datos = await respuesta.json();
  return datos;
}

export const del = async (endpoint) => {
  const respuesta = await fetch(url + endpoint, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json'
    }
  });
  const datos = await respuesta.json();
  return datos;
}