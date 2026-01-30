import { createContext, useState, useEffect } from 'react';

export const SidebarContext = createContext();

export function SidebarProvider({ children }) {
  const [isOpen, setIsOpen] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);

  // Carregar estado do sidebar do localStorage na montagem
  useEffect(() => {
    const savedState = localStorage.getItem('sidebarOpen');
    if (savedState !== null) {
      setIsOpen(JSON.parse(savedState));
    }
    setIsLoaded(true);
  }, []);

  // Alternar sidebar
  const toggleSidebar = () => {
    setIsOpen(prevState => {
      const newState = !prevState;
      // Salvar preferência
      localStorage.setItem('sidebarOpen', JSON.stringify(newState));
      return newState;
    });
  };

  // Não renderizar até o estado estar carregado para evitar flash
  if (!isLoaded) {
    return null;
  }

  return (
    <SidebarContext.Provider value={{ isOpen, toggleSidebar }}>
      {children}
    </SidebarContext.Provider>
  );
}
