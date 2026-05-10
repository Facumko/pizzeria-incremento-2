// LoginPage.jsx — CU-09 (Autenticar usuario)
// Facu — INC-01

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./Login.css";

// Ruta de inicio según rol del usuario
const rutaInicial = (rol) => {
  if (rol === "Cocinero") return "/cocina";
  if (rol === "Dueno")    return "/menu";
  return "/pedidos"; // Mostrador
};

const LoginPage = () => {
  const { loginUser, errorLogin } = useAuth();
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const ok = await loginUser(usuario, contrasena);
    setLoading(false);
    if (ok) {
      // Leer el rol del usuario recién seteado en localStorage
      try {
        const sesion = JSON.parse(localStorage.getItem("pizzeria_sesion"));
        navigate(rutaInicial(sesion?.rol), { replace: true });
      } catch {
        navigate("/pedidos", { replace: true });
      }
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-card__header">
          <div className="login-card__logo">🍕</div>
          <h1 className="login-card__title">Pizzería</h1>
          <p className="login-card__subtitle">Sistema de gestión</p>
        </div>

        <form className="login-card__body" onSubmit={handleSubmit}>
          {errorLogin && (
            <div className="login-error" role="alert">{errorLogin}</div>
          )}

          <div className="login-field">
            <label className="login-label" htmlFor="usuario">Usuario</label>
            <input
              id="usuario"
              className="login-input"
              type="text"
              value={usuario}
              onChange={(e) => setUsuario(e.target.value)}
              placeholder="Ej: mostrador"
              autoComplete="username"
              autoFocus
            />
          </div>

          <div className="login-field">
            <label className="login-label" htmlFor="contrasena">Contraseña</label>
            <input
              id="contrasena"
              className="login-input"
              type="password"
              value={contrasena}
              onChange={(e) => setContrasena(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
            />
          </div>

          <button className="login-btn" type="submit" disabled={loading}>
            {loading ? "Ingresando..." : "Ingresar"}
          </button>

          <p className="login-hint">
            Usuarios de prueba: mostrador / cocina / dueno — contraseña: 1234
          </p>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;