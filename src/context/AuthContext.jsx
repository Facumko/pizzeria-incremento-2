// AuthContext.jsx — CU-09 (Autenticación)
// Facu — INC-01
//
// FASE 1: usuarios hardcodeados en memoria.
// El login ahora usa `rol` como identificador en vez de nombre de usuario.
// FASE 2: reemplazar loginUser() con fetch() a /api/auth/login

import { createContext, useContext, useState, useEffect } from "react";

// Un usuario por rol — Fase 1
const USUARIOS_MOCK = [
  { id: 1, rol: "Mostrador", contrasena: "1234", nombre: "María López"   },
  { id: 2, rol: "Cocinero",  contrasena: "1234", nombre: "Jorge Ramírez" },
  { id: 3, rol: "Dueno",     contrasena: "1234", nombre: "Carlos García" },
];

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

  // FASE 2: reemplazar cuerpo por fetch a /api/auth/login
  // El payload cambia: { rol, contrasena } en vez de { usuario, contrasena }
  const loginUser = async (rol, contrasena) => {
    setErrorLogin("");

    if (!rol) {
      setErrorLogin("Seleccioná un rol.");
      return false;
    }
    if (!contrasena) {
      setErrorLogin("Ingresá la contraseña.");
      return false;
    }

    const encontrado = USUARIOS_MOCK.find(
      (x) => x.rol === rol && x.contrasena === contrasena
    );

    if (!encontrado) {
      setErrorLogin("Contraseña incorrecta.");
      return false;
    }

    const { contrasena: _, ...datos } = encontrado;
    setUsuario(datos);
    return true;
  };

  const logoutUser = () => {
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