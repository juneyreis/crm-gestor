import { useState, useEffect } from "react";
import { Plus, Wallet, Search, RefreshCw, X } from 'lucide-react';
import Button from "../components/Button";
import ComissaoForm from "../components/comissoes/ComissaoForm";
import ComissaoTable from "../components/comissoes/ComissaoTable";
import useComissaoFilters from "../hooks/useComissaoFilters";
import useAuth from "../hooks/useAuth";
import * as comissoesService from "../services/comissoesService";
import * as clientesService from "../services/clientesService";
import * as vendedoresService from "../services/vendedoresService";

export default function Comissoes() {
    const [comissoes, setComissoes] = useState([]);
    const [clientes, setClientes] = useState([]);
    const [vendedores, setVendedores] = useState([]);
    const [editingComissao, setEditingComissao] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const { user } = useAuth();
    const {
        filters,
        filteredComissoes,
        handleFilterChange,
        applyFilters,
        clearFilters,
        hasActiveFilters
    } = useComissaoFilters();

    const loadData = async () => {
        setIsLoading(true);
        try {
            const [comissoesData, clientesData, vendedoresData] = await Promise.all([
                comissoesService.listarComissoes(user?.id),
                clientesService.listar(user?.id),
                vendedoresService.listarVendedores(user?.id)
            ]);

            setComissoes(comissoesData || []);
            setClientes(clientesData || []);
            setVendedores(vendedoresData || []);
            applyFilters(comissoesData || []);
        } catch (error) {
            console.error("Erro ao carregar comissões:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (user?.id) loadData();
    }, [user?.id]);

    useEffect(() => {
        applyFilters(comissoes);
    }, [comissoes, filters]);

    const openModal = (comissao = null) => {
        setEditingComissao(comissao);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingComissao(null);
    };

    const handleFormSuccess = () => {
        closeModal();
        loadData();
    };

    return (
        <div className="space-y-6 animate-fade-in">
            {/* HEADER */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-4">
                <div>
                    <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">Comissões</h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-2">Controle de pagamentos de comissões para vendedores.</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button 
                        onClick={() => openModal()} 
                        className="flex items-center gap-2 text-white bg-blue-600 hover:bg-blue-700 border-none shadow-md"
                    >
                        <Plus className="h-4 w-4" />
                        Nova Comissão
                    </Button>
                </div>
            </div>

            {/* ===== FILTROS OTIMIZADOS - SOMENTE MOBILE ===== */}
            <div className="bg-white dark:bg-slate-800 p-3 md:p-4 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700">
                <div className="flex flex-col gap-2">
                    {/* LINHA 1: Busca */}
                    <div className="relative w-full">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Buscar cliente..."
                            value={filters.cliente || ''}
                            onChange={(e) => handleFilterChange('cliente', e.target.value)}
                            className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-slate-600 bg-gray-50 dark:bg-slate-700 focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white"
                        />
                    </div>

                    {/* LINHA 2: Status + Vendedor + Refresh */}
                    <div className="flex items-center gap-2 w-full">
                        <select
                            value={filters.status || ''}
                            onChange={(e) => handleFilterChange('status', e.target.value)}
                            className="w-2/5 px-2 py-2 text-xs rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 truncate"
                        >
                            <option value="">Status</option>
                            <option value="PENDENTE">PENDENTE</option>
                            <option value="PAGA">PAGA</option>
                            <option value="CANCELADA">CANCELADA</option>
                        </select>

                        <select
                            value={filters.vendedor || ''}
                            onChange={(e) => handleFilterChange('vendedor', e.target.value)}
                            className="w-2/5 px-2 py-2 text-xs rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 truncate"
                        >
                            <option value="">Vendedor</option>
                            {vendedores.map(v => (
                                <option key={v.id} value={v.id}>{v.nome}</option>
                            ))}
                        </select>

                        <button
                            onClick={loadData}
                            className="w-1/5 p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex items-center justify-center"
                            title="Atualizar"
                        >
                            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                        </button>
                    </div>
                </div>
            </div>

            {/* TABELA/CARDS - CONTAINER ORIGINAL RESTAURADO */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden">
                <ComissaoTable
                    comissoes={filteredComissoes}
                    loading={isLoading}
                    onEdit={openModal}
                    onRefresh={loadData}
                    hasActiveFilters={hasActiveFilters}
                />
            </div>

            {/* MODAL */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-start md:items-center justify-center pt-4 px-4 pb-4 md:p-4 bg-black/50 backdrop-blur-sm animate-fade-in overflow-y-auto">
                    <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-4xl md:my-8 mx-auto">
                        <div className="px-6 py-4 border-b border-gray-100 dark:border-slate-700 flex justify-between items-center bg-gray-50 dark:bg-slate-700/50 rounded-t-2xl">
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-lg ${editingComissao ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'}`}>
                                    <Wallet className="h-5 w-5" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-lg text-gray-900 dark:text-white">
                                        {editingComissao ? 'Editar Comissão' : 'Nova Comissão'}
                                    </h3>
                                    <p className="text-xs text-gray-500">
                                        {editingComissao ? `Editando registro #${editingComissao.id}` : 'Registre o lançamento de uma nova comissão'}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={closeModal}
                                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        <div className="p-4 md:p-6 lg:p-8 max-h-[calc(100vh-12rem)] md:max-h-[80vh] overflow-y-auto">
                            <ComissaoForm
                                comissao={editingComissao}
                                onSuccess={handleFormSuccess}
                                onCancel={closeModal}
                                isLoading={isSaving}
                                clientes={clientes}
                                vendedores={vendedores}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}