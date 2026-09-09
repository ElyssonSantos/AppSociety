import React, { useState, DragEvent, useEffect, useRef, useCallback } from 'react';

interface FormationPlayer {
  id?: string;
  name: string;
  isGoalkeeper?: boolean;
}

const FORMATIONS: Record<string, { label: string; own: FormationPlayer[][] }> = {
  '2-3-1': {
    label: '7 Society (2-3-1)',
    own: [
      [{ name: 'Højlund (CA)', id: 'p3' }],
      [{ name: 'Rashford', id: 'p1' }, { name: 'Fernandes', id: 'p2' }, { name: 'Ala Dir', id: 'p8' }],
      [{ name: 'Zagueiro', id: 'p4' }, { name: 'Zagueiro', id: 'p4' }],
      [{ name: 'Goleiro', id: 'p6', isGoalkeeper: true }],
    ],
  },
  '3-2-1': {
    label: '7 Society (3-2-1)',
    own: [
      [{ name: 'Centroavante' }],
      [{ name: 'Meia Esq' }, { name: 'Meia Dir' }],
      [{ name: 'Lat. Esq', id: 'p7' }, { name: 'Zagueiro', id: 'p4' }, { name: 'Lat. Dir', id: 'p7' }],
      [{ name: 'Goleiro', isGoalkeeper: true }],
    ],
  },
  '1-3-2': {
    label: '7 Society (1-3-2)',
    own: [
      [{ name: 'Ponta Esq' }, { name: 'Ponta Dir' }],
      [{ name: 'Meia Esq' }, { name: 'Meia Central' }, { name: 'Meia Dir' }],
      [{ name: 'Zagueiro' }],
      [{ name: 'Goleiro', isGoalkeeper: true }],
    ],
  },
};

const OPPONENT_ROWS: FormationPlayer[][] = [
  [{ name: 'Goleiro Adv', isGoalkeeper: true }],
  [{ name: 'Def. Esq' }, { name: 'Def. Dir' }],
  [{ name: 'Meia Esq' }, { name: 'Meia Central' }, { name: 'Meia Dir' }],
  [{ name: 'Atacante' }],
];

type FormationKey = keyof typeof FORMATIONS;

type DragData = {
  fromRow: number;
  fromIndex: number;
  player: FormationPlayer;
} | null;

const LS_KEY = (key: string) => `tactics_formation_${key}`;

