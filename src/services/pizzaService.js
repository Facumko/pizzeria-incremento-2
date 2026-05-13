const COOKING_TYPE_REVERSE = {
  PIEDRA:   "piedra",
  PARRILLA: "parrilla",
  MOLDE:    "molde",
};

const SIZE_REVERSE = {
  SMALL:  8,
  MEDIUM: 10,
  LARGE:  12,
};

const COOKING_TYPE_MAP = {
  piedra:   "PIEDRA",
  parrilla: "PARRILLA",
  molde:    "MOLDE",
};

const SIZE_MAP = {
  8:  "SMALL",
  10: "MEDIUM",
  12: "LARGE",
};

// Agrupa las variantes del backend en cards de frontend
const agruparPizzas = (lista) => {
  const mapa = {};
  for (const p of lista) {
    const tipo    = COOKING_TYPE_REVERSE[p.cookingType] ?? p.cookingType.toLowerCase();
    const tamanio = SIZE_REVERSE[p.size] ?? p.size;

    if (!mapa[p.name]) {
      mapa[p.name] = {
        nombre:      p.name,
        ingredientes: p.description,
        tipos:       [],
        precios:     {},
        variantes:   [],
      };
    }

    const pizza = mapa[p.name];

    if (!pizza.tipos.includes(tipo)) pizza.tipos.push(tipo);

    if (!pizza.precios[tipo]) pizza.precios[tipo] = {};
    pizza.precios[tipo][tamanio] = p.price;

    pizza.variantes.push({ id: p.id, tipo, tamanio, precio: p.price });
  }
  return Object.values(mapa);
};

// GET /pizza/traer
export const getPizzas = async () => {
  const res = await fetch("/pizza/traer", { credentials: "include" });
  if (!res.ok) throw new Error("Error al cargar el menú");
  const data = await res.json();
  return agruparPizzas(data);
};

// GET pizza por id agrupado (busca en la lista completa)
export const getPizzaById = async (id) => {
  const pizzas = await getPizzas();
  // id acá es el nombre usado como key en edición
  const pizza = pizzas.find((p) => String(p.id) === String(id) || p.nombre === id);
  if (!pizza) throw new Error("Pizza no encontrada");
  return pizza;
};

// POST /pizza/guardar — crea UNA variante
export const crearPizza = async (data) => {
  // data.tipos y data.precios vienen del form agrupado
  // por cada tipo × tamaño creamos una variante
  const variantes = [];
  for (const tipo of data.tipos) {
    for (const [tam, precio] of Object.entries(data.precios[tipo] ?? {})) {
      const body = {
        name:        data.nombre,
        description: data.ingredientes,
        cookingType: COOKING_TYPE_MAP[tipo],
        size:        SIZE_MAP[Number(tam)],
        price:       precio,
      };
      const res = await fetch("/pizza/guardar", {
        method:      "POST",
        headers:     { "Content-Type": "application/json" },
        credentials: "include",
        body:        JSON.stringify(body),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        const msg = Object.values(err.errors ?? {}).join(", ") || "Error al crear pizza";
        throw new Error(msg);
      }
      variantes.push(await res.json());
    }
  }
  return variantes;
};

// PUT /pizza/editar/{id} — edita una variante por id
export const modificarPizza = async (id, data) => {
  const body = {
    name:        data.nombre,
    description: data.ingredientes,
    cookingType: COOKING_TYPE_MAP[data.tipo],
    size:        SIZE_MAP[Number(data.tamanio)],
    price:       data.precio,
  };
  const res = await fetch(`/pizza/editar/${id}`, {
    method:      "PUT",
    headers:     { "Content-Type": "application/json" },
    credentials: "include",
    body:        JSON.stringify(body),
  });
  if (!res.ok) throw new Error("Error al modificar pizza");
  return res.json();
};

// DELETE /pizza/eliminar/{id}
export const eliminarPizza = async (id) => {
  const res = await fetch(`/pizza/eliminar/${id}`, {
    method:      "DELETE",
    credentials: "include",
  });
  if (!res.ok) throw new Error("Error al eliminar pizza");
  return true;
};