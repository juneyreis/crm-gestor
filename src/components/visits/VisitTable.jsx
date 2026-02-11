// src/components/visits/VisitTable.jsx - MODERNIZADO
import { useState } from 'react';
import { Edit2, Trash2, Eye, Calendar, MapPin, Building, ChevronUp, ChevronDown, CheckCircle, AlertTriangle, Clock, Search, ArrowRight, Play, Handshake, Sun, Moon, Sunrise } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import useAuth from '../../hooks/useAuth';
import * as visitasService from '../../services/visitasService';

export default function VisitTable({ visits, onEdit, onRefresh, onDelete }) {
  const { user } = useAuth();
  const [sortColumn, setSortColumn] = useState('data');
  const [sortDirection, setSortDirection] = useState('desc');
  // Formatar data para exibição
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const [year, month, day] = dateString.split('-');
      const date = new Date(year, month - 1, day);
      return format(date, 'dd/MM/yyyy', { locale: ptBR });
    } catch (error) {
      return dateString;
    }
  };


  // Ícones e cores por status
  const getStatusBadge = (status) => {
    const styles = {
      'Agendada': 'bg-blue-100 text-blue-800 border-blue-200',
      'Realizada': 'bg-green-100 text-green-800 border-green-200',
      'Cancelada': 'bg-gray-100 text-gray-800 border-gray-200',
      'Atrasada': 'bg-red-100 text-red-800 border-red-200'
    };
    return styles[status] || styles['Agendada'];
  };

  // Ícones e cores por prioridade
  const getPrioridadeBadge = (prioridade) => {
    const styles = {
      'Baixa': 'bg-green-50 text-green-700 border-green-100',
      'Média': 'bg-yellow-50 text-yellow-700 border-yellow-100',
      'Alta': 'bg-red-50 text-red-700 border-red-100'
    };
    return styles[prioridade] || styles['Média'];
  };

  // Ícones por tipo
  const getTipoIcon = (tipo) => {
    const icons = {
      'Sondagem': <Search className="h-3 w-3" />,
      'Apresentação': <Play className="h-3 w-3" />,
      'Prosseguimento': <ArrowRight className="h-3 w-3" />,
      'Demonstração': <Eye className="h-3 w-3" />,
      'Negociação': <Handshake className="h-3 w-3" />
    };
    return icons[tipo] || <Calendar className="h-3 w-3" />;
  };

  // Ícones por turno
  const getTurnoIcon = (turno) => {
    const icons = {
      'Manhã': <Sunrise className="h-3 w-3" />,
      'Tarde': <Sun className="h-3 w-3" />,
      'Noite': <Moon className="h-3 w-3" />
    };
    return icons[turno] || <Clock className="h-3 w-3" />;
  };

  // Ordenar visitas
  const sortedVisits = [...visits].sort((a, b) => {
    let aValue = a[sortColumn];
    let bValue = b[sortColumn];

    // Mapeamentos para campos compostos/novos
    if (sortColumn === 'prospect') aValue = a.prospect_nome || a.prospect;
    if (sortColumn === 'prospect') bValue = b.prospect_nome || b.prospect;

    if (sortColumn === 'data') {
      aValue = new Date(aValue);
      bValue = new Date(bValue);
    }

    if (typeof aValue === 'string') aValue = aValue.toUpperCase();
    if (typeof bValue === 'string') bValue = bValue.toUpperCase();

    return sortDirection === 'asc'
      ? (aValue > bValue ? 1 : -1)
      : (aValue < bValue ? 1 : -1);
  });

  const handleSort = (column) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const SortIcon = ({ column }) => {
    if (sortColumn !== column) return null;
    return sortDirection === 'asc' ? <ChevronUp className="h-4 w-4 ml-1" /> : <ChevronDown className="h-4 w-4 ml-1" />;
  };

  if (visits.length === 0) return null;

  return (
    <div className="overflow-hidden">
      {/* 🖥️ Tabela Desktop Modernizada */}
      <div className="hidden lg:block">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th onClick={() => handleSort('status')} className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100">
                <div className="flex items-center">Status <SortIcon column="status" /></div>
              </th>
              <th onClick={() => handleSort('data')} className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100">
                <div className="flex items-center">Data/Turno <SortIcon column="data" /></div>
              </th>
              <th onClick={() => handleSort('prospect')} className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100">
                <div className="flex items-center">Prospect <SortIcon column="prospect" /></div>
              </th>
              <th onClick={() => handleSort('tipo')} className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100">
                <div className="flex items-center">Tipo <SortIcon column="tipo" /></div>
              </th>
              <th onClick={() => handleSort('prioridade')} className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100">
                <div className="flex items-center">Prioridade <SortIcon column="prioridade" /></div>
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                Local
              </th>
              <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedVisits.map((visit) => (
              <tr
                key={visit.id}
                className="hover:bg-blue-50/30 transition-colors group cursor-pointer"
                onDoubleClick={() => onEdit(visit)}
              >
                {/* Status */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2.5 py-1 text-xs font-bold rounded-full border flex items-center w-fit gap-1 ${getStatusBadge(visit.status || 'Agendada')}`}>
                    {visit.status === 'Realizada' && <CheckCircle className="h-3 w-3" />}
                    {visit.status === 'Atrasada' && <AlertTriangle className="h-3 w-3" />}
                    {visit.status || 'Agendada'}
                  </span>
                </td>

                {/* Data e Turno */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-gray-900">{formatDate(visit.data)}</span>
                    <span className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                      {getTurnoIcon(visit.turno)} {visit.turno || 'N/D'}
                    </span>
                  </div>
                </td>

                {/* Prospect */}
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                      {visit.prospect_nome || visit.prospect}
                    </span>
                    {visit.contato && (
                      <span className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                        <User className="h-3 w-3" /> {visit.contato}
                      </span>
                    )}
                  </div>
                </td>

                {/* Tipo */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-1.5 text-sm text-gray-700">
                    <span className="p-1.5 bg-gray-100 rounded-md text-gray-600">
                      {getTipoIcon(visit.tipo)}
                    </span>
                    {visit.tipo || 'N/D'}
                  </div>
                </td>

                {/* Prioridade */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2.5 py-1 text-xs font-medium rounded-full border ${getPrioridadeBadge(visit.prioridade || 'Média')}`}>
                    {visit.prioridade || 'Média'}
                  </span>
                </td>

                {/* Local */}
                <td className="px-6 py-4">
                  <div className="flex flex-col max-w-[200px]">
                    <span className="text-sm text-gray-900 truncate">{visit.cidade}</span>
                    <span className="text-xs text-gray-500 truncate" title={visit.endereco}>
                      {visit.bairro ? `${visit.bairro}` : ''}
                    </span>
                  </div>
                </td>

                {/* Ações */}
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => onEdit(visit)}
                      className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Editar"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onDelete(visit.id, visit.prospect_nome || visit.prospect)}
                      className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                      title="Excluir"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 📱 Cards Mobile Modernizados */}
      <div className="lg:hidden space-y-4 p-4">
        {sortedVisits.map((visit) => (
          <div
            key={visit.id}
            className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm active:scale-[0.99] transition-transform"
            onDoubleClick={() => onEdit(visit)}
          >
            {/* Cabeçalho do Card */}
            <div className="flex justify-between items-start mb-3">
              <div>
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border mb-2 ${getStatusBadge(visit.status || 'Agendada')}`}>
                  {visit.status || 'AGENDADA'}
                </span>
                <h3 className="font-bold text-gray-900 text-lg leading-tight">
                  {visit.prospect_nome || visit.prospect}
                </h3>
              </div>
              <div className="flex gap-1 -mr-2 -mt-2">
                <button onClick={() => onEdit(visit)} className="p-2 text-gray-400 hover:text-blue-600">
                  <Edit2 className="h-5 w-5" />
                </button>
                <button onClick={() => onDelete(visit.id, visit.prospect_nome || visit.prospect)} className="p-2 text-gray-400 hover:text-red-600">
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Grid de Informações */}
            <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-sm mb-4">
              <div className="flex items-center gap-2 text-gray-600">
                <Calendar className="h-4 w-4 text-blue-500" />
                <span className="font-medium text-gray-900">{formatDate(visit.data)}</span>
              </div>

              <div className="flex items-center gap-2 text-gray-600">
                {getTurnoIcon(visit.turno)}
                <span>{visit.turno || 'N/D'}</span>
              </div>

              <div className="col-span-2 flex items-center gap-2 text-gray-600">
                <div className="p-1 bg-gray-100 rounded text-gray-500">
                  {getTipoIcon(visit.tipo)}
                </div>
                <span className="font-medium text-gray-900">{visit.tipo || 'Tipo não definido'}</span>
              </div>

              <div className="col-span-2 flex items-start gap-2 text-gray-600">
                <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                <span className="line-clamp-1">
                  {visit.cidade} {visit.bairro && `• ${visit.bairro}`}
                </span>
              </div>
            </div>

            {/* Rodapé do Card */}
            <div className="flex items-center justify-between pt-3 border-t border-gray-100 mt-2">
              <span className={`text-xs font-medium px-2 py-1 rounded-full border ${getPrioridadeBadge(visit.prioridade || 'Média')}`}>
                Prioridade {visit.prioridade || 'Média'}
              </span>

              {visit.contato && (
                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                  <User className="h-3 w-3" />
                  {visit.contato}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function User({ className }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24" height="24" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round"
      className={className}
    >
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
      <circle cx="12" cy="7" r="4"></circle>
    </svg>
  )
}