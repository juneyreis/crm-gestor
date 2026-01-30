// src/components/prospects/ProspectForm.jsx
import { useState, useEffect } from 'react';
import { Save, X, Building, MapPin, User, Phone, FileText, AlertCircle, Search, Hash } from 'lucide-react';
import Button from '../Button';
import useCEP from '../../hooks/useCEP';
import { supabaseClient as supabase } from '../../lib/supabaseClient';
import useAuth from '../../hooks/useAuth';

const initialForm = {
    nome: '',
    segmento_id: '',
    concorrente_id: '',
    vendedor: '', // Nome do vendedor (TEXT)
    status: 'Novo',
    classificacao: 'Cold',
    cep: '',
    endereco: '',
    bairro: '',
    cidade: '',
    uf: '',
    telefone: '',
    celular: '',
    contato: '',
    email: '',
    observacoes: ''
};

const CLASSIFICATION_COLORS = {
    'Ice': 'bg-[#E0F7FA] text-cyan-800 border-cyan-200',
    'Cold': 'bg-[#B3E5FC] text-blue-800 border-blue-200',
    'Warm': 'bg-[#FFECB3] text-orange-800 border-orange-200',
    'Hot': 'bg-[#FFCDD2] text-red-800 border-red-200'
};

export default function ProspectForm({
    prospect,
    onSuccess,
    onCancel,
    isLoading: isSaving,
    segmentos = [],
    concorrentes = [],
    vendedores = []
}) {
    const [form, setForm] = useState(initialForm);
    const [errors, setErrors] = useState({});
    const { user } = useAuth();

    // Hook de CEP
    const {
        address,
        loading: cepLoading,
        error: cepError,
        cepStatus,
        fetchCEP,
        formatCEP,
        clearAddress
    } = useCEP();

    useEffect(() => {
        if (prospect) {
            setForm({
                ...prospect,
                // Garantir que valores nulos venham como string vazia
                segmento_id: prospect.segmento_id || '',
                concorrente_id: prospect.concorrente_id || '',
                vendedor: prospect.vendedor || '',
                telefone: prospect.telefone || '',
                celular: prospect.celular || '',
                email: prospect.email || '',
                contato: prospect.contato || '',
                observacoes: prospect.observacoes || '',
                cep: formatCEP(prospect.cep || '')
            });
        } else {
            setForm(initialForm);
        }
    }, [prospect, formatCEP]);

    useEffect(() => {
        if (address) {
            setForm(prev => ({
                ...prev,
                endereco: prev.endereco ? prev.endereco : address.logradouro,
                bairro: prev.bairro ? prev.bairro : address.bairro,
                cidade: (prev.cidade ? prev.cidade : address.cidade).toUpperCase(),
                uf: prev.uf ? prev.uf : address.uf
            }));
        }
    }, [address]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        let finalValue = value;

        // Máscaras de telefone/celular
        if (name === 'telefone' || name === 'celular') {
            const nums = value.replace(/\D/g, '');
            if (nums.length <= 10) {
                // (XX) XXXX-XXXX
                finalValue = nums.replace(/^(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
            } else {
                // (XX) XXXXX-XXXX
                finalValue = nums.replace(/^(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3').slice(0, 15);
            }
        }

        // Formatação de CEP
        if (name === 'cep') {
            finalValue = formatCEP(value);
            // Se tiver 9 caracteres (XXXXX-XXX), busca
            if (finalValue.length === 9) {
                fetchCEP(finalValue);
            }
        }

        setForm(prev => ({ ...prev, [name]: finalValue }));

        // Limpar erro específico
        if (errors[name]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };


    const handleBlur = (e) => {
        const { name, value } = e.target;
        // Convertendo para maiúsculas no blur (exceto email)
        if (name !== 'email' && typeof value === 'string') {
            // Não converter CEP pois já tem formatação específica, mas não quebra se converter
            if (name !== 'cep') {
                setForm(prev => ({ ...prev, [name]: value.toUpperCase() }));
            }
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!form.nome?.trim()) newErrors.nome = 'Nome é obrigatório';
        if (!form.segmento_id) newErrors.segmento_id = 'Segmento é obrigatório';
        if (!form.concorrente_id) newErrors.concorrente_id = 'Concorrente é obrigatório';
        if (!form.vendedor) newErrors.vendedor = 'Vendedor é obrigatório';
        if (!form.uf) newErrors.uf = 'UF é obrigatória';
        if (!form.status) newErrors.status = 'Status é obrigatório';
        if (!form.classificacao) newErrors.classificacao = 'Classificação é obrigatória';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        // Preparar dados - Remover campos que não são da tabela e formatar
        // Destruturamos 'form' para separar o que não vai para o banco (objetos de join, id, datas auto-geradas)
        const {
            segmentos: _s,
            concorrentes: _c,
            id: _id,
            data_cadastro: _dc,
            ultimo_contato: _uc,
            ...formLimpo
        } = form;

        const dadosParaSalvar = {
            ...formLimpo,
            nome: form.nome.toUpperCase(),
            endereco: form.endereco?.toUpperCase(),
            bairro: form.bairro?.toUpperCase(),
            cidade: form.cidade?.toUpperCase(),
            uf: form.uf?.toUpperCase(),
            contato: form.contato?.toUpperCase(),
            observacoes: form.observacoes?.toUpperCase(),
            email: form.email || null,
            user_id: user.id
        };

        try {
            if (prospect) {
                // Update
                const { data, error } = await supabase
                    .from('prospects')
                    .update(dadosParaSalvar)
                    .eq('id', prospect.id);

                if (error) throw error;
            } else {
                // Create
                const { data, error } = await supabase
                    .from('prospects')
                    .insert([dadosParaSalvar]);

                if (error) throw error;
            }

            if (onSuccess) onSuccess();
            if (!prospect) setForm(initialForm);

        } catch (error) {
            console.error('Erro ao salvar prospect:', error);
            alert('Erro ao salvar prospect. Verifique os dados.');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Nome */}
                <div className="space-y-2 lg:col-span-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                        <Building className="h-4 w-4" /> Nome / Empresa *
                    </label>
                    <input
                        type="text"
                        name="nome"
                        value={form.nome}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className={`w-full px-4 py-3 rounded-lg border ${errors.nome ? 'border-red-500' : 'border-gray-300'} uppercase focus:ring-2 focus:ring-blue-500`}
                        required
                    />
                    {errors.nome && <span className="text-xs text-red-500">{errors.nome}</span>}
                </div>

                {/* Vendedor */}
                <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                        <User className="h-4 w-4" /> Vendedor *
                    </label>
                    <select
                        name="vendedor"
                        value={form.vendedor}
                        onChange={handleChange}
                        className={`w-full px-4 py-3 rounded-lg border ${errors.vendedor ? 'border-red-500' : 'border-gray-300'} focus:ring-2 focus:ring-blue-500`}
                        required
                    >
                        <option value="">Selecione...</option>
                        {vendedores.map(v => (
                            <option key={v.id} value={v.nome}>{v.nome}</option>
                        ))}
                    </select>
                    {errors.vendedor && <span className="text-xs text-red-500">{errors.vendedor}</span>}
                </div>

                {/* Segmento */}
                <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                        <Hash className="h-4 w-4" /> Segmento *
                    </label>
                    <select
                        name="segmento_id"
                        value={form.segmento_id}
                        onChange={handleChange}
                        className={`w-full px-4 py-3 rounded-lg border ${errors.segmento_id ? 'border-red-500' : 'border-gray-300'} focus:ring-2 focus:ring-blue-500`}
                        required
                    >
                        <option value="">Selecione...</option>
                        {segmentos.map(s => (
                            <option key={s.id} value={s.id}>{s.descricao}</option>
                        ))}
                    </select>
                    {errors.segmento_id && <span className="text-xs text-red-500">{errors.segmento_id}</span>}
                </div>

                {/* Concorrente */}
                <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                        <Building className="h-4 w-4" /> Concorrente *
                    </label>
                    <select
                        name="concorrente_id"
                        value={form.concorrente_id}
                        onChange={handleChange}
                        className={`w-full px-4 py-3 rounded-lg border ${errors.concorrente_id ? 'border-red-500' : 'border-gray-300'} focus:ring-2 focus:ring-blue-500`}
                        required
                    >
                        <option value="">Selecione...</option>
                        {concorrentes.map(c => (
                            <option key={c.id} value={c.id}>{c.descricao}</option>
                        ))}
                    </select>
                    {errors.concorrente_id && <span className="text-xs text-red-500">{errors.concorrente_id}</span>}
                </div>

                {/* Status */}
                <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                        <FileText className="h-4 w-4" /> Status *
                    </label>
                    <select
                        name="status"
                        value={form.status}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500"
                        required
                    >
                        {['Novo', 'Em contato', 'Visitado', 'Convertido', 'Perdido', 'Descartado'].map(s => (
                            <option key={s} value={s}>{s}</option>
                        ))}
                    </select>
                </div>

                {/* Classificação */}
                <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                        <FileText className="h-4 w-4" /> Classificação *
                    </label>
                    <div className="flex gap-2">
                        {['Ice', 'Cold', 'Warm', 'Hot'].map(c => (
                            <button
                                key={c}
                                type="button"
                                onClick={() => setForm(prev => ({ ...prev, classificacao: c }))}
                                className={`flex-1 py-2 rounded-lg border text-sm font-medium transition-all ${form.classificacao === c
                                    ? `${CLASSIFICATION_COLORS[c]} ring-2 ring-offset-1 ring-blue-300`
                                    : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                                    }`}
                            >
                                {c}
                            </button>
                        ))}
                    </div>
                    {errors.classificacao && <span className="text-xs text-red-500">{errors.classificacao}</span>}
                </div>
            </div>

            <div className="border-t border-gray-100 my-4"></div>
            <h3 className="tex-sm font-semibold text-gray-500 mb-4">Endereço e Contato</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* CEP */}
                <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                        <MapPin className="h-4 w-4" /> CEP
                    </label>
                    <div className="relative">
                        <input
                            type="text"
                            name="cep"
                            value={form.cep}
                            onChange={handleChange}
                            className={`w-full px-4 py-3 rounded-lg border ${cepStatus === 'error' ? 'border-red-500' :
                                cepStatus === 'success' ? 'border-green-500' : 'border-gray-300'
                                } focus:ring-2 focus:ring-blue-500`}
                            placeholder="00000-000"
                            maxLength={9}
                        />
                        {cepLoading && (
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin border-2 border-blue-600 border-t-transparent rounded-full" />
                        )}
                    </div>
                    {cepError && <span className="text-xs text-red-500">{cepError}</span>}
                </div>

                {/* Endereço */}
                <div className="space-y-2 lg:col-span-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                        Endereço
                    </label>
                    <input
                        type="text"
                        name="endereco"
                        value={form.endereco}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 uppercase focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                {/* Bairro */}
                <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                        Bairro
                    </label>
                    <input
                        type="text"
                        name="bairro"
                        value={form.bairro}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 uppercase focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                {/* Cidade */}
                <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                        <MapPin className="h-4 w-4" /> Cidade *
                    </label>
                    <input
                        type="text"
                        name="cidade"
                        value={form.cidade}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className={`w-full px-4 py-3 rounded-lg border ${errors.cidade ? 'border-red-500' : 'border-gray-300'} uppercase focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
                        placeholder="DIGITE A CIDADE..."
                        required
                    />
                    {errors.cidade && <span className="text-xs text-red-500">{errors.cidade}</span>}
                </div>

                {/* UF */}
                <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                        UF *
                    </label>
                    <select
                        name="uf"
                        value={form.uf}
                        onChange={handleChange}
                        className={`w-full px-4 py-3 rounded-lg border ${errors.uf ? 'border-red-500' : 'border-gray-300'} focus:ring-2 focus:ring-blue-500`}
                        required
                    >
                        <option value="">UF</option>
                        {['AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'].map(uf => (
                            <option key={uf} value={uf}>{uf}</option>
                        ))}
                    </select>
                    {errors.uf && <span className="text-xs text-red-500">{errors.uf}</span>}
                </div>

                {/* Telefone */}
                <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                        <Phone className="h-4 w-4" /> Telefone
                    </label>
                    <input
                        type="text"
                        name="telefone"
                        value={form.telefone}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500"
                        placeholder="(XX) XXXX-XXXX"
                    />
                </div>

                {/* Celular */}
                <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                        <Phone className="h-4 w-4" /> Celular
                    </label>
                    <input
                        type="text"
                        name="celular"
                        value={form.celular}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500"
                        placeholder="(XX) XXXXX-XXXX"
                    />
                </div>

                {/* Email */}
                <div className="space-y-2 lg:col-span-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                        Email
                    </label>
                    <input
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                {/* Contato (Pessoa) */}
                <div className="space-y-2 lg:col-span-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                        <User className="h-4 w-4" /> Contato (Pessoa)
                    </label>
                    <input
                        type="text"
                        name="contato"
                        value={form.contato}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 uppercase focus:ring-2 focus:ring-blue-500"
                    />
                </div>
            </div>

            {/* Observações */}
            <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <FileText className="h-4 w-4" /> Observações
                </label>
                <textarea
                    name="observacoes"
                    value={form.observacoes}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    rows={3}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 uppercase focus:ring-2 focus:ring-blue-500 resize-none"
                />
            </div>

            {/* Botões */}
            <div className="flex flex-wrap gap-4 pt-6 border-t border-gray-200">
                <Button type="submit" variant="primary" disabled={isSaving || cepLoading} className="flex items-center gap-2 px-6">
                    {isSaving ? 'Salvando...' : <><Save className="h-4 w-4" /> {prospect ? 'Atualizar Prospect' : 'Salvar Prospect'}</>}
                </Button>

                <Button type="button" variant="secondary" onClick={() => { onCancel && onCancel(); if (!prospect) setForm(initialForm); }} className="flex items-center gap-2 px-6">
                    <X className="h-4 w-4" /> {prospect ? 'Cancelar Edição' : 'Limpar Formulário'}
                </Button>
            </div>
        </form>
    );
}
