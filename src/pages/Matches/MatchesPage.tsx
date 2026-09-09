import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MatchCreationModal } from '../../components/modals/MatchCreationModal';
import { useApp } from '../../context/AppContext';
import { LiveMatchFull } from '../../types';

const calculateRemainingSeconds = (match: LiveMatchFull, nowMs: number): number => {
  const totalSecs = (match.durationMinutes || 15) * 60;
  let elapsed = match.elapsedSeconds || 0;
  if (match.isTimerRunning && match.timerStartedAt) {
    const currentStintSecs = Math.floor((nowMs - match.timerStartedAt) / 1000);
    elapsed += currentStintSecs;
  }
  return Math.max(0, totalSecs - elapsed);
};

const formatTime = (secs: number) => {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

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
    startUpcomingMatch,
  } = useApp();

  const [nowMs, setNowMs] = useState<number>(Date.now());
  const DEFAULT_FALLBACK = 'https://i.imgur.com/2dRX6Mh.png';

  useEffect(() => {
    const interval = setInterval(() => {
      setNowMs(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

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

  const handleStartMatch = async (e: React.MouseEvent, matchId: string) => {
    e.stopPropagation();
    const newId = await startUpcomingMatch(matchId);
    if (newId) {
      navigate(`/ao-vivo/${newId}`);
    }
  };

  const homeShield = getTeamShield(liveMatch.homeTeam.name);
  const awayShield = getTeamShield(liveMatch.awayTeam.name);

  const liveMatchBgImage = '/images/field_green.jpg';
  const remainingSecs = calculateRemainingSeconds(liveMatch, nowMs);

  return (
    <div className="flex flex-col w-full min-h-screen bg-slate-50 p-4 pb-20 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[11px] text-slate-700 uppercase font-extrabold tracking-wider block">
            Partidas &amp; Competições
          </span>
          <h1 className="text-[20px] font-extrabold text-slate-900 tracking-tight">
            Jogos e Placar ao Vivo
          </h1>
        </div>
        <button
          onClick={openCreationModal}
          className="px-4 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs flex items-center gap-1.5 shadow-md hover:bg-black active:scale-95 transition-all"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          <span>Nova Partida</span>
        </button>
      </div>

      {/* Live Match Active Banner */}
      <div
        onClick={() => navigate('/ao-vivo/' + liveMatch.id)}
        className="relative overflow-hidden rounded-2xl p-5 shadow-xl cursor-pointer active:scale-[0.99] transition-transform text-white border border-slate-700 mx-0"
      >
        <img
          src={liveMatchBgImage}
          alt="Campo Iluminado"
          className="absolute inset-0 w-full h-full object-cover z-0"
        />
        <div className="absolute inset-0 bg-black/60 z-0" />

        <div className="relative z-10 text-white space-y-4">
          <div className="flex items-center justify-between border-b border-white/20 pb-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[12px] font-extrabold text-white uppercase tracking-widest">
                {liveMatch.status === 'live' ? 'Em Andamento' : 'Partida Encerrada'}
              </span>
            </div>
            <span className="text-[11px] font-bold text-white/90 uppercase tracking-wide bg-white/10 px-2.5 py-1 rounded-full border border-white/20">
              {liveMatch.competition}
            </span>
          </div>

          {/* Teams + Score */}
          <div className="flex items-center justify-between gap-3 my-2">
            {/* Home Team */}
            <div className="flex-1 flex flex-col items-center gap-1.5 text-center">
              <div className="w-14 h-14 rounded-full bg-white/20 p-0.5 shadow flex items-center justify-center border-2 border-white/30 overflow-hidden">
                <img
                  src={homeShield}
                  alt={liveMatch.homeTeam.name}
                  className="w-full h-full object-cover rounded-full"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = DEFAULT_FALLBACK;
                  }}
                />
              </div>
              <span className="text-[13px] font-bold text-white leading-tight truncate w-full">
                {liveMatch.homeTeam.name || 'Sem jogo ao vivo'}
              </span>
              <span className="text-3xl font-black text-white leading-none">{liveMatch.homeTeam.score}</span>
            </div>

            {/* Versu / Clock Central */}
            <div className="flex flex-col items-center gap-1">
              <span className="text-2xl font-black text-white tracking-widest">VS</span>
              <span className="text-[11px] font-bold text-amber-300 bg-black/40 px-2.5 py-0.5 rounded-full border border-white/10">
                {liveMatch.status === 'finished' ? '00:00' : formatTime(remainingSecs)}
              </span>
            </div>

            {/* Away Team */}
            <div className="flex-1 flex flex-col items-center gap-1.5 text-center">
              <div className="w-14 h-14 rounded-full bg-white/20 p-0.5 shadow flex items-center justify-center border-2 border-white/30 overflow-hidden">
                <img
                  src={awayShield}
                  alt={liveMatch.awayTeam.name}
                  className="w-full h-full object-cover rounded-full"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = DEFAULT_FALLBACK;
                  }}
                />
              </div>
              <span className="text-[13px] font-bold text-white leading-tight truncate w-full">
                {liveMatch.awayTeam.name || 'Aguardando'}
              </span>
              <span className="text-3xl font-black text-white leading-none">{liveMatch.awayTeam.score}</span>
            </div>
          </div>

          {/* Footer Meta */}
          <div className="flex items-center justify-between pt-3 border-t border-white/20 text-xs text-white/90 font-medium">
            <span>{liveMatch.venue}</span>
            <div className="flex items-center gap-1 font-bold text-white">
              <span>Ver detalhes</span>
              <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            </div>
          </div>
        </div>
      </div>

      {/* Próximos Confrontos - Drag & Drop */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <h2 className="text-[15px] font-bold text-slate-900">
            Próximos Confrontos (Reordene arrastando)
          </h2>
          <span className="text-xs text-slate-500 font-medium">{upcomingMatches.length} jogos</span>
        </div>

        {upcomingMatches.length > 0 ? (
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
                    ${dragOverIndex === index ? 'border-slate-900 bg-slate-100/50 scale-[1.01]' : 'border-slate-200 hover:border-slate-300'}
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
                        <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-900 text-[9px] font-bold uppercase border border-slate-300">
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
                            (e.target as HTMLImageElement).src = DEFAULT_FALLBACK;
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
                            (e.target as HTMLImageElement).src = DEFAULT_FALLBACK;
                          }}
                        />
                        <span className="text-xs font-bold text-slate-900">{m.awayTeam}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right flex items-center gap-2">
                    <div>
                      <span className="text-xs text-slate-600 font-medium block">{m.dateLabel}</span>
                      <span className="text-xs font-bold text-slate-900">{m.time}</span>
                    </div>
                    <button
                      onClick={(e) => handleStartMatch(e, m.id)}
                      title="Iniciar este jogo agora"
                      className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-900 transition-colors"
                    >
                      <span className="material-symbols-outlined text-[18px]">play_arrow</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-8 rounded-2xl bg-white border border-slate-200 text-center flex flex-col items-center justify-center space-y-2 shadow-sm">
            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
              <span className="material-symbols-outlined text-[20px]">event_note</span>
            </div>
            <p className="text-xs font-bold text-slate-800">Nenhum confronto na fila</p>
            <p className="text-[11px] text-slate-500 max-w-xs">
              Clique no botão "+ Nova Partida" para agendar jogos nos próximos confrontos.
            </p>
          </div>
        )}
      </div>

      {/* Match Creation Modal */}
      <MatchCreationModal isOpen={isCreationModalOpen} onClose={closeCreationModal} />
    </div>
  );
};

export default MatchesPage;
