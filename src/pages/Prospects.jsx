// src/pages/Prospects.jsx
import { useState, useEffect } from 'react';
import { Plus, Filter, Upload, Download, Users } from 'lucide-react';
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

export default function Prospects() {
    const [prospects, setProspects] = useState([]);
    const [segmentos, setSegmentos] = useState([]);
    const [concorrentes, setConcorrentes] = useState([]);
    const [vendedores, setVendedores] = useState([]);
    const [editingProspect, setEditingProspect] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

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
        // Polling opcional para atualizações em tempo real (WebSocket seria ideal, mas polling é simples)
        const interval = setInterval(() => {
            // Simple polling sem recarregar tudo para não perder estado de form, 
            // mas idealmente só recarregaríamos se não estivesse editando.
            // Vou deixar manual refresh por enquanto para evitar conflitos de UX.
        }, 30000);
        return () => clearInterval(interval);
    }, []);

    // Re-aplicar filtros quando prospects mudam
    useEffect(() => {
        if (prospects.length > 0) {
            applyFilters(prospects);
        }
    }, [prospects, filters]); // Dependência filters importante para reatividade do hook, mas loop cuidado. Hook gerencia.

    const handleEditProspect = (prospect) => {
        setEditingProspect(prospect);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleFormSuccess = () => {
        setEditingProspect(null);
        loadData(); // Recarrega para pegar o novo ID e ordenação correta
        setIsSaving(false);
        // Scroll para tabela após sucesso
        setTimeout(() => {
            document.getElementById('prospects-table')?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
    };

    const handleCancelEdit = () => {
        setEditingProspect(null);
    };

    const filterStats = getFilterStats(prospects);

    return (
        <div className="space-y-8">
            {/* SEÇÃO 1: Formulário Principal */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                <div className={`p-1 ${editingProspect ? 'bg-gradient-to-r from-blue-50 to-indigo-50' : 'bg-gradient-to-r from-green-50 to-emerald-50'}`}>
                    <div className="bg-white rounded-xl p-6 md:p-8">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-lg ${editingProspect ? 'bg-blue-100' : 'bg-green-100'}`}>
                                    {editingProspect ? <Users className="h-6 w-6 text-blue-600" /> : <Plus className="h-6 w-6 text-green-600" />}
                                </div>
                                <div>
                                    <h2 className="text-xl md:text-2xl font-bold text-gray-900">
                                        {editingProspect ? 'Editar Prospect' : 'Novo Prospect'}
                                    </h2>
                                    <p className="text-gray-600">
                                        {editingProspect
                                            ? `Editando prospect: ${editingProspect.nome}`
                                            : 'Preencha os dados abaixo para cadastrar um novo prospect'
                                        }
                                    </p>
                                </div>
                            </div>
                        </div>

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

            {/* SEÇÃO 2: Filtros */}
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

            {/* SEÇÃO 3: Lista */}
            <div id="prospects-table" className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-gray-100 rounded-lg">
                                <Users className="h-6 w-6 text-gray-700" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">Prospects Cadastrados</h2>
                                <p className="text-gray-600">
                                    {isLoading ? 'Carregando...' : (
                                        <>
                                            Mostrando <span className="font-semibold text-blue-600">{filteredProspects.length}</span> de <span className="font-semibold">{prospects.length}</span> prospects
                                        </>
                                    )}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <button onClick={loadData} className="text-sm text-gray-600 hover:bg-gray-100 px-3 py-1.5 rounded-lg transition-colors">
                                Atualizar Lista
                            </button>
                        </div>
                    </div>
                </div>

                <div className="p-1">
                    {isLoading ? (
                        <div className="p-4">
                            <ProspectSkeleton />
                        </div>
                    ) : filteredProspects.length === 0 ? (
                        <div className="p-12 text-center">
                            <div className="mx-auto w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                                <Users className="h-10 w-10 text-gray-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-3">Nenhum prospect encontrado</h3>
                            <p className="text-gray-600 mb-6">
                                {hasActiveFilters ? "Tente ajustar os filtros." : "Cadastre o primeiro prospect acima."}
                            </p>
                        </div>
                    ) : (
                        <ProspectAdvancedTable
                            prospects={filteredProspects}
                            onEdit={handleEditProspect}
                            onRefresh={loadData}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}
