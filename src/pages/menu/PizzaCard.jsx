import { useState } from "react";
import Modal from "../../components/ui/Modal";
import "./Menu.css";

const TAMANIOS_LABEL = { 8: "8 porciones", 10: "10 porciones", 12: "12 porciones" };

const PizzaCard = ({ pizza, onEditar, onEliminar, puedeGestionar }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [errorEliminar, setErrorEliminar] = useState("");

  const abrirModalEliminar = () => {
    setErrorEliminar("");
    setModalOpen(true);
  };

  const confirmarEliminar = async () => {
    setModalOpen(false);
    onEliminar(pizza);
  };

  // Construye filas: tipo → tamaños con precio
  const filas = [];
  for (const tipo of pizza.tipos) {
    const preciosPorTam = pizza.precios[tipo] ?? {};
    for (const [tam, precio] of Object.entries(preciosPorTam)) {
      filas.push({ tipo, tamanio: Number(tam), precio });
    }
  }
  filas.sort((a, b) => a.tamanio - b.tamanio);

  return (
    <>
      <div className="pizza-card card">
        <div className="pizza-card__header">
          <h3 className="pizza-card__nombre">{pizza.nombre}</h3>
          {puedeGestionar && (
            <div className="pizza-card__acciones">
              <button
                className="btn btn--ghost btn--sm"
                onClick={() => onEditar(pizza)}
                title="Editar variedad"
              >
                Editar
              </button>
              <button
                className="btn btn--danger btn--sm"
                onClick={abrirModalEliminar}
                title="Eliminar variedad"
              >
                ✕
              </button>
            </div>
          )}
        </div>

        <p className="pizza-card__ingredientes">{pizza.ingredientes}</p>

        <div className="pizza-card__tipos">
          {pizza.tipos.map((t) => (
            <span key={t} className="pizza-card__tipo-tag">{t}</span>
          ))}
        </div>

        <div className="pizza-card__precios">
          {filas.map((f, i) => (
            <div key={i} className="pizza-card__precio-row">
              <span className="pizza-card__precio-label">
                {f.tipo} — {TAMANIOS_LABEL[f.tamanio] ?? `${f.tamanio} porciones`}
              </span>
              <span className="pizza-card__precio-valor">
                ${f.precio.toLocaleString("es-AR")}
              </span>
            </div>
          ))}
        </div>
      </div>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onConfirm={confirmarEliminar}
        title="Eliminar variedad"
        danger
        confirmLabel="Eliminar"
        body={
          <>
            <p>
              ¿Estás seguro de que querés eliminar <strong>{pizza.nombre}</strong>?
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