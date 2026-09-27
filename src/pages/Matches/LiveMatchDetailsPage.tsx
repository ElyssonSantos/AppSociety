import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { LiveMatchFull, MatchEvent } from '../../types';
import { Confetti } from '../../components/common/Confetti';
import { TacticsPage } from '../Tactics/TacticsPage';

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
        <div className={`flex items-center gap-1.5 flex-wrap ${isHome ? '' : 'justify-end'}`}>
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

export const LiveMatchDetailsPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    liveMatch,
    players,
    teams,
    addMatchEvent,
    finishLiveMatch,
    toggleLiveTimer,
    setMatchClockMinutes,
    getTeamShield,
    calculateRemainingSeconds,
  } = useApp();

  const [nowMs, setNowMs] = useState<number>(Date.now());
  const [showConfetti, setShowConfetti] = useState(false);
  const [isTacticsOpen, setIsTacticsOpen] = useState(false);

  // States for Goal Flow
  const [goalFlowTeam, setGoalFlowTeam] = useState<'home' | 'away' | null>(null);
  const [goalFlowStep, setGoalFlowStep] = useState<'player' | 'assist_question' | 'assist_player'>('player');
  const [selectedScorerId, setSelectedScorerId] = useState<string>('');
  const [selectedAssistId, setSelectedAssistId] = useState<string>('');

  const DEFAULT_FALLBACK = 'https://i.imgur.com/2dRX6Mh.png';
  const homeShield = getTeamShield(liveMatch.homeTeam.name);
  const awayShield = getTeamShield(liveMatch.awayTeam.name);

  const currentTeamName = goalFlowTeam === 'home' ? liveMatch.homeTeam.name : liveMatch.awayTeam.name;
  const currentTeam = teams.find((t) => t.name === currentTeamName);
  const filteredPlayers = players.filter((p) => p.teamId === currentTeam?.id);

  // Ticker interval
  useEffect(() => {
    const interval = setInterval(() => {
      setNowMs(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const secondsLeft = calculateRemainingSeconds(liveMatch, nowMs);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleManualFinish = async () => {
    if (window.confirm("Encerrar partida?\nEssa ação finalizará o jogo e enviará os dados para o histórico.")) {
      await finishLiveMatch();
    }
  };

  const handleResetMatch = async () => {
    if (window.confirm("Resetar cronômetro? O tempo voltará para o início.")) {
      await setMatchClockMinutes(liveMatch.durationMinutes || 15);
    }
  };

  const submitGoal = async (assistId?: string) => {
    if (!goalFlowTeam || !selectedScorerId) return;

    const initialSeconds = (liveMatch.durationMinutes || 15) * 60;
    const currentMinuteLabel = `${Math.floor((initialSeconds - secondsLeft) / 60) + 1}'`;

    await addMatchEvent({
      type: 'goal',
      team: goalFlowTeam,
      playerId: selectedScorerId,
      assistPlayerId: assistId,
      minute: currentMinuteLabel,
    });

    setShowConfetti(true);
    resetGoalFlow();
  };

  const resetGoalFlow = () => {
    setGoalFlowTeam(null);
    setGoalFlowStep('player');
    setSelectedScorerId('');
    setSelectedAssistId('');
  };

  if (isTacticsOpen) {
    return (
      <div className="fixed inset-0 z-50 bg-slate-900 overflow-y-auto">
        <div className="p-4 bg-slate-900 border-b border-slate-800 sticky top-0 z-10 flex items-center justify-between text-white">
          <h2 className="font-bold text-lg">Quadro Tático Contextual</h2>
          <button
            onClick={() => setIsTacticsOpen(false)}
            className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center hover:bg-slate-700"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <TacticsPage isContextual={true} />
      </div>
    );
  }

  return (
    <main className="flex flex-col relative w-full pt-4 pb-24 bg-slate-50 min-h-screen px-4">
      <Confetti active={showConfetti} onComplete={() => setShowConfetti(false)} />
      <div className="flex flex-col w-full space-y-4 max-w-lg mx-auto">
        
        {/* Navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-slate-100 transition-transform active:scale-90 shadow-sm"
          >
            <span className="material-symbols-outlined text-[20px]">arrow_back</span>
          </button>

          {liveMatch.status === 'live' ? (
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#e63946] text-white text-xs font-bold uppercase shadow-sm">
              <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
              Ao Vivo
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-slate-900 text-white text-xs font-bold uppercase shadow-sm">
              <span className="material-symbols-outlined text-[16px] text-amber-300">flag</span>
              Encerrada
            </span>
          )}

          <button
            onClick={() => navigate('/estatisticas')}
            className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-900 hover:bg-slate-100 transition-transform active:scale-90 shadow-sm"
          >
            <span className="material-symbols-outlined text-[20px]">leaderboard</span>
          </button>
        </div>

        {/* Hero Header */}
        <div className="relative overflow-hidden rounded-2xl p-5 shadow-xl border border-slate-700/50 text-white">
          <img
            src="/images/field_green.jpg"
            alt="Campo"
            className="absolute inset-0 w-full h-full object-cover z-0"
          />
          <div className="absolute inset-0 bg-black/60 z-0" />

          <div className="relative z-10 text-white space-y-4">
            <div className="flex items-center justify-between gap-4 my-2">
              <div className="flex-1 flex flex-col items-center gap-1.5 text-center">
                <div className="w-16 h-16 rounded-full overflow-hidden bg-white/20 border-2 border-white/40 shadow-md">
                  <img
                    src={homeShield}
                    alt={liveMatch.homeTeam.name}
                    className="w-full h-full object-cover rounded-full"
                    onError={(e) => { (e.target as HTMLImageElement).src = DEFAULT_FALLBACK; }}
                  />
                </div>
                <span className="text-sm font-bold leading-tight truncate w-full">{liveMatch.homeTeam.name}</span>
                <span className="text-3xl font-black leading-none">{liveMatch.homeTeam.score}</span>
              </div>

              <div className="flex flex-col items-center gap-1 shrink-0">
                <span className="text-2xl font-black tracking-widest">VS</span>
                <div className="px-3 py-1 rounded-full bg-black/50 border border-white/30 flex items-center shadow">
                  <span className="text-lg font-extrabold text-amber-300">
                    {liveMatch.status === 'finished' ? '00:00' : formatTime(secondsLeft)}
                  </span>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-black/30 px-2 py-0.5 rounded">
                  {liveMatch.status === 'finished' ? 'Fim de Jogo' : liveMatch.isTimerRunning ? 'Tempo Riscando' : 'Pausado'}
                </span>
              </div>

              <div className="flex-1 flex flex-col items-center gap-1.5 text-center">
                <div className="w-16 h-16 rounded-full overflow-hidden bg-white/20 border-2 border-white/40 shadow-md">
                  <img
                    src={awayShield}
                    alt={liveMatch.awayTeam.name}
                    className="w-full h-full object-cover rounded-full"
                    onError={(e) => { (e.target as HTMLImageElement).src = DEFAULT_FALLBACK; }}
                  />
                </div>
                <span className="text-sm font-bold leading-tight truncate w-full">{liveMatch.awayTeam.name}</span>
                <span className="text-3xl font-black leading-none">{liveMatch.awayTeam.score}</span>
              </div>
            </div>

            {/* Timer & Controls */}
            {liveMatch.status === 'live' && (
              <div className="mt-4 pt-3 border-t border-white/20 grid grid-cols-2 gap-2 sm:grid-cols-4">
                <button
                  onClick={toggleLiveTimer}
                  className="p-3 rounded-xl bg-white/20 hover:bg-white/30 border border-white/30 text-xs font-bold text-white flex flex-col items-center justify-center gap-1 transition-all active:scale-95"
                >
                  <span className="material-symbols-outlined text-[24px]">
                    {liveMatch.isTimerRunning ? 'pause' : 'play_arrow'}
                  </span>
                  <span>{liveMatch.isTimerRunning ? 'Pausar' : 'Iniciar'}</span>
                </button>

                <button
                  onClick={handleResetMatch}
                  className="p-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-bold text-white flex flex-col items-center justify-center gap-1 transition-all active:scale-95"
                >
                  <span className="material-symbols-outlined text-[24px]">refresh</span>
                  <span>Resetar</span>
                </button>

                <button
                  onClick={() => setIsTacticsOpen(true)}
                  className="p-3 rounded-xl bg-blue-600/80 hover:bg-blue-600 border border-blue-500/50 text-xs font-bold text-white flex flex-col items-center justify-center gap-1 transition-all active:scale-95"
                >
                  <span className="material-symbols-outlined text-[24px]">sports_soccer</span>
                  <span>Tático</span>
                </button>

                <button
                  onClick={handleManualFinish}
                  className="p-3 rounded-xl bg-rose-600/90 hover:bg-rose-600 border border-rose-500/50 text-xs font-bold text-white flex flex-col items-center justify-center gap-1 transition-all active:scale-95"
                >
                  <span className="material-symbols-outlined text-[24px]">flag</span>
                  <span>Encerrar</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Simplificação Lances (Apenas GOLS) */}
        {liveMatch.status === 'live' && !goalFlowTeam && (
          <div className="bg-white rounded-2xl p-4 shadow-sm space-y-3 border border-slate-200">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span className="material-symbols-outlined">sports_score</span>
              Registrar Gol
            </h2>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setGoalFlowTeam('home')}
                className="py-6 rounded-2xl bg-emerald-50 border-2 border-emerald-100 hover:border-emerald-500 hover:bg-emerald-100 transition-all flex flex-col items-center gap-2 active:scale-95"
              >
                <img src={homeShield} alt="Home" className="w-12 h-12 rounded-full object-cover shadow-sm" />
                <span className="text-emerald-700 font-black uppercase text-sm">GOL</span>
              </button>
              <button
                onClick={() => setGoalFlowTeam('away')}
                className="py-6 rounded-2xl bg-emerald-50 border-2 border-emerald-100 hover:border-emerald-500 hover:bg-emerald-100 transition-all flex flex-col items-center gap-2 active:scale-95"
              >
                <img src={awayShield} alt="Away" className="w-12 h-12 rounded-full object-cover shadow-sm" />
                <span className="text-emerald-700 font-black uppercase text-sm">GOL</span>
              </button>
            </div>
          </div>
        )}

        {/* Goal Flow Modal Area */}
        {goalFlowTeam && (
          <div className="bg-white rounded-2xl p-4 shadow-md border-2 border-emerald-500 animate-in fade-in duration-150">
            <div className="flex items-center justify-between mb-4 border-b pb-2">
              <h2 className="text-sm font-black text-slate-900 uppercase">
                GOL - {goalFlowTeam === 'home' ? liveMatch.homeTeam.name : liveMatch.awayTeam.name}
              </h2>
              <button onClick={resetGoalFlow} className="text-slate-400 hover:text-slate-700">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {goalFlowStep === 'player' && (
              <div className="space-y-4">
                <p className="text-xs font-bold text-slate-600">Quem marcou o gol?</p>
                <div className="flex gap-3 overflow-x-auto pb-4 snap-x hide-scrollbar px-1">
                  {filteredPlayers.length === 0 ? (
                    <p className="text-xs text-slate-500 text-center py-4 w-full">Nenhum jogador no time.</p>
                  ) : (
                    filteredPlayers.map(p => (
                      <button
                        key={p.id}
                        onClick={() => {
                          setSelectedScorerId(p.id);
                          setGoalFlowStep('assist_question');
                        }}
                        className="flex-shrink-0 snap-center w-32 flex flex-col items-center gap-3 p-4 rounded-xl border border-slate-200 hover:border-emerald-400 hover:bg-emerald-50 transition-all focus:border-emerald-500 focus:bg-emerald-50 bg-white shadow-sm"
                      >
                        <img src={p.photoUrl || 'https://i.imgur.com/vnYcevV.png'} alt="" className="w-20 h-20 rounded-full object-cover shadow-sm border border-slate-100" />
                        <div className="text-center w-full">
                          <p className="text-[14px] font-bold text-slate-900 leading-tight truncate w-full">{p.name}</p>
                          <p className="text-[10px] font-bold text-slate-500 uppercase truncate w-full mt-0.5">{p.position}</p>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}

            {goalFlowStep === 'assist_question' && (
              <div className="space-y-4 py-4 text-center">
                <p className="text-sm font-bold text-slate-900">Houve assistência no lance?</p>
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={() => submitGoal()} // NO assist -> direct submit
                    className="px-6 py-3 rounded-xl bg-slate-100 text-slate-700 font-bold hover:bg-slate-200"
                  >
                    NÃO
                  </button>
                  <button
                    onClick={() => setGoalFlowStep('assist_player')}
                    className="px-6 py-3 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700"
                  >
                    SIM
                  </button>
                </div>
              </div>
            )}

            {goalFlowStep === 'assist_player' && (
              <div className="space-y-4">
                <p className="text-xs font-bold text-slate-600">Quem deu a assistência?</p>
                <div className="flex gap-3 overflow-x-auto pb-4 snap-x hide-scrollbar px-1">
                  {filteredPlayers.filter(p => p.id !== selectedScorerId).length === 0 ? (
                    <p className="text-xs text-slate-500 text-center py-4 w-full">Nenhum outro jogador disponível.</p>
                  ) : (
                    filteredPlayers.filter(p => p.id !== selectedScorerId).map(p => (
                      <button
                        key={p.id}
                        onClick={() => submitGoal(p.id)}
                        className="flex-shrink-0 snap-center w-32 flex flex-col items-center gap-3 p-4 rounded-xl border border-slate-200 hover:border-emerald-400 hover:bg-emerald-50 transition-all focus:border-emerald-500 focus:bg-emerald-50 bg-white shadow-sm"
                      >
                        <img src={p.photoUrl || 'https://i.imgur.com/vnYcevV.png'} alt="" className="w-20 h-20 rounded-full object-cover shadow-sm border border-slate-100" />
                        <div className="text-center w-full">
                          <p className="text-[14px] font-bold text-slate-900 leading-tight truncate w-full">{p.name}</p>
                          <p className="text-[10px] font-bold text-slate-500 uppercase truncate w-full mt-0.5">{p.position}</p>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Timeline */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200">
          <div className="flex items-center gap-2 mb-3">
            <span className="material-symbols-outlined text-slate-900 text-[20px]">timeline</span>
            <h2 className="text-sm font-bold text-slate-900">Linha do Tempo</h2>
          </div>
          <div>
            {liveMatch.events.length === 0 ? (
              <p className="text-center text-slate-500 text-xs py-4 font-medium">Nenhum evento.</p>
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
