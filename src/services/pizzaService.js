// ============================================================
// pizzaService.js — FASE 1 (stub para módulos de Maru)
// Este archivo lo mantiene Facu. Esta copia es solo para que
// Maru pueda trabajar en paralelo sin depender del merge.
// Cuando se integre el proyecto, usar el de Facu.
// ============================================================

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

export const getPizzas = async () => [...pizzas];