export const TacticsPage: React.FC = () => {
  const [formationKey, setFormationKey] = useState<FormationKey>('2-3-1');

  const getInitialFormation = useCallback((key: FormationKey) => {
    try {
      const saved = localStorage.getItem(LS_KEY(key));
      if (saved) {
        const parsed = JSON.parse(saved);
        // Validate it's an array of arrays
        if (Array.isArray(parsed) && parsed.length > 0) {
          return { ...FORMATIONS[key], own: parsed };
        }
      }
    } catch { /* ignore */ }
    return FORMATIONS[key];
  }, []);

  const [formation, setFormation] = useState(() => getInitialFormation('2-3-1'));
  const [dragData, setDragData] = useState<DragData>(null);
  const [dragOver, setDragOver] = useState<{ row: number; index: number } | null>(null);
  const touchDragRef = useRef<{ fromRow: number; fromIndex: number; player: FormationPlayer; currentTarget: HTMLElement | null } | null>(null);

  useEffect(() => {
    const newF = getInitialFormation(formationKey);
    setFormation(newF);
    setDragData(null);
    setDragOver(null);
  }, [formationKey, getInitialFormation]);

  // Persist formation changes to localStorage
  const persistFormation = useCallback((key: FormationKey, ownRows: FormationPlayer[][]) => {
    try {
      localStorage.setItem(LS_KEY(key), JSON.stringify(ownRows));
    } catch { /* ignore */ }
  }, []);

  const handleDragStart = (e: DragEvent, row: number, index: number, player: FormationPlayer) => {
    setDragData({ fromRow: row, fromIndex: index, player });
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: DragEvent, row: number, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOver({ row, index });
  };

  const handleDragLeave = () => {
    setDragOver(null);
  };

  const handleDrop = (e: DragEvent, toRow: number, toIndex: number) => {
    e.preventDefault();
    if (!dragData) return;

    const newFormation = formation.own.map((row: FormationPlayer[]) =>
      row.map((player: FormationPlayer) => ({ ...player }))
    );

    newFormation[dragData.fromRow][dragData.fromIndex] = newFormation[toRow][toIndex];
    newFormation[toRow][toIndex] = dragData.player;

    const updated = { ...formation, own: newFormation };
    setFormation(updated);
    persistFormation(formationKey, newFormation);
    setDragData(null);
    setDragOver(null);
  };

  const handleDragEnd = () => {
    setDragData(null);
    setDragOver(null);
  };

  const handleTouchStart = (row: number, index: number, player: FormationPlayer, e: React.TouchEvent) => {
    if (!player.id) return;
    const target = e.currentTarget as HTMLElement;
    touchDragRef.current = { fromRow: row, fromIndex: index, player, currentTarget: target };
    setDragData({ fromRow: row, fromIndex: index, player });
    target.classList.add('scale-110', 'z-50');
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchDragRef.current) return;
    e.preventDefault();
    const touch = e.touches[0];
    const elements = document.elementsFromPoint(touch.clientX, touch.clientY);
    const dropTarget = elements.find(el => el.hasAttribute('data-droppable'));
    if (dropTarget) {
      const row = parseInt(dropTarget.getAttribute('data-row') || '0');
      const index = parseInt(dropTarget.getAttribute('data-index') || '0');
      setDragOver({ row, index });
    } else {
      setDragOver(null);
    }
  };

  const handleTouchEnd = () => {
    if (!touchDragRef.current) return;
    if (dragData && dragOver) {
      const toRow = dragOver.row;
      const toIndex = dragOver.index;
      const newFormation = formation.own.map((row: FormationPlayer[]) => row.map((p: FormationPlayer) => ({ ...p })));
      newFormation[dragData.fromRow][dragData.fromIndex] = newFormation[toRow][toIndex];
      newFormation[toRow][toIndex] = dragData.player;
      const updated = { ...formation, own: newFormation };
      setFormation(updated);
      persistFormation(formationKey, newFormation);
    }

    if (touchDragRef.current.currentTarget) {
      touchDragRef.current.currentTarget.classList.remove('scale-110', 'z-50');
    }
    touchDragRef.current = null;
    setDragData(null);
    setDragOver(null);
  };

  const handleFormationChange = (key: FormationKey) => {
    setFormationKey(key);
    setFormation(FORMATIONS[key]);
  };

  const PlayerNode: React.FC<{
    label: string;
    isGoalkeeper?: boolean;
    isOpponent?: boolean;
    draggable?: boolean;
    onDragStart?: (e: DragEvent) => void;
    onTouchStart?: (e: React.TouchEvent) => void;
    isDragOver?: boolean;
  }> = ({ label, isGoalkeeper = false, isOpponent = false, draggable = false, onDragStart, onTouchStart, isDragOver = false }) => (
    <div
      className={`flex flex-col items-center gap-0.5 ${isDragOver ? 'scale-110' : ''} transition-all`}
    >
      <div
        draggable={draggable}
        onDragStart={onDragStart}
        onTouchStart={onTouchStart}
        onDragEnd={handleDragEnd}
        className={`w-9 h-9 rounded-full font-bold flex items-center justify-center text-[10px] shadow-lg transition-transform cursor-pointer
          ${draggable ? 'active:scale-90 cursor-grab' : ''}
          ${isDragOver ? 'ring-2 ring-yellow-400 ring-offset-1 ring-offset-transparent scale-110' : ''}
          ${isOpponent
            ? 'bg-slate-700 ring-1 ring-slate-500 text-white'
            : isGoalkeeper
            ? 'bg-amber-500 ring-2 ring-amber-300 text-white'
            : 'bg-[#e63946] ring-2 ring-rose-300 text-white'
          }`}
      >
        <span className="material-symbols-outlined text-[15px]" style={{ fontVariationSettings: '"FILL" 1' }}>
          person
        </span>
      </div>
      <span
        className={`text-[8px] font-bold px-1.5 py-0.5 rounded max-w-[56px] text-center leading-tight truncate
          ${isOpponent ? 'text-slate-200 bg-slate-900/80' : 'text-white bg-slate-900/90'}`}
      >
        {label}
      </span>
    </div>
  );

  return (
    <div className="flex flex-col w-full min-h-screen bg-slate-50 p-4 pb-20 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[11px] text-[#e63946] uppercase font-bold tracking-wider block">
            Prancheta Digital
          </span>
          <h1 className="text-[20px] font-extrabold text-slate-900 tracking-tight">
            Quadro Tático &amp; Escalação
          </h1>
        </div>
        <div className="bg-white border border-slate-200 px-3 py-1.5 rounded-xl text-xs text-[#e63946] font-bold shadow-sm">
          {formation.label}
        </div>
      </div>

      {/* Tactical Pitch — Society 7v7 */}
      <div
        className="relative w-full rounded-3xl border-2 border-emerald-800 shadow-xl overflow-hidden"
        style={{
          background: 'radial-gradient(ellipse at 50% 50%, #15803d 0%, #166534 60%, #14532d 100%)',
          minHeight: '420px',
        }}
      >
        {/* SVG Campo */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          viewBox="0 0 320 420"
          preserveAspectRatio="none"
        >
          {/* Linhas de campo */}
          <rect x="20" y="20" width="280" height="380" rx="6" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" />
          <line x1="20" y1="210" x2="300" y2="210" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" />
          <circle cx="160" cy="210" r="40" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" />
          <circle cx="160" cy="210" r="3" fill="rgba(255,255,255,0.4)" />
          <rect x="80" y="20" width="160" height="55" rx="4" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" />
          <rect x="115" y="20" width="90" height="28" rx="3" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
          <rect x="80" y="345" width="160" height="55" rx="4" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" />
          <rect x="115" y="372" width="90" height="28" rx="3" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
        </svg>

        {/* Conteúdo dentro do campo */}
        <div className="relative z-10 flex flex-col justify-between h-full py-4 px-2" style={{ minHeight: '420px' }}>

          {/* ADVERSÁRIOS (topo) */}
          <div className="flex flex-col gap-2">
            {OPPONENT_ROWS.map((row, ri) => (
              <div key={ri} className="flex justify-around px-4">
                {row.map((player, pi) => (
                  <PlayerNode key={pi} label={player.name} isOpponent isGoalkeeper={player.isGoalkeeper} />
                ))}
              </div>
            ))}
          </div>

          {/* Separador visual */}
          <div className="h-px bg-white/0 my-1" />

          {/* TIME PRÓPRIO (baixo) */}
          <div className="flex flex-col gap-2">
            {formation.own.map((row, ri) => (
              <div key={ri} className="flex justify-around px-4">
                {row.map((player: FormationPlayer, pi: number) => (
                  <div
                    key={pi}
                    data-droppable
                    data-row={ri}
                    data-index={pi}
                    onDragOver={(e) => handleDragOver(e, ri, pi)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, ri, pi)}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                    className={`transition-all ${dragOver?.row === ri && dragOver?.index === pi ? 'scale-110' : ''}`}
                  >
                    <PlayerNode
                      label={player.name}
                      isGoalkeeper={player.isGoalkeeper}
                      draggable={!!player.id}
                      onDragStart={(e) => handleDragStart(e, ri, pi, player)}
                      onTouchStart={(e) => handleTouchStart(ri, pi, player, e)}
                      isDragOver={dragOver?.row === ri && dragOver?.index === pi}
                    />
                  </div>
                ))}
              </div>
            ))}
          </div>

        </div>
      </div>

      {/* Seleção de Formação */}
      <div>
        <h2 className="text-sm font-bold text-slate-900 mb-2">Esquema Tático</h2>
        <div className="grid grid-cols-3 gap-2">
          {(Object.keys(FORMATIONS) as FormationKey[]).map((key) => (
            <button
              key={key}
              onClick={() => handleFormationChange(key)}
              className={`p-2.5 rounded-xl text-center text-xs font-bold transition-all active:scale-95 border ${
                formationKey === key
                  ? 'bg-[#e63946] text-white border-[#e63946] shadow-sm'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              {FORMATIONS[key].label.replace('7 Society ', '')}
            </button>
          ))}
        </div>
      </div>

      {/* Legenda */}
      <div className="flex items-center gap-4 px-1">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-[#e63946]" />
          <span className="text-xs text-slate-600 font-bold">Seu time</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-slate-700" />
          <span className="text-xs text-slate-600 font-bold">Adversário</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-amber-500" />
          <span className="text-xs text-slate-600 font-bold">Goleiro</span>
        </div>
      </div>

      {/* Dica de uso */}
      <div className="p-3 rounded-xl bg-white border border-slate-200 flex items-center justify-center gap-2 shadow-sm">
        <span className="material-symbols-outlined text-[16px] text-[#e63946]">touch_app</span>
        <p className="text-xs text-slate-600 text-center font-medium">
          Arraste os jogadores do seu time para reposicioná-los na formação.
        </p>
      </div>
    </div>
  );
};

export default TacticsPage;
