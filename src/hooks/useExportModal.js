import { useContext } from 'react';
import { ExportContext } from '../context/ExportContext';

export default function useExportModal() {
  const context = useContext(ExportContext);
  
  if (!context) {
    throw new Error('useExportModal deve ser usado dentro de ExportProvider');
  }
  
  return {
    isExportModalOpen: context.isExportModalOpen,
    openExportModal: context.openExportModal,
    closeExportModal: context.closeExportModal
  };
}
