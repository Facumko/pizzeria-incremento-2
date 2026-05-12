// AuthContext.jsx — CU-09 (Autenticación)
import { createContext, useContext, useState, useEffect } from "react";
import { loginUser as loginUserBackend, logoutUser as logoutUserBackend } from "../services/authService";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [usuario, setUsuario] = useState(() => {
    try {
      const guardado = localStorage.getItem("pizzeria_sesion");
      return guardado ? JSON.parse(guardado) : null;
    } catch {
      return null;
    }
  });
  const [errorLogin, setErrorLogin] = useState("");

  useEffect(() => {
    if (usuario) {
      localStorage.setItem("pizzeria_sesion", JSON.stringify(usuario));
    } else {
      localStorage.removeItem("pizzeria_sesion");
    }
  }, [usuario]);

  const loginUser = async (username, password) => {
    setErrorLogin("");

    if (!username) {
      setErrorLogin("Seleccioná un rol.");
      return false;
    }
    if (!password) {
      setErrorLogin("Ingresá la contraseña.");
      return false;
    }

    const resultado = await loginUserBackend(username, password);

    if (resultado.success) {
      const datosUsuario = {
        usuario: resultado.data.username,
        rol: resultado.data.role,
      };
      setUsuario(datosUsuario);
      return true;
    } else {
      setErrorLogin(resultado.message);
      return false;
    }
  };

  const logoutUser = async () => {
    await logoutUserBackend();
    setUsuario(null);
    setErrorLogin("");
  };

  const tieneRol = (...roles) => !!usuario && roles.includes(usuario.rol);

  return (
    <AuthContext.Provider
      value={{ usuario, errorLogin, setErrorLogin, loginUser, logoutUser, tieneRol }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de AuthProvider");
  return ctx;
};