// pizzaService.js — Fase 2 (backend Java)
//
// El backend maneja pizzas como entidades individuales:
// { id, nombre, tipoCoccion, tamanio, descripcion, precio }
//
// El front agrupa por nombre para mostrarlas como una sola variedad.
//
// Endpoints:
//   GET    /api/pizzas        → lista plana de todas las combinaciones
//   GET    /api/pizzas/:id    → una combinación
//   POST   /api/pizzas        → crear una combinación
//   PUT    /api/pizzas/:id    → modificar una combinación
//   DELETE /api/pizzas/:id    → eliminar una combinación

const BASE = "/api/pizzas";

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

// GET /api/pizzas — devuelve lista plana
export const getPizzas = async () => {
  const res = await fetch(BASE, { credentials: "include" });
  return handleResponse(res);
};

// GET /api/pizzas/:id
export const getPizzaById = async (id) => {
  const res = await fetch(`${BASE}/${id}`, { credentials: "include" });
  return handleResponse(res);
};

// POST /api/pizzas — una combinación por vez
// payload: { nombre, tipoCoccion, tamanio, descripcion, precio }
export const crearPizza = async (data) => {
  const res = await fetch(BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });
  return handleResponse(res);
};

// Crea las 9 combinaciones de una variedad de una vez
// Devuelve array de resultados o lanza error si alguno falla
export const crearVariedad = async ({ nombre, descripcion, precios }) => {
  // precios: { PIEDRA: { 8: x, 10: x, 12: x }, PARRILLA: {...}, MOLDE: {...} }
  const TIPOS   = ["PIEDRA", "PARRILLA", "MOLDE"];
  const TAMANIOS = [8, 10, 12];

  const combinaciones = [];
  for (const tipo of TIPOS) {
    for (const tam of TAMANIOS) {
      combinaciones.push({
        nombre,
        descripcion,
        tipoCoccion: tipo,
        tamanio: tam,
        precio: Number(precios[tipo][tam]),
      });
    }
  }

  const resultados = await Promise.all(combinaciones.map(crearPizza));
  return resultados;
};

// PUT /api/pizzas/:id
export const modificarPizza = async (id, data) => {
  const res = await fetch(`${BASE}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });
  return handleResponse(res);
};

// DELETE /api/pizzas/:id
export const eliminarPizza = async (id) => {
  const res = await fetch(`${BASE}/${id}`, {
    method: "DELETE",
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
// Devuelve array de { nombre, descripcion, tipos, precios }
// donde precios[tipo][tamanio] = precio
export const agruparPorVariedad = (pizzas) => {
  const mapa = {};
  for (const p of pizzas) {
    if (!mapa[p.nombre]) {
      mapa[p.nombre] = {
        nombre: p.nombre,
        descripcion: p.descripcion,
        precios: {},     // { PIEDRA: { 8: x, ... }, ... }
        ids: {},         // { PIEDRA: { 8: id, ... }, ... }  ← para editar/eliminar
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
