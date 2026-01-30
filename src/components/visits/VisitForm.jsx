// src/components/visits/VisitForm.jsx - ATUALIZADO
import { useState, useEffect } from 'react';
import { Save, X, Calendar, Building, MapPin, User, Phone, FileText, AlertCircle } from 'lucide-react';
import Button from '../Button';
import { cidades } from '../../data/cidades';
import { concorrentes } from '../../data/concorrentes';
import { regimes } from '../../data/regimes';
import { supabaseClient as supabase } from '../../lib/supabaseClient';
import useAuth from '../../hooks/useAuth';
import * as visitasService from '../../services/visitasService';

const initialForm = {
  data: '',
  prospect: '',
  endereco: '',
  cidade: '',
  bairro: '',
  contato: '',
  telefone: '',
  sistema: '',
  regime: '',
  observacoes: '',
  outroCidade: '',
  outroSistema: ''
};

export default function VisitForm({ visit, onSuccess, onCancel, isLoading }) {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [showOutroCidade, setShowOutroCidade] = useState(false);
  const [showOutroSistema, setShowOutroSistema] = useState(false);
  const { user } = useAuth();

  // Formatar telefone - Aceita tanto fixo (10 dígitos) quanto móvel (11 dígitos)
  const formatarTelefone = (value) => {
    // Remover caracteres não numéricos
    const apenasNumeros = value.replace(/\D/g, '');

    // Limitar a 11 dígitos
    const limitado = apenasNumeros.slice(0, 11);

    // Detecção automática: 10 = fixo, 11 = móvel
    if (limitado.length <= 2) {
      return limitado;
    } else if (limitado.length <= 7) {
      // Para ambos os casos (fixo e móvel)
      return `(${limitado.slice(0, 2)}) ${limitado.slice(2)}`;
    } else if (limitado.length === 10) {
      // Telefone FIXO: (XX) XXXX-XXXX
      return `(${limitado.slice(0, 2)}) ${limitado.slice(2, 6)}-${limitado.slice(6)}`;
    } else if (limitado.length === 11) {
      // Telefone MÓVEL: (XX) XXXXX-XXXX
      return `(${limitado.slice(0, 2)}) ${limitado.slice(2, 7)}-${limitado.slice(7)}`;
    }

    return limitado;
  };

  // Preencher formulário se estiver editando
  useEffect(() => {
    if (visit) {
      const cidade = visit.cidade || '';
      const sistema = visit.sistema || '';

      const formData = {
        ...visit,
        cidade: cidade.startsWith('OUTRA:') ? 'OUTRA' : cidade,
        sistema: sistema.startsWith('OUTROS:') ? 'OUTROS' : (sistema || ''),
        outroCidade: cidade.startsWith('OUTRA:') ? cidade.replace('OUTRA: ', '') : '',
        outroSistema: sistema.startsWith('OUTROS:') ? sistema.replace('OUTROS: ', '') : ''
      };

      setForm(formData);
      setShowOutroCidade(cidade.startsWith('OUTRA:'));
      setShowOutroSistema(sistema.startsWith('OUTROS:'));
    } else {
      resetForm();
    }
  }, [visit]);

  // Definir data atual como padrão (usando data local do sistema, sem timezone)
  useEffect(() => {
    if (!visit && !form.data) {
      // Corrigir timezone para obter a data LOCAL do usuário
      const today = new Date();
      const localToday = new Date(today.getTime() - (today.getTimezoneOffset() * 60000));

      const year = localToday.getFullYear();
      const month = String(localToday.getMonth() + 1).padStart(2, '0');
      const day = String(localToday.getDate()).padStart(2, '0');
      const localDateString = `${year}-${month}-${day}`;
      setForm(prev => ({ ...prev, data: localDateString }));
    }
  }, [visit, form.data]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    // NÃO converter para maiúscula durante digitação (causa problema com cursor em textarea)
    // A conversão acontece no handleSubmit() na gravação
    let finalValue = value;

    // Aplicar máscara de telefone
    if (name === 'telefone') {
      finalValue = formatarTelefone(value);
    }

    setForm(prev => ({ ...prev, [name]: finalValue }));

    // Limpar erro do campo
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }

    // Mostrar/ocultar campo "outro" para cidade
    if (name === 'cidade') {
      setShowOutroCidade(value === 'OUTRA');
      if (value !== 'OUTRA') {
        setForm(prev => ({ ...prev, outroCidade: '' }));
      }
    }

    // Mostrar/ocultar campo "outro" para sistema
    if (name === 'sistema') {
      setShowOutroSistema(value === 'OUTROS');
      if (value !== 'OUTROS') {
        setForm(prev => ({ ...prev, outroSistema: '' }));
      }
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!form.data) newErrors.data = 'Data é obrigatória';
    if (!form.prospect?.trim()) newErrors.prospect = 'Prospect é obrigatório';
    if (!form.endereco?.trim()) newErrors.endereco = 'Endereço é obrigatório';

    if (!form.cidade) {
      newErrors.cidade = 'Cidade é obrigatória';
    } else if (form.cidade === 'OUTRA' && !form.outroCidade?.trim()) {
      newErrors.outroCidade = 'Informe o nome da cidade';
    }

    if (!form.regime) newErrors.regime = 'Regime fiscal é obrigatório';

    if (form.sistema === 'OUTROS' && !form.outroSistema?.trim()) {
      newErrors.outroSistema = 'Informe o sistema utilizado';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Preparar dados para salvar
    const visitaData = {
      data: form.data,
      prospect: form.prospect.toUpperCase(),
      endereco: form.endereco.toUpperCase(),
      cidade: form.cidade === 'OUTRA'
        ? `OUTRA: ${form.outroCidade}`.toUpperCase()
        : form.cidade.toUpperCase(),
      bairro: form.bairro?.toUpperCase() || '',
      contato: form.contato?.toUpperCase() || '',
      telefone: form.telefone || '',
      sistema: form.sistema === 'OUTROS'
        ? `OUTROS: ${form.outroSistema}`.toUpperCase()
        : (form.sistema?.toUpperCase() || 'INDEFINIDO'),
      regime: form.regime.toUpperCase(),
      observacoes: form.observacoes?.toUpperCase() || ''
    };

    try {
      if (visit) {
        // Atualizar visita existente
        await visitasService.atualizarVisita(visit.id, visitaData, user.id);
        if (onSuccess) onSuccess();
      } else {
        // Criar nova visita
        await visitasService.criarVisita(visitaData, user.id);
        if (onSuccess) onSuccess();
        resetForm();
      }
    } catch (error) {
      console.error('Erro ao salvar visita:', error);
    }
  };

  const resetForm = () => {
    setForm(initialForm);
    setErrors({});
    setShowOutroCidade(false);
    setShowOutroSistema(false);

    // Definir data atual (usando data local do sistema, sem timezone)
    // Corrigir timezone para obter a data LOCAL do usuário
    const today = new Date();
    const localToday = new Date(today.getTime() - (today.getTimezoneOffset() * 60000));

    const year = localToday.getFullYear();
    const month = String(localToday.getMonth() + 1).padStart(2, '0');
    const day = String(localToday.getDate()).padStart(2, '0');
    const localDateString = `${year}-${month}-${day}`;
    setTimeout(() => {
      setForm(prev => ({ ...prev, data: localDateString }));
    }, 0);
  };

  const handleCancel = () => {
    if (visit && onCancel) {
      onCancel();
    } else {
      resetForm();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Grid Responsivo de Campos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Data */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <Calendar className="h-4 w-4" />
            Data da Visita *
          </label>
          <input
            type="date"
            name="data"
            value={form.data}
            onChange={handleChange}
            className={`w-full px-4 py-3 rounded-lg border ${errors.data ? 'border-red-300 bg-red-50' : 'border-gray-300'
              } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
            required
          />
          {errors.data && (
            <p className="text-sm text-red-600 flex items-center gap-1 mt-1">
              <AlertCircle className="h-3 w-3" />
              {errors.data}
            </p>
          )}
        </div>

        {/* Prospect */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <Building className="h-4 w-4" />
            Prospect/Empresa *
          </label>
          <input
            type="text"
            name="prospect"
            value={form.prospect}
            onChange={handleChange}
            className={`w-full px-4 py-3 rounded-lg border ${errors.prospect ? 'border-red-300 bg-red-50' : 'border-gray-300'
              } focus:ring-2 focus:ring-blue-500 focus:border-transparent uppercase`}
            placeholder="NOME DA EMPRESA"
            required
          />
          {errors.prospect && (
            <p className="text-sm text-red-600 flex items-center gap-1 mt-1">
              <AlertCircle className="h-3 w-3" />
              {errors.prospect}
            </p>
          )}
        </div>

        {/* Endereço */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <MapPin className="h-4 w-4" />
            Endereço *
          </label>
          <input
            type="text"
            name="endereco"
            value={form.endereco}
            onChange={handleChange}
            className={`w-full px-4 py-3 rounded-lg border ${errors.endereco ? 'border-red-300 bg-red-50' : 'border-gray-300'
              } focus:ring-2 focus:ring-blue-500 focus:border-transparent uppercase`}
            placeholder="ENDEREÇO COMPLETO"
            required
          />
          {errors.endereco && (
            <p className="text-sm text-red-600 flex items-center gap-1 mt-1">
              <AlertCircle className="h-3 w-3" />
              {errors.endereco}
            </p>
          )}
        </div>

        {/* Cidade */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <MapPin className="h-4 w-4" />
            Cidade *
          </label>
          <select
            name="cidade"
            value={form.cidade}
            onChange={handleChange}
            className={`w-full px-4 py-3 rounded-lg border ${errors.cidade ? 'border-red-300 bg-red-50' : 'border-gray-300'
              } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
            required
          >
            <option value="">Selecione uma cidade</option>
            {cidades.map(cidade => (
              <option key={cidade} value={cidade}>{cidade}</option>
            ))}
          </select>
          {errors.cidade && (
            <p className="text-sm text-red-600 flex items-center gap-1 mt-1">
              <AlertCircle className="h-3 w-3" />
              {errors.cidade}
            </p>
          )}
        </div>

        {/* Outro Cidade (se selecionado) */}
        {showOutroCidade && (
          <div className="space-y-2 md:col-span-2 lg:col-span-1">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <MapPin className="h-4 w-4" />
              Especifique a cidade *
            </label>
            <input
              type="text"
              name="outroCidade"
              value={form.outroCidade || ''}
              onChange={handleChange}
              className={`w-full px-4 py-3 rounded-lg border ${errors.outroCidade ? 'border-red-300 bg-red-50' : 'border-gray-300'
                } focus:ring-2 focus:ring-blue-500 focus:border-transparent uppercase`}
              placeholder="NOME DA CIDADE"
            />
            {errors.outroCidade && (
              <p className="text-sm text-red-600 flex items-center gap-1 mt-1">
                <AlertCircle className="h-3 w-3" />
                {errors.outroCidade}
              </p>
            )}
          </div>
        )}

        {/* Bairro */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <MapPin className="h-4 w-4" />
            Bairro
          </label>
          <input
            type="text"
            name="bairro"
            value={form.bairro}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent uppercase"
            placeholder="BAIRRO"
          />
        </div>

        {/* Contato */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <User className="h-4 w-4" />
            Contato
          </label>
          <input
            type="text"
            name="contato"
            value={form.contato}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent uppercase"
            placeholder="NOME DO CONTATO"
          />
        </div>

        {/* Telefone */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <Phone className="h-4 w-4" />
            Telefone
          </label>
          <input
            type="tel"
            name="telefone"
            value={form.telefone}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="(00) 00000-0000"
          />
        </div>

        {/* Sistema */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <FileText className="h-4 w-4" />
            Concorrente Atual
          </label>
          <select
            name="sistema"
            value={form.sistema}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Selecione o concorrente atual</option>
            {concorrentes.map(concorrente => (
              <option key={concorrente} value={concorrente}>{concorrente}</option>
            ))}
          </select>
        </div>

        {/* Outro Sistema (se selecionado) */}
        {showOutroSistema && (
          <div className="space-y-2 md:col-span-2 lg:col-span-1">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <FileText className="h-4 w-4" />
              Especifique o concorrente
            </label>
            <input
              type="text"
              name="outroSistema"
              value={form.outroSistema || ''}
              onChange={handleChange}
              className={`w-full px-4 py-3 rounded-lg border ${errors.outroSistema ? 'border-red-300 bg-red-50' : 'border-gray-300'
                } focus:ring-2 focus:ring-blue-500 focus:border-transparent uppercase`}
              placeholder="NOME DO CONCORRENTE"
            />
            {errors.outroSistema && (
              <p className="text-sm text-red-600 flex items-center gap-1 mt-1">
                <AlertCircle className="h-3 w-3" />
                {errors.outroSistema}
              </p>
            )}
          </div>
        )}

        {/* Regime Fiscal */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <FileText className="h-4 w-4" />
            Regime Fiscal *
          </label>
          <select
            name="regime"
            value={form.regime}
            onChange={handleChange}
            className={`w-full px-4 py-3 rounded-lg border ${errors.regime ? 'border-red-300 bg-red-50' : 'border-gray-300'
              } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
            required
          >
            <option value="">Selecione o regime</option>
            {regimes.map(regime => (
              <option key={regime} value={regime}>{regime}</option>
            ))}
          </select>
          {errors.regime && (
            <p className="text-sm text-red-600 flex items-center gap-1 mt-1">
              <AlertCircle className="h-3 w-3" />
              {errors.regime}
            </p>
          )}
        </div>
      </div>

      {/* Observações (largura total) */}
      <div className="space-y-2">
        <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
          <FileText className="h-4 w-4" />
          Observações
        </label>
        <textarea
          name="observacoes"
          value={form.observacoes}
          onChange={handleChange}
          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none uppercase"
          rows={3}
          placeholder="OBSERVAÇÕES ADICIONAIS (OPCIONAL)"
        />
      </div>

      {/* Botões de Ação */}
      <div className="flex flex-wrap gap-4 pt-6 border-t border-gray-200">
        <Button
          type="submit"
          variant="primary"
          disabled={isLoading}
          className="flex items-center gap-2 px-6"
        >
          {isLoading ? (
            <>
              <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Processando...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              {visit ? 'Atualizar Visita' : 'Salvar Visita'}
            </>
          )}
        </Button>

        <Button
          type="button"
          variant="secondary"
          onClick={handleCancel}
          className="flex items-center gap-2 px-6"
        >
          <X className="h-4 w-4" />
          {visit ? 'Cancelar Edição' : 'Limpar Formulário'}
        </Button>

        {visit && (
          <div className="ml-auto flex items-center">
            <div className="text-sm text-blue-700 bg-blue-50 px-4 py-2 rounded-lg border border-blue-200">
              Editando visita <span className="font-semibold">#{visit.id}</span>
            </div>
          </div>
        )}
      </div>
    </form>
  );
}