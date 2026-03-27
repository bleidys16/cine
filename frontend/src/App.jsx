import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import DetallePelicula from './pages/DetallePelicula';
import Compra from './pages/Compra';
import { Login, Registro } from './pages/Auth';
import MisTiquetes from './pages/MisTiquetes';
import Preventa from './pages/Preventa';
import AdminLayout from './pages/AdminLayout';
import AdminDashboard from './pages/AdminDashboard';
import AdminPendientes from './pages/AdminPendientes';
import AdminPeliculas from './pages/AdminPeliculas';
import AdminFunciones from './pages/AdminFunciones';
import AdminValidador from './pages/AdminValidador';

function ProtectedRoute({ children }) {
  const { usuario } = useAuth();
  return usuario ? children : <Navigate to="/login" />;
}

function AppRoutes() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/pelicula/:id" element={<DetallePelicula />} />
        <Route path="/preventa" element={<Preventa />} />
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Registro />} />
        <Route path="/comprar/:funcionId" element={<ProtectedRoute><Compra /></ProtectedRoute>} />
        <Route path="/mis-tiquetes" element={<ProtectedRoute><MisTiquetes /></ProtectedRoute>} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="pendientes" element={<AdminPendientes />} />
          <Route path="peliculas" element={<AdminPeliculas />} />
          <Route path="funciones" element={<AdminFunciones />} />
          <Route path="validar" element={<AdminValidador />} />
        </Route>
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
