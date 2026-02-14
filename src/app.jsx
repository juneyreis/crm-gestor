// src/App.jsx - CORRIGIDO
import { Routes, Route, Navigate } from 'react-router-dom';
import { useContext } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import ProtectedRoute from './components/ProtectedRoute';
import ImportModal from './components/modals/ImportModal';
import { ImportProvider, ImportContext } from './context/ImportContext';
import Visitas from './pages/Visitas';
import Dashboard from './pages/Dashboard';
import Estatisticas from './pages/Estatisticas';
import Login from './pages/Login';
import Cadastro from './pages/Cadastro';
import Segmentos from './pages/Segmentos';
import Concorrentes from './pages/Concorrentes';
import Vendedores from './pages/Vendedores';
import NotFound from './pages/NotFound';
import ComingSoon from './pages/ComingSoon';
import Prospects from './pages/Prospects';
import Clientes from './pages/Clientes';
import Comissoes from './pages/Comissoes';
import Agenda from './pages/Agenda';
import SegmentosReport from './pages/relatorios/SegmentosReport';
import ConcorrentesReport from './pages/relatorios/ConcorrentesReport';
import VendedoresReport from './pages/relatorios/VendedoresReport';
import ProspectsReport from './pages/relatorios/ProspectsReport';
import VisitasReport from './pages/relatorios/VisitasReport';
import ClientesReport from './pages/relatorios/ClientesReport';
import ComissoesReport from './pages/relatorios/ComissoesReport';
import AdminDashboard from './pages/AdminDashboard';
import ProtectedAdminRoute from './components/ProtectedAdminRoute';
import useTheme from './hooks/useTheme';
import useAuth from './hooks/useAuth';

// Componente interno que acessa o ImportContext
function AppContent() {
  const { theme } = useTheme();
  const { loading, user } = useAuth();
  const { isImportModalOpen, closeImportModal, onImportSuccess } = useContext(ImportContext);

  // Mostrar carregamento enquanto verifica autenticação
  if (loading) {
    return (
      <div className={`min-h-screen ${theme === 'dark' ? 'dark' : ''}`}>
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 text-gray-800 dark:from-slate-950 dark:to-slate-900 dark:text-gray-100 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Carregando...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'dark' : ''}`}>
      <Routes>
        {/* Rotas Públicas (sem Header/Sidebar) */}
        <Route path="/login" element={<Login />} />
        <Route path="/cadastro" element={<Cadastro />} />
        <Route path="/404" element={<NotFound />} />

        {/* Rotas Protegidas (com Header/Sidebar) */}
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 text-gray-800 dark:from-slate-950 dark:to-slate-900 dark:text-gray-100">
                <Header />
                <div className="flex">
                  <Sidebar />
                  <main className="flex-1 p-4 md:p-6 min-h-[calc(100vh-64px)]">
                    <div className="max-w-7xl mx-auto">
                      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-6 md:p-8">
                        <Routes>
                          <Route path="/" element={<Navigate to="/dashboard" />} />
                          <Route path="/dashboard" element={<Dashboard />} />
                          <Route path="tabelas/vendedores" element={<Vendedores />} />
                          <Route path="tabelas/segmentos" element={<Segmentos />} />
                          <Route path="tabelas/concorrentes" element={<Concorrentes />} />
                          <Route path="prospects" element={<Prospects />} />
                          <Route path="clientes" element={<Clientes />} />
                          <Route path="tabelas/comissoes" element={<Comissoes />} />
                          <Route path="/visitas" element={<Visitas />} />
                          <Route path="/agenda" element={<Agenda />} />
                          <Route path="/relatorios/segmentos" element={<SegmentosReport />} />
                          <Route path="/relatorios/concorrentes" element={<ConcorrentesReport />} />
                          <Route path="/relatorios/vendedores" element={<VendedoresReport />} />
                          <Route path="/relatorios/prospects" element={<ProspectsReport />} />
                          <Route path="/relatorios/visitas" element={<VisitasReport />} />
                          <Route path="/relatorios/clientes" element={<ClientesReport />} />
                          <Route path="/relatorios/comissoes" element={<ComissoesReport />} />
                          <Route path="/estatisticas" element={<Estatisticas />} />
                          <Route
                            path="/admin/usuarios"
                            element={
                              <ProtectedAdminRoute>
                                <AdminDashboard />
                              </ProtectedAdminRoute>
                            }
                          />
                          <Route path="*" element={<Navigate to="/404" />} />
                        </Routes>
                      </div>
                    </div>
                  </main>
                </div>
              </div>

              {/* ImportModal Global */}
              <ImportModal
                isOpen={isImportModalOpen}
                onClose={closeImportModal}
                onSuccess={onImportSuccess}
                userId={user?.id}
              />
            </ProtectedRoute>
          }
        />
      </Routes>
    </div>
  );
}

export default function App() {
  return (
    <ImportProvider>
      <AppContent />
    </ImportProvider>
  );
}