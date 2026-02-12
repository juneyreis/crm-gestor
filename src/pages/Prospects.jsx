// src/pages/Prospects.jsx
import { useState, useEffect } from 'react';
import { Plus, Users, Search, X, RefreshCw, Target } from 'lucide-react'; // Updated imports
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button'; // Added Button
import ProspectForm from '../components/prospects/ProspectForm';
import ProspectFilters from '../components/prospects/ProspectFilters';
import ProspectAdvancedTable from '../components/prospects/ProspectAdvancedTable';
import ProspectSkeleton from '../components/prospects/ProspectSkeleton';
import useProspectFilters from '../hooks/useProspectFilters';
import useAuth from '../hooks/useAuth';
import * as prospectsService from '../services/prospectsService';
import * as segmentosService from '../services/segmentosService';
import * as concorrentesService from '../services/concorrentesService';
import * as vendedoresService from '../services/vendedoresService';
import ConfirmationModal from '../components/modals/ConfirmationModal';

export default function Prospects() {
    const navigate = useNavigate();
    const [prospects, setProspects] = useState([]);
    const [segmentos, setSegmentos] = useState([]);
    const [concorrentes, setConcorrentes] = useState([]);
    const [vendedores, setVendedores] = useState([]);
    const [editingProspect, setEditingProspect] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    // State para controle do Modal de Edição
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

    const {
        filters,
        filteredProspects,
        activeFilters,
        handleFilterChange,
        applyFilters,
        clearFilters,
        getFilterStats,
        hasActiveFilters
    } = useProspectFilters();

    // Carregar todos os dados necessários
    const loadData = async () => {
        setIsLoading(true);
        try {
            const [
                prospectsData,
                segmentosData,
                concorrentesData,
                vendedoresData
            ] = await Promise.all([
                prospectsService.listar(user?.id),
                segmentosService.listarSegmentos(user?.id),
                concorrentesService.listarConcorrentes(user?.id),
                vendedoresService.listarVendedores(user?.id)
            ]);

            setProspects(prospectsData || []);
            setSegmentos(segmentosData || []);
            setConcorrentes(concorrentesData || []);
            setVendedores(vendedoresData || []);

            applyFilters(prospectsData || []);
        } catch (error) {
            console.error("Erro ao carregar dados:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    // Re-aplicar filtros quando prospects mudam
    useEffect(() => {
        if (prospects.length > 0) {
            applyFilters(prospects);
        }
    }, [prospects, filters]); // Hook gerencia loop

    // Handlers de Modal Edição
    const openModal = (prospect = null) => {
        setEditingProspect(prospect);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingProspect(null);
    };

    const handleEditProspect = (prospect) => {
        // Agora abre o modal em vez de scrollar
        openModal(prospect);
    };

    const handleFormSuccess = () => {
        closeModal();
        loadData();
        setIsSaving(false);
    };

    const handleCancelEdit = () => {
        closeModal();
    };

    // Handler para busca rápida no header
    const handleSearch = (value) => {
        handleFilterChange('nome', value);
    };

    const filterStats = getFilterStats(prospects);

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
            title: 'Excluir Prospect',
            message: `Tem certeza que deseja excluir o prospect "${nome}"?`,
            variant: 'danger',
            confirmLabel: 'Sim, excluir',
            onConfirm: async () => {
                try {
                    await prospectsService.remover(id);
                    await loadData();
                } catch (error) {
                    alert('Erro ao excluir prospect: ' + error.message);
                }
            }
        });
    };

    return (
        <>
            <div className="space-y-6 animate-fade-in">
                {/* CABEÇALHO - Igual Segmentos */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-4">
                    <div>
                        <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">Prospects</h1>
                        <p className="text-gray-600 dark:text-gray-400 mt-2">Gerencie seus potenciais clientes e oportunidades de negócio.</p>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            variant="secondary"
                            onClick={() => navigate('/relatorios/prospects')}
                            className="flex items-center gap-2"
                        >
                            <Target className="h-4 w-4 text-slate-500" />
                            Ver Relatório
                        </Button>
                        <Button onClick={() => openModal()} className="flex items-center gap-2 text-white bg-blue-600 hover:bg-blue-700 border-none shadow-md">
                            <Plus className="h-4 w-4" />
                            Novo Prospect
                        </Button>
                    </div>
                </div>

                {/* BARRA DE FERRAMENTAS - Igual Segmentos */}
                <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 flex flex-col md:flex-row gap-4 justify-between items-center">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Buscar por nome..."
                            value={filters.nome || ''}
                            onChange={(e) => handleSearch(e.target.value)}
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
                        {/* Botões extras como Exportar poderiam vir aqui */}
                    </div>
                </div>

                {/* ÁREA DE CONTEÚDO */}

                {/* Filtros Avançados (Mantido, mas abaixo do header principal) */}
                <ProspectFilters
                    filters={filters}
                    onFilterChange={handleFilterChange}
                    onApply={() => applyFilters(prospects)}
                    onClear={clearFilters}
                    activeFilters={activeFilters}
                    filterStats={filterStats}
                    hasActiveFilters={hasActiveFilters}
                    segmentos={segmentos}
                    concorrentes={concorrentes}
                    vendedores={vendedores}
                />

                {/* Tabela */}
                <div id="prospects-table" className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden">
                    <div className="p-1">
                        {isLoading ? (
                            <div className="p-4">
                                <ProspectSkeleton />
                            </div>
                        ) : filteredProspects.length === 0 ? (
                            <div className="p-12 text-center">
                                <div className="mx-auto w-20 h-20 bg-gray-100 dark:bg-slate-700 rounded-full flex items-center justify-center mb-6">
                                    <Users className="h-10 w-10 text-gray-400" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Nenhum prospect encontrado</h3>
                                <p className="text-gray-600 dark:text-gray-400 mb-6">
                                    {hasActiveFilters ? "Tente ajustar os filtros." : "Cadastre o primeiro prospect acima."}
                                </p>
                            </div>
                        ) : (
                            <ProspectAdvancedTable
                                prospects={filteredProspects}
                                onEdit={handleEditProspect}
                                onRefresh={loadData}
                                onDelete={handleDelete}
                            />
                        )}
                    </div>
                </div>

            </div>

            {/* MODAL DE CADASTRO - Movido para fora do animate-fade-in para corrigir posicionamento */}
            {
                isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-start md:items-center justify-center pt-4 px-4 pb-4 md:p-4 bg-black/50 backdrop-blur-sm animate-fade-in overflow-y-auto">
                        <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-4xl md:my-8 mx-auto">
                            {/* Header do Modal */}
                            <div className="px-6 py-4 border-b border-gray-100 dark:border-slate-700 flex justify-between items-center bg-gray-50 dark:bg-slate-700/50 rounded-t-2xl">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-lg ${editingProspect ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'}`}>
                                        {editingProspect ? <Users className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-lg text-gray-900 dark:text-white">
                                            {editingProspect ? 'Editar Prospect' : 'Novo Prospect'}
                                        </h3>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            {editingProspect ? 'Atualize as informações do prospect' : 'Preencha os dados para cadastro'}
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

                            {/* Corpo do Modal (Formulário) */}
                            <div className="p-4 md:p-6 lg:p-8 max-h-[calc(100vh-12rem)] md:max-h-[80vh] overflow-y-auto">
                                <ProspectForm
                                    prospect={editingProspect}
                                    onSuccess={handleFormSuccess}
                                    onCancel={handleCancelEdit}
                                    isLoading={isSaving}
                                    segmentos={segmentos}
                                    concorrentes={concorrentes}
                                    vendedores={vendedores}
                                />
                            </div>
                        </div>
                    </div>
                )
            }

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
        </>
    );
}
