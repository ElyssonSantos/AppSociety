import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { useAccessCode } from '../../context/AccessCodeContext';
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
  const { isUnlocked, requestAction } = useAccessCode();

  const [nowMs, setNowMs] = useState<number>(Date.now());
  const [showConfetti, setShowConfetti] = useState(false);
  const [isTacticsOpen, setIsTacticsOpen] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<{
    title: string;
    message: string;
    confirmLabel: string;
    confirmColor: string;
    onConfirm: () => void;
  } | null>(null);

  // States for Goal Flow
  const [goalFlowTeam, setGoalFlowTeam] = useState<'home' | 'away' | null>(null);
  const [goalFlowStep, setGoalFlowStep] = useState<'player' | 'assist_question' | 'assist_player'>('player');
  const [selectedScorerId, setSelectedScorerId] = useState<string>('');
  const [selectedAssistId, setSelectedAssistId] = useState<string>('');

  const DEFAULT_FALLBACK = 'https://i.imgur.com/2dRX6Mh.png';
  const homeShield = getTeamShield(liveMatch.homeTeam.name);
  const awayShield = getTeamShield(liveMatch.awayTeam.name);

  const currentTeamName = goalFlowTeam === 'home' ? liveMatch.homeTeam.name : liveMatch.awayTeam.name;
  const currentTeam = teams.find(
    (t) => t.name.trim().toLowerCase() === (currentTeamName || '').trim().toLowerCase()
  );
  const teamPlayers = players.filter((p) => currentTeam && p.teamId === currentTeam.id);
  const filteredPlayers = teamPlayers.length > 0 ? teamPlayers : players;

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

  const handleManualFinish = () => {
    requestAction(() => {
      setConfirmDialog({
        title: 'Encerrar Partida?',
        message: 'Essa ação finalizará o jogo e enviará os dados e estatísticas para o histórico.',
        confirmLabel: 'Sim, Encerrar',
        confirmColor: 'bg-rose-600 hover:bg-rose-700',
        onConfirm: async () => {
          await finishLiveMatch();
          setConfirmDialog(null);
        },
      });
    });
  };

  const handleResetMatch = () => {
    requestAction(() => {
      setConfirmDialog({
        title: 'Resetar Cronômetro?',
        message: 'O tempo voltará para a duração inicial da partida.',
        confirmLabel: 'Sim, Resetar',
        confirmColor: 'bg-slate-900 hover:bg-black',
        onConfirm: async () => {
          await setMatchClockMinutes(liveMatch.durationMinutes || 15);
          setConfirmDialog(null);
        },
      });
    });
  };

  const submitGoal = async (assistId?: string) => {
    if (!goalFlowTeam || !selectedScorerId) return;

    requestAction(async () => {
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
    });
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
                  onClick={() => requestAction(toggleLiveTimer)}
                  title={isUnlocked ? (liveMatch.isTimerRunning ? 'Pausar' : 'Iniciar') : 'Acesso restrito: Requer código'}
                  className="p-3 rounded-xl bg-white/20 hover:bg-white/30 border border-white/30 text-xs font-bold text-white flex flex-col items-center justify-center gap-1 transition-all active:scale-95 relative"
                >
                  <span className="material-symbols-outlined text-[24px]">
                    {isUnlocked
                      ? (liveMatch.isTimerRunning ? 'pause' : 'play_arrow')
                      : 'lock'}
                  </span>
                  <span>{liveMatch.isTimerRunning ? 'Pausar' : 'Iniciar'}</span>
                </button>

                <button
                  onClick={handleResetMatch}
                  title={isUnlocked ? 'Resetar cronômetro' : 'Acesso restrito: Resetar cronômetro'}
                  className="p-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-bold text-white flex flex-col items-center justify-center gap-1 transition-all active:scale-95 relative"
                >
                  <span className="material-symbols-outlined text-[24px]">
                    {isUnlocked ? 'refresh' : 'lock'}
                  </span>
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
                  title={isUnlocked ? 'Encerrar partida' : 'Acesso restrito: Encerrar partida'}
                  className="p-3 rounded-xl bg-rose-600/90 hover:bg-rose-600 border border-rose-500/50 text-xs font-bold text-white flex flex-col items-center justify-center gap-1 transition-all active:scale-95 relative"
                >
                  <span className="material-symbols-outlined text-[24px]">
                    {isUnlocked ? 'flag' : 'lock'}
                  </span>
                  <span>Encerrar</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Simplificação Lances (Apenas GOLS) */}
        {liveMatch.status === 'live' && !goalFlowTeam && (
          <div className="bg-white rounded-2xl p-4 shadow-sm space-y-3 border border-slate-200">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span className="material-symbols-outlined">sports_score</span>
                Registrar Gol
              </h2>
              {!isUnlocked && (
                <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <span className="material-symbols-outlined text-[12px]">lock</span>
                  Requer código
                </span>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => requestAction(() => setGoalFlowTeam('home'))}
                className="py-6 rounded-2xl bg-emerald-50 border-2 border-emerald-100 hover:border-emerald-500 hover:bg-emerald-100 transition-all flex flex-col items-center gap-2 active:scale-95 relative"
              >
                <img src={homeShield} alt="Home" className="w-12 h-12 rounded-full object-cover shadow-sm" />
                <span className="text-emerald-700 font-black uppercase text-sm">GOL</span>
                {!isUnlocked && (
                  <span className="material-symbols-outlined text-[16px] text-amber-500 absolute top-2 right-2">lock</span>
                )}
              </button>
              <button
                onClick={() => requestAction(() => setGoalFlowTeam('away'))}
                className="py-6 rounded-2xl bg-emerald-50 border-2 border-emerald-100 hover:border-emerald-500 hover:bg-emerald-100 transition-all flex flex-col items-center gap-2 active:scale-95 relative"
              >
                <img src={awayShield} alt="Away" className="w-12 h-12 rounded-full object-cover shadow-sm" />
                <span className="text-emerald-700 font-black uppercase text-sm">GOL</span>
                {!isUnlocked && (
                  <span className="material-symbols-outlined text-[16px] text-amber-500 absolute top-2 right-2">lock</span>
                )}
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

        {/* Modal de Confirmação In-App (Substitui window.confirm) */}
        {confirmDialog && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
            <div className="w-full max-w-sm bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 text-center space-y-4 animate-in zoom-in-95 duration-150">
              <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto text-slate-800 shadow-inner">
                <span className="material-symbols-outlined text-[28px]">help</span>
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900">{confirmDialog.title}</h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">{confirmDialog.message}</p>
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setConfirmDialog(null)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-100 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={confirmDialog.onConfirm}
                  className={`flex-1 py-2.5 rounded-xl text-white font-bold text-xs transition-all shadow-md active:scale-95 ${confirmDialog.confirmColor}`}
                >
                  {confirmDialog.confirmLabel}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </main>
  );
};

export default LiveMatchDetailsPage;
