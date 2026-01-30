import { useContext } from 'react';
import { ImportContext } from '../context/ImportContext';

export default function useImportModal() {
  const context = useContext(ImportContext);
  
  if (!context) {
    throw new Error('useImportModal deve ser usado dentro de ImportProvider');
  }
  
  return {
    isImportModalOpen: context.isImportModalOpen,
    openImportModal: context.openImportModal,
    closeImportModal: context.closeImportModal,
    setImportSuccessCallback: context.setImportSuccessCallback
  };
}
