const STATUS_REVERSE = {
  PENDING:  "Pendiente",
  READY:    "Listo",
  INVOICED: "Facturado",
};

const SIZE_REVERSE = {
  SMALL:  8,
  MEDIUM: 10,
  LARGE:  12,
};

const COOKING_TYPE_REVERSE = {
  PIEDRA:   "piedra",
  PARRILLA: "parrilla",
  MOLDE:    "molde",
};

const mapPedido = (p) => ({
  id:             p.id,
  nroPedido:      p.id,
  cliente:        p.clientName ?? "",
  fecha:          p.orderDate,
  horaEntrega:    p.deliveredAt?.slice(0, 5) ?? "",
  demoraEstimada: `${p.timeEstimated} min`,
  estado:         STATUS_REVERSE[p.status] ?? p.status,
  lineas: (p.items ?? []).map((item) => ({
    id:             item.id,
    variedad:       item.pizza.name,
    tipo:           COOKING_TYPE_REVERSE[item.pizza.cookingType] ?? item.pizza.cookingType,
    tamanio:        SIZE_REVERSE[item.pizza.size] ?? item.pizza.size,
    cantidad:       item.amount,
    precioUnitario: item.unitPrice,
    pizzaId:        item.pizza.id,
  })),
});

export const calcularTotal = (lineas) =>
  lineas.reduce((acc, l) => acc + l.precioUnitario * l.cantidad, 0);

// GET /pedido/traer
export const getPedidos = async (filtroEstado = "") => {
  const res = await fetch("/pedido/traer", { credentials: "include" });
  if (!res.ok) throw new Error("Error al cargar pedidos");
  const data = await res.json();
  const mapped = data.map(mapPedido);
  if (!filtroEstado) return mapped;
  return mapped.filter((p) => p.estado === filtroEstado);
};

// GET pedido por id
export const getPedidoById = async (id) => {
  const pedidos = await getPedidos();
  const pedido = pedidos.find((p) => p.id === Number(id));
  if (!pedido) throw new Error("Pedido no encontrado");
  return pedido;
};

// POST /pedido/guardar
export const crearPedido = async (data) => {
  const body = {
    clientName:    data.cliente || "Consumidor Final",
    timeEstimated: Number(data.demoraEstimada?.replace(/\D/g, "") ?? 0),
    items: data.lineas.map((l) => ({
      pizzaId:  l.pizzaId,
      quantity: l.cantidad,
    })),
  };
  const res = await fetch("/pedido/guardar", {
    method:      "POST",
    headers:     { "Content-Type": "application/json" },
    credentials: "include",
    body:        JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const msg = Object.values(err.errors ?? {}).join(", ") || "Error al crear pedido";
    throw new Error(msg);
  }
  return mapPedido(await res.json());
};

// PUT /pedido/editar/{id}
export const modificarPedido = async (id, data) => {
  const body = {
    clientName:    data.cliente || "Consumidor Final",
    timeEstimated: Number(data.demoraEstimada?.replace(/\D/g, "") ?? 0),
    items: data.lineas.map((l) => ({
      pizzaId:  l.pizzaId,
      quantity: l.cantidad,
    })),
  };
  const res = await fetch(`/pedido/editar/${id}`, {
    method:      "PUT",
    headers:     { "Content-Type": "application/json" },
    credentials: "include",
    body:        JSON.stringify(body),
  });
  if (!res.ok) throw new Error("Error al modificar pedido");
  return mapPedido(await res.json());
};

// PATCH — pendiente confirmación del backend
export const marcarComoListo = async (id) => {
  const res = await fetch(`/pedido/editar/listo`, {
    method:      "PATCH",
    credentials: "include",
  });
  if (!res.ok) throw new Error("Error al marcar como listo");
  return mapPedido(await res.json());
};

export const marcarComoFacturado = async (id) => {
  const res = await fetch(`/pedido/editar/facturado`, {
    method:      "PATCH",
    credentials: "include",
  });
  if (!res.ok) throw new Error("Error al marcar como facturado");
  return mapPedido(await res.json());
};