import { useState, useEffect } from 'react';
import { Save, X, User, Briefcase, Calendar, DollarSign, Percent, FileText, AlertCircle, Lock } from 'lucide-react';
import Button from '../Button';
import useAuth from '../../hooks/useAuth';
import * as comissoesService from '../../services/comissoesService';
import ConfirmationModal from '../modals/ConfirmationModal';

const months = [
    { value: '01', label: 'JAN' },
    { value: '02', label: 'FEV' },
    { value: '03', label: 'MAR' },
    { value: '04', label: 'ABR' },
    { value: '05', label: 'MAI' },
    { value: '06', label: 'JUN' },
    { value: '07', label: 'JUL' },
    { value: '08', label: 'AGO' },
    { value: '09', label: 'SET' },
    { value: '10', label: 'OUT' },
    { value: '11', label: 'NOV' },
    { value: '12', label: 'DEZ' }
];

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 5 }, (_, i) => String(currentYear - 2 + i));

const initialForm = {
    cliente_id: '',
    vendedor_id: '',
    vigencia_mes: String(new Date().getMonth() + 1).padStart(2, '0'),
    vigencia_ano: String(currentYear),
    valor_contrato: '',
    percentual_comissao: '',
    valor_comissao: 0,
    status: 'PENDENTE',
    vencimento: '',
    observacoes: ''
};

// Utilitários de Formatação (Padrão CRM)
const formatCurrency = (value) => {
    if (!value) return '';
    const cleanValue = String(value).replace(/\D/g, '');
    const options = { minimumFractionDigits: 2 };
    const result = new Intl.NumberFormat('pt-BR', options).format(
        parseFloat(cleanValue) / 100
    );
    return result;
};

const formatPercent = (value) => {
    if (!value) return '';
    const cleanValue = String(value).replace(/\D/g, '');
    const options = { minimumFractionDigits: 2 };
    const result = new Intl.NumberFormat('pt-BR', options).format(
        parseFloat(cleanValue) / 100
    );
    return result;
};

// Funções de apoio Sensorial (UX)
const playErrorSound = () => {
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const playBeep = (startTime, frequency) => {
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(frequency, startTime);
            gainNode.gain.setValueAtTime(0, startTime);
            gainNode.gain.linearRampToValueAtTime(0.2, startTime + 0.01);
            gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.1);
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            oscillator.start(startTime);
            oscillator.stop(startTime + 0.1);
        };
        const now = audioContext.currentTime;
        playBeep(now, 880);
        playBeep(now + 0.15, 880);
    } catch (e) {
        console.warn("Audio Context not supported or blocked:", e);
    }
};

const focusFirstError = (errors) => {
    const firstErrorKey = Object.keys(errors)[0];
    if (firstErrorKey) {
        const element = document.getElementsByName(firstErrorKey)[0];
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            setTimeout(() => element.focus(), 300);
        }
    }
};

// Função para formatar a data mantendo o dia selecionado (evita volta de dia por fuso)
const toISOStringLocal = (dateInput) => {
    if (!dateInput) return null;
    // O input type="date" retorna YYYY-MM-DD
    // Adicionamos T12:00:00 para garantir que fique no meio do dia e evite problemas de fuso
    const [year, month, day] = dateInput.split('-');
    return `${year}-${month}-${day}T12:00:00`;
};

