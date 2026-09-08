import React from 'react';

export const WelcomeHeader: React.FC = () => {
  return (
    <section className="flex flex-col space-y-space-xs pt-space-xs">
      <div className="flex items-center justify-between">
        <div className="inline-flex items-center gap-space-xs bg-white border border-outline-variant px-3 py-1 rounded-full">
          <span className="w-2 h-2 rounded-full bg-secondary animate-ping"></span>
          <span className="font-label-badge text-label-badge text-secondary uppercase tracking-wider">
            Futebol Society 2026
          </span>
        </div>
        <div className="inline-flex items-center gap-1.5 bg-[#fff0f0] px-2.5 py-1 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
          <span className="font-label-badge text-label-badge text-primary font-bold">AO VIVO</span>
        </div>
      </div>
      <div className="flex items-end justify-between pt-1">
        <div>
          <p className="font-body-sm text-body-sm text-on-surface-variant font-medium">Domingo, 18 de Maio</p>
          <h1 className="font-headline-lg text-headline-lg text-on-surface font-bold tracking-tight">
            Central de Comandos Rapidos
          </h1>
        </div>
        <div className="flex items-center gap-1.5 bg-white border border-outline-variant px-2.5 py-1.5 rounded-xl shadow-sm">
          <span className="material-symbols-outlined text-secondary text-[18px]">verified_user</span>
          <span className="font-label-badge text-label-badge text-on-surface">SOCIETY SECURITY</span>
        </div>
      </div>
    </section>
  );
};
