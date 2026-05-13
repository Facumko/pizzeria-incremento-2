// HistorialFacturas.jsx — CU-12
// Listado de todas las facturas emitidas. Acceso: Mostrador.

import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { getFacturas } from "../../services/facturaService";
import "./Facturacion.css";

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

const HistorialFacturas = () => {
  const navigate  = useNavigate();
  const location  = useLocation();

  const [facturas, setFacturas] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState("");
  const [feedback, setFeedback] = useState(
    location.state?.nuevo ? "Factura generada correctamente." : ""
  );

  useEffect(() => {
    if (feedback) {
      const t = setTimeout(() => setFeedback(""), 3500);
      return () => clearTimeout(t);
    }
  }, [feedback]);

  useEffect(() => {
    setLoading(true);
    getFacturas()
      .then((data) => {
        // Más reciente primero
        setFacturas(data.sort((a, b) => b.id - a.id));
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Historial de Facturas</h1>
        <button
          className="btn btn--primary"
          onClick={() => navigate("/facturacion")}
        >
          + Nueva factura
        </button>
      </div>

      {feedback && (
        <div
          className="alert-error"
          style={{ background: "#eafaf1", borderColor: "#82e0aa", color: "#1e8449", marginBottom: "var(--space-md)" }}
        >
          {feedback}
        </div>
      )}

      {error && <div className="alert-error">{error}</div>}

      {loading ? (
        <p className="empty-message">Cargando...</p>
      ) : facturas.length === 0 ? (
        <p className="empty-message">No hay facturas emitidas todavía.</p>
      ) : (
        <>
          <p style={{ color: "var(--color-text-secondary)", fontSize: "var(--font-size-sm)", marginBottom: "var(--space-lg)" }}>
            {facturas.length} factura{facturas.length !== 1 ? "s" : ""} emitida{facturas.length !== 1 ? "s" : ""}
          </p>

          <div className="historial-list">
            {facturas.map((f) => (
              <div
                key={f.id}
                className="factura-card card"
                onClick={() => navigate(`/facturas/${f.id}`)}
              >
                <div className="factura-card__left">
                  <span className="factura-nro">#{f.nroFactura}</span>
                  <div>
                    <p className="factura-cliente">
                      {f.pedido.cliente || <em style={{ color: "var(--color-text-muted)" }}>Consumidor Final</em>}
                    </p>
                    <p className="factura-meta">
                      Emitida: {formatFecha(f.fechaEmision)} · Pedido #{f.pedido.nroPedido}
                    </p>
                  </div>
                </div>
                <span className="factura-total">
                  ${f.total.toLocaleString("es-AR")}
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default HistorialFacturas;