// src/hooks/useFilters.js - MODERNIZADO
import { useState, useCallback, useEffect } from 'react';

const initialFilters = {
  dataInicio: '',
  dataFim: '',
  cidade: '',
  prospectId: '',
  prospect: '',   // Novo: busca por texto (nome)
  tipo: '',
  turno: '',
  status: '',
  prioridade: '',
  concorrenteId: '',
  endereco: '',
  bairro: ''
};

export default function useFilters() {
  const [filters, setFilters] = useState(() => {
    try {
      const saved = localStorage.getItem('visits_filters_v2'); // Versão atualizada
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

  useEffect(() => {
    try {
      localStorage.setItem('visits_filters_v2', JSON.stringify(filters));
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

      // Filtro por Prospect (ID)
      if (filters.prospectId) {
        newActiveFilters.prospectId = filters.prospectId;
        if (String(visit.prospect_id) !== String(filters.prospectId)) passes = false;
      }

      // Filtro por Prospect (Texto/Nome) - BUSCA FLUIDA
      if (filters.prospect) {
        newActiveFilters.prospect = filters.prospect;
        const nomeProspect = (visit.prospect_nome || visit.prospect || '').toLowerCase();
        if (!nomeProspect.includes(filters.prospect.toLowerCase())) passes = false;
      }

      // Filtro por Concorrente (ID)
      if (filters.concorrenteId) {
        newActiveFilters.concorrenteId = filters.concorrenteId;
        if (String(visit.concorrente_id) !== String(filters.concorrenteId)) passes = false;
      }

      // Novos Filtros (Exact Match)
      ['tipo', 'turno', 'status', 'prioridade'].forEach(field => {
        if (filters[field]) {
          newActiveFilters[field] = filters[field];
          if (visit[field] !== filters[field]) passes = false;
        }
      });

      // Cidade - Busca fluida (includes)
      if (filters.cidade) {
        newActiveFilters.cidade = filters.cidade;
        const cidade = (visit.cidade || '').toLowerCase();
        if (!cidade.includes(filters.cidade.toLowerCase())) passes = false;
      }

      // Data Range
      if (filters.dataInicio) {
        newActiveFilters.dataInicio = filters.dataInicio;
        if (visit.data < filters.dataInicio) passes = false;
      }
      if (filters.dataFim) {
        newActiveFilters.dataFim = filters.dataFim;
        if (visit.data > filters.dataFim) passes = false;
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