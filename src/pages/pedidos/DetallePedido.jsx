// DetallePedido.jsx — CU-08 (detalle)
// Vista de solo lectura del pedido completo.
// Permite marcar como Facturado si el estado es "Listo".

import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getPedidoById, calcularTotal, marcarComoFacturado } from "../../services/pedidoService";
import { getFacturas } from "../../services/facturaService";
import Badge from "../../components/ui/Badge";
import Modal from "../../components/ui/Modal";
import "./Pedidos.css";

const DetallePedido = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [pedido,   setPedido]   = useState(null);
  const [error,    setError]    = useState("");
  const [modal,    setModal]    = useState(false);
  const [saving,   setSaving]   = useState(false);

  useEffect(() => {
    getPedidoById(id)
      .then(setPedido)
      .catch((e) => setError(e.message));
  }, [id]);

  const confirmarFacturar = async () => {
    setSaving(true);
    try {
      await marcarComoFacturado(pedido.id);
      setModal(false);

      // Buscar la factura recién creada y redirigir a VistaFactura
      const facturas = await getFacturas();
      const nueva = facturas.find((f) => f.pedido.id === pedido.id);

      if (nueva) {
        navigate(`/facturas/${nueva.id}`, { state: { nuevo: true } });
      } else {
        navigate("/facturas", { state: { nuevo: true } });
      }
    } catch (e) {
      setError(`Error: ${e.message}`);
      setModal(false);
    } finally {
      setSaving(false);
    }
  };

  if (error)   return <div className="page-container"><div className="alert-error">{error}</div></div>;
  if (!pedido) return <div className="page-container"><p className="empty-message">Cargando...</p></div>;

  const total = calcularTotal(pedido.lineas);

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Pedido #{pedido.nroPedido}</h1>
          <p style={{ color: "var(--color-text-secondary)", marginTop: 4 }}>
            {pedido.fecha} · Entrega: {pedido.horaEntrega} · Demora: {pedido.demoraEstimada}
          </p>
        </div>
        <div style={{ display: "flex", gap: "var(--space-sm)", alignItems: "center", flexWrap: "wrap" }}>
          <Badge text={pedido.estado} color={pedido.estado.toLowerCase()} />
          <button className="btn btn--secondary" onClick={() => navigate("/pedidos")}>
            Volver
          </button>
        </div>
      </div>

      <div className="card">
        <p className="detalle-campo">
          <span className="detalle-label">Cliente: </span>
          {pedido.cliente || <em style={{ color: "var(--color-text-muted)" }}>Consumidor final</em>}
        </p>

        <div className="detalle-tabla-wrapper">
          <table className="detalle-tabla">
            <thead>
              <tr>
                <th>Variedad</th>
                <th>Tipo</th>
                <th>Tamaño</th>
                <th>Cant.</th>
                <th>Precio unit.</th>
                <th>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {pedido.lineas.map((l, i) => (
                <tr key={i}>
                  <td>{l.variedad}</td>
                  <td style={{ textTransform: "capitalize" }}>{l.tipo}</td>
                  <td>{l.tamanio} porciones</td>
                  <td>{l.cantidad}</td>
                  <td>${l.precioUnitario.toLocaleString("es-AR")}</td>
                  <td>${(l.precioUnitario * l.cantidad).toLocaleString("es-AR")}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={5} style={{ textAlign: "right", fontWeight: 600 }}>Total</td>
                <td style={{ fontWeight: 700, color: "var(--color-primary)" }}>
                  ${total.toLocaleString("es-AR")}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        <div className="detalle-acciones">
          {pedido.estado === "Pendiente" && (
            <button
              className="btn btn--ghost"
              onClick={() => navigate(`/pedidos/editar/${pedido.id}`)}
            >
              Editar pedido
            </button>
          )}
          {pedido.estado === "Listo" && (
            <button
              className="btn btn--primary"
              onClick={() => setModal(true)}
              disabled={saving}
            >
              Generar factura
            </button>
          )}
        </div>
      </div>

      <Modal
        isOpen={modal}
        onClose={() => setModal(false)}
        onConfirm={confirmarFacturar}
        title="Confirmar facturación"
        body={`¿Confirmás que el pedido #${pedido.nroPedido} fue entregado y querés generar la factura?`}
        confirmLabel={saving ? "Facturando..." : "Sí, facturar"}
      />
    </div>
  );
};

export default DetallePedido;