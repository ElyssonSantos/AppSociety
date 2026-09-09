import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';

type EventType = 'goal' | 'yellow_card' | 'red_card' | 'sub' | 'shot' | 'foul';

interface EventButton {
  type: EventType;
  label: string;
  icon: string;
  colorClass: string;
  bgClass: string;
}

const EVENT_BUTTONS: EventButton[] = [
  { type: 'goal', label: 'Gol', icon: 'sports_soccer', colorClass: 'text-emerald-600', bgClass: 'bg-emerald-50 border-emerald-200 hover:bg-emerald-100' },
  { type: 'foul', label: 'Falta', icon: 'warning', colorClass: 'text-orange-500', bgClass: 'bg-orange-50 border-orange-200 hover:bg-orange-100' },
  { type: 'yellow_card', label: 'Amarelo', icon: 'square', colorClass: 'text-amber-500', bgClass: 'bg-amber-50 border-amber-200 hover:bg-amber-100' },
  { type: 'red_card', label: 'Vermelho', icon: 'square', colorClass: 'text-rose-600', bgClass: 'bg-rose-50 border-rose-200 hover:bg-rose-100' },
  { type: 'sub', label: 'Substituição', icon: 'swap_horiz', colorClass: 'text-blue-600', bgClass: 'bg-blue-50 border-blue-200 hover:bg-blue-100' },
];

