import { useState } from 'react';
import { Download, X, AlertCircle, CheckCircle, Loader } from 'lucide-react';
import { gerarNomeArquivoExportacao, filtrarCamposExportacao } from '../../utils/exportUtils';

export default function ExportModal({ isOpen, onClose, visits = [] }) {
  const [isLoading, setIsLoading] = useState(false);
  const [exportStatus, setExportStatus] = useState(null); // 'loading', 'success', 'error', null
  const [errorMessage, setErrorMessage] = useState('');
  const [fileName, setFileName] = useState(gerarNomeArquivoExportacao());

  // Exportar arquivo
  const handleExport = async () => {
    setIsLoading(true);
    setExportStatus('loading');

    try {
      // Filtrar campos para exportação
      const visitasFiltradas = visits.map(visita => filtrarCamposExportacao(visita));

      // Gerar JSON com formatação
      const jsonString = JSON.stringify(visitasFiltradas, null, 2);

      // Criar Blob
      const blob = new Blob([jsonString], { type: 'application/json' });

      // Criar URL e link de download
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;

      // Disparar download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Limpar URL
      URL.revokeObjectURL(url);

      setExportStatus('success');
    } catch (error) {
      console.error('Erro ao exportar:', error);
      setErrorMessage(`Erro ao gerar arquivo: ${error.message}`);
      setExportStatus('error');
      setIsLoading(false);
    }
  };

  // Fechar modal
  const handleClose = () => {
    setIsLoading(false);
    setExportStatus(null);
    setErrorMessage('');
    setFileName(gerarNomeArquivoExportacao());
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="relative w-full max-w-2xl mx-4 max-h-96 bg-white rounded-xl shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Download className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Exportar Visitas</h2>
              <p className="text-sm text-gray-600">Baixe suas visitas em formato JSON</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Conteúdo */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Status de Sucesso */}
          {exportStatus === 'success' && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-green-900">Exportação concluída!</h3>
                <p className="text-sm text-green-700">Arquivo '{fileName}' foi baixado com sucesso.</p>
              </div>
            </div>
          )}

          {/* Status de Erro */}
          {exportStatus === 'error' && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-red-900">Erro na exportação</h3>
                <p className="text-sm text-red-700">{errorMessage}</p>
              </div>
            </div>
          )}

          {/* Sem registros */}
          {visits.length === 0 && exportStatus !== 'success' && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-yellow-900">Nenhuma visita para exportar</h3>
                <p className="text-sm text-yellow-700">Aplique filtros ou volte e crie novas visitas antes de exportar.</p>
              </div>
            </div>
          )}

          {exportStatus !== 'success' && visits.length > 0 && (
            <>
              {/* Informações */}
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-blue-900 mb-2">Pronto para exportar</h3>
                    <p className="text-sm text-blue-700 mb-3">
                      {visits.length} visita(s) serão exportadas para:
                    </p>
                    <p className="text-sm font-mono bg-white p-2 rounded border border-blue-300">
                      {fileName}
                    </p>
                  </div>
                </div>
              </div>

              {/* Preview */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Preview das visitas:</h3>
                <div className="max-h-48 overflow-y-auto space-y-2">
                  {visits.map((visit, idx) => (
                    <div key={visit.id || idx} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-gray-600">Prospect:</span>
                          <p className="font-medium text-gray-900">{visit.prospect}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Data:</span>
                          <p className="font-medium text-gray-900">{visit.data}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Cidade:</span>
                          <p className="font-medium text-gray-900">{visit.cidade}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Sistema:</span>
                          <p className="font-medium text-gray-900">{visit.sistema}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        {exportStatus === 'success' ? (
          <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
            <button
              onClick={handleClose}
              className="px-4 py-2 text-white bg-green-600 hover:bg-green-700 rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              Fechar
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
            <button
              onClick={handleClose}
              disabled={isLoading}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              onClick={handleExport}
              disabled={visits.length === 0 || isLoading}
              className="px-4 py-2 text-white bg-green-600 hover:bg-green-700 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader className="h-4 w-4 animate-spin" />
                  Exportando...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4" />
                  Exportar ({visits.length})
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
