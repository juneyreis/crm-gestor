// src/components/prospects/ProspectFilters.jsx
import { useState } from 'react';
import { Filter, ChevronDown, ChevronUp, X, Search, MapPin, Building, User, Tag, Briefcase } from 'lucide-react';

export default function ProspectFilters({
    filters,
    onFilterChange,
    onApply,
    onClear,
    activeFilters,
    filterStats,
    hasActiveFilters,
    // Passando listas para os selects
    segmentos = [],
    concorrentes = [],
    vendedores = []
}) {
    const [isExpanded, setIsExpanded] = useState(false);

    const handleInputChange = (key, value) => {
        // Apenas enviar o valor - a conversão para uppercase será feita no servidor se necessário
        // Removida conversão automática que causava problemas
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
                                    onClick={handleClearAll}
                                    className="text-sm font-bold text-red-600 hover:text-red-700 flex items-center gap-1 self-start sm:self-auto"
                                >
                                    <X className="h-4 w-4" />
                                    Limpar Filtros
                                </button>
                            </div>
                            <div className="flex gap-2 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-slate-600">
                                {Object.entries(activeFilters).map(([key, value]) => (
                                    <div
                                        key={key}
                                        className="flex items-center gap-2 bg-blue-50 px-3 py-1.5 rounded-full border border-blue-200 text-sm flex-shrink-0 snap-start"
                                    >
                                        <span className="font-medium text-blue-700 dark:text-blue-400 capitalize">{key}:</span>
                                        <span className="text-gray-700 dark:text-gray-300">{value}</span>
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
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {/* Nome */}
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                                <Building className="h-4 w-4" />
                                Nome / Empresa
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                                    placeholder="Nome"
                                    value={filters.nome || ''}
                                    onChange={(e) => handleInputChange('nome', e.target.value)}
                                />
                                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            </div>
                        </div>

                        {/* Cidade - CAMPO CORRIGIDO */}
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

                        {/* Status */}
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                                <Tag className="h-4 w-4" />
                                Status
                            </label>
                            <select
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                                value={filters.status || ''}
                                onChange={(e) => handleInputChange('status', e.target.value)}
                            >
                                <option value="">Todos</option>
                                {['Novo', 'Em contato', 'Visitado', 'Convertido', 'Perdido', 'Descartado'].map(status => (
                                    <option key={status} value={status}>{status}</option>
                                ))}
                            </select>
                        </div>

                        {/* Classificação */}
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                                <Tag className="h-4 w-4" />
                                Classificação
                            </label>
                            <select
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                                value={filters.classificacao || ''}
                                onChange={(e) => handleInputChange('classificacao', e.target.value)}
                            >
                                <option value="">Todas</option>
                                {['Ice', 'Cold', 'Warm', 'Hot'].map(c => (
                                    <option key={c} value={c}>{c}</option>
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
                                value={filters.vendedor || ''}
                                onChange={(e) => handleInputChange('vendedor', e.target.value)}
                            >
                                <option value="">Todos</option>
                                {vendedores.map(v => (
                                    <option key={v.id} value={v.nome}>{v.nome}</option>
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
                                value={filters.segmento_id || ''} // Assumindo filtro por ID para relacionamentos
                                onChange={(e) => handleInputChange('segmento_id', e.target.value)}
                            >
                                <option value="">Todos</option>
                                {segmentos.map(s => (
                                    <option key={s.id} value={s.id}>{s.descricao}</option>
                                ))}
                            </select>
                        </div>

                        {/* Concorrente */}
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                                <Briefcase className="h-4 w-4" />
                                Concorrente
                            </label>
                            <select
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                                value={filters.concorrente_id || ''}
                                onChange={(e) => handleInputChange('concorrente_id', e.target.value)}
                            >
                                <option value="">Todos</option>
                                {concorrentes.map(c => (
                                    <option key={c.id} value={c.id}>{c.descricao}</option>
                                ))}
                            </select>
                        </div>

                    </div>

                    {/* Botões de Ação */}
                    <div className="mt-8 pt-6 border-t border-gray-200 dark:border-slate-700">
                        <div className="flex flex-wrap items-center justify-between gap-4">
                            <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                                {filterStats && (
                                    <>
                                        <span className="font-medium">{filterStats.filtered || 0}</span> de{' '}
                                        <span className="font-medium">{filterStats.total || 0}</span> prospects serão exibidos
                                    </>
                                )}
                            </div>

                            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                                <button
                                    onClick={() => setIsExpanded(false)}
                                    className="px-5 py-2.5 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg border border-gray-300 dark:border-slate-600 transition-colors"
                                >
                                    Fechar
                                </button>

                                <button
                                    onClick={handleClearAll}
                                    className="px-5 py-2.5 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg border border-gray-300 dark:border-slate-600 transition-colors"
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
