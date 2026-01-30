import { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, CheckCircle, XCircle, AlertCircle, Save, X, Filter, RefreshCw } from 'lucide-react';
import Button from '../components/Button';
import * as segmentosService from '../services/segmentosService';
import useAuth from '../hooks/useAuth';

export default function Segmentos() {
    const [segmentos, setSegmentos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    // Estado do Modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentSegmento, setCurrentSegmento] = useState(null);
    const [formData, setFormData] = useState({ descricao: '', plotar: true });
    const [formError, setFormError] = useState('');
    const [saving, setSaving] = useState(false);

    const { user } = useAuth();

    // Carregar dados
    const loadSegmentos = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const data = await segmentosService.listarSegmentos(user.id);
            setSegmentos(data || []);
            setError('');
        } catch (err) {
            console.error(err);
            setError('Erro ao carregar segmentos.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadSegmentos();
    }, [user]);

    // Filtragem local
    const filteredSegmentos = segmentos.filter(seg =>
        seg.descricao.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Handlers do Modal
    const openModal = (segmento = null) => {
        setCurrentSegmento(segmento);
        setFormData({
            descricao: segmento ? segmento.descricao : '',
            plotar: segmento ? segmento.plotar : true
        });
        setFormError('');
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setCurrentSegmento(null);
        setFormData({ descricao: '', plotar: true });
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setFormError('');
        setSaving(true);

        try {
            if (currentSegmento) {
                await segmentosService.atualizarSegmento(currentSegmento.id, formData, user.id);
            } else {
                await segmentosService.criarSegmento(formData.descricao, user.id);
            }
            await loadSegmentos();
            closeModal();
        } catch (err) {
            setFormError(err.message);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id, descricao) => {
        if (!window.confirm(`Tem certeza que deseja excluir o segmento "${descricao}"?`)) return;

        try {
            await segmentosService.excluirSegmento(id);
            await loadSegmentos();
        } catch (err) {
            alert(err.message);
        }
    };

    const handleTogglePlotar = async (id, statusAtual) => {
        try {
            await segmentosService.togglePlotar(id, statusAtual, user.id);
            // Atualização otimista local para feedback rápido
            setSegmentos(prev => prev.map(seg =>
                seg.id === id ? { ...seg, plotar: !statusAtual } : seg
            ));
        } catch (err) {
            console.error(err);
            alert('Erro ao alterar status.');
            loadSegmentos(); // Revert em caso de erro
        }
    };

    const handleBulkAction = async (marcar) => {
        if (!window.confirm(`Deseja ${marcar ? 'MARCAR' : 'DESMARCAR'} todos para plotar?`)) return;

        setLoading(true);
        try {
            await segmentosService.marcarTodosParaPlotar(marcar, user.id);
            await loadSegmentos();
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
                    <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">Segmentos</h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-2">Gerencie as categorias de mercado para organização dos prospects.</p>
                </div>

                <Button onClick={() => openModal()} className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Novo Segmento
                </Button>
            </div>

            {/* Barra de Ferramentas */}
            <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 flex flex-col md:flex-row gap-4 justify-between items-center">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Buscar segmentos..."
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
                        onClick={loadSegmentos}
                        className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Atualizar lista"
                    >
                        <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                </div>
            </div>

            {/* Tabela */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden">
                {loading && segmentos.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">Carregando segmentos...</div>
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
                                    <th className="px-6 py-4 w-32 text-center">Plotar</th>
                                    <th className="px-6 py-4 w-32 text-right">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                                {filteredSegmentos.length > 0 ? (
                                    filteredSegmentos.map((segmento) => (
                                        <tr key={segmento.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
                                            <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">#{segmento.id}</td>
                                            <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white uppercase">{segmento.descricao}</td>
                                            <td className="px-6 py-4 text-center">
                                                <button
                                                    onClick={() => handleTogglePlotar(segmento.id, segmento.plotar)}
                                                    className={`inline-flex items-center justify-center p-1.5 rounded-full transition-colors ${segmento.plotar
                                                        ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                                        : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                                                        }`}
                                                    title={segmento.plotar ? "Ativo no mapa" : "Oculto no mapa"}
                                                >
                                                    {segmento.plotar ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                                                </button>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => openModal(segmento)}
                                                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                        title="Editar"
                                                    >
                                                        <Edit2 className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(segmento.id, segmento.descricao)}
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
                                        <td colSpan="4" className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                                            Nenhum segmento encontrado.
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
                                {currentSegmento ? 'Editar Segmento' : 'Novo Segmento'}
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

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Descrição *
                                </label>
                                <input
                                    type="text"
                                    value={formData.descricao}
                                    onChange={(e) => setFormData(prev => ({ ...prev, descricao: e.target.value }))}
                                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 focus:ring-2 focus:ring-blue-500 uppercase"
                                    placeholder="EX: VAREJO"
                                    maxLength={40}
                                    autoFocus
                                />
                                <p className="text-xs text-gray-500 text-right">
                                    {formData.descricao.length}/40
                                </p>
                            </div>

                            {/* Checkbox Plotar (Opcional, já vem true por padrão no create, mas útil no edit) */}
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
