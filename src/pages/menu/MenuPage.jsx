// MenuPage.jsx
// Acceso: Mostrador (solo consulta) | Dueño (CRUD completo)

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getPizzas, eliminarPizza } from "../../services/pizzaService";
import { useAuth } from "../../context/AuthContext";
import PizzaCard from "./PizzaCard";
import "./Menu.css";

const TIPOS_FILTRO = ["Todos", "piedra", "parrilla", "molde"];
const MAX_BUSQUEDA = 100;

const MenuPage = () => {
  const navigate = useNavigate();
  const { tieneRol } = useAuth();
  const esDueño = tieneRol("Dueño");

  const [pizzas,     setPizzas]     = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [busqueda,   setBusqueda]   = useState("");
  const [filtroTipo, setFiltroTipo] = useState("Todos");
  const [feedback,   setFeedback]   = useState("");

  const cargar = async () => {
    setLoading(true);
    try {
      const data = await getPizzas();
      setPizzas(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { cargar(); }, []);

  const handleEliminar = async (id) => {
    try {
      await eliminarPizza(id);
      mostrarFeedback("Variedad eliminada correctamente.");
      cargar();
    } catch (e) {
      mostrarFeedback(`Error: ${e.message}`, true);
    }
  };

  const mostrarFeedback = (msg) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(""), 3500);
  };

  // Filtrado local — CU-04
  const pizzasFiltradas = pizzas.filter((p) => {
    const matchBusqueda =
      !busqueda ||
      p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      p.ingredientes.toLowerCase().includes(busqueda.toLowerCase());
    const matchTipo =
      filtroTipo === "Todos" || p.tipos.includes(filtroTipo);
    return matchBusqueda && matchTipo;
  });

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">MENÚ</h1>
        {esDueño && (
          <button
            className="btn btn--primary"
            onClick={() => navigate("/menu/nueva")}
          >
            + Nueva variedad
          </button>
        )}
      </div>

      {feedback && (
        <div className="alert-error" style={{ background: "#eafaf1", borderColor: "#82e0aa", color: "#1e8449" }}>
          {feedback}
        </div>
      )}

      {/* Barra de filtros — CU-04 */}
      <div className="menu-toolbar">
        <input
          className="menu-toolbar__search"
          type="text"
          placeholder="Buscar por nombre o ingrediente..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          maxLength={MAX_BUSQUEDA}
        />
        <div className="filtros-bar" style={{ marginBottom: 0 }}>
          {TIPOS_FILTRO.map((t) => (
            <button
              key={t}
              className={`filtro-btn ${filtroTipo === t ? "filtro-btn--active" : ""}`}
              onClick={() => setFiltroTipo(t)}
            >
              {t === "Todos" ? "Todos" : t}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <p className="empty-message">Cargando...</p>
      ) : pizzasFiltradas.length === 0 ? (
        <p className="empty-message">
          {pizzas.length === 0
            ? "No hay variedades registradas en el menú."
            : "No hay variedades que coincidan con los filtros."}
        </p>
      ) : (
        <div className="menu-grid">
          {pizzasFiltradas.map((pizza) => (
            <PizzaCard
              key={pizza.id}
              pizza={pizza}
              puedeGestionar={esDueño}
              onEditar={(p) => navigate(`/menu/editar/${p.id}`)}
              onEliminar={handleEliminar}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default MenuPage;