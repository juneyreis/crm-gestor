import { useState, useEffect } from 'react';
import { Save, X, User, Briefcase, Calendar, DollarSign, Star, MapPin, Phone, Mail, FileText } from 'lucide-react';
import Button from '../Button';
import * as prospectsService from '../../services/prospectsService';

export default function ClienteForm({ cliente, onSuccess, onCancel, isLoading, segmentos, vendedores, prospects }) {
    const [formData, setFormData] = useState({
        prospect_id: '',
        segmento_id: '',
        vendedor_id: '',
        valor_contrato: '',
        tipo_contrato: 'Mensal',
        data_inicio_contrato: '',
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
        contato_principal: ''
    });

    const [loadingProspects, setLoadingProspects] = useState(false);
    const [errors, setErrors] = useState({});

    // Carregar dados iniciais (edição)
    useEffect(() => {
        if (cliente) {
            setFormData({
                ...cliente,
                // Garantir valores padrão para selects se estiverem vazios
                tipo_contrato: cliente.tipo_contrato || 'Mensal',
                periodicidade_pagamento: cliente.periodicidade_pagamento || 'Mensal',
                fonte_captacao: cliente.fonte_captacao || 'Indicação',
                nivel_satisfacao: cliente.nivel_satisfacao || '⭐⭐⭐'
            });
        }
    }, [cliente]);

    // Carregar lista de prospects para combobox - Agora vem via PROPS para manter o formulario puro
    // Prospects deve ser passado contendo todos os dados necessários (endereco, etc)

    // Handlers
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
    };

    // Handler para auto-preenchimento
    const handleProspectChange = (e) => {
        const prospectId = e.target.value;

        // Atualiza o select
        setFormData(prev => ({ ...prev, prospect_id: prospectId }));
        if (errors.prospect_id) setErrors(prev => ({ ...prev, prospect_id: null }));

        if (prospectId && prospects) {
            const selectedProspect = prospects.find(p => String(p.id) === String(prospectId));

            if (selectedProspect) {
                // Auto-fill
                setFormData(prev => ({
                    ...prev,
                    endereco: selectedProspect.endereco || '',
                    cidade: selectedProspect.cidade || '',
                    cep: selectedProspect.cep || '',
                    uf: selectedProspect.uf || '',
                    telefone: selectedProspect.telefone || '',
                    celular: selectedProspect.celular || '',
                    email_financeiro: selectedProspect.email || '', // Assume email do prospect
                    contato_principal: selectedProspect.contato || '',
                    segmento_id: selectedProspect.segmento_id || prev.segmento_id,
                    // Se tiver vendedor_id no prospect (geralmente é texto 'vendedor' na tabela prospect, mas se tiver ID melhor)
                    // Como a tabela prospect tem 'vendedor' TEXT, não dá pra mapear direto pro ID, a menos que tenhamos a logica reversa.
                    // Vamos manter o que o usuario selecionar ou vazio.
                }));
            }
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Validação básica
        const newErrors = {};
        if (!formData.prospect_id) newErrors.prospect_id = "Selecione um prospect";
        if (!formData.valor_contrato) newErrors.valor_contrato = "Informe o valor";

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        onSuccess(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Seção 1: Vínculo e Valor */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 dark:bg-slate-700/30 p-4 rounded-xl border border-gray-100 dark:border-slate-700">
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Prospect de Origem *
                    </label>
                    <div className="relative">
                        <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                        <select
                            name="prospect_id"
                            value={formData.prospect_id}
                            onChange={handleProspectChange}
                            disabled={!!cliente} // Não muda prospect na edição de cliente geralmente
                            className={`w-full pl-10 pr-4 py-3 rounded-lg border ${errors.prospect_id ? 'border-red-500' : 'border-gray-300 dark:border-slate-600'} bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 appearance-none`}
                        >
                            <option value="">Selecione um Prospect...</option>
                            {prospects && prospects.map(prospect => (
                                <option key={prospect.id} value={prospect.id}>
                                    {prospect.nome}
                                </option>
                            ))}
                        </select>
                        {errors.prospect_id && <p className="text-red-500 text-xs mt-1">{errors.prospect_id}</p>}
                    </div>
                    {/* Botão sutil para carregar dados se falhar auto-fill? Não, auto-fill é melhor */}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Valor do Contrato (R$) *
                    </label>
                    <div className="relative">
                        <DollarSign className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                        <input
                            type="number"
                            name="valor_contrato"
                            value={formData.valor_contrato}
                            onChange={handleChange}
                            step="0.01"
                            className={`w-full pl-10 pr-4 py-3 rounded-lg border ${errors.valor_contrato ? 'border-red-500' : 'border-gray-300 dark:border-slate-600'} bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500`}
                            placeholder="0,00"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Data Início
                    </label>
                    <div className="relative">
                        <Calendar className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                        <input
                            type="date"
                            name="data_inicio_contrato"
                            value={formData.data_inicio_contrato ? formData.data_inicio_contrato.split('T')[0] : ''}
                            onChange={handleChange}
                            className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>
            </div>

            {/* Seção 2: Detalhes do Contrato */}
            <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <FileText className="h-4 w-4 text-blue-500" />
                Detalhes do Contrato
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Tipo de Contrato
                    </label>
                    <select
                        name="tipo_contrato"
                        value={formData.tipo_contrato}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="Mensal">Mensal</option>
                        <option value="Trimestral">Trimestral</option>
                        <option value="Semestral">Semestral</option>
                        <option value="Anual">Anual</option>
                        <option value="Avulso">Avulso</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Periodicidade Pagamento
                    </label>
                    <select
                        name="periodicidade_pagamento"
                        value={formData.periodicidade_pagamento}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="Mensal">Mensal</option>
                        <option value="Trimestral">Trimestral</option>
                        <option value="Semestral">Semestral</option>
                        <option value="Anual">Anual</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Nível de Satisfação
                    </label>
                    <select
                        name="nivel_satisfacao"
                        value={formData.nivel_satisfacao}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 text-yellow-500 font-bold"
                    >
                        <option value="⭐">⭐ (Baixo)</option>
                        <option value="⭐⭐">⭐⭐ (Regular)</option>
                        <option value="⭐⭐⭐">⭐⭐⭐ (Bom)</option>
                        <option value="⭐⭐⭐⭐">⭐⭐⭐⭐ (Muito Bom)</option>
                        <option value="⭐⭐⭐⭐⭐">⭐⭐⭐⭐⭐ (Excelente)</option>
                    </select>
                </div>
            </div>

            {/* Seção 3: Classificação */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Segmento</label>
                    <select
                        name="segmento_id"
                        value={formData.segmento_id}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">Selecione...</option>
                        {segmentos?.map(s => (
                            <option key={s.id} value={s.id}>{s.descricao}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Vendedor</label>
                    <select
                        name="vendedor_id"
                        value={formData.vendedor_id}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">Selecione...</option>
                        {vendedores?.map(v => (
                            <option key={v.id} value={v.id}>{v.nome}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Fonte de Captação</label>
                    <select
                        name="fonte_captacao"
                        value={formData.fonte_captacao}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    >
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
                    Dados de Contato (Auto-preenchido)
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input name="endereco" value={formData.endereco} onChange={handleChange} placeholder="Endereço" className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-slate-600 bg-gray-50 dark:bg-slate-800 text-gray-600 dark:text-gray-300" />
                    <input name="cidade" value={formData.cidade} onChange={handleChange} placeholder="Cidade" className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-slate-600 bg-gray-50 dark:bg-slate-800 text-gray-600 dark:text-gray-300" />
                    <input name="telefone" value={formData.telefone} onChange={handleChange} placeholder="Telefone" className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-slate-600 bg-gray-50 dark:bg-slate-800 text-gray-600 dark:text-gray-300" />
                    <input name="observacoes" value={formData.observacoes} onChange={handleChange} placeholder="Observações" className="md:col-span-2 w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white" />
                </div>
            </div>

            {/* Botões */}
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-slate-700">
                <Button variant="secondary" onClick={onCancel} type="button">
                    Cancelar
                </Button>
                <Button type="submit" disabled={isLoading}>
                    {isLoading ? (
                        <>
                            <span className="animate-spin mr-2">⏳</span>
                            Salvando...
                        </>
                    ) : (
                        <>
                            <Save className="h-4 w-4 mr-2" />
                            Salvar Cliente
                        </>
                    )}
                </Button>
            </div>
        </form>
    );
}
