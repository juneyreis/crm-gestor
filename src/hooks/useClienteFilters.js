import { useState, useCallback, useEffect } from 'react';

const initialFilters = {
    nome: '', // Busca textual no prospect
    tipo_contrato: '',
    nivel_satisfacao: '',
    cidade: ''
};

export default function useClienteFilters() {
    const [filters, setFilters] = useState(initialFilters);
    const [filteredClientes, setFilteredClientes] = useState([]);
    const [activeFilters, setActiveFilters] = useState({});

    const handleFilterChange = useCallback((key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    }, []);

    const applyFilters = useCallback((clientes) => {
        if (!clientes) return [];

        const newActiveFilters = {};
        const filtered = clientes.filter(cliente => {
            let passes = true;

            // Busca Textual (Nome do Prospect)
            if (filters.nome) {
                newActiveFilters.nome = filters.nome;
                const search = filters.nome.toLowerCase();
                const nomeProspect = cliente.prospects?.nome?.toLowerCase() || '';
                if (!nomeProspect.includes(search)) passes = false;
            }

            // Selects Exatos
            if (filters.tipo_contrato) {
                newActiveFilters.tipo_contrato = filters.tipo_contrato;
                if (cliente.tipo_contrato !== filters.tipo_contrato) passes = false;
            }

            if (filters.nivel_satisfacao) {
                newActiveFilters.nivel_satisfacao = filters.nivel_satisfacao;
                if (cliente.nivel_satisfacao !== filters.nivel_satisfacao) passes = false;
            }

            if (filters.cidade) {
                newActiveFilters.cidade = filters.cidade;
                // Comparação mais solta para cidade (includes)
                if (!cliente.cidade?.toLowerCase().includes(filters.cidade.toLowerCase())) passes = false;
            }

            return passes;
        });

        setFilteredClientes(filtered);
        setActiveFilters(newActiveFilters);
        return filtered;
    }, [filters]);

    const clearFilters = useCallback(() => {
        setFilters(initialFilters);
        setFilteredClientes([]);
        setActiveFilters({});
    }, []);

    const getFilterStats = useCallback((clientes) => {
        if (!clientes) return { total: 0, filtered: 0 };
        return {
            total: clientes.length,
            filtered: filteredClientes.length,
            activeCount: Object.keys(activeFilters).length
        };
    }, [filteredClientes, activeFilters]);

    return {
        filters,
        filteredClientes,
        activeFilters,
        handleFilterChange,
        applyFilters,
        clearFilters,
        getFilterStats,
        hasActiveFilters: Object.keys(activeFilters).length > 0
    };
}
