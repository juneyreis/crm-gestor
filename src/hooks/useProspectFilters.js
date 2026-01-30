// src/hooks/useProspectFilters.js
import { useState, useCallback, useEffect } from 'react';

const initialFilters = {
    nome: '',
    cidade: '',
    uf: '',
    bairro: '',
    status: '',
    classificacao: '',
    vendedor: '',
    segmento_id: '',
    concorrente_id: ''
};

export default function useProspectFilters() {
    const [filters, setFilters] = useState(() => {
        try {
            const saved = localStorage.getItem('prospects_filters');
            if (saved) {
                return { ...initialFilters, ...JSON.parse(saved) };
            }
        } catch (error) {
            console.error('Erro ao carregar filtros de prospects:', error);
        }
        return initialFilters;
    });

    const [filteredProspects, setFilteredProspects] = useState([]);
    const [activeFilters, setActiveFilters] = useState({});

    useEffect(() => {
        try {
            localStorage.setItem('prospects_filters', JSON.stringify(filters));
        } catch (error) {
            console.error('Erro ao salvar filtros:', error);
        }
    }, [filters]);

    const handleFilterChange = useCallback((key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    }, []);

    const applyFilters = useCallback((prospects) => {
        if (!prospects || prospects.length === 0) {
            setFilteredProspects([]);
            setActiveFilters({});
            return [];
        }

        const newActiveFilters = {};
        const filtered = prospects.filter(p => {
            let passes = true;

            // Nome
            if (filters.nome) {
                newActiveFilters.nome = filters.nome;
                if (!p.nome || !p.nome.includes(filters.nome)) passes = false;
            }

            // Cidade
            if (filters.cidade) {
                newActiveFilters.cidade = filters.cidade;
                if (!p.cidade || !p.cidade.includes(filters.cidade)) passes = false;
            }

            // UF
            if (filters.uf) {
                newActiveFilters.uf = filters.uf;
                if (p.uf !== filters.uf) passes = false;
            }

            // Bairro
            if (filters.bairro) {
                newActiveFilters.bairro = filters.bairro;
                if (!p.bairro || !p.bairro.includes(filters.bairro)) passes = false;
            }

            // Status
            if (filters.status) {
                newActiveFilters.status = filters.status;
                if (p.status !== filters.status) passes = false;
            }

            // Classificação
            if (filters.classificacao) {
                newActiveFilters.classificacao = filters.classificacao;
                if (p.classificacao !== filters.classificacao) passes = false;
            }

            // Vendedor (Nome)
            if (filters.vendedor) {
                newActiveFilters.vendedor = filters.vendedor;
                if (p.vendedor !== filters.vendedor) passes = false;
            }

            // Segmento (ID)
            if (filters.segmento_id) {
                newActiveFilters.segmento_id = filters.segmento_id;
                // Comparação de ID (pode vir como int ou string do supabse, melhor garantir ==)
                if (String(p.segmento_id) !== String(filters.segmento_id)) passes = false;
            }

            // Concorrente (ID)
            if (filters.concorrente_id) {
                newActiveFilters.concorrente_id = filters.concorrente_id;
                if (String(p.concorrente_id) !== String(filters.concorrente_id)) passes = false;
            }

            return passes;
        });

        setFilteredProspects(filtered);
        setActiveFilters(newActiveFilters);
        return filtered;
    }, [filters]);

    const clearFilters = useCallback(() => {
        setFilters(initialFilters);
        setFilteredProspects([]);
        setActiveFilters({});
    }, []);

    const getFilterStats = useCallback((prospects) => {
        if (!prospects) return { total: 0, filtered: 0 };

        const total = prospects.length;
        const filtered = filteredProspects.length;
        const activeCount = Object.keys(activeFilters).length;

        return {
            total,
            filtered,
            activeCount,
            percentage: total > 0 ? Math.round((filtered / total) * 100) : 0
        };
    }, [filteredProspects, activeFilters]);

    // Função para limpar um filtro específico
    const clearSpecificFilter = useCallback((key) => {
        setFilters(prev => ({ ...prev, [key]: initialFilters[key] }));
    }, []);

    return {
        filters,
        setFilters,
        filteredProspects,
        activeFilters,
        handleFilterChange,
        applyFilters,
        clearFilters,
        clearSpecificFilter,
        getFilterStats,
        hasActiveFilters: Object.keys(activeFilters).length > 0
    };
}
