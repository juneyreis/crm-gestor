// src/components/Sidebar.jsx - ATUALIZADO COM DROPDOWN
import { useState } from 'react';
import { Home, Calendar, FileText, Settings, BarChart3, ChevronLeft, ChevronRight, Lightbulb, Database, ChevronDown, Shield } from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';
import useSidebar from '../hooks/useSidebar';
import useAuth from '../hooks/useAuth';

export default function Sidebar() {
  const { user } = useAuth();
  const { isOpen, toggleSidebar } = useSidebar();
  const [openMenus, setOpenMenus] = useState({});
  const location = useLocation();

  const toggleMenu = (label) => {
    if (!isOpen) {
      // Se sidebar estiver fechada e tentar abrir menu, expande sidebar primeiro
      toggleSidebar();
      setOpenMenus(prev => ({ ...prev, [label]: true }));
    } else {
      setOpenMenus(prev => ({ ...prev, [label]: !prev[label] }));
    }
  };

  const menuItems = [
    { icon: <Home size={20} />, label: "Dashboard", to: "/dashboard" },
    {
      icon: <Database size={20} />,
      label: "Tabelas",
      to: "#",
      subItems: [
        { label: "Segmentos", to: "/tabelas/segmentos" },
        { label: "Concorrentes", to: "/tabelas/concorrentes" },
        { label: "Vendedores", to: "/tabelas/vendedores" },
        { label: "Prospects", to: "/prospects" },
        { label: "Visitas", to: "/visitas" },
        { label: "Clientes", to: "/clientes" },
        { label: "Comissões", to: "/tabelas/comissoes" },
      ]
    },
    {
      icon: <FileText size={20} />,
      label: "Relatórios",
      to: "#",
      subItems: [
        { label: "Segmentos", to: "/relatorios/segmentos" },
        { label: "Concorrentes", to: "/relatorios/concorrentes" },
        { label: "Vendedores", to: "/relatorios/vendedores" },
        { label: "Prospects", to: "/relatorios/prospects" },
        { label: "Visitas", to: "/relatorios/visitas" },
        { label: "Clientes", to: "/relatorios/clientes" },
        { label: "Comissões", to: "/relatorios/comissoes" },
      ]
    },
    { icon: <BarChart3 size={20} />, label: "Estatísticas", to: "/estatisticas" },
    { icon: <Calendar size={20} />, label: "Agenda", to: "/agenda" },
  ];

  if (user?.role === 'admin') {
    menuItems.push({
      icon: <Shield size={20} className="text-blue-600 dark:text-blue-400" />,
      label: "Administração",
      to: "/admin/usuarios"
    });
  }

  // Verifica se algum subItem está ativo para manter o menu aberto
  const isMenuActive = (item) => {
    if (item.subItems) {
      return item.subItems.some(sub => location.pathname.startsWith(sub.to));
    }
    return location.pathname.startsWith(item.to);
  };

  return (
    <aside className={`hidden md:flex flex-col bg-white dark:bg-slate-800 border-r border-gray-200 dark:border-slate-700 min-h-[calc(100vh-64px)] transition-all duration-300 ${isOpen ? 'w-64' : 'w-20'}`}>
      {/* Botão Toggle */}
      <button
        onClick={toggleSidebar}
        className="flex items-center justify-center p-4 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
        title={isOpen ? 'Recolher sidebar' : 'Expandir sidebar'}
      >
        {isOpen ? (
          <ChevronLeft className="h-5 w-5 text-gray-600 dark:text-gray-400" />
        ) : (
          <ChevronRight className="h-5 w-5 text-gray-600 dark:text-gray-400" />
        )}
      </button>

      {/* Menu Items */}
      <nav className="flex-1 space-y-1 px-2 overflow-y-auto">
        {menuItems.map((item, index) => {
          if (item.subItems) {
            const isActive = isMenuActive(item);
            const isMenuOpen = !!openMenus[item.label];

            return (
              <div key={index}>
                <button
                  onClick={() => toggleMenu(item.label)}
                  className={`flex items-center w-full px-4 py-3 rounded-lg text-left transition-all justify-between ${isActive
                    ? "bg-blue-50 dark:bg-blue-900/10 text-blue-700 dark:text-blue-400 font-medium"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700"
                    } ${!isOpen ? 'justify-center' : ''}`}
                  title={!isOpen ? item.label : ''}
                >
                  <div className={`flex items-center gap-3 ${!isOpen ? 'justify-center w-full' : ''}`}>
                    <div className="flex-shrink-0">{item.icon}</div>
                    {isOpen && <span className="flex-1">{item.label}</span>}
                  </div>
                  {isOpen && (
                    <ChevronDown
                      size={16}
                      className={`transition-transform duration-200 ${isMenuOpen ? 'rotate-180' : ''}`}
                    />
                  )}
                </button>

                {/* Submenu */}
                {isOpen && isMenuOpen && (
                  <div className="pl-12 pr-2 space-y-1 mt-1 bg-gray-50/50 dark:bg-slate-800/50 rounded-b-lg pb-2">
                    {item.subItems.map((subItem, subIndex) => (
                      <NavLink
                        key={subIndex}
                        to={subItem.to}
                        className={({ isActive }) =>
                          `block py-2 px-3 rounded-md text-sm transition-colors ${isActive
                            ? "text-blue-600 dark:text-blue-400 font-medium bg-blue-100/50 dark:bg-blue-900/20"
                            : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-700/50"
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
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all ${isActive
                  ? "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 font-medium border border-blue-200 dark:border-blue-800"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 hover:text-gray-900 dark:hover:text-gray-100"
                } ${isOpen ? 'w-full' : 'justify-center'}`
              }
              title={!isOpen ? item.label : ''}
            >
              <div className="flex-shrink-0">{item.icon}</div>
              {isOpen && <span className="flex-1">{item.label}</span>}
            </NavLink>
          );
        })}
      </nav>

      {/* Dica Rápida ou Ícone */}
      {isOpen ? (
        <div className="m-2 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-100 dark:border-blue-800">
          <h3 className="font-semibold text-sm text-gray-800 dark:text-gray-200 mb-2">Dica rápida</h3>
          <p className="text-xs text-gray-600 dark:text-gray-400">
            Use o menu "Tabelas" para cadastrar Concorrentes e Prospects.
          </p>
        </div>
      ) : (
        <div className="flex justify-center p-4">
          <Lightbulb className="h-5 w-5 text-gray-400 dark:text-gray-500" title="Dica: Use o menu Tabelas para cadastros" />
        </div>
      )}
    </aside>
  );
}