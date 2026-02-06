import { useState, useEffect } from "react";
import { Plus, Users, Search, X, RefreshCw, Filter } from 'lucide-react';
import Button from "../components/Button";
import ClienteForm from "../components/clientes/ClienteForm";
import ClienteTable from "../components/clientes/ClienteTable";
// import ClienteFilters from "../components/clientes/ClienteFilters"; // Opcional, se tiver filtros colapsáveis
import useClienteFilters from "../hooks/useClienteFilters";
import useAuth from "../hooks/useAuth";
import * as clientesService from "../services/clientesService";
import * as prospectsService from "../services/prospectsService";
import * as segmentosService from "../services/segmentosService";
import * as vendedoresService from "../services/vendedoresService";

export default function Clientes() {
    const [clientes, setClientes] = useState([]);
    const [prospects, setProspects] = useState([]); // Para o combobox do form
    const [segmentos, setSegmentos] = useState([]);
    const [vendedores, setVendedores] = useState([]);
    const [editingCliente, setEditingCliente] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const { user } = useAuth();

    const {
        filters,
        filteredClientes,
        handleFilterChange,
        applyFilters,
        clearFilters,
        hasActiveFilters
    } = useClienteFilters();

    // Carregar dados
    const loadData = async () => {
        setIsLoading(true);
        try {
            const [
                clientesData,
                prospectsData,
                segmentosData,
                vendedoresData
            ] = await Promise.all([
                clientesService.listar(user?.id),
                prospectsService.listar(user?.id), // Traz tudo para o auto-fill
                segmentosService.listarSegmentos(user?.id),
                vendedoresService.listarVendedores(user?.id)
            ]);

            setClientes(clientesData || []);
            setProspects(prospectsData || []);
            setSegmentos(segmentosData || []);
            setVendedores(vendedoresData || []);

            applyFilters(clientesData || []);
        } catch (error) {
            console.error("Erro ao carregar dados:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    useEffect(() => {
        if (clientes.length > 0) {
            applyFilters(clientes);
        }
    }, [clientes, filters]);

    // Handlers
    const openModal = (cliente = null) => {
        setEditingCliente(cliente);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingCliente(null);
    };

    const handleFormSuccess = async (formData) => {
        setIsSaving(true);
        try {
            if (editingCliente) {
                await clientesService.atualizar(editingCliente.id, formData);
            } else {
                await clientesService.criar(formData, user?.id);
            }
            closeModal();
            loadData();
        } catch (error) {
            alert("Erro ao salvar: " + error.message);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <>
            <div className="space-y-6 animate-fade-in">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-4">
                    <div>
                        <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">Clientes</h1>
                        <p className="text-gray-600 dark:text-gray-400 mt-2">Gerencie sua carteira de clientes e contratos.</p>
                    </div>

                    <Button onClick={() => openModal()} className="flex items-center gap-2">
                        <Plus className="h-4 w-4" />
                        Novo Cliente
                    </Button>
                </div>

                {/* Toolbar e Filtros */}
                <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 flex flex-col md:flex-row gap-4 justify-between items-center">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Buscar por cliente/prospect..."
                            value={filters.nome || ''}
                            onChange={(e) => handleFilterChange('nome', e.target.value)}
                            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-slate-600 bg-gray-50 dark:bg-slate-700 focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={loadData} className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg">
                            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                        </button>
                    </div>
                </div>

                {/* Filtros Rápidos (Opcional - Selects diretos na page por simplicidade) */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <select
                        value={filters.tipo_contrato}
                        onChange={(e) => handleFilterChange('tipo_contrato', e.target.value)}
                        className="px-3 py-2 rounded-lg border border-gray-200 dark:border-slate-700 text-sm bg-white dark:bg-slate-800"
                    >
                        <option value="">Tipo: Todos</option>
                        <option value="Mensal">Mensal</option>
                        <option value="Trimestral">Trimestral</option>
                        <option value="Semestral">Semestral</option>
                        <option value="Anual">Anual</option>
                        <option value="Avulso">Avulso</option>
                    </select>

                    <select
                        value={filters.nivel_satisfacao}
                        onChange={(e) => handleFilterChange('nivel_satisfacao', e.target.value)}
                        className="px-3 py-2 rounded-lg border border-gray-200 dark:border-slate-700 text-sm bg-white dark:bg-slate-800"
                    >
                        <option value="">Satisfação: Todas</option>
                        <option value="⭐">⭐ (Baixo)</option>
                        <option value="⭐⭐">⭐⭐ (Regular)</option>
                        <option value="⭐⭐⭐">⭐⭐⭐ (Bom)</option>
                        <option value="⭐⭐⭐⭐">⭐⭐⭐⭐ (Muito Bom)</option>
                        <option value="⭐⭐⭐⭐⭐">⭐⭐⭐⭐⭐ (Excelente)</option>
                    </select>
                </div>

                {/* Tabela */}
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden">
                    <div className="p-1">
                        {isLoading ? (
                            <div className="p-12 text-center text-gray-500">Carregando clientes...</div>
                        ) : filteredClientes.length === 0 ? (
                            <div className="p-12 text-center text-gray-500">
                                {hasActiveFilters ? "Nenhum cliente encontrado com os filtros." : "Nenhum cliente cadastrado."}
                            </div>
                        ) : (
                            <ClienteTable
                                clientes={filteredClientes}
                                onEdit={openModal}
                                onRefresh={loadData}
                            />
                        )}
                    </div>
                </div>
            </div>

            {/* Modal - Fora do animate-fade-in */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-start md:items-center justify-center pt-4 px-4 pb-4 md:p-4 bg-black/50 backdrop-blur-sm animate-fade-in overflow-y-auto">
                    <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-4xl md:my-8 mx-auto">
                        <div className="px-6 py-4 border-b border-gray-100 dark:border-slate-700 flex justify-between items-center bg-gray-50 dark:bg-slate-700/50 rounded-t-2xl">
                            <h3 className="font-semibold text-lg text-gray-900 dark:text-white">
                                {editingCliente ? 'Editar Cliente' : 'Novo Cliente'}
                            </h3>
                            <button onClick={closeModal} className="text-gray-400 hover:text-gray-600"><X className="h-5 w-5" /></button>
                        </div>
                        <div className="p-4 md:p-6 lg:p-8 max-h-[calc(100vh-12rem)] md:max-h-[80vh] overflow-y-auto">
                            <ClienteForm
                                cliente={editingCliente}
                                onSuccess={handleFormSuccess}
                                onCancel={closeModal}
                                isLoading={isSaving}
                                prospects={prospects}
                                segmentos={segmentos}
                                vendedores={vendedores}
                            />
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
