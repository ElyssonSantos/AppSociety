import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { LiveMatchFull, MatchEvent } from '../../types';

const eventTypeIcon: Record<string, string> = {
  goal: 'sports_soccer',
  yellow_card: 'square',
  red_card: 'square',
  sub: 'swap_horiz',
  shot: 'ads_click',
  foul: 'warning',
};

const eventTypeColor: Record<string, string> = {
  goal: 'text-emerald-600',
  yellow_card: 'text-amber-500',
  red_card: 'text-rose-600',
  sub: 'text-blue-600',
  shot: 'text-slate-600',
  foul: 'text-orange-500',
};

type QuickActionType = 'goal' | 'foul' | 'yellow_card' | 'red_card' | 'sub';

const quickActionConfig: Record<QuickActionType, { label: string; icon: string; color: string; bgColor: string }> = {
  goal: { label: 'Gol', icon: 'sports_soccer', color: 'text-emerald-600', bgColor: 'bg-emerald-50 border-emerald-200' },
  foul: { label: 'Falta', icon: 'warning', color: 'text-orange-500', bgColor: 'bg-orange-50 border-orange-200' },
  yellow_card: { label: 'Cartão Amarelo', icon: 'square', color: 'text-amber-500', bgColor: 'bg-amber-50 border-amber-200' },
  red_card: { label: 'Cartão Vermelho', icon: 'square', color: 'text-rose-600', bgColor: 'bg-rose-50 border-rose-200' },
  sub: { label: 'Substituição', icon: 'swap_horiz', color: 'text-blue-600', bgColor: 'bg-blue-50 border-blue-200' },
};

