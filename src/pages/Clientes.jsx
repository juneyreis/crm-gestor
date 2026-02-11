import { useState, useEffect } from 'react';
import { Plus, Users, Search, RefreshCw, X, TrendingUp } from 'lucide-react';
import Button from '../components/Button';
import ClienteForm from '../components/clientes/ClienteForm';
import ClienteFilters from '../components/clientes/ClienteFilters';
import ClienteTable from '../components/clientes/ClienteTable';
import useAuth from '../hooks/useAuth';
import * as clientesService from '../services/clientesService';
import * as segmentosService from '../services/segmentosService';
import * as vendedoresService from '../services/vendedoresService';
import ConfirmationModal from '../components/modals/ConfirmationModal';

export default function Clientes() {
    const [clientes, setClientes] = useState([]);
    const [segmentos, setSegmentos] = useState([]);
    const [vendedores, setVendedores] = useState([]);
    const [editingCliente, setEditingCliente] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    // Filter states
    const [filters, setFilters] = useState({
        nome: '',
        segmento_id: '',
        vendedor_id: '',
        cidade: '',
        uf: ''
    });

    const [filteredClientes, setFilteredClientes] = useState([]);

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);

    // State para controle do Modal de Confirmação
    const [confirmModalOpen, setConfirmModalOpen] = useState(false);
    const [confirmModalConfig, setConfirmModalConfig] = useState({
        title: '',
        message: '',
        confirmLabel: 'Confirmar',
        variant: 'warning',
        onConfirm: () => { }
    });

    const { user } = useAuth();

    const loadData = async () => {
        setIsLoading(true);
        try {
            const [clientesData, segmentosData, vendedoresData] = await Promise.all([
                clientesService.listar(user?.id),
                segmentosService.listarSegmentos(user?.id),
                vendedoresService.listarVendedores(user?.id)
            ]);

            setClientes(clientesData || []);
            setSegmentos(segmentosData || []);
            setVendedores(vendedoresData || []);
            setFilteredClientes(clientesData || []);
        } catch (error) {
            console.error("Erro ao carregar dados:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    // Atualizar lista filtrada quando filtros ou dados mudam
    useEffect(() => {
        let result = clientes;

        if (filters.nome) {
            const term = filters.nome.toLowerCase();
            result = result.filter(c =>
                c.nome?.toLowerCase().includes(term) ||
                c.email?.toLowerCase().includes(term) ||
                c.telefone?.includes(term)
            );
        }

        if (filters.segmento_id) {
            result = result.filter(c => c.segmento_id === parseInt(filters.segmento_id));
        }

        if (filters.vendedor_id) {
            result = result.filter(c => c.vendedor_id === parseInt(filters.vendedor_id));
        }

        if (filters.cidade) {
            result = result.filter(c => c.cidade?.toLowerCase().includes(filters.cidade.toLowerCase()));
        }

        if (filters.uf) {
            result = result.filter(c => c.uf === filters.uf);
        }

        setFilteredClientes(result);
    }, [filters, clientes]);

    const handleFilterChange = (field, value) => {
        setFilters(prev => ({ ...prev, [field]: value }));
    };

    const clearFilters = () => {
        setFilters({
            nome: '',
            segmento_id: '',
            vendedor_id: '',
            cidade: '',
            uf: ''
        });
    };

    const openModal = (cliente = null) => {
        setEditingCliente(cliente);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingCliente(null);
    };

    const handleEditCliente = (cliente) => {
        openModal(cliente);
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

    // Handler genérico para abrir modal de confirmação
    const requestConfirmation = ({ title, message, variant, onConfirm, confirmLabel = 'Sim, confirmar' }) => {
        setConfirmModalConfig({
            title,
            message,
            variant,
            confirmLabel,
            onConfirm: async () => {
                await onConfirm();
                setConfirmModalOpen(false);
            }
        });
        setConfirmModalOpen(true);
    };

    // Nova função handleDelete que usa o modal
    const handleDelete = (id, nome) => {
        requestConfirmation({
            title: 'Excluir Cliente',
            message: `Tem certeza que deseja excluir o cliente "${nome}"?`,
            variant: 'danger',
            confirmLabel: 'Sim, excluir',
            onConfirm: async () => {
                try {
                    await clientesService.remover(id);
                    await loadData();
                } catch (error) {
                    alert('Erro ao excluir cliente: ' + error.message);
                }
            }
        });
    };

    return (
        <div className="space-y-6 animate-fade-in">
            {/* CABEÇALHO */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-4">
                <div>
                    <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">Clientes</h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-2">Gerencie sua base de clientes.</p>
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        variant="secondary"
                        onClick={() => window.location.href = '/relatorios/clientes'}
                        className="flex items-center gap-2"
                    >
                        <TrendingUp className="h-4 w-4 text-slate-500" />
                        Ver Relatório
                    </Button>
                    <Button onClick={() => openModal()} className="flex items-center gap-2 text-white bg-blue-600 hover:bg-blue-700 border-none shadow-md">
                        <Plus className="h-4 w-4" />
                        Novo Cliente
                    </Button>
                </div>
            </div>

            {/* BARRA DE BUSCA RÁPIDA */}
            <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 flex flex-col md:flex-row gap-4 justify-between items-center">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Buscar por nome, email ou telefone..."
                        value={filters.nome}
                        onChange={(e) => handleFilterChange('nome', e.target.value)}
                        className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-slate-600 bg-gray-50 dark:bg-slate-700 focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white"
                    />
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={loadData}
                        className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Atualizar lista"
                    >
                        <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                    </button>
                    {/* Botões de Exportar viriam aqui */}
                </div>
            </div>

            {/* FILTROS AVANÇADOS */}
            <ClienteFilters
                filters={filters}
                onFilterChange={handleFilterChange}
                onClear={clearFilters}
                segmentos={segmentos}
                vendedores={vendedores}
            />

            {/* TABELA DE CLIENTES */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden">
                <div className="p-1">
                    {isLoading ? (
                        <div className="p-12 text-center">
                            <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-blue-600 border-t-transparent"></div>
                            <p className="mt-4 text-gray-600">Carregando clientes...</p>
                        </div>
                    ) : filteredClientes.length === 0 ? (
                        <div className="p-12 text-center">
                            <div className="mx-auto w-20 h-20 bg-gray-100 dark:bg-slate-700 rounded-full flex items-center justify-center mb-6">
                                <Users className="h-10 w-10 text-gray-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Nenhum cliente encontrado</h3>
                            <p className="text-gray-600 dark:text-gray-400 mb-6">
                                {(filters.nome || filters.segmento_id || filters.vendedor_id) ? "Tente ajustar os filtros." : "Cadastre o primeiro cliente acima."}
                            </p>
                        </div>
                    ) : (
                        <ClienteTable
                            clientes={filteredClientes}
                            onEdit={handleEditCliente}
                            onRefresh={loadData}
                            onDelete={handleDelete}
                        />
                    )}
                </div>
            </div>

            {/* MODAL DE CADASTRO/EDIÇÃO */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-start md:items-center justify-center pt-4 px-4 pb-4 md:p-4 bg-black/50 backdrop-blur-sm animate-fade-in overflow-y-auto">
                    <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-4xl md:my-8 mx-auto">
                        <div className="px-6 py-4 border-b border-gray-100 dark:border-slate-700 flex justify-between items-center bg-gray-50 dark:bg-slate-700/50 rounded-t-2xl">
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-lg ${editingCliente ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'}`}>
                                    {editingCliente ? <Users className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
                                </div>
                                <div>
                                    <h3 className="font-semibold text-lg text-gray-900 dark:text-white">
                                        {editingCliente ? 'Editar Cliente' : 'Novo Cliente'}
                                    </h3>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        {editingCliente ? 'Atualize as informações do cliente' : 'Preencha os dados para cadastro'}
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
                            <ClienteForm
                                cliente={editingCliente}
                                onSuccess={handleFormSuccess}
                                onCancel={closeModal}
                                isLoading={isSaving}
                                segmentos={segmentos}
                                vendedores={vendedores}
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de Confirmação Genérico */}
            <ConfirmationModal
                isOpen={confirmModalOpen}
                title={confirmModalConfig.title}
                message={confirmModalConfig.message}
                confirmLabel={confirmModalConfig.confirmLabel}
                variant={confirmModalConfig.variant}
                onConfirm={confirmModalConfig.onConfirm}
                onCancel={() => setConfirmModalOpen(false)}
            />
        </div>
    );
}
