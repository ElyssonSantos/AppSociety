import React from 'react';
import { TabelaClassificacao } from '../../components/TabelaClassificacao/TabelaClassificacao';

export const StatsPage: React.FC = () => {
  return (
    <div className="flex flex-col w-full min-h-screen bg-slate-50 p-4 pb-20 space-y-4">
      <div>
        <span className="text-[11px] text-[#e63946] uppercase font-bold tracking-wider block">
          Futebol Society 7v7
        </span>
        <h1 className="text-[20px] font-extrabold text-slate-900 tracking-tight">
          Tabela de Classificação das Equipes
        </h1>
      </div>

      <TabelaClassificacao />
    </div>
  );
};

export default StatsPage;
