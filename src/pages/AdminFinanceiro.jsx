import React, { useState, useEffect } from 'react';
import { CreditCard, Search, RefreshCcw, Briefcase, FileText, Trash2, X, Calendar, UserCheck, Shield } from 'lucide-react';
import * as adminService from '../services/adminService';
import Button from '../components/Button';
import ConfirmationModal from '../components/modals/ConfirmationModal';
import { format, addDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function AdminFinanceiro() {
    const [usuarios, setUsuarios] = useState([]);
    const [carregando, setCarregando] = useState(true);
    const [termoBusca, setTermoBusca] = useState('');
    const [atualizando, setAtualizando] = useState(false);

    // Estados para Histórico
    const [historico, setHistorico] = useState([]);
    const [isModalHistoricoAberto, setIsModalHistoricoAberto] = useState(false);
    const [carregandoHistorico, setCarregandoHistorico] = useState(false);
    const [usuarioSelecionado, setUsuarioSelecionado] = useState(null);

    // Estado do Modal de Confirmação
    const [confirmModalOpen, setConfirmModalOpen] = useState(false);
    const [confirmModalConfig, setConfirmModalConfig] = useState({
        title: '',
        message: '',
        confirmLabel: 'Confirmar',
        variant: 'warning',
        showCancel: true,
        onConfirm: () => { }
    });

    // Form de Novo Pagamento
    const [formPagamento, setFormPagamento] = useState({
        valor_pago: '',
        metodo_pagamento: 'pix',
        periodo_inicio: format(new Date(), 'yyyy-MM-dd'),
        periodo_fim: format(addDays(new Date(), 30), 'yyyy-MM-dd'),
        observacoes: '',
        tipo_plano: 'standard'
    });

    const [isFormPagamentoAberto, setIsFormPagamentoAberto] = useState(false);

    const carregarUsuarios = async () => {
        setAtualizando(true);
        try {
            const data = await adminService.listarUsuarios();
            setUsuarios(data);
        } catch (error) {
            console.error('Erro ao listar usuários:', error);
        } finally {
            setCarregando(false);
            setAtualizando(false);
        }
    };

    useEffect(() => {
        carregarUsuarios();
    }, []);

    const requestConfirmation = ({ title, message, variant, onConfirm, confirmLabel = 'Sim, confirmar', showCancel = true }) => {
        setConfirmModalConfig({
            title,
            message,
            variant,
            confirmLabel,
            showCancel,
            onConfirm: async () => {
                await onConfirm();
                setConfirmModalOpen(false);
            }
        });
        setConfirmModalOpen(true);
    };

    const abrirModalHistorico = async (usuario) => {
        setUsuarioSelecionado(usuario);
        setIsModalHistoricoAberto(true);
        setCarregandoHistorico(true);
        try {
            const data = await adminService.listarHistoricoAssinaturas(usuario.user_id);
            setHistorico(data);
        } catch (error) {
            console.error('Erro ao carregar histórico:', error);
        } finally {
            setCarregandoHistorico(false);
        }
    };

    const abrirFormPagamento = (usuario) => {
        setUsuarioSelecionado(usuario);
        setFormPagamento({
            ...formPagamento,
            tipo_plano: usuario.plan_type || 'standard'
        });
        setIsFormPagamentoAberto(true);
    };

    const handleRegistrarPagamento = async () => {
        if (!formPagamento.valor_pago) {
            requestConfirmation({
                title: 'Atenção',
                message: 'Por favor, informe o valor pago.',
                variant: 'warning',
                confirmLabel: 'Entendido',
                showCancel: false,
                onConfirm: () => { }
            });
            return;
        }

        try {
            // 1. Registra no histórico (tabela user_historico)
            await adminService.registrarPagamento({
                usuario_id: usuarioSelecionado.user_id,
                tipo_plano: formPagamento.tipo_plano,
                valor_pago: parseFloat(formPagamento.valor_pago),
                metodo_pagamento: formPagamento.metodo_pagamento,
                periodo_inicio: formPagamento.periodo_inicio,
                periodo_fim: formPagamento.periodo_fim,
                observacoes: formPagamento.observacoes
            });

            // 2. Atualiza a licença principal (tabela user_rules)
            await adminService.atualizarLicencaUsuario(usuarioSelecionado.user_id, {
                plan_type: formPagamento.tipo_plano,
                license_expires_at: formPagamento.periodo_fim,
                subscription_status: 'active',
                grace_period_expires_at: null
            });

            setIsFormPagamentoAberto(false);
            await carregarUsuarios();

            requestConfirmation({
                title: 'Sucesso!',
                message: 'Pagamento registrado e licença renovada com sucesso!',
                variant: 'success',
                confirmLabel: 'Excelente',
                showCancel: false,
                onConfirm: () => { }
            });
        } catch (error) {
            console.error('Erro detalhado:', error);
            requestConfirmation({
                title: 'Erro no Registro',
                message: `Não foi possível registrar o pagamento: ${error.message || 'Erro desconhecido'}.`,
                variant: 'danger',
                confirmLabel: 'Fechar',
                showCancel: false,
                onConfirm: () => { }
            });
        }
    };

    const handleExcluirPagamento = async (id) => {
        requestConfirmation({
            title: 'Excluir Pagamento',
            message: 'Deseja realmente excluir este registro de pagamento? Isso não afetará a data de expiração atual.',
            variant: 'danger',
            confirmLabel: 'Sim, Excluir',
            onConfirm: async () => {
                try {
                    await adminService.excluirPagamento(id);
                    const data = await adminService.listarHistoricoAssinaturas(usuarioSelecionado.user_id);
                    setHistorico(data);
                } catch (error) {
                    requestConfirmation({
                        title: 'Erro',
                        message: 'Erro ao excluir registro.',
                        variant: 'danger',
                        confirmLabel: 'OK',
                        showCancel: false,
                        onConfirm: () => { }
                    });
                }
            }
        });
    };

    const usuariosFiltrados = usuarios.filter(u =>
        (u.email || '').toLowerCase().includes(termoBusca.toLowerCase())
    );

    if (carregando) {
        return (
            <div className="flex items-center justify-center p-12">
                <RefreshCcw className="h-8 w-8 animate-spin text-blue-500" />
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <CreditCard className="text-green-600 h-7 w-7" />
                        Gerência Financeira
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Controle de pagamentos, planos e vencimentos de licenças.</p>
                </div>
                <Button onClick={carregarUsuarios} variant="outline" className="flex items-center gap-2">
                    <RefreshCcw size={18} className={atualizando ? 'animate-spin' : ''} />
                    Atualizar Lista
                </Button>
            </div>

            {/* Painel de Busca */}
            <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm">
                <div className="relative max-w-md">
                    <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Buscar por e-mail..."
                        className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-slate-900 rounded-lg border-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                        value={termoBusca}
                        onChange={(e) => setTermoBusca(e.target.value)}
                    />
                </div>
            </div>

            {/* Tabela de Financeiro */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 dark:bg-slate-900/50 border-b border-gray-200 dark:border-slate-700">
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">E-mail</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Plano Atual</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Vencimento</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                            {usuariosFiltrados.map((u) => (
                                <tr key={u.user_id} className="hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="font-medium text-gray-900 dark:text-white">{u.email}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                                            <Briefcase size={12} />
                                            {u.plan_type?.toUpperCase() || 'BASIC'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400 font-medium">
                                            <Calendar size={14} />
                                            {u.license_expires_at
                                                ? format(new Date(u.license_expires_at), 'dd/MM/yyyy', { locale: ptBR })
                                                : 'Vitalícia'}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => abrirFormPagamento(u)}
                                                className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                                                title="Registrar Pagamento / Renovação"
                                            >
                                                <CreditCard size={18} />
                                            </button>
                                            <button
                                                onClick={() => abrirModalHistorico(u)}
                                                className="p-2 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-colors"
                                                title="Ver histórico financeiro"
                                            >
                                                <FileText size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {usuariosFiltrados.length === 0 && (
                                <tr>
                                    <td colSpan="4" className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                                        Nenhum usuário encontrado.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal de Histórico Financeiro */}
            {isModalHistoricoAberto && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-slate-800 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="px-6 py-4 border-b border-gray-100 dark:border-slate-700 flex justify-between items-center bg-gray-50/50 dark:bg-slate-900/50">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                    <Briefcase className="text-purple-500" />
                                    Histórico Financeiro
                                </h3>
                                <p className="text-xs text-gray-500 font-mono">{usuarioSelecionado?.email}</p>
                            </div>
                            <button onClick={() => setIsModalHistoricoAberto(false)} className="p-2 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-full transition-colors">
                                <X size={20} className="text-gray-500" />
                            </button>
                        </div>

                        <div className="p-6 max-h-[60vh] overflow-y-auto">
                            {carregandoHistorico ? (
                                <div className="flex justify-center py-12">
                                    <RefreshCcw className="animate-spin text-blue-500 h-8 w-8" />
                                </div>
                            ) : historico.length === 0 ? (
                                <div className="text-center py-12 text-gray-500">
                                    Nenhum registro encontrado.
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {historico.map((h) => (
                                        <div key={h.id} className="p-4 bg-gray-50 dark:bg-slate-900/50 rounded-xl border border-gray-100 dark:border-slate-700 flex flex-col md:flex-row md:items-center justify-between gap-3">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 rounded-lg bg-green-100 text-green-600 dark:bg-green-900/20">
                                                    <CreditCard size={20} />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-900 dark:text-white uppercase text-xs">
                                                        Plano {h.tipo_plano} - {h.metodo_pagamento?.toUpperCase()}
                                                    </p>
                                                    <p className="text-[10px] text-gray-500">
                                                        Período: {format(new Date(h.periodo_inicio), 'dd/MM/yy')} até {format(new Date(h.periodo_fim), 'dd/MM/yy')}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <div className="text-right">
                                                    <p className="font-black text-blue-600 dark:text-blue-400">
                                                        R$ {parseFloat(h.valor_pago).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                                    </p>
                                                    <p className="text-[9px] text-gray-400 italic">
                                                        Pago em {format(new Date(h.data_pagamento), 'dd/MM/yyyy HH:mm')}
                                                    </p>
                                                </div>
                                                <button
                                                    onClick={() => handleExcluirPagamento(h.id)}
                                                    className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de Registro de Pagamento */}
            {isFormPagamentoAberto && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-slate-800 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="px-6 py-4 border-b border-gray-100 dark:border-slate-700 flex justify-between items-center bg-gray-50/50 dark:bg-slate-900/50">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Registrar Pagamento</h3>
                                <p className="text-xs text-gray-500 font-mono">{usuarioSelecionado?.email}</p>
                            </div>
                            <button onClick={() => setIsFormPagamentoAberto(false)} className="p-2 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-full transition-colors">
                                <X size={20} className="text-gray-500" />
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-500 uppercase ml-1">Plano</label>
                                    <select
                                        className="w-full p-3 bg-gray-50 dark:bg-slate-900 border-none rounded-xl focus:ring-2 focus:ring-blue-500 dark:text-white"
                                        value={formPagamento.tipo_plano}
                                        onChange={(e) => setFormPagamento({ ...formPagamento, tipo_plano: e.target.value })}
                                    >
                                        <option value="trial">Trial</option>
                                        <option value="basic">Basic (Básico)</option>
                                        <option value="standard">Standard (Padrão)</option>
                                        <option value="premium">Premium (Completo)</option>
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-500 uppercase ml-1">Valor Pago (R$)</label>
                                    <input
                                        type="number"
                                        className="w-full p-3 bg-gray-50 dark:bg-slate-900 border-none rounded-xl focus:ring-2 focus:ring-blue-500 dark:text-white"
                                        placeholder="0.00"
                                        value={formPagamento.valor_pago}
                                        onChange={(e) => setFormPagamento({ ...formPagamento, valor_pago: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-500 uppercase ml-1">Método</label>
                                    <select
                                        className="w-full p-3 bg-gray-50 dark:bg-slate-900 border-none rounded-xl focus:ring-2 focus:ring-blue-500 dark:text-white"
                                        value={formPagamento.metodo_pagamento}
                                        onChange={(e) => setFormPagamento({ ...formPagamento, metodo_pagamento: e.target.value })}
                                    >
                                        <option value="pix">PIX</option>
                                        <option value="cartao">Cartão de Crédito</option>
                                        <option value="transferencia">Transferência</option>
                                        <option value="dinheiro">Dinheiro</option>
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-500 uppercase ml-1">Início Período</label>
                                    <input
                                        type="date"
                                        className="w-full p-3 bg-gray-50 dark:bg-slate-900 border-none rounded-xl focus:ring-2 focus:ring-blue-500 dark:text-white"
                                        value={formPagamento.periodo_inicio}
                                        onChange={(e) => setFormPagamento({ ...formPagamento, periodo_inicio: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-500 uppercase ml-1">Expiração (Fim Período)</label>
                                    <input
                                        type="date"
                                        className="w-full p-3 bg-gray-50 dark:bg-slate-900 border-none rounded-xl focus:ring-2 focus:ring-blue-500 dark:text-white"
                                        value={formPagamento.periodo_fim}
                                        onChange={(e) => setFormPagamento({ ...formPagamento, periodo_fim: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-500 uppercase ml-1">Observações</label>
                                <textarea
                                    className="w-full p-3 bg-gray-50 dark:bg-slate-900 border-none rounded-xl focus:ring-2 focus:ring-blue-500 dark:text-white h-20 resize-none"
                                    value={formPagamento.observacoes}
                                    onChange={(e) => setFormPagamento({ ...formPagamento, observacoes: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="p-6 bg-gray-50 dark:bg-slate-900/50 flex gap-3">
                            <button
                                onClick={() => setIsFormPagamentoAberto(false)}
                                className="flex-1 py-3 px-4 rounded-xl border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-gray-400 font-bold hover:bg-gray-100 dark:hover:bg-slate-800 transition-all"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleRegistrarPagamento}
                                className="flex-1 py-3 px-4 rounded-xl bg-green-600 text-white font-bold hover:bg-green-700 shadow-lg shadow-green-500/20 active:scale-95 transition-all"
                            >
                                Confirmar Pagamento
                            </button>
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
                showCancel={confirmModalConfig.showCancel}
                onConfirm={confirmModalConfig.onConfirm}
                onCancel={() => setConfirmModalOpen(false)}
            />
        </div>
    );
}
