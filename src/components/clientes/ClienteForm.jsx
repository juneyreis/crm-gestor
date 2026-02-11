import { useState, useEffect } from 'react';
import { Save, X, User, Briefcase, Calendar, DollarSign, Star, MapPin, Phone, Mail, FileText, Percent, Hash } from 'lucide-react';
import Button from '../Button';
import useCEP from '../../hooks/useCEP';
import * as prospectsService from '../../services/prospectsService';
import * as clientesService from '../../services/clientesService';

// Utilitários de Formatação
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

const formatCPF_CNPJ = (value) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length <= 11) {
        return cleaned
            .replace(/(\d{3})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d{1,2})/, '$1-$2')
            .replace(/(-\d{2})\d+?$/, '$1');
    }
    return cleaned
        .replace(/(\d{2})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1/$2')
        .replace(/(\d{4})(\d{1,2})/, '$1-$2')
        .replace(/(-\d{2})\d+?$/, '$1');
};

// Validação de CPF/CNPJ
const validateCPF = (cpf) => {
    cpf = cpf.replace(/[^\d]+/g, '');
    if (cpf.length !== 11 || !!cpf.match(/(\d)\1{10}/)) return false;
    let add = 0;
    for (let i = 0; i < 9; i++) add += parseInt(cpf.charAt(i)) * (10 - i);
    let rev = 11 - (add % 11);
    if (rev === 10 || rev === 11) rev = 0;
    if (rev !== parseInt(cpf.charAt(9))) return false;
    add = 0;
    for (let i = 0; i < 10; i++) add += parseInt(cpf.charAt(i)) * (11 - i);
    rev = 11 - (add % 11);
    if (rev === 10 || rev === 11) rev = 0;
    if (rev !== parseInt(cpf.charAt(10))) return false;
    return true;
};

const validateCNPJ = (cnpj) => {
    cnpj = cnpj.replace(/[^\d]+/g, '');
    if (cnpj.length !== 14 || !!cnpj.match(/(\d)\1{13}/)) return false;
    let tamanho = cnpj.length - 2;
    let numeros = cnpj.substring(0, tamanho);
    let digitos = cnpj.substring(tamanho);
    let soma = 0;
    let pos = tamanho - 7;
    for (let i = tamanho; i >= 1; i--) {
        soma += numeros.charAt(tamanho - i) * pos--;
        if (pos < 2) pos = 9;
    }
    let resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
    if (resultado !== parseInt(digitos.charAt(0))) return false;
    tamanho = tamanho + 1;
    numeros = cnpj.substring(0, tamanho);
    soma = 0;
    pos = tamanho - 7;
    for (let i = tamanho; i >= 1; i--) {
        soma += numeros.charAt(tamanho - i) * pos--;
        if (pos < 2) pos = 9;
    }
    resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
    if (resultado !== parseInt(digitos.charAt(1))) return false;
    return true;
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
            gainNode.gain.linearRampToValueAtTime(0.2, startTime + 0.01); // Volume levemente maior
            gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.1);

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            oscillator.start(startTime);
            oscillator.stop(startTime + 0.1);
        };

        const now = audioContext.currentTime;
        playBeep(now, 880); // A5 (Agudo e claro)
        playBeep(now + 0.15, 880); // Segundo bip rápido
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

