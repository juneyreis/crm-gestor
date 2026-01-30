// src/components/visits/CollapsibleFilters.jsx
import { useState } from 'react';
import { Filter, ChevronDown, ChevronUp, X, Search, Calendar, MapPin, Building } from 'lucide-react';
import { cidades } from '../../data/cidades';
import { concorrentes } from '../../data/concorrentes';
import { regimes } from '../../data/regimes';

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

  // Funções auxiliares para datas
  const getDateThirtyDaysAgo = () => {
    const now = new Date();
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(now.getDate() - 30);
    const localDate = new Date(thirtyDaysAgo.getTime() - (thirtyDaysAgo.getTimezoneOffset() * 60000));
    return localDate.toISOString().split('T')[0];
  };

  const getTodayDate = () => {
    const now = new Date();
    const localDate = new Date(now.getTime() - (now.getTimezoneOffset() * 60000));
    return localDate.toISOString().split('T')[0];
  };

  const handleInputChange = (key, value) => {
    if (key === 'prospect' || key === 'endereco' || key === 'bairro') {
      onFilterChange(key, value.toUpperCase());
    } else {
      onFilterChange(key, value);
    }
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
        <div className="flex items-center gap-3">
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
            <div className="flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
              <Filter className="h-3 w-3" />
              {Object.keys(activeFilters).length} ativo(s)
            </div>
          )}

          {isExpanded ? (
            <ChevronUp className="h-5 w-5 text-gray-500" />
          ) : (
            <ChevronDown className="h-5 w-5 text-gray-500" />
          )}
        </div>
      </button>

      {/* Conteúdo Expandido */}
      {isExpanded && (
        <div className="border-t border-gray-200 p-6 animate-fade-in">
          {/* Chips de Filtros Ativos */}
          {hasActiveFilters && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-gray-700">Filtros Ativos:</span>
                <button
                  onClick={handleClearAll}
                  className="text-sm text-red-600 hover:text-red-800 flex items-center gap-1"
                >
                  <X className="h-3 w-3" />
                  Limpar todos
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {Object.entries(activeFilters).map(([key, value]) => (
                  <div
                    key={key}
                    className="flex items-center gap-2 bg-blue-50 px-3 py-1.5 rounded-full border border-blue-200 text-sm"
                  >
                    <span className="font-medium text-blue-700 capitalize">
                      {key === 'dataInicio' ? 'Data Início' :
                        key === 'dataFim' ? 'Data Fim' :
                          key === 'endereco' ? 'Endereço' :
                            key === 'sistema' ? 'Concorrente' : key}:
                    </span>
                    <span className="text-gray-700">{value}</span>
                    <button
                      onClick={() => handleClearFilter(key)}
                      className="text-blue-400 hover:text-blue-600 ml-1"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Grid de Filtros */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Data Início */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <Calendar className="h-4 w-4" />
                Data Início
              </label>
              <div className="relative">
                <input
                  type="date"
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                  value={filters.dataInicio || getDateThirtyDaysAgo()}
                  onChange={(e) => handleInputChange('dataInicio', e.target.value)}
                />
                {filters.dataInicio && (
                  <button
                    onClick={() => handleClearFilter('dataInicio')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Data Fim */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <Calendar className="h-4 w-4" />
                Data Fim
              </label>
              <div className="relative">
                <input
                  type="date"
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                  value={filters.dataFim || getTodayDate()}
                  onChange={(e) => handleInputChange('dataFim', e.target.value)}
                />
                {filters.dataFim && (
                  <button
                    onClick={() => handleClearFilter('dataFim')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Cidade */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <MapPin className="h-4 w-4" />
                Cidade
              </label>
              <div className="relative">
                <select
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white appearance-none"
                  value={filters.cidade}
                  onChange={(e) => handleInputChange('cidade', e.target.value)}
                >
                  <option value="">Todas as cidades</option>
                  {cidades.map(cidade => (
                    <option key={cidade} value={cidade}>{cidade}</option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                  <ChevronDown className="h-4 w-4" />
                </div>
              </div>
            </div>

            {/* Prospect */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <Building className="h-4 w-4" />
                Prospect
              </label>
              <div className="relative">
                <input
                  type="text"
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white uppercase"
                  placeholder="FILTRAR POR NOME"
                  value={filters.prospect}
                  onChange={(e) => handleInputChange('prospect', e.target.value)}
                />
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>
            </div>

            {/* Endereço */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <MapPin className="h-4 w-4" />
                Endereço
              </label>
              <div className="relative">
                <input
                  type="text"
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white uppercase"
                  placeholder="FILTRAR POR ENDEREÇO"
                  value={filters.endereco}
                  onChange={(e) => handleInputChange('endereco', e.target.value)}
                />
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>
            </div>

            {/* Bairro */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <MapPin className="h-4 w-4" />
                Bairro
              </label>
              <div className="relative">
                <input
                  type="text"
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white uppercase"
                  placeholder="FILTRAR POR BAIRRO"
                  value={filters.bairro}
                  onChange={(e) => handleInputChange('bairro', e.target.value)}
                />
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>
            </div>
          </div>

          {/* Botões de Ação */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="text-sm text-gray-600">
                {filterStats && (
                  <>
                    <span className="font-medium">{filterStats.filtered || 0}</span> de{' '}
                    <span className="font-medium">{filterStats.total || 0}</span> visitas serão exibidas
                  </>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setIsExpanded(false)}
                  className="px-5 py-2.5 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg border border-gray-300 transition-colors"
                >
                  Fechar
                </button>

                <button
                  onClick={handleClearAll}
                  className="px-5 py-2.5 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg border border-gray-300 transition-colors"
                >
                  Limpar
                </button>

                <button
                  onClick={handleApplyAndCollapse}
                  className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 shadow-md hover:shadow-lg transition-all"
                >
                  Aplicar Filtros
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}