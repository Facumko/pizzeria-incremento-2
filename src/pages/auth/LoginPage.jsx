// LoginPage.jsx — CU-09 (Autenticar usuario)
// Rol seleccionable (Mostrador / Cocinero / Dueño), contraseña limitada sin contador visible.

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./Login.css";

const ROLES = [
  { value: "Mostrador", label: "Mostrador" },
  { value: "Cocina",    label: "Cocina"    },
  { value: "Dueño",     label: "Dueño"     },
];

const MAX_PASSWORD = 30;

const rutaInicial = (rol) => {
  if (rol === "Cocina") return "/cocina";
  if (rol === "Dueño")  return "/menu";
  return "/pedidos";
};

const LoginPage = () => {
  const { loginUser, errorLogin, setErrorLogin } = useAuth();
  const navigate = useNavigate();

  const [rol,        setRol]        = useState("");
  const [contrasena, setContrasena] = useState("");
  const [loading,    setLoading]    = useState(false);
  const [errores,    setErrores]    = useState({ rol: "", contrasena: "" });
  const [touched,    setTouched]    = useState({ rol: false, contrasena: false });

  const validarCampo = (nombre, valor) => {
    if (nombre === "rol") {
      if (!valor) return "Seleccioná un rol.";
    }
    if (nombre === "contrasena") {
      if (!valor)           return "La contraseña es obligatoria.";
      if (valor.length < 4) return "Mínimo 4 caracteres.";
    }
    return "";
  };

  const handleChangeRol = (valor) => {
    setRol(valor);
    if (errorLogin) setErrorLogin("");
    if (touched.rol)
      setErrores((prev) => ({ ...prev, rol: validarCampo("rol", valor) }));
  };

  const handleChangePassword = (valor) => {
    setContrasena(valor);
    if (errorLogin) setErrorLogin("");
    if (touched.contrasena)
      setErrores((prev) => ({ ...prev, contrasena: validarCampo("contrasena", valor) }));
  };

  const handleBlur = (nombre) => {
    const valor = nombre === "rol" ? rol : contrasena;
    setTouched((prev) => ({ ...prev, [nombre]: true }));
    setErrores((prev) => ({ ...prev, [nombre]: validarCampo(nombre, valor) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched({ rol: true, contrasena: true });
    const errR = validarCampo("rol",        rol);
    const errC = validarCampo("contrasena", contrasena);
    setErrores({ rol: errR, contrasena: errC });
    if (errR || errC) return;

    setLoading(true);
    const ok = await loginUser(rol, contrasena);
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

          {/* ── Selector de rol ── */}
          <div className="login-field">
            <label className="login-label" htmlFor="rol">Rol</label>
            <div className="login-select-wrapper">
              <select
                id="rol"
                className={`login-input login-select${errores.rol && touched.rol ? " login-input--error" : ""}`}
                value={rol}
                onChange={(e) => handleChangeRol(e.target.value)}
                onBlur={() => handleBlur("rol")}
                autoFocus
              >
                <option value="">Seleccionar Usuario</option>
                {ROLES.map((r) => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
              <span className="login-select-arrow">▾</span>
            </div>
            {errores.rol && touched.rol && (
              <span className="login-field-error">{errores.rol}</span>
            )}
          </div>

          {/* ── Contraseña ── */}
          <div className="login-field">
            <label className="login-label" htmlFor="contrasena">Contraseña</label>
            <input
              id="contrasena"
              className={`login-input${errores.contrasena && touched.contrasena ? " login-input--error" : ""}`}
              type="password"
              value={contrasena}
              onChange={(e) => handleChangePassword(e.target.value)}
              onBlur={() => handleBlur("contrasena")}
              placeholder="••••••••"
              autoComplete="current-password"
              maxLength={MAX_PASSWORD}
            />
            {errores.contrasena && touched.contrasena && (
              <span className="login-field-error">{errores.contrasena}</span>
            )}
          </div>

          <button className="login-btn" type="submit" disabled={loading}>
            {loading ? "Ingresando..." : "Ingresar"}
          </button>

          <p className="login-hint"></p>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;