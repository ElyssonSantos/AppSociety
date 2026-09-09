import React from 'react';
import { NavLink } from 'react-router-dom';
import { SoccerBallLogo } from '../common/SoccerBallLogo';

interface SidebarProps {
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

interface SidebarLink {
  path: string;
  label: string;
  icon: string;
  badge?: string;
}

const mainLinks: SidebarLink[] = [
  { path: '/inicio', label: 'Central de Controle', icon: 'dashboard' },
  { path: '/partidas', label: 'Jogos & Placar ao Vivo', icon: 'sports' },
  { path: '/tatico', label: 'Quadro Tático', icon: 'strategy' },
  { path: '/elencos', label: 'Gestão de Elenco', icon: 'groups' },
];

const secondaryLinks: SidebarLink[] = [
  { path: '/estatisticas', label: 'Estatísticas & Scouts', icon: 'insights' },
  { path: '/clubes', label: 'Dados do Clube', icon: 'shield' },
];

export const Sidebar: React.FC<SidebarProps> = ({ isOpenMobile, onCloseMobile }) => {
  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          className="md:hidden fixed inset-0 bg-black/40 backdrop-blur-sm z-50 transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-white border-r border-outline-variant flex flex-col justify-between transition-transform duration-300 md:translate-x-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        } pt-16 md:pt-20 pb-6 px-4`}
      >
        <div className="flex flex-col space-y-6">
          {/* Section: Navegação Principal */}
          <div>
            <span className="px-3 font-label-badge text-[10px] text-on-surface-variant uppercase tracking-widest block mb-2">
              Menu Tático
            </span>
            <div className="space-y-1">
              {mainLinks.map((link) => (
                <NavLink
                  key={link.path}
                  to={link.path}
                  onClick={onCloseMobile}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3 py-2.5 rounded-xl font-body-md text-body-md transition-all ${
                      isActive
                        ? 'bg-slate-900 text-white font-semibold shadow-sm'
                        : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'
                    }`
                  }
                >
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-[20px]">{link.icon}</span>
                    <span>{link.label}</span>
                  </div>
                  {link.badge && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-label-badge font-bold bg-surface-container-high text-on-surface">
                      {link.badge}
                    </span>
                  )}
                </NavLink>
              ))}
            </div>
          </div>

          {/* Section: Gestão & Análise */}
          <div>
            <span className="px-3 font-label-badge text-[10px] text-on-surface-variant uppercase tracking-widest block mb-2">
              Gestão & Relatórios
            </span>
            <div className="space-y-1">
              {secondaryLinks.map((link) => (
                <NavLink
                  key={link.path}
                  to={link.path}
                  onClick={onCloseMobile}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3 py-2.5 rounded-xl font-body-md text-body-md transition-all ${
                      isActive
                        ? 'bg-slate-900 text-white font-semibold shadow-sm'
                        : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'
                    }`
                  }
                >
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-[20px]">{link.icon}</span>
                    <span>{link.label}</span>
                  </div>
                </NavLink>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom User Card / Status */}
        <div className="p-3 rounded-xl bg-surface-container-high border border-outline-variant flex items-center gap-3">
          <SoccerBallLogo size={34} />
          <div className="min-w-0 flex-1">
            <p className="font-headline-md text-body-sm font-bold text-on-surface truncate">MopaFut</p>
            <span className="font-label-badge text-[10px] text-secondary flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Society dos quebrados
            </span>
          </div>
        </div>
      </aside>
    </>
  );
};
