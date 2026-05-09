// ============================================================
// pedidoService.js — FASE 1 (datos mockeados en memoria)
// Para pasar a Fase 2: reemplazar el cuerpo de cada función
// con fetch() al endpoint REST correspondiente.
// ============================================================

let pedidos = [
  {
    id: 1,
    nroPedido: 1,
    cliente: "García",
    fecha: "2026-05-06",
    horaEntrega: "13:30",
    demoraEstimada: "30 min",
    estado: "Pendiente",
    lineas: [
      { id: 1, variedad: "Mozzarella", tipo: "piedra", tamanio: 8, cantidad: 1, precioUnitario: 1200 },
      { id: 2, variedad: "Napolitana", tipo: "parrilla", tamanio: 10, cantidad: 2, precioUnitario: 1800 },
    ],
  },
  {
    id: 2,
    nroPedido: 2,
    cliente: "López",
    fecha: "2026-05-06",
    horaEntrega: "14:00",
    demoraEstimada: "20 min",
    estado: "Listo",
    lineas: [
      { id: 1, variedad: "Especial", tipo: "molde", tamanio: 12, cantidad: 1, precioUnitario: 2500 },
    ],
  },
  {
    id: 3,
    nroPedido: 3,
    cliente: "",
    fecha: "2026-05-06",
    horaEntrega: "14:30",
    demoraEstimada: "25 min",
    estado: "Facturado",
    lineas: [
      { id: 1, variedad: "Mozzarella", tipo: "piedra", tamanio: 8, cantidad: 2, precioUnitario: 1200 },
    ],
  },
];

let nextId = 4;
let nextNro = 4;

const calcularTotal = (lineas) =>
  lineas.reduce((acc, l) => acc + l.precioUnitario * l.cantidad, 0);

// GET /api/pedidos?estado=...
export const getPedidos = async (filtroEstado = "") => {
  if (filtroEstado) {
    return pedidos.filter((p) => p.estado === filtroEstado);
  }
  return [...pedidos];
};

// GET /api/pedidos/:id
export const getPedidoById = async (id) => {
  const pedido = pedidos.find((p) => p.id === Number(id));
  if (!pedido) throw new Error("Pedido no encontrado");
  return { ...pedido };
};

// POST /api/pedidos
export const crearPedido = async (data) => {
  const nuevo = {
    ...data,
    id: nextId++,
    nroPedido: nextNro++,
    fecha: new Date().toISOString().split("T")[0],
    estado: "Pendiente",
  };
  pedidos.push(nuevo);
  return { ...nuevo };
};

// PUT /api/pedidos/:id  (solo si estado === "Pendiente")
export const modificarPedido = async (id, data) => {
  const idx = pedidos.findIndex((p) => p.id === Number(id));
  if (idx === -1) throw new Error("Pedido no encontrado");
  if (pedidos[idx].estado !== "Pendiente")
    throw new Error("Solo se pueden modificar pedidos en estado Pendiente");
  pedidos[idx] = { ...pedidos[idx], ...data };
  return { ...pedidos[idx] };
};

// PATCH /api/pedidos/:id/listo
export const marcarComoListo = async (id) => {
  const idx = pedidos.findIndex((p) => p.id === Number(id));
  if (idx === -1) throw new Error("Pedido no encontrado");
  if (pedidos[idx].estado !== "Pendiente")
    throw new Error("Solo se pueden marcar como Listo pedidos Pendientes");
  pedidos[idx].estado = "Listo";
  return { ...pedidos[idx] };
};

// Usado internamente por facturaService
export const marcarComoFacturado = async (id) => {
  const idx = pedidos.findIndex((p) => p.id === Number(id));
  if (idx === -1) throw new Error("Pedido no encontrado");
  pedidos[idx].estado = "Facturado";
  return { ...pedidos[idx] };
};

export { calcularTotal };