export default function ClienteForm({ cliente, onSuccess, onCancel, isLoading, segmentos, vendedores, prospects }) {
    const [formData, setFormData] = useState({
        prospect_id: '',
        segmento_id: '',
        vendedor_id: '',
        valor_contrato: '',
        tipo_contrato: 'Mensal',
        data_inicio_contrato: '',
        data_renovacao_contrato: '',
        periodicidade_pagamento: 'Mensal',
        fonte_captacao: 'Indicação',
        nivel_satisfacao: '⭐⭐⭐',
        observacoes: '',
        endereco: '',
        cidade: '',
        cep: '',
        uf: '',
        telefone: '',
        celular: '',
        email_financeiro: '',
        cnpj_cpf: '',
        contato_principal: '',
        comissao: ''
    });

    const [errors, setErrors] = useState({});
    const { address, loading: cepLoading, fetchCEP, formatCEP } = useCEP();

    // Carregar dados iniciais (edição)
    useEffect(() => {
        if (cliente) {
            setFormData({
                ...cliente,
                valor_contrato: cliente.valor_contrato ? formatCurrency(cliente.valor_contrato * 100) : '',
                comissao: cliente.comissao ? formatPercent(cliente.comissao * 100) : '',
                cnpj_cpf: cliente.cnpj_cpf ? formatCPF_CNPJ(cliente.cnpj_cpf) : '',
                cep: cliente.cep ? formatCEP(cliente.cep) : '',
                tipo_contrato: cliente.tipo_contrato || 'Mensal',
                periodicidade_pagamento: cliente.periodicidade_pagamento || 'Mensal',
                fonte_captacao: cliente.fonte_captacao || 'Indicação',
                nivel_satisfacao: cliente.nivel_satisfacao || '⭐⭐⭐',
                data_inicio_contrato: cliente.data_inicio_contrato?.split('T')[0] || '',
                data_renovacao_contrato: cliente.data_renovacao_contrato?.split('T')[0] || ''
            });
        }
    }, [cliente]);

    // Atualizar endereço quando CEP for buscado
    useEffect(() => {
        if (address) {
            setFormData(prev => ({
                ...prev,
                endereco: address.logradouro || prev.endereco,
                cidade: address.cidade?.toUpperCase() || prev.cidade,
                uf: address.uf || prev.uf
            }));
        }
    }, [address]);

    // Handlers
    const handleChange = (e) => {
        const { name, value } = e.target;
        let newValue = value;

        if (name === 'cep') {
            newValue = formatCEP(value);
            if (newValue.length === 9) fetchCEP(newValue);
        } else if (name === 'cnpj_cpf') {
            newValue = formatCPF_CNPJ(value);
        } else if (name === 'valor_contrato') {
            newValue = formatCurrency(value);
        } else if (name === 'comissao') {
            newValue = formatPercent(value);
        } else if (name === 'observacoes') {
            newValue = value.toUpperCase();
        }

        setFormData(prev => ({ ...prev, [name]: newValue }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
    };

    // Handler para auto-preenchimento
    const handleProspectChange = (e) => {
        const prospectId = e.target.value;
        setFormData(prev => ({ ...prev, prospect_id: prospectId }));
        if (errors.prospect_id) setErrors(prev => ({ ...prev, prospect_id: null }));

        if (prospectId && prospects) {
            const selectedProspect = prospects.find(p => String(p.id) === String(prospectId));
            if (selectedProspect) {
                setFormData(prev => ({
                    ...prev,
                    endereco: selectedProspect.endereco || '',
                    cidade: selectedProspect.cidade || '',
                    cep: formatCEP(selectedProspect.cep || ''),
                    uf: selectedProspect.uf || '',
                    telefone: selectedProspect.telefone || '',
                    celular: selectedProspect.celular || '',
                    email_financeiro: selectedProspect.email || '',
                    contato_principal: selectedProspect.contato || '',
                    segmento_id: selectedProspect.segmento_id || prev.segmento_id,
                }));
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const newErrors = {};

        if (!formData.prospect_id) newErrors.prospect_id = "Selecione um prospect";
        if (!formData.valor_contrato) newErrors.valor_contrato = "Informe o valor";

        // Validação de CNPJ/CPF se preenchido
        const cleanCpfCnpj = formData.cnpj_cpf.replace(/\D/g, '');
        if (formData.cnpj_cpf) {
            if (cleanCpfCnpj.length === 11 && !validateCPF(cleanCpfCnpj)) newErrors.cnpj_cpf = "CPF inválido";
            else if (cleanCpfCnpj.length === 14 && !validateCNPJ(cleanCpfCnpj)) newErrors.cnpj_cpf = "CNPJ inválido";
            else if (cleanCpfCnpj.length !== 11 && cleanCpfCnpj.length !== 14) newErrors.cnpj_cpf = "Formato inválido";
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            playErrorSound();
            focusFirstError(newErrors);
            return;
        }

        // Verificação de Duplicidade
        try {
            const duplicado = await clientesService.verificarDuplicado({
                prospect_id: formData.prospect_id,
                cnpj_cpf: cleanCpfCnpj,
                excludeId: cliente?.id
            });

            if (duplicado) {
                if (String(duplicado.prospect_id) === String(formData.prospect_id)) {
                    newErrors.prospect_id = "Este Prospect já está cadastrado como Cliente.";
                } else if (duplicado.cnpj_cpf === cleanCpfCnpj) {
                    newErrors.cnpj_cpf = "Este CNPJ/CPF já está em uso por outro Cliente.";
                }
                setErrors(newErrors);
                playErrorSound();
                focusFirstError(newErrors);
                return;
            }
        } catch (error) {
            console.error("Erro ao validar duplicidade:", error);
        }

        // Converter valores de volta para Float antes de enviar
        const dataToSave = {
            ...formData,
            valor_contrato: parseFloat(formData.valor_contrato.replace(/\./g, '').replace(',', '.')),
            comissao: formData.comissao ? parseFloat(formData.comissao.replace(/\./g, '').replace(',', '.')) : null,
            cnpj_cpf: cleanCpfCnpj,
            cep: formData.cep.replace(/\D/g, '')
        };

        onSuccess(dataToSave);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Seção 1: Vínculo e Valor */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-gray-50 dark:bg-slate-700/30 p-4 rounded-xl border border-gray-100 dark:border-slate-700">
                <div className="lg:col-span-12">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Prospect de Origem *
                    </label>
                    <div className="relative">
                        <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                        <select
                            name="prospect_id"
                            value={formData.prospect_id}
                            onChange={handleProspectChange}
                            disabled={!!cliente}
                            className={`w-full pl-10 pr-4 py-3 rounded-lg border ${errors.prospect_id ? 'border-red-500' : 'border-gray-300 dark:border-slate-600'} bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 appearance-none`}
                        >
                            <option value="">Selecione um Prospect...</option>
                            {prospects?.map(prospect => (
                                <option key={prospect.id} value={prospect.id}>{prospect.nome}</option>
                            ))}
                        </select>
                        {errors.prospect_id && <p className="text-red-500 text-xs mt-1">{errors.prospect_id}</p>}
                    </div>
                </div>

                <div className="col-span-1 lg:col-span-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Valor do Contrato (R$) *
                    </label>
                    <div className="relative">
                        <DollarSign className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                        <input
                            type="text"
                            name="valor_contrato"
                            value={formData.valor_contrato}
                            onChange={handleChange}
                            className={`w-full pl-10 pr-4 py-3 rounded-lg border ${errors.valor_contrato ? 'border-red-500' : 'border-gray-300 dark:border-slate-600'} bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500`}
                            placeholder="0,00"
                        />
                    </div>
                </div>

                <div className="col-span-1 lg:col-span-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Data Início
                    </label>
                    <div className="relative">
                        <Calendar className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                        <input
                            type="date"
                            name="data_inicio_contrato"
                            value={formData.data_inicio_contrato}
                            onChange={handleChange}
                            className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>

                <div className="col-span-1 lg:col-span-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Data Renovação
                    </label>
                    <div className="relative">
                        <Calendar className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                        <input
                            type="date"
                            name="data_renovacao_contrato"
                            value={formData.data_renovacao_contrato}
                            onChange={handleChange}
                            className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>
            </div>

            {/* Seção 2: Detalhes e Identificação */}
            <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <FileText className="h-4 w-4 text-blue-500" />
                Detalhes e Identificação
            </h4>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">CNPJ / CPF</label>
                    <div className="relative">
                        <Hash className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                        <input
                            type="text"
                            name="cnpj_cpf"
                            value={formData.cnpj_cpf}
                            onChange={handleChange}
                            className={`w-full pl-10 pr-4 py-3 rounded-lg border ${errors.cnpj_cpf ? 'border-red-500' : 'border-gray-300 dark:border-slate-600'} bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500`}
                            placeholder="00.000.000/0000-00"
                        />
                        {errors.cnpj_cpf && <p className="text-red-500 text-xs mt-1">{errors.cnpj_cpf}</p>}
                    </div>
                </div>

                <div className="lg:col-span-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Contato Principal</label>
                    <div className="relative">
                        <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                        <input
                            type="text"
                            name="contato_principal"
                            value={formData.contato_principal}
                            onChange={handleChange}
                            className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                            placeholder="Nome Completo"
                        />
                    </div>
                </div>

                <div className="lg:col-span-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Comissão (%)</label>
                    <div className="relative">
                        <Percent className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                        <input
                            type="text"
                            name="comissao"
                            value={formData.comissao}
                            onChange={handleChange}
                            className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                            placeholder="0,00"
                        />
                    </div>
                </div>

                <div className="lg:col-span-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tipo de Contrato</label>
                    <select name="tipo_contrato" value={formData.tipo_contrato} onChange={handleChange} className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500">
                        <option value="Mensal">Mensal</option>
                        <option value="Trimestral">Trimestral</option>
                        <option value="Semestral">Semestral</option>
                        <option value="Anual">Anual</option>
                        <option value="Avulso">Avulso</option>
                    </select>
                </div>

                <div className="lg:col-span-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Periodicidade</label>
                    <select name="periodicidade_pagamento" value={formData.periodicidade_pagamento} onChange={handleChange} className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500">
                        <option value="Mensal">Mensal</option>
                        <option value="Trimestral">Trimestral</option>
                        <option value="Semestral">Semestral</option>
                        <option value="Anual">Anual</option>
                    </select>
                </div>

                <div className="lg:col-span-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Satisfação</label>
                    <select name="nivel_satisfacao" value={formData.nivel_satisfacao} onChange={handleChange} className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 text-yellow-500 font-bold">
                        <option value="⭐">⭐ (Baixo)</option>
                        <option value="⭐⭐">⭐⭐ (Regular)</option>
                        <option value="⭐⭐⭐">⭐⭐⭐ (Bom)</option>
                        <option value="⭐⭐⭐⭐">⭐⭐⭐⭐ (Muito Bom)</option>
                        <option value="⭐⭐⭐⭐⭐">⭐⭐⭐⭐⭐ (Excelente)</option>
                    </select>
                </div>
            </div>

            {/* Seção 3: Classificação */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="col-span-1 lg:col-span-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Segmento</label>
                    <select name="segmento_id" value={formData.segmento_id} onChange={handleChange} className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500">
                        <option value="">Selecione...</option>
                        {segmentos?.map(s => (
                            <option key={s.id} value={s.id}>{s.descricao}</option>
                        ))}
                    </select>
                </div>
                <div className="col-span-1 lg:col-span-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Vendedor</label>
                    <select name="vendedor_id" value={formData.vendedor_id} onChange={handleChange} className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500">
                        <option value="">Selecione...</option>
                        {vendedores?.map(v => (
                            <option key={v.id} value={v.id}>{v.nome}</option>
                        ))}
                    </select>
                </div>
                <div className="col-span-1 lg:col-span-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Fonte de Captação</label>
                    <select name="fonte_captacao" value={formData.fonte_captacao} onChange={handleChange} className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500">
                        <option value="Indicação">Indicação</option>
                        <option value="Visita">Visita</option>
                        <option value="Telefone">Telefone</option>
                        <option value="Email">Email</option>
                        <option value="Site">Site</option>
                        <option value="Redes Sociais">Redes Sociais</option>
                        <option value="Outros">Outros</option>
                    </select>
                </div>
            </div>

            {/* Seção 4: Contato e Endereço */}
            <div className="border-t border-gray-100 dark:border-slate-700 pt-4">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2 mb-4">
                    <MapPin className="h-4 w-4 text-blue-500" />
                    Dados de Localização e Contato
                </h4>
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                    <div className="col-span-1 lg:col-span-3">
                        <div className="relative">
                            <input name="cep" value={formData.cep} onChange={handleChange} placeholder="CEP" maxLength={9} className={`w-full px-4 py-3 rounded-lg border ${cepLoading ? 'border-blue-400' : 'border-gray-300 dark:border-slate-600'} bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500`} />
                            {cepLoading && <div className="absolute right-3 top-3 h-5 w-5 animate-spin border-2 border-blue-500 border-t-transparent rounded-full" />}
                        </div>
                    </div>
                    <div className="col-span-1 lg:col-span-9">
                        <input name="endereco" value={formData.endereco} onChange={handleChange} placeholder="Endereço" className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white" />
                    </div>
                    <div className="col-span-1 lg:col-span-9">
                        <input name="cidade" value={formData.cidade} onChange={handleChange} placeholder="Cidade" className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white" />
                    </div>
                    <div className="col-span-1 lg:col-span-3">
                        <select name="uf" value={formData.uf} onChange={handleChange} className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500">
                            <option value="">UF</option>
                            {['AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'].map(uf => (
                                <option key={uf} value={uf}>{uf}</option>
                            ))}
                        </select>
                    </div>
                    <div className="col-span-1 lg:col-span-6">
                        <input name="telefone" value={formData.telefone} onChange={handleChange} placeholder="Telefone" className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white" />
                    </div>
                    <div className="col-span-1 lg:col-span-6">
                        <input name="celular" value={formData.celular} onChange={handleChange} placeholder="Celular" className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white" />
                    </div>
                    <div className="col-span-1 lg:col-span-12">
                        <textarea
                            name="observacoes"
                            value={formData.observacoes}
                            onChange={handleChange}
                            placeholder="OBSERVAÇÕES (CAIXA ALTA)"
                            rows={5}
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 resize-none font-mono text-sm"
                        />
                    </div>
                </div>
            </div>

            {/* Botões */}
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-slate-700">
                <Button variant="secondary" onClick={onCancel} type="button">Cancelar</Button>
                <Button type="submit" disabled={isLoading}>{isLoading ? 'Salvando...' : 'Salvar Cliente'}</Button>
            </div>
        </form>
    );
}

