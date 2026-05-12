// authService.js - Autenticación con backend

const API_URL = "";

/**
 * POST /auth/login
 * Autentica al usuario y crea una sesión
 * La cookie JSESSIONID se envía automáticamente con credentials: 'include'
 */
export const loginUser = async (username, password) => {
  try {
    const response = await fetch(`/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include", // Envía y recibe cookies automáticamente
      body: JSON.stringify({ username, password }),
    });

    // Casos de respuesta
    if (response.status === 200) {
      const data = await response.json();
      return { success: true, data };
    }

    if (response.status === 401) {
      const data = await response.json();
      return { success: false, message: data.message || "Usuario o contraseña incorrectos" };
    }

    if (response.status === 400) {
      const data = await response.json();
      const errors = data.errors || {};
      const mensaje = Object.values(errors).join(", ") || "Campos vacíos";
      return { success: false, message: mensaje };
    }

    return { success: false, message: "Error desconocido del servidor" };
  } catch (error) {
    console.error("Error en loginUser:", error);
    return { success: false, message: `Error de conexión: ${error.message}` };
  }
};

/**
 * POST /auth/logout
 * Invalida la sesión activa del usuario
 * Envía la cookie JSESSIONID automáticamente
 */
export const logoutUser = async () => {
  try {
    const response = await fetch(`/auth/logout`, {
      method: "POST",
      credentials: "include", // Envía la cookie JSESSIONID
    });

    // 204 No Content = éxito
    return response.status === 204;
  } catch (error) {
    console.error("Error en logoutUser:", error);
    return false;
  }
};
