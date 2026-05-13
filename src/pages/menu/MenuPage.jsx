// MenuPage.jsx — CU-01, CU-02, CU-03, CU-04
// Agrupa la lista plana del backend por nombre de variedad.

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getPizzas, agruparPorVariedad } from "../../services/pizzaService";
import { useAuth } from "../../context/AuthContext";
import PizzaCard from "./PizzaCard";
import "./Menu.css";

const MAX_BUSQUEDA = 100;

const MenuPage = () => {
  const navigate = useNavigate();
  const { tieneRol } = useAuth();
  const esDueño = tieneRol("Dueño");

  const [pizzasRaw,  setPizzasRaw]  = useState([]); // lista plana del backend
  const [variedades, setVariedades] = useState([]); // agrupadas por nombre
  const [loading,    setLoading]    = useState(true);
  const [busqueda,   setBusqueda]   = useState("");
  const [feedback,   setFeedback]   = useState("");

  const cargar = async () => {
    setLoading(true);
    try {
      const lista = await getPizzas();
      setPizzasRaw(lista);
      setVariedades(agruparPorVariedad(lista));
    } catch (e) {
      setFeedback(`Error al cargar: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { cargar(); }, []);

  const handleEliminada = (nombre) => {
    setFeedback(`"${nombre}" eliminada correctamente.`);
    setTimeout(() => setFeedback(""), 3500);
    cargar();
  };

  const variedadesFiltradas = variedades.filter((v) =>
    !busqueda ||
    v.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    v.descripcion?.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Menú</h1>
        {esDueño && (
          <button className="btn btn--primary" onClick={() => navigate("/menu/nueva")}>
            + Nueva variedad
          </button>
        )}
      </div>

      {feedback && (
        <div className="alert-error" style={{ background: "#eafaf1", borderColor: "#82e0aa", color: "#1e8449" }}>
          {feedback}
        </div>
      )}

      <div className="menu-toolbar">
        <input
          className="menu-toolbar__search"
          type="text"
          placeholder="Buscar por nombre o descripción..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          maxLength={MAX_BUSQUEDA}
        />
      </div>

      {loading ? (
        <p className="empty-message">Cargando...</p>
      ) : variedadesFiltradas.length === 0 ? (
        <p className="empty-message">
          {variedades.length === 0
            ? "No hay variedades registradas en el menú."
            : "No hay variedades que coincidan con la búsqueda."}
        </p>
      ) : (
        <div className="menu-grid">
          {variedadesFiltradas.map((v) => (
            <PizzaCard
              key={v.nombre}
              variedad={v}
              todasLasPizzas={pizzasRaw}
              puedeGestionar={esDueño}
              onEliminada={handleEliminada}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default MenuPage;
