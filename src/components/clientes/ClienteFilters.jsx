// src/components/clientes/ClienteFilters.jsx
import { useState } from 'react';
import { Filter, ChevronDown, ChevronUp, X, Search, MapPin, Building, User, Briefcase } from 'lucide-react';

export default function ClienteFilters({
    filters,
    onFilterChange,
    onClear,
    segmentos = [],
    vendedores = []
}) {
    const [isExpanded, setIsExpanded] = useState(false);

    const handleInputChange = (key, value) => {
        onFilterChange(key, value);
    };

    // Calcular filtros ativos para exibição (logica local simples já que o pai não passa)
    const activeFilters = Object.entries(filters).reduce((acc, [key, value]) => {
        if (value) acc[key] = value;
        return acc;
    }, {});

    const hasActiveFilters = Object.keys(activeFilters).length > 0;

    return (
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-gray-200 dark:border-slate-700 overflow-hidden mb-8">
            {/* Header do Acordeão */}
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full p-5 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors"
            >
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${hasActiveFilters ? 'bg-blue-100' : 'bg-gray-100'}`}>
                        <Filter className={`h-5 w-5 ${hasActiveFilters ? 'text-blue-600' : 'text-gray-600'}`} />
                    </div>
                    <div className="text-left">
                        <h3 className="font-semibold text-gray-900 dark:text-white">Filtros Avançados</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
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
                <div className="border-t border-gray-200 dark:border-slate-700 p-6 animate-fade-in">
                    {/* Chips de Filtros Ativos */}
                    {hasActiveFilters && (
                        <div className="mb-6">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Filtros Ativos:</span>
                                <button
                                    onClick={onClear}
                                    className="text-sm font-bold text-red-600 hover:text-red-700 flex items-center gap-1 self-start sm:self-auto"
                                >
                                    <X className="h-4 w-4" />
                                    Limpar Filtros
                                </button>
                            </div>
                            <div className="flex gap-2 overflow-x-auto pb-2">
                                {Object.entries(activeFilters).map(([key, value]) => (
                                    <div
                                        key={key}
                                        className="flex items-center gap-2 bg-blue-50 px-3 py-1.5 rounded-full border border-blue-200 text-sm flex-shrink-0"
                                    >
                                        <span className="font-medium text-blue-700 dark:text-blue-400 capitalize">{key.replace('_id', '')}:</span>
                                        <span className="text-gray-700 dark:text-gray-300">
                                            {/* Tentativa de mostrar nome amigável se for ID */}
                                            {key === 'segmento_id'
                                                ? segmentos.find(s => s.id === parseInt(value))?.descricao || value
                                                : key === 'vendedor_id'
                                                    ? vendedores.find(v => v.id === parseInt(value))?.nome || value
                                                    : value
                                            }
                                        </span>
                                        <button
                                            onClick={() => handleInputChange(key, '')}
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
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {/* Nome */}
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                                <Building className="h-4 w-4" />
                                Nome / Cliente
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                                    placeholder="Nome do cliente"
                                    value={filters.nome || ''}
                                    onChange={(e) => handleInputChange('nome', e.target.value)}
                                />
                                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            </div>
                        </div>

                        {/* Cidade */}
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                                <MapPin className="h-4 w-4" />
                                Cidade
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                                    placeholder="Filtrar cidade..."
                                    value={filters.cidade || ''}
                                    onChange={(e) => handleInputChange('cidade', e.target.value)}
                                />
                                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            </div>
                        </div>

                        {/* UF */}
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                                <MapPin className="h-4 w-4" />
                                UF
                            </label>
                            <select
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                                value={filters.uf || ''}
                                onChange={(e) => handleInputChange('uf', e.target.value)}
                            >
                                <option value="">Todas</option>
                                {['AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'].map(uf => (
                                    <option key={uf} value={uf}>{uf}</option>
                                ))}
                            </select>
                        </div>

                        {/* Vendedor */}
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                                <User className="h-4 w-4" />
                                Vendedor
                            </label>
                            <select
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                                value={filters.vendedor_id || ''}
                                onChange={(e) => handleInputChange('vendedor_id', e.target.value)}
                            >
                                <option value="">Todos</option>
                                {vendedores.map(v => (
                                    <option key={v.id} value={v.id}>{v.nome}</option>
                                ))}
                            </select>
                        </div>

                        {/* Segmento */}
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                                <Briefcase className="h-4 w-4" />
                                Segmento
                            </label>
                            <select
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                                value={filters.segmento_id || ''}
                                onChange={(e) => handleInputChange('segmento_id', e.target.value)}
                            >
                                <option value="">Todos</option>
                                {segmentos.map(s => (
                                    <option key={s.id} value={s.id}>{s.descricao}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Botões de Ação */}
                    <div className="mt-8 pt-6 border-t border-gray-200 dark:border-slate-700">
                        <div className="flex flex-wrap items-center justify-end gap-4">
                            <button
                                onClick={() => setIsExpanded(false)}
                                className="px-5 py-2.5 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg border border-gray-300 dark:border-slate-600 transition-colors"
                            >
                                Fechar
                            </button>

                            <button
                                onClick={onClear}
                                className="px-5 py-2.5 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg border border-gray-300 dark:border-slate-600 transition-colors"
                            >
                                Limpar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
