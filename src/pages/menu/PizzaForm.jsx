// PizzaForm.jsx — CU-01 (alta) y CU-02 (edición de variedad completa)
// El dueño completa nombre, descripción y una grilla 3 tipos × 3 tamaños = 9 precios.
// Al guardar se crean/actualizan las 9 combinaciones en el backend.

import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  getPizzas,
  crearVariedad,
  modificarPizza,
  agruparPorVariedad,
} from "../../services/pizzaService";
import "./Menu.css";

const TIPOS    = ["PIEDRA", "PARRILLA", "MOLDE"];
const TAMANIOS = [8, 10, 12];

const TIPO_LABEL = { PIEDRA: "A la piedra", PARRILLA: "A la parrilla", MOLDE: "De molde" };
const TAM_LABEL  = { 8: "8 porc.", 10: "10 porc.", 12: "12 porc." };

const MAX_NOMBRE      = 50;
const MAX_DESCRIPCION = 200;
const MAX_PRECIO      = 999999;

const grillaVacia = () =>
  Object.fromEntries(TIPOS.map((t) => [t, Object.fromEntries(TAMANIOS.map((s) => [s, ""]))]));

const PizzaForm = () => {
  const { nombre: nombreParam } = useParams();
  const navigate  = useNavigate();
  const esEdicion = Boolean(nombreParam);

  const [nombre,        setNombre]        = useState("");
  const [descripcion,   setDescripcion]   = useState("");
  const [precios,       setPrecios]       = useState(grillaVacia());
  const [idsExistentes, setIdsExistentes] = useState({});

  const [error,   setError]   = useState("");
  const [saving,  setSaving]  = useState(false);
  const [loading, setLoading] = useState(esEdicion);

  useEffect(() => {
    if (!esEdicion) return;
    getPizzas()
      .then((lista) => {
        const variedades = agruparPorVariedad(lista);
        const variedad   = variedades.find((v) => v.nombre === decodeURIComponent(nombreParam));
        if (!variedad) { setError("Variedad no encontrada."); setLoading(false); return; }

        setNombre(variedad.nombre);
        setDescripcion(variedad.descripcion || "");

        const g = grillaVacia();
        for (const tipo of TIPOS) {
          for (const tam of TAMANIOS) {
            g[tipo][tam] = variedad.precios?.[tipo]?.[tam] ?? "";
          }
        }
        setPrecios(g);
        setIdsExistentes(variedad.ids || {});
        setLoading(false);
      })
      .catch((e) => { setError(e.message); setLoading(false); });
  }, [nombreParam, esEdicion]);

  const setPrecio = (tipo, tam, valor) => {
    const limpio = valor.replace(/\D/g, "");
    const n = limpio === "" ? "" : String(Math.min(Number(limpio), MAX_PRECIO));
    setPrecios((prev) => ({ ...prev, [tipo]: { ...prev[tipo], [tam]: n } }));
  };

  const validar = () => {
    if (!nombre.trim())      return "El nombre de la variedad es obligatorio.";
    if (!descripcion.trim()) return "La descripción es obligatoria.";
    for (const tipo of TIPOS) {
      for (const tam of TAMANIOS) {
        const val = precios[tipo][tam];
        if (val === "" || val === undefined)
          return `Falta el precio: ${TIPO_LABEL[tipo]} — ${TAM_LABEL[tam]}.`;
        const n = Number(val);
        if (isNaN(n) || n < 1)
          return `El precio de ${TIPO_LABEL[tipo]} ${TAM_LABEL[tam]} debe ser mayor a $0.`;
      }
    }
    return "";
  };

  const handleSubmit = async () => {
    const err = validar();
    if (err) { setError(err); return; }
    setError("");
    setSaving(true);

    try {
      if (!esEdicion) {
        // Alta: crear las 9 combinaciones
        await crearVariedad({
          nombre:      nombre.trim(),
          descripcion: descripcion.trim(),
          precios,
        });
      } else {
        // Edición: PUT a cada una de las 9 combinaciones existentes
        const promises = [];
        for (const tipo of TIPOS) {
          for (const tam of TAMANIOS) {
            const id = idsExistentes?.[tipo]?.[tam];
            if (!id) continue;
            promises.push(
              modificarPizza(id, {
                nombre:      nombre.trim(),
                descripcion: descripcion.trim(),
                tipoCoccion: tipo,
                tamanio:     tam,
                precio:      Number(precios[tipo][tam]),
              })
            );
          }
        }
        await Promise.all(promises);
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
        <h1 className="page-title">{esEdicion ? "Modificar variedad" : "Nueva variedad"}</h1>
        <button className="btn btn--secondary" onClick={() => navigate("/menu")}>Cancelar</button>
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
                (máx. {MAX_NOMBRE} car.)
              </span>
            </label>
            <input
              className="pizza-form__input"
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej: Napolitana"
              maxLength={MAX_NOMBRE}
              disabled={esEdicion}
            />
            {esEdicion && (
              <span style={{ fontSize: 11, color: "var(--color-text-muted)" }}>
                El nombre no se puede cambiar en edición.
              </span>
            )}
            {!esEdicion && (
              <span style={{
                fontSize: 11, textAlign: "right",
                color: nombre.length >= MAX_NOMBRE - 5 ? "var(--color-danger)" : "var(--color-text-muted)"
              }}>
                {nombre.length} / {MAX_NOMBRE}
              </span>
            )}
          </div>

          <div className="pizza-form__row">
            <label className="pizza-form__label">
              Descripción *{" "}
              <span style={{ fontWeight: 400, color: "var(--color-text-muted)", textTransform: "none" }}>
                (máx. {MAX_DESCRIPCION} car.)
              </span>
            </label>
            <input
              className="pizza-form__input"
              type="text"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Ej: Tomate, mozzarella, aceitunas"
              maxLength={MAX_DESCRIPCION}
            />
            <span style={{
              fontSize: 11, textAlign: "right",
              color: descripcion.length >= MAX_DESCRIPCION - 20 ? "var(--color-danger)" : "var(--color-text-muted)"
            }}>
              {descripcion.length} / {MAX_DESCRIPCION}
            </span>
          </div>
        </div>

        {/* ── Grilla de precios ── */}
        <div className="pizza-form__section">
          <p className="pizza-form__section-title">Precios por tipo y tamaño *</p>
          <p style={{ fontSize: 12, color: "var(--color-text-muted)", marginBottom: 16 }}>
            Todos los campos son obligatorios. Máximo ${MAX_PRECIO.toLocaleString("es-AR")} por combinación.
          </p>

          <div className="pizza-form__grilla-wrapper">
            <table className="pizza-form__grilla">
              <thead>
                <tr>
                  <th></th>
                  {TAMANIOS.map((t) => <th key={t}>{TAM_LABEL[t]}</th>)}
                </tr>
              </thead>
              <tbody>
                {TIPOS.map((tipo) => (
                  <tr key={tipo}>
                    <td className="pizza-form__grilla-label">{TIPO_LABEL[tipo]}</td>
                    {TAMANIOS.map((tam) => (
                      <td key={tam}>
                        <div className="pizza-form__grilla-cell">
                          <span className="pizza-form__grilla-prefix">$</span>
                          <input
                            className="pizza-form__grilla-input"
                            type="text"
                            inputMode="numeric"
                            placeholder="0"
                            value={precios[tipo][tam]}
                            onChange={(e) => setPrecio(tipo, tam, e.target.value)}
                          />
                        </div>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
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