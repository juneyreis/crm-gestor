// src/components/Header.jsx - ATUALIZADO COM MOBILE
import { Briefcase, Sun, Moon, Menu, X, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import MobileMenu from './MobileMenu';
import useTheme from '../hooks/useTheme';
import useSidebar from '../hooks/useSidebar';
import useAuth from '../hooks/useAuth';

export default function Header() {
  const { theme, toggleTheme } = useTheme();
  const { isOpen, toggleSidebar } = useSidebar();
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <header className="sticky top-0 z-10 h-16 bg-gradient-to-r from-slate-800 to-slate-900 text-white shadow-lg">
      <div className="container mx-auto flex h-full items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-3">
          <Briefcase className="h-7 w-7 text-blue-400" />
          <div>
            <h1 className="text-xl font-bold tracking-tight">Sistema de Controle de Prospects</h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <MobileMenu />
          <button
            onClick={toggleSidebar}
            className="hidden md:flex h-8 w-8 rounded-full bg-slate-700 hover:bg-slate-600 items-center justify-center transition-colors duration-200"
            title={isOpen ? 'Recolher sidebar' : 'Expandir sidebar'}
          >
            {isOpen ? (
              <Menu className="h-4 w-4" />
            ) : (
              <X className="h-4 w-4" />
            )}
          </button>
          <button
            onClick={toggleTheme}
            className="hidden md:flex h-8 w-8 rounded-full bg-slate-700 hover:bg-slate-600 items-center justify-center transition-colors duration-200"
            title={theme === 'dark' ? 'Mudar para tema claro' : 'Mudar para tema escuro'}
          >
            {theme === 'dark' ? (
              <Sun className="h-4 w-4 text-yellow-400" />
            ) : (
              <Moon className="h-4 w-4 text-slate-400" />
            )}
          </button>
          {user && (
            <div className="hidden md:flex items-center gap-2 border-l border-slate-700 pl-3 ml-1">
              <span className="text-[10px] font-bold text-gray-400 opacity-60 uppercase tracking-widest hidden lg:block">
                {user.email?.split('@')[0]}
              </span>
              <button
                onClick={handleLogout}
                disabled={loggingOut}
                className="h-8 w-8 rounded-full bg-red-600 hover:bg-red-700 flex items-center justify-center transition-colors duration-200 disabled:opacity-50"
                title="Fazer logout"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}