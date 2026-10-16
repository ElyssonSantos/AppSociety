import React from 'react';
import { NavLink } from 'react-router-dom';
import { SoccerBallLogo } from '../common/SoccerBallLogo';
import { useAccessCode } from '../../context/AccessCodeContext';

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
  const { isUnlocked, lock, openModal } = useAccessCode();

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

        {/* Bottom User Card & Access Control */}
        <div className="space-y-2">
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
              <span className={`material-symbols-outlined text-[18px] ${isUnlocked ? 'text-emerald-600' : 'text-slate-400'}`}>
                {isUnlocked ? 'lock_open' : 'lock'}
              </span>
              <div className="min-w-0">
                <p className="text-[11px] font-bold text-slate-800 leading-tight truncate">
                  {isUnlocked ? 'Edição Liberada' : 'Modo Público'}
                </p>
                <p className="text-[9px] text-slate-500 leading-tight">
                  {isUnlocked ? 'Sessão em memória' : 'Ações protegidas'}
                </p>
              </div>
            </div>
            {isUnlocked ? (
              <button
                onClick={lock}
                title="Bloquear edições agora"
                className="px-2 py-1 text-[10px] font-bold bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg transition-colors cursor-pointer"
              >
                Bloquear
              </button>
            ) : (
              <button
                onClick={() => openModal()}
                title="Digitar código de acesso"
                className="px-2 py-1 text-[10px] font-bold bg-[#e63946] hover:bg-rose-700 text-white rounded-lg transition-colors cursor-pointer"
              >
                Liberar
              </button>
            )}
          </div>

          <div className="p-3 rounded-xl bg-surface-container-high border border-outline-variant flex items-center gap-3">
            <SoccerBallLogo size={34} />
            <div className="min-w-0 flex-1">
              <p className="font-headline-md text-body-sm font-bold text-on-surface truncate">MopaFut</p>
              <span className="font-label-badge text-[10px] text-secondary flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Society dos quebrados
              </span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
