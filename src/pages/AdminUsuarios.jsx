import React, { useState, useEffect } from 'react';
import { Users, Shield, UserX, UserCheck, Calendar, Search, RefreshCcw, Edit2, X, CheckCircle2 } from 'lucide-react';
import * as adminService from '../services/adminService';
import Button from '../components/Button';
import ConfirmationModal from '../components/modals/ConfirmationModal';
import { format, addDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function AdminUsuarios() {
    const [usuarios, setUsuarios] = useState([]);
    const [carregando, setCarregando] = useState(true);
    const [termoBusca, setTermoBusca] = useState('');
    const [atualizando, setAtualizando] = useState(false);
    const [isModalEdicaoAberto, setIsModalEdicaoAberto] = useState(false);
    const [usuarioSelecionado, setUsuarioSelecionado] = useState(null);
    const [formEdicao, setFormEdicao] = useState({
        role: '',
        status: '',
        plan_type: '',
        license_expires_at: '',
        grace_period_expires_at: '',
        subscription_status: ''
    });

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

    const abrirModalEdicao = (usuario) => {
        setUsuarioSelecionado(usuario);
        setFormEdicao({
            role: usuario.role || 'user',
            status: usuario.status || 'active',
            plan_type: usuario.plan_type || 'basic',
            license_expires_at: usuario.license_expires_at ? format(new Date(usuario.license_expires_at), 'yyyy-MM-dd') : '',
            grace_period_expires_at: usuario.grace_period_expires_at ? format(new Date(usuario.grace_period_expires_at), 'yyyy-MM-dd') : '',
            subscription_status: usuario.subscription_status || 'active'
        });
        setIsModalEdicaoAberto(true);
    };

    const handleAtualizarUsuario = async () => {
        try {
            await adminService.atualizarLicencaUsuario(usuarioSelecionado.user_id, {
                ...formEdicao,
                license_expires_at: formEdicao.license_expires_at || null,
                grace_period_expires_at: formEdicao.grace_period_expires_at || null
            });
            setIsModalEdicaoAberto(false);
            await carregarUsuarios();
            requestConfirmation({
                title: 'Sucesso',
                message: 'Usuário atualizado com sucesso!',
                variant: 'success',
                confirmLabel: 'OK',
                showCancel: false,
                onConfirm: () => { }
            });
        } catch (error) {
            requestConfirmation({
                title: 'Erro!',
                message: 'Não foi possível atualizar o usuário.',
                variant: 'danger',
                confirmLabel: 'Entendido',
                showCancel: false,
                onConfirm: () => { }
            });
        }
    };

    const handleTrialRapido = () => {
        const quinzeDiasDepois = format(addDays(new Date(), 15), 'yyyy-MM-dd');
        setFormEdicao(prev => ({
            ...prev,
            plan_type: 'trial',
            license_expires_at: quinzeDiasDepois,
            status: 'active'
        }));
    };

    const handleToggleStatus = async (usuario) => {
        const novoStatus = usuario.status === 'active' ? 'blocked' : 'active';
        const msgConfirmacao = novoStatus === 'blocked'
            ? `Deseja realmente BLOQUEAR o acesso de ${usuario.email}?`
            : `Deseja ATIVAR o acesso de ${usuario.email}?`;

        requestConfirmation({
            title: novoStatus === 'blocked' ? 'Bloquear Usuário' : 'Ativar Usuário',
            message: msgConfirmacao,
            variant: novoStatus === 'blocked' ? 'danger' : 'warning',
            confirmLabel: novoStatus === 'blocked' ? 'Sim, Bloquear' : 'Sim, Ativar',
            onConfirm: async () => {
                try {
                    await adminService.atualizarStatusUsuario(usuario.user_id, novoStatus);
                    await carregarUsuarios();
                } catch (error) {
                    requestConfirmation({
                        title: 'Erro',
                        message: 'Erro ao atualizar status do usuário.',
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
                        <Users className="text-blue-600 h-7 w-7" />
                        Gestão de Usuários
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Controle de acesso, permissões e status dos usuários.</p>
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

            {/* Tabela de Usuários */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 dark:bg-slate-900/50 border-b border-gray-200 dark:border-slate-700">
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">E-mail</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Cargo</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Status</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                            {usuariosFiltrados.map((u) => (
                                <tr key={u.user_id} className="hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="font-medium text-gray-900 dark:text-white">{u.email}</span>
                                            <span className="text-[10px] text-gray-400 font-mono">ID: {u.user_id.slice(0, 8)}...</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${u.role === 'admin' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' : 'bg-gray-100 text-gray-700 dark:bg-slate-800 dark:text-gray-400'
                                            }`}>
                                            {u.role === 'admin' ? <Shield size={12} /> : <Users size={12} />}
                                            {u.role?.toUpperCase() || 'USER'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${u.status === 'active' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                                            u.status === 'pending' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                                                'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                            }`}>
                                            {u.status === 'active' ? <UserCheck size={12} /> : u.status === 'pending' ? <RefreshCcw size={12} /> : <UserX size={12} />}
                                            {(u.status === 'pending' ? 'AGUARDANDO' : u.status)?.toUpperCase() || 'Pendente'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => abrirModalEdicao(u)}
                                                className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                                title="Editar usuário"
                                            >
                                                <Edit2 size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleToggleStatus(u)}
                                                className={`p-2 rounded-lg transition-colors ${u.status === 'active'
                                                    ? 'text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20'
                                                    : 'text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20'
                                                    }`}
                                                title={u.status === 'active' ? 'Bloquear usuário' : 'Ativar usuário'}
                                            >
                                                {u.status === 'active' ? <UserX size={18} /> : <UserCheck size={18} />}
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

            {/* Modal de Edição */}
            {isModalEdicaoAberto && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-slate-800 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="px-6 py-4 border-b border-gray-100 dark:border-slate-700 flex justify-between items-center bg-gray-50/50 dark:bg-slate-900/50">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Gerenciar Usuário</h3>
                                <p className="text-xs text-gray-500 font-mono">{usuarioSelecionado?.email}</p>
                            </div>
                            <button onClick={() => setIsModalEdicaoAberto(false)} className="p-2 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-full transition-colors">
                                <X size={20} className="text-gray-500" />
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            {/* Atalhos Rápidos */}
                            <div className="flex gap-2">
                                <button
                                    onClick={handleTrialRapido}
                                    className="flex-1 py-3 px-4 rounded-xl border-2 border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 text-sm font-bold flex items-center justify-center gap-2 hover:border-amber-400 transition-all"
                                >
                                    <CheckCircle2 size={18} />
                                    Liberar Trial (15 Dias)
                                </button>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-500 uppercase ml-1">Cargo</label>
                                    <select
                                        className="w-full p-3 bg-gray-50 dark:bg-slate-900 border-none rounded-xl focus:ring-2 focus:ring-blue-500 dark:text-white"
                                        value={formEdicao.role}
                                        onChange={(e) => setFormEdicao({ ...formEdicao, role: e.target.value })}
                                    >
                                        <option value="user">Usuário Comum</option>
                                        <option value="admin">Administrador</option>
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-500 uppercase ml-1">Status</label>
                                    <select
                                        className="w-full p-3 bg-gray-50 dark:bg-slate-900 border-none rounded-xl focus:ring-2 focus:ring-blue-500 dark:text-white"
                                        value={formEdicao.status}
                                        onChange={(e) => setFormEdicao({ ...formEdicao, status: e.target.value })}
                                    >
                                        <option value="active">Ativo</option>
                                        <option value="pending">Aguardando Pagamento</option>
                                        <option value="blocked">Bloqueado</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-500 uppercase ml-1">Vencimento Manual</label>
                                    <div className="relative">
                                        <Calendar className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
                                        <input
                                            type="date"
                                            className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-slate-900 border-none rounded-xl focus:ring-2 focus:ring-blue-500 dark:text-white"
                                            value={formEdicao.license_expires_at}
                                            onChange={(e) => setFormEdicao({ ...formEdicao, license_expires_at: e.target.value })}
                                        />
                                    </div>
                                    <p className="text-[10px] text-gray-400 mt-1">* Use para ajustes manuais fora do fluxo financeiro.</p>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 bg-gray-50 dark:bg-slate-900/50 flex gap-3">
                            <button
                                onClick={() => setIsModalEdicaoAberto(false)}
                                className="flex-1 py-3 px-4 rounded-xl border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-gray-400 font-bold hover:bg-gray-100 dark:hover:bg-slate-800 transition-all"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleAtualizarUsuario}
                                className="flex-1 py-3 px-4 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 shadow-lg shadow-blue-500/20 active:scale-95 transition-all"
                            >
                                Salvar Alterações
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
