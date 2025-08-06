export default function loginController() {
  const form = document.querySelector(".form__group");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const correo = document.getElementById("email").value.trim();
    const contrasena = document.getElementById("password").value;
    const data = { correo, contrasena };
    try {
      const response = await fetch("http://localhost:8080/helder/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      const result = await response.json();
      console.log("Respuesta del backend:", result);
      if (response.ok) {
        // Guardar el nombre del rol correctamente
        sessionStorage.setItem("token", result.accessToken);
        sessionStorage.setItem("refreshToken", result.refreshToken);
        sessionStorage.setItem("rol", result.rol);
        // Si tienes id_usuario, descomenta la siguiente línea:
        sessionStorage.setItem("id_usuario", result.id_usuario);
        console.log("ID de usuario guardado en sessionStorage:", sessionStorage.getItem("id_usuario"));
        
        console.log("rol guardado en sessionStorage:", sessionStorage.getItem("rol"));
        window.location.href = "#home";
      } else {
        alert(result.error || "Error al iniciar sesión");
      }
    } catch (error) {
      console.error("Error en el login:", error);
      alert("No se pudo conectar con el servidor");
    }
  });
}