export default function ComissaoForm({ comissao, onSuccess, onCancel, isLoading: parentLoading, clientes, vendedores }) {
    const { user } = useAuth();
    const [form, setForm] = useState(initialForm);
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [pendingPayload, setPendingPayload] = useState(null);
    // Preencher formulário se estiver editando
    useEffect(() => {
        if (comissao) {
            const [mes, ano] = (comissao.vigencia || '').split('/');
            setForm({
                ...comissao,
                vigencia_mes: mes || '01',
                vigencia_ano: ano || String(currentYear),
                valor_contrato: comissao.valor_contrato ? formatCurrency(comissao.valor_contrato * 100) : '',
                percentual_comissao: comissao.percentual_comissao ? formatPercent(comissao.percentual_comissao * 100) : '',
                vencimento: comissao.vencimento ? comissao.vencimento.split('T')[0] : ''
            });
        } else {
            setForm(initialForm);
        }
    }, [comissao]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        let formattedValue = value;

        if (name === 'valor_contrato') {
            formattedValue = formatCurrency(value);
        } else if (name === 'percentual_comissao') {
            formattedValue = formatPercent(value);
        }

        setForm(prev => ({ ...prev, [name]: formattedValue }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
    };

    const handleClienteChange = (e) => {
        const clienteId = e.target.value;
        setForm(prev => ({ ...prev, cliente_id: clienteId }));

        if (clienteId && clientes) {
            const cliente = clientes.find(c => c.id === parseInt(clienteId));
            if (cliente) {
                setForm(prev => ({
                    ...prev,
                    vendedor_id: cliente.vendedor_id || '',
                    valor_contrato: cliente.valor_contrato ? formatCurrency(cliente.valor_contrato * 100) : '',
                    percentual_comissao: cliente.comissao_percentual ? formatPercent(cliente.comissao_percentual * 100) : ''
                }));
            }
        }
        if (errors.cliente_id) setErrors(prev => ({ ...prev, cliente_id: null }));
    };

    // Cálculo automático do valor da comissão
    useEffect(() => {
        const valorContrato = parseFloat(String(form.valor_contrato).replace(/\./g, '').replace(',', '.')) || 0;
        const percentual = parseFloat(String(form.percentual_comissao).replace(/\./g, '').replace(',', '.')) || 0;
        const valorComissao = (valorContrato * percentual) / 100;
        setForm(prev => ({ ...prev, valor_comissao: valorComissao }));
    }, [form.valor_contrato, form.percentual_comissao]);

    const validate = () => {
        const newErrors = {};
        if (!form.cliente_id) newErrors.cliente_id = 'Cliente é obrigatório';
        if (!form.vendedor_id) newErrors.vendedor_id = 'Vendedor é obrigatório';
        if (!form.vencimento) newErrors.vencimento = 'Vencimento é obrigatório';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        setIsSubmitting(true);
        const vigencia = `${form.vigencia_mes}/${form.vigencia_ano}`;

        try {
            const payload = {
                cliente_id: parseInt(form.cliente_id),
                vendedor_id: parseInt(form.vendedor_id),
                vigencia,
                valor_contrato: parseFloat(String(form.valor_contrato).replace(/\./g, '').replace(',', '.')),
                percentual_comissao: parseFloat(String(form.percentual_comissao).replace(/\./g, '').replace(',', '.')),
                valor_comissao: form.valor_comissao,
                status: form.status,
                vencimento: toISOStringLocal(form.vencimento),
                observacoes: form.observacoes
            };

            // Verificar duplicidade (Avisar mas permitir)
            const isDuplicated = await comissoesService.verificarDuplicado(form.cliente_id, vigencia, comissao?.id);
            if (isDuplicated) {
                setPendingPayload(payload);
                setShowConfirmModal(true);
                setIsSubmitting(false);
                return;
            }

            await saveComissao(payload);
        } catch (error) {
            console.error("Erro ao validar comissão:", error);
            alert("Erro: " + error.message);
            setIsSubmitting(false);
        }
    };

    const saveComissao = async (payload) => {
        setIsSubmitting(true);
        try {
            if (comissao) {
                await comissoesService.atualizarComissao(comissao.id, payload);
            } else {
                await comissoesService.criarComissao(payload, user?.id);
            }
            onSuccess();
        } catch (error) {
            console.error("Erro ao salvar comissão:", error);
            alert("Erro ao salvar: " + error.message);
        } finally {
            setIsSubmitting(false);
            setShowConfirmModal(false);
            setPendingPayload(null);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Cliente */}
                <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Cliente *</label>
                    <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <select
                            name="cliente_id"
                            value={form.cliente_id}
                            onChange={handleClienteChange}
                            className={`w-full pl-10 pr-4 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-700 dark:text-white ${errors.cliente_id ? 'border-red-500' : 'border-gray-200 dark:border-slate-600'}`}
                        >
                            <option value="">Selecione um cliente</option>
                            {clientes.map(c => (
                                <option key={c.id} value={c.id}>{c.prospects?.nome}</option>
                            ))}
                        </select>
                        {errors.cliente_id && <p className="text-xs text-red-500 mt-1">{errors.cliente_id}</p>}
                    </div>
                </div>

                {/* Vendedor */}
                <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Vendedor *</label>
                    <div className="relative">
                        <Briefcase className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <select
                            name="vendedor_id"
                            value={form.vendedor_id}
                            onChange={handleChange}
                            className={`w-full pl-10 pr-4 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-700 dark:text-white ${errors.vendedor_id ? 'border-red-500' : 'border-gray-200 dark:border-slate-600'}`}
                        >
                            <option value="">Selecione um vendedor</option>
                            {vendedores.map(v => (
                                <option key={v.id} value={v.id}>{v.nome}</option>
                            ))}
                        </select>
                        {errors.vendedor_id && <p className="text-xs text-red-500 mt-1">{errors.vendedor_id}</p>}
                    </div>
                </div>

                {/* Vigência */}
                <div className="space-y-1 md:col-span-1">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Vigência (Mês/Ano) *</label>
                    <div className="grid grid-cols-2 gap-2">
                        <select
                            name="vigencia_mes"
                            value={form.vigencia_mes}
                            onChange={handleChange}
                            className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                        >
                            {months.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                        </select>
                        <select
                            name="vigencia_ano"
                            value={form.vigencia_ano}
                            onChange={handleChange}
                            className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                        >
                            {years.map(y => <option key={y} value={y}>{y}</option>)}
                        </select>
                    </div>
                    {errors.vigencia && <p className="text-xs text-red-500 mt-1">{errors.vigencia}</p>}
                </div>

                {/* Vencimento */}
                <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Vencimento *</label>
                    <div className="relative">
                        <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <input
                            type="date"
                            name="vencimento"
                            value={form.vencimento}
                            onChange={handleChange}
                            className={`w-full pl-10 pr-4 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white ${errors.vencimento ? 'border-red-500' : 'border-gray-200 dark:border-slate-600'}`}
                        />
                    </div>
                </div>

                {/* Valor Contrato */}
                <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Valor Contrato (R$)</label>
                    <div className="relative">
                        <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            name="valor_contrato"
                            value={form.valor_contrato}
                            onChange={handleChange}
                            className={`w-full pl-10 pr-4 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white ${errors.valor_contrato ? 'border-red-500' : 'border-gray-200 dark:border-slate-600'}`}
                        />
                    </div>
                </div>

                {/* Percentual Comissão */}
                <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Comissão (%)</label>
                    <div className="relative">
                        <Percent className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            name="percentual_comissao"
                            value={form.percentual_comissao}
                            onChange={handleChange}
                            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                        />
                    </div>
                </div>

                {/* Valor Comissão (Auto-calculado) */}
                <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1">
                        Valor da Comissão
                        <Lock className="h-3 w-3 text-gray-400" />
                    </label>
                    <div className="relative">
                        <DollarSign className="absolute left-3 top-3 h-4 w-4 text-orange-400" />
                        <input
                            type="text"
                            value={form.valor_comissao.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                            readOnly
                            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-100 bg-gray-50 dark:bg-slate-800/50 dark:border-slate-700 font-bold text-orange-600"
                        />
                    </div>
                </div>

                {/* Status */}
                <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
                    <select
                        name="status"
                        value={form.status}
                        onChange={handleChange}
                        className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                    >
                        <option value="PENDENTE">PENDENTE</option>
                        <option value="PAGA">PAGA</option>
                        <option value="CANCELADA">CANCELADA</option>
                    </select>
                </div>
            </div>

            {/* Observações */}
            <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Observações</label>
                <textarea
                    name="observacoes"
                    value={form.observacoes}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white resize-none"
                    placeholder="Observações adicionais..."
                />
            </div>

            <div className="flex gap-3 pt-4 border-t border-gray-100 dark:border-slate-700">
                <Button
                    type="submit"
                    isLoading={isSubmitting || parentLoading}
                    className="flex-1 md:flex-none md:min-w-[150px]"
                >
                    {comissao ? 'Atualizar' : 'Salvar'}
                </Button>
                <Button
                    type="button"
                    variant="secondary"
                    onClick={onCancel}
                    className="flex-1 md:flex-none md:min-w-[150px]"
                >
                    Cancelar
                </Button>
            </div>

            <ConfirmationModal
                isOpen={showConfirmModal}
                title="Lançamento Duplicado"
                message={comissao?.id
                    ? "Já existe uma comissão para este cliente nesta vigência. Deseja alterar este lançamento?"
                    : "Já existe uma comissão para este cliente nesta vigência. Deseja incluir este novo lançamento?"}
                confirmLabel={comissao?.id ? "Sim, alterar" : "Sim, incluir"}
                cancelLabel="Não, cancelar"
                onConfirm={() => saveComissao(pendingPayload)}
                onCancel={() => {
                    setShowConfirmModal(false);
                    setPendingPayload(null);
                }}
            />
        </form>
    );
}
