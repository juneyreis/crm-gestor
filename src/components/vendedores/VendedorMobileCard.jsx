import React from 'react';
import { Edit2, Trash2, MapPin, Phone, User, MessageCircle } from 'lucide-react';

export default function VendedorMobileCard({ vendedor, onEdit, onDelete }) {
    const initials = vendedor.nome ? vendedor.nome.substring(0, 2).toUpperCase() : 'V';
    const whatsappLink = vendedor.celular ? `https://wa.me/55${vendedor.celular.replace(/\D/g, '')}` : null;

    return (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 p-5 shadow-sm active:scale-[0.99] transition-transform">
            <div className="flex justify-between items-start mb-5">
                <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-700 dark:text-blue-400 text-sm font-black border border-blue-200 dark:border-blue-800">
                        {initials}
                    </div>
                    <div>
                        <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest leading-none block mb-1">
                            ID #{vendedor.id}
                        </span>
                        <h3 className="font-bold text-gray-900 dark:text-white text-lg leading-tight uppercase">
                            {vendedor.nome}
                        </h3>
                    </div>
                </div>

                <div className="flex gap-1 -mr-2 -mt-1">
                    <button
                        onClick={() => onEdit(vendedor)}
                        className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                        title="Editar"
                    >
                        <Edit2 className="h-5 w-5" />
                    </button>
                    <button
                        onClick={() => onDelete(vendedor.id, vendedor.nome)}
                        className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                        title="Excluir"
                    >
                        <Trash2 className="h-5 w-5" />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-3 py-4 border-t border-gray-100 dark:border-slate-700/50">
                <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <span className="uppercase font-medium truncate">
                        {vendedor.cidade ? `${vendedor.cidade}/${vendedor.uf || ''}` : 'Cidade não informada'}
                    </span>
                </div>

                <div className="flex items-center justify-between mt-1">
                    <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                        <Phone className="h-4 w-4 text-gray-400" />
                        <span className="font-mono">{vendedor.celular || '-'}</span>
                    </div>

                    {whatsappLink && (
                        <a
                            href={whatsappLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-3 py-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 rounded-xl text-xs font-bold border border-emerald-100 dark:border-emerald-900/30 hover:bg-emerald-100 transition-colors"
                        >
                            <MessageCircle className="h-3.5 w-3.5" />
                            WHATSAPP
                        </a>
                    )}
                </div>
            </div>
        </div>
    );
}
