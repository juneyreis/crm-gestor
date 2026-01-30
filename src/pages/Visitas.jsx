// src/pages/Visitas.jsx - REORGANIZADO
import { useState, useEffect } from "react";
import { supabaseClient as supabase } from "../lib/supabaseClient";
import { Plus, Filter, X, Upload, Download } from 'lucide-react';
import VisitForm from "../components/visits/VisitForm";
import CollapsibleFilters from "../components/visits/CollapsibleFilters";
import VisitTable from "../components/visits/VisitTable";
import ExportModal from "../components/modals/ExportModal";
import useFilters from "../hooks/useFilters";
import useAuth from "../hooks/useAuth";
import useImportModal from "../hooks/useImportModal";
import * as visitasService from "../services/visitasService";

export default function Visitas() {
  const [visits, setVisits] = useState([]);
  const [editingVisit, setEditingVisit] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const { user } = useAuth();
  const { setImportSuccessCallback, openImportModal } = useImportModal();
  
  // Usar o hook de filtros
  const {
    filters,
    filteredVisits,
    activeFilters,
    handleFilterChange,
    applyFilters,
    clearFilters,
    getFilterStats,
    hasActiveFilters
  } = useFilters();

  // Carregar visitas do Supabase
  const loadVisits = async () => {
    setIsLoading(true);
    try {
      // Usar o serviço que já filtra por user_id
      const data = await visitasService.listarVisitas(user?.id);

      setVisits(data || []);
      // Aplicar filtros iniciais
      applyFilters(data || []);
    } catch (error) {
      console.error("Erro ao carregar visitas:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Carregar visitas na inicialização
  useEffect(() => {
    loadVisits();
    // Configurar callback de sucesso da importação
    setImportSuccessCallback(() => {
      loadVisits();
    });
  }, []);

  // Aplicar filtros quando visitas ou filtros mudam
  useEffect(() => {
    if (visits.length > 0) {
      applyFilters(visits);
    }
  }, [visits, filters]);

  // Função para lidar com edição de visita
  const handleEditVisit = (visit) => {
    setEditingVisit(visit);
    // Scroll suave para o topo do formulário
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Função para lidar com sucesso do formulário
  const handleFormSuccess = () => {
    setEditingVisit(null);
    loadVisits();
    // Scroll suave para a tabela
    setTimeout(() => {
      document.getElementById('visits-table')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  // Função para cancelar edição
  const handleCancelEdit = () => {
    setEditingVisit(null);
  };

  // Função para aplicar filtros
  const handleApplyFilters = () => {
    applyFilters(visits);
  };

  // Função para limpar filtros
  const handleClearFilters = () => {
    clearFilters();
  };

  // Obter estatísticas
  const filterStats = getFilterStats(visits);

  // Abrir modal de exportação
  const handleOpenExportModal = () => {
    setIsExportModalOpen(true);
  };

  // Fechar modal de exportação
  const handleCloseExportModal = () => {
    setIsExportModalOpen(false);
  };

  // Abrir modal de importação
  const handleOpenImportModal = () => {
    openImportModal(() => {
      loadVisits(); // Recarregar visitas após importar
    });
  };

  return (
    <div className="space-y-8">
      {/* SEÇÃO 1: Formulário Principal - DESTAQUE MÁXIMO */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        <div className={`p-1 ${editingVisit ? 'bg-gradient-to-r from-blue-50 to-indigo-50' : 'bg-gradient-to-r from-green-50 to-emerald-50'}`}>
          <div className="bg-white rounded-xl p-6 md:p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${editingVisit ? 'bg-blue-100' : 'bg-green-100'}`}>
                  <Plus className={`h-6 w-6 ${editingVisit ? 'text-blue-600' : 'text-green-600'}`} />
                </div>
                <div>
                  <h2 className="text-xl md:text-2xl font-bold text-gray-900">
                    {editingVisit ? 'Editar Visita' : 'Nova Visita'}
                  </h2>
                  <p className="text-gray-600">
                    {editingVisit 
                      ? `Editando visita #${editingVisit.id} - ${editingVisit.prospect}`
                      : 'Preencha os dados abaixo para registrar uma nova visita comercial'
                    }
                  </p>
                </div>
              </div>
              
              {editingVisit && (
                <button
                  onClick={handleCancelEdit}
                  className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="h-4 w-4" />
                  Cancelar Edição
                </button>
              )}
            </div>

            {/* Formulário */}
            <VisitForm
              visit={editingVisit}
              onSuccess={handleFormSuccess}
              onCancel={handleCancelEdit}
              isLoading={isSaving}
            />
          </div>
        </div>
      </div>

      {/* SEÇÃO 2: Filtros Recolhíveis */}
      <CollapsibleFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        onApply={handleApplyFilters}
        onClear={handleClearFilters}
        activeFilters={activeFilters}
        filterStats={filterStats}
        hasActiveFilters={hasActiveFilters}
      />

      {/* SEÇÃO 3: Lista/Consulta */}
      <div id="visits-table" className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-100 rounded-lg">
                <Filter className="h-6 w-6 text-gray-700" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Visitas Registradas</h2>
                <p className="text-gray-600">
                  {isLoading ? (
                    "Carregando..."
                  ) : hasActiveFilters ? (
                    <>
                      Mostrando <span className="font-semibold text-blue-600">{filteredVisits.length}</span> de{' '}
                      <span className="font-semibold">{visits.length}</span> visitas
                      <span className="ml-2 text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                        {Object.keys(activeFilters).length} filtro(s) ativo(s)
                      </span>
                    </>
                  ) : (
                    `Total de ${visits.length} visitas registradas`
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <button
                onClick={handleOpenImportModal}
                className="text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-2"
                title="Importar visitas de arquivo JSON"
              >
                <Upload className="h-4 w-4" />
                Importar
              </button>
              <button
                onClick={handleOpenExportModal}
                className="text-sm text-green-600 hover:text-green-800 hover:bg-green-50 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-2"
                title="Exportar visitas para arquivo JSON"
              >
                <Download className="h-4 w-4" />
                Exportar
              </button>
              <div className="hidden md:block h-6 w-px bg-gray-300"></div>
              {hasActiveFilters && (
                <button
                  onClick={handleClearFilters}
                  className="text-sm text-red-600 hover:text-red-800 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors"
                >
                  Limpar filtros
                </button>
              )}
              <button
                onClick={() => {/* TODO: Implementar refresh */}}
                className="text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 px-3 py-1.5 rounded-lg transition-colors"
              >
                Atualizar lista
              </button>
            </div>
          </div>
        </div>

        {/* Conteúdo da Tabela */}
        <div className="p-1">
          {isLoading ? (
            <div className="p-12 text-center">
              <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-blue-600 border-t-transparent"></div>
              <p className="mt-4 text-gray-600">Carregando visitas...</p>
            </div>
          ) : filteredVisits.length === 0 ? (
            <div className="p-12 text-center">
              <div className="mx-auto w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                <Filter className="h-10 w-10 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                {hasActiveFilters ? "Nenhuma visita encontrada" : "Nenhuma visita registrada"}
              </h3>
              <p className="text-gray-600 max-w-md mx-auto mb-6">
                {hasActiveFilters
                  ? "Tente ajustar os critérios de filtro ou limpe os filtros para ver todas as visitas."
                  : "Comece registrando sua primeira visita usando o formulário acima."}
              </p>
              {hasActiveFilters ? (
                <button
                  onClick={handleClearFilters}
                  className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 shadow-md hover:shadow-lg transition-all"
                >
                  Limpar todos os filtros
                </button>
              ) : (
                <button
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                  className="px-5 py-2.5 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 shadow-md hover:shadow-lg transition-all"
                >
                  Registrar Primeira Visita
                </button>
              )}
            </div>
          ) : (
            <VisitTable 
              visits={filteredVisits} 
              onEdit={handleEditVisit}
              onRefresh={loadVisits}
            />
          )}
        </div>
      </div>

      {/* ExportModal Local */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={handleCloseExportModal}
        visits={filteredVisits}
      />
    </div>
  );
}