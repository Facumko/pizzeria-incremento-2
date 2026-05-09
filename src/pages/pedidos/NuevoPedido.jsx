// NuevoPedido.jsx — CU-05
// Formulario de registro de pedido. Acceso: Empleado de Mostrador.

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { crearPedido, calcularTotal } from "../../services/pedidoService";
import { getPizzas } from "../../services/pizzaService";
import "./Pedidos.css";

const TAMANIOS = [8, 10, 12];

const lineaVacia = () => ({
  _key: Date.now() + Math.random(),
  variedad: "",
  tipo: "",
  tamanio: "",
  cantidad: 1,
  precioUnitario: 0,
});

const NuevoPedido = () => {
  const navigate = useNavigate();
  const [pizzas, setPizzas] = useState([]);
  const [cliente, setCliente] = useState("");
  const [horaEntrega, setHoraEntrega] = useState("");
  const [demoraEstimada, setDemoraEstimada] = useState("");
  const [lineas, setLineas] = useState([lineaVacia()]);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getPizzas().then(setPizzas);
  }, []);

  const pizzaSeleccionada = (nombre) => pizzas.find((p) => p.nombre === nombre);

  const actualizarLinea = (key, campo, valor) => {
    setLineas((prev) =>
      prev.map((l) => {
        if (l._key !== key) return l;
        const actualizada = { ...l, [campo]: valor };

        // Si cambia variedad, resetear tipo/tamaño/precio
        if (campo === "variedad") {
          actualizada.tipo = "";
          actualizada.tamanio = "";
          actualizada.precioUnitario = 0;
        }

        // Si cambia tipo y ya hay variedad, mantener tamaño si sigue válido
        if (campo === "tipo") {
          actualizada.precioUnitario = 0;
        }

        // Recalcular precio si hay variedad + tamaño
        if ((campo === "tamanio" || campo === "variedad") && actualizada.variedad && actualizada.tamanio) {
          const pizza = pizzaSeleccionada(actualizada.variedad);
          actualizada.precioUnitario = pizza?.precios?.[actualizada.tamanio] ?? 0;
        }

        return actualizada;
      })
    );
  };

  const agregarLinea = () => setLineas((prev) => [...prev, lineaVacia()]);

  const quitarLinea = (key) =>
    setLineas((prev) => prev.filter((l) => l._key !== key));

  const validar = () => {
    if (!horaEntrega) return "La hora de entrega es obligatoria.";
    if (!demoraEstimada.trim()) return "La demora estimada es obligatoria.";
    if (lineas.length === 0) return "Debe agregar al menos una pizza al pedido.";
    for (const l of lineas) {
      if (!l.variedad) return "Seleccioná la variedad en todas las líneas.";
      if (!l.tipo) return "Seleccioná el tipo de cocción en todas las líneas.";
      if (!l.tamanio) return "Seleccioná el tamaño en todas las líneas.";
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
        id: Date.now() + Math.random(),
        tamanio: Number(rest.tamanio),
        cantidad: Number(rest.cantidad),
      }));
      await crearPedido({ cliente, horaEntrega, demoraEstimada, lineas: lineasLimpias });
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

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Nuevo pedido</h1>
        <button className="btn btn--secondary" onClick={() => navigate("/pedidos")}>
          Cancelar
        </button>
      </div>

      {error && <div className="alert-error">{error}</div>}

      <div className="form-section card">
        <h2 className="form-section__title">Datos del cliente</h2>
        <div className="form-row">
          <label className="form-label">Nombre del cliente <span className="form-optional">(opcional)</span></label>
          <input
            className="form-input"
            type="text"
            value={cliente}
            onChange={(e) => setCliente(e.target.value)}
            placeholder="Ej: García"
          />
        </div>
        <div className="form-row-group">
          <div className="form-row">
            <label className="form-label">Hora de entrega *</label>
            <input
              className="form-input"
              type="time"
              value={horaEntrega}
              onChange={(e) => setHoraEntrega(e.target.value)}
            />
          </div>
          <div className="form-row">
            <label className="form-label">Demora estimada *</label>
            <input
              className="form-input"
              type="text"
              value={demoraEstimada}
              onChange={(e) => setDemoraEstimada(e.target.value)}
              placeholder="Ej: 30 min"
            />
          </div>
        </div>
      </div>

      <div className="form-section card" style={{ marginTop: "var(--space-lg)" }}>
        <div className="lineas-header">
          <h2 className="form-section__title">Pizzas</h2>
          <button className="btn btn--ghost btn--sm" onClick={agregarLinea}>
            + Agregar pizza
          </button>
        </div>

        {lineas.map((linea) => {
          const pizza = pizzaSeleccionada(linea.variedad);
          const tiposDisponibles = pizza?.tipos ?? [];
          const tamaniosDisponibles = pizza
            ? TAMANIOS.filter((t) => pizza.precios?.[t] !== undefined)
            : [];

          return (
            <div key={linea._key} className="linea-pedido">
              <div className="linea-pedido__campos">
                {/* Variedad */}
                <div className="form-row">
                  <label className="form-label">Variedad</label>
                  <select
                    className="form-input"
                    value={linea.variedad}
                    onChange={(e) => actualizarLinea(linea._key, "variedad", e.target.value)}
                  >
                    <option value="">Seleccionar...</option>
                    {pizzas.map((p) => (
                      <option key={p.id} value={p.nombre}>{p.nombre}</option>
                    ))}
                  </select>
                </div>

                {/* Tipo */}
                <div className="form-row">
                  <label className="form-label">Tipo</label>
                  <select
                    className="form-input"
                    value={linea.tipo}
                    onChange={(e) => actualizarLinea(linea._key, "tipo", e.target.value)}
                    disabled={!linea.variedad}
                  >
                    <option value="">Seleccionar...</option>
                    {tiposDisponibles.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>

                {/* Tamaño */}
                <div className="form-row">
                  <label className="form-label">Tamaño</label>
                  <select
                    className="form-input"
                    value={linea.tamanio}
                    onChange={(e) => actualizarLinea(linea._key, "tamanio", e.target.value)}
                    disabled={!linea.variedad}
                  >
                    <option value="">Seleccionar...</option>
                    {tamaniosDisponibles.map((t) => (
                      <option key={t} value={t}>{t} porciones</option>
                    ))}
                  </select>
                </div>

                {/* Cantidad */}
                <div className="form-row">
                  <label className="form-label">Cantidad</label>
                  <input
                    className="form-input"
                    type="number"
                    min="1"
                    value={linea.cantidad}
                    onChange={(e) => actualizarLinea(linea._key, "cantidad", e.target.value)}
                  />
                </div>

                {/* Precio */}
                <div className="form-row">
                  <label className="form-label">Precio unit.</label>
                  <input
                    className="form-input"
                    type="text"
                    readOnly
                    value={linea.precioUnitario ? `$${linea.precioUnitario.toLocaleString("es-AR")}` : "—"}
                  />
                </div>
              </div>

              {/* Subtotal + quitar */}
              <div className="linea-pedido__actions">
                <span className="linea-subtotal">
                  Subtotal: ${(linea.precioUnitario * (Number(linea.cantidad) || 0)).toLocaleString("es-AR")}
                </span>
                {lineas.length > 1 && (
                  <button
                    className="btn btn--danger btn--sm"
                    onClick={() => quitarLinea(linea._key)}
                  >
                    Quitar
                  </button>
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
          {saving ? "Guardando..." : "Confirmar pedido"}
        </button>
      </div>
    </div>
  );
};

export default NuevoPedido;
