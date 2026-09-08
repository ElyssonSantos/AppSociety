import React from 'react';
import { NavLink } from 'react-router-dom';

interface NavItemConfig {
  path: string;
  label: string;
  icon: string;
}

const navItems: NavItemConfig[] = [
  { path: '/inicio',       label: 'Início', icon: 'home'          },
  { path: '/partidas',     label: 'Jogos',  icon: 'sports_soccer' },
  { path: '/elencos',      label: 'Elenco', icon: 'group'         },
  { path: '/estatisticas', label: 'Dados',  icon: 'bar_chart'     },
];

export const BottomNav: React.FC = () => {
  const triggerHaptic = () => {
    if (typeof window !== 'undefined' && window.navigator?.vibrate) {
      window.navigator.vibrate(15);
    }
  };

  return (
    <nav
      aria-label="Navegação móvel principal"
      className="fixed bottom-0 w-full z-50 pb-safe bg-white border-t border-slate-200 shadow-sm"
    >
      <div className="max-w-lg mx-auto md:max-w-xl h-16 flex items-stretch px-2">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={triggerHaptic}
            className="flex-1 flex flex-col items-center justify-center gap-1 min-h-[44px] relative"
          >
            {({ isActive }) => (
              <>
                <div
                  className={`flex items-center justify-center px-4 py-1 rounded-full transition-colors ${
                    isActive ? 'bg-rose-50' : 'bg-transparent'
                  }`}
                >
                  <span
                    className="material-symbols-outlined text-[22px] transition-colors"
                    style={{ color: isActive ? '#e63946' : '#64748b' }}
                  >
                    {item.icon}
                  </span>
                </div>
                <span
                  className="text-[11px] font-medium tracking-wide transition-colors"
                  style={{ color: isActive ? '#e63946' : '#64748b' }}
                >
                  {item.label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
};

export default BottomNav;
