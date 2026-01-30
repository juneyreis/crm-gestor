// src/components/prospects/ProspectAdvancedTable.jsx
import React, { useState, useMemo, useEffect } from 'react';
import {
    useReactTable,
    getCoreRowModel,
    getSortedRowModel,
    flexRender,
    createColumnHelper
} from '@tanstack/react-table';
import {
    Edit2,
    Trash2,
    Building,
    MapPin,
    Phone,
    User,
    ChevronUp,
    ChevronDown,
    Eye,
    EyeOff,
    MoreVertical,
    Settings2,
    Mail,
    Calendar,
    ArrowUpDown,
    CheckCircle2,
    RefreshCcw
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import * as prospectsService from '../../services/prospectsService';

const columnHelper = createColumnHelper();

const CLASSIFICATION_COLORS = {
    'Ice': 'bg-[#E0F7FA] text-cyan-800 border-cyan-200',
    'Cold': 'bg-[#B3E5FC] text-blue-800 border-blue-200',
    'Warm': 'bg-[#FFECB3] text-orange-800 border-orange-200',
    'Hot': 'bg-[#FFCDD2] text-red-800 border-red-200'
};

export default function ProspectAdvancedTable({ prospects, onEdit, onRefresh }) {
    const [sorting, setSorting] = useState([{ id: 'data_cadastro', desc: true }]);
    const [columnVisibility, setColumnVisibility] = useState(() => {
        const saved = localStorage.getItem('prospects_table_visibility');
        return saved ? JSON.parse(saved) : {
            observacoes: false,
            id: false,
            bairro: true,
            cep: false,
            concorrentes_descricao: true
        };
    });
    const [columnOrder, setColumnOrder] = useState(() => {
        const saved = localStorage.getItem('prospects_table_order');
        return saved ? JSON.parse(saved) : [];
    });
    const [deletingId, setDeletingId] = useState(null);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    // Persistência
    useEffect(() => {
        localStorage.setItem('prospects_table_visibility', JSON.stringify(columnVisibility));
    }, [columnVisibility]);

    useEffect(() => {
        localStorage.setItem('prospects_table_order', JSON.stringify(columnOrder));
    }, [columnOrder]);

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        try {
            return format(new Date(dateString), 'dd/MM/yyyy', { locale: ptBR });
        } catch (error) {
            return dateString;
        }
    };

    const handleDelete = async (id, nome) => {
        if (!confirm(`Tem certeza que deseja excluir o prospect "${nome}"?`)) return;
        setDeletingId(id);
        try {
            await prospectsService.remover(id);
            if (onRefresh) onRefresh();
        } catch (error) {
            alert('Erro ao excluir prospect.');
        } finally {
            setDeletingId(null);
        }
    };

    const columns = useMemo(() => [
        columnHelper.accessor('id', {
            header: 'ID',
            cell: info => <span className="text-gray-400 font-mono text-xs">#{info.getValue()}</span>,
            size: 80
        }),
        columnHelper.accessor('nome', {
            header: ({ column }) => (
                <button
                    className="flex items-center gap-2 hover:text-blue-600 transition-colors uppercase"
                    onClick={() => column.toggleSorting()}
                >
                    <Building className="h-4 w-4" />
                    Nome
                    <ArrowUpDown className="h-3 w-3" />
                </button>
            ),
            cell: info => (
                <div className="flex flex-col">
                    <span className="font-bold text-gray-900 dark:text-gray-100 uppercase whitespace-normal min-w-[200px]">{info.getValue()}</span>
                    <span className="text-[10px] text-gray-400 font-medium tracking-tight">CADASTRADO EM {formatDate(info.row.original.data_cadastro)}</span>
                </div>
            ),
            size: 250
        }),
        columnHelper.accessor('classificacao', {
            header: 'Classificação',
            cell: info => {
                const val = info.getValue() || 'COLD';
                return (
                    <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full border shadow-sm ${CLASSIFICATION_COLORS[val] || 'bg-gray-100 text-gray-800'}`}>
                        {val.toUpperCase()}
                    </span>
                );
            },
            size: 130
        }),
        columnHelper.accessor('status', {
            header: 'Status',
            cell: info => (
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-50 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-[10px] font-bold border border-slate-200 dark:border-slate-600 uppercase">
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-400"></div>
                    {info.getValue() || 'NOVO'}
                </span>
            ),
            size: 120
        }),
        columnHelper.accessor('contato', {
            header: 'Contato',
            cell: info => (
                <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                    <User className="h-3 w-3 text-gray-400" />
                    <span className="uppercase font-medium truncate max-w-[150px]">{info.getValue() || '-'}</span>
                </div>
            ),
            size: 160
        }),
        columnHelper.accessor('email', {
            header: 'Email',
            cell: info => info.getValue() ? (
                <a href={`mailto:${info.getValue()}`} className="flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors lowercase text-xs font-medium">
                    <Mail className="h-3 w-3 flex-shrink-0" />
                    <span className="truncate max-w-[200px]">{info.getValue()}</span>
                </a>
            ) : '-',
            size: 220
        }),
        columnHelper.accessor('telefone', {
            header: 'Telefone',
            cell: info => info.getValue() ? (
                <a href={`tel:${info.getValue().replace(/\D/g, '')}`} className="flex items-center gap-2 text-slate-700 dark:text-slate-300 hover:text-blue-600 transition-colors font-mono text-xs">
                    <Phone className="h-3 w-3 text-blue-500" />
                    {info.getValue()}
                </a>
            ) : '-',
            size: 140
        }),
        columnHelper.accessor('celular', {
            header: 'Celular',
            cell: info => info.getValue() ? (
                <a href={`https://wa.me/${info.getValue().replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-emerald-600 hover:text-emerald-700 transition-colors font-mono text-xs font-bold">
                    <Phone className="h-3 w-3" />
                    {info.getValue()}
                </a>
            ) : '-',
            size: 140
        }),
        columnHelper.accessor('cidade', {
            header: ({ column }) => (
                <button
                    className="flex items-center gap-2 hover:text-blue-600 transition-colors uppercase text-left ring-offset-white focus:outline-none"
                    onClick={() => column.toggleSorting()}
                >
                    Cidade/UF
                    <ArrowUpDown className="h-3 w-3 flex-shrink-0" />
                </button>
            ),
            cell: info => (
                <div className="flex flex-col">
                    <span className="text-xs font-bold uppercase text-gray-700 dark:text-gray-300 truncate max-w-[120px]">{info.getValue() || '-'}</span>
                    <span className="text-[10px] text-gray-400 font-black">{info.row.original.uf || ''}</span>
                </div>
            ),
            size: 130
        }),
        columnHelper.accessor('bairro', {
            header: ({ column }) => (
                <button
                    className="flex items-center gap-2 hover:text-blue-600 transition-colors uppercase text-left ring-offset-white focus:outline-none"
                    onClick={() => column.toggleSorting()}
                >
                    Bairro
                    <ArrowUpDown className="h-3 w-3 flex-shrink-0" />
                </button>
            ),
            cell: info => <span className="text-xs uppercase font-medium text-slate-600 dark:text-slate-400 truncate max-w-[150px]">{info.getValue() || '-'}</span>,
            size: 160
        }),
        columnHelper.accessor('segmentos.descricao', {
            header: 'Segmento',
            cell: info => <span className="text-xs uppercase font-semibold text-slate-500 dark:text-slate-400 truncate max-w-[150px]">{info.getValue() || '-'}</span>,
            size: 160
        }),
        columnHelper.accessor('concorrentes.descricao', {
            id: 'concorrentes_descricao',
            header: ({ column }) => (
                <button
                    className="flex items-center gap-2 hover:text-blue-600 transition-colors uppercase text-left ring-offset-white focus:outline-none"
                    onClick={() => column.toggleSorting()}
                >
                    Concorrente
                    <ArrowUpDown className="h-3 w-3 flex-shrink-0" />
                </button>
            ),
            cell: info => <span className="text-xs uppercase font-semibold text-slate-500 dark:text-slate-400 truncate max-w-[150px]">{info.getValue() || '-'}</span>,
            size: 160
        }),
        columnHelper.accessor('vendedor', {
            header: 'Vendedor',
            cell: info => (
                <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center text-[9px] font-black text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                        {(info.getValue() || 'V').substring(0, 1).toUpperCase()}
                    </div>
                    <span className="text-xs font-bold uppercase text-gray-600 dark:text-gray-400 truncate max-w-[120px]">{info.getValue() || '-'}</span>
                </div>
            ),
            size: 150
        }),
        columnHelper.display({
            id: 'actions',
            header: '',
            cell: info => (
                <div className="flex items-center justify-end gap-1 pr-1">
                    <button
                        onClick={() => onEdit(info.row.original)}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all"
                        title="Editar"
                    >
                        <Edit2 className="h-3.5 w-3.5" />
                    </button>
                    <button
                        onClick={() => handleDelete(info.row.original.id, info.row.original.nome)}
                        disabled={deletingId === info.row.original.id}
                        className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                        title="Excluir"
                    >
                        {deletingId === info.row.original.id ? (
                            <div className="h-3.5 w-3.5 animate-spin border-2 border-red-600 border-t-transparent rounded-full" />
                        ) : (
                            <Trash2 className="h-3.5 w-3.5" />
                        )}
                    </button>
                </div>
            ),
            size: 80
        }),
    ], [deletingId, onEdit]);

    const table = useReactTable({
        data: prospects,
        columns,
        state: {
            sorting,
            columnVisibility,
            columnOrder,
        },
        onSortingChange: setSorting,
        onColumnVisibilityChange: setColumnVisibility,
        onColumnOrderChange: setColumnOrder,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
    });

    const moveColumn = (index, direction) => {
        const currentColumnOrder = columnOrder.length > 0 ? columnOrder : table.getAllLeafColumns().map(c => c.id);
        const newOrder = [...currentColumnOrder];
        const newIndex = index + direction;
        if (newIndex < 0 || newIndex >= newOrder.length) return;

        const temp = newOrder[index];
        newOrder[index] = newOrder[newIndex];
        newOrder[newIndex] = temp;
        setColumnOrder(newOrder);
    };

    return (
        <div className="space-y-4">
            {/* Toolbar da Tabela */}
            <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-2">
                    <div className="px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 text-xs font-bold rounded-lg border border-blue-100 dark:border-blue-800 flex items-center gap-2">
                        <CheckCircle2 className="h-3 w-3" />
                        {prospects.length} Registros
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => {
                            table.resetColumnVisibility();
                            setColumnOrder([]);
                            localStorage.removeItem('prospects_table_visibility');
                            localStorage.removeItem('prospects_table_order');
                        }}
                        className="flex items-center gap-2 px-3 py-2 text-[10px] font-black text-blue-600 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-all uppercase shadow-sm"
                        title="Resetar Layout da Tabela"
                    >
                        <RefreshCcw className="h-3 w-3" />
                        Resetar
                    </button>

                    <div className="relative">
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors shadow-sm"
                        >
                            <Settings2 className="h-4 w-4" />
                            Colunas
                        </button>

                        {isMenuOpen && (
                            <>
                                <div className="fixed inset-0 z-10" onClick={() => setIsMenuOpen(false)}></div>
                                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl shadow-xl z-20 py-2 animate-in fade-in zoom-in duration-200 origin-top-right">
                                    <div className="px-4 py-2 border-b border-gray-100 dark:border-slate-700 mb-2">
                                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Visibilidade</span>
                                    </div>
                                    <div className="max-h-64 overflow-y-auto px-2 space-y-1 scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-slate-700">
                                        {table.getAllLeafColumns().map((column, index) => {
                                            if (column.id === 'actions') return null;
                                            return (
                                                <div key={column.id} className="flex items-center group/col">
                                                    <label
                                                        className="flex-1 flex items-center gap-3 px-3 py-2 hover:bg-gray-50 dark:hover:bg-slate-700/50 rounded-lg cursor-pointer transition-colors"
                                                    >
                                                        <input
                                                            type="checkbox"
                                                            checked={column.getIsVisible()}
                                                            onChange={column.getToggleVisibilityHandler()}
                                                            className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                        />
                                                        <span className="text-[11px] font-bold text-gray-700 dark:text-gray-300 uppercase tracking-tight truncate">
                                                            {typeof column.columnDef.header === 'string' ? column.columnDef.header : column.id}
                                                        </span>
                                                    </label>

                                                    <div className="flex opacity-0 group-hover/col:opacity-100 transition-opacity pr-2">
                                                        <button
                                                            disabled={index === 0}
                                                            onClick={() => moveColumn(index, -1)}
                                                            className="p-1 text-gray-400 hover:text-blue-600 disabled:opacity-30"
                                                        >
                                                            <ChevronUp className="h-4 w-4" />
                                                        </button>
                                                        <button
                                                            disabled={index === table.getAllLeafColumns().length - 2} // -2 because of actions
                                                            onClick={() => moveColumn(index, 1)}
                                                            className="p-1 text-gray-400 hover:text-blue-600 disabled:opacity-30"
                                                        >
                                                            <ChevronDown className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Container da Tabela com Dual Scroll */}
            <div className="relative bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-sm overflow-hidden">
                <div className="overflow-x-auto overflow-y-hidden scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-slate-700">
                    <table className="w-full text-left border-collapse min-w-[1200px]">
                        <thead className="bg-gray-50/50 dark:bg-slate-700/30 sticky top-0 z-[5] backdrop-blur-sm border-b border-gray-200 dark:border-slate-700">
                            {table.getHeaderGroups().map(headerGroup => (
                                <tr key={headerGroup.id}>
                                    {headerGroup.headers.map(header => (
                                        <th
                                            key={header.id}
                                            className="px-6 py-4 text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider"
                                            style={{ width: header.getSize() !== 150 ? header.getSize() : undefined }}
                                        >
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(header.column.columnDef.header, header.getContext())}
                                        </th>
                                    ))}
                                </tr>
                            ))}
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                            {table.getRowModel().rows.map(row => (
                                <tr
                                    key={row.id}
                                    className="hover:bg-blue-50/30 dark:hover:bg-blue-900/5 transition-colors group"
                                >
                                    {row.getVisibleCells().map(cell => (
                                        <td key={cell.id} className="px-6 py-4 whitespace-nowrap">
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