const EventFeedItem: React.FC<{ event: MatchEvent }> = ({ event }) => {
  const isHome = event.team === 'home';
  return (
    <div className={`flex items-start gap-3 py-3 border-b border-slate-100 ${isHome ? 'flex-row' : 'flex-row-reverse'}`}>
      <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${isHome ? 'bg-emerald-50 border border-emerald-100' : 'bg-rose-50 border border-rose-100'}`}>
        <span className={`material-symbols-outlined text-[16px] ${eventTypeColor[event.type] || 'text-slate-700'}`}>
          {eventTypeIcon[event.type] || 'info'}
        </span>
      </div>
      <div className={`flex-1 min-w-0 ${isHome ? 'text-left' : 'text-right'}`}>
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs text-slate-500 font-bold">{event.minute}</span>
          <span className="text-xs font-bold text-slate-900">{event.player}</span>
          {event.assist && (
            <span className="text-slate-500 text-xs">(Assistência: {event.assist})</span>
          )}
        </div>
        <p className="text-xs text-slate-600 mt-0.5 line-clamp-2">{event.description}</p>
      </div>
    </div>
  );
};

// Helper: Real-time calculation of remaining seconds from synced timestamps
const calculateRemainingSeconds = (match: LiveMatchFull, nowMs: number): number => {
  const totalSecs = (match.durationMinutes || 15) * 60;
  let elapsed = match.elapsedSeconds || 0;
  if (match.isTimerRunning && match.timerStartedAt) {
    const currentStintSecs = Math.floor((nowMs - match.timerStartedAt) / 1000);
    elapsed += currentStintSecs;
  }
  return Math.max(0, totalSecs - elapsed);
};

export const LiveMatchDetailsPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    liveMatch,
    players,
    teams,
    addMatchEvent,
    finishLiveMatch,
    toggleLiveTimer,
    addExtraTimeToLiveMatch,
    getTeamShield,
    calculateRemainingSeconds,
    formatMatchClock,
  } = useApp();

  const [nowMs, setNowMs] = useState<number>(Date.now());
  const [selectedTeam, setSelectedTeam] = useState<'home' | 'away'>('home');
  const [activeAction, setActiveAction] = useState<QuickActionType | null>(null);

  const [selectedScorerId, setSelectedScorerId] = useState<string>('');
  const [selectedAssistId, setSelectedAssistId] = useState<string>('');
  const [selectedPlayerInId, setSelectedPlayerInId] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');

  const DEFAULT_FALLBACK = 'https://i.imgur.com/2dRX6Mh.png';
  const homeShield = getTeamShield(liveMatch.homeTeam.name);
  const awayShield = getTeamShield(liveMatch.awayTeam.name);

  const currentTeamName = selectedTeam === 'home' ? liveMatch.homeTeam.name : liveMatch.awayTeam.name;
  const currentTeam = teams.find((t) => t.name === currentTeamName);
  const filteredPlayers = players.filter((p) => p.teamId === currentTeam?.id);

  // 1. Ticker interval to update local display time every 1 second
  useEffect(() => {
    const interval = setInterval(() => {
      setNowMs(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const secondsLeft = calculateRemainingSeconds(liveMatch, nowMs);

  // 2. Auto-finish when timer reaches zero or score condition met
  useEffect(() => {
    if (liveMatch.status !== 'live') return;

    const homeScore = liveMatch.homeTeam.score;
    const awayScore = liveMatch.awayTeam.score;

    if (secondsLeft <= 0 || homeScore >= 2 || awayScore >= 2) {
      finishLiveMatch();
    }
  }, [secondsLeft, liveMatch.homeTeam.score, liveMatch.awayTeam.score, liveMatch.status, finishLiveMatch]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleConfirmAction = async () => {
    if (!activeAction) return;
    if (activeAction === 'sub' && (!selectedScorerId || !selectedPlayerInId)) return;
    if (activeAction !== 'sub' && !selectedScorerId) return;

    const initialSeconds = (liveMatch.durationMinutes || 15) * 60;
    const currentMinuteLabel = `${Math.floor((initialSeconds - secondsLeft) / 60) + 1}'`;

    let customDesc;
    if (activeAction === 'sub') {
      const playerOut = players.find((p) => p.id === selectedScorerId)?.name || 'Jogador';
      const playerIn = players.find((p) => p.id === selectedPlayerInId)?.name || 'Jogador';
      customDesc = `Substituição: Sai ${playerOut} e entra ${playerIn}`;
    }

    await addMatchEvent({
      type: activeAction,
      team: selectedTeam,
      playerId: activeAction === 'sub' ? selectedPlayerInId : selectedScorerId,
      assistPlayerId: activeAction === 'goal' && selectedAssistId ? selectedAssistId : undefined,
      minute: currentMinuteLabel,
      description: customDesc,
    });

    const actionName =
      activeAction === 'goal'
        ? 'Gol'
        : activeAction === 'foul'
        ? 'Falta'
        : activeAction === 'yellow_card'
        ? 'Cartão Amarelo'
        : activeAction === 'red_card'
        ? 'Cartão Vermelho'
        : 'Substituição';
    setSuccessMessage(`Lance registrado com sucesso: ${actionName}!`);

    setTimeout(() => {
      setSuccessMessage('');
      setActiveAction(null);
      setSelectedScorerId('');
      setSelectedAssistId('');
      setSelectedPlayerInId('');
    }, 1500);
  };

  const handleManualFinish = async () => {
    await finishLiveMatch();
  };

  return (
    <main className="flex flex-col relative w-full pt-4 pb-24 bg-slate-50 min-h-screen px-4">
      <div className="flex flex-col w-full space-y-4 max-w-lg mx-auto">

        {/* Navigation Bar */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            aria-label="Voltar"
            className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-slate-100 transition-transform active:scale-90 shadow-sm"
          >
            <span className="material-symbols-outlined text-[20px]">arrow_back</span>
          </button>

          {liveMatch.status === 'live' ? (
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#e63946] text-white text-xs font-bold uppercase shadow-sm">
              <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
              Ao Vivo • Society Casual
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-slate-900 text-white text-xs font-bold uppercase shadow-sm">
              <span className="material-symbols-outlined text-[16px] text-amber-300">flag</span>
              Partida Encerrada
            </span>
          )}

          <button
            onClick={() => navigate('/estatisticas')}
            title="Ver Classificação"
            className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-900 hover:bg-slate-100 transition-transform active:scale-90 shadow-sm"
          >
            <span className="material-symbols-outlined text-[20px]">leaderboard</span>
          </button>
        </div>

        {/* Placar Hero Header — Banner com Imagem do Campo Verde Iluminado */}
        <div className="relative overflow-hidden rounded-2xl p-5 shadow-xl border border-slate-700/50 text-white">
          <img
            src="/images/field_green.jpg"
            alt="Campo Iluminado"
            className="absolute inset-0 w-full h-full object-cover z-0"
          />
          <div className="absolute inset-0 bg-black/60 z-0" />

          {/* Content (z-10 & text-white) */}
          <div className="relative z-10 text-white space-y-4">
            <div className="flex items-center justify-between border-b border-white/20 pb-3">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-amber-300 text-[16px]">sports_soccer</span>
                <span className="text-[11px] font-extrabold text-white uppercase tracking-widest">
                  {liveMatch.competition}
                </span>
              </div>
              <span className="text-[11px] font-bold text-white/90 uppercase tracking-wide bg-white/10 px-2.5 py-0.5 rounded-full border border-white/20">
                {liveMatch.venue}
              </span>
            </div>

            {/* Times com Escudos Reais */}
            <div className="flex items-center justify-between gap-4 my-2">
              {/* Time 1 */}
              <div className="flex-1 flex flex-col items-center gap-1.5 text-center">
                <div className="w-16 h-16 rounded-full overflow-hidden bg-white/20 border-2 border-white/40 shadow-md">
                  <img
                    src={homeShield}
                    alt={liveMatch.homeTeam.name}
                    className="w-full h-full object-cover rounded-full"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = DEFAULT_FALLBACK;
                    }}
                  />
                </div>
                <span className="text-sm font-bold text-white leading-tight truncate w-full">
                  {liveMatch.homeTeam.name || 'Casa'}
                </span>
                <span className="text-3xl font-black text-white leading-none">{liveMatch.homeTeam.score}</span>
              </div>

              {/* Placar / Cronômetro Central Global Sincronizado */}
              <div className="flex flex-col items-center gap-1 shrink-0">
                <span className="text-2xl font-black text-white tracking-widest">VS</span>
                <div className="px-3 py-1 rounded-full bg-black/50 border border-white/30 flex items-center gap-1.5 shadow">
                  <span className="text-lg font-extrabold text-amber-300 tracking-wider">
                    {liveMatch.status === 'finished' ? '00:00' : formatTime(secondsLeft)}
                  </span>
                </div>
                <span className="text-[10px] text-white/90 font-bold uppercase mt-0.5 tracking-wider bg-black/30 px-2 py-0.5 rounded">
                  {liveMatch.status === 'finished'
                    ? 'Fim de Jogo'
                    : liveMatch.isTimerRunning
                    ? 'Tempo Riscando (Ao Vivo)'
                    : 'Pausado'}
                </span>
              </div>

              {/* Time 2 */}
              <div className="flex-1 flex flex-col items-center gap-1.5 text-center">
                <div className="w-16 h-16 rounded-full overflow-hidden bg-white/20 border-2 border-white/40 shadow-md">
                  <img
                    src={awayShield}
                    alt={liveMatch.awayTeam.name}
                    className="w-full h-full object-cover rounded-full"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = DEFAULT_FALLBACK;
                    }}
                  />
                </div>
                <span className="text-sm font-bold text-white leading-tight truncate w-full">
                  {liveMatch.awayTeam.name || 'Visitante'}
                </span>
                <span className="text-3xl font-black text-white leading-none">{liveMatch.awayTeam.score}</span>
              </div>
            </div>

            {/* Timer Controls & Finish Match Action */}
            {liveMatch.status === 'live' && (
              <div className="mt-4 pt-3 border-t border-white/20 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <button
                    onClick={toggleLiveTimer}
                    className="px-3 py-1.5 rounded-xl bg-white/20 border border-white/30 text-xs font-bold text-white flex items-center gap-1.5 hover:bg-white/30 transition-all active:scale-95"
                  >
                    <span className="material-symbols-outlined text-[16px]">
                      {liveMatch.isTimerRunning ? 'pause' : 'play_arrow'}
                    </span>
                    <span>{liveMatch.isTimerRunning ? 'Pausar Tempo (Global)' : 'Iniciar Tempo (Global)'}</span>
                  </button>

                  <button
                    onClick={handleManualFinish}
                    className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center gap-1 shadow active:scale-95"
                  >
                    <span className="material-symbols-outlined text-[16px]">flag</span>
                    <span>Encerrar Partida</span>
                  </button>
                </div>

                {/* Botões de Acréscimos */}
                <div className="flex items-center justify-between gap-2 pt-2 border-t border-white/10">
                  <span className="text-[11px] font-bold text-white/90">Adicionar Acréscimo:</span>
                  <div className="flex gap-1.5">
                    {[1, 2, 3, 5].map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => addExtraTimeToLiveMatch(m)}
                        className="px-2 py-1 rounded-lg bg-amber-500/30 border border-amber-400/40 text-amber-300 text-xs font-bold hover:bg-amber-500/40 transition-all active:scale-95"
                      >
                        +{m}m
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions Panel */}
        {liveMatch.status === 'live' && (
          <div className="bg-white rounded-2xl p-4 shadow-sm space-y-3 border border-slate-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-slate-900 text-[20px]">bolt</span>
                <h2 className="text-sm font-bold text-slate-900">Painel de Lances Ao Vivo</h2>
              </div>
            </div>

            {/* Team Selector */}
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setSelectedTeam('home');
                  setSelectedScorerId('');
                  setSelectedAssistId('');
                }}
                className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all border flex items-center justify-center gap-2 ${
                  selectedTeam === 'home'
                    ? 'bg-slate-900 border-slate-900 text-white shadow-sm'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <img src={homeShield} alt="" className="w-5 h-5 rounded-full object-cover" />
                <span>{liveMatch.homeTeam.name}</span>
              </button>
              <button
                onClick={() => {
                  setSelectedTeam('away');
                  setSelectedScorerId('');
                  setSelectedAssistId('');
                }}
                className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all border flex items-center justify-center gap-2 ${
                  selectedTeam === 'away'
                    ? 'bg-slate-900 border-slate-900 text-white shadow-sm'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <img src={awayShield} alt="" className="w-5 h-5 rounded-full object-cover" />
                <span>{liveMatch.awayTeam.name}</span>
              </button>
            </div>

            {/* Action Types Buttons */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
              {(Object.keys(quickActionConfig) as QuickActionType[]).map((type) => {
                const cfg = quickActionConfig[type];
                const isSelected = activeAction === type;

                return (
                  <button
                    key={type}
                    onClick={() => {
                      setActiveAction(isSelected ? null : type);
                      setSelectedScorerId('');
                      setSelectedAssistId('');
                      setSelectedPlayerInId('');
                    }}
                    className={`p-3 rounded-xl border flex items-center gap-2.5 transition-all active:scale-95 ${
                      isSelected
                        ? `${cfg.bgColor} ring-2 ring-slate-900`
                        : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <span className={`material-symbols-outlined text-[20px] ${cfg.color}`}>
                      {cfg.icon}
                    </span>
                    <span className="text-xs font-bold text-slate-900">{cfg.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Success Alert Banner */}
            {successMessage && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold text-xs flex items-center justify-center gap-2">
                <span className="material-symbols-outlined text-[18px]">check_circle</span>
                {successMessage}
              </div>
            )}

            {/* Player & Assist Form dropdowns when action selected */}
            {activeAction && !successMessage && (
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3 animate-in fade-in duration-150">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <span className="text-xs text-slate-900 uppercase font-extrabold">
                    Registrar {quickActionConfig[activeAction].label} —{' '}
                    {selectedTeam === 'home' ? liveMatch.homeTeam.name : liveMatch.awayTeam.name}
                  </span>
                  <button
                    onClick={() => setActiveAction(null)}
                    className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 hover:text-slate-900"
                  >
                    <span className="material-symbols-outlined text-[14px]">close</span>
                  </button>
                </div>

                {/* Fields for non-substitution actions */}
                {activeAction !== 'sub' && (
                  <>
                    <div>
                      <label className="block text-[10px] text-slate-600 uppercase font-bold mb-1">
                        {activeAction === 'goal' ? 'Autor do Gol *' : 'Jogador *'}
                      </label>
                      <select
                        value={selectedScorerId}
                        onChange={(e) => setSelectedScorerId(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs font-bold focus:outline-none focus:border-slate-900"
                      >
                        <option value="">-- Selecione o jogador --</option>
                        {filteredPlayers.map((p) => (
                          <option key={p.id} value={p.id}>
                            #{p.number} {p.name} ({p.position})
                          </option>
                        ))}
                      </select>
                    </div>

                    {activeAction === 'goal' && (
                      <div>
                        <label className="block text-[10px] text-slate-600 uppercase font-bold mb-1">
                          Assistência (Opcional)
                        </label>
                        <select
                          value={selectedAssistId}
                          onChange={(e) => setSelectedAssistId(e.target.value)}
                          className="w-full px-3 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs font-semibold focus:outline-none focus:border-slate-900"
                        >
                          <option value="">-- Sem assistência --</option>
                          {filteredPlayers
                            .filter((p) => p.id !== selectedScorerId)
                            .map((p) => (
                              <option key={`ast-${p.id}`} value={p.id}>
                                #{p.number} {p.name} ({p.position})
                              </option>
                            ))}
                        </select>
                      </div>
                    )}
                  </>
                )}

                {/* Fields for Substitution */}
                {activeAction === 'sub' && (
                  <>
                    <div>
                      <label className="block text-[10px] text-slate-600 uppercase font-bold mb-1">
                        Jogador que Sai *
                      </label>
                      <select
                        value={selectedScorerId}
                        onChange={(e) => setSelectedScorerId(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs font-bold focus:outline-none focus:border-slate-900"
                      >
                        <option value="">-- Selecione quem sai --</option>
                        {filteredPlayers.map((p) => (
                          <option key={`out-${p.id}`} value={p.id}>
                            #{p.number} {p.name} ({p.position})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-600 uppercase font-bold mb-1">
                        Jogador que Entra *
                      </label>
                      <select
                        value={selectedPlayerInId}
                        onChange={(e) => setSelectedPlayerInId(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs font-bold focus:outline-none focus:border-slate-900"
                      >
                        <option value="">-- Selecione quem entra --</option>
                        {filteredPlayers
                          .filter((p) => p.id !== selectedScorerId)
                          .map((p) => (
                            <option key={`in-${p.id}`} value={p.id}>
                              #{p.number} {p.name} ({p.position})
                            </option>
                          ))}
                      </select>
                    </div>
                  </>
                )}

                <button
                  onClick={handleConfirmAction}
                  disabled={
                    activeAction === 'sub' ? !selectedScorerId || !selectedPlayerInId : !selectedScorerId
                  }
                  className={`w-full py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all active:scale-95 ${
                    (activeAction === 'sub' ? selectedScorerId && selectedPlayerInId : selectedScorerId)
                      ? 'bg-slate-900 text-white hover:bg-black cursor-pointer'
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px]">add_circle</span>
                  Confirmar Registro de Lance
                </button>
              </div>
            )}
          </div>
        )}

        {/* Timeline Events Feed */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200">
          <div className="flex items-center gap-2 mb-3">
            <span className="material-symbols-outlined text-slate-900 text-[20px]">timeline</span>
            <h2 className="text-sm font-bold text-slate-900">Linha do Tempo em Tempo Real</h2>
          </div>
          <div>
            {liveMatch.events.length === 0 ? (
              <p className="text-center text-slate-500 text-xs py-4 font-medium">Nenhum lance registrado ainda.</p>
            ) : (
              liveMatch.events.map((ev) => (
                <EventFeedItem key={ev.id} event={ev} />
              ))
            )}
          </div>
        </div>

      </div>
    </main>
  );
};

export default LiveMatchDetailsPage;
