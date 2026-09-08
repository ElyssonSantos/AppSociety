import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { MatchCreationModal } from '../../components/modals/MatchCreationModal';

// Static fallback for when there's no match history yet
const STATIC_RESULTS: ('W' | 'D' | 'L')[] = ['W', 'L', 'D', 'W', 'L', 'W', 'W', 'D', 'L', 'W'];
const STATIC_BAR_HEIGHTS = [7, 4, 5, 8, 3, 9, 6, 2, 5, 8];

const BAR_HEIGHTS = STATIC_BAR_HEIGHTS;

const QUICK_ACTIONS = [
  { id: 'partidas',  label: 'Partidas',         icon: 'sports_soccer', path: '/partidas' },
  { id: 'elenco',    label: 'Cadastrar Elenco', icon: 'group_add',     path: '/elencos' },
  { id: 'tatico',    label: 'Quadro Tático',    icon: 'tactic',        path: '/tatico' },
  { id: 'stats',     label: 'Classificação',    icon: 'leaderboard',   path: '/estatisticas' },
  { id: 'clubes',    label: 'Clubes',           icon: 'shield',        path: '/clubes' },
  { id: 'placar',    label: 'Placar Ao Vivo',   icon: 'flash_on',      path: '/partidas' },
];

// BAR_HEIGHTS is now derived dynamically

function resultColor(r: 'W' | 'D' | 'L') {
  if (r === 'W') return '#22c55e';
  if (r === 'D') return '#9ca3af';
  return '#ef4444';
}

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { players, isCreationModalOpen, closeCreationModal, openCreationModal, getTeamShield, matchHistory } = useApp();

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

  // Build last-10 from real matchHistory (reference team = first team in history)
  // We use the last 10 finished matches, showing opponent shield + result color
  const last10 = matchHistory.slice(0, 10);

  // Compute results from history perspective of home team
  const histResults: { result: 'W' | 'D' | 'L'; opponent: string; score: string }[] = last10.map((m) => ({
    result: m.homeScore > m.awayScore ? 'W' : m.homeScore < m.awayScore ? 'L' : 'D',
    opponent: m.awayTeam,
    score: `${m.homeScore}-${m.awayScore}`,
  }));

  // Use static fallback if no real history
  const displayResults = histResults.length > 0 ? histResults : STATIC_RESULTS.map((r, i) => ({
    result: r,
    opponent: ['Amigos do Zico', 'Resenha FC', 'Galácticos FC', 'Vila Real Society', 'Amigos do Zico', 'Resenha FC', 'Galácticos FC', 'Vila Real Society', 'Amigos do Zico', 'Resenha FC'][i],
    score: '',
  }));

  const wins   = displayResults.filter(r => r.result === 'W').length;
  const draws  = displayResults.filter(r => r.result === 'D').length;
  const losses = displayResults.filter(r => r.result === 'L').length;

  const dynamicBarHeights = displayResults.map((r) => r.result === 'W' ? 9 : r.result === 'D' ? 5 : 3);

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

  const homeShield = getTeamShield('Resenha FC');
  const awayShield = getTeamShield('Amigos do Zico');

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

      {/* ── PRÓXIMA PARTIDA — Com Escudos Reais em <img> ── */}
      <div className="px-4 pt-4 pb-3">
        <div
          className="relative overflow-hidden rounded-2xl p-5 cursor-pointer active:scale-[0.99] transition-transform shadow-md"
          style={{ background: 'linear-gradient(135deg, #e63946 0%, #c1121f 100%)' }}
          onClick={openCreationModal}
        >
          {/* Tag de Liga */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-white/90 text-[14px]">emoji_events</span>
              <span className="text-[11px] font-bold text-white/90 uppercase tracking-widest">Próxima Partida</span>
            </div>
            <span className="text-[11px] font-semibold text-white/80 uppercase tracking-wide">Society 2026</span>
          </div>

          {/* Times com Escudos Reais */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex-1 flex flex-col items-center gap-1.5 text-center">
              <div className="w-12 h-12 rounded-full overflow-hidden bg-white/20 p-0.5 shadow border border-white/30">
                <img
                  src={homeShield}
                  alt="Resenha FC"
                  className="w-full h-full object-cover rounded-full"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=120&q=80';
                  }}
                />
              </div>
              <span className="text-[13px] font-bold text-white text-center leading-tight">Resenha FC</span>
            </div>

            <div className="flex flex-col items-center">
              <span className="text-[28px] font-extrabold text-white tracking-tight leading-none">05:00</span>
              <span className="text-[10px] text-white/70 mt-0.5 font-medium uppercase">28 ABR, 2025</span>
            </div>

            <div className="flex-1 flex flex-col items-center gap-1.5 text-center">
              <div className="w-12 h-12 rounded-full overflow-hidden bg-white/20 p-0.5 shadow border border-white/30">
                <img
                  src={awayShield}
                  alt="Amigos do Zico"
                  className="w-full h-full object-cover rounded-full"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&w=120&q=80';
                  }}
                />
              </div>
              <span className="text-[13px] font-bold text-white text-center leading-tight">Amigos do Zico</span>
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
              <span className="text-[11px] text-white/80">Quadra Society 01</span>
            </div>
          </div>

          <div className="absolute -right-10 -bottom-10 w-32 h-32 rounded-full bg-white/10 pointer-events-none" />
        </div>
      </div>

      {/* ── ÚLTIMOS 10 JOGOS ── */}
      <div className="mx-4 mb-3 bg-white rounded-2xl p-4 border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px] text-[#e63946]">bar_chart</span>
            <h2 className="text-[14px] font-bold text-slate-900">Últimos {displayResults.length} jogos</h2>
          </div>
          <button
            onClick={() => navigate('/historico')}
            className="text-[12px] font-semibold text-[#e63946] flex items-center gap-0.5 hover:opacity-75 transition-opacity"
          >
            Ver histórico
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
          </button>
        </div>

        {/* Barras dinâmicas */}
        <div className="flex items-end gap-1.5 h-14 mb-3">
          {displayResults.map((r, i) => (
            <div key={i} className="flex-1 flex items-end">
              <div
                className="w-full rounded-sm"
                style={{ height: `${dynamicBarHeights[i] * 5}px`, background: resultColor(r.result), opacity: 0.9 }}
              />
            </div>
          ))}
        </div>

        {/* Escudos dos adversários com indicador colorido */}
        <div className="flex items-center gap-1.5 mb-3 overflow-x-auto no-scrollbar">
          {displayResults.map((r, i) => {
            const shieldSrc = getTeamShield(r.opponent);
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-0.5 shrink-0">
                <div className="relative w-7 h-7 rounded-full overflow-hidden border border-slate-200 bg-slate-50">
                  <img
                    src={shieldSrc}
                    alt={r.opponent}
                    className="w-full h-full object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
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
      </div>

      {/* ── MELHORES JOGADORES ── */}
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
                    src={player.photoUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80'}
                    alt={player.name}
                    className="w-full h-full object-cover rounded-full"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80';
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
