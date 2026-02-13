import React from 'react';
import { Calendar as CalendarIcon, Clock, AlertCircle } from 'lucide-react';

export default function DashboardAgenda({ events = [] }) {
    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-6 shadow-lg h-full">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <CalendarIcon className="h-5 w-5 text-blue-500" />
                    Agenda de Hoje
                </h2>
                <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-2.5 py-1 rounded-full font-bold uppercase tracking-wider">
                    {events.length} Evento(s)
                </span>
            </div>

            <div className="space-y-3 overflow-y-auto pr-1 custom-scrollbar max-h-[300px]">
                {events.length > 0 ? (
                    events.map(event => (
                        <div key={event.id} className="p-3 bg-gray-50 dark:bg-slate-700/50 rounded-lg border border-gray-100 dark:border-slate-600 hover:border-blue-200 dark:hover:border-blue-800 transition-colors">
                            <div className="flex items-center gap-2 mb-1">
                                <Clock size={12} className="text-blue-500" />
                                <span className="text-[11px] font-medium text-gray-500 dark:text-gray-400">
                                    {(() => {
                                        const cleanDate = event.data_inicio.split('.')[0].replace('Z', '').replace(/[-+]\d{2}:\d{2}$/, '');
                                        const d = new Date(cleanDate);
                                        const dateObj = isNaN(d.getTime()) ? new Date(event.data_inicio) : d;
                                        return dateObj.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
                                    })()}
                                </span>
                            </div>
                            <h4 className="text-sm font-bold text-gray-800 dark:text-gray-200 truncate" title={event.titulo}>
                                {event.titulo}
                            </h4>
                            {event.descricao && (
                                <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-1">{event.descricao}</p>
                            )}
                        </div>
                    ))
                ) : (
                    <div className="flex flex-col items-center justify-center py-12 opacity-50">
                        <AlertCircle size={32} className="text-gray-300 dark:text-slate-600 mb-2" />
                        <p className="text-sm text-gray-500 dark:text-gray-400 text-center">Tudo livre por hoje!</p>
                    </div>
                )}
            </div>
        </div>
    );
}
