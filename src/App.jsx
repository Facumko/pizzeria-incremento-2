// App.jsx — Integración COMPLETA (Facu + Maru)
// INC-01: Login, Menú, Pedidos, Cocina
//
// INSTRUCCIONES PARA INTEGRAR:
// 1. Reemplazar el App.jsx de Maru con este archivo.
// 2. Asegurarse de que AuthContext.jsx está en src/context/
// 3. Verificar que todos los imports de páginas de Maru coincidan con su estructura.

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth, AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/layout/ProtectedRoute";
import Sidebar from "./components/layout/Sidebar";

// ── Facu ──────────────────────────────────────────────────────
import LoginPage   from "./pages/auth/LoginPage";
import MenuPage    from "./pages/menu/MenuPage";
import PizzaForm   from "./pages/menu/PizzaForm";

// ── Maru ──────────────────────────────────────────────────────
import PedidosPage  from "./pages/pedidos/PedidosPage";
import NuevoPedido  from "./pages/pedidos/NuevoPedido";
import EditarPedido from "./pages/pedidos/EditarPedido";
import DetallePedido from "./pages/pedidos/DetallePedido";
import VistaCocina  from "./pages/cocina/VistaCocina";

import "./styles/global.css";

// Ruta de inicio según el rol del usuario
const rutaInicial = (rol) => {
  if (rol === "Cocinero") return "/cocina";
  if (rol === "Dueno")    return "/menu";
  return "/pedidos";
};

// Layout principal con Sidebar (para usuarios autenticados)
const AppLayout = ({ children }) => (
  <div className="app-layout">
    <Sidebar />
    <main className="app-main">{children}</main>
  </div>
);

// Contenido de rutas separado para poder usar useAuth()
const AppRoutes = () => {
  const { usuario } = useAuth();

  return (
    <Routes>
      {/* Login — redirige al inicio si ya está autenticado */}
      <Route
        path="/login"
        element={
          usuario
            ? <Navigate to={rutaInicial(usuario.rol)} replace />
            : <LoginPage />
        }
      />

      {/* ── Menú — Facu ── */}
      <Route
        path="/menu"
        element={
          <ProtectedRoute roles={["Dueno", "Mostrador"]}>
            <AppLayout><MenuPage /></AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/menu/nueva"
        element={
          <ProtectedRoute roles={["Dueno"]}>
            <AppLayout><PizzaForm /></AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/menu/editar/:id"
        element={
          <ProtectedRoute roles={["Dueno"]}>
            <AppLayout><PizzaForm /></AppLayout>
          </ProtectedRoute>
        }
      />

      {/* ── Pedidos — Maru ── */}
      <Route
        path="/pedidos"
        element={
          <ProtectedRoute roles={["Mostrador"]}>
            <AppLayout><PedidosPage /></AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/pedidos/nuevo"
        element={
          <ProtectedRoute roles={["Mostrador"]}>
            <AppLayout><NuevoPedido /></AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/pedidos/editar/:id"
        element={
          <ProtectedRoute roles={["Mostrador"]}>
            <AppLayout><EditarPedido /></AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/pedidos/:id"
        element={
          <ProtectedRoute roles={["Mostrador"]}>
            <AppLayout><DetallePedido /></AppLayout>
          </ProtectedRoute>
        }
      />

      {/* ── Cocina — Maru ── */}
      <Route
        path="/cocina"
        element={
          <ProtectedRoute roles={["Cocinero"]}>
            <AppLayout><VistaCocina /></AppLayout>
          </ProtectedRoute>
        }
      />

      {/* Raíz → redirige según rol (o al login si no está autenticado) */}
      <Route
        path="/"
        element={
          usuario
            ? <Navigate to={rutaInicial(usuario.rol)} replace />
            : <Navigate to="/login" replace />
        }
      />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

const App = () => (
  <BrowserRouter>
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  </BrowserRouter>
);

export default App;