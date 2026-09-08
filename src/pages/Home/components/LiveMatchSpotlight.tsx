import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LiveMatch } from '../../../types';

interface LiveMatchSpotlightProps {
  match: LiveMatch;
}

export const LiveMatchSpotlight: React.FC<LiveMatchSpotlightProps> = ({ match }) => {
  const navigate = useNavigate();

  return (
    <section className="relative overflow-hidden rounded-xl bg-surface-container p-card-pad-md shadow-xl">
      <div className="absolute -right-12 -top-12 w-40 h-40 rounded-full bg-primary-container/10 blur-3xl pointer-events-none"></div>

      {/* Header bar: Status + Clock */}
      <div className="flex items-center justify-between mb-space-sm">
        <div className="inline-flex items-center gap-1.5 bg-primary-container text-on-primary-container px-2.5 py-0.5 rounded-full shadow-md">
          <span className="material-symbols-outlined text-[14px]">sensors</span>
          <span className="font-label-badge text-label-badge tracking-wider uppercase">
            {match.statusTag}
          </span>
        </div>
        <div className="flex items-center gap-1 text-tertiary">
          <span className="material-symbols-outlined text-[16px] animate-spin">timer</span>
          <span className="font-label-tactical text-label-tactical tracking-tight font-bold">
            {match.clock}
          </span>
        </div>
      </div>

      {/* Match Visualizer Strip */}
      <div className="grid grid-cols-7 items-center gap-2 py-2">
        {/* Team Home */}
        <div className="col-span-3 flex flex-col items-center text-center space-y-1">
          <div className="w-12 h-12 rounded-xl bg-surface-container-highest flex items-center justify-center shadow-md">
            <span className="material-symbols-outlined text-primary-container text-[26px]">
              {match.homeTeam.icon}
            </span>
          </div>
          <span className="font-headline-md text-headline-md text-on-surface leading-tight font-bold truncate w-full">
            {match.homeTeam.name}
          </span>
          <span className="font-label-badge text-label-badge text-secondary">
            {match.homeTeam.role}
          </span>
        </div>

        {/* Score Box */}
        <div className="col-span-1 flex flex-col items-center justify-center">
          <div className="flex items-center gap-1">
            <span className="font-display-score text-display-score text-on-surface font-extrabold">
              {match.homeTeam.score}
            </span>
            <span className="font-stat-metric text-stat-metric text-on-surface-variant font-light">
              –
            </span>
            <span className="font-display-score text-display-score text-on-surface-variant font-extrabold">
              {match.awayTeam.score}
            </span>
          </div>
          <span className="font-label-badge text-[10px] text-tertiary font-semibold uppercase tracking-wider">
            {match.venue}
          </span>
        </div>

        {/* Team Away */}
        <div className="col-span-3 flex flex-col items-center text-center space-y-1">
          <div className="w-12 h-12 rounded-xl bg-surface-container-highest flex items-center justify-center shadow-md">
            <span className="material-symbols-outlined text-secondary text-[26px]">
              {match.awayTeam.icon}
            </span>
          </div>
          <span className="font-headline-md text-headline-md text-on-surface leading-tight font-bold truncate w-full">
            {match.awayTeam.name}
          </span>
          <span className="font-label-badge text-label-badge text-on-surface-variant">
            {match.awayTeam.role}
          </span>
        </div>
      </div>

      {/* Live Telemetry / Match Events Pill */}
      {match.lastEvent && (
        <div className="my-space-sm p-2 rounded-lg bg-surface-container-low flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <span className="w-2 h-2 rounded-full bg-secondary"></span>
            <span className="font-body-sm text-body-sm text-on-surface-variant truncate">
              <strong className="text-on-surface">Gol!</strong> {match.lastEvent.minute} {match.lastEvent.player} (Assistência {match.lastEvent.assist})
            </span>
          </div>
          {match.lastEvent.xG && (
            <span className="font-label-badge text-label-badge text-secondary font-bold shrink-0 ml-1">
              xG {match.lastEvent.xG}
            </span>
          )}
        </div>
      )}

      {/* Quick Match CTA Buttons */}
      <div className="grid grid-cols-2 gap-space-xs mt-space-sm">
        <button
          onClick={() => navigate('/partidas')}
          className="w-full h-11 rounded-lg bg-primary-container text-on-primary-container font-headline-md text-body-md font-bold flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all"
        >
          <span className="material-symbols-outlined text-[18px]">sports_score</span>
          <span>Placar &amp; Lances</span>
        </button>
        <button
          onClick={() => navigate('/estatisticas')}
          className="w-full h-11 rounded-lg bg-surface-container-high text-on-surface font-headline-md text-body-md font-medium flex items-center justify-center gap-1.5 active:scale-95 transition-all"
        >
          <span className="material-symbols-outlined text-secondary text-[18px]">insights</span>
          <span>Estatísticas</span>
        </button>
      </div>
    </section>
  );
};
