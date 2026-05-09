
// App.jsx — Rutas de los módulos de Maru (INC-01 + INC-02)
// Este archivo se integra con el App.jsx de Facu que tiene
// el Router, AuthContext y ProtectedRoute.
//
// INSTRUCCIONES DE INTEGRACIÓN:
// Copiar las rutas de <Routes> dentro del <Routes> del App.jsx de Facu.




// Módulos de Maru — INC-02 (descomentar cuando esté listo)
// import FacturacionPage from "./pages/facturacion/FacturacionPage";
// import ConfirmarFactura from "./pages/facturacion/ConfirmarFactura";
// import VistaFactura from "./pages/facturacion/VistaFactura";
// import HistorialFacturas from "./pages/facturacion/HistorialFacturas";



// ─── App standalone para desarrollo local de Maru ───────────
// Cuando se integre con Facu, usar ProtectedRoute en lugar del
// wrapper simple de abajo.



      /* ── INC-02: Facturación — descomentar cuando esté listo ──
      <Route path="/facturacion" element={<FacturacionPage />} />
      <Route path="/facturacion/:id" element={<ConfirmarFactura />} />
      <Route path="/facturas" element={<HistorialFacturas />} />
      <Route path="/facturas/:id" element={<VistaFactura />} />
      */

// ─── Extracto para integrar en el App.jsx de Facu ───────────
//
// import PedidosPage     from "./pages/pedidos/PedidosPage";
// import NuevoPedido     from "./pages/pedidos/NuevoPedido";
// import EditarPedido    from "./pages/pedidos/EditarPedido";
// import DetallePedido   from "./pages/pedidos/DetallePedido";
// import VistaCocina     from "./pages/cocina/VistaCocina";
//
// Dentro de <Routes>:
//
// <Route path="/pedidos"            element={<ProtectedRoute roles={["Mostrador"]}><PedidosPage /></ProtectedRoute>} />
// <Route path="/pedidos/nuevo"      element={<ProtectedRoute roles={["Mostrador"]}><NuevoPedido /></ProtectedRoute>} />
// <Route path="/pedidos/editar/:id" element={<ProtectedRoute roles={["Mostrador"]}><EditarPedido /></ProtectedRoute>} />
// <Route path="/pedidos/:id"        element={<ProtectedRoute roles={["Mostrador"]}><DetallePedido /></ProtectedRoute>} />
// <Route path="/cocina"             element={<ProtectedRoute roles={["Cocinero"]}><VistaCocina /></ProtectedRoute>} />


import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import "./styles/global.css";
import PedidosPage from "./pages/pedidos/PedidosPage";
import NuevoPedido from "./pages/pedidos/NuevoPedido";
import EditarPedido from "./pages/pedidos/EditarPedido";
import DetallePedido from "./pages/pedidos/DetallePedido";
import VistaCocina from "./pages/cocina/VistaCocina";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Redirección inicial */}
        <Route path="/" element={<Navigate to="/pedidos" replace />} />

        {/* ── INC-01: Pedidos ── */}
        <Route path="/pedidos" element={<PedidosPage />} />
        <Route path="/pedidos/nuevo" element={<NuevoPedido />} />
        <Route path="/pedidos/editar/:id" element={<EditarPedido />} />
        <Route path="/pedidos/:id" element={<DetallePedido />} />

        {/* ── INC-01: Cocina ── */}
        <Route path="/cocina" element={<VistaCocina />} />

        {/* Ruta de Login (para cuando integres lo de Facu) */}
        <Route path="/login" element={<div>Login (MOCK)</div>} />

        {/* Fallback para evitar errores 404 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;