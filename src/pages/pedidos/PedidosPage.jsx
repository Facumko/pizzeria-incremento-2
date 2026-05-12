// PedidosPage.jsx — CU-08
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getPedidos, calcularTotal } from "../../services/pedidoService";
import Badge from "../../components/ui/Badge";
import "./Pedidos.css";

const ESTADOS = ["Todos", "Pendiente", "Listo", "Facturado"];

const PedidosPage = () => {
  const [pedidos, setPedidos] = useState([]);
  const [filtro, setFiltro] = useState("Todos");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const cargar = async () => {
    setLoading(true);
    try {
      const data = await getPedidos(filtro === "Todos" ? "" : filtro);
      setPedidos(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargar();
  }, [filtro]);

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Pedidos</h1>
        <button className="btn btn--primary" onClick={() => navigate("/pedidos/nuevo")}>
          + Nuevo pedido
        </button>
      </div>

      {/* Filtros */}
      <div className="filtros-bar">
        {ESTADOS.map((e) => (
          <button
            key={e}
            className={`filtro-btn ${filtro === e ? "filtro-btn--active" : ""}`}
            onClick={() => setFiltro(e)}
          >
            {e}
          </button>
        ))}
      </div>

      {/* Lista */}
      {loading ? (
        <p className="empty-message">Cargando...</p>
      ) : pedidos.length === 0 ? (
        <p className="empty-message">No se encontraron pedidos para los filtros aplicados.</p>
      ) : (
        <div className="pedidos-list">
          {pedidos.map((p) => (
            <div
              key={p.id}
              className="pedido-row card"
              onClick={() => navigate(`/pedidos/${p.id}`)}
            >
              <div className="pedido-row__left">
                <span className="pedido-nro">#{p.nroPedido}</span>
                <div>
                  <p className="pedido-cliente">{p.cliente || <em>Mario Quinteros</em>}</p>
                  <p className="pedido-meta">
                    {p.fecha} · Entrega: {p.horaEntrega} · Demora: {p.demoraEstimada}
                  </p>
                  <p className="pedido-meta">
                    {p.lineas.length} ítem{p.lineas.length !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>

              <div className="pedido-row__right">
                <Badge text={p.estado} color={p.estado.toLowerCase()} />
                
                <span className="pedido-total">
                  ${calcularTotal(p.lineas).toLocaleString("es-AR")}
                </span>

                {p.estado === "Pendiente" ? (
                  <button
                    className="btn btn--ghost btn--sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/pedidos/editar/${p.id}`);
                    }}
                  >
                    Editar</button>
                ) : (
                  <div className="pedido-row__spacer" />
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PedidosPage;