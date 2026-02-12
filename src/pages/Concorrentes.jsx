import { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, CheckCircle, XCircle, AlertCircle, Save, X, RefreshCw, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import * as concorrentesService from '../services/concorrentesService';
import ConcorrenteTable from '../components/concorrentes/ConcorrenteTable';
import useAuth from '../hooks/useAuth';
import ConfirmationModal from '../components/modals/ConfirmationModal';

export default function Concorrentes() {
    const navigate = useNavigate();
    const [concorrentes, setConcorrentes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    // Estado do Modal de Edição/Criação
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentConcorrente, setCurrentConcorrente] = useState(null);
    const [formData, setFormData] = useState({ descricao: '', observacoes: '', plotar: true });
    const [formError, setFormError] = useState('');
    const [saving, setSaving] = useState(false);

    // Estado do Modal de Confirmação
    const [confirmModalOpen, setConfirmModalOpen] = useState(false);
    const [confirmModalConfig, setConfirmModalConfig] = useState({
        title: '',
        message: '',
        confirmLabel: 'Confirmar',
        variant: 'warning',
        onConfirm: () => { }
    });

    const { user } = useAuth();

    // Carregar dados
    const loadConcorrentes = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const data = await concorrentesService.listarConcorrentes(user.id);
            setConcorrentes(data || []);
            setError('');
        } catch (err) {
            console.error(err);
            setError('Erro ao carregar concorrentes.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadConcorrentes();
    }, [user]);

    // Filtragem local
    const filteredConcorrentes = concorrentes.filter(conc =>
        conc.descricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (conc.observacoes && conc.observacoes.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    // Handlers do Modal de Edição
    const openModal = (concorrente = null) => {
        setCurrentConcorrente(concorrente);
        setFormData({
            descricao: concorrente ? concorrente.descricao : '',
            observacoes: concorrente ? (concorrente.observacoes || '') : '',
            plotar: concorrente ? concorrente.plotar : true
        });
        setFormError('');
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setCurrentConcorrente(null);
        setFormData({ descricao: '', observacoes: '', plotar: true });
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setFormError('');
        setSaving(true);

        try {
            if (currentConcorrente) {
                await concorrentesService.atualizarConcorrente(currentConcorrente.id, formData, user.id);
            } else {
                await concorrentesService.criarConcorrente(formData, user.id);
            }
            await loadConcorrentes();
            closeModal();
        } catch (err) {
            setFormError(err.message);
        } finally {
            setSaving(false);
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

    const handleDelete = (id, descricao) => {
        requestConfirmation({
            title: 'Excluir Concorrente',
            message: `Tem certeza que deseja excluir o concorrente "${descricao}"?`,
            variant: 'danger',
            confirmLabel: 'Sim, excluir',
            onConfirm: async () => {
                try {
                    await concorrentesService.excluirConcorrente(id);
                    await loadConcorrentes();
                } catch (err) {
                    alert(err.message);
                }
            }
        });
    };

    const handleTogglePlotar = async (id, statusAtual) => {
        try {
            await concorrentesService.togglePlotar(id, statusAtual, user.id);
            // Atualização otimista local
            setConcorrentes(prev => prev.map(conc =>
                conc.id === id ? { ...conc, plotar: !statusAtual } : conc
            ));
        } catch (err) {
            console.error(err);
            alert('Erro ao alterar status.');
            loadConcorrentes();
        }
    };

    const handleBulkAction = (marcar) => {
        const action = marcar ? 'MARCAR' : 'DESMARCAR';
        requestConfirmation({
            title: `${action} Todos`,
            message: `Deseja ${action.toLowerCase()} todos para plotar?`,
            variant: 'warning',
            onConfirm: async () => {
                setLoading(true);
                try {
                    await concorrentesService.marcarTodosParaPlotar(marcar, user.id);
                    await loadConcorrentes();
                } catch (err) {
                    alert('Erro ao atualizar em lote.');
                } finally {
                    setLoading(false);
                }
            }
        });
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">Concorrentes</h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-2">Gerencie as empresas e sistemas concorrentes.</p>
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        variant="secondary"
                        onClick={() => navigate('/relatorios/concorrentes')}
                        className="flex items-center gap-2"
                    >
                        <FileText className="h-4 w-4" />
                        Ver Relatório
                    </Button>
                    <Button onClick={() => openModal()} className="flex items-center gap-2 text-white bg-blue-600 hover:bg-blue-700 border-none shadow-md">
                        <Plus className="h-4 w-4" />
                        Novo Concorrente
                    </Button>
                </div>
            </div>

            {/* Barra de Ferramentas */}
            <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 flex flex-col md:flex-row gap-4 justify-between items-center">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Buscar concorrentes..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-slate-600 bg-gray-50 dark:bg-slate-700 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    />
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => handleBulkAction(true)}
                        className="text-xs px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 border border-blue-200 transition-colors"
                        title="Marcar todos para plotar"
                    >
                        Marcar Todos
                    </button>
                    <button
                        onClick={() => handleBulkAction(false)}
                        className="text-xs px-3 py-1.5 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 border border-gray-200 transition-colors"
                        title="Desmarcar todos para plotar"
                    >
                        Desmarcar Todos
                    </button>
                    <button
                        onClick={loadConcorrentes}
                        className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Atualizar lista"
                    >
                        <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                </div>
            </div>

            {/* Tabela / Cards */}
            <ConcorrenteTable
                concorrentes={filteredConcorrentes}
                loading={loading}
                error={error}
                onEdit={openModal}
                onDelete={handleDelete}
                onTogglePlotar={handleTogglePlotar}
            />

            {/* Modal Criar/Editar */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-start md:items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in overflow-y-auto">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-md my-auto md:my-8 overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 dark:border-slate-700 flex justify-between items-center bg-gray-50 dark:bg-slate-700/50">
                            <h3 className="font-semibold text-lg text-gray-900 dark:text-white">
                                {currentConcorrente ? 'Editar Concorrente' : 'Novo Concorrente'}
                            </h3>
                            <button
                                onClick={closeModal}
                                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="max-h-[calc(100vh-12rem)] md:max-h-[80vh] overflow-y-auto scrollbar-thin">
                            <form onSubmit={handleSave} className="p-6 space-y-4">
                                {formError && (
                                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600 flex items-center gap-2">
                                        <AlertCircle className="h-4 w-4 flex-shrink-0" />
                                        {formError}
                                    </div>
                                )}

                                {/* Descrição */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Descrição *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.descricao}
                                        onChange={(e) => setFormData(prev => ({ ...prev, descricao: e.target.value }))}
                                        className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 focus:ring-2 focus:ring-blue-500 uppercase text-gray-900 dark:text-white"
                                        placeholder="EX: SISTEMA X"
                                        maxLength={40}
                                        autoFocus
                                    />
                                    <p className="text-xs text-gray-500 text-right">
                                        {formData.descricao.length}/40
                                    </p>
                                </div>

                                {/* Observações */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Observações
                                    </label>
                                    <textarea
                                        value={formData.observacoes}
                                        onChange={(e) => setFormData(prev => ({ ...prev, observacoes: e.target.value }))}
                                        className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 focus:ring-2 focus:ring-blue-500 uppercase resize-none text-gray-900 dark:text-white"
                                        placeholder="DETALHES DO SISTEMA (OPCIONAL)"
                                        rows={3}
                                    />
                                </div>

                                {/* Checkbox Plotar */}
                                <div className="flex items-center gap-3 p-3 border border-gray-200 dark:border-slate-700 rounded-lg">
                                    <input
                                        type="checkbox"
                                        id="plotar"
                                        checked={formData.plotar}
                                        onChange={(e) => setFormData(prev => ({ ...prev, plotar: e.target.checked }))}
                                        className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                                    />
                                    <label htmlFor="plotar" className="text-sm text-gray-700 dark:text-gray-300 select-none cursor-pointer flex-1">
                                        Exibir no mapa (Plotar)
                                    </label>
                                </div>

                                <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-100 dark:border-slate-700">
                                    <Button
                                        type="button"
                                        variant="secondary"
                                        onClick={closeModal}
                                        className="flex-1 order-2 sm:order-1"
                                    >
                                        Cancelar
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={saving}
                                        className="flex-1 flex justify-center items-center gap-2 order-1 sm:order-2"
                                    >
                                        {saving ? (
                                            <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        ) : (
                                            <div className="flex items-center gap-2">
                                                <Save className="h-4 w-4" />
                                                <span>Salvar</span>
                                            </div>
                                        )}
                                    </Button>
                                </div>
                            </form>
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
