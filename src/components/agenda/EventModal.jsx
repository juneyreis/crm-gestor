import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, FileText, Palette, Users, Trash2 } from 'lucide-react';
import * as agendaService from '../../services/agendaService';
import Button from '../Button';
import useAuth from '../../hooks/useAuth';

const colors = [
    { value: '#3a86ff', label: 'Azul (Reunião)' },
    { value: '#06d6a0', label: 'Verde (Pessoal)' },
    { value: '#ffbe0b', label: 'Amarelo (Lembrete)' },
    { value: '#fb5607', label: 'Laranja (Importante)' },
    { value: '#ef476f', label: 'Vermelho (Urgente)' },
    { value: '#8338ec', label: 'Roxo (Projeto)' }
];


export default function EventModal({ event, initialDates, contacts, onClose, onSuccess }) {
    const { user } = useAuth();
    const [form, setForm] = useState({
        titulo: '',
        contato_id: '',
        data_inicio: '',
        data_fim: '',
        descricao: '',
        cor: '#3a86ff',
        status: 'PENDENTE'
    });
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (event) {
            setForm({
                titulo: event.titulo || '',
                contato_id: event.contato_id || '',
                data_inicio: formatDateTimeLocal(event.data_inicio),
                data_fim: formatDateTimeLocal(event.data_fim),
                descricao: event.descricao || '',
                cor: event.cor || '#3a86ff',
                status: event.status || 'PENDENTE'
            });
        } else if (initialDates) {
            setForm(prev => ({
                ...prev,
                data_inicio: formatDateTimeLocal(initialDates.start),
                data_fim: formatDateTimeLocal(initialDates.end)
            }));
        } else {
            // Default: Próxima hora cheia
            const now = new Date();
            const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours() + 1, 0, 0);
            const end = new Date(start.getTime() + 60 * 60 * 1000); // 1 hora de duração
            setForm(prev => ({
                ...prev,
                data_inicio: formatDateTimeLocal(start),
                data_fim: formatDateTimeLocal(end)
            }));
        }
    }, [event, initialDates]);

    // Auxiliar para formatar data para input datetime-local de forma "naive" (ignora timezone)
    function formatDateTimeLocal(dateInput) {
        if (!dateInput) return '';

        let date;
        if (typeof dateInput === 'string') {
            // Se vier com 'Z' ou offset, removemos para tratar como local (naive)
            // Isso evita que o new Date(string) aplique o shift de timezone
            const cleanDate = dateInput.split('.')[0].replace('Z', '').replace(/[-+]\d{2}:\d{2}$/, '');
            date = new Date(cleanDate);

            // Caso falhe (ex: formato inesperado), tentamos o parse padrão
            if (isNaN(date.getTime())) {
                date = new Date(dateInput);
            }
        } else {
            date = new Date(dateInput);
        }

        if (isNaN(date.getTime())) return '';

        const pad = (n) => n.toString().padStart(2, '0');

        const year = date.getFullYear();
        const month = pad(date.getMonth() + 1);
        const day = pad(date.getDate());
        const hours = pad(date.getHours());
        const minutes = pad(date.getMinutes());

        return `${year}-${month}-${day}T${hours}:${minutes}`;
    }

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
    };

    const validate = () => {
        const newErrors = {};
        if (!form.titulo) newErrors.titulo = "Título é obrigatório";
        if (!form.data_inicio) newErrors.data_inicio = "Início é obrigatório";
        if (!form.data_fim) newErrors.data_fim = "Fim é obrigatório";

        if (form.data_inicio && form.data_fim && new Date(form.data_inicio) > new Date(form.data_fim)) {
            newErrors.data_fim = "Fim não pode ser antes do início";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        setLoading(true);
        try {
            const payload = {
                ...form,
                data_inicio: agendaService.toISOStringLocal(form.data_inicio),
                data_fim: agendaService.toISOStringLocal(form.data_fim),
                contato_id: form.contato_id ? parseInt(form.contato_id) : null
            };

            if (event?.id) {
                await agendaService.atualizarEvento(event.id, payload);
            } else {
                await agendaService.criarEvento(payload, user?.id);
            }
            onSuccess();
        } catch (error) {
            console.error('Erro ao salvar evento:', error);
            alert('Erro ao salvar evento. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm('Excluir este compromisso?')) return;
        setLoading(true);
        try {
            await agendaService.excluirEvento(event.id);
            onSuccess();
        } catch (error) {
            console.error('Erro ao excluir evento:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-slide-up">
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 flex justify-between items-center">
                    <div className="text-white">
                        <h3 className="text-xl font-bold flex items-center gap-2">
                            <Calendar size={20} />
                            {event ? 'Editar Compromisso' : 'Novo Compromisso'}
                        </h3>
                        <p className="text-blue-100 text-xs mt-1">Organize seu tempo de forma eficiente</p>
                    </div>
                    <button onClick={onClose} className="text-white/80 hover:text-white transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    {/* Título */}
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">O que é? *</label>
                        <div className="relative">
                            <FileText className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                            <input
                                name="titulo"
                                value={form.titulo}
                                onChange={handleChange}
                                className={`w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-slate-900 border ${errors.titulo ? 'border-red-500' : 'border-gray-100 dark:border-slate-700'} rounded-lg focus:ring-2 focus:ring-blue-500 outline-none dark:text-white font-medium`}
                                placeholder="Título do compromisso"
                            />
                        </div>
                        {errors.titulo && <p className="text-xs text-red-500">{errors.titulo}</p>}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Contato */}
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Com quem? (Opcional)</label>
                            <div className="relative">
                                <Users className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                <select
                                    name="contato_id"
                                    value={form.contato_id}
                                    onChange={handleChange}
                                    className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-slate-900 border border-gray-100 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none dark:text-white appearance-none"
                                >
                                    <option value="">Ninguém específico</option>
                                    {contacts.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                                </select>
                            </div>
                        </div>

                        {/* Cor */}
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Categoria / Cor</label>
                            <div className="relative">
                                <Palette className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                <select
                                    name="cor"
                                    value={form.cor}
                                    onChange={handleChange}
                                    style={{ borderLeft: `4px solid ${form.cor}` }}
                                    className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-slate-900 border border-gray-100 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none dark:text-white appearance-none"
                                >
                                    {colors.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Início */}
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Início *</label>
                            <div className="relative">
                                <Clock className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                <input
                                    type="datetime-local"
                                    name="data_inicio"
                                    value={form.data_inicio}
                                    onChange={handleChange}
                                    className={`w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-slate-900 border ${errors.data_inicio ? 'border-red-500' : 'border-gray-100 dark:border-slate-700'} rounded-lg focus:ring-2 focus:ring-blue-500 outline-none dark:text-white`}
                                />
                            </div>
                        </div>

                        {/* Fim */}
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Fim *</label>
                            <div className="relative">
                                <Clock className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                <input
                                    type="datetime-local"
                                    name="data_fim"
                                    value={form.data_fim}
                                    onChange={handleChange}
                                    className={`w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-slate-900 border ${errors.data_fim ? 'border-red-500' : 'border-gray-100 dark:border-slate-700'} rounded-lg focus:ring-2 focus:ring-blue-500 outline-none dark:text-white`}
                                />
                            </div>
                            {errors.data_fim && <p className="text-xs text-red-500">{errors.data_fim}</p>}
                        </div>
                    </div>

                    {/* Descrição */}
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Descrição</label>
                        <textarea
                            name="descricao"
                            value={form.descricao}
                            onChange={handleChange}
                            rows={3}
                            className="w-full px-4 py-2 bg-gray-50 dark:bg-slate-900 border border-gray-100 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none dark:text-white resize-none"
                            placeholder="Detalhes sobre este compromisso..."
                        />
                    </div>

                    <div className="flex items-center gap-3 pt-4 border-t border-gray-50 dark:border-slate-700">
                        <Button type="submit" isLoading={loading} className="flex-1">
                            {event ? 'Atualizar Compromisso' : 'Salvar Compromisso'}
                        </Button>
                        {event && (
                            <button
                                type="button"
                                onClick={handleDelete}
                                className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition-colors"
                                title="Excluir"
                            >
                                <Trash2 size={20} />
                            </button>
                        )}
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-2 text-gray-500 hover:bg-gray-50 dark:hover:bg-slate-700 rounded-lg transition-colors"
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
