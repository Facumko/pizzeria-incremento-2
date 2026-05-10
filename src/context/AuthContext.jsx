// AuthContext.jsx — CU-09 (Autenticación)
// Facu — INC-01
//
// FASE 1: usuarios hardcodeados en memoria.
// FASE 2: reemplazar loginUser() con fetch() a /api/auth/login

import { createContext, useContext, useState, useEffect } from "react";

// Usuarios de prueba — Fase 1
const USUARIOS_MOCK = [
  { id: 1, usuario: "mostrador", contrasena: "1234", rol: "Mostrador", nombre: "María López" },
  { id: 2, usuario: "cocina",    contrasena: "1234", rol: "Cocinero",  nombre: "Jorge Ramírez" },
  { id: 3, usuario: "dueno",     contrasena: "1234", rol: "Dueno",     nombre: "Carlos García" },
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

  // FASE 2: reemplazar cuerpo por:
  //   const r = await fetch("http://localhost:8080/api/auth/login", {
  //     method: "POST",
  //     headers: { "Content-Type": "application/json" },
  //     body: JSON.stringify({ usuario: u, contrasena: c }),
  //   });
  //   if (!r.ok) { setErrorLogin("Usuario o contraseña incorrectos."); return false; }
  //   setUsuario(await r.json());
  //   return true;
  const loginUser = async (u, c) => {
    setErrorLogin("");
    if (!u.trim() || !c.trim()) {
      setErrorLogin("Completá usuario y contraseña.");
      return false;
    }
    const encontrado = USUARIOS_MOCK.find(
      (x) => x.usuario === u.trim() && x.contrasena === c
    );
    if (!encontrado) {
      setErrorLogin("Usuario o contraseña incorrectos.");
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

  // Helper para verificar rol (usarlo en ProtectedRoute y en lógica condicional)
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