export const LiveEventRegistrationPage: React.FC = () => {
  const navigate = useNavigate();
  const { liveMatch, players, teams, addMatchEvent } = useApp();

  const [selectedType, setSelectedType] = useState<EventType | null>(null);
  const [selectedPlayer, setSelectedPlayer] = useState<string>('');
  const [selectedAssist, setSelectedAssist] = useState<string>('');
  const [selectedTeam, setSelectedTeam] = useState<'home' | 'away'>('home');
  const [minute, setMinute] = useState('45');
  const [submitted, setSubmitted] = useState(false);

  const handleRegister = () => {
    if (!selectedType || !selectedPlayer || !minute) return;

    addMatchEvent({
      type: selectedType,
      team: selectedTeam,
      playerId: selectedPlayer,
      assistPlayerId: selectedType === 'goal' && selectedAssist ? selectedAssist : undefined,
      minute: `${minute}'`,
    });

    setSubmitted(true);
    setTimeout(() => {
      navigate(-1);
    }, 1000);
  };

  const isFormValid = selectedType && selectedPlayer && minute;

  return (
    <main className="flex flex-col relative w-full pt-4 pb-24 bg-slate-50 min-h-screen px-4">
      <div className="flex flex-col w-full space-y-4 max-w-lg mx-auto">

        {/* Nav Header */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            aria-label="Voltar"
            className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-slate-100 transition-transform active:scale-90 shadow-sm"
          >
            <span className="material-symbols-outlined text-[20px]">arrow_back</span>
          </button>
          <div>
            <span className="text-[11px] text-[#e63946] uppercase font-bold tracking-wider">
              Lances em Tempo Real
            </span>
          </div>
          <div className="w-10" />
        </div>

        {/* Mini Placar */}
        <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center justify-between">
          <span className="text-xs font-bold text-slate-900">{liveMatch.homeTeam.name}</span>
          <span className="text-lg font-extrabold text-[#e63946] px-3">
            {liveMatch.homeTeam.score} — {liveMatch.awayTeam.score}
          </span>
          <span className="text-xs font-bold text-slate-900">{liveMatch.awayTeam.name}</span>
        </div>

        {/* Tipo de Evento */}
        <div>
          <h2 className="text-xs uppercase font-bold text-slate-600 mb-2">Tipo de Lance</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {EVENT_BUTTONS.map((btn) => (
              <button
                key={btn.type}
                onClick={() => {
                  setSelectedType(btn.type);
                  setSelectedAssist('');
                }}
                className={`p-3 rounded-xl border flex items-center gap-2.5 transition-all active:scale-95 ${selectedType === btn.type ? btn.bgClass + ' ring-2 ring-[#e63946]' : 'bg-white border-slate-200'
                  }`}
              >
                <span
                  className={`material-symbols-outlined text-[20px] ${btn.colorClass}`}
                >
                  {btn.icon}
                </span>
                <span className="text-xs font-bold text-slate-900">
                  {btn.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Equipe */}
        <div>
          <h2 className="text-xs uppercase font-bold text-slate-600 mb-2">Equipe</h2>
          <div className="grid grid-cols-2 gap-2">
            {(['home', 'away'] as const).map((team) => (
              <button
                key={team}
                onClick={() => { setSelectedTeam(team); setSelectedPlayer(''); setSelectedAssist(''); }}
                className={`p-3 rounded-xl border font-bold text-xs transition-all active:scale-95 ${selectedTeam === team
                  ? 'bg-rose-50 border-[#e63946] text-[#e63946] shadow-sm'
                  : 'bg-white border-slate-200 text-slate-600'
                  }`}
              >
                {team === 'home' ? liveMatch.homeTeam.name : liveMatch.awayTeam.name}
              </button>
            ))}
          </div>
        </div>

        {/* Seleção de Jogador Autor */}
        <div>
          <h2 className="text-xs uppercase font-bold text-slate-600 mb-2">
            {selectedType === 'goal' ? 'Autor do Gol' : 'Jogador'}
          </h2>
          <div className="flex flex-col gap-1.5">
            {(() => {
              const currentTeamName = selectedTeam === 'home' ? liveMatch.homeTeam.name : liveMatch.awayTeam.name;
              const currentTeam = teams.find(t => t.name === currentTeamName);
              const filteredPlayers = players.filter(p => p.teamId === currentTeam?.id);

              if (filteredPlayers.length === 0) {
                return <p className="text-xs text-slate-500 font-medium text-center py-4">Nenhum jogador cadastrado neste time.</p>;
              }

              return filteredPlayers.map((player) => (
                <button
                  key={player.id}
                  onClick={() => setSelectedPlayer(player.id)}
                  className={`p-2.5 rounded-xl border flex items-center gap-3 transition-all active:scale-95 ${selectedPlayer === player.id
                    ? 'bg-rose-50 border-[#e63946]'
                    : 'bg-white border-slate-200'
                    }`}
                >
                  <div className="w-8 h-8 rounded-full overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
                    <img
                      src={player.photoUrl}
                      alt={player.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://i.imgur.com/2dRX6Mh.png';
                      }}
                    />
                  </div>
                  <div className="text-left flex-1 min-w-0">
                    <span className="font-bold text-xs text-slate-900 block truncate">{player.name}</span>
                    <span className="text-[10px] text-slate-500 font-medium">{player.position}</span>
                  </div>
                  <span className="text-xs font-bold text-[#e63946]">#{player.number}</span>
                </button>
              ));
            })()}
          </div>
        </div>

        {/* Assistência (Exibida somente ao selecionar Gol) */}
        {selectedType === 'goal' && (
          <div>
            <h2 className="text-xs uppercase font-bold text-slate-600 mb-2">
              Assistência <span className="text-slate-400 font-normal">(Opcional)</span>
            </h2>
            <div className="relative">
              <select
                value={selectedAssist}
                onChange={(e) => setSelectedAssist(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 font-semibold text-xs focus:outline-none focus:border-[#e63946]"
              >
                <option value="">-- Nenhuma assistência --</option>
                {(() => {
                  const currentTeamName = selectedTeam === 'home' ? liveMatch.homeTeam.name : liveMatch.awayTeam.name;
                  const currentTeam = teams.find(t => t.name === currentTeamName);
                  const filteredPlayers = players.filter(p => p.teamId === currentTeam?.id && p.id !== selectedPlayer);

                  return filteredPlayers.map((p) => (
                    <option key={`ast-reg-${p.id}`} value={p.id}>
                      #{p.number} {p.name} ({p.position})
                    </option>
                  ));
                })()}
              </select>
            </div>
          </div>
        )}

        {/* Minuto */}
        <div>
          <h2 className="text-xs uppercase font-bold text-slate-600 mb-2">Minuto do Lance</h2>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">
              timer
            </span>
            <input
              type="number"
              min="1"
              max="120"
              value={minute}
              onChange={(e) => setMinute(e.target.value)}
              placeholder="Ex: 45"
              className="w-full h-11 pl-10 pr-4 rounded-xl bg-white border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#e63946] transition-colors"
            />
          </div>
        </div>

        {/* Botão Registrar */}
        {submitted ? (
          <div className="w-full py-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold text-sm flex items-center justify-center gap-2 shadow-sm">
            <span className="material-symbols-outlined text-[20px]">check_circle</span>
            Lance Registrado e Estatísticas Atualizadas!
          </div>
        ) : (
          <button
            onClick={handleRegister}
            disabled={!isFormValid}
            className={`w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-md transition-all active:scale-95 ${isFormValid
              ? 'bg-[#e63946] text-white hover:bg-rose-700 cursor-pointer'
              : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
          >
            <span className="material-symbols-outlined text-[18px]">add_circle</span>
            Confirmar e Salvar Lance
          </button>
        )}
      </div>
    </main>
  );
};

export default LiveEventRegistrationPage;
