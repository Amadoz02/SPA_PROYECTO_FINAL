// Controlador Listar Ventas
import {get} from "../../../../utils/manejo_api_optimizado.js"
import comprasController from "../../../cliente/compras/comprascontroller.js"

export default async function listVentasController() {
  try {
    const compradores = await get("usuarios/compradores");
    console.log(compradores);
    
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