// src/hooks/useFilters.js - ATUALIZADO
import { useState, useCallback, useEffect } from 'react';

const initialFilters = {
  dataInicio: '',
  dataFim: '',
  cidade: '',
  prospect: '',
  endereco: '',
  bairro: '',
  sistema: '',
  regime: '',
};

export default function useFilters() {
  const [filters, setFilters] = useState(() => {
    // Tentar carregar do localStorage
    try {
      const saved = localStorage.getItem('visits_filters');
      if (saved) {
        return { ...initialFilters, ...JSON.parse(saved) };
      }
    } catch (error) {
      console.error('Erro ao carregar filtros:', error);
    }
    return initialFilters;
  });
  
  const [filteredVisits, setFilteredVisits] = useState([]);
  const [activeFilters, setActiveFilters] = useState({});

  // Salvar filtros no localStorage quando mudarem
  useEffect(() => {
    try {
      localStorage.setItem('visits_filters', JSON.stringify(filters));
    } catch (error) {
      console.error('Erro ao salvar filtros:', error);
    }
  }, [filters]);

  const handleFilterChange = useCallback((key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  const applyFilters = useCallback((visits) => {
    if (!visits || visits.length === 0) {
      setFilteredVisits([]);
      setActiveFilters({});
      return [];
    }

    const newActiveFilters = {};
    const filtered = visits.filter(visit => {
      let passes = true;

      // Filtro por data início
      if (filters.dataInicio) {
        newActiveFilters.dataInicio = filters.dataInicio;
        if (visit.data < filters.dataInicio) passes = false;
      }

      // Filtro por data fim
      if (filters.dataFim) {
        newActiveFilters.dataFim = filters.dataFim;
        if (visit.data > filters.dataFim) passes = false;
      }

      // Filtro por cidade
      if (filters.cidade) {
        newActiveFilters.cidade = filters.cidade;
        if (filters.cidade === 'OUTRA') {
          if (!visit.cidade || !visit.cidade.startsWith('OUTRA:')) passes = false;
        } else if (visit.cidade !== filters.cidade && (!visit.cidade || !visit.cidade.startsWith('OUTRA:'))) {
          passes = false;
        }
      }

      // Filtro por prospect (case insensitive)
      if (filters.prospect) {
        newActiveFilters.prospect = filters.prospect;
        if (!visit.prospect || !visit.prospect.toUpperCase().includes(filters.prospect.toUpperCase())) {
          passes = false;
        }
      }

      // Filtro por endereço (case insensitive)
      if (filters.endereco) {
        newActiveFilters.endereco = filters.endereco;
        if (!visit.endereco || !visit.endereco.toUpperCase().includes(filters.endereco.toUpperCase())) {
          passes = false;
        }
      }

      // Filtro por bairro (case insensitive)
      if (filters.bairro) {
        newActiveFilters.bairro = filters.bairro;
        if (!visit.bairro || !visit.bairro.toUpperCase().includes(filters.bairro.toUpperCase())) {
          passes = false;
        }
      }

      // Filtro por sistema
      if (filters.sistema) {
        newActiveFilters.sistema = filters.sistema;
        if (filters.sistema === 'OUTROS') {
          if (!visit.sistema || !visit.sistema.startsWith('OUTROS:')) passes = false;
        } else if (visit.sistema !== filters.sistema && (!visit.sistema || !visit.sistema.startsWith('OUTROS:'))) {
          passes = false;
        }
      }

      // Filtro por regime
      if (filters.regime) {
        newActiveFilters.regime = filters.regime;
        if (visit.regime !== filters.regime) {
          passes = false;
        }
      }

      return passes;
    });

    setFilteredVisits(filtered);
    setActiveFilters(newActiveFilters);
    return filtered;
  }, [filters]);

  const clearFilters = useCallback(() => {
    setFilters(initialFilters);
    setFilteredVisits([]);
    setActiveFilters({});
  }, []);

  const getFilterStats = useCallback((visits) => {
    if (!visits) return { total: 0, filtered: 0 };
    
    const total = visits.length;
    const filtered = filteredVisits.length;
    const activeCount = Object.keys(activeFilters).length;
    
    return {
      total,
      filtered,
      activeCount,
      percentage: total > 0 ? Math.round((filtered / total) * 100) : 0
    };
  }, [filteredVisits, activeFilters]);

  // Função para limpar um filtro específico
  const clearSpecificFilter = useCallback((key) => {
    setFilters(prev => ({ ...prev, [key]: initialFilters[key] }));
  }, []);

  return {
    filters,
    setFilters,
    filteredVisits,
    activeFilters,
    handleFilterChange,
    applyFilters,
    clearFilters,
    clearSpecificFilter,
    getFilterStats,
    hasActiveFilters: Object.keys(activeFilters).length > 0
  };
}