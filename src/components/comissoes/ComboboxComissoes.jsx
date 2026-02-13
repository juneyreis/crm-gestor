import { useState, useEffect, useRef } from 'react';
import { Search, X, ChevronDown } from 'lucide-react';

/**
 * Componente Combobox especializado para o módulo de Comissões,
 * otimizado para mobile com busca integrada.
 */
export default function ComboboxComissoes({
    options = [],
    value,
    onChange,
    name,
    placeholder = "Selecione uma opção",
    labelPath = (item) => item.nome || item.descricao || String(item),
    error,
    icon: Icon = Search,
    showSearch = true
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedOption, setSelectedOption] = useState(null);
    const containerRef = useRef(null);

    // Fechar ao clicar fora
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false);
                setSearchTerm('');
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Sincronizar valor selecionado
    useEffect(() => {
        if (value && options.length > 0) {
            const option = options.find(o => String(o.id) === String(value));
            setSelectedOption(option || null);
        } else {
            setSelectedOption(null);
        }
    }, [value, options]);

    // Filtragem dinâmica
    const filteredOptions = options.filter(option => {
        const label = labelPath(option).toLowerCase();
        const term = searchTerm.toLowerCase();
        return label.includes(term);
    });

    const handleSelect = (option) => {
        setSelectedOption(option);
        onChange({ target: { name, value: String(option.id) } });
        setIsOpen(false);
        setSearchTerm('');
    };

    const handleClear = () => {
        setSelectedOption(null);
        onChange({ target: { name, value: '' } });
        setSearchTerm('');
        setIsOpen(true);
    };

    return (
        <div ref={containerRef} className="relative w-full">
            {/* Trigger Centralizado */}
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-lg border transition-all duration-200 bg-white dark:bg-slate-700 ${isOpen ? 'ring-2 ring-blue-500 border-blue-500 z-20' :
                    error ? 'border-red-500' : 'border-gray-200 dark:border-slate-600'
                    }`}
            >
                <div className="flex items-center gap-3 truncate">
                    <Icon className={`h-5 w-5 ${selectedOption ? 'text-blue-500' : 'text-gray-400'}`} />
                    <span className={`truncate text-sm font-medium ${selectedOption ? 'text-gray-900 dark:text-white' : 'text-gray-400'}`}>
                        {selectedOption ? labelPath(selectedOption) : placeholder}
                    </span>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                    {selectedOption && (
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleClear();
                            }}
                            className="p-1 hover:bg-gray-100 dark:hover:bg-slate-600 rounded-full transition-colors"
                        >
                            <X className="h-4 w-4 text-gray-400" />
                        </button>
                    )}
                    <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </div>
            </button>

            {/* Menu Suspenso (Popover) */}
            {isOpen && (
                <div className="absolute left-0 right-0 mt-2 bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in duration-200 origin-top">
                    {showSearch && (
                        <div className="p-3 border-b border-gray-50 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-800/50">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Buscar..."
                                    className="w-full pl-10 pr-4 py-2 text-sm bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none dark:text-white"
                                    autoFocus
                                />
                                {searchTerm && (
                                    <button
                                        type="button"
                                        onClick={() => setSearchTerm('')}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
                                    >
                                        <X className="h-3 w-3" />
                                    </button>
                                )}
                            </div>
                        </div>
                    )}

                    <div className="max-h-64 overflow-y-auto p-1 scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-slate-700 font-sans">
                        {filteredOptions.length > 0 ? (
                            filteredOptions.map((option, index) => {
                                const isSelected = String(option.id) === String(value);

                                return (
                                    <button
                                        key={option.id || index}
                                        type="button"
                                        onClick={() => handleSelect(option)}
                                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-colors text-left ${isSelected
                                            ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 font-bold'
                                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700/50'
                                            }`}
                                    >
                                        <span className="truncate">{labelPath(option)}</span>
                                        {isSelected && <Check className="h-4 w-4 flex-shrink-0" />}
                                    </button>
                                );
                            })
                        ) : (
                            <div className="p-4 text-center">
                                <p className="text-sm text-gray-500 italic">Nenhum resultado encontrado</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {error && <p className="text-[10px] uppercase font-bold text-red-500 mt-1 ml-1">{error}</p>}
        </div>
    );
}
