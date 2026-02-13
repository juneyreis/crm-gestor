import { useState, useEffect } from 'react';
import { Save, X, Briefcase, Calendar, DollarSign, Percent, Lock, User, Search } from 'lucide-react';
import Button from '../Button';
import useAuth from '../../hooks/useAuth';
import * as comissoesService from '../../services/comissoesService';
import ConfirmationModal from '../modals/ConfirmationModal';
import ComboboxComissoes from './ComboboxComissoes';

const months = [
    { id: '01', label: 'JAN' }, { id: '02', label: 'FEV' },
    { id: '03', label: 'MAR' }, { id: '04', label: 'ABR' },
    { id: '05', label: 'MAI' }, { id: '06', label: 'JUN' },
    { id: '07', label: 'JUL' }, { id: '08', label: 'AGO' },
    { id: '09', label: 'SET' }, { id: '10', label: 'OUT' },
    { id: '11', label: 'NOV' }, { id: '12', label: 'DEZ' }
];

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 5 }, (_, i) => {
    const year = String(currentYear - 2 + i);
    return { id: year, label: year };
});

const statusOptions = [
    { id: 'PENDENTE', label: 'PENDENTE' },
    { id: 'PAGA', label: 'PAGA' },
    { id: 'CANCELADA', label: 'CANCELADA' }
];

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

const formatCurrency = (value) => {
    if (!value) return '';
    const cleanValue = String(value).replace(/\D/g, '');
    return new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2 }).format(parseFloat(cleanValue) / 100);
};

const formatPercent = (value) => {
    if (!value) return '';
    const cleanValue = String(value).replace(/\D/g, '');
    return new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2 }).format(parseFloat(cleanValue) / 100);
};

const toISOStringLocal = (dateInput) => {
    if (!dateInput) return null;
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
        }
    }, [comissao]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        let formattedValue = value;
        if (name === 'valor_contrato') formattedValue = formatCurrency(value);
        if (name === 'percentual_comissao') formattedValue = formatPercent(value);
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
                    percentual_comissao: cliente.comissao ? formatPercent(cliente.comissao * 100) : ''
                }));
            }
        }
    };

    useEffect(() => {
        const valorContrato = parseFloat(String(form.valor_contrato).replace(/\./g, '').replace(',', '.')) || 0;
        const percentual = parseFloat(String(form.percentual_comissao).replace(/\./g, '').replace(',', '.')) || 0;
        setForm(prev => ({ ...prev, valor_comissao: (valorContrato * percentual) / 100 }));
    }, [form.valor_contrato, form.percentual_comissao]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const newErrors = {};
        if (!form.cliente_id) newErrors.cliente_id = 'Obrigatório';
        if (!form.vendedor_id) newErrors.vendedor_id = 'Obrigatório';
        if (!form.vencimento) newErrors.vencimento = 'Obrigatório';
        if (Object.keys(newErrors).length > 0) return setErrors(newErrors);

        setIsSubmitting(true);
        const vigencia = `${form.vigencia_mes}/${form.vigencia_ano}`;
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

        try {
            const isDuplicated = await comissoesService.verificarDuplicado(form.cliente_id, vigencia, comissao?.id);
            if (isDuplicated) {
                setPendingPayload(payload);
                setShowConfirmModal(true);
            } else {
                await saveComissao(payload);
            }
        } catch (error) {
            alert("Erro: " + error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const saveComissao = async (payload) => {
        try {
            comissao ? await comissoesService.atualizarComissao(comissao.id, payload) : await comissoesService.criarComissao(payload, user?.id);
            onSuccess();
        } catch (error) {
            alert("Erro ao salvar");
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2 lg:col-span-1">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Cliente</label>
                    <ComboboxComissoes
                        options={clientes}
                        value={form.cliente_id}
                        onChange={handleClienteChange}
                        name="cliente_id"
                        placeholder="Buscar cliente..."
                        labelPath={(c) => c.prospects?.nome || 'Cliente sem nome'}
                        error={errors.cliente_id}
                    />
                </div>

                <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Vendedor</label>
                    <ComboboxComissoes
                        options={vendedores}
                        value={form.vendedor_id}
                        onChange={handleChange}
                        name="vendedor_id"
                        placeholder="Buscar vendedor..."
                        labelPath={(v) => v.nome}
                        icon={Briefcase}
                        error={errors.vendedor_id}
                    />
                </div>

                <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Vencimento</label>
                    <div className="relative">
                        <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                        <input type="date" name="vencimento" value={form.vencimento} onChange={handleChange}
                            className={`w-full pl-10 pr-4 py-2 text-sm rounded-lg border focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-700 dark:text-white ${errors.vencimento ? 'border-red-500' : 'border-gray-200 dark:border-slate-600'}`} />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 md:col-span-1">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Mês</label>
                        <ComboboxComissoes
                            options={months}
                            value={form.vigencia_mes}
                            onChange={handleChange}
                            name="vigencia_mes"
                            placeholder="Mês"
                            labelPath={(m) => m.label}
                            icon={Calendar}
                            showSearch={false}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Ano</label>
                        <ComboboxComissoes
                            options={years}
                            value={form.vigencia_ano}
                            onChange={handleChange}
                            name="vigencia_ano"
                            placeholder="Ano"
                            labelPath={(y) => y.label}
                            icon={Calendar}
                            showSearch={false}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Contrato (R$)</label>
                        <div className="relative">
                            <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                            <input type="text" name="valor_contrato" value={form.valor_contrato} onChange={handleChange} placeholder="0,00"
                                className="w-full pl-10 pr-4 py-2 text-sm rounded-lg border border-gray-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white" />
                        </div>
                    </div>
                    <div className="space-y-1">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Comissão (%)</label>
                        <div className="relative">
                            <Percent className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                            <input type="text" name="percentual_comissao" value={form.percentual_comissao} onChange={handleChange} placeholder="0,00"
                                className="w-full pl-10 pr-4 py-2 text-sm rounded-lg border border-gray-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white" />
                        </div>
                    </div>
                </div>

                <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Valor da Comissão</label>
                    <div className="relative">
                        <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-orange-400" />
                        <input type="text" value={form.valor_comissao.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} readOnly
                            className="w-full pl-10 pr-4 py-2 text-sm rounded-lg border border-gray-100 bg-gray-50 dark:bg-slate-800/50 dark:border-slate-700 font-bold text-orange-600" />
                    </div>
                </div>

                <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                    <ComboboxComissoes
                        options={statusOptions}
                        value={form.status}
                        onChange={handleChange}
                        name="status"
                        placeholder="Status"
                        labelPath={(s) => s.label}
                        icon={Search}
                        showSearch={false}
                    />
                </div>
            </div>

            <div className="flex gap-3 pt-4 border-t border-gray-100 dark:border-slate-700">
                <Button type="submit" isLoading={isSubmitting || parentLoading} className="flex-1 md:flex-none md:min-w-[150px]">
                    {comissao ? 'Atualizar' : 'Salvar'}
                </Button>
                <Button type="button" variant="secondary" onClick={onCancel} className="flex-1 md:flex-none md:min-w-[150px]">Cancelar</Button>
            </div>

            <ConfirmationModal isOpen={showConfirmModal} title="Lançamento Duplicado"
                message="Já existe uma comissão para este cliente nesta vigência. Deseja prosseguir?"
                confirmLabel="Sim, confirmar" cancelLabel="Cancelar"
                onConfirm={() => saveComissao(pendingPayload)} onCancel={() => setShowConfirmModal(false)} />
        </form>
    );
}
