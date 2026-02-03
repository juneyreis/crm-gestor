// src/components/prospects/ProspectForm.jsx - VERSÃO ESTÁVEL
import { useState, useEffect } from 'react';
import { Save, X, Building, MapPin, User, Phone, FileText, Hash } from 'lucide-react';
import Button from '../Button';
import useCEP from '../../hooks/useCEP';
import { supabaseClient as supabase } from '../../lib/supabaseClient';
import useAuth from '../../hooks/useAuth';

const initialForm = {
    nome: '',
    segmento_id: '',
    concorrente_id: '',
    vendedor: '',
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

    // Preencher formulário se estiver editando - SEM LOOP
    useEffect(() => {
        if (prospect) {
            // Preenche o formulário apenas uma vez quando o prospect muda
            const prospectData = {
                nome: prospect.nome || '',
                segmento_id: prospect.segmento_id || '',
                concorrente_id: prospect.concorrente_id || '',
                vendedor: prospect.vendedor || '',
                status: prospect.status || 'Novo',
                classificacao: prospect.classificacao || 'Cold',
                cep: formatCEP(prospect.cep || ''),
                endereco: prospect.endereco || '',
                bairro: prospect.bairro || '',
                cidade: prospect.cidade || '',
                uf: prospect.uf || '',
                telefone: prospect.telefone || '',
                celular: prospect.celular || '',
                contato: prospect.contato || '',
                email: prospect.email || '',
                observacoes: prospect.observacoes || ''
            };
            
            // Atualiza apenas se realmente mudou
            setForm(prospectData);
        }
    }, [prospect]); // formatCEP removido das dependências

    // Atualizar endereço quando CEP for buscado
    useEffect(() => {
        if (address && !prospect) {
            // Só preenche automaticamente se for um novo prospect
            setForm(prev => ({
                ...prev,
                endereco: prev.endereco || address.logradouro || '',
                bairro: prev.bairro || address.bairro || '',
                cidade: prev.cidade || (address.cidade || '').toUpperCase(),
                uf: prev.uf || address.uf || ''
            }));
        }
    }, [address, prospect]);

    // Formatar telefone - função local
    const formatarTelefone = (value) => {
        const apenasNumeros = value.replace(/\D/g, '');
        const limitado = apenasNumeros.slice(0, 11);

        if (limitado.length <= 2) {
            return limitado;
        } else if (limitado.length <= 7) {
            return `(${limitado.slice(0, 2)}) ${limitado.slice(2)}`;
        } else if (limitado.length === 10) {
            return `(${limitado.slice(0, 2)}) ${limitado.slice(2, 6)}-${limitado.slice(6)}`;
        } else if (limitado.length === 11) {
            return `(${limitado.slice(0, 2)}) ${limitado.slice(2, 7)}-${limitado.slice(7)}`;
        }
        return limitado;
    };

    // Formatador de CEP local para evitar dependências
    const formatarCEP = (value) => {
        const apenasNumeros = value.replace(/\D/g, '');
        if (apenasNumeros.length <= 5) {
            return apenasNumeros;
        } else {
            return `${apenasNumeros.slice(0, 5)}-${apenasNumeros.slice(5, 8)}`;
        }
    };

    // Handle Change simples e eficaz
    const handleChange = (e) => {
        const { name, value } = e.target;
        
        if (name === 'cep') {
            const formattedCEP = formatarCEP(value);
            setForm(prev => ({ ...prev, [name]: formattedCEP }));
            
            // Buscar CEP se completo
            if (formattedCEP.length === 9) {
                fetchCEP(formattedCEP);
            }
        } else if (name === 'telefone' || name === 'celular') {
            const formattedPhone = formatarTelefone(value);
            setForm(prev => ({ ...prev, [name]: formattedPhone }));
        } else {
            // Para todos os outros campos, apenas atualiza o valor
            setForm(prev => ({ ...prev, [name]: value }));
        }

        // Limpar erro do campo se existir
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!form.nome?.trim()) newErrors.nome = 'Nome é obrigatório';
        if (!form.segmento_id) newErrors.segmento_id = 'Segmento é obrigatório';
        if (!form.concorrente_id) newErrors.concorrente_id = 'Concorrente é obrigatório';
        if (!form.vendedor) newErrors.vendedor = 'Vendedor é obrigatório';
        if (!form.cidade?.trim()) newErrors.cidade = 'Cidade é obrigatória';
        if (!form.uf) newErrors.uf = 'UF é obrigatória';
        if (!form.status) newErrors.status = 'Status é obrigatório';
        if (!form.classificacao) newErrors.classificacao = 'Classificação é obrigatória';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        // Verificar autenticação
        if (!user || !user.id) {
            alert('Usuário não autenticado. Faça login novamente.');
            return;
        }

        // Aplicar uppercase apenas no momento do salvamento
        const dadosParaSalvar = {
            nome: form.nome.toUpperCase(),
            segmento_id: form.segmento_id,
            concorrente_id: form.concorrente_id,
            vendedor: form.vendedor,
            status: form.status,
            classificacao: form.classificacao,
            cep: form.cep,
            endereco: form.endereco.toUpperCase(),
            bairro: form.bairro.toUpperCase(),
            cidade: form.cidade.toUpperCase(),
            uf: form.uf.toUpperCase(),
            telefone: form.telefone,
            celular: form.celular,
            contato: form.contato.toUpperCase(),
            email: form.email,
            observacoes: form.observacoes.toUpperCase(),
            user_id: user.id
        };

        try {
            if (prospect && prospect.id) {
                // Update
                const { error } = await supabase
                    .from('prospects')
                    .update(dadosParaSalvar)
                    .eq('id', prospect.id);

                if (error) throw error;
            } else {
                // Create
                const { error } = await supabase
                    .from('prospects')
                    .insert([dadosParaSalvar]);

                if (error) throw error;
            }

            if (onSuccess) onSuccess();
            if (!prospect) setForm(initialForm);

        } catch (error) {
            console.error('Erro ao salvar prospect:', error);
            alert(`Erro ao salvar prospect: ${error.message}`);
        }
    };

    const handleCancel = () => {
        if (prospect && onCancel) {
            onCancel();
        } else {
            setForm(initialForm);
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
                        className={`w-full px-4 py-3 rounded-lg border ${errors.nome ? 'border-red-500' : 'border-gray-300'} focus:ring-2 focus:ring-blue-500`}
                        required
                        placeholder="Nome da Empresa"
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
            <h3 className="text-sm font-semibold text-gray-500 mb-4">Endereço e Contato</h3>

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
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500"
                        placeholder="Endereço completo"
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
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500"
                        placeholder="Bairro"
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
                        className={`w-full px-4 py-3 rounded-lg border ${errors.cidade ? 'border-red-500' : 'border-gray-300'} focus:ring-2 focus:ring-blue-500`}
                        placeholder="Digite a cidade..."
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
                        placeholder="email@exemplo.com"
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
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500"
                        placeholder="Nome do contato"
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
                    rows={3}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 resize-none"
                    placeholder="Observações adicionais"
                />
            </div>

            {/* Botões */}
            <div className="flex flex-wrap gap-4 pt-6 border-t border-gray-200">
                <Button type="submit" variant="primary" disabled={isSaving || cepLoading} className="flex items-center gap-2 px-6">
                    {isSaving ? 'Salvando...' : <><Save className="h-4 w-4" /> {prospect ? 'Atualizar Prospect' : 'Salvar Prospect'}</>}
                </Button>

                <Button type="button" variant="secondary" onClick={handleCancel} className="flex items-center gap-2 px-6">
                    <X className="h-4 w-4" /> {prospect ? 'Cancelar Edição' : 'Limpar Formulário'}
                </Button>
            </div>
        </form>
    );
}
