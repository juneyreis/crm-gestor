import { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, Save, X, RefreshCw, Briefcase, DollarSign, Clock } from 'lucide-react';
import Button from '../components/Button';
import * as planosService from '../services/planosService';
import useAuth from '../hooks/useAuth';
import ConfirmationModal from '../components/modals/ConfirmationModal';

export default function AdminPlanos() {
    const [planos, setPlanos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const { user } = useAuth();

    // Estado do Modal de Edição/Criação
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentPlano, setCurrentPlano] = useState(null);
    const [formData, setFormData] = useState({ tipo: '', valor: '', prazo: '' });
    const [formError, setFormError] = useState('');
    const [saving, setSaving] = useState(false);

    // Estado do Modal de Confirmação
    const [confirmModalOpen, setConfirmModalOpen] = useState(false);
    const [confirmModalConfig, setConfirmModalConfig] = useState({
        title: '',
        message: '',
        confirmLabel: 'Confirmar',
        variant: 'warning',
        showCancel: true,
        onConfirm: () => { }
    });

    const loadPlanos = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const data = await planosService.listarPlanos(user.id);
            setPlanos(data || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadPlanos();
    }, [user]);

    const requestConfirmation = ({ title, message, variant, onConfirm, confirmLabel = 'Sim, confirmar', showCancel = true }) => {
        setConfirmModalConfig({
            title,
            message,
            variant,
            confirmLabel,
            showCancel,
            onConfirm: async () => {
                await onConfirm();
                setConfirmModalOpen(false);
            }
        });
        setConfirmModalOpen(true);
    };

    const openModal = (plano = null) => {
        setCurrentPlano(plano);
        setFormData({
            tipo: plano ? plano.tipo : '',
            valor: plano ? plano.valor : '',
            prazo: plano ? plano.prazo : ''
        });
        setFormError('');
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setCurrentPlano(null);
        setFormData({ tipo: '', valor: '', prazo: '' });
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setFormError('');
        setSaving(true);

        try {
            if (currentPlano) {
                await planosService.atualizarPlano(currentPlano.id, formData, user.id);
            } else {
                await planosService.criarPlano(formData, user.id);
            }
            await loadPlanos();
            closeModal();
            requestConfirmation({
                title: 'Sucesso',
                message: currentPlano ? 'Plano atualizado com sucesso!' : 'Novo plano criado com sucesso!',
                variant: 'success',
                confirmLabel: 'OK',
                showCancel: false,
                onConfirm: () => { }
            });
        } catch (err) {
            setFormError(err.message);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = (id, tipo) => {
        requestConfirmation({
            title: 'Excluir Plano',
            message: `Tem certeza que deseja excluir o plano "${tipo}"?`,
            variant: 'danger',
            confirmLabel: 'Sim, excluir',
            onConfirm: async () => {
                try {
                    await planosService.excluirPlano(id);
                    await loadPlanos();
                } catch (err) {
                    alert(err.message);
                }
            }
        });
    };

    const filteredPlanos = planos.filter(p =>
        (p.tipo || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <Briefcase className="text-blue-600 h-7 w-7" />
                        Gerenciar Planos
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">Configure os planos disponíveis para os usuários.</p>
                </div>

                <Button onClick={() => openModal()} className="flex items-center gap-2 text-white bg-blue-600 hover:bg-blue-700 border-none shadow-md">
                    <Plus className="h-4 w-4" />
                    Novo Plano
                </Button>
            </div>

            {/* Barra de Ferramentas */}
            <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 flex flex-col md:flex-row gap-4 justify-between items-center">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Buscar planos..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-slate-600 bg-gray-50 dark:bg-slate-700 focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white"
                    />
                </div>

                <button
                    onClick={loadPlanos}
                    className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Atualizar lista"
                >
                    <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                </button>
            </div>

            {/* Tabela de Planos */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 dark:bg-slate-900/50 border-b border-gray-200 dark:border-slate-700">
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Tipo (Plano)</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Valor</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Prazo (Dias)</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                            {filteredPlanos.map((p) => (
                                <tr key={p.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <span className="font-bold text-gray-900 dark:text-white uppercase">{p.tipo}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-blue-600 dark:text-blue-400 font-medium">
                                            R$ {parseFloat(p.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-gray-600 dark:text-gray-400">
                                            {p.prazo} dias
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => openModal(p)}
                                                className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                            >
                                                <Edit2 size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(p.id, p.tipo)}
                                                className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredPlanos.length === 0 && !loading && (
                                <tr>
                                    <td colSpan="4" className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                                        Nenhum plano cadastrado.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal Criar/Editar */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 dark:border-slate-700 flex justify-between items-center bg-gray-50 dark:bg-slate-700/50">
                            <h3 className="font-semibold text-lg text-gray-900 dark:text-white">
                                {currentPlano ? 'Editar Plano' : 'Novo Plano'}
                            </h3>
                            <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSave} className="p-6 space-y-4">
                            {formError && (
                                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600 flex items-center gap-2">
                                    <X size={16} />
                                    {formError}
                                </div>
                            )}

                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-500 uppercase ml-1">Nome do Plano (Tipo)</label>
                                <div className="relative">
                                    <Briefcase className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
                                    <input
                                        type="text"
                                        value={formData.tipo}
                                        onChange={(e) => setFormData(prev => ({ ...prev, tipo: e.target.value }))}
                                        className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-slate-900 border-none rounded-xl focus:ring-2 focus:ring-blue-500 uppercase text-gray-900 dark:text-white"
                                        placeholder="EX: PREMIUM"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-500 uppercase ml-1">Valor (R$)</label>
                                    <div className="relative">
                                        <DollarSign className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={formData.valor}
                                            onChange={(e) => setFormData(prev => ({ ...prev, valor: e.target.value }))}
                                            className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-slate-900 border-none rounded-xl focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
                                            placeholder="0.00"
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-500 uppercase ml-1">Prazo (Dias)</label>
                                    <div className="relative">
                                        <Clock className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
                                        <input
                                            type="number"
                                            value={formData.prazo}
                                            onChange={(e) => setFormData(prev => ({ ...prev, prazo: e.target.value }))}
                                            className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-slate-900 border-none rounded-xl focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
                                            placeholder="Ex: 30"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <Button type="button" variant="secondary" onClick={closeModal} className="flex-1">
                                    Cancelar
                                </Button>
                                <Button type="submit" disabled={saving} className="flex-1">
                                    {saving ? 'Salvando...' : 'Salvar Plano'}
                                </Button>
                            </div>
                        </form>
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
                showCancel={confirmModalConfig.showCancel}
                onConfirm={confirmModalConfig.onConfirm}
                onCancel={() => setConfirmModalOpen(false)}
            />
        </div>
    );
}
