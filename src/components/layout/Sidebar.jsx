// Navegación lateral. Muestra links según el rol del usuario autenticado.

import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./Layout.css";

// Links por rol
const LINKS_MOSTRADOR = [
  { to: "/pedidos", label: "Pedidos" },
  { to: "/menu", label: "Menú" },
];

const LINKS_COCINERO = [
  { to: "/cocina", label: "Cocina" },
];

const LINKS_DUEÑO = [
  { to: "/menu", label: "Menú" },
];

const getLinksByRol = (rol) => {
  if (rol === "Mostrador") return LINKS_MOSTRADOR;
  if (rol === "Cocina")    return LINKS_COCINA;
  if (rol === "Dueño")     return LINKS_DUEÑO;
  return [];
};

const Sidebar = () => {
  const { usuario, logoutUser } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logoutUser();
    navigate("/login", { replace: true });
  };

  const links = getLinksByRol(usuario?.rol);

  return (
    <aside className="sidebar">
      <div className="sidebar__brand">
        {/* Nuevo contenedor para el logo PNG */}
        <div className="sidebar__logo-container">
          <img 
            src="/logo-pizza.png" 
            alt="Logo" 
            className="sidebar__logo-img" 
          />
        </div>
        
        <div className="sidebar__brand-info">
          <div className="sidebar__brand-title">Pizzería</div>
        </div>
      </div>

      <nav className="sidebar__nav">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `sidebar__link ${isActive ? "sidebar__link--active" : ""}`
            }
          >
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
          <span>↩</span> Cerrar sesión
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;