// authService.js — Autenticación con backend
// https://superadditional-septariate-olevia.ngrok-free.dev

/**
 * POST /auth/login
 * Autentica al usuario y crea una sesión.
 * La cookie JSESSIONID se maneja automáticamente con credentials: "include".
 */
export const loginUser = async (username, password) => {
  try {
    const response = await fetch("/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "true",
      },
      credentials: "include",
      body: JSON.stringify({ username, password }),
    });

    // 200 OK — login exitoso
    if (response.status === 200) {
      const data = await response.json();
      return { success: true, data };
    }

    // 401 Unauthorized — credenciales incorrectas
    if (response.status === 401) {
      const data = await response.json();
      return {
        success: false,
        message: data.message || "Usuario o contraseña incorrectos",
      };
    }

    // 400 Bad Request — campos vacíos o inválidos
    if (response.status === 400) {
      const data = await response.json();
      const errors = data.errors || {};
      const mensaje = Object.values(errors).join(", ") || "Campos vacíos";
      return { success: false, message: mensaje };
    }

    // Cualquier otro error del servidor
    return {
      success: false,
      message: `Error del servidor (${response.status})`,
    };
  } catch (error) {
    console.error("Error en logoutUser:", error);
    return {
      success: false,
      message: `Error de conexión: ${error.message}`,
    };
  }
};

/**
 * POST /auth/logout
 * Invalida la sesión activa del usuario.
 * Retorna true si el servidor respondió 204 No Content.
 */
export const logoutUser = async () => {
  try {
    const response = await fetch("/auth/logout", {
      method: "POST",
      credentials: "include",
      headers: {
        "ngrok-skip-browser-warning": "true",
      },
    });

    return response.status === 204;
  } catch (error) {
    console.error("Error en logoutUser:", error);
    return false;
  }
};