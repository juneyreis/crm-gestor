import { useState, useEffect, useRef } from 'react';
import { Search, X, User, ChevronDown } from 'lucide-react';

export default function ComboboxCliente({
    clientes = [],
    value,
    onChange,
    placeholder = "Selecione um cliente",
    error
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCliente, setSelectedCliente] = useState(null);
    const containerRef = useRef(null);

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

    useEffect(() => {
        if (value && clientes.length > 0) {
            const cliente = clientes.find(c => c.id === parseInt(value));
            setSelectedCliente(cliente || null);
        } else {
            setSelectedCliente(null);
        }
    }, [value, clientes]);

    const filteredClientes = clientes.filter(cliente => {
        const nome = cliente.prospects?.nome?.toLowerCase() || '';
        const term = searchTerm.toLowerCase();
        return nome.includes(term);
    });

    const handleSelectCliente = (cliente) => {
        setSelectedCliente(cliente);
        onChange({ target: { name: 'cliente_id', value: String(cliente.id) } });
        setIsOpen(false);
        setSearchTerm('');
    };

    const handleClear = () => {
        setSelectedCliente(null);
        onChange({ target: { name: 'cliente_id', value: '' } });
        setSearchTerm('');
        setIsOpen(true);
    };

    const getClienteDisplayName = (cliente) => {
        return cliente.prospects?.nome || 'Cliente sem nome';
    };

    return (
        <div ref={containerRef} className="relative w-full">
            {!isOpen && selectedCliente ? (
                <div
                    onClick={() => setIsOpen(true)}
                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white flex items-center cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-600 transition-colors"
                >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                        <User className="h-4 w-4 text-gray-400 flex-shrink-0" />
                        <span className="text-sm text-gray-900 dark:text-white truncate text-left">
                            {getClienteDisplayName(selectedCliente)}
                        </span>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                handleClear();
                            }}
                            className="p-1 hover:bg-gray-200 dark:hover:bg-slate-600 rounded-full"
                        >
                            <X className="h-4 w-4 text-gray-400" />
                        </button>
                        <ChevronDown className="h-4 w-4 text-gray-400" />
                    </div>
                </div>
            ) : !isOpen && !selectedCliente ? (
                <div
                    onClick={() => setIsOpen(true)}
                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-500 dark:text-gray-400 flex items-center cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-600 transition-colors"
                >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                        <User className="h-4 w-4 text-gray-400 flex-shrink-0" />
                        <span className="text-sm text-gray-500 dark:text-gray-400 truncate text-left">
                            {placeholder}
                        </span>
                    </div>
                    <ChevronDown className="h-4 w-4 text-gray-400 flex-shrink-0 ml-2" />
                </div>
            ) : (
                <div className="w-full border border-gray-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 shadow-lg overflow-hidden">
                    <div className="relative border-b border-gray-200 dark:border-slate-600">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Buscar cliente por nome..."
                            className="w-full pl-10 pr-9 py-2 text-sm bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-t-lg"
                            autoFocus
                        />
                        {searchTerm && (
                            <button
                                onClick={() => setSearchTerm('')}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-200 dark:hover:bg-slate-600 rounded-full"
                            >
                                <X className="h-3.5 w-3.5 text-gray-400" />
                            </button>
                        )}
                    </div>

                    <div className="max-h-72 overflow-y-auto">
                        {filteredClientes.length > 0 ? (
                            filteredClientes.map((cliente) => (
                                <button
                                    key={cliente.id}
                                    onClick={() => handleSelectCliente(cliente)}
                                    className="w-full px-4 py-2.5 text-left hover:bg-gray-50 dark:hover:bg-slate-600 transition-colors flex items-center gap-3 border-b border-gray-100 dark:border-slate-600 last:border-0"
                                >
                                    <User className="h-4 w-4 text-gray-400 flex-shrink-0" />
                                    <span className="text-sm text-gray-900 dark:text-white truncate">
                                        {getClienteDisplayName(cliente)}
                                    </span>
                                </button>
                            ))
                        ) : (
                            <div className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                                {searchTerm ? (
                                    <p className="text-sm">Nenhum cliente encontrado para "{searchTerm}"</p>
                                ) : (
                                    <p className="text-sm">Digite para refinar a busca</p>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}
            
            {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
        </div>
    );
}