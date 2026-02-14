import { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, Save, X, RefreshCw, CreditCard, Settings, CheckCircle2, XCircle } from 'lucide-react';
import Button from '../components/Button';
import * as finalizadorasService from '../services/finalizadorasService';
import useAuth from '../hooks/useAuth';
import ConfirmationModal from '../components/modals/ConfirmationModal';

export default function AdminFinalizadoras() {
    const [finalizadoras, setFinalizadoras] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const { user } = useAuth();

    // Estado do Modal de Edição/Criação
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentFinalizadora, setCurrentFinalizadora] = useState(null);
    const [formData, setFormData] = useState({ descricao: '', integracao: false });
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

    const loadFinalizadoras = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const data = await finalizadorasService.listarFinalizadoras();
            setFinalizadoras(data || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadFinalizadoras();
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

    const openModal = (finalizadora = null) => {
        setCurrentFinalizadora(finalizadora);
        setFormData({
            descricao: finalizadora ? finalizadora.descricao : '',
            integracao: finalizadora ? finalizadora.integracao : false
        });
        setFormError('');
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setCurrentFinalizadora(null);
        setFormData({ descricao: '', integracao: false });
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setFormError('');
        setSaving(true);

        try {
            if (currentFinalizadora) {
                await finalizadorasService.atualizarFinalizadora(currentFinalizadora.id, formData);
            } else {
                await finalizadorasService.criarFinalizadora(formData, user.id);
            }
            await loadFinalizadoras();
            closeModal();
            requestConfirmation({
                title: 'Sucesso',
                message: currentFinalizadora ? 'Finalizadora atualizada com sucesso!' : 'Nova finalizadora criada com sucesso!',
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

    const handleDelete = (id, descricao) => {
        requestConfirmation({
            title: 'Excluir Finalizadora',
            message: `Tem certeza que deseja excluir a finalizadora "${descricao}"?`,
            variant: 'danger',
            confirmLabel: 'Sim, excluir',
            onConfirm: async () => {
                try {
                    await finalizadorasService.excluirFinalizadora(id);
                    await loadFinalizadoras();
                } catch (err) {
                    alert(err.message);
                }
            }
        });
    };

    const filteredFinalizadoras = finalizadoras.filter(f =>
        (f.descricao || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <CreditCard className="text-blue-600 h-7 w-7" />
                        Finalizadoras
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">Gerencie as formas de pagamento e configurações de integração.</p>
                </div>

                <Button onClick={() => openModal()} className="flex items-center gap-2 text-white bg-blue-600 hover:bg-blue-700 border-none shadow-md">
                    <Plus className="h-4 w-4" />
                    Nova Finalizadora
                </Button>
            </div>

            {/* Barra de Ferramentas */}
            <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 flex flex-col md:flex-row gap-4 justify-between items-center">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Buscar finalizadoras..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-slate-600 bg-gray-50 dark:bg-slate-700 focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white"
                    />
                </div>

                <button
                    onClick={loadFinalizadoras}
                    className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Atualizar lista"
                >
                    <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                </button>
            </div>

            {/* Tabela de Finalizadoras */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 dark:bg-slate-900/50 border-b border-gray-200 dark:border-slate-700">
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Descrição</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Integração</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                            {filteredFinalizadoras.map((f) => (
                                <tr key={f.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <span className="font-bold text-gray-900 dark:text-white uppercase">{f.descricao}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        {f.integracao ? (
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                                                <CheckCircle2 size={12} />
                                                ATIVO
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-gray-50 text-gray-600 dark:bg-slate-900/30 dark:text-gray-500">
                                                <XCircle size={12} />
                                                INATIVO
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => openModal(f)}
                                                className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                            >
                                                <Edit2 size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(f.id, f.descricao)}
                                                className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredFinalizadoras.length === 0 && !loading && (
                                <tr>
                                    <td colSpan="3" className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                                        Nenhuma finalizadora cadastrada.
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
                                {currentFinalizadora ? 'Editar Finalizadora' : 'Nova Finalizadora'}
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
                                <label className="text-xs font-bold text-gray-500 uppercase ml-1">Descrição</label>
                                <div className="relative">
                                    <CreditCard className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
                                    <input
                                        type="text"
                                        value={formData.descricao}
                                        onChange={(e) => setFormData(prev => ({ ...prev, descricao: e.target.value }))}
                                        className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-slate-900 border-none rounded-xl focus:ring-2 focus:ring-blue-500 uppercase text-gray-900 dark:text-white"
                                        placeholder="EX: DINHEIRO"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-slate-900 border border-transparent dark:border-slate-700 rounded-xl hover:border-blue-500/30 transition-all cursor-pointer select-none"
                                onClick={() => setFormData(prev => ({ ...prev, integracao: !prev.integracao }))}>
                                <div className={`p-2 rounded-lg ${formData.integracao ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30' : 'bg-gray-200 text-gray-500 dark:bg-slate-800'}`}>
                                    <Settings size={20} />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-bold text-gray-900 dark:text-white">Integração Automática</p>
                                    <p className="text-[10px] text-gray-500">Habilitar recursos de automação para esta forma.</p>
                                </div>
                                <div className={`w-12 h-6 rounded-full p-1 transition-colors ${formData.integracao ? 'bg-blue-600' : 'bg-gray-300 dark:bg-slate-700'}`}>
                                    <div className={`w-4 h-4 bg-white rounded-full transition-transform ${formData.integracao ? 'translate-x-6' : 'translate-x-0'}`} />
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <Button type="button" variant="secondary" onClick={closeModal} className="flex-1">
                                    Cancelar
                                </Button>
                                <Button type="submit" disabled={saving} className="flex-1">
                                    {saving ? 'Salvando...' : 'Salvar'}
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
