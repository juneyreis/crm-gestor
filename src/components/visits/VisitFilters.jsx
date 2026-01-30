// src/components/visits/VisitFilters.jsx
import { Filter, Calendar, MapPin, Building, Navigation, X, Search } from 'lucide-react';
import { cidades } from '../../data/cidades';
import { concorrentes } from '../../data/concorrentes';
import { regimes } from '../../data/regimes';

export default function VisitFilters({
  filters,
  onFilterChange,
  onApply,
  onClear,
  activeFilters,
  filterStats
}) {

  // Função para obter data há 30 dias no formato YYYY-MM-DD
  const getDateThirtyDaysAgo = () => {
    const now = new Date();
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(now.getDate() - 30);
    const localDate = new Date(thirtyDaysAgo.getTime() - (thirtyDaysAgo.getTimezoneOffset() * 60000));
    return localDate.toISOString().split('T')[0];
  };

  // Função para obter data atual no formato YYYY-MM-DD
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

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-100 p-6 mb-6 shadow-sm">
      {/* Cabeçalho com estatísticas */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Filter className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800">Filtros Avançados</h3>
            <p className="text-sm text-gray-600">
              {filterStats?.activeCount || 0} filtro(s) ativo(s) •
              Mostrando {filterStats?.filtered || 0} de {filterStats?.total || 0} visitas
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={onApply}
            className="px-5 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 flex items-center gap-2 shadow-md hover:shadow-lg transition-all"
          >
            <Filter className="h-4 w-4" />
            Aplicar Filtros
          </button>

          <button
            onClick={onClear}
            className="px-5 py-2 bg-gradient-to-r from-gray-200 to-gray-300 text-gray-800 rounded-lg hover:from-gray-300 hover:to-gray-400 flex items-center gap-2 border border-gray-300"
          >
            <X className="h-4 w-4" />
            Limpar
          </button>
        </div>
      </div>

      {/* Filtros ativos (chips) */}
      {activeFilters && Object.keys(activeFilters).length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          {Object.entries(activeFilters).map(([key, value]) => (
            <div
              key={key}
              className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full border border-blue-200 text-sm"
            >
              <span className="font-medium text-blue-700 capitalize">{key}:</span>
              <span className="text-gray-700">{value}</span>
              <button
                onClick={() => onFilterChange(key, '')}
                className="text-gray-400 hover:text-gray-600 ml-1"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Grid de filtros */}
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
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              value={filters.dataInicio || getDateThirtyDaysAgo()}
              onChange={(e) => handleInputChange('dataInicio', e.target.value)}
            />
            {filters.dataInicio && (
              <button
                onClick={() => handleInputChange('dataInicio', '')}
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
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              value={filters.dataFim || getTodayDate()}
              onChange={(e) => handleInputChange('dataFim', e.target.value)}
            />
            {filters.dataFim && (
              <button
                onClick={() => handleInputChange('dataFim', '')}
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
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white appearance-none"
              value={filters.cidade}
              onChange={(e) => handleInputChange('cidade', e.target.value)}
            >
              <option value="">Todas as cidades</option>
              {cidades.map(cidade => (
                <option key={cidade} value={cidade}>{cidade}</option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
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
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white uppercase"
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
            <Navigation className="h-4 w-4" />
            Endereço
          </label>
          <div className="relative">
            <input
              type="text"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white uppercase"
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
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white uppercase"
              placeholder="FILTRAR POR BAIRRO"
              value={filters.bairro}
              onChange={(e) => handleInputChange('bairro', e.target.value)}
            />
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          </div>
        </div>

        {/* Sistema */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <Building className="h-4 w-4" />
            Concorrente
          </label>
          <div className="relative">
            <select
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white appearance-none"
              value={filters.sistema}
              onChange={(e) => handleInputChange('sistema', e.target.value)}
            >
              <option value="">Todos os concorrentes</option>
              {concorrentes.map(concorrente => (
                <option key={concorrente} value={concorrente}>{concorrente}</option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        {/* Regime */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <Building className="h-4 w-4" />
            Regime Fiscal
          </label>
          <div className="relative">
            <select
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white appearance-none"
              value={filters.regime}
              onChange={(e) => handleInputChange('regime', e.target.value)}
            >
              <option value="">Todos os regimes</option>
              {regimes.map(regime => (
                <option key={regime} value={regime}>{regime}</option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        {/* Campo extra para garantir 3 colunas */}
        <div className="md:col-span-2 lg:col-span-1 flex items-end">
          <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 w-full">
            <p className="text-sm text-blue-700 font-medium">
              <span className="inline-block w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
              Dica: Use filtros combinados para resultados mais precisos
            </p>
          </div>
        </div>
      </div>

      {/* Informações de estatísticas */}
      {filterStats && (
        <div className="mt-6 pt-4 border-t border-blue-100">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{filterStats.total || 0}</div>
              <div className="text-sm text-gray-600">Total de Visitas</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{filterStats.filtered || 0}</div>
              <div className="text-sm text-gray-600">Visitas Filtradas</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{filterStats.activeCount || 0}</div>
              <div className="text-sm text-gray-600">Filtros Ativos</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{filterStats.percentage || 0}%</div>
              <div className="text-sm text-gray-600">Resultado do Filtro</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}