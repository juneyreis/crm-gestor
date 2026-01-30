import { createContext, useState, useMemo } from 'react';

export const ImportContext = createContext();

export function ImportProvider({ children }) {
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [onImportSuccess, setOnImportSuccess] = useState(null);

  const openImportModal = (onSuccess) => {
    if (onSuccess) {
      setOnImportSuccess(() => onSuccess);
    }
    setIsImportModalOpen(true);
  };

  const closeImportModal = () => {
    setIsImportModalOpen(false);
  };

  const setImportSuccessCallback = (callback) => {
    setOnImportSuccess(() => callback);
  };

  const value = useMemo(() => ({
    isImportModalOpen,
    openImportModal,
    closeImportModal,
    onImportSuccess,
    setImportSuccessCallback
  }), [isImportModalOpen, onImportSuccess]);

  return (
    <ImportContext.Provider value={value}>
      {children}
    </ImportContext.Provider>
  );
}
