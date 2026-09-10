import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { MatchEvent, MatchHistoryEntry } from '../../types';

const formatDate = (iso: string) => {
  const d = new Date(iso);
  return (
    d.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }) +
    ' • ' +
    d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  );
};

const HistoryCard: React.FC<{
  entry: MatchHistoryEntry;
  homeShield: string;
  awayShield: string;
  onEdit: () => void;
  onDelete: () => void;
}> = ({ entry, homeShield, awayShield, onEdit, onDelete }) => {
  const [expanded, setExpanded] = useState(false);

  const winner =
    entry.homeScore > entry.awayScore
      ? 'home'
      : entry.awayScore > entry.homeScore
      ? 'away'
      : 'draw';

  return (
    <div className="relative rounded-2xl border border-slate-700/50 shadow-md overflow-hidden text-white my-2">
      {/* Background Image (Green Field Illuminated) */}
      <img
        src="/images/field_green.jpg"
        alt="Campo Iluminado"
        className="absolute inset-0 w-full h-full object-cover z-0"
      />
      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/60 z-0" />

      {/* Card Content (Relative z-10 text-white) */}
      <div className="relative z-10 p-4 text-white">
        {/* Card Header */}
        <div className="flex items-center justify-between mb-3 border-b border-white/20 pb-2">
          <span className="text-[11px] text-white/80 font-bold">{formatDate(entry.date)}</span>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-white/90 font-bold bg-white/10 px-2 py-0.5 rounded-full border border-white/20 uppercase">
              {entry.competition}
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
              title="Editar partida e lances"
              className="w-7 h-7 rounded-full bg-black/40 border border-white/20 flex items-center justify-center text-white hover:bg-amber-500 hover:border-amber-400 transition-colors"
            >
              <span className="material-symbols-outlined text-[14px]">edit</span>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              title="Excluir partida do histórico"
              className="w-7 h-7 rounded-full bg-black/40 border border-white/20 flex items-center justify-center text-white hover:bg-rose-600 transition-colors"
            >
              <span className="material-symbols-outlined text-[14px]">delete</span>
            </button>
          </div>
        </div>

        {/* Scoreline */}
        <div
          className="flex items-center justify-between gap-3 cursor-pointer py-1"
          onClick={() => setExpanded((p) => !p)}
        >
          {/* Home */}
          <div className="flex-1 flex flex-col items-center gap-1.5">
            <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white/40 shadow-sm bg-white/20">
              <img
                src={homeShield}
                alt={entry.homeTeam}
                className="w-full h-full object-cover rounded-full"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://i.imgur.com/2dRX6Mh.png';
                }}
              />
            </div>
            <span className="text-xs font-bold text-center leading-tight text-white truncate max-w-[90px]">
              {entry.homeTeam}
            </span>
            <span className="text-2xl font-black leading-none text-white">
              {entry.homeScore}
            </span>
          </div>

          {/* Center */}
          <div className="flex flex-col items-center gap-1 shrink-0">
            <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-white/20 text-white border border-white/30 tracking-widest uppercase">
              {winner === 'draw' ? 'EMPATE' : 'ENCERRADA'}
            </span>
            <span className="text-white/60 text-lg font-light">×</span>
          </div>

          {/* Away */}
          <div className="flex-1 flex flex-col items-center gap-1.5">
            <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white/40 shadow-sm bg-white/20">
              <img
                src={awayShield}
                alt={entry.awayTeam}
                className="w-full h-full object-cover rounded-full"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://i.imgur.com/2dRX6Mh.png';
                }}
              />
            </div>
            <span className="text-xs font-bold text-center leading-tight text-white truncate max-w-[90px]">
              {entry.awayTeam}
            </span>
            <span className="text-2xl font-black leading-none text-white">
              {entry.awayScore}
            </span>
          </div>
        </div>

        {/* Expand indicator */}
        <div
          className="flex items-center justify-center mt-3 pt-2 border-t border-white/20 gap-1 text-white/80 cursor-pointer"
          onClick={() => setExpanded((p) => !p)}
        >
          <span className="text-[11px] font-medium">
            {entry.events.length > 0
              ? `${entry.events.length} lance(s) registrado(s)`
              : 'Sem lances registrados'}
          </span>
          <span className="material-symbols-outlined text-[16px] text-white">
            {expanded ? 'expand_less' : 'expand_more'}
          </span>
        </div>

        {/* Expanded Events Timeline */}
        {expanded && entry.events.length > 0 && (
          <div className="border-t border-white/20 mt-3 pt-3 space-y-2 bg-black/30 rounded-xl p-3">
            <span className="text-[10px] uppercase font-extrabold text-amber-300 tracking-wider">
              Linha do Tempo
            </span>
            {entry.events.map((ev) => (
              <div
                key={ev.id}
                className="flex items-start gap-2.5 py-1.5 border-b border-white/10 last:border-0"
              >
                <span className="text-[10px] font-bold text-white/70 w-8 shrink-0">{ev.minute}</span>
                <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 bg-white/20 border border-white/30">
                  <span className="material-symbols-outlined text-[12px] text-white">
                    {ev.type === 'goal'
                      ? 'sports_soccer'
                      : ev.type === 'yellow_card' || ev.type === 'red_card'
                      ? 'square'
                      : ev.type === 'sub'
                      ? 'swap_horiz'
                      : 'info'}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-xs font-bold text-white">{ev.player}</span>
                  {ev.assist && <span className="text-[10px] text-white/70"> (Ast: {ev.assist})</span>}
                  <p className="text-[10px] text-white/80 leading-tight truncate">{ev.description}</p>
                </div>
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full shrink-0 bg-white/20 text-white border border-white/30 uppercase">
                  {ev.team === 'home' ? 'CASA' : 'VISIT'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Modal de Edição de Histórico
const EditMatchHistoryModal: React.FC<{
  entry: MatchHistoryEntry;
  onClose: () => void;
  onSave: (updatedEntry: Partial<MatchHistoryEntry>) => Promise<void>;
}> = ({ entry, onClose, onSave }) => {
  const { players } = useApp();
  const [homeScore, setHomeScore] = useState<number>(entry.homeScore);
  const [awayScore, setAwayScore] = useState<number>(entry.awayScore);
  const [events, setEvents] = useState<MatchEvent[]>(entry.events ? [...entry.events] : []);
  const [saving, setSaving] = useState(false);

  const handleAddEvent = () => {
    const newEv: MatchEvent = {
      id: `ev-${Date.now()}`,
      minute: "1'",
      type: 'goal',
      team: 'home',
      player: players[0]?.name || 'Jogador',
      description: 'Gol de ' + (players[0]?.name || 'Jogador'),
    };
    setEvents((prev) => [newEv, ...prev]);
  };

  const handleUpdateEvent = (index: number, updatedEv: Partial<MatchEvent>) => {
    setEvents((prev) =>
      prev.map((ev, i) => {
        if (i !== index) return ev;
        const merged = { ...ev, ...updatedDataDesc(ev, updatedEv) };
        return merged;
      })
    );
  };

  const updatedDataDesc = (orig: MatchEvent, updated: Partial<MatchEvent>): Partial<MatchEvent> => {
    const nextType = updated.type ?? orig.type;
    const nextPlayer = updated.player ?? orig.player;
    const nextAssist = updated.assist !== undefined ? updated.assist : orig.assist;

    let desc = updated.description ?? orig.description;
    if (!updated.description) {
      if (nextType === 'goal') {
        desc = `Gol de ${nextPlayer}${nextAssist ? ` (Assistência: ${nextAssist})` : ''}`;
      } else if (nextType === 'yellow_card') {
        desc = `Cartão amarelo para ${nextPlayer}`;
      } else if (nextType === 'red_card') {
        desc = `Cartão vermelho para ${nextPlayer}`;
      } else if (nextType === 'foul') {
        desc = `Falta cometida por ${nextPlayer}`;
      } else if (nextType === 'sub') {
        desc = `Substituição — entra ${nextPlayer}`;
      } else {
        desc = `Lance com ${nextPlayer}`;
      }
    }
    return { ...updated, description: desc };
  };

  const handleDeleteEvent = (index: number) => {
    setEvents((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await onSave({
      homeScore: Math.max(0, homeScore),
      awayScore: Math.max(0, awayScore),
      events,
    });
    setSaving(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="w-full max-w-lg bg-white rounded-2xl border border-slate-200 shadow-2xl p-5 my-8 space-y-4 max-h-[90vh] flex flex-col">
        {/* Header Modal */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 shrink-0">
          <div>
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">
              Editar Histórico de Partida
            </span>
            <h3 className="text-base font-extrabold text-slate-900">
              {entry.homeTeam} vs {entry.awayTeam}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto space-y-4 pr-1">
          {/* Ajuste de Placar */}
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Placar Final
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">
                  {entry.homeTeam} (Mandante)
                </label>
                <input
                  type="number"
                  min="0"
                  value={homeScore}
                  onChange={(e) => setHomeScore(parseInt(e.target.value) || 0)}
                  className="w-full h-10 px-3 rounded-lg bg-white border border-slate-300 text-slate-900 font-bold text-sm focus:outline-none focus:border-slate-900"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">
                  {entry.awayTeam} (Visitante)
                </label>
                <input
                  type="number"
                  min="0"
                  value={awayScore}
                  onChange={(e) => setAwayScore(parseInt(e.target.value) || 0)}
                  className="w-full h-10 px-3 rounded-lg bg-white border border-slate-300 text-slate-900 font-bold text-sm focus:outline-none focus:border-slate-900"
                />
              </div>
            </div>
          </div>

          {/* Lances / Eventos da Partida */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Lances da Partida ({events.length})
              </h4>
              <button
                type="button"
                onClick={handleAddEvent}
                className="px-2.5 py-1 rounded-lg bg-slate-900 text-white font-bold text-[11px] flex items-center gap-1 hover:bg-black transition-colors"
              >
                <span className="material-symbols-outlined text-[14px]">add</span>
                <span>Adicionar Lance</span>
              </button>
            </div>

            {events.length === 0 ? (
              <p className="text-xs text-slate-500 italic py-2 text-center">
                Nenhum lance registrado nesta partida.
              </p>
            ) : (
              <div className="space-y-3">
                {events.map((ev, index) => (
                  <div
                    key={ev.id || index}
                    className="p-3 rounded-xl border border-slate-200 bg-white space-y-2 shadow-sm"
                  >
                    <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2">
                      <div className="flex items-center gap-2">
                        {/* Tipo de Evento */}
                        <select
                          value={ev.type}
                          onChange={(e) =>
                            handleUpdateEvent(index, {
                              type: e.target.value as MatchEvent['type'],
                            })
                          }
                          className="px-2 py-1 rounded-md bg-slate-100 border border-slate-200 text-xs font-bold text-slate-800"
                        >
                          <option value="goal">Gol ⚽</option>
                          <option value="foul">Falta ⚠️</option>
                          <option value="yellow_card">Amarelo 🟨</option>
                          <option value="red_card">Vermelho 🟥</option>
                          <option value="sub">Substituição 🔄</option>
                          <option value="shot">Chute a Gol 🎯</option>
                        </select>

                        {/* Equipe */}
                        <select
                          value={ev.team}
                          onChange={(e) =>
                            handleUpdateEvent(index, {
                              team: e.target.value as 'home' | 'away',
                            })
                          }
                          className="px-2 py-1 rounded-md bg-slate-100 border border-slate-200 text-xs font-bold text-slate-800"
                        >
                          <option value="home">Mandante ({entry.homeTeam})</option>
                          <option value="away">Visitante ({entry.awayTeam})</option>
                        </select>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleDeleteEvent(index)}
                        title="Remover este lance"
                        className="w-7 h-7 rounded-full bg-rose-50 text-rose-600 hover:bg-rose-100 flex items-center justify-center transition-colors"
                      >
                        <span className="material-symbols-outlined text-[16px]">delete</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      {/* Minuto */}
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 block">Minuto</label>
                        <input
                          type="text"
                          value={ev.minute}
                          onChange={(e) => handleUpdateEvent(index, { minute: e.target.value })}
                          placeholder="Ex: 15'"
                          className="w-full h-8 px-2 rounded bg-slate-50 border border-slate-200 text-xs text-slate-900 font-semibold"
                        />
                      </div>

                      {/* Autor / Jogador */}
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 block">Jogador</label>
                        <input
                          type="text"
                          value={ev.player}
                          onChange={(e) => handleUpdateEvent(index, { player: e.target.value })}
                          placeholder="Nome do jogador"
                          className="w-full h-8 px-2 rounded bg-slate-50 border border-slate-200 text-xs text-slate-900 font-semibold"
                        />
                      </div>

                      {/* Assistência */}
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 block">Assistência (opcional)</label>
                        <input
                          type="text"
                          value={ev.assist || ''}
                          onChange={(e) => handleUpdateEvent(index, { assist: e.target.value })}
                          placeholder="Nome da assistência"
                          className="w-full h-8 px-2 rounded bg-slate-50 border border-slate-200 text-xs text-slate-900 font-semibold"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Botões de Ação */}
          <div className="flex gap-2 pt-2 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-100"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-black transition-colors"
            >
              {saving ? 'Salvando...' : 'Salvar Alterações'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export const MatchHistoryPage: React.FC = () => {
  const navigate = useNavigate();
  const { matchHistory, deleteMatchHistoryEntry, updateMatchHistoryEntry, getTeamShield } = useApp();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingEntry, setEditingEntry] = useState<MatchHistoryEntry | null>(null);

  return (
    <div className="flex flex-col w-full min-h-screen bg-slate-50 p-4 pb-20 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="w-9 h-9 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-slate-100 shadow-sm"
        >
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
        </button>
        <div>
          <span className="text-[11px] text-slate-700 uppercase font-bold tracking-wider block">
            MopaFut
          </span>
          <h1 className="text-[20px] font-extrabold text-slate-900 tracking-tight leading-tight">
            Histórico de Partidas
          </h1>
        </div>
      </div>

      {/* Summary Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-slate-900 text-[20px]">history</span>
          <span className="text-sm font-bold text-slate-900">Partidas Registradas</span>
        </div>
        <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
          {matchHistory.length} partida{matchHistory.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Match List */}
      {matchHistory.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center shadow-sm">
          <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3">
            <span className="material-symbols-outlined text-[28px] text-slate-400">sports_soccer</span>
          </div>
          <p className="text-sm font-bold text-slate-900 mb-1">Nenhuma partida encerrada</p>
          <p className="text-xs text-slate-500">
            Quando uma partida for finalizada, ela aparecerá aqui com todos os lances registrados.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {matchHistory.map((entry) => (
            <HistoryCard
              key={entry.id}
              entry={entry}
              homeShield={getTeamShield(entry.homeTeam)}
              awayShield={getTeamShield(entry.awayTeam)}
              onEdit={() => setEditingEntry(entry)}
              onDelete={() => setDeletingId(entry.id)}
            />
          ))}
        </div>
      )}

      {/* Modal de Edição */}
      {editingEntry && (
        <EditMatchHistoryModal
          entry={editingEntry}
          onClose={() => setEditingEntry(null)}
          onSave={async (updatedData) => {
            await updateMatchHistoryEntry(editingEntry.id, updatedData);
          }}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deletingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-white rounded-2xl border border-slate-200 shadow-xl p-5 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-50 border border-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <span className="material-symbols-outlined text-[24px]">delete</span>
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Excluir do Histórico?</h3>
              <p className="text-xs text-slate-600 mt-1">
                Esta ação removerá permanentemente esta partida do histórico. A pontuação da tabela não será alterada.
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setDeletingId(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-medium text-xs hover:bg-slate-100"
              >
                Cancelar
              </button>
              <button
                onClick={async () => {
                  await deleteMatchHistoryEntry(deletingId);
                  setDeletingId(null);
                }}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 text-white font-bold text-xs hover:bg-rose-700"
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MatchHistoryPage;
