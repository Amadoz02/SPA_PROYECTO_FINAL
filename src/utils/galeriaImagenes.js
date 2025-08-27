import { del } from "../utils/manejo_api_optimizado.js";
import listProductosController from '../controllers/listProductosController.js';

function mostrarMensaje(texto) {
  const mensajeDiv = document.getElementById("mensajeSistema");
  if (!mensajeDiv) return;

  mensajeDiv.textContent = texto;
  mensajeDiv.style.display = "block";
  mensajeDiv.style.opacity = "1";

  setTimeout(() => {
    mensajeDiv.style.opacity = "0";
    setTimeout(() => {
      mensajeDiv.style.display = "none";
    }, 300); // espera a que se desvanezca
  }, 3000); // muestra el mensaje por 3 segundos
}


export default function abrirGaleriaModal(producto) {
  const modal = document.getElementById("galeriaModal");
  const cerrarBtn = document.getElementById("cerrarGaleria");
  const galeria = document.getElementById("galeriaImagenes");
  const inputFile = document.getElementById("nuevaImagenInput");
  const inputDesc = document.getElementById("descripcionImagenInput");
  const subirBtn = document.getElementById("subirImagenBtn");

  galeria.innerHTML = "";

  const imagenes = Array.isArray(producto.imagenes) ? producto.imagenes : [];

  imagenes.forEach(img => {
    const div = document.createElement("div");
    div.className = "imagen-item";

    const image = document.createElement("img");
    image.src = img.url_imagen;
    image.alt = img.descripcion || "Imagen";

    const eliminarBtn = document.createElement("button");
    eliminarBtn.textContent = "✖";
    eliminarBtn.className = "btn-eliminar-img";
    eliminarBtn.addEventListener("click", async () => {
      try {
        if (confirm("¿Eliminar esta imagen?")) {
        mostrarMensaje("Eliminando imagen...");
        await del(`imagenes/${img.id_imagen}`);
        mostrarMensaje("Imagen eliminada exitosamente");
        abrirGaleriaModal(producto);
        listProductosController();
        modal.style.display = "none";
      }

      } catch (error) {
        console.error("Error al eliminar imagen:", error);
        alert("Error al eliminar imagen");
        
      }
      
    });

    div.appendChild(image);
    div.appendChild(eliminarBtn);
    galeria.appendChild(div);
  });

  subirBtn.onclick = async () => {
    const file = inputFile.files[0];
    const descripcion = inputDesc.value.trim();

    if (!file) return alert("Selecciona una imagen");
    if (!descripcion) return alert("Agrega una descripción");

    const formData = new FormData();
    formData.append("imagen", file);
    formData.append("id_producto", producto.id_producto);
    formData.append("descripcion", descripcion);

    try {
     mostrarMensaje("Subiendo imagen...");
const res = await fetch("http://localhost:8080/helder/api/imagenes/subir", {
  method: "POST",
  body: formData
});
const result = await res.json();
mostrarMensaje("subiendo imagen.....");
mostrarMensaje("Imagen subida exitosamente");
inputFile.value = "";
inputDesc.value = "";
abrirGaleriaModal(producto);
listProductosController();
modal.style.display = "none";

    } catch (err) {
      alert("Error al subir imagen");
      console.error(err);
    }
  };

  cerrarBtn.onclick = () => {
    modal.style.display = "none";
  };

  modal.style.display = "flex";
}
