export default function registerController() {
  const form = document.querySelector(".form__group");
  if (!form) return;

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const nombre = document.getElementById("nombre").value.trim();
    const correo = document.getElementById("correo").value.trim();
    const contrasenas = document.getElementById("password").value.trim();
    const ciudad = document.getElementById("ciudad").value.trim();
    const departamento = document.getElementById("departamento").value.trim();
    const codigo_postal = document.getElementById("codigo_postal").value.trim();
    const direccion = document.getElementById("direccion").value.trim();
    const observaciones = document.getElementById("observaciones").value.trim();

    if (!nombre || !correo || !contrasenas || !ciudad || !departamento || !codigo_postal || !direccion) {
      alert("Por favor completa todos los campos obligatorios.");
      return;
    }

    try {
      const nuevoUsuario = {
        nombre,
        correo,
        contrasena: contrasenas,
        id_rol: 3,
        estado: "Activo"
      };
      console.log(JSON.stringify(nuevoUsuario));
      const resUsuario = await fetch("http://localhost:8080/helder/api/usuarios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(nuevoUsuario)
      });
      if (!resUsuario.ok) {
        throw new Error("No se pudo registrar el usuario.");
      }
      const usuarioCreado = await resUsuario.json();
      const id_usuario_creado = usuarioCreado.id_usuario;
      console.log(`Usuario creado con ID: ${id_usuario_creado}`);
      const nuevaDireccion = {
        id_usuario: id_usuario_creado,
        direccion,
        ciudad,
        departamento,
        codigo_postal,
        observaciones
      };
      console.log(nuevaDireccion);
      const resDireccion = await fetch("http://localhost:8080/helder/api/direcciones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(nuevaDireccion)
      });
      if (!resDireccion.ok) {
        throw new Error("El usuario fue creado pero no se pudo registrar la dirección.");
      }
      alert("¡Registro exitoso!");
      form.reset();
    } catch (error) {
      console.error("Error durante el registro:", error);
      alert("Ocurrió un error durante el registro. Inténtalo de nuevo.");
    }
  });
}

