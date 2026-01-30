// src/pages/Relatorios.jsx - NOVO ARQUIVO
import { FileText, Download, Filter, BarChart3 } from 'lucide-react';
import Button from '../components/Button';

export default function Relatorios() {
  const reports = [
    { title: 'Visitas por Cidade', type: 'PDF', date: 'Hoje', icon: BarChart3, color: 'bg-blue-100 text-blue-600' },
    { title: 'Conversão por Regime', type: 'Excel', date: 'Ontem', icon: FileText, color: 'bg-green-100 text-green-600' },
    { title: 'Faturamento Mensal', type: 'PDF', date: '12/01', icon: BarChart3, color: 'bg-purple-100 text-purple-600' },
    { title: 'Clientes Ativos', type: 'CSV', date: '10/01', icon: FileText, color: 'bg-orange-100 text-orange-600' },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Cabeçalho */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Relatórios</h1>
          <p className="text-gray-600 mt-2">Gere e visualize relatórios detalhados das suas visitas</p>
        </div>
        <div className="flex gap-3">
          <Button variant="primary" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Novo Relatório
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-6">
          <Filter className="h-5 w-5 text-gray-600" />
          <h2 className="text-lg font-semibold text-gray-900">Filtrar Relatórios</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Período</label>
            <select className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              <option>Últimos 7 dias</option>
              <option>Últimos 30 dias</option>
              <option>Últimos 90 dias</option>
              <option>Personalizado</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Relatório</label>
            <select className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              <option>Todos</option>
              <option>PDF</option>
              <option>Excel</option>
              <option>CSV</option>
              <option>HTML</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Cidade</label>
            <select className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              <option>Todas</option>
              <option>Porto Alegre</option>
              <option>Caxias do Sul</option>
              <option>Pelotas</option>
              <option>Santa Maria</option>
            </select>
          </div>
        </div>
        
        <div className="mt-6 flex gap-3">
          <Button variant="primary" className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Aplicar Filtros
          </Button>
          <Button variant="secondary">Limpar Filtros</Button>
        </div>
      </div>

      {/* Lista de relatórios */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Relatórios Gerados</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {reports.map((report, index) => (
            <div key={index} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-lg ${report.color}`}>
                    <report.icon className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{report.title}</h3>
                    <div className="flex items-center gap-4 mt-2">
                      <span className="text-sm text-gray-600">{report.type}</span>
                      <span className="text-sm text-gray-500">•</span>
                      <span className="text-sm text-gray-600">{report.date}</span>
                    </div>
                  </div>
                </div>
                <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <Download className="h-5 w-5 text-gray-600" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Ações de exportação */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-8 text-center">
        <FileText className="h-12 w-12 text-blue-600 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Exportar Dados</h3>
        <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
          Exporte todas as suas visitas para análise externa em diferentes formatos
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Button variant="primary" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Exportar JSON
          </Button>
          <Button variant="secondary" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Exportar CSV
          </Button>
          <Button variant="secondary" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Relatório HTML
          </Button>
        </div>
      </div>
    </div>
  );
}