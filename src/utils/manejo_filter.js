import { get } from "./manejo_api_optimizado";

export default async function obtenerProductosFiltrados(filtros) {
    const baseUrl = "productos/filtrar/";

    // Construimos los parámetros dinámicamente
    const params = new URLSearchParams();

    // if (filtros.id_talla && filtros.id_talla.length > 0) {
    //     filtros.id_talla.forEach(t => params.append("id_talla", t));
    // }

    if (filtros.id_categoria && filtros.id_categoria.length > 0) {
        filtros.id_categoria.forEach(c => params.append("id_categoria", c));
    }

    if (filtros.id_genero && filtros.id_genero.length > 0) {
        filtros.id_genero.forEach(g => params.append("id_genero", g));
    }

    const url = `${baseUrl}?${params.toString()}`;

    try {
        const productos = await get(url);
       
        console.log("Productos filtrados:", productos);
        return productos;
    } catch (error) {
        console.error("Error en la petición:", error);
        return [];
    }
}
