document.getElementById("formularioImagen").addEventListener("submit", async function (e) {
  e.preventDefault();

  const form = e.target;
  const data = new FormData(form); // Captura todos los inputs automáticamente

  try {
    const response = await fetch("http://localhost:8080/helder/api/imagenes/subir", {
      method: "POST",
      body: data
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error("Error al subir: " + errorText);
    }

    const result = await response.json();
    document.getElementById("resultado").textContent = JSON.stringify(result, null, 2);
  } catch (error) {
    document.getElementById("resultado").textContent = "Error: " + error.message;
    console.error("Error al subir imagen:", error);
  }
});
