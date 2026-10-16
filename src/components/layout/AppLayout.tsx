import React from 'react';
import { Outlet } from 'react-router-dom';
import { BottomNav } from './BottomNav';
import { AccessCodeModal } from '../modals/AccessCodeModal';
import { useAccessCode } from '../../context/AccessCodeContext';

export const AppLayout: React.FC = () => {
  const { isUnlocked, openModal, lock } = useAccessCode();

  return (
    <div className="min-h-screen bg-white text-[#1a1a2e] flex flex-col antialiased">
      {/* Barra de Status Discreta Superior - Modo de Visualização vs Administrativo */}
      <header
        data-section="Barra de Status do Acesso"
        className="w-full bg-slate-900 border-b border-slate-800 text-white text-[11px] px-3 py-1.5 sticky top-0 z-40 shadow-sm"
      >
        <div className="max-w-lg md:max-w-xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 font-semibold">
            <span
              className={`w-2 h-2 rounded-full ${
                isUnlocked ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
              }`}
            />
            <span className="text-slate-200">
              {isUnlocked ? 'Modo de Edição Ativo' : 'Modo Leitura (Público)'}
            </span>
          </div>

          <button
            onClick={isUnlocked ? lock : () => openModal()}
            className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold transition-all ${
              isUnlocked
                ? 'bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 border border-rose-500/30'
                : 'bg-white/10 text-white hover:bg-white/20 border border-white/20'
            }`}
            title={
              isUnlocked
                ? 'Bloquear alterações manualmente'
                : 'Informar código para liberar ações'
            }
          >
            <span className="material-symbols-outlined text-[13px]">
              {isUnlocked ? 'lock' : 'lock_open'}
            </span>
            <span>{isUnlocked ? 'Bloquear' : 'Desbloquear'}</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex flex-col relative w-full pb-20 min-h-screen">
        <div className="max-w-lg md:max-w-xl mx-auto w-full bg-white">
          <Outlet />
        </div>
      </main>

      {/* Modal Global de Código de Acesso */}
      <AccessCodeModal />

      {/* Fixed Bottom Navigation */}
      <BottomNav />
    </div>
  );
};

export default AppLayout;
