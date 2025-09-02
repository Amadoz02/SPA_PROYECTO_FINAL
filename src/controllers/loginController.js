import {info, success, confirm, error} from '../utils/alert.js';
import { router } from '../Router/router.js';
import { loadNavbar } from '../utils/navbarUtils.js';

export default function loginController() {
  const form = document.querySelector(".form__group");
  if (!form) return;


  loadNavbar();

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
        // Guardar tokens y datos del usuario en localStorage
        localStorage.setItem("token", result.accessToken);
        localStorage.setItem("refreshToken", result.refreshToken);
        localStorage.setItem("id_usuario", result.usuario.id);
        localStorage.setItem("usuario_nombre", result.usuario.nombre);
        localStorage.setItem("usuario_correo", result.usuario.correo);
        localStorage.setItem("permisos", JSON.stringify(result.usuario.permisos));
        localStorage.setItem("id_rol", result.usuario.rol.id);
        localStorage.setItem("nombre_rol", result.usuario.rol.nombre);

        success("Inicio de sesión exitoso", `Bienvenido, ${result.usuario.nombre}`);

        loadNavbar();

        // Redirigir según el rol
        if (result.usuario.rol.nombre === "admin" || result.usuario.rol.nombre === "SuperAdministrador") {
          location.hash = "/admin/dashboard";
        } else if (result.usuario.rol.nombre === "cliente") {
          location.hash = "/cliente/home";
        } else {
          location.hash = "/bienvenida";
        }
        router();
      } else {
        error(result.error || "Error al iniciar sesión", "Credenciales inválidas");
      }
    } catch (error) {
      console.error("Error en el login:", error);
      error("No se pudo conectar con el servidor");
    }
  });
}
