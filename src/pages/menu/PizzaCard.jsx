// PizzaCard.jsx — muestra una variedad agrupada con tabla de precios 3x3

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Modal from "../../components/ui/Modal";
import { eliminarVariedad } from "../../services/pizzaService";
import "./Menu.css";

const TIPOS    = ["PIEDRA", "PARRILLA", "MOLDE"];
const TAMANIOS = [8, 10, 12];
const TIPO_LABEL = { PIEDRA: "Piedra", PARRILLA: "Parrilla", MOLDE: "Molde" };
const TAM_LABEL  = { 8: "8 p.", 10: "10 p.", 12: "12 p." };

// variedad: { nombre, descripcion, precios: { PIEDRA: { 8: x, ... }, ... }, ids: {...} }
const PizzaCard = ({ variedad, todasLasPizzas, puedeGestionar, onEliminada }) => {
  const navigate = useNavigate();
  const [modalOpen,     setModalOpen]     = useState(false);
  const [errorEliminar, setErrorEliminar] = useState("");
  const [eliminando,    setEliminando]    = useState(false);

  const confirmarEliminar = async () => {
    setEliminando(true);
    try {
      await eliminarVariedad(variedad.nombre, todasLasPizzas);
      setModalOpen(false);
      onEliminada(variedad.nombre);
    } catch (e) {
      setErrorEliminar(e.message);
    } finally {
      setEliminando(false);
    }
  };

  return (
    <>
      <div className="pizza-card card">
        <div className="pizza-card__header">
          <h3 className="pizza-card__nombre">{variedad.nombre}</h3>
          {puedeGestionar && (
            <div className="pizza-card__acciones">
              <button
                className="btn btn--ghost btn--sm"
                onClick={() => navigate(`/menu/editar/${encodeURIComponent(variedad.nombre)}`)}
              >
                Editar
              </button>
              <button
                className="btn btn--danger btn--sm"
                onClick={() => { setErrorEliminar(""); setModalOpen(true); }}
              >
                ✕
              </button>
            </div>
          )}
        </div>

        {variedad.descripcion && (
          <p className="pizza-card__ingredientes">{variedad.descripcion}</p>
        )}

        {/* Tabla de precios 3×3 */}
        <div className="pizza-card__precios-tabla-wrapper">
          <table className="pizza-card__precios-tabla">
            <thead>
              <tr>
                <th></th>
                {TAMANIOS.map((t) => <th key={t}>{TAM_LABEL[t]}</th>)}
              </tr>
            </thead>
            <tbody>
              {TIPOS.map((tipo) => (
                <tr key={tipo}>
                  <td className="pizza-card__precios-tipo">{TIPO_LABEL[tipo]}</td>
                  {TAMANIOS.map((tam) => {
                    const precio = variedad.precios?.[tipo]?.[tam];
                    return (
                      <td key={tam} className="pizza-card__precios-valor">
                        {precio != null
                          ? `$${Number(precio).toLocaleString("es-AR")}`
                          : <span style={{ color: "var(--color-text-muted)" }}>—</span>}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onConfirm={confirmarEliminar}
        title="Eliminar variedad"
        danger
        confirmLabel={eliminando ? "Eliminando..." : "Eliminar"}
        body={
          <>
            <p>
              ¿Estás seguro de que querés eliminar <strong>{variedad.nombre}</strong> con todas sus combinaciones?
              Esta acción no puede deshacerse.
            </p>
            {errorEliminar && (
              <p style={{ color: "var(--color-danger)", marginTop: 12, fontSize: 13 }}>
                {errorEliminar}
              </p>
            )}
          </>
        }
      />
    </>
  );
};

export default PizzaCard;
