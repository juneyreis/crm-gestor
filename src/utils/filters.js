// src/utils/filters.js

/**
 * Aplica filtros a uma lista de visitas
 * @param {Array} visits - Lista de visitas
 * @param {Object} filters - Objeto com filtros
 * @returns {Array} - Lista filtrada
 */
export function applyFilters(visits, filters) {
  if (!visits || !Array.isArray(visits)) return [];
  if (!filters || Object.keys(filters).length === 0) return visits;

  return visits.filter(visit => {
    // Filtro por data início
    if (filters.dataInicio && visit.data < filters.dataInicio) {
      return false;
    }

    // Filtro por data fim
    if (filters.dataFim && visit.data > filters.dataFim) {
      return false;
    }

    // Filtro por cidade
    if (filters.cidade) {
      if (filters.cidade === 'OUTRA') {
        if (!visit.cidade || !visit.cidade.startsWith('OUTRA:')) return false;
      } else if (visit.cidade !== filters.cidade && !visit.cidade.startsWith('OUTRA:')) {
        return false;
      }
    }

    // Filtro por prospect (case insensitive)
    if (filters.prospect) {
      if (!visit.prospect || !visit.prospect.toUpperCase().includes(filters.prospect.toUpperCase())) {
        return false;
      }
    }

    // Filtro por endereço (case insensitive)
    if (filters.endereco) {
      if (!visit.endereco || !visit.endereco.toUpperCase().includes(filters.endereco.toUpperCase())) {
        return false;
      }
    }

    // Filtro por bairro (case insensitive)
    if (filters.bairro) {
      if (!visit.bairro || !visit.bairro.toUpperCase().includes(filters.bairro.toUpperCase())) {
        return false;
      }
    }

    // Filtro por sistema
    if (filters.sistema) {
      if (filters.sistema === 'OUTROS') {
        if (!visit.sistema || !visit.sistema.startsWith('OUTROS:')) return false;
      } else if (visit.sistema !== filters.sistema && !visit.sistema.startsWith('OUTROS:')) {
        return false;
      }
    }

    // Filtro por regime
    if (filters.regime) {
      if (visit.regime !== filters.regime) {
        return false;
      }
    }

    return true;
  });
}

/**
 * Obtém estatísticas dos filtros aplicados
 * @param {Array} allVisits - Todas as visitas
 * @param {Array} filteredVisits - Visitas filtradas
 * @param {Object} activeFilters - Filtros ativos
 * @returns {Object} - Estatísticas
 */
export function getFilterStats(allVisits, filteredVisits, activeFilters) {
  const total = allVisits?.length || 0;
  const filtered = filteredVisits?.length || 0;
  const activeCount = activeFilters ? Object.keys(activeFilters).filter(key => activeFilters[key]).length : 0;
  
  return {
    total,
    filtered,
    activeCount,
    percentage: total > 0 ? Math.round((filtered / total) * 100) : 0
  };
}

/**
 * Detecta quais filtros estão ativos
 * @param {Object} filters - Objeto com filtros
 * @returns {Object} - Filtros ativos (apenas com valores não vazios)
 */
export function getActiveFilters(filters) {
  if (!filters) return {};
  
  const active = {};
  Object.keys(filters).forEach(key => {
    if (filters[key] && filters[key] !== '') {
      active[key] = filters[key];
    }
  });
  
  return active;
}

/**
 * Formata data para exibição amigável
 * @param {string} dateString - Data no formato YYYY-MM-DD
 * @returns {string} - Data formatada
 */
export function formatDateForDisplay(dateString) {
  if (!dateString) return '';
  
  try {
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
  } catch (error) {
    return dateString;
  }
}

/**
 * Valida se um filtro está ativo
 * @param {Object} filters - Filtros
 * @param {string} key - Chave do filtro
 * @returns {boolean} - Se o filtro está ativo
 */
export function isFilterActive(filters, key) {
  return filters && filters[key] && filters[key] !== '';
}

/**
 * Limpa todos os filtros
 * @returns {Object} - Objeto de filtros vazio
 */
export function getEmptyFilters() {
  return {
    dataInicio: '',
    dataFim: '',
    cidade: '',
    prospect: '',
    endereco: '',
    bairro: '',
    sistema: '',
    regime: '',
  };
}

/**
 * Salva filtros no localStorage
 * @param {Object} filters - Filtros a serem salvos
 * @param {string} key - Chave para salvar (padrão: 'visits_filters')
 */
export function saveFiltersToStorage(filters, key = 'visits_filters') {
  try {
    localStorage.setItem(key, JSON.stringify(filters));
  } catch (error) {
    console.error('Erro ao salvar filtros:', error);
  }
}

/**
 * Carrega filtros do localStorage
 * @param {string} key - Chave para carregar (padrão: 'visits_filters')
 * @returns {Object} - Filtros carregados ou objeto vazio
 */
export function loadFiltersFromStorage(key = 'visits_filters') {
  try {
    const saved = localStorage.getItem(key);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (error) {
    console.error('Erro ao carregar filtros:', error);
  }
  return getEmptyFilters();
}

/**
 * Verifica se há filtros salvos
 * @param {string} key - Chave para verificar
 * @returns {boolean} - Se há filtros salvos
 */
export function hasSavedFilters(key = 'visits_filters') {
  try {
    const saved = localStorage.getItem(key);
    return saved !== null && saved !== '{}';
  } catch (error) {
    return false;
  }
}

/**
 * Exporta filtros para JSON
 * @param {Object} filters - Filtros a serem exportados
 * @returns {string} - JSON string
 */
export function exportFiltersToJSON(filters) {
  return JSON.stringify(filters, null, 2);
}

/**
 * Importa filtros de JSON
 * @param {string} json - JSON string
 * @returns {Object} - Filtros importados
 */
export function importFiltersFromJSON(json) {
  try {
    const imported = JSON.parse(json);
    // Garante que todos os campos existam
    const emptyFilters = getEmptyFilters();
    return { ...emptyFilters, ...imported };
  } catch (error) {
    console.error('Erro ao importar filtros:', error);
    return getEmptyFilters();
  }
}