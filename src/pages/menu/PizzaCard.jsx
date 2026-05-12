// Muestra los datos de una variedad. Solo el Dueño ve editar/eliminar.

import { useState } from "react";
import Modal from "../../components/ui/Modal";
import { getPedidos } from "../../services/pedidoService";
import "./Menu.css";

const TAMANIOS_LABEL = { 8: "8 porciones", 10: "10 porciones", 12: "12 porciones" };

const PizzaCard = ({ pizza, onEditar, onEliminar, puedeGestionar }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [errorEliminar, setErrorEliminar] = useState("");

  const abrirModalEliminar = () => {
    setErrorEliminar("");
    setModalOpen(true);
  };

  // Verifica si la pizza tiene pedidos activos antes de eliminar — CU-03
  const confirmarEliminar = async () => {
    try {
      const pedidosActivos = await getPedidos("Pendiente");
      const enUso = pedidosActivos.some((p) =>
        p.lineas.some((l) => l.variedad === pizza.nombre)
      );
      if (enUso) {
        setErrorEliminar(
          "No es posible eliminar esta variedad porque está asociada a pedidos activos."
        );
        return;
      }
      setModalOpen(false);
      onEliminar(pizza.id);
    } catch {
      setErrorEliminar("Error al verificar pedidos activos.");
    }
  };

  const tamaniosDisponibles = Object.keys(pizza.precios).map(Number).sort((a, b) => a - b);

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
          {tamaniosDisponibles.map((tam) => (
            <div key={tam} className="pizza-card__precio-row">
              <span className="pizza-card__precio-label">{TAMANIOS_LABEL[tam]}</span>
              <span className="pizza-card__precio-valor">
                ${pizza.precios[tam].toLocaleString("es-AR")}
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