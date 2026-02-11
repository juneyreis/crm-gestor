import { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, AlertCircle, Save, X, RefreshCw, User, MapPin, Phone, Building, FileText } from 'lucide-react';
import Button from '../components/Button';
import * as vendedoresService from '../services/vendedoresService';
import VendedorTable from '../components/vendedores/VendedorTable';
import useAuth from '../hooks/useAuth';
import { cidades } from '../data/cidades';
import ConfirmationModal from '../components/modals/ConfirmationModal';

// Máscaras
const maskPhone = (value) => {
    if (!value) return "";
    const cleaned = value.replace(/\D/g, "");
    if (cleaned.length <= 10) {
        return cleaned.replace(/(\d{2})(\d{4})(\d{0,4})/, "($1) $2-$3");
    } else {
        return cleaned.replace(/(\d{2})(\d{5})(\d{0,4})/, "($1) $2-$3");
    }
};

const maskCEP = (value) => {
    if (!value) return "";
    const cleaned = value.replace(/\D/g, "");
    return cleaned.replace(/(\d{5})(\d{0,3})/, "$1-$2");
};

export default function Vendedores() {
    const { user } = useAuth();
    const [vendedores, setVendedores] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    // Estado do Modal de Edição/Criação
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentVendedor, setCurrentVendedor] = useState(null);

    // Estado do Modal de Confirmação
    const [confirmModalOpen, setConfirmModalOpen] = useState(false);
    const [confirmModalConfig, setConfirmModalConfig] = useState({
        title: '',
        message: '',
        confirmLabel: 'Confirmar',
        variant: 'warning',
        onConfirm: () => { }
    });

    const initialForm = {
        nome: '',
        endereco: '',
        cidade: '',
        cep: '',
        uf: '',
        celular: ''
    };

    const [formData, setFormData] = useState(initialForm);
    const [formError, setFormError] = useState('');
    const [saving, setSaving] = useState(false);

    // Carregar dados
    const loadVendedores = async () => {
        if (!user) return;

        setLoading(true);
        try {
            const data = await vendedoresService.listarVendedores(user.id);
            setVendedores(data || []);
            setError('');
        } catch (err) {
            console.error(err);
            setError('Erro ao carregar vendedores.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadVendedores();
    }, [user]);

    // Filtragem local
    const filteredVendedores = vendedores.filter(v =>
        v.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (v.cidade && v.cidade.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    // Handlers do Modal de Edição
    const openModal = (vendedor = null) => {
        setCurrentVendedor(vendedor);
        if (vendedor) {
            setFormData({
                nome: vendedor.nome,
                endereco: vendedor.endereco || '',
                cidade: vendedor.cidade || '',
                cep: vendedor.cep || '',
                uf: vendedor.uf || '',
                celular: vendedor.celular || ''
            });
        } else {
            setFormData(initialForm);
        }
        setFormError('');
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setCurrentVendedor(null);
        setFormData(initialForm);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        let finalValue = value;

        if (name === 'celular') {
            finalValue = maskPhone(value);
        } else if (name === 'cep') {
            finalValue = maskCEP(value);
        }

        setFormData(prev => ({ ...prev, [name]: finalValue }));
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setFormError('');
        setSaving(true);

        try {
            if (currentVendedor) {
                await vendedoresService.atualizarVendedor(currentVendedor.id, formData, user.id);
            } else {
                await vendedoresService.criarVendedor(formData, user.id);
            }
            await loadVendedores();
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

    const handleDelete = (id, nome) => {
        requestConfirmation({
            title: 'Excluir Vendedor',
            message: `Tem certeza que deseja excluir o vendedor "${nome}"?`,
            variant: 'danger',
            confirmLabel: 'Sim, excluir',
            onConfirm: async () => {
                try {
                    await vendedoresService.excluirVendedor(id, user.id);
                    await loadVendedores();
                } catch (err) {
                    alert(err.message);
                }
            }
        });
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">Vendedores</h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-2">Gerencie a equipe comercial.</p>
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        variant="secondary"
                        onClick={() => window.location.href = '/relatorios/vendedores'}
                        className="flex items-center gap-2"
                    >
                        <FileText className="h-4 w-4 text-slate-500" />
                        Ver Relatório
                    </Button>
                    <Button onClick={() => openModal()} className="flex items-center gap-2 text-white bg-blue-600 hover:bg-blue-700 border-none shadow-md">
                        <Plus className="h-4 w-4" />
                        Novo Vendedor
                    </Button>
                </div>
            </div>

            {/* Barra de Ferramentas */}
            <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 flex flex-col md:flex-row gap-4 justify-between items-center">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Buscar vendedores..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-slate-600 bg-gray-50 dark:bg-slate-700 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    />
                </div>

                <button
                    onClick={loadVendedores}
                    className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Atualizar lista"
                >
                    <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                </button>
            </div>

            {/* Tabela / Cards */}
            <VendedorTable
                vendedores={filteredVendedores}
                loading={loading}
                error={error}
                onEdit={openModal}
                onDelete={handleDelete}
            />

            {/* Modal Criar/Editar */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-start md:items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in overflow-y-auto">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-2xl my-auto md:my-8 overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 dark:border-slate-700 flex justify-between items-center bg-gray-50 dark:bg-slate-700/50">
                            <h3 className="font-semibold text-lg text-gray-900 dark:text-white">
                                {currentVendedor ? 'Editar Vendedor' : 'Novo Vendedor'}
                            </h3>
                            <button
                                onClick={closeModal}
                                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="max-h-[calc(100vh-12rem)] md:max-h-[80vh] overflow-y-auto scrollbar-thin">
                            <form onSubmit={handleSave} className="p-6 space-y-6">
                                {formError && (
                                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600 flex items-center gap-2">
                                        <AlertCircle className="h-4 w-4 flex-shrink-0" />
                                        {formError}
                                    </div>
                                )}

                                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                                    {/* Nome */}
                                    <div className="space-y-2 col-span-1 lg:col-span-12">
                                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                                            <User className="h-4 w-4" />
                                            Nome Completo *
                                        </label>
                                        <input
                                            type="text"
                                            name="nome"
                                            value={formData.nome}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 focus:ring-2 focus:ring-blue-500 uppercase text-gray-900 dark:text-white"
                                            placeholder="NOME DO VENDEDOR"
                                            required
                                            autoFocus
                                        />
                                    </div>

                                    {/* Celular */}
                                    <div className="space-y-2 col-span-1 lg:col-span-6">
                                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                                            <Phone className="h-4 w-4" />
                                            Celular / WhatsApp
                                        </label>
                                        <input
                                            type="tel"
                                            name="celular"
                                            value={formData.celular}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
                                            placeholder="(00) 00000-0000"
                                            maxLength={15}
                                        />
                                    </div>

                                    {/* CEP */}
                                    <div className="space-y-2 col-span-1 lg:col-span-6">
                                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                                            <MapPin className="h-4 w-4" />
                                            CEP
                                        </label>
                                        <input
                                            type="text"
                                            name="cep"
                                            value={formData.cep}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
                                            placeholder="00000-000"
                                            maxLength={9}
                                        />
                                    </div>

                                    {/* Endereço */}
                                    <div className="space-y-2 col-span-1 lg:col-span-12">
                                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                                            <MapPin className="h-4 w-4" />
                                            Endereço
                                        </label>
                                        <input
                                            type="text"
                                            name="endereco"
                                            value={formData.endereco}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 focus:ring-2 focus:ring-blue-500 uppercase text-gray-900 dark:text-white"
                                            placeholder="RUA, NÚMERO, BAIRRO"
                                        />
                                    </div>

                                    {/* Cidade */}
                                    <div className="space-y-2 col-span-1 lg:col-span-8">
                                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                                            <CityIcon />
                                            Cidade
                                        </label>
                                        <input
                                            type="text"
                                            list="cidades-list"
                                            name="cidade"
                                            value={formData.cidade}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 focus:ring-2 focus:ring-blue-500 uppercase text-gray-900 dark:text-white"
                                            placeholder="CIDADE"
                                        />
                                        <datalist id="cidades-list">
                                            {cidades.map(c => <option key={c} value={c} />)}
                                        </datalist>
                                    </div>

                                    {/* UF */}
                                    <div className="space-y-2 col-span-1 lg:col-span-4">
                                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                                            <MapPin className="h-4 w-4" />
                                            UF
                                        </label>
                                        <select
                                            name="uf"
                                            value={formData.uf}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
                                        >
                                            <option value="">Selecione</option>
                                            {['AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'].map(uf => (
                                                <option key={uf} value={uf}>{uf.toUpperCase()}</option>
                                            ))}
                                        </select>
                                    </div>
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

function CityIcon() {
    return <Building className="h-4 w-4" />;
}
