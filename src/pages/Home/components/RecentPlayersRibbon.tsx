import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Player } from '../../../types';

interface RecentPlayersRibbonProps {
  players: Player[];
}

export const RecentPlayersRibbon: React.FC<RecentPlayersRibbonProps> = ({ players }) => {
  const navigate = useNavigate();

  return (
    <section className="flex flex-col space-y-space-xs pt-1">
      {/* Section Title */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-1.5">
          <span className="material-symbols-outlined text-secondary text-[20px]">badge</span>
          <h2 className="font-headline-md text-headline-md text-on-surface font-bold">
            Últimos Atletas Registrados
          </h2>
        </div>
        <button
          onClick={() => navigate('/elencos')}
          className="font-label-tactical text-label-tactical text-primary flex items-center gap-0.5 hover:underline focus:outline-none"
        >
          Ver Todos <span className="material-symbols-outlined text-[14px]">chevron_right</span>
        </button>
      </div>

      {/* Horizontal scrollable player cards */}
      <div
        className="flex items-center gap-3 overflow-x-auto pb-3 px-gutter-mobile scroll-smooth snap-x snap-mandatory"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}
      >
        {players.map((player) => (
          <div
            key={player.id}
            onClick={() => navigate(`/jogador/${player.id}`)}
            className="min-w-[160px] p-3.5 rounded-2xl bg-surface-container border border-surface-container-high/70 flex flex-col items-center text-center shrink-0 cursor-pointer active:scale-[0.97] transition-transform snap-start"
          >
            <div className="relative w-14 h-14 mb-2 rounded-full overflow-hidden bg-surface-container-high">
              <img
                className="w-full h-full object-cover"
                src={player.photoUrl}
                alt={`Retrato de ${player.name}`}
              />
              <span className="absolute bottom-0 right-0 bg-primary-container text-on-primary-container font-label-tactical text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold">
                {player.number}
              </span>
            </div>

            <span className="font-headline-md text-body-md font-bold text-on-surface truncate w-full">
              {player.name}
            </span>
            <span className="font-label-badge text-label-badge text-on-surface-variant uppercase mt-0.5">
              {player.position}
            </span>

            <div className="mt-2 w-full py-1 rounded bg-surface-container-low flex items-center justify-around">
              <span className="font-label-badge text-label-badge text-secondary font-bold">
                {player.rating} RAT
              </span>
              <span className="font-label-badge text-label-badge text-on-surface-variant">
                {player.goals ? `${player.goals} Gols` : `${player.assists} Ast`}
              </span>
            </div>
          </div>
        ))}

        {/* Quick Add Player Card */}
        <div
          onClick={() => navigate('/jogador/novo')}
          className="min-w-[140px] p-3 rounded-xl bg-surface-container-high/60 flex flex-col items-center justify-center text-center shrink-0 active:scale-95 transition-all cursor-pointer h-[152px]"
        >
          <div className="w-12 h-12 rounded-full bg-surface-container flex items-center justify-center text-primary-container mb-2 shadow">
            <span className="material-symbols-outlined text-[28px]">person_add</span>
          </div>
          <span className="font-headline-md text-body-md font-bold text-on-surface">+ Novo</span>
          <span className="font-label-badge text-label-badge text-on-surface-variant">
            Cadastrar Atleta
          </span>
        </div>
      </div>
    </section>
  );
};
