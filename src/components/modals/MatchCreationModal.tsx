import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';

interface MatchCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateMatch?: (matchData: any) => void;
}

const DURATION_OPTIONS = [
  { label: '15 min', value: 15 },
  { label: '30 min', value: 30 },
  { label: '45 min', value: 45 },
  { label: '60 min', value: 60 },
  { label: '90 min', value: 90 },
];

export const MatchCreationModal: React.FC<MatchCreationModalProps> = ({
  isOpen,
  onClose,
  onCreateMatch,
}) => {
  const navigate = useNavigate();
  const { availableClubNames, createNewMatch } = useApp();

  const [team1, setTeam1] = useState(availableClubNames[0] || 'Resenha FC');
  const [team2, setTeam2] = useState(availableClubNames[1] || 'Amigos do Zico');
  const [duration, setDuration] = useState<number>(90);
  const [customDuration, setCustomDuration] = useState<string>('');

  const handleDurationSelect = (val: number) => {
    setDuration(val);
    setCustomDuration('');
  };

  const handleCustomDurationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setCustomDuration(val);
    if (val && !isNaN(Number(val))) {
      setDuration(Number(val));
    }
  };

  const handleConfirmAndStart = () => {
    const finalDuration = duration > 0 ? duration : 90;
    const createdId = createNewMatch(team1, team2, finalDuration);

    if (onCreateMatch) {
      onCreateMatch({
        homeTeam: team1,
        awayTeam: team2,
        duration: finalDuration,
        id: createdId,
      });
    }

    onClose();
    navigate(`/ao-vivo/${createdId}`);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      {/* Modal Container */}
      <div className="relative w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col border border-slate-200 animate-in fade-in slide-in-from-bottom duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-2.5">
            <span className="w-9 h-9 rounded-full bg-rose-100 flex items-center justify-center text-[#e63946]">
              <span className="material-symbols-outlined text-[20px]">bolt</span>
            </span>
            <div>
              <span className="text-[10px] text-[#e63946] uppercase font-bold tracking-wider block">
                Configuração Rápida
              </span>
              <h2 className="text-[16px] font-bold text-slate-900 leading-tight">
                Nova Partida
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-200/70 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Status Badge */}
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-100 flex items-center gap-2 text-xs text-rose-700">
            <span className="w-2 h-2 rounded-full bg-[#e63946] animate-pulse" />
            <span className="font-medium">A partida será iniciada imediatamente após a confirmação.</span>
          </div>

          {/* Teams Selection Dropdowns */}
          <div className="space-y-3">
            <div>
              <label className="block text-[11px] text-slate-600 uppercase font-bold mb-1.5">
                Time 1 (Mandante)
              </label>
              <div className="relative">
                <select
                  value={team1}
                  onChange={(e) => setTeam1(e.target.value)}
                  className="w-full px-3.5 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-semibold text-sm focus:outline-none focus:border-[#e63946] appearance-none transition-colors"
                >
                  {availableClubNames.map((club) => (
                    <option key={`t1-${club}`} value={club} disabled={club === team2}>
                      {club}
                    </option>
                  ))}
                </select>
                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none text-[20px]">
                  unfold_more
                </span>
              </div>
            </div>

            <div>
              <label className="block text-[11px] text-slate-600 uppercase font-bold mb-1.5">
                Time 2 (Visitante)
              </label>
              <div className="relative">
                <select
                  value={team2}
                  onChange={(e) => setTeam2(e.target.value)}
                  className="w-full px-3.5 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-semibold text-sm focus:outline-none focus:border-[#e63946] appearance-none transition-colors"
                >
                  {availableClubNames.map((club) => (
                    <option key={`t2-${club}`} value={club} disabled={club === team1}>
                      {club}
                    </option>
                  ))}
                </select>
                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none text-[20px]">
                  unfold_more
                </span>
              </div>
            </div>
          </div>

          {/* Match Duration Options & Custom Input */}
          <div className="space-y-2 pt-1">
            <label className="block text-[11px] text-slate-600 uppercase font-bold">
              Duração da Partida (Minutos)
            </label>
            <div className="grid grid-cols-5 gap-1.5">
              {DURATION_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => handleDurationSelect(opt.value)}
                  className={`py-2 px-1 rounded-xl text-xs font-bold transition-all ${
                    duration === opt.value && !customDuration
                      ? 'bg-[#e63946] text-white shadow-md'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {/* Custom Minutes Input */}
            <div className="pt-2">
              <label className="block text-[10px] text-slate-500 uppercase font-medium mb-1">
                Ou digite os minutos exatos (ex: 4, 5, 20):
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="1"
                  max="120"
                  value={customDuration}
                  onChange={handleCustomDurationChange}
                  placeholder="Tempo customizado..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:border-[#e63946]"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500">
                  min
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex flex-col gap-2">
          <button
            onClick={handleConfirmAndStart}
            className="w-full py-3.5 rounded-xl bg-[#e63946] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md hover:bg-rose-700 active:scale-95 transition-all"
          >
            <span className="material-symbols-outlined text-[20px]">play_arrow</span>
            Confirmar e Iniciar Partida
          </button>
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl text-slate-600 font-medium text-xs hover:text-slate-900 transition-colors"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};

export default MatchCreationModal;
