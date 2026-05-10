// Sidebar.jsx — Facu — INC-01
// Navegación lateral. Muestra links según el rol del usuario autenticado.

import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./Layout.css";

// Links por rol
const LINKS_MOSTRADOR = [
  { to: "/pedidos", icon: "📋", label: "Pedidos" },
  { to: "/menu",    icon: "🍕", label: "Menú" },
];

const LINKS_COCINERO = [
  { to: "/cocina", icon: "👨‍🍳", label: "Cocina" },
];

const LINKS_DUENO = [
  { to: "/menu",   icon: "🍕", label: "Menú" },
];

const getLinksByRol = (rol) => {
  if (rol === "Mostrador") return LINKS_MOSTRADOR;
  if (rol === "Cocinero")  return LINKS_COCINERO;
  if (rol === "Dueno")     return LINKS_DUENO;
  return [];
};

const Sidebar = () => {
  const { usuario, logoutUser } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logoutUser();
    navigate("/login", { replace: true });
  };

  const links = getLinksByRol(usuario?.rol);

  return (
    <aside className="sidebar">
      <div className="sidebar__brand">
        <div className="sidebar__brand-title">🍕 Pizzería</div>
        <div className="sidebar__brand-sub">Sistema de gestión</div>
      </div>

      <nav className="sidebar__nav">
        <span className="sidebar__section-label">Módulos</span>
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `sidebar__link ${isActive ? "sidebar__link--active" : ""}`
            }
          >
            <span className="sidebar__link-icon">{link.icon}</span>
            {link.label}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar__footer">
        <div className="sidebar__user">
          <span className="sidebar__user-name">{usuario?.nombre}</span>
          <span className="sidebar__user-rol">{usuario?.rol}</span>
        </div>
        <button className="sidebar__logout" onClick={handleLogout}>
          ↩ Cerrar sesión
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;