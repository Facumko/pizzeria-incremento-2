// pizzaService.js
// FASE 1: datos mockeados en memoria.
// FASE 2: reemplazar el cuerpo de cada función con fetch() al endpoint REST.
//
// Endpoints esperados (contrato con el equipo Java):
//   GET    /api/pizzas         → lista todas las variedades
//   POST   /api/pizzas         → crea nueva variedad
//   PUT    /api/pizzas/:id     → modifica variedad existente
//   DELETE /api/pizzas/:id     → elimina (solo si sin pedidos activos)

let pizzas = [
  {
    id: 1,
    nombre: "Mozzarella",
    ingredientes: "Tomate, mozzarella",
    tipos: ["piedra", "parrilla", "molde"],
    precios: { 8: 1200, 10: 1600, 12: 2000 },
  },
  {
    id: 2,
    nombre: "Napolitana",
    ingredientes: "Tomate, mozzarella, aceitunas, anchoas",
    tipos: ["piedra", "parrilla"],
    precios: { 8: 1400, 10: 1800, 12: 2200 },
  },
  {
    id: 3,
    nombre: "Especial",
    ingredientes: "Tomate, mozzarella, jamón, morrón, huevo",
    tipos: ["molde", "piedra"],
    precios: { 8: 1800, 10: 2200, 12: 2500 },
  },
];

let nextId = 4;

// GET /api/pizzas
export const getPizzas = async () => {
  return [...pizzas];
};

// GET /api/pizzas/:id
export const getPizzaById = async (id) => {
  const pizza = pizzas.find((p) => p.id === Number(id));
  if (!pizza) throw new Error("Pizza no encontrada");
  return { ...pizza };
};

// POST /api/pizzas — RF01
// Valida nombre único antes de guardar
export const crearPizza = async (data) => {
  const nombreDuplicado = pizzas.some(
    (p) => p.nombre.toLowerCase() === data.nombre.trim().toLowerCase()
  );
  if (nombreDuplicado) {
    throw new Error("Ya existe una variedad con ese nombre.");
  }
  const nueva = {
    ...data,
    id: nextId++,
    nombre: data.nombre.trim(),
  };
  pizzas.push(nueva);
  return { ...nueva };
};

// PUT /api/pizzas/:id — RF02
export const modificarPizza = async (id, data) => {
  const idx = pizzas.findIndex((p) => p.id === Number(id));
  if (idx === -1) throw new Error("Pizza no encontrada");

  // Validar nombre único (excluyendo la propia pizza)
  const nombreDuplicado = pizzas.some(
    (p) =>
      p.id !== Number(id) &&
      p.nombre.toLowerCase() === data.nombre.trim().toLowerCase()
  );
  if (nombreDuplicado) {
    throw new Error("Ya existe una variedad con ese nombre.");
  }

  pizzas[idx] = { ...pizzas[idx], ...data, nombre: data.nombre.trim() };
  return { ...pizzas[idx] };
};

// DELETE /api/pizzas/:id — CU-03
// En Fase 1 no tenemos acceso directo a pedidoService aquí para verificar
// pedidos activos — esa validación la hace el componente PizzaCard antes de llamar.
// En Fase 2, el backend retorna 409 si la pizza tiene pedidos activos.
export const eliminarPizza = async (id) => {
  const idx = pizzas.findIndex((p) => p.id === Number(id));
  if (idx === -1) throw new Error("Pizza no encontrada");
  pizzas.splice(idx, 1);
  return true;
};