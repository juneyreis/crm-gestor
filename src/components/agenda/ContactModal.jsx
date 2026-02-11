import React, { useState, useEffect } from 'react';
import { X, User, Mail, Phone, Building2, Tag, FileText } from 'lucide-react';
import * as agendaService from '../../services/agendaService';
import Button from '../Button';
import useAuth from '../../hooks/useAuth';

const contactTypes = [
    { value: 'Cliente', label: 'Cliente' },
    { value: 'Parceiro', label: 'Parceiro' },
    { value: 'Amigo', label: 'Amigo' },
    { value: 'Família', label: 'Família' },
    { value: 'Colega', label: 'Colega' },
    { value: 'Outros', label: 'Outros' }
];

export default function ContactModal({ contact, onClose, onSuccess }) {
    const { user } = useAuth();
    const [form, setForm] = useState({
        nome: '',
        tipo: 'Outros',
        email: '',
        telefone: '',
        empresa: '',
        observacoes: ''
    });
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (contact) {
            setForm({ ...contact });
        }
    }, [contact]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
    };

    const validate = () => {
        const newErrors = {};
        if (!form.nome) newErrors.nome = "Nome é obrigatório";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        setLoading(true);
        try {
            if (contact?.id) {
                await agendaService.atualizarContato(contact.id, form);
            } else {
                await agendaService.criarContato(form, user?.id);
            }
            onSuccess();
        } catch (error) {
            console.error('Erro ao salvar contato:', error);
            alert('Erro ao salvar contato. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm('Tem certeza que deseja excluir este contato?')) return;

        setLoading(true);
        try {
            await agendaService.excluirContato(contact.id);
            onSuccess();
        } catch (error) {
            console.error('Erro ao excluir contato:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-slide-up">
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 flex justify-between items-center">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <User size={20} />
                        {contact ? 'Editar Contato' : 'Novo Contato'}
                    </h3>
                    <button onClick={onClose} className="text-white/80 hover:text-white transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Nome *</label>
                        <div className="relative">
                            <User className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                            <input
                                name="nome"
                                value={form.nome}
                                onChange={handleChange}
                                className={`w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-slate-900 border ${errors.nome ? 'border-red-500' : 'border-gray-100 dark:border-slate-700'} rounded-lg focus:ring-2 focus:ring-blue-500 outline-none dark:text-white`}
                                placeholder="Nome completo"
                            />
                        </div>
                        {errors.nome && <p className="text-xs text-red-500">{errors.nome}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Tipo</label>
                            <div className="relative">
                                <Tag className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                <select
                                    name="tipo"
                                    value={form.tipo}
                                    onChange={handleChange}
                                    className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-slate-900 border border-gray-100 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none dark:text-white appearance-none"
                                >
                                    {contactTypes.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                                </select>
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Empresa</label>
                            <div className="relative">
                                <Building2 className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                <input
                                    name="empresa"
                                    value={form.empresa}
                                    onChange={handleChange}
                                    className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-slate-900 border border-gray-100 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none dark:text-white"
                                    placeholder="Empresa (opcional)"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">E-mail</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                <input
                                    name="email"
                                    type="email"
                                    value={form.email}
                                    onChange={handleChange}
                                    className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-slate-900 border border-gray-100 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none dark:text-white"
                                    placeholder="email@link.com"
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Telefone</label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                <input
                                    name="telefone"
                                    value={form.telefone}
                                    onChange={handleChange}
                                    className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-slate-900 border border-gray-100 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none dark:text-white"
                                    placeholder="(00) 00000-0000"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Observações</label>
                        <div className="relative">
                            <FileText className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                            <textarea
                                name="observacoes"
                                value={form.observacoes}
                                onChange={handleChange}
                                rows={3}
                                className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-slate-900 border border-gray-100 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none dark:text-white resize-none"
                                placeholder="Notas adicionais..."
                            />
                        </div>
                    </div>

                    <div className="flex gap-3 pt-4 border-t border-gray-50 dark:border-slate-700">
                        <Button type="submit" isLoading={loading} className="flex-1">
                            {contact ? 'Atualizar' : 'Salvar'}
                        </Button>
                        {contact && (
                            <button
                                type="button"
                                onClick={handleDelete}
                                className="px-4 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition-colors"
                                disabled={loading}
                            >
                                Excluir
                            </button>
                        )}
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-gray-500 hover:bg-gray-50 dark:hover:bg-slate-700 rounded-lg transition-colors"
                            disabled={loading}
                        >
                            Cancelar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
