import React from 'react';
import { FileText, Printer, FileDown, Layout } from 'lucide-react';
import Button from '../Button';

export default function ReportLayout({
    title,
    subtitle,
    children,
    filters,
    onExportPDF,
    onPrint,
    loading
}) {
    const today = new Date().toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Search/Filters Header - Modern ERP Style */}
            <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 p-3 md:p-4 rounded-lg shadow-sm">
                <div className="flex flex-col gap-4">
                    {/* Filtros */}
                    <div className="flex flex-col md:flex-row md:items-end gap-3 md:gap-4 w-full">
                        {filters}
                    </div>

                    {/* Botões de Exportação */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                        <Button
                            variant="secondary"
                            onClick={onPrint}
                            disabled={loading}
                            className="rounded-lg border-gray-300 dark:border-slate-600 flex items-center justify-center gap-2 w-full sm:w-auto"
                        >
                            <Printer className="h-4 w-4" />
                            <span className="hidden sm:inline">Imprimir / HTML</span>
                            <span className="sm:hidden">Imprimir</span>
                        </Button>
                        <Button
                            variant="primary"
                            onClick={onExportPDF}
                            disabled={loading}
                            className="rounded-lg bg-slate-900 hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-700 flex items-center justify-center gap-2 w-full sm:w-auto"
                        >
                            <FileDown className="h-4 w-4" />
                            <span>Exportar PDF</span>
                        </Button>
                    </div>
                </div>
            </div>

            {/* Report Content Wrapper - The actual document to be exported */}
            <div
                id="report-content"
                className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 p-4 md:p-8 shadow-md rounded-lg font-sans"
            >
                {/* Document Header */}
                <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 border-b-2 border-slate-900 dark:border-slate-700 pb-4 md:pb-6 mb-6 md:mb-8">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-lg md:text-2xl uppercase tracking-tighter">
                            <Layout className="h-5 w-5 md:h-6 md:w-6" />
                            <span>CRM GESTOR</span>
                        </div>
                        <p className="text-xs text-slate-500 uppercase font-semibold">Sistema de Gestão Comercial</p>
                    </div>

                    <div className="text-left md:text-right space-y-1">
                        <h1 className="text-lg md:text-xl font-black text-slate-900 dark:text-white uppercase leading-none">{title}</h1>
                        <p className="text-sm text-slate-600 dark:text-gray-400">{subtitle}</p>
                        <div className="pt-2 text-[10px] text-slate-400 font-mono uppercase">
                            Emitido em: {today}
                        </div>
                    </div>
                </div>

                {/* Dynamic Content */}
                <div className="min-h-[400px]">
                    {loading ? (
                        <div className="h-64 flex items-center justify-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900 dark:border-blue-500"></div>
                        </div>
                    ) : (
                        children
                    )}
                </div>

                {/* Document Footer */}
                <div className="mt-8 md:mt-12 pt-4 border-t border-gray-100 dark:border-slate-800 flex flex-col md:flex-row justify-between items-center gap-2 text-[10px] text-slate-400 uppercase font-medium">
                    <div>© {new Date().getFullYear()} CRM GESTOR - Relatórios do Sistema</div>
                    <div>Página 1 de 1</div>
                </div>
            </div>
        </div>
    );
}
