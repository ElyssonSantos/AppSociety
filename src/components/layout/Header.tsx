import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { SoccerBallLogo } from '../common/SoccerBallLogo';

interface HeaderProps {
  onToggleSidebar?: () => void;
}

export const Header: React.FC<HeaderProps> = () => {
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <header className="fixed top-0 w-full z-50 pt-safe bg-white/95 backdrop-blur-xl border-b border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
      <div className="max-w-lg mx-auto md:max-w-xl h-16 px-gutter-mobile flex items-center justify-between">
        {/* Brand */}
        <Link to="/inicio" className="flex items-center gap-space-sm focus:outline-none">
          <SoccerBallLogo size={36} />
          <div className="flex flex-col">
            <span className="font-headline-md text-headline-md text-on-surface tracking-tight leading-none font-extrabold">
              MopaFut
            </span>
            <span className="font-label-badge text-[10px] text-on-surface-variant uppercase tracking-widest leading-tight mt-0.5 font-semibold">
              Society dos quebrados
            </span>
          </div>
        </Link>

        {/* Right Actions */}
        <div className="flex items-center gap-space-xs relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            aria-label="Notificações"
            className="w-11 h-11 relative flex items-center justify-center rounded-full bg-surface-container-high text-on-surface-variant hover:text-primary transition-colors active:scale-95"
          >
            <span className="material-symbols-outlined text-[24px]">notifications</span>
            <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-primary ring-2 ring-white animate-pulse"></span>
          </button>

          {/* Notification dropdown modal if toggled */}
          {showNotifications && (
            <div className="absolute right-0 top-12 mt-2 w-72 rounded-xl bg-white border border-outline-variant p-3 shadow-2xl z-50 animate-in fade-in duration-200">
              <div className="flex items-center justify-between pb-2 border-b border-outline-variant">
                <span className="font-headline-md text-body-md font-bold text-on-surface">Notificações</span>
                <span className="font-label-badge text-[10px] text-secondary font-bold">1 Nova</span>
              </div>
              <div className="py-2 space-y-2">
                <div className="p-2 rounded-lg bg-surface-container-high flex items-start gap-2">
                  <span className="w-2 h-2 mt-1.5 rounded-full bg-secondary shrink-0"></span>
                  <div className="text-left text-body-sm">
                    <p className="font-semibold text-on-surface">Gol na partida!</p>
                    <p className="text-on-surface-variant text-[11px]">Novo lance registrado no placar ao vivo.</p>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setShowNotifications(false)}
                className="w-full mt-1 py-1 rounded-lg bg-surface-container-high text-body-sm text-on-surface font-medium hover:bg-outline-variant transition-colors"
              >
                Fechar
              </button>
            </div>
          )}

          <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center cursor-pointer">
            <span className="material-symbols-outlined text-[18px]">person</span>
          </div>
        </div>
      </div>
    </header>
  );
};
