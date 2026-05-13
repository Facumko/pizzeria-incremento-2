// VistaFactura.jsx — CU-12
// Muestra la factura generada con toda la info y permite imprimir.
// Carga print.css para estilos de impresión.

import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getFacturaById } from "../../services/facturaService";
import "./Facturacion.css";
import "../../styles/print.css";

const formatFecha = (isoString) => {
  if (!isoString) return "—";
  try {
    return new Date(isoString).toLocaleString("es-AR", {
      day:    "2-digit",
      month:  "2-digit",
      year:   "numeric",
      hour:   "2-digit",
      minute: "2-digit",
    });
  } catch {
    return isoString;
  }
};

const VistaFactura = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [factura, setFactura] = useState(null);
  const [error,   setError]   = useState("");

  useEffect(() => {
    getFacturaById(id)
      .then(setFactura)
      .catch((e) => setError(e.message));
  }, [id]);

  if (error) return (
    <div className="page-container">
      <div className="alert-error">{error}</div>
      <button className="btn btn--secondary" onClick={() => navigate("/facturas")}>Volver</button>
    </div>
  );

  if (!factura) return (
    <div className="page-container">
      <p className="empty-message">Cargando...</p>
    </div>
  );

  const { pedido } = factura;

  return (
    <div className="page-container">
      {/* Acciones (se ocultan al imprimir) */}
      <div className="page-header">
        <h1 className="page-title">Factura #{factura.nroFactura}</h1>
        <div style={{ display: "flex", gap: "var(--space-sm)" }}>
          <button className="btn btn--secondary" onClick={() => navigate("/facturas")}>
            ← Historial
          </button>
          <button className="btn btn--primary" onClick={() => window.print()}>
            🖨 Imprimir
          </button>
        </div>
      </div>

      {/* Cuerpo de la factura — esto es lo que se imprime */}
      <div className="vista-factura card">

        {/* Encabezado */}
        <div className="factura-header">
          <div className="factura-header__marca">
            <img
              src="/logo-pizza.png"
              alt="Logo Pizzería"
              className="factura-header__logo"
            />
            <div>
              <div className="factura-header__nombre">Pizzería</div>
              <div className="factura-header__subtitulo">Sistema de Gestión</div>
            </div>
          </div>

          <div className="factura-header__datos">
            <div className="factura-nro-grande">Factura #{factura.nroFactura}</div>
            <div className="factura-fecha">Emitida: {formatFecha(factura.fechaEmision)}</div>
          </div>
        </div>

        {/* Datos del cliente y pedido */}
        <div className="factura-cliente-box">
          <div className="factura-cliente-box__item">
            <span className="factura-cliente-box__label">Cliente</span>
            <span className="factura-cliente-box__valor">
              {pedido.cliente || "Consumidor Final"}
            </span>
          </div>
          <div className="factura-cliente-box__item">
            <span className="factura-cliente-box__label">Pedido #</span>
            <span className="factura-cliente-box__valor">{pedido.nroPedido}</span>
          </div>
          <div className="factura-cliente-box__item">
            <span className="factura-cliente-box__label">Hora de entrega</span>
            <span className="factura-cliente-box__valor">{pedido.horaEntrega || "—"}</span>
          </div>
          <div className="factura-cliente-box__item">
            <span className="factura-cliente-box__label">Demora estimada</span>
            <span className="factura-cliente-box__valor">{pedido.demoraEstimada}</span>
          </div>
        </div>

        {/* Tabla de items */}
        <div className="factura-tabla-wrapper">
          <table className="factura-tabla">
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
                  <td style={{ textAlign: "right" }}>
                    ${l.precioUnitario.toLocaleString("es-AR")}
                  </td>
                  <td style={{ textAlign: "right" }}>
                    ${(l.precioUnitario * l.cantidad).toLocaleString("es-AR")}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={5} style={{ textAlign: "right", fontWeight: 600, color: "var(--color-text-secondary)" }}>
                  Total
                </td>
                <td className="factura-total-row">
                  ${factura.total.toLocaleString("es-AR")}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Acciones dentro del card (se ocultan al imprimir) */}
        <div className="factura-acciones">
          <button className="btn btn--ghost" onClick={() => navigate("/facturas")}>
            ← Volver al historial
          </button>
          <button className="btn btn--primary" onClick={() => window.print()}>
            🖨 Imprimir factura
          </button>
        </div>
      </div>
    </div>
  );
};

export default VistaFactura;