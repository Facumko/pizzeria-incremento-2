// NuevoPedido.jsx — CU-05
// Formulario de registro de pedido. Acceso: Empleado de Mostrador.

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { crearPedido, calcularTotal } from "../../services/pedidoService";
import { getPizzas, getPizzaId } from "../../services/pizzaService";
import Modal from "../../components/ui/Modal";
import "./Pedidos.css";

const TAMANIOS     = [8, 10, 12];
const MAX_LINEAS   = 50;
const MAX_CANTIDAD = 99;
const MAX_CLIENTE  = 50;
const MAX_DEMORA   = 999;

const TIPO_LABEL = { PIEDRA: "A la piedra", PARRILLA: "A la parrilla", MOLDE: "De molde" };
const TAM_LABEL  = { 8: "8 porciones", 10: "10 porciones", 12: "12 porciones" };

const lineaVacia = () => ({
  _key:           Date.now() + Math.random(),
  variedad:       "",
  tipo:           "",
  tamanio:        "",
  cantidad:       1,
  precioUnitario: 0,
  pizzaId:        null,
});

const NuevoPedido = () => {
  const navigate = useNavigate();
  const [pizzas,        setPizzas]        = useState([]);
  const [cliente,       setCliente]       = useState("");
  const [horaEntrega,   setHoraEntrega]   = useState("");
  const [demoraMin,     setDemoraMin]     = useState("");
  const [lineas,        setLineas]        = useState([lineaVacia()]);
  const [error,         setError]         = useState("");
  const [saving,        setSaving]        = useState(false);
  const [errLineas,     setErrLineas]     = useState({});
  const [errDemora,     setErrDemora]     = useState("");
  const [errHora,       setErrHora]       = useState("");
  const [isDirty,       setIsDirty]       = useState(false);
  const [modalSalir,    setModalSalir]    = useState(false);

  useEffect(() => { getPizzas().then(setPizzas); }, []);

  const marcarDirty = () => { if (!isDirty) setIsDirty(true); };

  const handleCancelar = () => {
    if (isDirty) setModalSalir(true);
    else navigate("/pedidos");
  };

  const variedadesUnicas = [...new Set(pizzas.map((p) => p.nombre))].sort();

  const tiposDeVariedad = (nombreVariedad) =>
    [...new Set(pizzas.filter((p) => p.nombre === nombreVariedad).map((p) => p.tipoCoccion))];

  const tamaniosDeVariedad = (nombreVariedad, tipo) =>
    pizzas
      .filter((p) => p.nombre === nombreVariedad && p.tipoCoccion === tipo)
      .map((p) => p.tamanio)
      .sort((a, b) => a - b);

  const handleDemoraMin = (val) => {
    marcarDirty();
    const limpio = val.replace(/\D/g, "");
    if (limpio === "") { setDemoraMin(""); setErrDemora(""); return; }
    const n = Math.min(Number(limpio), MAX_DEMORA);
    setDemoraMin(String(n));
    setErrDemora(n < 1 ? "Ingresá un valor válido." : "");
  };

  const handleHora = (val) => {
    marcarDirty();
    setHoraEntrega(val);
    setErrHora(val ? "" : "La hora de entrega es obligatoria.");
  };

  const actualizarLinea = (key, campo, valor) => {
    marcarDirty();
    setLineas((prev) =>
      prev.map((l) => {
        if (l._key !== key) return l;
        const act = { ...l, [campo]: valor };
        if (campo === "variedad") { act.tipo = ""; act.tamanio = ""; act.precioUnitario = 0; act.pizzaId = null; }
        if (campo === "tipo")     { act.tamanio = ""; act.precioUnitario = 0; act.pizzaId = null; }
        if (campo === "tamanio" && act.variedad && act.tipo) {
          const id = getPizzaId(pizzas, act.variedad, act.tipo, Number(valor));
          const pz = pizzas.find((p) => p.id === id);
          act.pizzaId = id;
          act.precioUnitario = pz?.precio ?? 0;
        }
        if (campo === "cantidad") act.cantidad = Math.min(Math.max(1, Number(valor) || 1), MAX_CANTIDAD);
        return act;
      })
    );
    setErrLineas((prev) => ({ ...prev, [key]: "" }));
  };

  const agregarLinea = () => {
    marcarDirty();
    if (lineas.length >= MAX_LINEAS) return;
    setLineas((prev) => [...prev, lineaVacia()]);
  };

  const quitarLinea = (key) => {
    marcarDirty();
    setLineas((prev) => prev.filter((l) => l._key !== key));
    setErrLineas((prev) => { const c = { ...prev }; delete c[key]; return c; });
  };

  const validar = () => {
    let ok = true;
    const nuevosErrLineas = {};
    if (!horaEntrega) { setErrHora("La hora de entrega es obligatoria."); ok = false; }
    if (!demoraMin || Number(demoraMin) < 1) { setErrDemora("La demora estimada es obligatoria."); ok = false; }
    if (lineas.length === 0) { setError("Debe agregar al menos una pizza al pedido."); return false; }
    for (const l of lineas) {
      const msgs = [];
      if (!l.variedad)                   msgs.push("variedad");
      if (!l.tipo)                       msgs.push("tipo");
      if (!l.tamanio)                    msgs.push("tamaño");
      if (!l.pizzaId)                    msgs.push("combinación no encontrada");
      if (!l.cantidad || l.cantidad < 1) msgs.push("cantidad");
      if (msgs.length) { nuevosErrLineas[l._key] = `Completá: ${msgs.join(", ")}.`; ok = false; }
    }
    setErrLineas(nuevosErrLineas);
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
      const nuevo = await crearPedido({ cliente, horaEntrega, demoraEstimada: `${demoraMin} min`, lineas: lineasLimpias });
      navigate("/pedidos", { state: { mensaje: `Pedido #${nuevo.nroPedido} creado correctamente.` } });
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
        <button className="btn btn--secondary" onClick={handleCancelar}>Cancelar</button>
      </div>

      {error && <div className="alert-error">{error}</div>}

      {/* Datos del cliente */}
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
            onChange={(e) => { marcarDirty(); setCliente(e.target.value); }}
            placeholder="Ej: García"
            maxLength={MAX_CLIENTE}
          />
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
            <label className="form-label">
              Demora estimada * <span className="form-optional">(minutos — máx. {MAX_DEMORA})</span>
            </label>
            <input
              className={`form-input${errDemora ? " form-input--error" : ""}`}
              type="number"
              min="1"
              max={MAX_DEMORA}
              value={demoraMin}
              onChange={(e) => handleDemoraMin(e.target.value)}
              placeholder="Ej: 30"
            />
            {errDemora && <span className="form-field-error">{errDemora}</span>}
          </div>
        </div>
      </div>

      {/* Líneas de pizza */}
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
          const tipos    = tiposDeVariedad(linea.variedad);
          const tamanios = tamaniosDeVariedad(linea.variedad, linea.tipo);
          const errLinea = errLineas[linea._key];
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
                    {variedadesUnicas.map((nombre) => (
                      <option key={nombre} value={nombre}>{nombre}</option>
                    ))}
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
                    {tipos.map((t) => <option key={t} value={t}>{TIPO_LABEL[t] ?? t}</option>)}
                  </select>
                </div>
                <div className="form-row">
                  <label className="form-label">Tamaño *</label>
                  <select
                    className={`form-input${errLinea && !linea.tamanio ? " form-input--error" : ""}`}
                    value={linea.tamanio}
                    onChange={(e) => actualizarLinea(linea._key, "tamanio", e.target.value)}
                    disabled={!linea.variedad || !linea.tipo}
                  >
                    <option value="">Seleccionar...</option>
                    {tamanios.map((t) => <option key={t} value={t}>{TAM_LABEL[t] ?? `${t} porciones`}</option>)}
                  </select>
                </div>
                <div className="form-row">
                  <label className="form-label">
                    Cantidad * <span className="form-optional">(máx. {MAX_CANTIDAD})</span>
                  </label>
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
          {saving ? "Guardando..." : "Confirmar pedido"}
        </button>
      </div>

      {/* Modal salir sin guardar */}
      <Modal
        isOpen={modalSalir}
        onClose={() => setModalSalir(false)}
        onConfirm={() => navigate("/pedidos")}
        title="¿Salir sin guardar?"
        body="Tenés cambios sin guardar. Si salís ahora se van a perder."
        confirmLabel="Sí, salir"
        danger
      />
    </div>
  );
};

export default NuevoPedido;