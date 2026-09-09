import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { MatchCreationModal } from '../../components/modals/MatchCreationModal';

const QUICK_ACTIONS = [
  { id: 'partidas', label: 'Partidas', icon: 'sports_soccer', path: '/partidas' },
  { id: 'elenco', label: 'Cadastrar Elenco', icon: 'group_add', path: '/elencos' },
  { id: 'tatico', label: 'Quadro Tático', icon: 'tactic', path: '/tatico' },
  { id: 'stats', label: 'Classificação', icon: 'leaderboard', path: '/estatisticas' },
  { id: 'clubes', label: 'Clubes', icon: 'shield', path: '/clubes' },
  { id: 'placar', label: 'Placar Ao Vivo', icon: 'flash_on', path: '/partidas' },
];

function resultColor(r: 'W' | 'D' | 'L') {
  if (r === 'W') return '#22c55e';
  if (r === 'D') return '#9ca3af';
  return '#ef4444';
}

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const {
    players,
    isCreationModalOpen,
    closeCreationModal,
    getTeamShield,
    matchHistory,
    upcomingMatches,
    liveMatch,
  } = useApp();

  const DEFAULT_FALLBACK = 'https://i.imgur.com/2dRX6Mh.png';

  useEffect(() => {
    const handleGlobalClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && target.closest('button, [class*="cursor-pointer"]')) {
        if (typeof window !== 'undefined' && window.navigator?.vibrate) {
          window.navigator.vibrate(15);
        }
      }
    };
    document.addEventListener('click', handleGlobalClick);
    return () => document.removeEventListener('click', handleGlobalClick);
  }, []);

  // Build last-10 from real matchHistory
  const last10 = matchHistory.slice(0, 10);

  // Compute results from history perspective of home team
  const histResults: { result: 'W' | 'D' | 'L'; opponent: string; score: string }[] = last10.map((m) => ({
    result: m.homeScore > m.awayScore ? 'W' : m.homeScore < m.awayScore ? 'L' : 'D',
    opponent: m.awayTeam,
    score: `${m.homeScore}-${m.awayScore}`,
  }));

  const wins = histResults.filter(r => r.result === 'W').length;
  const draws = histResults.filter(r => r.result === 'D').length;
  const losses = histResults.filter(r => r.result === 'L').length;

  const dynamicBarHeights = histResults.map((r) => r.result === 'W' ? 9 : r.result === 'D' ? 5 : 3);

  const sortedPlayers = [...players].sort((a, b) => (b.goals || 0) - (a.goals || 0));

  const getPerformanceColors = (goals: number, index: number, total: number) => {
    const ratio = total > 1 ? index / (total - 1) : 0;

    if (goals >= 8 || ratio <= 0.3) {
      return {
        borderColor: 'border-emerald-500',
        textColor: 'text-emerald-500',
        badgeBg: 'bg-emerald-500',
      };
    } else if (goals >= 2 || ratio <= 0.7) {
      return {
        borderColor: 'border-amber-400',
        textColor: 'text-amber-500',
        badgeBg: 'bg-amber-400',
      };
    } else {
      return {
        borderColor: 'border-rose-500',
        textColor: 'text-rose-500',
        badgeBg: 'bg-rose-500',
      };
    }
  };

  // Determine active display match for top card on Home
  const isMatchLive = liveMatch.status === 'live';
  const nextMatchItem = upcomingMatches.length > 0 ? upcomingMatches[0] : null;

  const homeTeamName = isMatchLive ? liveMatch.homeTeam.name : (nextMatchItem ? nextMatchItem.homeTeam : '');
  const awayTeamName = isMatchLive ? liveMatch.awayTeam.name : (nextMatchItem ? nextMatchItem.awayTeam : '');

  const homeShield = homeTeamName ? getTeamShield(homeTeamName) : DEFAULT_FALLBACK;
  const awayShield = awayTeamName ? getTeamShield(awayTeamName) : DEFAULT_FALLBACK;

  const handleNextMatchCardClick = () => {
    if (isMatchLive) {
      navigate(`/ao-vivo/${liveMatch.id}`);
    } else {
      navigate('/partidas');
    }
  };

  return (
    <div className="flex flex-col w-full min-h-full bg-slate-50 pb-20">

      {/* ── HEADER ── */}
      <header className="flex items-center justify-between px-5 pt-5 pb-3 bg-white border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div
            className="w-11 h-11 rounded-full flex items-center justify-center font-bold text-white text-base shadow"
            style={{ background: '#e63946' }}
          >
            C
          </div>
          <div>
            <p className="text-[15px] font-bold text-slate-900 leading-tight">Carrick</p>
            <p className="text-[12px] font-medium text-slate-600 leading-tight">Treinador principal</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            aria-label="Buscar"
            className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center shadow-sm active:scale-95 transition-transform"
          >
            <span className="material-symbols-outlined text-[20px] text-slate-600">search</span>
          </button>
          <button
            aria-label="Notificações"
            className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center shadow-sm active:scale-95 transition-transform"
          >
            <span className="material-symbols-outlined text-[20px] text-slate-600">notifications</span>
          </button>
        </div>
      </header>

      {/* ── PRÓXIMA PARTIDA OU EMPTY STATE ── */}
      <div className="px-4 pt-4 pb-3">
        {isMatchLive || nextMatchItem ? (
          <div
            className="relative overflow-hidden rounded-2xl p-5 cursor-pointer active:scale-[0.99] transition-transform shadow-md"
            style={{ background: 'linear-gradient(135deg, #e63946 0%, #c1121f 100%)' }}
            onClick={handleNextMatchCardClick}
          >
            {/* Tag de Liga */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-white/90 text-[14px]">
                  {isMatchLive ? 'sensors' : 'emoji_events'}
                </span>
                <span className="text-[11px] font-bold text-white/90 uppercase tracking-widest">
                  {isMatchLive ? 'Partida Em Andamento' : 'Próxima Partida'}
                </span>
              </div>
              <span className="text-[11px] font-semibold text-white/80 uppercase tracking-wide">
                {isMatchLive ? liveMatch.competition : nextMatchItem?.competition}
              </span>
            </div>

            {/* Times */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex-1 flex flex-col items-center gap-1.5 text-center">
                <div className="w-12 h-12 rounded-full overflow-hidden bg-white/20 p-0.5 shadow border border-white/30">
                  <img
                    src={homeShield}
                    alt={homeTeamName}
                    className="w-full h-full object-cover rounded-full"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = DEFAULT_FALLBACK;
                    }}
                  />
                </div>
                <span className="text-[13px] font-bold text-white text-center leading-tight truncate max-w-[100px]">{homeTeamName}</span>
              </div>

              <div className="flex flex-col items-center">
                <span className="text-[26px] font-extrabold text-white tracking-tight leading-none">
                  {isMatchLive ? `${liveMatch.homeTeam.score} - ${liveMatch.awayTeam.score}` : nextMatchItem?.time}
                </span>
                <span className="text-[10px] text-white/70 mt-0.5 font-medium uppercase">
                  {isMatchLive ? liveMatch.clock : nextMatchItem?.dateLabel}
                </span>
              </div>

              <div className="flex-1 flex flex-col items-center gap-1.5 text-center">
                <div className="w-12 h-12 rounded-full overflow-hidden bg-white/20 p-0.5 shadow border border-white/30">
                  <img
                    src={awayShield}
                    alt={awayTeamName}
                    className="w-full h-full object-cover rounded-full"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = DEFAULT_FALLBACK;
                    }}
                  />
                </div>
                <span className="text-[13px] font-bold text-white text-center leading-tight truncate max-w-[100px]">{awayTeamName}</span>
              </div>
            </div>

            {/* Rodapé Card */}
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/20">
              <div className="flex items-center gap-1">
                <span className="material-symbols-outlined text-white/70 text-[13px]">person</span>
                <span className="text-[11px] text-white/80">Árbitro Oficial</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="material-symbols-outlined text-white/70 text-[13px]">calendar_month</span>
                <span className="text-[11px] text-white/80">Rodada 01</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="material-symbols-outlined text-white/70 text-[13px]">stadium</span>
                <span className="text-[11px] text-white/80">
                  {isMatchLive ? liveMatch.venue : nextMatchItem?.venue}
                </span>
              </div>
            </div>

            <div className="absolute -right-10 -bottom-10 w-32 h-32 rounded-full bg-white/10 pointer-events-none" />
          </div>
        ) : (
          <div
            onClick={() => navigate('/partidas')}
            className="relative overflow-hidden rounded-2xl p-6 cursor-pointer active:scale-[0.99] transition-transform shadow-sm bg-white border border-slate-200 flex flex-col items-center justify-center text-center space-y-3"
          >
            <div className="w-12 h-12 rounded-full bg-rose-50 border border-rose-100 flex items-center justify-center text-[#e63946]">
              <span className="material-symbols-outlined text-[24px]">sports_soccer</span>
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Nenhuma partida agendada</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-xs">Crie ou agende partidas para acompanhar o placar e as estatísticas ao vivo.</p>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); navigate('/partidas'); }}
              className="px-4 py-2 rounded-xl bg-[#e63946] text-white font-bold text-xs shadow-sm hover:bg-rose-700 transition-colors"
            >
              + Criar Partida
            </button>
          </div>
        )}
      </div>

      {/* ── ÚLTIMOS JOGOS (COM EMPTY STATE) ── */}
      <div className="mx-4 mb-3 bg-white rounded-2xl p-4 border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px] text-[#e63946]">bar_chart</span>
            <h2 className="text-[14px] font-bold text-slate-900">
              {histResults.length > 0 ? `Últimos ${histResults.length} jogos` : 'Últimos Jogos'}
            </h2>
          </div>
          <button
            onClick={() => navigate('/historico')}
            className="text-[12px] font-semibold text-[#e63946] flex items-center gap-0.5 hover:opacity-75 transition-opacity"
          >
            Ver histórico
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
          </button>
        </div>

        {histResults.length > 0 ? (
          <>
            {/* Barras dinâmicas */}
            <div className="flex items-end gap-1.5 h-14 mb-3">
              {histResults.map((r, i) => (
                <div key={i} className="flex-1 flex items-end">
                  <div
                    className="w-full rounded-sm"
                    style={{ height: `${dynamicBarHeights[i] * 5}px`, background: resultColor(r.result), opacity: 0.9 }}
                  />
                </div>
              ))}
            </div>

            {/* Escudos dos adversários */}
            <div className="flex items-center gap-1.5 mb-3 overflow-x-auto no-scrollbar">
              {histResults.map((r, i) => {
                const shieldSrc = getTeamShield(r.opponent);
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-0.5 shrink-0">
                    <div className="relative w-7 h-7 rounded-full overflow-hidden border border-slate-200 bg-slate-50">
                      <img
                        src={shieldSrc}
                        alt={r.opponent}
                        className="w-full h-full object-cover"
                        onError={(e) => { (e.target as HTMLImageElement).src = DEFAULT_FALLBACK; }}
                      />
                    </div>
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ background: resultColor(r.result) }}
                      title={r.result === 'W' ? 'Vitória' : r.result === 'D' ? 'Empate' : 'Derrota'}
                    />
                  </div>
                );
              })}
            </div>

            {/* Legenda */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-[#22c55e]" />
                <span className="text-[11px] font-medium text-slate-600">Vitórias: {wins}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-[#9ca3af]" />
                <span className="text-[11px] font-medium text-slate-600">Empates: {draws}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-[#ef4444]" />
                <span className="text-[11px] font-medium text-slate-600">Derrotas: {losses}</span>
              </div>
            </div>
          </>
        ) : (
          <div className="py-6 flex flex-col items-center justify-center text-center space-y-2">
            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
              <span className="material-symbols-outlined text-[20px]">history</span>
            </div>
            <p className="text-xs font-bold text-slate-800">Sem partidas encerradas</p>
            <p className="text-[11px] text-slate-500 max-w-xs">O histórico de confrontos será exibido aqui conforme as partidas forem concluídas.</p>
          </div>
        )}
      </div>

      {/* ── MELHORES JOGADORES (COM EMPTY STATE) ── */}
      <div className="mx-4 mb-3 bg-white rounded-2xl p-4 border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px] text-[#e63946]">trophy</span>
            <h2 className="text-[14px] font-bold text-slate-900">Melhores Jogadores</h2>
          </div>
          <button
            onClick={() => navigate('/elencos')}
            className="text-[12px] font-semibold text-[#e63946] flex items-center gap-0.5 hover:opacity-75 transition-opacity"
          >
            Ver elenco
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
          </button>
        </div>

        {sortedPlayers.length > 0 ? (
          <div className="flex items-center gap-4 overflow-x-auto no-scrollbar pb-1">
            {sortedPlayers.map((player, index) => {
              const goals = player.goals || 0;
              const perf = getPerformanceColors(goals, index, sortedPlayers.length);

              return (
                <div
                  key={player.id}
                  onClick={() => navigate(`/jogador/${player.id}`)}
                  className="flex flex-col items-center gap-1 shrink-0 cursor-pointer active:scale-95 transition-transform"
                >
                  <div
                    className={`w-14 h-14 rounded-full p-0.5 border-2 ${perf.borderColor} bg-slate-100 flex items-center justify-center relative shadow-sm`}
                  >
                    <img
                      src={player.photoUrl || DEFAULT_FALLBACK}
                      alt={player.name}
                      className="w-full h-full object-cover rounded-full"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = DEFAULT_FALLBACK;
                      }}
                    />
                  </div>
                  <span className="text-[12px] font-bold text-slate-900 text-center leading-tight truncate max-w-[76px]">
                    {player.name}
                  </span>
                  <span className={`text-[11px] font-bold ${perf.textColor}`}>
                    {goals} {goals === 1 ? 'Gol' : 'Gols'}
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-6 flex flex-col items-center justify-center text-center space-y-2">
            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
              <span className="material-symbols-outlined text-[20px]">groups</span>
            </div>
            <p className="text-xs font-bold text-slate-800">Nenhum atleta no elenco</p>
            <p className="text-[11px] text-slate-500 max-w-xs">Cadastre atletas no elenco para visualizar a artilharia.</p>
            <button
              onClick={() => navigate('/elencos')}
              className="mt-1 px-3 py-1.5 rounded-xl bg-slate-800 text-white font-bold text-xs hover:bg-slate-900"
            >
              + Cadastrar Atleta
            </button>
          </div>
        )}
      </div>

      {/* ── ACESSO RÁPIDO ── */}
      <div className="mx-4 mb-6">
        <h2 className="text-[15px] font-bold text-slate-900 mb-3">Acesso rápido</h2>
        <div className="grid grid-cols-3 gap-3">
          {QUICK_ACTIONS.map((action) => (
            <button
              key={action.id}
              onClick={() => navigate(action.path)}
              className="flex flex-col items-center justify-center gap-2 bg-white rounded-2xl py-4 border border-slate-200 shadow-sm active:scale-[0.97] hover:shadow-md transition-all cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-rose-50">
                <span className="material-symbols-outlined text-[22px] text-[#e63946]">{action.icon}</span>
              </div>
              <span className="text-[11px] font-semibold text-slate-800 text-center leading-tight px-1">
                {action.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Match Creation Modal */}
      <MatchCreationModal isOpen={isCreationModalOpen} onClose={closeCreationModal} />
    </div>
  );
};

export default HomePage;
