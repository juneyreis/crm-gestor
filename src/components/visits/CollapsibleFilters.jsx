// src/components/visits/CollapsibleFilters.jsx - MODERNIZADO
import { useState, useEffect } from 'react';
import { Filter, ChevronDown, ChevronUp, X, Search, Calendar, MapPin, Building, AlertTriangle, Clock, CheckCircle, FileText } from 'lucide-react';
import { cidades } from '../../data/cidades';
import * as visitasService from '../../services/visitasService';
import useAuth from '../../hooks/useAuth';

export default function CollapsibleFilters({
  filters,
  onFilterChange,
  onApply,
  onClear,
  activeFilters,
  filterStats,
  hasActiveFilters
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [concorrentes, setConcorrentes] = useState([]);
  const [prospects, setProspects] = useState([]);
  const { user } = useAuth();

  // Carregar dados auxiliares
  useEffect(() => {
    const loadData = async () => {
      try {
        const [concorrentesData, prospectsData] = await Promise.all([
          visitasService.buscarConcorrentes(),
          user?.id ? visitasService.buscarProspects(user.id) : []
        ]);
        setConcorrentes(concorrentesData || []);
        setProspects(prospectsData || []);
      } catch (error) {
        console.error('Erro ao carregar filtros:', error);
      }
    };
    loadData();
  }, [user?.id]);

  const handleInputChange = (key, value) => {
    onFilterChange(key, value);
  };

  const handleClearFilter = (key) => {
    onFilterChange(key, '');
  };

  const handleApplyAndCollapse = () => {
    onApply();
    setIsExpanded(false);
  };

  const handleClearAll = () => {
    onClear();
    setIsExpanded(false);
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
      {/* Header do Acordeão */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-5 flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3 active:scale-95 transition-transform">
          <div className={`p-2 rounded-lg ${hasActiveFilters ? 'bg-blue-100' : 'bg-gray-100'}`}>
            <Filter className={`h-5 w-5 ${hasActiveFilters ? 'text-blue-600' : 'text-gray-600'}`} />
          </div>
          <div className="text-left">
            <h3 className="font-semibold text-gray-900">Filtros Avançados</h3>
            <p className="text-sm text-gray-600">
              {hasActiveFilters
                ? `${Object.keys(activeFilters).length} filtro(s) ativo(s)`
                : 'Clique para expandir e aplicar filtros'
              }
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {hasActiveFilters && (
            <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
              <Filter className="h-3 w-3" />
              {Object.keys(activeFilters).length} ativo(s)
            </div>
          )}
          {isExpanded ? <ChevronUp className="h-5 w-5 text-gray-500" /> : <ChevronDown className="h-5 w-5 text-gray-500" />}
        </div>
      </button>

      {/* Conteúdo Expandido */}
      {isExpanded && (
        <div className="border-t border-gray-200 p-6 animate-fade-in relative">

          {/* Grid de Filtros */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">

            {/* Prospect (Combobox) */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <Building className="h-4 w-4" /> Prospect
              </label>
              <select
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                value={filters.prospectId || ''}
                onChange={(e) => handleInputChange('prospectId', e.target.value)}
              >
                <option value="">Todos os prospects</option>
                {prospects.map(p => (
                  <option key={p.id} value={p.id}>{p.nome}</option>
                ))}
              </select>
            </div>

            {/* Cidade */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <MapPin className="h-4 w-4" /> Cidade
              </label>
              <select
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                value={filters.cidade || ''}
                onChange={(e) => handleInputChange('cidade', e.target.value)}
              >
                <option value="">Todas as cidades</option>
                {cidades.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* Status */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <CheckCircle className="h-4 w-4" /> Status
              </label>
              <select
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                value={filters.status || ''}
                onChange={(e) => handleInputChange('status', e.target.value)}
              >
                <option value="">Todos os status</option>
                <option value="Agendada">Agendada</option>
                <option value="Realizada">Realizada</option>
                <option value="Cancelada">Cancelada</option>
                <option value="Atrasada">Atrasada</option>
              </select>
            </div>

            {/* Prioridade */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <AlertTriangle className="h-4 w-4" /> Prioridade
              </label>
              <select
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                value={filters.prioridade || ''}
                onChange={(e) => handleInputChange('prioridade', e.target.value)}
              >
                <option value="">Todas as prioridades</option>
                <option value="Baixa">Baixa</option>
                <option value="Média">Média</option>
                <option value="Alta">Alta</option>
              </select>
            </div>

            {/* Tipo */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <FileText className="h-4 w-4" /> Tipo de Visita
              </label>
              <select
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                value={filters.tipo || ''}
                onChange={(e) => handleInputChange('tipo', e.target.value)}
              >
                <option value="">Todos os tipos</option>
                <option value="Sondagem">Sondagem</option>
                <option value="Apresentação">Apresentação</option>
                <option value="Prosseguimento">Prosseguimento</option>
                <option value="Demonstração">Demonstração</option>
                <option value="Negociação">Negociação</option>
              </select>
            </div>

            {/* Turno */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <Clock className="h-4 w-4" /> Turno
              </label>
              <select
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                value={filters.turno || ''}
                onChange={(e) => handleInputChange('turno', e.target.value)}
              >
                <option value="">Todos os turnos</option>
                <option value="Manhã">Manhã</option>
                <option value="Tarde">Tarde</option>
                <option value="Noite">Noite</option>
              </select>
            </div>

            {/* Concorrente */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <FileText className="h-4 w-4" /> Concorrente
              </label>
              <select
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                value={filters.concorrenteId || ''}
                onChange={(e) => handleInputChange('concorrenteId', e.target.value)}
              >
                <option value="">Todos os concorrentes</option>
                {concorrentes.map(c => (
                  <option key={c.id} value={c.id}>{c.descricao}</option>
                ))}
              </select>
            </div>

            {/* Periodo da Visita */}
            <div className="space-y-2 col-span-1 md:col-span-2 lg:col-span-1">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <Calendar className="h-4 w-4" /> Período
              </label>
              <div className="flex gap-2">
                <input
                  type="date"
                  className="w-1/2 px-3 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={filters.dataInicio || ''}
                  onChange={(e) => handleInputChange('dataInicio', e.target.value)}
                  placeholder="Início"
                />
                <input
                  type="date"
                  className="w-1/2 px-3 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={filters.dataFim || ''}
                  onChange={(e) => handleInputChange('dataFim', e.target.value)}
                  placeholder="Fim"
                />
              </div>
            </div>

          </div>

          {/* Botões de Ação */}
          <div className="mt-8 pt-6 border-t border-gray-200 flex flex-wrap items-center justify-between gap-4">
            <div className="text-sm text-gray-600">
              {filterStats && (
                <>
                  <span className="font-medium">{filterStats.filtered || 0}</span> resultados encontrados
                </>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleClearAll}
                className="px-5 py-2.5 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg border border-gray-300 transition-colors"
              >
                Limpar Filtros
              </button>

              <button
                onClick={handleApplyAndCollapse}
                className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-md hover:shadow-lg transition-all flex items-center gap-2"
              >
                <Search className="h-4 w-4" />
                Aplicar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}