// EditarPedido.jsx — CU-06
// Mismo formulario que NuevoPedido pero carga datos existentes.
// Solo disponible si el pedido está en estado "Pendiente".

import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getPedidoById, modificarPedido, calcularTotal } from "../../services/pedidoService";
import { getPizzas } from "../../services/pizzaService";
import "./Pedidos.css";

const TAMANIOS = [8, 10, 12];

const EditarPedido = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [pizzas, setPizzas] = useState([]);
  const [cliente, setCliente] = useState("");
  const [horaEntrega, setHoraEntrega] = useState("");
  const [demoraEstimada, setDemoraEstimada] = useState("");
  const [lineas, setLineas] = useState([]);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getPedidoById(id), getPizzas()])
      .then(([pedido, menuPizzas]) => {
        if (pedido.estado !== "Pendiente") {
          setError("Este pedido no se puede modificar porque ya no está en estado Pendiente.");
          setLoading(false);
          return;
        }
        setCliente(pedido.cliente || "");
        setHoraEntrega(pedido.horaEntrega);
        setDemoraEstimada(pedido.demoraEstimada);
        setLineas(pedido.lineas.map((l) => ({ ...l, _key: l.id })));
        setPizzas(menuPizzas);
        setLoading(false);
      })
      .catch((e) => { setError(e.message); setLoading(false); });
  }, [id]);

  const pizzaSeleccionada = (nombre) => pizzas.find((p) => p.nombre === nombre);

  const actualizarLinea = (key, campo, valor) => {
    setLineas((prev) =>
      prev.map((l) => {
        if (l._key !== key) return l;
        const actualizada = { ...l, [campo]: valor };
        if (campo === "variedad") {
          actualizada.tipo = "";
          actualizada.tamanio = "";
          actualizada.precioUnitario = 0;
        }
        if ((campo === "tamanio" || campo === "variedad") && actualizada.variedad && actualizada.tamanio) {
          const pizza = pizzaSeleccionada(actualizada.variedad);
          actualizada.precioUnitario = pizza?.precios?.[actualizada.tamanio] ?? 0;
        }
        return actualizada;
      })
    );
  };

  const agregarLinea = () =>
    setLineas((prev) => [...prev, { _key: Date.now(), variedad: "", tipo: "", tamanio: "", cantidad: 1, precioUnitario: 0 }]);

  const quitarLinea = (key) =>
    setLineas((prev) => prev.filter((l) => l._key !== key));

  const validar = () => {
    if (!horaEntrega) return "La hora de entrega es obligatoria.";
    if (!demoraEstimada.trim()) return "La demora estimada es obligatoria.";
    if (lineas.length === 0) return "Debe haber al menos una pizza en el pedido.";
    for (const l of lineas) {
      if (!l.variedad || !l.tipo || !l.tamanio) return "Completá todos los campos de cada línea.";
      if (!l.cantidad || l.cantidad < 1) return "La cantidad debe ser al menos 1.";
    }
    return "";
  };

  const handleSubmit = async () => {
    const err = validar();
    if (err) { setError(err); return; }
    setError("");
    setSaving(true);
    try {
      const lineasLimpias = lineas.map(({ _key, ...rest }) => ({
        ...rest,
        tamanio: Number(rest.tamanio),
        cantidad: Number(rest.cantidad),
      }));
      await modificarPedido(id, { cliente, horaEntrega, demoraEstimada, lineas: lineasLimpias });
      navigate("/pedidos");
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const total = calcularTotal(
    lineas.map((l) => ({ precioUnitario: l.precioUnitario, cantidad: Number(l.cantidad) || 0 }))
  );

  if (loading) return <div className="page-container"><p className="empty-message">Cargando...</p></div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Modificar pedido</h1>
        <button className="btn btn--secondary" onClick={() => navigate("/pedidos")}>Cancelar</button>
      </div>

      {error && <div className="alert-error">{error}</div>}

      {!error.includes("no se puede modificar") && (
        <>
          <div className="form-section card">
            <h2 className="form-section__title">Datos del cliente</h2>
            <div className="form-row">
              <label className="form-label">Nombre del cliente <span className="form-optional">(opcional)</span></label>
              <input className="form-input" type="text" value={cliente} onChange={(e) => setCliente(e.target.value)} />
            </div>
            <div className="form-row-group">
              <div className="form-row">
                <label className="form-label">Hora de entrega *</label>
                <input className="form-input" type="time" value={horaEntrega} onChange={(e) => setHoraEntrega(e.target.value)} />
              </div>
              <div className="form-row">
                <label className="form-label">Demora estimada *</label>
                <input className="form-input" type="text" value={demoraEstimada} onChange={(e) => setDemoraEstimada(e.target.value)} />
              </div>
            </div>
          </div>

          <div className="form-section card" style={{ marginTop: "var(--space-lg)" }}>
            <div className="lineas-header">
              <h2 className="form-section__title">Pizzas</h2>
              <button className="btn btn--ghost btn--sm" onClick={agregarLinea}>+ Agregar pizza</button>
            </div>

            {lineas.map((linea) => {
              const pizza = pizzaSeleccionada(linea.variedad);
              const tiposDisponibles = pizza?.tipos ?? [];
              const tamaniosDisponibles = pizza ? TAMANIOS.filter((t) => pizza.precios?.[t] !== undefined) : [];

              return (
                <div key={linea._key} className="linea-pedido">
                  <div className="linea-pedido__campos">
                    <div className="form-row">
                      <label className="form-label">Variedad</label>
                      <select className="form-input" value={linea.variedad} onChange={(e) => actualizarLinea(linea._key, "variedad", e.target.value)}>
                        <option value="">Seleccionar...</option>
                        {pizzas.map((p) => <option key={p.id} value={p.nombre}>{p.nombre}</option>)}
                      </select>
                    </div>
                    <div className="form-row">
                      <label className="form-label">Tipo</label>
                      <select className="form-input" value={linea.tipo} onChange={(e) => actualizarLinea(linea._key, "tipo", e.target.value)} disabled={!linea.variedad}>
                        <option value="">Seleccionar...</option>
                        {tiposDisponibles.map((t) => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                    <div className="form-row">
                      <label className="form-label">Tamaño</label>
                      <select className="form-input" value={linea.tamanio} onChange={(e) => actualizarLinea(linea._key, "tamanio", e.target.value)} disabled={!linea.variedad}>
                        <option value="">Seleccionar...</option>
                        {tamaniosDisponibles.map((t) => <option key={t} value={t}>{t} porciones</option>)}
                      </select>
                    </div>
                    <div className="form-row">
                      <label className="form-label">Cantidad</label>
                      <input className="form-input" type="number" min="1" value={linea.cantidad} onChange={(e) => actualizarLinea(linea._key, "cantidad", e.target.value)} />
                    </div>
                    <div className="form-row">
                      <label className="form-label">Precio unit.</label>
                      <input className="form-input" type="text" readOnly value={linea.precioUnitario ? `$${linea.precioUnitario.toLocaleString("es-AR")}` : "—"} />
                    </div>
                  </div>
                  <div className="linea-pedido__actions">
                    <span className="linea-subtotal">Subtotal: ${(linea.precioUnitario * (Number(linea.cantidad) || 0)).toLocaleString("es-AR")}</span>
                    {lineas.length > 1 && (
                      <button className="btn btn--danger btn--sm" onClick={() => quitarLinea(linea._key)}>Quitar</button>
                    )}
                  </div>
                </div>
              );
            })}

            <div className="pedido-total-bar">
              <span>Total del pedido</span>
              <strong>${total.toLocaleString("es-AR")}</strong>
            </div>
          </div>

          <div className="form-actions">
            <button className="btn btn--primary" onClick={handleSubmit} disabled={saving}>
              {saving ? "Guardando..." : "Guardar cambios"}
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default EditarPedido;
