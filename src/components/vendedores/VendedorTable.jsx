import React from 'react';
import { Edit2, Trash2, AlertCircle } from 'lucide-react';
import VendedorMobileCard from './VendedorMobileCard';

export default function VendedorTable({
    vendedores,
    loading,
    error,
    onEdit,
    onDelete
}) {
    if (loading && vendedores.length === 0) {
        return <div className="p-12 text-center text-gray-500 bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700">Carregando vendedores...</div>;
    }

    if (error) {
        return (
            <div className="p-12 text-center text-red-500 bg-red-50 dark:bg-red-900/10 rounded-xl border border-red-200 dark:border-red-900/20 flex flex-col items-center gap-3">
                <AlertCircle className="h-10 w-10 text-red-500" />
                <p className="font-medium">{error}</p>
            </div>
        );
    }

    if (vendedores.length === 0) {
        return (
            <div className="p-12 text-center text-gray-500 bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700">
                Nenhum vendedor encontrado.
            </div>
        );
    }

    return (
        <div className="w-full">
            {/* 🖥️ Visualização Desktop (Table) */}
            <div className="hidden lg:block bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 dark:bg-slate-700/50 border-b border-gray-200 dark:border-slate-700 text-xs uppercase text-gray-500 dark:text-gray-400 font-semibold tracking-wider">
                            <th className="px-6 py-4 w-24">ID</th>
                            <th className="px-6 py-4">Nome</th>
                            <th className="px-6 py-4">Celular</th>
                            <th className="px-6 py-4">Cidade/UF</th>
                            <th className="px-6 py-4 w-32 text-right">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                        {vendedores.map((vendedor) => (
                            <tr key={vendedor.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors group">
                                <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 font-mono">
                                    #{vendedor.id}
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="h-9 w-9 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-700 dark:text-blue-400 text-xs font-black border border-blue-200 dark:border-blue-800">
                                            {vendedor.nome.substring(0, 2).toUpperCase()}
                                        </div>
                                        <span className="text-sm font-bold text-gray-900 dark:text-white uppercase truncate max-w-[200px]">
                                            {vendedor.nome}
                                        </span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-sm font-mono text-gray-500 dark:text-gray-400">
                                    {vendedor.celular || '-'}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 uppercase font-medium">
                                    {vendedor.cidade ? `${vendedor.cidade}/${vendedor.uf || ''}` : '-'}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => onEdit(vendedor)}
                                            className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                            title="Editar"
                                        >
                                            <Edit2 className="h-4 w-4" />
                                        </button>
                                        <button
                                            onClick={() => onDelete(vendedor.id, vendedor.nome)}
                                            className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
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

            {/* 📱 Visualização Mobile (Cards) */}
            <div className="lg:hidden space-y-4">
                {vendedores.map((vendedor) => (
                    <VendedorMobileCard
                        key={vendedor.id}
                        vendedor={vendedor}
                        onEdit={onEdit}
                        onDelete={onDelete}
                    />
                ))}
            </div>
        </div>
    );
}
