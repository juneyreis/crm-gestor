// src/components/visits/PageHeader.jsx
import { Download, Upload, BarChart3 } from 'lucide-react';
import Button from '../Button';

export default function PageHeader({ 
  title, 
  totalVisits, 
  filteredVisits, 
  hasActiveFilters,
  onNewVisit,
  onExport,
  onImport 
}) {
  return (
    <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-2xl shadow-xl p-6 md:p-8 text-white">
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
        {/* Título e Estatísticas */}
        <div className="flex-1">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">{title}</h1>
          <p className="text-slate-300 mb-6 max-w-2xl">
            Sistema completo para gerenciamento de visitas comerciais com relatórios avançados e controle de métricas.
          </p>
          
          {/* Estatísticas */}
          <div className="flex flex-wrap gap-4">
            <div className="bg-slate-700/50 backdrop-blur-sm rounded-lg p-3 min-w-[140px]">
              <div className="text-sm text-slate-300 mb-1">Total de Visitas</div>
              <div className="text-2xl font-bold">{totalVisits}</div>
            </div>
            
            {hasActiveFilters && (
              <div className="bg-blue-600/20 backdrop-blur-sm rounded-lg p-3 min-w-[140px] border border-blue-500/30">
                <div className="text-sm text-blue-300 mb-1">Visitas Filtradas</div>
                <div className="text-2xl font-bold text-blue-200">{filteredVisits}</div>
              </div>
            )}
            
            <div className="bg-slate-700/50 backdrop-blur-sm rounded-lg p-3 min-w-[140px]">
              <div className="text-sm text-slate-300 mb-1">Taxa de Conversão</div>
              <div className="text-2xl font-bold">18%</div>
            </div>
          </div>
        </div>

        {/* Botões de Ação */}
        <div className="flex flex-col sm:flex-row md:flex-col lg:flex-row gap-3">
          <div className="flex gap-3">
            <Button
              variant="secondary"
              onClick={onExport}
              className="flex items-center gap-2 flex-1"
            >
              <Download className="h-4 w-4" />
              Exportar
            </Button>
            
            <Button
              variant="secondary"
              onClick={onImport}
              className="flex items-center gap-2 flex-1"
            >
              <Upload className="h-4 w-4" />
              Importar
            </Button>
          </div>
        </div>
      </div>

      {/* Ações Rápidas */}
      <div className="mt-8 pt-6 border-t border-slate-700">
        <div className="flex flex-wrap gap-3">
          <button className="flex items-center gap-2 text-sm text-slate-300 hover:text-white px-3 py-2 rounded-lg hover:bg-slate-700/50 transition-colors">
            <BarChart3 className="h-4 w-4" />
            Relatório Mensal
          </button>
          <button className="flex items-center gap-2 text-sm text-slate-300 hover:text-white px-3 py-2 rounded-lg hover:bg-slate-700/50 transition-colors">
            <Download className="h-4 w-4" />
            Exportar CSV
          </button>
          <button className="flex items-center gap-2 text-sm text-slate-300 hover:text-white px-3 py-2 rounded-lg hover:bg-slate-700/50 transition-colors">
            <Upload className="h-4 w-4" />
            Importar JSON
          </button>
        </div>
      </div>
    </div>
  );
}