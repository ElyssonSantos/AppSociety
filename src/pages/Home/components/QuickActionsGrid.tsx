import React from 'react';
import { useNavigate } from 'react-router-dom';
import { QuickActionItem } from '../../../types';
import { useApp } from '../../../context/AppContext';

interface QuickActionsGridProps {
  actions: QuickActionItem[];
}

export const QuickActionsGrid: React.FC<QuickActionsGridProps> = ({ actions }) => {
  const navigate = useNavigate();
  const { openCreationModal } = useApp();

  return (
    <section className="flex flex-col space-y-space-xs">
      {/* Section Header */}
      <div className="flex items-center justify-between px-1">
        <h2 className="font-headline-md text-headline-md text-on-surface font-bold tracking-tight">
          Ações de Gestão
        </h2>
        <span className="font-label-badge text-label-badge text-on-surface-variant uppercase tracking-wider">
          Acesso Rápido
        </span>
      </div>

      {/* Primary Hero Action: Nova Partida */}
      <div
        onClick={openCreationModal}
        className="relative overflow-hidden rounded-xl bg-gradient-to-br from-primary via-primary to-[#a3151f] p-card-pad-md text-white shadow-xl active:scale-[0.99] transition-all cursor-pointer"
      >
        <div className="flex items-center justify-between">
          <div className="flex flex-col space-y-1 max-w-[75%]">
            <span className="font-label-badge text-label-badge uppercase tracking-widest text-white/90">
              Partidas
            </span>
            <h3 className="font-headline-lg text-headline-lg font-extrabold leading-tight text-white">
              + Criar Nova Partida
            </h3>
            <p className="font-body-sm text-body-sm text-white/95">
              Defina equipes, escalações, árbitros, local e regras da súmula digital.
            </p>
          </div>
          <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center shadow-lg text-white">
            <span className="material-symbols-outlined text-[32px]">add_circle</span>
          </div>
        </div>
        <div className="mt-3 inline-flex items-center gap-1 font-label-tactical text-label-tactical text-white bg-white/20 px-3 py-1 rounded-full backdrop-blur">
          <span>Iniciar configuração rápida</span>
          <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
        </div>
      </div>

      {/* 2x2 Management Grid */}
      <div className="grid grid-cols-2 gap-space-xs pt-1">
        {actions.map((action) => (
          <div
            key={action.id}
            onClick={() => navigate(action.path)}
            className="flex flex-col justify-between p-card-pad-sm rounded-xl bg-white border border-outline-variant shadow-sm active:bg-surface-container-high transition-colors cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-3">
              <div
                className={`w-10 h-10 rounded-lg bg-[#fff0f0] flex items-center justify-center ${action.iconColorClass}`}
              >
                <span className="material-symbols-outlined text-[22px]">{action.icon}</span>
              </div>
              <span
                className={`px-2 py-0.5 rounded-full font-label-badge text-label-badge font-bold ${action.badgeColorClass}`}
              >
                {action.badge}
              </span>
            </div>
            <div>
              <h4 className="font-headline-md text-headline-md text-on-surface font-bold leading-tight group-hover:text-primary transition-colors">
                {action.title}
              </h4>
              <p className="font-body-sm text-body-sm text-on-surface-variant mt-1 line-clamp-2">
                {action.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
