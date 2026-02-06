// src/components/visits/VisitForm.jsx - MODERNIZADO COM INTEGRAÇÃO DE PROSPECTS
import { useState, useEffect } from 'react';
import { Save, X, Calendar, Building, MapPin, User, Phone, FileText, AlertCircle, Clock, CheckCircle, AlertTriangle, Lock } from 'lucide-react';
import Button from '../Button';
import { regimes } from '../../data/regimes';
import useAuth from '../../hooks/useAuth';
import * as visitasService from '../../services/visitasService';

const initialForm = {
  data: '',
  prospect_id: null,
  prospect_nome: '',
  tipo: '',
  turno: '',
  status: 'Agendada',
  prioridade: 'Média',
  endereco: '',
  cidade: '',
  bairro: '',
  contato: '',
  telefone: '',
  concorrente_id: null,
  concorrente_nome: '',
  regime: '',
  observacoes: ''
};

export default function VisitForm({ visit, onSuccess, onCancel, isLoading }) {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [prospects, setProspects] = useState([]);
  const [concorrentes, setConcorrentes] = useState([]);
  const [loadingProspects, setLoadingProspects] = useState(true);
  const { user } = useAuth();

  // Carregar prospects e concorrentes ao montar
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoadingProspects(true);
        const [prospectsData, concorrentesData] = await Promise.all([
          visitasService.buscarProspects(user?.id),
          visitasService.buscarConcorrentes()
        ]);

        setProspects(prospectsData || []);
        setConcorrentes(concorrentesData || []);
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
      } finally {
        setLoadingProspects(false);
      }
    };

    if (user?.id) {
      loadData();
    }
  }, [user?.id]);

  // Preencher formulário se estiver editando
  useEffect(() => {
    if (visit) {
      setForm({
        data: visit.data || '',
        prospect_id: visit.prospect_id || null,
        prospect_nome: visit.prospect_nome || '',
        tipo: visit.tipo || '',
        turno: visit.turno || '',
        status: visit.status || 'Agendada',
        prioridade: visit.prioridade || 'Média',
        endereco: visit.endereco || '',
        cidade: visit.cidade || '',
        bairro: visit.bairro || '',
        contato: visit.contato || '',
        telefone: visit.telefone || '',
        concorrente_id: visit.concorrente_id || null,
        concorrente_nome: visit.concorrente_nome || '',
        regime: visit.regime || '',
        observacoes: visit.observacoes || ''
      });
    } else {
      resetForm();
    }
  }, [visit]);

  // Definir data atual como padrão
  useEffect(() => {
    if (!visit && !form.data) {
      const today = new Date();
      const localToday = new Date(today.getTime() - (today.getTimezoneOffset() * 60000));
      const year = localToday.getFullYear();
      const month = String(localToday.getMonth() + 1).padStart(2, '0');
      const day = String(localToday.getDate()).padStart(2, '0');
      const localDateString = `${year}-${month}-${day}`;
      setForm(prev => ({ ...prev, data: localDateString }));
    }
  }, [visit, form.data]);

  // Handler para seleção de prospect (auto-fill)
  const handleProspectChange = async (e) => {
    const prospectId = e.target.value;

    if (!prospectId) {
      // Limpar campos auto-preenchidos
      setForm(prev => ({
        ...prev,
        prospect_id: null,
        prospect_nome: '',
        endereco: '',
        cidade: '',
        bairro: '',
        contato: '',
        telefone: '',
        concorrente_id: null,
        concorrente_nome: ''
      }));
      return;
    }

    try {
      // Buscar dados completos do prospect
      const prospect = await visitasService.buscarProspectPorId(prospectId);

      // Auto-preencher campos
      setForm(prev => ({
        ...prev,
        prospect_id: prospect.id,
        prospect_nome: prospect.nome,
        endereco: prospect.endereco || '',
        cidade: prospect.cidade || '',
        bairro: prospect.bairro || '',
        contato: prospect.contato || '',
        telefone: prospect.telefone || prospect.celular || '',
        concorrente_id: prospect.concorrente_id || null,
        concorrente_nome: prospect.concorrentes?.descricao || ''
      }));
    } catch (error) {
      console.error('Erro ao buscar prospect:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));

    // Limpar erro do campo
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Handler para concorrente (atualizar nome denormalizado)
  const handleConcorrenteChange = (e) => {
    const concorrenteId = e.target.value;
    const concorrente = concorrentes.find(c => c.id === parseInt(concorrenteId));

    setForm(prev => ({
      ...prev,
      concorrente_id: concorrenteId ? parseInt(concorrenteId) : null,
      concorrente_nome: concorrente?.descricao || ''
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!form.data) newErrors.data = 'Data é obrigatória';
    if (!form.prospect_id) newErrors.prospect_id = 'Prospect é obrigatório';
    if (!form.tipo) newErrors.tipo = 'Tipo é obrigatório';
    if (!form.turno) newErrors.turno = 'Turno é obrigatório';
    if (!form.status) newErrors.status = 'Status é obrigatório';
    if (!form.prioridade) newErrors.prioridade = 'Prioridade é obrigatória';
    if (!form.regime) newErrors.regime = 'Regime fiscal é obrigatório';

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
      tipo: form.tipo,
      turno: form.turno,
      status: form.status,
      prioridade: form.prioridade,
      prospect_id: form.prospect_id,
      prospect_nome: form.prospect_nome,
      endereco: form.endereco,
      cidade: form.cidade,
      bairro: form.bairro,
      contato: form.contato,
      telefone: form.telefone,
      concorrente_id: form.concorrente_id,
      concorrente_nome: form.concorrente_nome,
      regime: form.regime,
      observacoes: form.observacoes
    };

    try {
      if (visit) {
        await visitasService.atualizarVisita(visit.id, visitaData, user.id);
        if (onSuccess) onSuccess();
      } else {
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

    // Definir data atual
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

        {/* Prospect (Combobox) */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <Building className="h-4 w-4" />
            Prospect/Empresa *
          </label>
          <select
            name="prospect_id"
            value={form.prospect_id || ''}
            onChange={handleProspectChange}
            className={`w-full px-4 py-3 rounded-lg border ${errors.prospect_id ? 'border-red-300 bg-red-50' : 'border-gray-300'
              } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
            required
            disabled={loadingProspects}
          >
            <option value="">
              {loadingProspects ? 'Carregando prospects...' : 'Selecione um prospect'}
            </option>
            {prospects.map(p => (
              <option key={p.id} value={p.id}>{p.nome}</option>
            ))}
          </select>
          {errors.prospect_id && (
            <p className="text-sm text-red-600 flex items-center gap-1 mt-1">
              <AlertCircle className="h-3 w-3" />
              {errors.prospect_id}
            </p>
          )}
        </div>

        {/* Tipo */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <FileText className="h-4 w-4" />
            Tipo de Visita *
          </label>
          <select
            name="tipo"
            value={form.tipo}
            onChange={handleChange}
            className={`w-full px-4 py-3 rounded-lg border ${errors.tipo ? 'border-red-300 bg-red-50' : 'border-gray-300'
              } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
            required
          >
            <option value="">Selecione o tipo</option>
            <option value="Sondagem">Sondagem</option>
            <option value="Apresentação">Apresentação</option>
            <option value="Prosseguimento">Prosseguimento</option>
            <option value="Demonstração">Demonstração</option>
            <option value="Negociação">Negociação</option>
          </select>
          {errors.tipo && (
            <p className="text-sm text-red-600 flex items-center gap-1 mt-1">
              <AlertCircle className="h-3 w-3" />
              {errors.tipo}
            </p>
          )}
        </div>

        {/* Turno */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <Clock className="h-4 w-4" />
            Turno *
          </label>
          <select
            name="turno"
            value={form.turno}
            onChange={handleChange}
            className={`w-full px-4 py-3 rounded-lg border ${errors.turno ? 'border-red-300 bg-red-50' : 'border-gray-300'
              } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
            required
          >
            <option value="">Selecione o turno</option>
            <option value="Manhã">Manhã</option>
            <option value="Tarde">Tarde</option>
            <option value="Noite">Noite</option>
          </select>
          {errors.turno && (
            <p className="text-sm text-red-600 flex items-center gap-1 mt-1">
              <AlertCircle className="h-3 w-3" />
              {errors.turno}
            </p>
          )}
        </div>

        {/* Status */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <CheckCircle className="h-4 w-4" />
            Status *
          </label>
          <select
            name="status"
            value={form.status}
            onChange={handleChange}
            className={`w-full px-4 py-3 rounded-lg border ${errors.status ? 'border-red-300 bg-red-50' : 'border-gray-300'
              } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
            required
          >
            <option value="Agendada">Agendada</option>
            <option value="Realizada">Realizada</option>
            <option value="Cancelada">Cancelada</option>
            <option value="Atrasada">Atrasada</option>
          </select>
          {errors.status && (
            <p className="text-sm text-red-600 flex items-center gap-1 mt-1">
              <AlertCircle className="h-3 w-3" />
              {errors.status}
            </p>
          )}
        </div>

        {/* Prioridade */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <AlertTriangle className="h-4 w-4" />
            Prioridade *
          </label>
          <select
            name="prioridade"
            value={form.prioridade}
            onChange={handleChange}
            className={`w-full px-4 py-3 rounded-lg border ${errors.prioridade ? 'border-red-300 bg-red-50' : 'border-gray-300'
              } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
            required
          >
            <option value="Baixa">Baixa</option>
            <option value="Média">Média</option>
            <option value="Alta">Alta</option>
          </select>
          {errors.prioridade && (
            <p className="text-sm text-red-600 flex items-center gap-1 mt-1">
              <AlertCircle className="h-3 w-3" />
              {errors.prioridade}
            </p>
          )}
        </div>

        {/* Endereço (Read-only - Auto-preenchido) */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <MapPin className="h-4 w-4" />
            Endereço
            <Lock className="h-3 w-3 text-gray-400" title="Auto-preenchido" />
          </label>
          <input
            type="text"
            name="endereco"
            value={form.endereco}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-gray-50 cursor-not-allowed text-gray-600"
            readOnly
            placeholder="Auto-preenchido ao selecionar prospect"
          />
        </div>

        {/* Cidade (Read-only - Auto-preenchido) */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <MapPin className="h-4 w-4" />
            Cidade
            <Lock className="h-3 w-3 text-gray-400" title="Auto-preenchido" />
          </label>
          <input
            type="text"
            name="cidade"
            value={form.cidade}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-gray-50 cursor-not-allowed text-gray-600"
            readOnly
            placeholder="Auto-preenchido ao selecionar prospect"
          />
        </div>

        {/* Bairro (Read-only - Auto-preenchido) */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <MapPin className="h-4 w-4" />
            Bairro
            <Lock className="h-3 w-3 text-gray-400" title="Auto-preenchido" />
          </label>
          <input
            type="text"
            name="bairro"
            value={form.bairro}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-gray-50 cursor-not-allowed text-gray-600"
            readOnly
            placeholder="Auto-preenchido ao selecionar prospect"
          />
        </div>

        {/* Contato (Read-only - Auto-preenchido) */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <User className="h-4 w-4" />
            Contato
            <Lock className="h-3 w-3 text-gray-400" title="Auto-preenchido" />
          </label>
          <input
            type="text"
            name="contato"
            value={form.contato}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-gray-50 cursor-not-allowed text-gray-600"
            readOnly
            placeholder="Auto-preenchido ao selecionar prospect"
          />
        </div>

        {/* Telefone (Read-only - Auto-preenchido) */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <Phone className="h-4 w-4" />
            Telefone
            <Lock className="h-3 w-3 text-gray-400" title="Auto-preenchido" />
          </label>
          <input
            type="tel"
            name="telefone"
            value={form.telefone}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-gray-50 cursor-not-allowed text-gray-600"
            readOnly
            placeholder="Auto-preenchido ao selecionar prospect"
          />
        </div>

        {/* Concorrente (Editável - Auto-preenchido mas pode ser alterado) */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <FileText className="h-4 w-4" />
            Concorrente Atual
          </label>
          <select
            name="concorrente_id"
            value={form.concorrente_id || ''}
            onChange={handleConcorrenteChange}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Selecione o concorrente</option>
            {concorrentes.map(c => (
              <option key={c.id} value={c.id}>{c.descricao}</option>
            ))}
          </select>
        </div>

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
          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          rows={3}
          placeholder="Observações adicionais (opcional)"
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
          Cancelar
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