import { useState, useCallback } from 'react';

const initialFilters = {
    cliente: '', // Busca textual no nome do prospect/cliente
    vendedor: '',
    status: '',
    vigencia: '' // MM/YYYY
};

export default function useComissaoFilters() {
    const [filters, setFilters] = useState(initialFilters);
    const [filteredComissoes, setFilteredComissoes] = useState([]);
    const [activeFilters, setActiveFilters] = useState({});

    const handleFilterChange = useCallback((key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    }, []);

    const applyFilters = useCallback((comissoes) => {
        if (!comissoes) return [];

        const newActiveFilters = {};
        const filtered = comissoes.filter(comissao => {
            let passes = true;

            // Busca por Cliente (nome do prospect)
            if (filters.cliente) {
                newActiveFilters.cliente = filters.cliente;
                const search = filters.cliente.toLowerCase();

                // Helper para extrair nome do cliente de forma robusta
                const cliente = Array.isArray(comissao.clientes) ? comissao.clientes[0] : comissao.clientes;
                const prospect = Array.isArray(cliente?.prospects) ? cliente.prospects[0] : cliente?.prospects;
                const nomeCliente = prospect?.nome?.toLowerCase() || '';

                if (!nomeCliente.includes(search)) passes = false;
            }

            // Filtro por Vendedor
            if (filters.vendedor) {
                newActiveFilters.vendedor = filters.vendedor;
                const vendedor = Array.isArray(comissao.vendedores) ? comissao.vendedores[0] : comissao.vendedores;
                if (String(vendedor?.id) !== String(filters.vendedor)) passes = false;
            }

            // Filtro por Status
            if (filters.status) {
                newActiveFilters.status = filters.status;
                if (comissao.status !== filters.status) passes = false;
            }

            // Filtro por Vigência
            if (filters.vigencia) {
                newActiveFilters.vigencia = filters.vigencia;
                if (comissao.vigencia !== filters.vigencia) passes = false;
            }

            return passes;
        });

        setFilteredComissoes(filtered);
        setActiveFilters(newActiveFilters);
        return filtered;
    }, [filters]);

    const clearFilters = useCallback(() => {
        setFilters(initialFilters);
        setFilteredComissoes([]);
        setActiveFilters({});
    }, []);

    return {
        filters,
        filteredComissoes,
        activeFilters,
        handleFilterChange,
        applyFilters,
        clearFilters,
        hasActiveFilters: Object.keys(activeFilters).length > 0
    };
}
