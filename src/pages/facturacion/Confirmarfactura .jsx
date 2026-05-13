// ConfirmarFactura.jsx — CU-10
// Muestra el detalle completo del pedido y permite confirmar la generación
// de la factura. Solo disponible para pedidos en estado "Listo".

import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getPedidoById } from "../../services/pedidoService";
import { generarFactura, calcularTotal } from "../../services/facturaService";
import { getFacturas } from "../../services/facturaService";
import Modal from "../../components/ui/Modal";
import "./Facturacion.css";

const ConfirmarFactura = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [pedido,  setPedido]  = useState(null);
  const [error,   setError]   = useState("");
  const [modal,   setModal]   = useState(false);
  const [saving,  setSaving]  = useState(false);

  useEffect(() => {
    getPedidoById(id)
      .then((p) => {
        if (p.estado !== "Listo") {
          setError(`Este pedido no puede facturarse (estado actual: ${p.estado}).`);
          return;
        }
        // Verificar que no tenga ya una factura
        getFacturas()
          .then((facturas) => {
            const yaFacturado = facturas.some((f) => f.pedido.id === p.id);
            if (yaFacturado) {
              setError("Este pedido ya fue facturado.");
              return;
            }
            setPedido(p);
          })
          .catch(() => setPedido(p)); // si falla la verificación, igual mostramos
      })
      .catch((e) => setError(e.message));
  }, [id]);

  const confirmar = async () => {
    setSaving(true);
    try {
      await generarFactura(pedido.id);
      setModal(false);
      // Redirigir al historial para ver la factura generada
      navigate("/facturas", { state: { nuevo: true } });
    } catch (e) {
      setError(e.message);
      setModal(false);
    } finally {
      setSaving(false);
    }
  };

  if (error) return (
    <div className="page-container">
      <div className="alert-error">{error}</div>
      <button className="btn btn--secondary" onClick={() => navigate("/facturacion")}>
        Volver
      </button>
    </div>
  );

  if (!pedido) return (
    <div className="page-container">
      <p className="empty-message">Cargando...</p>
    </div>
  );

  const total = calcularTotal(pedido.lineas);

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Confirmar Factura</h1>
          <p style={{ color: "var(--color-text-secondary)", marginTop: 4 }}>
            Pedido #{pedido.nroPedido}
          </p>
        </div>
        <button className="btn btn--secondary" onClick={() => navigate("/facturacion")}>
          Cancelar
        </button>
      </div>

      <div className="card confirmar-factura__resumen">
        <p className="confirmar-factura__titulo">Detalle del pedido</p>

        {/* Info del cliente */}
        <div style={{ marginBottom: "var(--space-md)", display: "flex", gap: "var(--space-xl)", flexWrap: "wrap" }}>
          <div>
            <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: "var(--color-text-muted)" }}>
              Cliente
            </span>
            <p style={{ fontWeight: 600, color: "var(--color-text)" }}>
              {pedido.cliente || "Consumidor Final"}
            </p>
          </div>
          <div>
            <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: "var(--color-text-muted)" }}>
              Hora de entrega
            </span>
            <p style={{ fontWeight: 600, color: "var(--color-text)" }}>{pedido.horaEntrega}</p>
          </div>
          <div>
            <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: "var(--color-text-muted)" }}>
              Demora estimada
            </span>
            <p style={{ fontWeight: 600, color: "var(--color-text)" }}>{pedido.demoraEstimada}</p>
          </div>
        </div>

        {/* Líneas */}
        <div className="confirmar-factura__lineas">
          {pedido.lineas.map((l, i) => (
            <div key={i} className="confirmar-factura__linea">
              <span>
                {l.cantidad}× {l.variedad}{" "}
                <span style={{ color: "var(--color-text-muted)", textTransform: "capitalize" }}>
                  ({l.tipo} — {l.tamanio} porc.)
                </span>
              </span>
              <span style={{ fontWeight: 700 }}>
                ${(l.precioUnitario * l.cantidad).toLocaleString("es-AR")}
              </span>
            </div>
          ))}
        </div>

        <div className="confirmar-factura__total">
          <span>Total</span>
          <span className="confirmar-factura__total-valor">
            ${total.toLocaleString("es-AR")}
          </span>
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end", gap: "var(--space-sm)", marginTop: "var(--space-lg)" }}>
        <button className="btn btn--secondary" onClick={() => navigate("/facturacion")}>
          Cancelar
        </button>
        <button
          className="btn btn--primary"
          onClick={() => setModal(true)}
          disabled={saving}
        >
          Generar factura
        </button>
      </div>

      <Modal
        isOpen={modal}
        onClose={() => setModal(false)}
        onConfirm={confirmar}
        title="Confirmar facturación"
        body={
          <>
            <p>
              ¿Confirmás que el pedido <strong>#{pedido.nroPedido}</strong> de{" "}
              <strong>{pedido.cliente || "Consumidor Final"}</strong> fue entregado
              y querés generar la factura por{" "}
              <strong>${total.toLocaleString("es-AR")}</strong>?
            </p>
            <p style={{ marginTop: 8, fontSize: 13, color: "var(--color-text-muted)" }}>
              Esta acción no puede deshacerse.
            </p>
          </>
        }
        confirmLabel={saving ? "Generando..." : "Sí, generar factura"}
      />
    </div>
  );
};

export default ConfirmarFactura;