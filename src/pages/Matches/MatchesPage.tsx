import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MatchCreationModal } from '../../components/modals/MatchCreationModal';
import { useApp } from '../../context/AppContext';

export const MatchesPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    liveMatch,
    upcomingMatches,
    setUpcomingMatchesList,
    isCreationModalOpen,
    openCreationModal,
    closeCreationModal,
    getTeamShield,
  } = useApp();

  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverIndex(index);
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === dropIndex) return;

    const newMatches = [...upcomingMatches];
    const [draggedItem] = newMatches.splice(draggedIndex, 1);
    newMatches.splice(dropIndex, 0, draggedItem);
    setUpcomingMatchesList(newMatches);
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const homeShield = getTeamShield(liveMatch.homeTeam.name);
  const awayShield = getTeamShield(liveMatch.awayTeam.name);

  return (
    <div className="flex flex-col w-full min-h-screen bg-slate-50 p-4 pb-20 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[11px] text-[#e63946] uppercase font-bold tracking-wider block">
            Partidas &amp; Competições
          </span>
          <h1 className="text-[20px] font-extrabold text-slate-900 tracking-tight">
            Jogos e Placar ao Vivo
          </h1>
        </div>
        <button
          onClick={openCreationModal}
          className="px-4 py-2.5 rounded-xl bg-[#e63946] text-white font-bold text-xs flex items-center gap-1.5 shadow-md hover:bg-rose-700 active:scale-95 transition-all"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          <span>Nova Partida</span>
        </button>
      </div>

      {/* Live Match Active Banner — Estética 'Próxima Partida' Padronizada com Escudos Reais */}
      <div
        onClick={() => navigate('/ao-vivo/' + liveMatch.id)}
        className="relative overflow-hidden rounded-2xl p-5 shadow-md cursor-pointer active:scale-[0.99] transition-transform text-white border border-slate-700"
        style={{ background: 'linear-gradient(135deg, #e63946 0%, #c1121f 100%)' }}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
            <span className="text-[11px] font-bold text-white/90 uppercase tracking-widest">
              {liveMatch.status === 'live' ? 'Partida Ao Vivo' : 'Partida Encerrada'}
            </span>
          </div>
          <span className="text-[11px] font-semibold text-white/80 uppercase tracking-wide">
            {liveMatch.competition}
          </span>
        </div>

        {/* Teams + Score */}
        <div className="flex items-center justify-between gap-3 my-2">
          {/* Home Team */}
          <div className="flex-1 flex flex-col items-center gap-1.5 text-center">
            <div className="w-12 h-12 rounded-full bg-white/20 p-0.5 shadow flex items-center justify-center border border-white/30">
              <img
                src={homeShield}
                alt={liveMatch.homeTeam.name}
                className="w-full h-full object-cover rounded-full"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=120&q=80';
                }}
              />
            </div>
            <span className="text-[13px] font-bold text-white leading-tight truncate w-full">{liveMatch.homeTeam.name}</span>
            <span className="text-2xl font-extrabold text-white leading-none">{liveMatch.homeTeam.score}</span>
          </div>

          {/* Versu / Clock Central */}
          <div className="flex flex-col items-center gap-0.5">
            <span className="text-2xl font-extrabold text-white tracking-tight leading-none">VS</span>
            <span className="text-[11px] font-bold text-amber-300 mt-1">{liveMatch.clock}</span>
          </div>

          {/* Away Team */}
          <div className="flex-1 flex flex-col items-center gap-1.5 text-center">
            <div className="w-12 h-12 rounded-full bg-white/20 p-0.5 shadow flex items-center justify-center border border-white/30">
              <img
                src={awayShield}
                alt={liveMatch.awayTeam.name}
                className="w-full h-full object-cover rounded-full"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&w=120&q=80';
                }}
              />
            </div>
            <span className="text-[13px] font-bold text-white leading-tight truncate w-full">{liveMatch.awayTeam.name}</span>
            <span className="text-2xl font-extrabold text-white leading-none">{liveMatch.awayTeam.score}</span>
          </div>
        </div>

        {/* Footer Meta */}
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/20 text-xs text-white/80">
          <span>{liveMatch.venue}</span>
          <div className="flex items-center gap-1 font-bold text-white">
            <span>Ver detalhes</span>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
          </div>
        </div>

        <div className="absolute -right-10 -bottom-10 w-32 h-32 rounded-full bg-white/10 pointer-events-none" />
      </div>

      {/* Próximos Confrontos - Sortable Drag & Drop com Persistência */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <h2 className="text-[15px] font-bold text-slate-900">
            Próximos Confrontos (Reordene arrastando)
          </h2>
          <span className="text-xs text-slate-500 font-medium">{upcomingMatches.length} jogos</span>
        </div>

        <div className="space-y-2.5">
          {upcomingMatches.map((m, index) => {
            const hShield = getTeamShield(m.homeTeam);
            const aShield = getTeamShield(m.awayTeam);

            return (
              <div
                key={m.id}
                draggable
                onDragStart={(e) => handleDragStart(e, index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDrop={(e) => handleDrop(e, index)}
                onDragEnd={handleDragEnd}
                className={`
                  p-4 rounded-2xl bg-white border flex items-center justify-between transition-all shadow-sm
                  ${dragOverIndex === index ? 'border-[#e63946] bg-rose-50/50 scale-[1.01]' : 'border-slate-200 hover:border-slate-300'}
                  ${draggedIndex === index ? 'opacity-40 scale-[0.98]' : ''}
                  text-left w-full cursor-grab active:cursor-grabbing
                `}
              >
                <div className="flex items-center gap-3">
                  <div className="flex flex-col items-center gap-1">
                    <span className="material-symbols-outlined text-[20px] text-slate-400">
                      drag_indicator
                    </span>
                    {index === 0 && (
                      <span className="px-1.5 py-0.5 rounded bg-rose-50 text-[#e63946] text-[9px] font-bold uppercase border border-rose-100">
                        PRÓXIMO
                      </span>
                    )}
                  </div>

                  {/* Times com Escudos Reais */}
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5">
                      <img
                        src={hShield}
                        alt={m.homeTeam}
                        className="w-7 h-7 rounded-full object-cover border border-slate-200"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=120&q=80';
                        }}
                      />
                      <span className="text-xs font-bold text-slate-900">{m.homeTeam}</span>
                    </div>

                    <span className="text-xs font-bold text-slate-400">vs</span>

                    <div className="flex items-center gap-1.5">
                      <img
                        src={aShield}
                        alt={m.awayTeam}
                        className="w-7 h-7 rounded-full object-cover border border-slate-200"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&w=120&q=80';
                        }}
                      />
                      <span className="text-xs font-bold text-slate-900">{m.awayTeam}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right flex items-center gap-2">
                  <div>
                    <span className="text-xs text-slate-600 font-medium block">{m.dateLabel}</span>
                    <span className="text-xs font-bold text-[#e63946]">{m.time}</span>
                  </div>
                  <span className="material-symbols-outlined text-[18px] text-slate-400">chevron_right</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Match Creation Modal */}
      <MatchCreationModal
        isOpen={isCreationModalOpen}
        onClose={closeCreationModal}
      />
    </div>
  );
};

export default MatchesPage;
