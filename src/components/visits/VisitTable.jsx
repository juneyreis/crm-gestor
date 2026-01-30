// src/components/visits/VisitTable.jsx - ATUALIZADO
import { useState } from 'react';
import { Edit2, Trash2, Eye, Calendar, MapPin, Building, ChevronUp, ChevronDown } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { supabaseClient as supabase } from '../../lib/supabaseClient';
import useAuth from '../../hooks/useAuth';
import * as visitasService from '../../services/visitasService';

export default function VisitTable({ visits, onEdit, onRefresh }) {
  const { user } = useAuth();
  const [sortColumn, setSortColumn] = useState('data');
  const [sortDirection, setSortDirection] = useState('desc');
  const [deletingId, setDeletingId] = useState(null);

  // Formatar data para exibição (parsear sem interpretar como UTC)
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      // Parsear string YYYY-MM-DD manualmente para evitar timezone issues
      const [year, month, day] = dateString.split('-');
      const date = new Date(year, month - 1, day);
      return format(date, 'dd/MM/yyyy', { locale: ptBR });
    } catch (error) {
      return dateString;
    }
  };

  // Ordenar visitas
  const sortedVisits = [...visits].sort((a, b) => {
    let aValue = a[sortColumn];
    let bValue = b[sortColumn];

    // Tratamento especial para datas
    if (sortColumn === 'data') {
      aValue = new Date(aValue);
      bValue = new Date(bValue);
    }

    // Converter para string para comparação segura
    if (typeof aValue === 'string') aValue = aValue.toUpperCase();
    if (typeof bValue === 'string') bValue = bValue.toUpperCase();

    if (sortDirection === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  const handleSort = (column) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const handleDelete = async (id, prospect) => {
    if (!confirm(`Tem certeza que deseja excluir a visita para "${prospect}"?`)) return;

    setDeletingId(id);
    try {
      await visitasService.excluirVisita(id, user.id);
      alert('Visita excluída com sucesso!');
      if (onRefresh) onRefresh();
    } catch (error) {
      console.error('Erro ao excluir visita:', error);
      alert('Erro ao excluir visita. Tente novamente.');
    } finally {
      setDeletingId(null);
    }
  };

  const SortIcon = ({ column }) => {
    if (sortColumn !== column) return null;
    return sortDirection === 'asc' ? <ChevronUp className="h-4 w-4 ml-1" /> : <ChevronDown className="h-4 w-4 ml-1" />;
  };

  if (visits.length === 0) {
    return null; // Já tratado no componente pai
  }

  return (
    <div className="overflow-hidden">
      {/* Tabela para desktop */}
      <div className="hidden md:block">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => handleSort('data')}
              >
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2" />
                  Data
                  <SortIcon column="data" />
                </div>
              </th>
              <th
                className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => handleSort('prospect')}
              >
                <div className="flex items-center">
                  <Building className="h-4 w-4 mr-2" />
                  Prospect
                  <SortIcon column="prospect" />
                </div>
              </th>
              <th
                className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => handleSort('cidade')}
              >
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-2" />
                  Cidade
                  <SortIcon column="cidade" />
                </div>
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Endereço
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Sistema
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Regime
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedVisits.map((visit) => (
              <tr 
                key={visit.id} 
                className="hover:bg-gray-50 transition-colors group cursor-pointer"
                onDoubleClick={() => onEdit(visit)}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {formatDate(visit.data)}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                    {visit.prospect}
                  </div>
                  {visit.contato && (
                    <div className="text-xs text-gray-500 mt-1">
                      Contato: {visit.contato}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{visit.cidade}</div>
                  {visit.bairro && (
                    <div className="text-xs text-gray-500">{visit.bairro}</div>
                  )}
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-700 max-w-xs truncate">
                    {visit.endereco}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-3 py-1 text-xs rounded-full ${
                    visit.sistema === 'INDEFINIDO' ? 'bg-gray-100 text-gray-800' :
                    visit.sistema?.startsWith('OUTROS:') ? 'bg-purple-100 text-purple-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {visit.sistema || 'INDEFINIDO'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-3 py-1 text-xs rounded-full ${
                    visit.regime === 'SIMPLES NACIONAL' ? 'bg-green-100 text-green-800' :
                    visit.regime === 'LUCRO PRESUMIDO' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {visit.regime || 'INDEFINIDO'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => onEdit(visit)}
                      className="p-2 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Editar visita"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(visit.id, visit.prospect)}
                      disabled={deletingId === visit.id}
                      className="p-2 text-red-600 hover:text-red-900 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                      title="Excluir visita"
                    >
                      {deletingId === visit.id ? (
                        <div className="h-4 w-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </button>
                    <button
                      onClick={() => {/* TODO: Implementar visualização detalhada */}}
                      className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                      title="Ver detalhes"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Cards para mobile */}
      <div className="md:hidden space-y-4 p-4">
        {sortedVisits.map((visit) => (
          <div
            key={visit.id}
            className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow"
            onDoubleClick={() => onEdit(visit)}
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span className="text-sm font-medium text-gray-700">
                    {formatDate(visit.data)}
                  </span>
                </div>
                <h3 className="font-bold text-gray-900 text-lg mb-1">{visit.prospect}</h3>
                <p className="text-sm text-gray-600 truncate">{visit.endereco}</p>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => onEdit(visit)}
                  className="p-2 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded-lg"
                >
                  <Edit2 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(visit.id, visit.prospect)}
                  className="p-2 text-red-600 hover:text-red-900 hover:bg-red-50 rounded-lg"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-700">
                  {visit.cidade} • {visit.bairro || 'Sem bairro'}
                </span>
              </div>

              {visit.contato && (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 text-gray-400">👤</div>
                  <span className="text-sm text-gray-700">{visit.contato}</span>
                </div>
              )}

              {visit.telefone && (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 text-gray-400">📞</div>
                  <span className="text-sm text-gray-700">{visit.telefone}</span>
                </div>
              )}

              <div className="flex flex-wrap gap-2 pt-3 border-t border-gray-100">
                <span className={`px-3 py-1 text-xs rounded-full ${
                  visit.sistema === 'INDEFINIDO' ? 'bg-gray-100 text-gray-800' :
                  visit.sistema?.startsWith('OUTROS:') ? 'bg-purple-100 text-purple-800' :
                  'bg-blue-100 text-blue-800'
                }`}>
                  {visit.sistema || 'INDEFINIDO'}
                </span>
                <span className={`px-3 py-1 text-xs rounded-full ${
                  visit.regime === 'SIMPLES NACIONAL' ? 'bg-green-100 text-green-800' :
                  visit.regime === 'LUCRO PRESUMIDO' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {visit.regime || 'INDEFINIDO'}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Paginação */}
      {visits.length > 10 && (
        <div className="bg-white px-6 py-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Mostrando <span className="font-medium">1-{Math.min(10, sortedVisits.length)}</span> de{' '}
              <span className="font-medium">{sortedVisits.length}</span> resultados
            </div>
            <div className="flex gap-2">
              <button className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                Anterior
              </button>
              <button className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                1
              </button>
              {sortedVisits.length > 20 && (
                <button className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                  2
                </button>
              )}
              <button className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                Próximo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}