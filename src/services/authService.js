const ROL_MAP = {
  MANAGER: "Mostrador",
  COOKEER:    "Cocina",
  OWNER:   "Dueño",
};

const mapearRol = (role) => ROL_MAP[role] ?? role;

export const loginUser = async (username, password) => {
  try {
    const response = await fetch("/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ username, password }),
    });

    if (response.status === 200) {
      const data = await response.json();
      return {
        success: true,
        data: { ...data, role: mapearRol(data.role) },
      };
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
    return { success: false, message: `Error del servidor (${response.status})` };
  } catch (error) {
    console.error("Error en loginUser:", error);
    return { success: false, message: `Error de conexión: ${error.message}` };
  }
};

export const logoutUser = async () => {
  try {
    const response = await fetch("/auth/logout", {
      method: "POST",
      credentials: "include",
    });
    return response.status === 204;
  } catch (error) {
    console.error("Error en logoutUser:", error);
    return false;
  }
};