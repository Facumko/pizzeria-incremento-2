// facturaService.js — INC-02
//
// Endpoints del backend:
//   GET   /factura/traer         → listar todas las facturas
//   POST  /pedido/editar/facturado/:id  → generar factura de un pedido Listo
//                                         (el back crea la factura y cambia estado)

import { getPedidos } from "./pedidoService";

const mapFactura = (f) => ({
  id:          f.idInvoice,
  nroFactura:  f.idInvoice,
  fechaEmision: f.issuedAt,
  pedido:      {
    id:             f.order.id,
    nroPedido:      f.order.id,
    cliente:        f.order.clientName ?? "",
    fecha:          f.order.orderDate,
    horaEntrega:    f.order.deliveredAt?.slice(0, 5) ?? "",
    demoraEstimada: `${f.order.timeEstimated} min`,
    estado:         "Facturado",
    lineas: (f.order.items ?? []).map((item) => ({
      id:             item.id,
      variedad:       item.pizza.name,
      tipo:           item.pizza.cookingType?.toLowerCase() ?? "",
      tamanio:        { SMALL: 8, MEDIUM: 10, LARGE: 12 }[item.pizza.size] ?? item.pizza.size,
      cantidad:       item.amount,
      precioUnitario: item.unitPrice,
      pizzaId:        item.pizza.id,
    })),
  },
  total: f.total,
});

// GET /factura/traer
export const getFacturas = async () => {
  const res = await fetch("/factura/traer", { credentials: "include" });
  if (!res.ok) throw new Error("Error al cargar facturas");
  const data = await res.json();
  return data.map(mapFactura);
};

// GET factura por id (busca en la lista completa)
export const getFacturaById = async (id) => {
  const facturas = await getFacturas();
  const factura  = facturas.find((f) => f.id === Number(id));
  if (!factura) throw new Error("Factura no encontrada");
  return factura;
};

// PATCH /pedido/editar/facturado/:id
// Genera la factura del pedido y cambia su estado a Facturado
export const generarFactura = async (pedidoId) => {
  const res = await fetch(`/pedido/editar/facturado/${pedidoId}`, {
    method:      "PATCH",
    credentials: "include",
  });
  if (!res.ok) throw new Error("Error al generar la factura");
  return true;
};

// Devuelve los pedidos en estado "Listo" (disponibles para facturar)
export const getPedidosListos = async () => {
  return getPedidos("Listo");
};

export const calcularTotal = (lineas = []) =>
  lineas.reduce((acc, l) => acc + l.precioUnitario * l.cantidad, 0);