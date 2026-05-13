// pizzaService.js
//
// El backend maneja pizzas como entidades individuales:
// { id, name, cookingType, size, description, price }
//
// El front agrupa por nombre para mostrarlas como una sola variedad.
//
// Endpoints del backend:
//   GET    /pizza/traer          → lista plana de todas las combinaciones
//   POST   /pizza/guardar        → crear una combinación
//   PUT    /pizza/editar/:id     → modificar una combinación
//   DELETE /pizza/eliminar/:id   → eliminar una combinación

const BASE = "/pizza";

// Mapeos backend ↔ frontend
const SIZE_REVERSE = { SMALL: 8, MEDIUM: 10, LARGE: 12 };
const SIZE_MAP     = { 8: "SMALL", 10: "MEDIUM", 12: "LARGE" };

const handleResponse = async (res) => {
  if (res.ok) {
    if (res.status === 204) return true;
    return res.json();
  }
  let msg = `Error ${res.status}`;
  try {
    const data = await res.json();
    msg = data.message || data.error || msg;
  } catch {}
  throw new Error(msg);
};

// GET /pizza/traer — devuelve lista plana, mapeada al formato del front
export const getPizzas = async () => {
  const res  = await fetch(`${BASE}/traer`, { credentials: "include" });
  const data = await handleResponse(res);
  // Mapeamos los campos del backend al formato que usa el front
  return data.map((p) => ({
    id:          p.id,
    nombre:      p.name,
    tipoCoccion: p.cookingType,              // "PIEDRA" | "PARRILLA" | "MOLDE"
    tamanio:     SIZE_REVERSE[p.size] ?? p.size, // 8 | 10 | 12
    descripcion: p.description,
    precio:      p.price,
  }));
};

// POST /pizza/guardar — crea una combinación
// payload interno: { nombre, tipoCoccion, tamanio, descripcion, precio }
export const crearPizza = async (data) => {
  const body = {
    name:        data.nombre,
    cookingType: data.tipoCoccion,
    size:        SIZE_MAP[data.tamanio] ?? data.tamanio,
    description: data.descripcion,
    price:       data.precio,
  };
  const res = await fetch(`${BASE}/guardar`, {
    method:      "POST",
    headers:     { "Content-Type": "application/json" },
    credentials: "include",
    body:        JSON.stringify(body),
  });
  return handleResponse(res);
};

// Crea las 9 combinaciones de una variedad de una vez
export const crearVariedad = async ({ nombre, descripcion, precios }) => {
  const TIPOS    = ["PIEDRA", "PARRILLA", "MOLDE"];
  const TAMANIOS = [8, 10, 12];

  const combinaciones = [];
  for (const tipo of TIPOS) {
    for (const tam of TAMANIOS) {
      combinaciones.push({
        nombre,
        descripcion,
        tipoCoccion: tipo,
        tamanio:     tam,
        precio:      Number(precios[tipo][tam]),
      });
    }
  }

  const resultados = await Promise.all(combinaciones.map(crearPizza));
  return resultados;
};

// PUT /pizza/editar/:id
// payload interno: { nombre, tipoCoccion, tamanio, descripcion, precio }
export const modificarPizza = async (id, data) => {
  const body = {
    name:        data.nombre,
    cookingType: data.tipoCoccion,
    size:        SIZE_MAP[data.tamanio] ?? data.tamanio,
    description: data.descripcion,
    price:       data.precio,
  };
  const res = await fetch(`${BASE}/editar/${id}`, {
    method:      "PUT",
    headers:     { "Content-Type": "application/json" },
    credentials: "include",
    body:        JSON.stringify(body),
  });
  return handleResponse(res);
};

// DELETE /pizza/eliminar/:id
export const eliminarPizza = async (id) => {
  const res = await fetch(`${BASE}/eliminar/${id}`, {
    method:      "DELETE",
    credentials: "include",
  });
  return handleResponse(res);
};

// Elimina todas las combinaciones de una variedad (por nombre)
export const eliminarVariedad = async (nombre, todasLasPizzas) => {
  const ids = todasLasPizzas
    .filter((p) => p.nombre === nombre)
    .map((p) => p.id);
  await Promise.all(ids.map(eliminarPizza));
};

// Helper: agrupa lista plana por nombre
// Devuelve array de { nombre, descripcion, precios, ids }
// donde precios[tipoCoccion][tamanio] = precio
//       ids[tipoCoccion][tamanio]     = id
export const agruparPorVariedad = (pizzas) => {
  const mapa = {};
  for (const p of pizzas) {
    if (!mapa[p.nombre]) {
      mapa[p.nombre] = {
        nombre:      p.nombre,
        descripcion: p.descripcion,
        precios:     {},
        ids:         {},
      };
    }
    const v = mapa[p.nombre];
    if (!v.precios[p.tipoCoccion]) v.precios[p.tipoCoccion] = {};
    if (!v.ids[p.tipoCoccion])     v.ids[p.tipoCoccion]     = {};
    v.precios[p.tipoCoccion][p.tamanio] = p.precio;
    v.ids[p.tipoCoccion][p.tamanio]     = p.id;
  }
  return Object.values(mapa);
};

// Dado el array plano de pizzas, devuelve el id de la combinación específica
// Útil al armar líneas de pedido
export const getPizzaId = (pizzas, nombre, tipoCoccion, tamanio) => {
  const pz = pizzas.find(
    (p) =>
      p.nombre      === nombre &&
      p.tipoCoccion === tipoCoccion &&
      p.tamanio     === Number(tamanio)
  );
  return pz?.id ?? null;
};