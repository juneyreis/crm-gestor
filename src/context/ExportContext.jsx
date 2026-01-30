import { createContext, useState } from 'react';

export const ExportContext = createContext();

export function ExportProvider({ children }) {
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  const openExportModal = () => {
    setIsExportModalOpen(true);
  };

  const closeExportModal = () => {
    setIsExportModalOpen(false);
  };

  return (
    <ExportContext.Provider
      value={{
        isExportModalOpen,
        openExportModal,
        closeExportModal
      }}
    >
      {children}
    </ExportContext.Provider>
  );
}
