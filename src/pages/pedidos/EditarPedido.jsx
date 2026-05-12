// EditarPedido.jsx — CU-06
// Mismo formulario que NuevoPedido pero carga datos existentes.
// Solo disponible si el pedido está en estado "Pendiente".

import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getPedidoById, modificarPedido, calcularTotal } from "../../services/pedidoService";
import { getPizzas } from "../../services/pizzaService";
import "./Pedidos.css";

const TAMANIOS        = [8, 10, 12];
const MAX_LINEAS      = 50;
const MAX_CANTIDAD    = 99;
const MAX_CLIENTE     = 50;
const MAX_DEMORA_MIN  = 59;
const MAX_DEMORA_HS   = 23;

// Parsea "30 min" o "2 hs" → { num, unidad }
const parseDemora = (str = "") => {
  const partes = str.trim().split(" ");
  const num    = partes[0] ?? "";
  const unidad = partes[1] === "hs" ? "hs" : "min";
  return { num, unidad };
};

const EditarPedido = () => {
  const { id }    = useParams();
  const navigate  = useNavigate();

  const [pizzas,       setPizzas]       = useState([]);
  const [cliente,      setCliente]      = useState("");
  const [horaEntrega,  setHoraEntrega]  = useState("");
  const [demoraNum,    setDemoraNum]    = useState("");
  const [demoraUnidad, setDemoraUnidad] = useState("min");
  const [lineas,       setLineas]       = useState([]);
  const [error,        setError]        = useState("");
  const [saving,       setSaving]       = useState(false);
  const [loading,      setLoading]      = useState(true);
  const [errLineas,    setErrLineas]    = useState({});
  const [errDemora,    setErrDemora]    = useState("");
  const [errHora,      setErrHora]      = useState("");

  useEffect(() => {
    Promise.all([getPedidoById(id), getPizzas()])
      .then(([pedido, menuPizzas]) => {
        if (pedido.estado !== "Pendiente") {
          setError("Este pedido no se puede modificar porque ya no está en estado Pendiente.");
          setLoading(false);
          return;
        }
        const { num, unidad } = parseDemora(pedido.demoraEstimada);
        setCliente(pedido.cliente || "");
        setHoraEntrega(pedido.horaEntrega);
        setDemoraNum(num);
        setDemoraUnidad(unidad);
        setLineas(pedido.lineas.map((l) => ({ ...l, _key: l.id })));
        setPizzas(menuPizzas);
        setLoading(false);
      })
      .catch((e) => { setError(e.message); setLoading(false); });
  }, [id]);

  const pizzaSeleccionada = (nombre) => pizzas.find((p) => p.nombre === nombre);

  const maxDemora = demoraUnidad === "min" ? MAX_DEMORA_MIN : MAX_DEMORA_HS;

  const handleDemoraNum = (val) => {
    const limpio = val.replace(/\D/g, "");
    if (limpio === "") { setDemoraNum(""); setErrDemora(""); return; }
    const n = Math.min(Number(limpio), maxDemora);
    setDemoraNum(String(n));
    setErrDemora(n < 1 ? "Ingresá un valor válido." : "");
  };

  const handleDemoraUnidad = (val) => {
    setDemoraUnidad(val);
    if (demoraNum !== "") {
      const max = val === "min" ? MAX_DEMORA_MIN : MAX_DEMORA_HS;
      setDemoraNum(String(Math.min(Number(demoraNum), max)));
    }
    setErrDemora("");
  };

  const handleHora = (val) => {
    setHoraEntrega(val);
    setErrHora(val ? "" : "La hora de entrega es obligatoria.");
  };

  const actualizarLinea = (key, campo, valor) => {
    setLineas((prev) =>
      prev.map((l) => {
        if (l._key !== key) return l;
        const act = { ...l, [campo]: valor };
        if (campo === "variedad") { act.tipo = ""; act.tamanio = ""; act.precioUnitario = 0; }
        if (campo === "tipo") act.precioUnitario = 0;
        if ((campo === "tamanio" || campo === "variedad") && act.variedad && act.tamanio) {
          const pz = pizzaSeleccionada(act.variedad);
          act.precioUnitario = pz?.precios?.[act.tamanio] ?? 0;
        }
        if (campo === "cantidad") {
          act.cantidad = Math.min(Math.max(1, Number(valor) || 1), MAX_CANTIDAD);
        }
        return act;
      })
    );
    setErrLineas((prev) => ({ ...prev, [key]: "" }));
  };

  const agregarLinea = () => {
    if (lineas.length >= MAX_LINEAS) return;
    setLineas((prev) => [...prev, { _key: Date.now(), variedad: "", tipo: "", tamanio: "", cantidad: 1, precioUnitario: 0 }]);
  };

  const quitarLinea = (key) => {
    setLineas((prev) => prev.filter((l) => l._key !== key));
    setErrLineas((prev) => { const c = { ...prev }; delete c[key]; return c; });
  };

  const validar = () => {
    let ok = true;
    const nuevosErr = {};

    if (!horaEntrega) { setErrHora("La hora de entrega es obligatoria."); ok = false; }
    if (!demoraNum || Number(demoraNum) < 1) { setErrDemora("La demora estimada es obligatoria."); ok = false; }
    if (lineas.length === 0) { setError("Debe haber al menos una pizza en el pedido."); return false; }

    for (const l of lineas) {
      const msgs = [];
      if (!l.variedad) msgs.push("variedad");
      if (!l.tipo)     msgs.push("tipo");
      if (!l.tamanio)  msgs.push("tamaño");
      if (!l.cantidad || l.cantidad < 1) msgs.push("cantidad");
      if (msgs.length) { nuevosErr[l._key] = `Completá: ${msgs.join(", ")}.`; ok = false; }
    }

    setErrLineas(nuevosErr);
    if (!ok) setError("Revisá los campos marcados en rojo.");
    return ok;
  };

  const handleSubmit = async () => {
    setError("");
    if (!validar()) return;
    setSaving(true);
    try {
      const lineasLimpias = lineas.map(({ _key, ...rest }) => ({
        ...rest,
        tamanio:  Number(rest.tamanio),
        cantidad: Number(rest.cantidad),
      }));
      await modificarPedido(id, {
        cliente,
        horaEntrega,
        demoraEstimada: `${demoraNum} ${demoraUnidad}`,
        lineas: lineasLimpias,
      });
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
              <label className="form-label">
                Nombre del cliente <span className="form-optional">(opcional — máx. {MAX_CLIENTE} caracteres)</span>
              </label>
              <input
                className="form-input"
                type="text"
                value={cliente}
                onChange={(e) => setCliente(e.target.value)}
                maxLength={MAX_CLIENTE}
              />
              <span className="form-char-counter">{cliente.length} / {MAX_CLIENTE}</span>
            </div>

            <div className="form-row-group">
              <div className="form-row">
                <label className="form-label">Hora de entrega *</label>
                <input
                  className={`form-input${errHora ? " form-input--error" : ""}`}
                  type="time"
                  value={horaEntrega}
                  onChange={(e) => handleHora(e.target.value)}
                />
                {errHora && <span className="form-field-error">{errHora}</span>}
              </div>

              <div className="form-row">
                <label className="form-label">Demora estimada *</label>
                <div className="demora-compuesta">
                  <input
                    className={`form-input demora-num${errDemora ? " form-input--error" : ""}`}
                    type="number"
                    min="1"
                    max={maxDemora}
                    value={demoraNum}
                    onChange={(e) => handleDemoraNum(e.target.value)}
                    placeholder="Ej: 30"
                  />
                  <select
                    className="form-input demora-unidad"
                    value={demoraUnidad}
                    onChange={(e) => handleDemoraUnidad(e.target.value)}
                  >
                    <option value="min">min (máx. 59)</option>
                    <option value="hs">hs (máx. 23)</option>
                  </select>
                </div>
                {errDemora && <span className="form-field-error">{errDemora}</span>}
              </div>
            </div>
          </div>

          <div className="form-section card" style={{ marginTop: "var(--space-lg)" }}>
            <div className="lineas-header">
              <h2 className="form-section__title">
                Pizzas
                <span className="lineas-contador">{lineas.length} / {MAX_LINEAS}</span>
              </h2>
              <button
                className="btn btn--ghost btn--sm"
                onClick={agregarLinea}
                disabled={lineas.length >= MAX_LINEAS}
              >
                + Agregar pizza
              </button>
            </div>

            {lineas.map((linea) => {
              const pizza            = pizzaSeleccionada(linea.variedad);
              const tiposDisponibles = pizza?.tipos ?? [];
              const tamaniosDisp     = pizza ? TAMANIOS.filter((t) => pizza.precios?.[t] !== undefined) : [];
              const errLinea         = errLineas[linea._key];

              return (
                <div key={linea._key} className={`linea-pedido${errLinea ? " linea-pedido--error" : ""}`}>
                  {errLinea && <span className="form-field-error linea-error-msg">{errLinea}</span>}

                  <div className="linea-pedido__campos">
                    <div className="form-row">
                      <label className="form-label">Variedad *</label>
                      <select
                        className={`form-input${errLinea && !linea.variedad ? " form-input--error" : ""}`}
                        value={linea.variedad}
                        onChange={(e) => actualizarLinea(linea._key, "variedad", e.target.value)}
                      >
                        <option value="">Seleccionar...</option>
                        {pizzas.map((p) => <option key={p.id} value={p.nombre}>{p.nombre}</option>)}
                      </select>
                    </div>

                    <div className="form-row">
                      <label className="form-label">Tipo *</label>
                      <select
                        className={`form-input${errLinea && !linea.tipo ? " form-input--error" : ""}`}
                        value={linea.tipo}
                        onChange={(e) => actualizarLinea(linea._key, "tipo", e.target.value)}
                        disabled={!linea.variedad}
                      >
                        <option value="">Seleccionar...</option>
                        {tiposDisponibles.map((t) => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>

                    <div className="form-row">
                      <label className="form-label">Tamaño *</label>
                      <select
                        className={`form-input${errLinea && !linea.tamanio ? " form-input--error" : ""}`}
                        value={linea.tamanio}
                        onChange={(e) => actualizarLinea(linea._key, "tamanio", e.target.value)}
                        disabled={!linea.variedad}
                      >
                        <option value="">Seleccionar...</option>
                        {tamaniosDisp.map((t) => <option key={t} value={t}>{t} porciones</option>)}
                      </select>
                    </div>

                    <div className="form-row">
                      <label className="form-label">Cantidad * <span className="form-optional">(máx. {MAX_CANTIDAD})</span></label>
                      <input
                        className={`form-input${errLinea && (!linea.cantidad || linea.cantidad < 1) ? " form-input--error" : ""}`}
                        type="number"
                        min="1"
                        max={MAX_CANTIDAD}
                        value={linea.cantidad}
                        onChange={(e) => actualizarLinea(linea._key, "cantidad", e.target.value)}
                      />
                    </div>

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

                  <div className="linea-pedido__actions">
                    <span className="linea-subtotal">
                      Subtotal: ${(linea.precioUnitario * (Number(linea.cantidad) || 0)).toLocaleString("es-AR")}
                    </span>
                    {lineas.length > 1 && (
                      <button className="btn btn--danger btn--sm" onClick={() => quitarLinea(linea._key)}>
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
              {saving ? "Guardando..." : "Guardar cambios"}
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default EditarPedido;