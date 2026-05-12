// LoginPage.jsx — CU-09 (Autenticar usuario) — CON VALIDACIONES COMPLETAS
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./Login.css";

const rutaInicial = (rol) => {
  if (rol === "Cocinero") return "/cocina";
  if (rol === "Dueno") return "/menu";
  return "/pedidos";
};

const LoginPage = () => {
  const { loginUser, errorLogin, setErrorLogin } = useAuth();
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [loading, setLoading] = useState(false);
  const [errores, setErrores] = useState({ usuario: "", contrasena: "" });
  const [touched, setTouched] = useState({ usuario: false, contrasena: false });

  const validarCampo = (nombre, valor) => {
    if (nombre === "usuario") {
      if (!valor.trim()) return "El usuario es obligatorio.";
      if (valor.trim().length < 3) return "El usuario debe tener al menos 3 caracteres.";
      if (/\s/.test(valor)) return "El usuario no puede contener espacios.";
    }
    if (nombre === "contrasena") {
      if (!valor) return "La contraseña es obligatoria.";
      if (valor.length < 4) return "La contraseña debe tener al menos 4 caracteres.";
    }
    return "";
  };

  const handleChange = (nombre, valor) => {
    if (nombre === "usuario") setUsuario(valor);
    else setContrasena(valor);

    if (touched[nombre]) {
      setErrores((prev) => ({ ...prev, [nombre]: validarCampo(nombre, valor) }));
    }
    // Limpiar error de autenticación al escribir
    if (errorLogin) setErrorLogin("");
  };

  const handleBlur = (nombre) => {
    const valor = nombre === "usuario" ? usuario : contrasena;
    setTouched((prev) => ({ ...prev, [nombre]: true }));
    setErrores((prev) => ({ ...prev, [nombre]: validarCampo(nombre, valor) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Marcar todos como tocados
    setTouched({ usuario: true, contrasena: true });
    const errU = validarCampo("usuario", usuario);
    const errC = validarCampo("contrasena", contrasena);
    setErrores({ usuario: errU, contrasena: errC });
    if (errU || errC) return;

    setLoading(true);
    const ok = await loginUser(usuario, contrasena);
    setLoading(false);
    if (ok) {
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
          <div className="login-card__logo-container">
            <img 
              src="/logo-pizza.png" 
              alt="Logo Pizzería" 
              className="login-card__logo-img" 
            />
          </div>
          <h1 className="login-card__title">Pizzería</h1>
          <p className="login-card__subtitle">Sistema de gestión</p>
        </div>

        <form className="login-card__body" onSubmit={handleSubmit} noValidate>
          {errorLogin && (
            <div className="login-error" role="alert">
              ⚠️ {errorLogin}
            </div>
          )}

          <div className="login-field">
            <label className="login-label" htmlFor="usuario">Usuario</label>
            <input
              id="usuario"
              className={`login-input${errores.usuario && touched.usuario ? " login-input--error" : ""}`}
              type="text"
              value={usuario}
              onChange={(e) => handleChange("usuario", e.target.value)}
              onBlur={() => handleBlur("usuario")}
              placeholder="Ej: mostrador"
              autoComplete="username"
              autoFocus
              maxLength={40}
            />
            {errores.usuario && touched.usuario && (
              <span className="login-field-error">{errores.usuario}</span>
            )}
          </div>

          <div className="login-field">
            <label className="login-label" htmlFor="contrasena">Contraseña</label>
            <input
              id="contrasena"
              className={`login-input${errores.contrasena && touched.contrasena ? " login-input--error" : ""}`}
              type="password"
              value={contrasena}
              onChange={(e) => handleChange("contrasena", e.target.value)}
              onBlur={() => handleBlur("contrasena")}
              placeholder="••••••••"
              autoComplete="current-password"
              maxLength={50}
            />
            {errores.contrasena && touched.contrasena && (
              <span className="login-field-error">{errores.contrasena}</span>
            )}
          </div>

          <button className="login-btn" type="submit" disabled={loading}>
            {loading ? "Ingresando..." : "Ingresar"}
          </button>

          <p className="login-hint">
            Usuarios: <strong>mostrador</strong> / <strong>cocina</strong> / <strong>dueno</strong> — contraseña: <strong>1234</strong>
          </p>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;