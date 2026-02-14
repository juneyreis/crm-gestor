import React, { useState, useEffect } from 'react';
import { Users, Shield, UserX, UserCheck, Calendar, Search, RefreshCcw, MoreHorizontal, ShieldAlert, CreditCard, Edit2, X, CheckCircle2 } from 'lucide-react';
import * as adminService from '../services/adminService';
import Button from '../components/Button';
import { format, addDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function AdminDashboard() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [refreshing, setRefreshing] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [editForm, setEditForm] = useState({
        role: '',
        status: '',
        plan_type: '',
        license_expires_at: ''
    });

    const loadUsers = async () => {
        setRefreshing(true);
        try {
            const data = await adminService.listarUsuarios();
            setUsers(data);
        } catch (error) {
            console.error('Erro ao listar usuários:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        loadUsers();
    }, []);

    const openEditModal = (user) => {
        setSelectedUser(user);
        setEditForm({
            role: user.role || 'user',
            status: user.status || 'active',
            plan_type: user.plan_type || 'basic',
            license_expires_at: user.license_expires_at ? format(new Date(user.license_expires_at), 'yyyy-MM-dd') : ''
        });
        setIsEditModalOpen(true);
    };

    const handleUpdateUser = async () => {
        try {
            await adminService.atualizarLicencaUsuario(selectedUser.user_id, {
                ...editForm,
                license_expires_at: editForm.license_expires_at || null
            });
            setIsEditModalOpen(false);
            loadUsers();
        } catch (error) {
            alert('Erro ao atualizar usuário');
        }
    };

    const handleQuickTrial = () => {
        const fifteenDaysFromNow = format(addDays(new Date(), 15), 'yyyy-MM-dd');
        setEditForm(prev => ({
            ...prev,
            plan_type: 'trial',
            license_expires_at: fifteenDaysFromNow,
            status: 'active'
        }));
    };

    const handleToggleStatus = async (user) => {
        const newStatus = user.status === 'active' ? 'blocked' : 'active';
        const confirmMsg = newStatus === 'blocked'
            ? `Deseja realmente BLOQUEAR o acesso de ${user.email}?`
            : `Deseja ATIVAR o acesso de ${user.email}?`;

        if (!window.confirm(confirmMsg)) return;

        try {
            await adminService.atualizarStatusUsuario(user.user_id, newStatus);
            loadUsers();
        } catch (error) {
            alert('Erro ao atualizar status');
        }
    };

    const filteredUsers = users.filter(u =>
        (u.email || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center p-12">
                <RefreshCcw className="h-8 w-8 animate-spin text-blue-500" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <Shield className="text-blue-600 h-7 w-7" />
                        Gestão de Usuários e Licenças
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Controle de acesso, roles e períodos de assinatura.</p>
                </div>
                <Button onClick={loadUsers} variant="outline" className="flex items-center gap-2">
                    <RefreshCcw size={18} className={refreshing ? 'animate-spin' : ''} />
                    Atualizar Lista
                </Button>
            </div>

            {/* Painel de Filtros e Busca */}
            <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm">
                <div className="relative max-w-md">
                    <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Buscar por e-mail..."
                        className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-slate-900 rounded-lg border-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Tabela de Usuários */}
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 dark:bg-slate-900 border-b border-gray-200 dark:border-slate-700">
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">E-mail</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Cargo</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Status</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Plano</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Expiração</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                            {filteredUsers.map((u) => (
                                <tr key={u.user_id} className="hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="font-medium text-gray-900 dark:text-white">{u.email}</span>
                                            <span className="text-[10px] text-gray-400 font-mono">ID: {u.user_id.slice(0, 8)}...</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${u.role === 'admin' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' : 'bg-gray-100 text-gray-700 dark:bg-slate-800 dark:text-gray-400'
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
                                    <td className="px-6 py-4">
                                        <span className="flex items-center gap-1.5 text-sm text-gray-700 dark:text-gray-300">
                                            <CreditCard size={14} className="text-blue-500" />
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
                                                onClick={() => openEditModal(u)}
                                                className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                                title="Editar licença"
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
                                                disabled={u.user_id === 'PROTECTED_ID'} // Opcional: proteger admin principal
                                            >
                                                {u.status === 'active' ? <UserX size={18} /> : <UserCheck size={18} />}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredUsers.length === 0 && (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                                        Nenhum usuário encontrado.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal de Edição */}
            {isEditModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-slate-800 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="px-6 py-4 border-b border-gray-100 dark:border-slate-700 flex justify-between items-center bg-gray-50/50 dark:bg-slate-900/50">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Gerenciar Usuário</h3>
                                <p className="text-xs text-gray-500 font-mono">{selectedUser?.email}</p>
                            </div>
                            <button onClick={() => setIsEditModalOpen(false)} className="p-2 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-full transition-colors">
                                <X size={20} className="text-gray-500" />
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            {/* Atalhos Rápidos */}
                            <div className="flex gap-2">
                                <button
                                    onClick={handleQuickTrial}
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
                                        value={editForm.role}
                                        onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                                    >
                                        <option value="user">Usuário Comum</option>
                                        <option value="admin">Administrador</option>
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-500 uppercase ml-1">Status</label>
                                    <select
                                        className="w-full p-3 bg-gray-50 dark:bg-slate-900 border-none rounded-xl focus:ring-2 focus:ring-blue-500 dark:text-white"
                                        value={editForm.status}
                                        onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                                    >
                                        <option value="active">Ativo</option>
                                        <option value="pending">Aguardando Pagamento</option>
                                        <option value="blocked">Bloqueado</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-500 uppercase ml-1">Plano</label>
                                    <select
                                        className="w-full p-3 bg-gray-50 dark:bg-slate-900 border-none rounded-xl focus:ring-2 focus:ring-blue-500 dark:text-white"
                                        value={editForm.plan_type}
                                        onChange={(e) => setEditForm({ ...editForm, plan_type: e.target.value })}
                                    >
                                        <option value="trial">Trial</option>
                                        <option value="basic">Basic (Básico)</option>
                                        <option value="standard">Standard (Padrão)</option>
                                        <option value="premium">Premium (Completo)</option>
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-500 uppercase ml-1">Vencimento</label>
                                    <div className="relative">
                                        <Calendar className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
                                        <input
                                            type="date"
                                            className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-slate-900 border-none rounded-xl focus:ring-2 focus:ring-blue-500 dark:text-white"
                                            value={editForm.license_expires_at}
                                            onChange={(e) => setEditForm({ ...editForm, license_expires_at: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 bg-gray-50 dark:bg-slate-900/50 flex gap-3">
                            <button
                                onClick={() => setIsEditModalOpen(false)}
                                className="flex-1 py-3 px-4 rounded-xl border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-gray-400 font-bold hover:bg-gray-100 dark:hover:bg-slate-800 transition-all"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleUpdateUser}
                                className="flex-1 py-3 px-4 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 shadow-lg shadow-blue-500/20 active:scale-95 transition-all"
                            >
                                Salvar Alterações
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Alerta Informativo */}
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 p-4 rounded-xl flex gap-3">
                <ShieldAlert className="h-5 w-5 text-amber-600 dark:text-amber-500 shrink-0" />
                <p className="text-sm text-amber-800 dark:text-amber-400">
                    <strong>Gestão de Períodos:</strong> Você pode usar o botão "Trial" para liberar acesso temporário ou definir uma data personalizada para clientes pagantes. Usuários com vencimento em branco possuem acesso vitalício.
                </p>
            </div>
        </div>
    );
}
