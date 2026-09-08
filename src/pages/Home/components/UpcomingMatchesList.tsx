import React from 'react';
import { UpcomingMatch } from '../../../types';

interface UpcomingMatchesListProps {
  matches: UpcomingMatch[];
}

export const UpcomingMatchesList: React.FC<UpcomingMatchesListProps> = ({ matches }) => {
  return (
    <section className="flex flex-col space-y-space-xs pt-1">
      {/* Section Header */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-1.5">
          <span className="material-symbols-outlined text-tertiary text-[20px]">calendar_month</span>
          <h2 className="font-headline-md text-headline-md text-on-surface font-bold">
            Próximos Confrontos
          </h2>
        </div>
        <span className="font-label-badge text-label-badge text-on-surface-variant uppercase">
          Súmulas Prontas
        </span>
      </div>

      {/* Match Items List */}
      {matches.slice(0, 2).map((match, index) => (
        <div
          key={match.id}
          className="p-card-pad-sm rounded-xl bg-surface-container shadow-md flex items-center justify-between"
        >
          <div className="flex items-center gap-space-sm min-w-0">
            {/* Time / Date Badge */}
            <div className="flex flex-col items-center justify-center px-2 py-1.5 rounded-lg bg-surface-container-high shrink-0 text-center min-w-[64px]">
              <span
                className={`font-label-badge text-[10px] font-bold uppercase ${
                  index === 0 ? 'text-tertiary' : 'text-on-surface-variant'
                }`}
              >
                {match.dateLabel}
              </span>
              <span className="font-stat-metric text-[18px] text-on-surface leading-none mt-0.5 font-bold">
                {match.time}
              </span>
            </div>

            {/* Teams & Venue */}
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1.5 truncate">
                <span className="font-headline-md text-body-md font-bold text-on-surface">
                  {match.homeTeam}
                </span>
                <span className="font-label-badge text-on-surface-variant font-normal">vs</span>
                <span className="font-headline-md text-body-md font-bold text-on-surface">
                  {match.awayTeam}
                </span>
              </div>
              <span className="font-body-sm text-body-sm text-on-surface-variant truncate">
                {match.venue} • {match.competition}
              </span>
            </div>
          </div>

          <button
            aria-label="Mais opções da partida"
            className="shrink-0 p-2 rounded-lg bg-surface-container-high text-on-surface hover:text-primary transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">more_vert</span>
          </button>
        </div>
      ))}
    </section>
  );
};
