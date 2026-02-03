// src/components/MobileMenu.jsx - ATUALIZADO COM TEMA, LOGOUT E SUBMENUS
import { Menu, X, Sun, Moon, LogOut, Home, Calendar, FileText, BarChart3, ChevronDown, Database, Users, Briefcase } from 'lucide-react';
import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import useTheme from '../hooks/useTheme';
import useAuth from '../hooks/useAuth';

export default function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [openSubMenus, setOpenSubMenus] = useState({});
  const { theme, toggleTheme } = useTheme();
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const [loggingOut, setLoggingOut] = useState(false);

  const menuItems = [
    { icon: <Home size={18} />, label: "Dashboard", to: "/dashboard" },
    {
      icon: <Database size={18} />,
      label: "Tabelas",
      to: "#",
      subItems: [
        { label: "Segmentos", to: "/tabelas/segmentos" },
        { label: "Concorrentes", to: "/tabelas/concorrentes" },
        { label: "Vendedores", to: "/tabelas/vendedores" },
        { label: "Prospects", to: "/prospects" },
        { label: "Clientes", to: "/clientes" },
        { label: "Visitas", to: "/visitas" },
      ]
    },
    { icon: <FileText size={18} />, label: "Relatórios", to: "/relatorios" },
    { icon: <BarChart3 size={18} />, label: "Estatísticas", to: "/estatisticas" },
  ];

  const handleLogout = async () => {
    setLoggingOut(true);
    await logout();
    setIsOpen(false);
    navigate('/login', { replace: true });
  };

  const handleToggleTheme = () => {
    toggleTheme();
  };

  const toggleSubMenu = (label) => {
    setOpenSubMenus(prev => ({
      ...prev,
      [label]: !prev[label]
    }));
  };

  return (
    <div className="md:hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-lg bg-slate-700 hover:bg-slate-600 transition-colors"
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {isOpen && (
        <div className="absolute top-16 left-0 right-0 bg-slate-800 border-t border-slate-700 shadow-xl z-50 max-h-[calc(100vh-64px)] overflow-y-auto">
          <nav className="flex flex-col p-4 gap-1">
            {menuItems.map((item, index) => {
              if (item.subItems) {
                const isSubOpen = openSubMenus[item.label];
                return (
                  <div key={index} className="flex flex-col">
                    <button
                      onClick={() => toggleSubMenu(item.label)}
                      className="flex items-center justify-between px-4 py-3 rounded-lg text-white hover:bg-slate-700 transition-colors w-full text-left"
                    >
                      <div className="flex items-center gap-3">
                        {item.icon}
                        {item.label}
                      </div>
                      <ChevronDown size={16} className={`transition-transform duration-200 ${isSubOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {isSubOpen && (
                      <div className="pl-11 pr-2 space-y-1 mt-1 mb-2">
                        {item.subItems.map((subItem, subIndex) => (
                          <NavLink
                            key={subIndex}
                            to={subItem.to}
                            onClick={() => setIsOpen(false)}
                            className={({ isActive }) =>
                              `block py-2 px-3 rounded-md text-sm transition-colors ${isActive
                                ? 'text-blue-400 font-medium bg-blue-900/30'
                                : 'text-gray-400 hover:text-white hover:bg-slate-700/50'
                              }`
                            }
                          >
                            {subItem.label}
                          </NavLink>
                        ))}
                      </div>
                    )}
                  </div>
                );
              }

              return (
                <NavLink
                  key={index}
                  to={item.to}
                  onClick={() => setIsOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-lg text-white transition-colors ${isActive ? 'bg-blue-600' : 'hover:bg-slate-700'
                    }`
                  }
                >
                  {item.icon}
                  {item.label}
                </NavLink>
              );
            })}

            {/* Divisor */}
            <div className="h-px bg-slate-700 my-2"></div>

            {/* Botão de Tema */}
            <button
              onClick={handleToggleTheme}
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-white hover:bg-slate-700 transition-colors w-full text-left"
            >
              {theme === 'dark' ? (
                <>
                  <Sun size={18} className="text-yellow-400" />
                  Tema Claro
                </>
              ) : (
                <>
                  <Moon size={18} className="text-slate-400" />
                  Tema Escuro
                </>
              )}
            </button>

            {/* Botão de Logout */}
            {user && (
              <button
                onClick={handleLogout}
                disabled={loggingOut}
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-red-400 hover:bg-red-900/30 transition-colors w-full text-left disabled:opacity-50"
              >
                <LogOut size={18} />
                {loggingOut ? 'Saindo...' : 'Sair'}
              </button>
            )}
          </nav>
        </div>
      )}
    </div>
  );
}