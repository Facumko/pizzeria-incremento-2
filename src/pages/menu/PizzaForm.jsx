// PizzaForm.jsx — CU-01 (alta) y CU-02 (edición)
// Ruta: /menu/nueva  y  /menu/editar/:id
// Solo accesible para el Dueño.

import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { crearPizza, modificarPizza, getPizzaById } from "../../services/pizzaService";
import "./Menu.css";

const TIPOS_COCCION    = ["piedra", "parrilla", "molde"];
const TAMANIOS         = [8, 10, 12];
const MAX_NOMBRE       = 50;
const MAX_INGREDIENTES = 200;
const MAX_PRECIO       = 999999;
const MIN_PRECIO       = 1;

const estadoInicial = () => ({
  nombre: "",
  ingredientes: "",
  tipos: [],
  precios: { 8: "", 10: "", 12: "" },
});

const PizzaForm = () => {
  const { id }    = useParams();
  const navigate  = useNavigate();
  const esEdicion = Boolean(id);

  const [form,    setForm]    = useState(estadoInicial());
  const [error,   setError]   = useState("");
  const [saving,  setSaving]  = useState(false);
  const [loading, setLoading] = useState(esEdicion);

  useEffect(() => {
    if (!esEdicion) return;
    getPizzaById(id)
      .then((pizza) => {
        setForm({
          nombre:       pizza.nombre,
          ingredientes: pizza.ingredientes,
          tipos:        [...pizza.tipos],
          precios: {
            8:  pizza.precios[8]  ?? "",
            10: pizza.precios[10] ?? "",
            12: pizza.precios[12] ?? "",
          },
        });
        setLoading(false);
      })
      .catch((e) => { setError(e.message); setLoading(false); });
  }, [id, esEdicion]);

  const toggleTipo = (tipo) => {
    setForm((prev) => ({
      ...prev,
      tipos: prev.tipos.includes(tipo)
        ? prev.tipos.filter((t) => t !== tipo)
        : [...prev.tipos, tipo],
    }));
  };

  const setPrecio = (tam, valor) => {
    const limpio = valor.replace(/\D/g, "");
    if (limpio === "") {
      setForm((prev) => ({ ...prev, precios: { ...prev.precios, [tam]: "" } }));
      return;
    }
    const n = Math.min(Number(limpio), MAX_PRECIO);
    setForm((prev) => ({ ...prev, precios: { ...prev.precios, [tam]: String(n) } }));
  };

  const validar = () => {
    if (!form.nombre.trim())
      return "El nombre de la variedad es obligatorio.";
    if (form.nombre.trim().length > MAX_NOMBRE)
      return `El nombre no puede superar los ${MAX_NOMBRE} caracteres.`;
    if (!form.ingredientes.trim())
      return "Los ingredientes son obligatorios.";
    if (form.ingredientes.trim().length > MAX_INGREDIENTES)
      return `Los ingredientes no pueden superar los ${MAX_INGREDIENTES} caracteres.`;
    if (form.tipos.length === 0)
      return "Seleccioná al menos un tipo de cocción.";

    for (const t of TAMANIOS) {
      const val = form.precios[t];
      if (val === "" || val === undefined)
        return `El precio para ${t} porciones es obligatorio.`;
      const num = Number(val);
      if (isNaN(num) || num < MIN_PRECIO)
        return `El precio para ${t} porciones debe ser mayor a $0.`;
      if (num > MAX_PRECIO)
        return `El precio para ${t} porciones no puede superar $${MAX_PRECIO.toLocaleString("es-AR")}.`;
    }

    return "";
  };

  const handleSubmit = async () => {
    const err = validar();
    if (err) { setError(err); return; }
    setError("");
    setSaving(true);

    const preciosLimpios = {};
    TAMANIOS.forEach((t) => { preciosLimpios[t] = Number(form.precios[t]); });

    const payload = {
      nombre:       form.nombre.trim(),
      ingredientes: form.ingredientes.trim(),
      tipos:        form.tipos,
      precios:      preciosLimpios,
    };

    try {
      if (esEdicion) { await modificarPizza(id, payload); }
      else           { await crearPizza(payload); }
      navigate("/menu");
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="page-container"><p className="empty-message">Cargando...</p></div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">
          {esEdicion ? "Modificar variedad" : "Nueva variedad"}
        </h1>
        <button className="btn btn--secondary" onClick={() => navigate("/menu")}>
          Cancelar
        </button>
      </div>

      {error && <div className="alert-error">{error}</div>}

      <div className="pizza-form card">
        {/* ── Datos básicos ── */}
        <div className="pizza-form__section">
          <p className="pizza-form__section-title">Datos de la variedad</p>

          <div className="pizza-form__row">
            <label className="pizza-form__label">
              Nombre *{" "}
              <span style={{ fontWeight: 400, color: "var(--color-text-muted)", textTransform: "none" }}>
                (máx. {MAX_NOMBRE} caracteres)
              </span>
            </label>
            <input
              className="pizza-form__input"
              type="text"
              value={form.nombre}
              onChange={(e) => setForm({ ...form, nombre: e.target.value })}
              placeholder="Ej: Napolitana"
              maxLength={MAX_NOMBRE}
            />
            <span style={{
              fontSize: 11, textAlign: "right",
              color: form.nombre.length >= MAX_NOMBRE - 5 ? "var(--color-danger)" : "var(--color-text-muted)"
            }}>
              {form.nombre.length} / {MAX_NOMBRE}
            </span>
          </div>

          <div className="pizza-form__row">
            <label className="pizza-form__label">
              Ingredientes *{" "}
              <span style={{ fontWeight: 400, color: "var(--color-text-muted)", textTransform: "none" }}>
                (máx. {MAX_INGREDIENTES} caracteres)
              </span>
            </label>
            <input
              className="pizza-form__input"
              type="text"
              value={form.ingredientes}
              onChange={(e) => setForm({ ...form, ingredientes: e.target.value })}
              placeholder="Ej: Tomate, mozzarella, aceitunas"
              maxLength={MAX_INGREDIENTES}
            />
            <span style={{
              fontSize: 11, textAlign: "right",
              color: form.ingredientes.length >= MAX_INGREDIENTES - 20 ? "var(--color-danger)" : "var(--color-text-muted)"
            }}>
              {form.ingredientes.length} / {MAX_INGREDIENTES}
            </span>
          </div>
        </div>

        {/* ── Tipos de cocción ── */}
        <div className="pizza-form__section">
          <p className="pizza-form__section-title">Tipos de cocción *</p>
          <div className="pizza-form__tipos">
            {TIPOS_COCCION.map((tipo) => (
              <label key={tipo} className="pizza-form__tipo-check">
                <input
                  type="checkbox"
                  checked={form.tipos.includes(tipo)}
                  onChange={() => toggleTipo(tipo)}
                />
                {tipo}
              </label>
            ))}
          </div>
        </div>

        {/* ── Precios — todos obligatorios ── */}
        <div className="pizza-form__section">
          <p className="pizza-form__section-title">Tamaños y precios *</p>
          <p style={{ fontSize: 12, color: "var(--color-text-muted)", marginBottom: 12 }}>
            Los tres tamaños son obligatorios. Máximo ${MAX_PRECIO.toLocaleString("es-AR")} por tamaño.
          </p>
          <div className="pizza-form__precios">
            {TAMANIOS.map((tam) => (
              <div key={tam} className="pizza-form__precio-row">
                <span className="pizza-form__precio-label">{tam} porciones *</span>
                <input
                  className="pizza-form__precio-input"
                  type="text"
                  inputMode="numeric"
                  placeholder="Obligatorio"
                  value={form.precios[tam]}
                  onChange={(e) => setPrecio(tam, e.target.value)}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="pizza-form__actions">
          <button className="btn btn--primary" onClick={handleSubmit} disabled={saving}>
            {saving ? "Guardando..." : esEdicion ? "Guardar cambios" : "Registrar variedad"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PizzaForm;