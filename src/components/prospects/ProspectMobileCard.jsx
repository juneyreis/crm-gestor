// src/components/prospects/ProspectMobileCard.jsx
import { Edit2, Trash2, Phone, Mail, MapPin, User, Building } from 'lucide-react';

const CLASSIFICATION_COLORS = {
    'Ice': 'bg-[#E0F7FA] text-cyan-800 border-cyan-200 dark:bg-cyan-900/20 dark:text-cyan-300 dark:border-cyan-800',
    'Cold': 'bg-[#B3E5FC] text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800',
    'Warm': 'bg-[#FFECB3] text-orange-800 border-orange-200 dark:bg-orange-900/20 dark:text-orange-300 dark:border-orange-800',
    'Hot': 'bg-[#FFCDD2] text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800'
};

export default function ProspectMobileCard({ prospect, onEdit, onDelete }) {
    return (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 p-5 shadow-sm hover:shadow-md transition-all active:scale-[0.99]">
            {/* Header: Nome + Classificação */}
            <div className="flex items-start justify-between gap-3 mb-4">
                <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-900 dark:text-white text-lg leading-tight uppercase truncate">
                        {prospect.nome}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                        <span className={`px-2 py-0.5 text-xs font-bold rounded-full border ${CLASSIFICATION_COLORS[prospect.classificacao] || 'bg-gray-100 dark:bg-slate-700 text-gray-800 dark:text-gray-300 border-gray-200 dark:border-slate-600'}`}>
                            {prospect.classificacao || 'COLD'}
                        </span>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-50 dark:bg-slate-700/50 text-slate-600 dark:text-slate-300 text-xs font-medium border border-slate-200 dark:border-slate-600">
                            <div className="w-1.5 h-1.5 rounded-full bg-slate-400"></div>
                            {prospect.status || 'NOVO'}
                        </span>
                    </div>
                </div>
            </div>

            {/* Informações de Contato */}
            <div className="space-y-2 mb-4">
                {/* Localização */}
                {(prospect.cidade || prospect.uf) && (
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <MapPin className="h-4 w-4 text-gray-400 flex-shrink-0" />
                        <span className="uppercase font-medium">
                            {prospect.cidade}{prospect.uf ? ` - ${prospect.uf}` : ''}
                        </span>
                    </div>
                )}

                {/* Contato (Pessoa) */}
                {prospect.contato && (
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <User className="h-4 w-4 text-gray-400 flex-shrink-0" />
                        <span className="uppercase font-medium">{prospect.contato}</span>
                    </div>
                )}

                {/* Telefone */}
                {prospect.telefone && (
                    <a
                        href={`tel:${prospect.telefone.replace(/\D/g, '')}`}
                        className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                    >
                        <Phone className="h-4 w-4 flex-shrink-0" />
                        <span className="font-mono">{prospect.telefone}</span>
                    </a>
                )}

                {/* Celular */}
                {prospect.celular && (
                    <a
                        href={`https://wa.me/${prospect.celular.replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors"
                    >
                        <Phone className="h-4 w-4 flex-shrink-0" />
                        <span className="font-mono font-bold">{prospect.celular}</span>
                    </a>
                )}

                {/* Email */}
                {prospect.email && (
                    <a
                        href={`mailto:${prospect.email}`}
                        className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                    >
                        <Mail className="h-4 w-4 flex-shrink-0" />
                        <span className="lowercase truncate">{prospect.email}</span>
                    </a>
                )}

                {/* Segmento e Concorrente */}
                <div className="flex flex-wrap gap-2 pt-2">
                    {prospect.segmentos?.descricao && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-medium rounded-md border border-blue-100 dark:border-blue-800">
                            <Building className="h-3 w-3" />
                            {prospect.segmentos.descricao}
                        </span>
                    )}
                    {prospect.concorrentes?.descricao && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-orange-50 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 text-xs font-medium rounded-md border border-orange-100 dark:border-orange-800">
                            {prospect.concorrentes.descricao}
                        </span>
                    )}
                </div>
            </div>

            {/* Ações - Touch-friendly (min 44x44px) */}
            <div className="flex gap-3 pt-3 border-t border-gray-100 dark:border-slate-700">
                <button
                    onClick={() => onEdit(prospect)}
                    className="flex-1 flex items-center justify-center gap-2 min-h-[44px] px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors shadow-sm"
                >
                    <Edit2 className="h-4 w-4" />
                    Editar
                </button>
                <button
                    onClick={() => onDelete(prospect.id, prospect.nome)}
                    className="flex items-center justify-center min-h-[44px] min-w-[44px] px-3 py-2 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg border border-red-100 dark:border-red-800 transition-colors"
                >
                    <Trash2 className="h-4 w-4" />
                </button>
            </div>
        </div>
    );
}
