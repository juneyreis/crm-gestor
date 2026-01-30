import { useState, useRef } from 'react';
import { Upload, X, AlertCircle, CheckCircle, Loader } from 'lucide-react';
import * as visitasService from '../../services/visitasService';

export default function ImportModal({ isOpen, onClose, onSuccess, userId }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState([]);
  const [validationErrors, setValidationErrors] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [importStatus, setImportStatus] = useState(null); // 'loading', 'success', 'error'
  const fileInputRef = useRef(null);

  // Validar campo obrigatório
  const validateRecord = (record, index) => {
    const errors = [];
    const requiredFields = ['data', 'prospect', 'endereco', 'cidade', 'bairro', 'sistema', 'regime'];

    requiredFields.forEach(field => {
      if (!record[field] || String(record[field]).trim() === '') {
        errors.push(`Linha ${index + 1}: Campo "${field}" é obrigatório`);
      }
    });

    // Validar formato de data
    if (record.data && !/^\d{4}-\d{2}-\d{2}$/.test(record.data)) {
      errors.push(`Linha ${index + 1}: Data deve estar no formato YYYY-MM-DD`);
    }

    return errors;
  };

  // Limpar dados
  const sanitizeRecord = (record) => {
    const sanitized = {};
    Object.keys(record).forEach(key => {
      if (typeof record[key] === 'string') {
        sanitized[key] = record[key].trim();
      } else {
        sanitized[key] = record[key];
      }
    });
    return sanitized;
  };

  // Processar arquivo JSON selecionado
  const handleFileSelect = async (e) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setValidationErrors([]);
    setPreview([]);
    setImportStatus(null);

    try {
      const fileContent = await selectedFile.text();
      const data = JSON.parse(fileContent);

      // Normalizar para array
      let records = Array.isArray(data) ? data : [data];

      // Validar todos os registros
      const errors = [];
      const validRecords = [];

      records.forEach((record, index) => {
        const recordErrors = validateRecord(record, index);
        if (recordErrors.length > 0) {
          errors.push(...recordErrors);
        } else {
          validRecords.push(sanitizeRecord(record));
        }
      });

      setValidationErrors(errors);
      setPreview(validRecords);
    } catch (error) {
      setValidationErrors([`Erro ao ler arquivo: ${error.message}`]);
      setPreview([]);
    }
  };

  // Importar registros para Supabase
  const handleImport = async () => {
    if (preview.length === 0) return;

    setIsLoading(true);
    setImportStatus('loading');

    try {
      await visitasService.importarVisitasEmLote(preview, userId);
      setImportStatus('success');
    } catch (error) {
      console.error('Erro ao importar:', error);
      setImportStatus('error');
      setValidationErrors([`Erro ao importar: ${error.message}`]);
      setIsLoading(false);
    }
  };

  // Fechar modal
  const handleClose = () => {
    // Se foi sucesso, chamar callback
    if (importStatus === 'success') {
      onSuccess?.();
    }
    
    setFile(null);
    setPreview([]);
    setValidationErrors([]);
    setImportStatus(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="relative w-full max-w-2xl mx-4 max-h-96 bg-white rounded-xl shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Upload className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Importar Visitas</h2>
              <p className="text-sm text-gray-600">Selecione um arquivo JSON com as visitas</p>
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
          {/* Status de Importação */}
          {importStatus === 'success' && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-green-900">Importação concluída!</h3>
                <p className="text-sm text-green-700">{preview.length} visitas importadas com sucesso.</p>
              </div>
            </div>
          )}

          {importStatus === 'error' && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-red-900">Erro na importação</h3>
                <p className="text-sm text-red-700">{validationErrors[0]}</p>
              </div>
            </div>
          )}

          {importStatus !== 'success' && (
            <>
              {/* Seletor de Arquivo */}
              <div className="mb-6">
                <label className="flex flex-col items-center justify-center w-full p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 cursor-pointer transition-colors">
                  <div className="flex flex-col items-center justify-center">
                    <Upload className="h-10 w-10 text-gray-400 mb-2" />
                    <p className="text-sm font-medium text-gray-900">
                      {file?.name || 'Clique para selecionar arquivo JSON'}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">ou arraste um arquivo aqui</p>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".json"
                    onChange={handleFileSelect}
                    disabled={isLoading}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Erros de Validação */}
              {validationErrors.length > 0 && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-red-900 mb-2">Erros encontrados:</h3>
                      <ul className="space-y-1">
                        {validationErrors.map((error, idx) => (
                          <li key={idx} className="text-sm text-red-700">• {error}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* Preview de Registros */}
              {preview.length > 0 && (
                <div>
                  <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-blue-900 mb-1">Arquivo validado com sucesso</h3>
                      <p className="text-sm text-blue-700">{preview.length} visita(s) pronta(s) para importar</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h3 className="font-semibold text-gray-900">Preview dos registros:</h3>
                    <div className="max-h-48 overflow-y-auto space-y-2">
                      {preview.map((record, idx) => (
                        <div key={idx} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>
                              <span className="text-gray-600">Prospect:</span>
                              <p className="font-medium text-gray-900">{record.prospect}</p>
                            </div>
                            <div>
                              <span className="text-gray-600">Data:</span>
                              <p className="font-medium text-gray-900">{record.data}</p>
                            </div>
                            <div>
                              <span className="text-gray-600">Cidade:</span>
                              <p className="font-medium text-gray-900">{record.cidade}</p>
                            </div>
                            <div>
                              <span className="text-gray-600">Contato:</span>
                              <p className="font-medium text-gray-900">{record.contato}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        {importStatus === 'success' ? (
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
              onClick={handleImport}
              disabled={preview.length === 0 || isLoading || validationErrors.length > 0}
              className="px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader className="h-4 w-4 animate-spin" />
                  Importando...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" />
                  Importar {preview.length > 0 ? `(${preview.length})` : ''}
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
