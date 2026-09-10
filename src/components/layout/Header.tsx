import React from 'react';
import { Link } from 'react-router-dom';
import { SoccerBallLogo } from '../common/SoccerBallLogo';

interface HeaderProps {
  onToggleSidebar?: () => void;
}

export const Header: React.FC<HeaderProps> = () => {
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
      </div>
    </header>
  );
};
