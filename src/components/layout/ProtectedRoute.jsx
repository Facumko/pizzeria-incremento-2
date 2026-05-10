// ProtectedRoute.jsx — Facu — INC-01
// Wrapper que protege rutas según rol del usuario autenticado.
// Props: roles (array de strings) — ej: ["Mostrador", "Dueno"]

import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const ProtectedRoute = ({ roles, children }) => {
  const { usuario, logoutUser } = useAuth();
  const navigate = useNavigate();

  // No autenticado → al login
  if (!usuario) return <Navigate to="/login" replace />;

  // Autenticado pero sin el rol necesario → pantalla de sin acceso
  // (evita loops de redirección)
  if (roles && !roles.includes(usuario.rol)) {
    return (
      <div style={{
        minHeight: "100vh", display: "flex", alignItems: "center",
        justifyContent: "center", flexDirection: "column", gap: 16,
        background: "var(--color-bg)", fontFamily: "var(--font-main)"
      }}>
        <span style={{ fontSize: 48 }}>🚫</span>
        <p style={{ fontSize: 18, color: "var(--color-text)" }}>
          No tenés acceso a esta sección.
        </p>
        <div style={{ display: "flex", gap: 12 }}>
          <button
            className="btn btn--ghost"
            onClick={() => navigate(-1)}
          >
            Volver
          </button>
          <button
            className="btn btn--secondary"
            onClick={() => { logoutUser(); navigate("/login", { replace: true }); }}
          >
            Cerrar sesión
          </button>
        </div>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;