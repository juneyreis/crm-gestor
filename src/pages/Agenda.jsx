import React, { useState, useEffect, useCallback } from 'react';
import {
    Users,
    Plus,
    Search,
    Calendar as CalendarIcon,
    Clock,
    MoreVertical,
    Briefcase,
    User,
    AlertCircle
} from 'lucide-react';
import useAuth from '../hooks/useAuth';
import * as agendaService from '../services/agendaService';
import CalendarComponent from '../components/agenda/CalendarComponent';
import Button from '../components/Button';
import ContactModal from '../components/agenda/ContactModal';
import EventModal from '../components/agenda/EventModal';

export default function Agenda() {
    const { user } = useAuth();
    const [contacts, setContacts] = useState([]);
    const [events, setEvents] = useState([]);
    const [todayEvents, setTodayEvents] = useState([]);
    const [, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filter] = useState('all');
    const [activeTab, setActiveTab] = useState('calendar'); // 'calendar' ou 'contacts'

    // Modais
    const [isContactModalOpen, setIsContactModalOpen] = useState(false);
    const [isEventModalOpen, setIsEventModalOpen] = useState(false);
    const [selectedContact, setSelectedContact] = useState(null);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [selectedDates, setSelectedDates] = useState(null);

    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const [allContacts, allEvents, today] = await Promise.all([
                agendaService.listarContatos(user.id),
                agendaService.listarEventos(user.id),
                agendaService.listarCompromissosHoje(user.id)
            ]);
            setContacts(allContacts);
            setEvents(allEvents.map(e => ({
                id: e.id,
                title: e.titulo,
                start: e.data_inicio,
                end: e.data_fim,
                backgroundColor: e.cor,
                extendedProps: {
                    descricao: e.descricao,
                    contato_id: e.contato_id,
                    status: e.status
                }
            })));
            setTodayEvents(today);
        } catch (error) {
            console.error('Erro ao carregar agenda:', error);
        } finally {
            setLoading(false);
        }
    }, [user?.id]);

    useEffect(() => {
        if (user?.id) {
            loadData();
        }
    }, [user?.id, loadData]);

    const filteredContacts = contacts.filter(c =>
        c.nome.toLowerCase().includes(searchTerm.toLowerCase()) &&
        (filter === 'all' || c.tipo.toLowerCase() === filter.toLowerCase())
    );

    // Handlers do Calendário
    const handleDateSelect = (selectInfo) => {
        setSelectedDates({ start: selectInfo.startStr, end: selectInfo.endStr });
        setSelectedEvent(null);
        setIsEventModalOpen(true);
    };

    const handleEventClick = (clickInfo) => {
        const event = {
            id: clickInfo.event.id,
            titulo: clickInfo.event.title,
            data_inicio: clickInfo.event.startStr,
            data_fim: clickInfo.event.endStr,
            cor: clickInfo.event.backgroundColor,
            ...clickInfo.event.extendedProps
        };
        setSelectedEvent(event);
        setIsEventModalOpen(true);
    };

    const handleEventDrop = async (dropInfo) => {
        try {
            await agendaService.atualizarEvento(dropInfo.event.id, {
                data_inicio: agendaService.toISOStringLocal(dropInfo.event.start),
                data_fim: dropInfo.event.end ? agendaService.toISOStringLocal(dropInfo.event.end) : agendaService.toISOStringLocal(dropInfo.event.start)
            });
            loadData();
        } catch (error) {
            console.error('Erro ao mover evento:', error);
            dropInfo.revert();
        }
    };

    return (
        <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-180px)] md:h-[calc(100vh-200px)] min-h-[500px] lg:min-h-[600px] animate-fade-in relative">

            {/* Tabs Mobile (Segmented Control) */}
            <div className="lg:hidden flex p-1 bg-gray-100 dark:bg-slate-900 rounded-xl mb-2">
                <button
                    onClick={() => setActiveTab('calendar')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'calendar' ? 'bg-white dark:bg-slate-800 text-blue-600 shadow-sm' : 'text-gray-500'}`}
                >
                    <CalendarIcon size={16} />
                    Calendário
                </button>
                <button
                    onClick={() => setActiveTab('contacts')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'contacts' ? 'bg-white dark:bg-slate-800 text-blue-600 shadow-sm' : 'text-gray-500'}`}
                >
                    <Users size={16} />
                    Contatos
                </button>
            </div>

            {/* Coluna Esquerda: Contatos e Hoje */}
            <div className={`${activeTab === 'contacts' ? 'flex' : 'hidden'} lg:flex lg:w-80 flex-col gap-6 overflow-hidden h-full`}>

                {/* Painel de Contatos */}
                <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm flex flex-col overflow-hidden flex-1">
                    <div className="p-4 border-b border-gray-50 dark:border-slate-700 flex items-center justify-between">
                        <h2 className="font-bold text-gray-800 dark:text-white flex items-center gap-2">
                            <Users size={18} className="text-blue-500" />
                            Contatos
                        </h2>
                        <button
                            onClick={() => { setSelectedContact(null); setIsContactModalOpen(true); }}
                            className="p-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400 transition-colors"
                        >
                            <Plus size={16} />
                        </button>
                    </div>

                    <div className="p-3">
                        <div className="relative">
                            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Buscar contato..."
                                className="w-full pl-9 pr-4 py-2 bg-gray-50 dark:bg-slate-900 rounded-lg text-sm border-none focus:ring-2 focus:ring-blue-500 outline-none dark:text-white"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto px-3 pb-3 space-y-2 custom-scrollbar">
                        {filteredContacts.length > 0 ? (
                            filteredContacts.map(contact => (
                                <div
                                    key={contact.id}
                                    onClick={() => { setSelectedContact(contact); setIsContactModalOpen(true); }}
                                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-700 group cursor-pointer border border-transparent hover:border-gray-100 dark:hover:border-slate-600 transition-all"
                                >
                                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-sm ring-2 ring-white dark:ring-slate-800">
                                        {contact.nome.charAt(0)}
                                    </div>
                                    <div className="flex-1 overflow-hidden">
                                        <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100 truncate">{contact.nome}</h3>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 truncate">
                                            {contact.empresa ? <Briefcase size={10} /> : <User size={10} />}
                                            {contact.empresa || contact.tipo}
                                        </p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-8">
                                <Users size={32} className="mx-auto text-gray-200 dark:text-slate-700 mb-2" />
                                <p className="text-xs text-gray-400">Nenhum contato encontrado</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Painel Hoje */}
                <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl p-5 text-white shadow-lg space-y-4 shrink-0">
                    <div className="flex items-center justify-between">
                        <h3 className="font-bold flex items-center gap-2">
                            <CalendarIcon size={18} />
                            Agenda de Hoje
                        </h3>
                        <span className="text-[10px] bg-white/20 px-2 py-1 rounded-full uppercase font-bold tracking-wider">
                            {todayEvents.length} Evento(s)
                        </span>
                    </div>

                    <div className="space-y-3 max-h-[150px] overflow-y-auto pr-1 custom-scrollbar">
                        {todayEvents.length > 0 ? (
                            todayEvents.map(event => (
                                <div key={event.id} className="bg-white/10 hover:bg-white/20 p-3 rounded-lg border border-white/10 transition-colors">
                                    <div className="flex items-center gap-2 mb-1">
                                        <Clock size={12} className="text-blue-200" />
                                        <span className="text-[11px] font-medium text-blue-100 italic">
                                            {(() => {
                                                // Parse "naive": ignora shift de timezone vindo do banco/string
                                                const cleanDate = event.data_inicio.split('.')[0].replace('Z', '').replace(/[-+]\d{2}:\d{2}$/, '');
                                                const d = new Date(cleanDate);

                                                // Fallback se falhar
                                                const dateObj = isNaN(d.getTime()) ? new Date(event.data_inicio) : d;

                                                const hours = dateObj.getHours().toString().padStart(2, '0');
                                                const minutes = dateObj.getMinutes().toString().padStart(2, '0');
                                                return `${hours}:${minutes}`;
                                            })()}
                                        </span>
                                    </div>
                                    <h4 className="text-sm font-bold truncate">{event.titulo}</h4>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-4 flex flex-col items-center gap-2 opacity-50">
                                <AlertCircle size={20} />
                                <p className="text-xs">Tudo livre por hoje!</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Coluna Direita: Calendário */}
            <div className={`${activeTab === 'calendar' ? 'flex' : 'hidden'} lg:flex flex-1 bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-xl overflow-hidden flex flex-col h-full`}>
                <div className="flex-1 p-1 md:p-2 min-h-0">
                    <CalendarComponent
                        events={events}
                        onDateSelect={handleDateSelect}
                        onEventClick={handleEventClick}
                        onEventDrop={handleEventDrop}
                    />
                </div>
            </div>

            {/* FAB Mobile (Floating Action Button) */}
            <button
                onClick={() => { setSelectedEvent(null); setSelectedDates(null); setIsEventModalOpen(true); }}
                className="lg:hidden fixed bottom-24 right-6 w-14 h-14 bg-blue-600 text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-40"
            >
                <Plus size={28} />
            </button>

            {/* Modais */}
            {isContactModalOpen && (
                <ContactModal
                    contact={selectedContact}
                    onClose={() => setIsContactModalOpen(false)}
                    onSuccess={() => { setIsContactModalOpen(false); loadData(); }}
                />
            )}

            {isEventModalOpen && (
                <EventModal
                    event={selectedEvent}
                    initialDates={selectedDates}
                    contacts={contacts}
                    onClose={() => setIsEventModalOpen(false)}
                    onSuccess={() => { setIsEventModalOpen(false); loadData(); }}
                />
            )}
        </div>
    );
}
