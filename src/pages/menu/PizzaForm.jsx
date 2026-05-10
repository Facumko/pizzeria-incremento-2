// PizzaForm.jsx — CU-01 (alta) y CU-02 (edición)
// Ruta: /menu/nueva  y  /menu/editar/:id
// Solo accesible para el Dueño.

import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { crearPizza, modificarPizza, getPizzaById } from "../../services/pizzaService";
import "./Menu.css";

const TIPOS_COCCION = ["piedra", "parrilla", "molde"];
const TAMANIOS = [8, 10, 12];

const estadoInicial = () => ({
  nombre: "",
  ingredientes: "",
  tipos: [],                       // array de strings seleccionados
  precios: { 8: "", 10: "", 12: "" }, // string vacío = no disponible
});

const PizzaForm = () => {
  const { id } = useParams();                // si existe → modo edición
  const navigate = useNavigate();
  const esEdicion = Boolean(id);

  const [form, setForm] = useState(estadoInicial());
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(esEdicion);

  // Cargar datos existentes si es edición
  useEffect(() => {
    if (!esEdicion) return;
    getPizzaById(id)
      .then((pizza) => {
        setForm({
          nombre: pizza.nombre,
          ingredientes: pizza.ingredientes,
          tipos: [...pizza.tipos],
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

  // Toggle de tipo de cocción
  const toggleTipo = (tipo) => {
    setForm((prev) => ({
      ...prev,
      tipos: prev.tipos.includes(tipo)
        ? prev.tipos.filter((t) => t !== tipo)
        : [...prev.tipos, tipo],
    }));
  };

  const setPrecio = (tam, valor) => {
    setForm((prev) => ({
      ...prev,
      precios: { ...prev.precios, [tam]: valor },
    }));
  };

  // Validación — RF01/RF02
  const validar = () => {
    if (!form.nombre.trim()) return "El nombre de la variedad es obligatorio.";
    if (!form.ingredientes.trim()) return "Los ingredientes son obligatorios.";
    if (form.tipos.length === 0) return "Seleccioná al menos un tipo de cocción.";

    const tamaniosConPrecio = TAMANIOS.filter(
      (t) => form.precios[t] !== "" && form.precios[t] !== undefined
    );
    if (tamaniosConPrecio.length === 0)
      return "Ingresá el precio para al menos un tamaño.";

    for (const t of tamaniosConPrecio) {
      const val = Number(form.precios[t]);
      if (isNaN(val) || val <= 0)
        return `El precio para ${t} porciones debe ser un número positivo.`;
    }
    return "";
  };

  const handleSubmit = async () => {
    const err = validar();
    if (err) { setError(err); return; }
    setError("");
    setSaving(true);

    // Construir precios solo con tamaños que tienen valor
    const preciosLimpios = {};
    TAMANIOS.forEach((t) => {
      if (form.precios[t] !== "" && form.precios[t] !== undefined) {
        preciosLimpios[t] = Number(form.precios[t]);
      }
    });

    const payload = {
      nombre: form.nombre.trim(),
      ingredientes: form.ingredientes.trim(),
      tipos: form.tipos,
      precios: preciosLimpios,
    };

    try {
      if (esEdicion) {
        await modificarPizza(id, payload);
      } else {
        await crearPizza(payload);
      }
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
            <label className="pizza-form__label">Nombre *</label>
            <input
              className="pizza-form__input"
              type="text"
              value={form.nombre}
              onChange={(e) => setForm({ ...form, nombre: e.target.value })}
              placeholder="Ej: Napolitana"
            />
          </div>

          <div className="pizza-form__row">
            <label className="pizza-form__label">Ingredientes *</label>
            <input
              className="pizza-form__input"
              type="text"
              value={form.ingredientes}
              onChange={(e) => setForm({ ...form, ingredientes: e.target.value })}
              placeholder="Ej: Tomate, mozzarella, aceitunas"
            />
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

        {/* ── Precios por tamaño ── */}
        <div className="pizza-form__section">
          <p className="pizza-form__section-title">Tamaños y precios</p>
          <p style={{ fontSize: 12, color: "var(--color-text-muted)", marginBottom: 12 }}>
            Dejá vacío los tamaños que no estén disponibles.
          </p>
          <div className="pizza-form__precios">
            {TAMANIOS.map((tam) => (
              <div key={tam} className="pizza-form__precio-row">
                <span className="pizza-form__precio-label">{tam} porciones</span>
                <input
                  className="pizza-form__precio-input"
                  type="number"
                  min="0"
                  placeholder="Precio (opcional)"
                  value={form.precios[tam]}
                  onChange={(e) => setPrecio(tam, e.target.value)}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="pizza-form__actions">
          <button
            className="btn btn--primary"
            onClick={handleSubmit}
            disabled={saving}
          >
            {saving
              ? "Guardando..."
              : esEdicion
              ? "Guardar cambios"
              : "Registrar variedad"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PizzaForm;