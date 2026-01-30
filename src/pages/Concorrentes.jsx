import { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, CheckCircle, XCircle, AlertCircle, Save, X, RefreshCw, FileText } from 'lucide-react';
import Button from '../components/Button';
import * as concorrentesService from '../services/concorrentesService';
import useAuth from '../hooks/useAuth';

export default function Concorrentes() {
    const [concorrentes, setConcorrentes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    // Estado do Modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentConcorrente, setCurrentConcorrente] = useState(null);
    const [formData, setFormData] = useState({ descricao: '', observacoes: '', plotar: true });
    const [formError, setFormError] = useState('');
    const [saving, setSaving] = useState(false);

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

    // Handlers do Modal
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

    const handleDelete = async (id, descricao) => {
        if (!window.confirm(`Tem certeza que deseja excluir o concorrente "${descricao}"?`)) return;

        try {
            await concorrentesService.excluirConcorrente(id);
            await loadConcorrentes();
        } catch (err) {
            alert(err.message);
        }
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

    const handleBulkAction = async (marcar) => {
        if (!window.confirm(`Deseja ${marcar ? 'MARCAR' : 'DESMARCAR'} todos para plotar?`)) return;

        setLoading(true);
        try {
            await concorrentesService.marcarTodosParaPlotar(marcar, user.id);
            await loadConcorrentes();
        } catch (err) {
            alert('Erro ao atualizar em lote.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">Concorrentes</h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-2">Gerencie as empresas e sistemas concorrentes.</p>
                </div>

                <Button onClick={() => openModal()} className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Novo Concorrente
                </Button>
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

            {/* Tabela */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden">
                {loading && concorrentes.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">Carregando concorrentes...</div>
                ) : error ? (
                    <div className="p-8 text-center text-red-500 bg-red-50 flex flex-col items-center gap-2">
                        <AlertCircle className="h-8 w-8" />
                        {error}
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 dark:bg-slate-700/50 border-b border-gray-200 dark:border-slate-700 text-xs uppercase text-gray-500 dark:text-gray-400 font-semibold tracking-wider">
                                    <th className="px-6 py-4 w-20">ID</th>
                                    <th className="px-6 py-4">Descrição</th>
                                    <th className="px-6 py-4">Observações</th>
                                    <th className="px-6 py-4 w-32 text-center">Plotar</th>
                                    <th className="px-6 py-4 w-32 text-right">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                                {filteredConcorrentes.length > 0 ? (
                                    filteredConcorrentes.map((concorrente) => (
                                        <tr key={concorrente.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
                                            <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">#{concorrente.id}</td>
                                            <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white uppercase">{concorrente.descricao}</td>
                                            <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 uppercase truncate max-w-xs" title={concorrente.observacoes}>
                                                {concorrente.observacoes || '-'}
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <button
                                                    onClick={() => handleTogglePlotar(concorrente.id, concorrente.plotar)}
                                                    className={`inline-flex items-center justify-center p-1.5 rounded-full transition-colors ${concorrente.plotar
                                                        ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                                        : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                                                        }`}
                                                    title={concorrente.plotar ? "Ativo no mapa" : "Oculto no mapa"}
                                                >
                                                    {concorrente.plotar ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                                                </button>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => openModal(concorrente)}
                                                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                        title="Editar"
                                                    >
                                                        <Edit2 className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(concorrente.id, concorrente.descricao)}
                                                        className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                        title="Excluir"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                                            Nenhum concorrente encontrado.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Modal Criar/Editar */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
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
                                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 focus:ring-2 focus:ring-blue-500 uppercase"
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
                                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 focus:ring-2 focus:ring-blue-500 uppercase resize-none"
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

                            <div className="flex gap-3 pt-2">
                                <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={closeModal}
                                    className="flex-1"
                                >
                                    Cancelar
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={saving}
                                    className="flex-1 flex justify-center items-center gap-2"
                                >
                                    {saving ? (
                                        <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    ) : (
                                        <Save className="h-4 w-4" />
                                    )}
                                    Salvar
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
