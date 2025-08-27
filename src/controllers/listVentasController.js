import comprasController from './compraController.js';

export default async function listVentasController() {
  try {
    const response = await fetch("http://localhost:8080/helder/api/usuarios/compradores");
    const compradores = await response.json();

    if (Array.isArray(compradores)) {
      const ids = compradores
        .filter(c => c.id_usuario)
        .map(c => c.id_usuario);

      if (ids.length > 0) {
        comprasController(null,ids); // Enviamos el array completo
      } else {
        console.warn("No se encontraron IDs válidos en los compradores.");
      }
    } else {
      console.error("La respuesta no es un arreglo.");
    }
  } catch (error) {
    console.error("Error al obtener los compradores:", error);
  }
}
